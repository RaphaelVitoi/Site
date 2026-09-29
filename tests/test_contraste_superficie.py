"""O contrato de contraste do tema, em teste.

MEDIDO EM 2026-09-29, por axe-core no DOM renderizado de 14 rotas do frontend.
Tres defeitos, uma familia:

1. **14 de 14 tokens de acento reprovam contra texto branco.** `cyan` marca
   1.450:1, `gold` 1.656:1, `emerald` 2.654:1, `indigo` 4.408:1. O
   `.bg-accent-indigo > span` reprovava em 7 rotas com impacto `serious`.

2. **O hover era pior que a base.** `hover:bg-accent-indigo-light` media
   2.903:1 contra a base de 4.408:1. Clarear o fundo REDUZ o contraste do
   texto branco. E o axe nao enxerga: ele inspeciona o estado atual e nao
   pseudo-classes, entao um hover ilegivel nunca aparece em nenhum relatorio.

3. **A correcao intuitiva — escurecer o acento — foi rejeitada por medicao.**
   Os tokens de acento tem 400+ usos como `text-accent-*` e borda sobre fundo
   escuro, onde o contraste sobra. Escurece-los para servir de fundo teria
   apagado 133 usos de `text-accent-indigo-light` e 104 de `text-accent-emerald`
   para consertar 7 botoes. O remedio destruiria a cura.

   A solucao adotada e uma CAMADA DE SUPERFICIE: mesmo `h`, mesmo `s`, so o `L`
   necessario. `bg-accent-*-surface` carrega texto; o acento puro continua
   acento. E a mesma ideia do "piso SOTA de contraste" que o proprio `globals.css`
   ja expressa para texto sobre superficie escura, aplicada ao outro lado da
   relacao.

Este arquivo fixa a invariante. Sem ele, a proxima vez que alguem criar
`bg-accent-gold` num botao repete o defeito, e nenhum relatorio acusa.
"""

from __future__ import annotations

import colorsys
import pathlib
import re

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
GLOBALS = RAIZ / "frontend" / "src" / "app" / "globals.css"
SRC = RAIZ / "frontend" / "src"

# WCAG 2.1 AA, texto normal. 4.5:1. Sem excecao: 14px normal e o caso medido.
MINIMO_AA = 4.5
# Folga deliberada. Sem ela o token rasparia a borda e a proxima mudanca de
# curva, de fonte ou de peso faria o mesmo token reprovar de novo.
FOLGA = 0.1


# --- a mesma funcao que produziu 4.408 para #6467f2, o valor que o axe mediu ---


def _hls_para_rgb(h: int, s: float, lum: float) -> tuple[int, int, int]:
    # colorsys.hls_to_rgb(h, l, s) recebe H em voltas e L, S em 0..1.
    # Passar `s` em 0..100 produz canais estourados e razao de contraste
    # na ordem de 1e5 — numeros que nao correspondem a cor nenhuma. A
    # sanidade abaixo trava: hsl(239,84%,67%) tem de dar #6467f2, o valor
    # que o axe mediu no DOM.
    r, g, b = colorsys.hls_to_rgb(h / 360, lum / 100, s / 100)
    return round(r * 255), round(g * 255), round(b * 255)


