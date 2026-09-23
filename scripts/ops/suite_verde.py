#!/usr/bin/env python
"""Caminho de menos demora para a suite -- valido para QUALQUER condutor.

PARA QUEM CHEGA AGORA, EM UMA LINHA:

    python scripts/ops/suite_verde.py

Roda a suite se precisar, e nao roda se nao precisar. E so isso. Nao existe
segunda forma de fazer certo, e nao existe forma de fazer errado que passe.

POR QUE ISTO EXISTE, medido em 2026-09-12. O `pre-push` passou a executar a
suite integral, cerca de oito minutos. O condutor tipicamente rodava a suite a
mao ANTES de commitar, e o hook a rodava de novo depois -- duas medicoes
identicas sobre a mesma arvore, por publicacao. O custo aparecia como "quase uma
hora para commit e push", e a metade dele nao media nada de novo.

O QUE O CACHE FAZ, e o que ele nao faz. Ele nao pula verificacao: ele se recusa a
REPETIR uma medicao ja feita sobre exatamente o mesmo estado. Se qualquer coisa
mudou, ele mede. A regra cabe numa frase, e e a mesma para todo modelo:

    mesmo CONTEUDO ja verificado verde  ->  nao remede
    conteudo diferente                  ->  mede

A CHAVE E A ARVORE DE CONTEUDO, NAO O COMMIT, e essa escolha e o que faz o cache
valer alguma coisa. O primeiro desenho chaveava por `HEAD`; commitar muda o HEAD e
invalidaria o cache -- mas o conteudo testado continua exatamente o mesmo, porque o
commit apenas registra a arvore que ja estava no disco. Chaveando por HEAD, medir
antes de commitar nunca ajudaria o push, que era todo o ponto.

`git stash create` devolve um objeto com a arvore do estado ATUAL sem tocar no
disco, no indice ou na lista de stashes. Com a arvore como chave, a medicao feita
antes do commit continua valendo depois dele.

TRES DECISOES DE CORRETUDE, porque cada uma tem uma armadilha conhecida nesta base:

1. `--ignore-submodules=none`. Os oito submodulos de skills/ declaram
   `ignore = dirty` no .gitmodules, entao o `git status` PADRAO nao mostra fonte
   modificada dentro deles -- arvore limpa por instrucao, nao por fato. E a suite
   LE o estado dos submodulos (tests/test_patches_skills.py). Sem esta flag o
   cache diria verde sobre uma arvore que mudou onde ele nao olhou, que e
   exatamente a classe de defeito que esta base passou o dia consertando.

2. Arquivo nao rastreado e nao ignorado torna o estado NAO CACHEAVEL, e sempre
   mede. `git stash create` nao inclui nao rastreados, entao a arvore que ele
   devolve nao os representa -- confiar nela seria ignorar um `.py` novo em
   tests/, que muda o resultado da suite.

3. Falha nunca vira marcador, e apaga o anterior. Um verde vencido, descrevendo
   outro estado, e pior que nenhum verde.

PARALELISMO COM LIMITE: com pytest-xdist, usa ate oito workers, reservando 4 GiB
de RAM para os demais aplicativos e 2 GiB por worker. O CI segue em serie e com
cobertura -- e la que dependencia de ordem entre testes aparece. Passe `-n 0`
para medir em serie aqui; uma escolha explicita de `-n` prevalece.
Com menos de 6 GiB disponiveis, nao inicia a suite. Chamadas concorrentes no
mesmo clone aguardam a primeira e reaproveitam seu marcador quando verde.

SAIDA CURTA: o pyproject liga `log_cli`, que imprime uma linha por teste. No
pre-push isso chegou a 235 KB -- cerca de 70 mil tokens no contexto de quem faz
push, para dizer "passou". Aqui roda com `-o log_cli=false`: falha continua
saindo inteira, sucesso sai em pontos e no sumario.

ONDE O MARCADOR MORA: `.git/sota-suite-verde`, que e por clone, nunca versionado,
e some num clone novo -- que e o comportamento certo, porque a medicao vale para
ESTA maquina e nao para o repositorio. O CI nao usa este caminho: la a suite roda
sempre, do zero.
"""

