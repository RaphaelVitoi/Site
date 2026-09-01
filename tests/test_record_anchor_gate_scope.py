"""Contrato de escopo do gate de ancora de registros.

Skills usam frontmatter proprio (`name`/`description`), que nao e o esquema de
relatorio da M.O. 13.B. O gate continua inspecionando credenciais em qualquer
arquivo adicionado; apenas a validacao de ancora e exclusiva de `docs/` e
`reports/`.
"""

from __future__ import annotations

import re
from pathlib import Path


RAIZ = Path(__file__).resolve().parent.parent
GATE = RAIZ / "scripts" / "ops" / "record_anchor_gate.ps1"


def test_ancora_processa_frontmatter_apenas_de_registros_canonicos():
    """`SKILL.md` com YAML nao pode receber campos obrigatorios de relatorio."""
    fonte = GATE.read_text(encoding="utf-8-sig")
    bloco_ancora = fonte.split("# --- E3/E4/W1. ancora dos registros", 1)[1].split(
        "# --- veredito", 1
    )[0]

    assert re.search(
        r"\$arquivosDeRegistro\s*=\s*@\(\$arquivos\s*\|\s*Where-Object\s*\{\s*\$_\s*-match\s*'\^\(docs\|reports\)/\.\*\\\.md\$'\s*\}\)",
        bloco_ancora,
    ), "a ancora deve selecionar somente Markdown em docs/ ou reports/"
    assert "foreach ($arq in $arquivosDeRegistro)" in bloco_ancora
