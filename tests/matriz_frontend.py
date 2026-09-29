"""Matriz de defeitos do frontend: reintroduz e exige reprovacao.

Executar: .venv/Scripts/python.exe -m pytest tests/matriz_frontend.py -q

Um guard que nunca falhou não foi testado. Este arquivo reintroduz, um por um,
os defeitos que `test_contraste_superficie.py` e `test_ordem_headings.py`
existem para caçar, e exige reprovação.

Medido em 2026-09-29: 4 de 7 escaparam na primeira rodada. As causas foram
a mesma nos dois guards — ler **grafia** em vez de **uso**:

  1. quote de 'format ' removido ....... PEGOU
  2. acento puro como fundo de texto ... ESCAPOU (guard nao olhava hover)
  3. hover clareando fundo ............. ESCAPOU (leitura de string solta)
  4. superficie sob 4.5:1 ............. ESCAPOU (faltava o token de teste)
  5. h4 fixo no componente comum ...... PEGOU
  6. h4 voltando em pagina ............ ESCAPOU (regex nao cobreva o caso)
  7. tag desbalanceada ................ ESCAPOU (regex contava no fonte todo)

Os quatro ESCAPOU viraram guarda. Passar com defeito é pior que reprovar sem
defeito: o guard vira decoração, e quem confia nele acredita numa medição que
não ocorreu.

A restauração é feita em `try/finally` em cada caso — a primeira versão
vazou mutação quando o run estourou o timeout no meio.
"""

from __future__ import annotations

import pathlib
import subprocess
import sys

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
GLOBAIS = RAIZ / "frontend" / "src" / "app" / "globals.css"
SHARE = RAIZ / "frontend" / "src" / "components" / "ui" / "layout" / "ShareButtons.tsx"
AULA = RAIZ / "frontend" / "src" / "app" / "(public)" / "aulas" / "leitura-icm" / "page.tsx"

GUARDA_CONTRASTE = "tests/test_contraste_superficie.py"
GUARDA_HEADING = "tests/test_ordem_headings.py"

CASOS: tuple[tuple[str, pathlib.Path, str, str, str, str], ...] = (
    (
        "superficie de acento abaixo de 4.5:1",
        GLOBAIS,
        "--color-accent-indigo-surface: hsl(239, 84%, 66%);",
        "--color-accent-indigo-surface: hsl(239, 84%, 80%);",
        GUARDA_CONTRASTE,
        "test_superficie_de_acento_passa_aa_com_texto_branco",
    ),
    (
        "hover clareando (menos contraste que a base)",
        GLOBAIS,
        "--color-accent-indigo-surface-active: hsl(239, 84%, 62%);",
        "--color-accent-indigo-surface-active: hsl(239, 84%, 78%);",
        GUARDA_CONTRASTE,
        "test_estado_ativo_tem_mais_contraste_que_a_superficie",
    ),
    (
        "superficie cambiando a matiz da marca",
        GLOBAIS,
        "--color-accent-rose-surface: hsl(349, 89%, 48%);",
        "--color-accent-rose-surface: hsl(200, 89%, 48%);",
        GUARDA_CONTRASTE,
        "test_superficie_preserva_matiz_e_saturacao_do_acento",
    ),
    (
        "acento puro voltando a carregar texto",
        SHARE,
        "className={styles['shareTitle']}",
        "className={`${styles['shareTitle']} bg-accent-rose text-white`}",
        GUARDA_CONTRASTE,
        "test_nenhum_fundo_de_acento_que_carrega_texto_usa_acento_puro",
    ),
    (
        "nivel fixo de heading no componente comum",
        SHARE,
        "headingLevel?: 2 | 3 | 4 | 5 | 6;",
        "headingLevel?: 2 | 3;",
        GUARDA_HEADING,
        "test_componente_compartilhado_aceita_o_intervalo_de_niveis",
    ),
    (
        "h3 virando h5 na pagina (salto de dois niveis)",
        AULA,
        '<h3 className="text-text-bright font-heading">\n\t\t\t\t\t\t\tCamada 1: O Axioma do EV do Fold e o ICM<sub>ev</sub> Est\u00e1tico\n\t\t\t\t\t\t</h3>',
        '<h5 className="text-text-bright font-heading">\n\t\t\t\t\t\t\tCamada 1: O Axioma do EV do Fold e o ICM<sub>ev</sub> Est\u00e1tico\n\t\t\t\t\t\t</h5>',
        GUARDA_HEADING,
        "test_paginas_nao_pulam_nivel_no_fonte",
    ),
    (
        "tag de heading desbalanceada",
        AULA,
        '<h3 className="m-0 mb-4 text-[0.65rem] font-black text-text-muted uppercase tracking-[0.15em]">',
        '<h4 className="m-0 mb-4 text-[0.65rem] font-black text-text-muted uppercase tracking-[0.15em]">',
        GUARDA_HEADING,
        "test_tags_de_heading_abrem_e_fecham_em_par",
    ),
)


def _rodar(guarda: str, teste: str) -> subprocess.CompletedProcess[str]:
    base = pathlib.Path(RAIZ) / ".pytest_cache" / f"matriz_fe_{teste[:50]}"
    return subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            f"{guarda}::{teste}",
            "-q",
            "--no-header",
            "-p",
            "no:cacheprovider",
            "--tb=no",
            f"--basetemp={base}",
        ],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        timeout=180,
    )


@pytest.mark.unit
def test_as_guardas_passam_no_estado_atual() -> None:
    """Sem isto, 'a guarda pegou' pode significar 'a guarda sempre reprova'."""
    for guarda in (GUARDA_CONTRASTE, GUARDA_HEADING):
        r = subprocess.run(
            [
                sys.executable,
                "-m",
                "pytest",
                guarda,
                "-q",
                "--no-header",
                "-p",
                "no:cacheprovider",
                "--tb=no",
                f"--basetemp={pathlib.Path(RAIZ) / '.pytest_cache' / f'fe_{guarda[-14:-3]}'}",
            ],
            cwd=RAIZ,
            capture_output=True,
            text=True,
            timeout=300,
        )
        assert r.returncode == 0, f"{guarda} ja falha antes de qualquer defeito:\n{r.stdout[-1200:]}"


@pytest.mark.unit
@pytest.mark.parametrize(
    ("rotulo", "arquivo", "antes", "depois", "guarda", "teste"),
    CASOS,
    ids=[c[0] for c in CASOS],
)
def test_guarda_reprova_cada_defeito_reintroduzido(
    rotulo: str,
    arquivo: pathlib.Path,
    antes: str,
    depois: str,
    guarda: str,
    teste: str,
) -> None:
    original = arquivo.read_text(encoding="utf-8")
    assert antes in original, (
        f"a ancora sumiu de {arquivo.name}; a mutacao nao seria aplicada e este "
        f"caso passaria sem provar nada.\n  ancora: {antes!r}"
    )
    try:
        arquivo.write_text(original.replace(antes, depois, 1), encoding="utf-8")
        r = _rodar(guarda, teste)
    finally:
        arquivo.write_text(original, encoding="utf-8")

    assert r.returncode != 0, (
        f"ESCAPOU: {rotulo}.\n"
        f"  o guard em `{guarda}` passou com o defeito reintroduzido — o guard "
        "esta decorativo. Verifique se a checagem olha uso (classe + texto no "
        "mesmo className) em vez de grafia solta."
    )
