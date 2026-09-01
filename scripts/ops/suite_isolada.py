"""Executa uma suite num WORKTREE proprio -- sem tocar o repositorio de trabalho.

POR QUE ISTO EXISTE
-------------------
Em 2026-08-28 duas sessoes trabalharam no mesmo repositorio ao mesmo tempo, e a
concorrencia produziu tres defeitos que nenhum portao pegava:

  1. `git add -A` de uma sessao varreu para o stage um registro escrito pela
     outra. So nao foi commitado porque alguem conferiu o `git status`.
  2. As duas acrescentaram a MESMA chave ao mesmo frontmatter. `yaml.safe_load`
     aceita chave repetida em silencio -- a ultima vence.
  3. As baterias de sonda dos portoes ENCENAM violacoes: escrevem arquivo,
     dao `git add`, medem o portao e desfazem. Se a outra sessao commitar
     durante essa janela, o commit dela leva junto a sonda sintetica.

O terceiro e o unico que nenhuma disciplina de `git add` resolve: a sonda
PRECISA do indice de verdade para medir o portao de verdade. A saida nao e
coordenar as sessoes -- e dar a cada execucao o seu proprio indice.

`git worktree` faz exatamente isso: uma segunda arvore de trabalho, com indice
proprio, apontando para o mesmo objeto store. Duas execucoes simultaneas nao se
enxergam, e nenhuma delas enxerga o seu working tree.

MULTIPROJETO
------------
`--repo` aceita qualquer repositorio git -- este, o `antigravity`, ou um
terceiro. O comando de suite e descoberto por convencao e pode ser trocado com
`--comando`, entao um repositorio sem `pytest` tambem serve.

    uv run python scripts/ops/suite_isolada.py
    uv run python scripts/ops/suite_isolada.py --sujo
    uv run python scripts/ops/suite_isolada.py --repo ../antigravity
    uv run python scripts/ops/suite_isolada.py --comando "uv run pytest tests/test_record_index.py -q"

O QUE ELE NAO FAZ POR PADRAO, e por que isso e declarado
--------------------------------------------------------
`--sujo` leva so o que o git ja RASTREIA. Arquivo novo fica de fora, e isso e
decisao, nao esquecimento: numa maquina com duas sessoes, arquivo novo pode ser
da OUTRA -- leva-lo sem pedir seria a versao silenciosa do `git add -A` que
originou este executor. Quem quiser inclui-los pede: `--incluir-novos`.

Fora do repositorio, nada e tocado. Um teste garante que os unicos subcomandos
git usados aqui sao de leitura, mais `worktree` para criar e remover a arvore.
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time

RAIZ_PADRAO = Path(__file__).resolve().parents[2]
# `skipped` e `xfailed` entram aqui porque sao a categoria "nao verificado", e
# era justamente a que o resumo nao sabia dizer: a arvore isolada pula os testes
# que dependem de submodulo materializado ou de projeto irmao, e o relatorio
# imprimia so "504 passed" -- numero verdadeiro, categoria omitida. Vocabulario
# de reporte que nao cobre uma categoria a apaga do relatorio.
RE_RESUMO = re.compile(r"(\d+) (passed|failed|error|skipped|xfailed|xpassed)")


def _git(*args: str, cwd: Path) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, check=False)


def raiz_do_repositorio(caminho: Path) -> Path | None:
    r = _git("rev-parse", "--show-toplevel", cwd=caminho)
    if r.returncode != 0:
        return None
    return Path(r.stdout.strip())


def comando_padrao(repo: Path) -> list[str] | None:
    """Descobre a suite por convencao. Sem convencao reconhecida, devolve None.

    Adivinhar comando errado e pior que nao adivinhar: uma suite que nao existe
    devolve 'nenhum teste coletado' e sai 5, e 5 nao e 0 -- entao o silencio
    passaria por reprovacao.
    """
    if (repo / "tests").is_dir() or (repo / "pyproject.toml").is_file():
        if shutil.which("uv"):
            return ["uv", "run", "pytest", "-q", "--no-header"]
        return [sys.executable, "-m", "pytest", "-q", "--no-header"]
    return None


def preparar_worktree(repo: Path, ref: str, destino: Path) -> tuple[bool, str]:
    r = _git("worktree", "add", "--detach", str(destino), ref, cwd=repo)
    if r.returncode != 0:
        return False, (r.stderr or r.stdout).strip()
    return True, ""


def aplicar_sujo(repo: Path, destino: Path, incluir_novos: bool = False) -> tuple[bool, str]:
    """Leva as modificacoes RASTREADAS do working tree para o worktree.

    Por COPIA, nao por patch. A primeira versao gerava `git diff HEAD` e
    aplicava com `git apply`; falhou com "patch does not apply", e nem `--3way`
    resolveu -- neste ambiente a conversao de fim de linha (`core.autocrlf`)
    faz o texto do working tree divergir do blob, e a mensagem de erro do git
    parece corrupcao de patch quando o problema e outro.

    Copiar o arquivo inteiro nao tem esse modo de falha: o que esta no disco e
    o que vai para a arvore isolada, byte a byte. Perde-se a economia do patch
    e ganha-se um mecanismo que nao mente sobre o motivo de falhar.
    """
    nomes = _git("diff", "HEAD", "--name-only", cwd=repo)
    if nomes.returncode != 0:
        return False, "nao foi possivel listar as modificacoes do working tree"
    arquivos = [linha for linha in nomes.stdout.splitlines() if linha.strip()]
    if incluir_novos:
        # `--others --exclude-standard` = nao rastreado E nao ignorado. Fica
        # atras de flag de proposito: numa maquina com duas sessoes, arquivo
        # novo pode ser da OUTRA -- e leva-lo para a arvore de teste sem pedir
        # e a versao silenciosa do `git add -A` que originou este executor.
        novos = _git("ls-files", "--others", "--exclude-standard", cwd=repo)
        if novos.returncode == 0:
            arquivos += [linha for linha in novos.stdout.splitlines() if linha.strip()]

    if not arquivos:
        return True, "working tree limpo -- nada a copiar"

    copiados = removidos = 0
    for rel in arquivos:
        origem, alvo = repo / rel, destino / rel
        if origem.is_file():
            alvo.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(origem, alvo)
            copiados += 1
        elif alvo.exists():
            alvo.unlink()
            removidos += 1
    return True, f"{copiados} arquivo(s) copiado(s), {removidos} removido(s)"


def remover_worktree(repo: Path, destino: Path) -> None:
    _git("worktree", "remove", "--force", str(destino), cwd=repo)
    if destino.exists():
        shutil.rmtree(destino, ignore_errors=True)
    _git("worktree", "prune", cwd=repo)


def resumo(saida: str) -> str:
    achados = RE_RESUMO.findall(saida)
    return ", ".join(f"{n} {tipo}" for n, tipo in achados) or "sem resumo reconhecido"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Suite em worktree isolado (nao concorrente)")
    ap.add_argument("--repo", default=str(RAIZ_PADRAO), help="repositorio alvo (padrao: este)")
    ap.add_argument("--ref", default="HEAD", help="commit/ref a materializar (padrao: HEAD)")
    ap.add_argument("--sujo", action="store_true", help="aplica as modificacoes rastreadas do working tree")
    ap.add_argument(
        "--incluir-novos",
        dest="incluir_novos",
        action="store_true",
        help="com --sujo, leva tambem os arquivos nao rastreados e nao ignorados",
    )
    ap.add_argument("--manter", action="store_true", help="nao remove o worktree ao final")
    ap.add_argument("--comando", default=None, help="comando de suite (padrao: descoberto por convencao)")
    ap.add_argument("--base", default=None, help="diretorio onde criar o worktree (padrao: temporario do SO)")
    args = ap.parse_args(argv)

    alvo = Path(args.repo).expanduser().resolve()
    if not alvo.is_dir():
        print(f"[ISOLADA] Caminho inexistente: {alvo}")
        return 2
    repo = raiz_do_repositorio(alvo)
    if repo is None:
        print(f"[ISOLADA] Nao e um repositorio git: {alvo}")
        return 2

    comando = args.comando.split() if args.comando else comando_padrao(repo)
    if not comando:
        print(f"[ISOLADA] Nenhuma suite reconhecida em {repo.name}. Use --comando para declarar qual e.")
        return 2

    base = Path(args.base).expanduser().resolve() if args.base else Path(tempfile.gettempdir())
    # pid + relogio no nome: duas execucoes simultaneas nunca colidem, e o nome
    # diz quem criou o worktree quando alguem esquece um `--manter` para tras.
    destino = base / f"suite-isolada-{repo.name}-{os.getpid()}-{int(time.time())}"

    print(f"[ISOLADA] repo   : {repo}")
    print(f"[ISOLADA] ref    : {args.ref}")
    print(f"[ISOLADA] destino: {destino}")
    print(f"[ISOLADA] comando: {' '.join(comando)}")

    ok, erro = preparar_worktree(repo, args.ref, destino)
    if not ok:
        print(f"[ISOLADA] Falha ao criar o worktree: {erro}")
        return 2

    try:
        if args.sujo:
            ok, nota = aplicar_sujo(repo, destino, incluir_novos=args.incluir_novos)
            print(f"[ISOLADA] sujo   : {nota}")
            if not ok:
                return 2

        inicio = time.monotonic()
        execucao = subprocess.run(comando, cwd=destino, capture_output=True, text=True, check=False)
        duracao = time.monotonic() - inicio
        saida = execucao.stdout + execucao.stderr
        print(saida[-4000:] if len(saida) > 4000 else saida)
        print(f"[ISOLADA] {resumo(saida)} em {duracao:.1f}s | EXIT={execucao.returncode}")
        return execucao.returncode
    finally:
        if args.manter:
            print(f"[ISOLADA] worktree preservado em {destino}")
        else:
            remover_worktree(repo, destino)
            print("[ISOLADA] worktree removido.")


if __name__ == "__main__":
    sys.exit(main())
