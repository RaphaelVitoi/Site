"""Contratos mínimos para landmarks públicos do layout global."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
HEADER = ROOT / "frontend" / "src" / "components" / "ui" / "layout" / "Header.tsx"
FOOTER = ROOT / "frontend" / "src" / "components" / "ui" / "layout" / "Footer.tsx"


def test_landmarks_de_navegacao_possuem_nomes_distintos() -> None:
    """Leitores de tela devem distinguir a navegacao principal dos atalhos."""
    header = HEADER.read_text(encoding="utf-8")
    footer = FOOTER.read_text(encoding="utf-8")

    assert 'aria-label="Navegação principal"' in header
    assert 'aria-label="Navegação de atalhos"' in footer
