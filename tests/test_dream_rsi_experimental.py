"""Os modulos Dream-RSI sao EXPERIMENTAIS: nenhum codigo de runtime os importa ainda.

Decisao de 2026-09-18 (delegada pelo Tier 0): sem consumidor no fluxo real, a CLAUDE.md
do Site (secao 6, item 5) os classifica como codigo orfao; declara-los experimentais e
travar o ponto de entrada e a saida proporcional -- nao apaga-los, nao fingir que estao
integrados. Quem os ligar ao runtime remove o marcador EXPERIMENTAL e atualiza este
teste no mesmo commit, junto do teste ponta a ponta que a regra exige.
"""

from __future__ import annotations

from pathlib import Path
import re
import subprocess

RAIZ = Path(__file__).resolve().parent.parent
EXPERIMENTAIS = ("pmev_dream_bridge", "discovery_recorder", "dream_replay_simulator")
IMPORTA = re.compile(r"^\s*(?:from|import)\s+[\w.]*\b(" + "|".join(EXPERIMENTAIS) + r")\b", re.MULTILINE)


def _python_versionado() -> list[str]:
    saida = subprocess.run(["git", "ls-files", "*.py"], cwd=RAIZ, capture_output=True, text=True, check=True)
    return saida.stdout.split()


def test_nenhum_codigo_de_runtime_importa_modulo_experimental() -> None:
    """Import vindo de fora de tests/ e dos proprios modulos reprova."""
    proprios = {f"engine/{m}.py" for m in EXPERIMENTAIS}
    consumidores = [
        rel
        for rel in _python_versionado()
        if not rel.startswith("tests/")
        and rel not in proprios
        and IMPORTA.search((RAIZ / rel).read_text(encoding="utf-8", errors="replace"))
    ]
    assert not consumidores, (
        "modulo Dream-RSI EXPERIMENTAL importado pelo runtime -- ligue-o de proposito: "
        "remova o marcador, traga o teste ponta a ponta e atualize este guard:\n  " + "\n  ".join(consumidores)
    )


def test_os_tres_modulos_declaram_o_marcador() -> None:
    """O marcador e o que um leitor ve antes de importar; sem ele a decisao some."""
    for modulo in EXPERIMENTAIS:
        fonte = (RAIZ / "engine" / f"{modulo}.py").read_text(encoding="utf-8")
        assert "EXPERIMENTAL (2026-09-18)" in fonte, modulo
