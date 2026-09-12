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

ONDE O MARCADOR MORA: `.git/sota-suite-verde`, que e por clone, nunca versionado,
e some num clone novo -- que e o comportamento certo, porque a medicao vale para
ESTA maquina e nao para o repositorio. O CI nao usa este caminho: la a suite roda
sempre, do zero.
"""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
MARCADOR = RAIZ / ".git" / "sota-suite-verde"
VERSAO_DO_CONTRATO = 1


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


def rodar_suite(extra: list[str]) -> int:
    """Executa a suite e, se verde E a arvore continuar limpa, grava o marcador."""
    base = "C:/Users/rapha/AppData/Local/Temp/pt-sota" if sys.platform == "win32" else "/tmp/pt-sota"
    cmd = [sys.executable, "-m", "pytest", "-q", f"--basetemp={base}", *extra]
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
                "em": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
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

    vale, motivo = cache_valido()

    if acao == "check":
        print(f"[SUITE] {'cache valido' if vale else 'cache invalido'}: {motivo}")
        return 0 if vale else 1

    if acao in ("ensure", "run"):
        if acao == "ensure" and vale:
            print(f"[SUITE] nao remedido: {motivo}")
            return 0
        if acao == "ensure":
            print(f"[SUITE] medindo porque {motivo}")
        return rodar_suite(extra)

    print(f"acao desconhecida: {acao}. Use ensure (padrao), check, run ou invalidate.", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