def _luminancia(rgb: tuple[int, int, int]) -> float:
    def canal(c: int) -> float:
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def _contraste(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    la, lb = _luminancia(a), _luminancia(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


BRANCO = (255, 255, 255)


@pytest.mark.unit
def test_a_matematica_de_contraste_bate_com_o_axe() -> None:
    """Trava a formula contra um valor medido, nao contra a si mesma.

    Implementacao de contraste que erra a escala devolve razao de 1e5 e
    continua "verde" contra um token inventado: o guard aprova um numero
    que nao corresponde a cor nenhuma. A unica saida e um valor que veio de
    fora — `#6467f2` medido pelo axe-core no DOM renderizado, com 4.4:1.
    """
    rgb = _hls_para_rgb(239, 84, 67)
    assert rgb == (0x64, 0x67, 0xF2), (
        f"hsl(239,84%,67%) virou {rgb}; o axe mediu #6467f2. A conversao HLS->RGB esta com escala errada."
    )
    razao = _contraste(BRANCO, rgb)
    assert 4.3 < razao < 4.5, (
        f"contraste calculado {razao:.3f}:1; o axe mediu 4.4:1 para a mesma "
        "cor. Se a formula mudou, reveja antes de confiar no resto do arquivo."
    )


def _tokens() -> dict[str, tuple[int, float, float]]:
    """Todos os `--color-*: hsl(h, s%, l%)` do bloco @theme."""
    css = GLOBALS.read_text(encoding="utf-8")
    achados: dict[str, tuple[int, float, float]] = {}
    for m in re.finditer(r"--color-([\w-]+):\s*hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)", css):
        achados[m.group(1)] = (int(float(m.group(2))), float(m.group(3)), float(m.group(4)))
    return achados


# `accent-` no inicio e obrigatorio: `--color-light-surface` tambem termina em
# `-surface`, e pertence ao sistema editorial claro — a superficie e clara de
# proposito, com texto escuro em cima. Reprovar por contraste com branco seria
# o guard medindo a cor errada.
SUPERFICIE = [k for k in _tokens() if k.startswith("accent-") and k.endswith("-surface")]
ATIVA = [k for k in _tokens() if k.startswith("accent-") and k.endswith("-surface-active")]


# --- 1. as superficies passam -----------------------------------------------


@pytest.mark.unit
@pytest.mark.parametrize("nome", SUPERFICIE)
def test_superficie_de_acento_passa_aa_com_texto_branco(nome: str) -> None:
    h, s, lum = _tokens()[nome]
    razao = _contraste(BRANCO, _hls_para_rgb(h, s, lum))
    assert razao >= MINIMO_AA + FOLGA, (
        f"`--color-{nome}` mede {razao:.3f}:1 com texto branco; o piso e "
        f"{MINIMO_AA + FOLGA:.1f}:1.\n"
        "  A superficie existe para carregar texto. Se ela nao passa, ela nao "
        "pode ser superficie — suba o `L` do token ou pare de usa-lo como fundo."
    )


@pytest.mark.unit
@pytest.mark.parametrize("nome", ATIVA)
def test_estado_ativo_tem_mais_contraste_que_a_superficie(nome: str) -> None:
    """O hover escurece, porque clarear REDUZ o contraste do texto branco.

    Este e o defeito que nenhuma auditoria de axe pegaria: axe inspeciona o
    estado atual, nao pseudo-classes. `hover:bg-accent-indigo-light` media
    2.903:1 contra a base de 4.408:1 — o hover era o pior estado do botao, e
    por isso o pior estado era invisivel.
    """
    base = nome.removesuffix("-active")
    assert base in _tokens(), f"`--color-{nome}` nao tem superficie base correspondente."
    hb, sb, lb = _tokens()[base]
    ha, sa, la = _tokens()[nome]
    rb = _contraste(BRANCO, _hls_para_rgb(hb, sb, lb))
    ra = _contraste(BRANCO, _hls_para_rgb(ha, sa, la))
    assert ra > rb, (
        f"`--color-{nome}` mede {ra:.3f}:1, MENOS que a base `--color-{base}` "
        f"({rb:.3f}:1).\n"
        "  Clarear o fundo no hover reduz o contraste do texto branco. "
        "Baixe o `L` do `-active`, ou o hover vira o estado mais ilegivel "
        "do componente — e nenhum relatorio de axe vai mostrar."
    )
    assert ra >= MINIMO_AA + FOLGA, f"`--color-{nome}` mede {ra:.3f}:1; o piso e {MINIMO_AA + FOLGA:.1f}:1."


@pytest.mark.unit
def test_superficie_preserva_matiz_e_saturacao_do_acento() -> None:
    """A correcao muda luminosidade, nunca identidade.

    A tentativa de escurecer o token de acento reprovou aqui: mudaria 400+ usos
    de `text-accent-*` sobre fundo escuro. Por isso a superficie mantem `h` e `s`
    — o que o olho le como "o mesmo indigo" — e devolve um `L` legivel.
    """
    tokens = _tokens()
    for nome in SUPERFICIE + ATIVA:
        base = nome.removesuffix("-active").removesuffix("-surface")
        if base not in tokens:
            continue
        h1, s1, _l1 = tokens[base]
        h2, s2, _l2 = tokens[nome]
        assert (h1, s1) == (h2, s2), (
            f"`--color-{nome}` (h={h2}, s={s2}) nao preserva matiz e saturacao "
            f"de `--color-accent-{base}` (h={h1}, s={s1}). "
            "Superficie muda `L`; mudar `h` ou `s` troca a cor da marca."
        )


# --- 2. o uso no codigo segue o contrato -------------------------------------

# `className` pode ser string simples ou template literal. O template precisa
# de uma forma propria porque o conteudo leva `${...}`, e o interior costuma
# conter apostro de acesso a objeto: `${styles['shareTitle']}`. Um unico
# padrao `` `([^`]*)` `` para na barra no primeiro backtick e perde a classe
# INTEIRA — e classes assim somem do guard sem aviso.
#
# MEDIDO EM 2026-09-29: 149 `className={`...`}` do frontend contem apostro
# dentro do template. Todas eram invisiveis para estas checagens, inclusive
# depois da migracao da camada de superficie. Um guard cego nao e guard.
CLASSE = re.compile(
    r"className=\{`(.+?)`\}"  # template literal: casa ate o }
    r'|className="([^"]*)"'  # string simples
)
TEXTO = re.compile(r"\btext-(?!accent-)\w+")
PUREZA = {"indigo", "emerald", "rose", "amber", "danger", "violet", "sky", "indigo-light"}


def _classes(texto: str):
    """Todo `className` do arquivo, template e string, com seu conteudo."""
    for m in CLASSE.finditer(texto):
        yield m.group(1) or m.group(2) or ""


@pytest.mark.unit
def test_nenhum_fundo_de_acento_que_carrega_texto_usa_acento_puro() -> None:
    """A regra de uso, verificada no codigo e nao em comentario.

    Sao 196 usos de `bg-accent-indigo` e apenas 48 carregam texto; os outros
    148 sao barra de progresso, anel, regua e glow, onde escurecer a cor
    apagaria a hierarquia visual sem corrigir nada. Este teste exige a
    superficie **apenas** onde ha texto — que e a unica condicao em que o
    contraste e uma questao de acesso, e nao de estilo.
    """
    infraveis: list[str] = []
    for tsx in sorted(SRC.rglob("*.tsx")):
        texto = tsx.read_text(encoding="utf-8", errors="replace")
        for cn in _classes(texto):
            if "bg-accent-" not in cn or not TEXTO.search(cn):
                continue
            for acento in re.findall(r"(?<!hover:)\bbg-accent-([\w-]+)(?![\w-])", cn):
                if acento in PUREZA:
                    infraveis.append(
                        f"{tsx.relative_to(RAIZ).as_posix()}: bg-accent-{acento} "
                        "carrega texto sem a camada de superficie"
                    )
    assert not infraveis, (
        f"{len(infraveis)} fundo(s) de acento puro carregando texto:\n  "
        + "\n  ".join(sorted(set(infraveis))[:10])
        + "\n\nUse `bg-accent-*-surface`. Acento puro e para texto, borda e glow."
    )


@pytest.mark.unit
def test_nenhum_hover_clareia_fundo_que_carrega_texto() -> None:
    """Clarear no hover e o defeito que axe nao enxerga.

    Nenhum `hover:bg-accent-*-light` pode dividir className com texto: aquele
    token mede 2.903:1 com branco. Se o hover clareia, o hover e o estado mais
    ilegivel do componente, e nenhum axe -- nem o do portao -- vai mostrar.
    """
    ilegiveis: list[str] = []
    for tsx in sorted(SRC.rglob("*.tsx")):
        texto = tsx.read_text(encoding="utf-8", errors="replace")
        for cn in _classes(texto):
            if not TEXTO.search(cn):
                continue
            for hover in re.findall(r"hover:bg-accent-([\w-]+)-light", cn):
                ilegiveis.append(f"{tsx.relative_to(RAIZ).as_posix()}: hover:bg-accent-{hover}-light")
    assert not ilegiveis, (
        f"{len(ilegiveis)} hover(s) clareando fundo que carrega texto:\n  "
        + "\n  ".join(sorted(set(ilegiveis))[:10])
        + "\n\nHover vai para `hover:bg-accent-*-surface-active` (>= 5.5:1)."
    )