from __future__ import annotations

from contextlib import contextmanager
from datetime import UTC, datetime
import errno
import importlib.util
import json
import os
from pathlib import Path
import psutil
import subprocess
import sys
import tempfile
import time

RAIZ = Path(__file__).resolve().parents[2]
MARCADOR = RAIZ / ".git" / "sota-suite-verde"
VERSAO_DO_CONTRATO = 1
ARQUIVO_TRAVA = RAIZ / ".git" / "sota-suite-verde.lock"


def _git(*args: str) -> str:
    r = subprocess.run(
        ["git", *args],
        cwd=str(RAIZ),
        capture_output=True,
        text=True,
        check=False,
        encoding="utf-8",
        errors="replace",
    )
    return r.stdout


def nao_rastreados() -> list[str]:
    """Nao rastreados e nao ignorados. `git stash create` nao os representa."""
    return [n for n in _git("ls-files", "--others", "--exclude-standard").splitlines() if n.strip()]


def submodulo_sujo() -> list[str]:
    """Fonte modificada DENTRO de submodulo, que `ignore = dirty` esconderia."""
    return [
        linha
        for linha in _git("status", "--porcelain", "--ignore-submodules=none").splitlines()
        if linha.strip() and linha[:2] not in ("??",) and linha[3:].split()[0].startswith("skills/")
    ]


def arvore_de_conteudo() -> str:
    """SHA da arvore do estado ATUAL -- com as modificacoes nao commitadas.

    `git stash create` monta o objeto sem tocar no disco, no indice ou na lista de
    stashes. Numa arvore limpa ele nao devolve nada, e ai a arvore do HEAD ja e o
    conteudo.
    """
    stash = _git("stash", "create").strip()
    alvo = f"{stash}^{{tree}}" if stash else "HEAD^{tree}"
    return _git("rev-parse", alvo).strip()


def ler_marcador() -> dict:
    try:
        return json.loads(MARCADOR.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


@contextmanager
def trava_suite():
    """Uma suite por clone; a segunda chamada reavalia o cache ao entrar."""
    with ARQUIVO_TRAVA.open("a+b") as arquivo:
        inicio = time.monotonic()
        proximo_aviso = 0
        while True:
            try:
                arquivo.seek(0)
                if os.name == "nt":
                    import msvcrt

                    msvcrt.locking(arquivo.fileno(), msvcrt.LK_NBLCK, 1)
                else:
                    import fcntl

                    fcntl.flock(arquivo.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except OSError as erro:
                if erro.errno not in (errno.EACCES, errno.EAGAIN, errno.EDEADLK):
                    raise
                decorrido = time.monotonic() - inicio
                if decorrido >= 600:
                    raise TimeoutError("outra suite ainda ocupa o gate apos 10 minutos")
                if decorrido >= proximo_aviso:
                    print("[SUITE] aguardando a verificacao em curso", flush=True)
                    proximo_aviso += 30
                time.sleep(1)
        try:
            yield
        finally:
            arquivo.seek(0)
            if os.name == "nt":
                msvcrt.locking(arquivo.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(arquivo.fileno(), fcntl.LOCK_UN)


def cacheavel() -> tuple[bool, str]:
    """Ha estado que se possa representar por uma arvore? Se nao, mede sempre."""
    novos = nao_rastreados()
    if novos:
        return False, f"{len(novos)} arquivo(s) nao rastreado(s), fora da arvore: {', '.join(novos[:3])}"
    sujos = submodulo_sujo()
    if sujos:
        return False, f"{len(sujos)} submodulo(s) com fonte modificada"
    return True, ""


def cache_valido() -> tuple[bool, str]:
    """(vale, motivo legivel). O motivo e sempre impresso -- silencio nao explica."""
    pode, porque = cacheavel()
    if not pode:
        return False, porque
    arvore = arvore_de_conteudo()
    if not arvore:
        return False, "nao consegui identificar a arvore de conteudo"
    m = ler_marcador()
    if not m:
        return False, "nenhuma medicao registrada neste clone"
    if m.get("contrato") != VERSAO_DO_CONTRATO:
        return False, "marcador de contrato antigo"
    if m.get("arvore") != arvore:
        return False, f"o conteudo mudou desde a ultima medicao ({str(m.get('arvore'))[:8]} -> {arvore[:8]})"
    return True, f"conteudo {arvore[:8]} ja medido verde em {m.get('em')}"


def _tem_xdist() -> bool:
    return importlib.util.find_spec("xdist") is not None


def paralelismo(extra: list[str]) -> list[str]:
    """Limita workers pela RAM livre se quem chamou nao escolheu `-n`."""
    if any(a.startswith("-n") or a == "no:xdist" for a in extra):
        return []
    if not _tem_xdist():
        return []
    gib = 1024**3
    memoria_livre = psutil.virtual_memory().available
    workers = max(1, min(8, os.cpu_count() or 1, (memoria_livre - 4 * gib) // (2 * gib)))
    return ["-n", str(workers)]


def silencio(extra: list[str]) -> list[str]:
    """`-o log_cli=false`, salvo se quem chamou ja decidiu sobre log_cli."""
    return [] if any("log_cli" in a for a in extra) else ["-o", "log_cli=false"]


def rodar_suite(extra: list[str]) -> int:
    """Executa a suite e, se verde E a arvore continuar limpa, grava o marcador."""
    memoria_livre = psutil.virtual_memory().available
    if memoria_livre < 6 * 1024**3:
        print(
            f"[SUITE] RAM disponivel insuficiente ({memoria_livre / 1024**3:.1f} GiB; minimo 6 GiB); "
            "libere memoria e tente novamente",
            file=sys.stderr,
        )
        return 2
    base = str(Path(tempfile.gettempdir()) / "pytest-sota")
    cmd = [sys.executable, "-m", "pytest", "-q", f"--basetemp={base}", *paralelismo(extra), *silencio(extra), *extra]
    print(f"[SUITE] medindo -- {' '.join(cmd[2:])}", flush=True)
    r = subprocess.run(cmd, cwd=str(RAIZ), check=False)
    if r.returncode != 0:
        # Falha nunca vira marcador. E o marcador anterior morre: ele descrevia
        # outro estado, e deixa-lo seria oferecer um verde vencido ao proximo.
        MARCADOR.unlink(missing_ok=True)
        print("[SUITE] REPROVADA -- nenhum marcador gravado", flush=True)
        return r.returncode
    pode, porque = cacheavel()
    if not pode:
        print(f"[SUITE] verde, mas o estado nao e cacheavel ({porque}) -- marcador NAO gravado", flush=True)
        return 0
    arvore = arvore_de_conteudo()
    MARCADOR.write_text(
        json.dumps(
            {
                "contrato": VERSAO_DO_CONTRATO,
                "arvore": arvore,
                "head_na_medicao": _git("rev-parse", "HEAD").strip(),
                "em": datetime.now(UTC).astimezone().isoformat(timespec="seconds"),
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    print(f"[SUITE] verde e registrada para a arvore {arvore[:8]}", flush=True)
    return 0


def main(argv: list[str]) -> int:
    acao = argv[0] if argv and not argv[0].startswith("-") else "ensure"
    extra = argv[1:] if argv and not argv[0].startswith("-") else argv

    if acao == "invalidate":
        MARCADOR.unlink(missing_ok=True)
        print("[SUITE] marcador removido; a proxima verificacao mede")
        return 0

    if acao == "check":
        vale, motivo = cache_valido()
        print(f"[SUITE] {'cache valido' if vale else 'cache invalido'}: {motivo}")
        return 0 if vale else 1

    if acao in ("ensure", "run"):
        try:
            with trava_suite():
                vale, motivo = cache_valido()
                if acao == "ensure" and vale:
                    print(f"[SUITE] nao remedido: {motivo}")
                    return 0
                if acao == "ensure":
                    print(f"[SUITE] medindo porque {motivo}")
                return rodar_suite(extra)
        except TimeoutError as erro:
            print(f"[SUITE] {erro}", file=sys.stderr)
            return 2

    print(f"acao desconhecida: {acao}. Use ensure (padrao), check, run ou invalidate.", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
