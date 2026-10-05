"""Classe de cor que o Tailwind nao emite: nao produz efeito nenhum.

MEDIDO EM 2026-09-29, no CSS compilado do projeto:

  `hover:bg-slate-850`        a escala `slate` vai 800 -> 900. 850 nao existe.
  `bg-bg-surface`             o token e `bg-elevated`, nao `bg-surface`.
  `text-text-light` (18x)     a rampa vai main -> bright -> muted -> dim ->
                              darker. `light` nunca foi definido.
  `text-accent-amber-light`   so 4 dos 9 acentos tinham par `-light`; os
  `text-accent-violet-light`  outros 5 nao. 10 usos, todos sem efeito.
  `text-accent-pink-light`

Nenhum relatorio de acessibilidade acusa nada disso: o texto herda uma cor
valida e o contraste passa. O defeito e *AUSENCIA* de efeito, e auditoria de
acesso so mede presenca. Por isso os guards de contraste nunca viram nada
aqui — eles procuram `text-white` ao lado de `bg-accent-*`, e uma classe
morta de cor nao tem nada ao lado.

## Por que este guard confia no CSS compilado

Duas tentativas anteriores parses o `@theme` e falharam, ambas pela mesma
raza: **Tailwind resolve a classe por estrutura, nao por sufixo literal.**

  `border-l-accent-indigo`   o `l` e a LATERAL da borda, nao parte do token
  `bg-linear-to-r`           `linear-to-r` e direcao de gradiente
  `text-glow-indigo`         utilitaria escrita a mao em `@layer`, nao token
  `ring-offset-2`            `ring-offset` e familia propria

A primeira versao acusou **3271** classes; a segunda, **118**. Todas as 4389
eram falsos positivos, e as duas pegavam **zero** defeito real. Um guard que
grita 3271 vezes nao protege nada — o time para de ler.

A unica autoridade e o que o Tailwind **de fato emitiu**. O guard le o CSS
gerado e acusa a classe que o codigo usa e o build nao produziu. Se o
contraste, o tema ou a escala mudarem, o guard acompanha: ele mede o
resultado, nao a intencao.
"""

from __future__ import annotations

import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC = RAIZ / "frontend" / "src"

# Onde o Tailwind v4 (Turbopack) deixa o CSS. Build de producao vai para
# `.next/static/chunks`, dev para `.next/dev/static/chunks`.
CANDIDATOS = (
    RAIZ / "frontend" / ".next" / "static" / "chunks",
    RAIZ / "frontend" / ".next" / "static" / "css",
    RAIZ / "frontend" / ".next" / "dev" / "static" / "chunks",
    RAIZ / "frontend" / ".next" / "build" / "chunks",
    RAIZ / "frontend" / ".next",
)

# Utilitario de cor, com variante opcional. `group-hover/btn:bg-...` casa.
CLASSE_COR = re.compile(
    r"(?:[a-z-]+/)*[a-z-]+:?"
    r"(?:bg|text|border|ring|fill|stroke|shadow|divide|outline|"
    r"decoration|accent|caret|from|via|to)-[a-z][a-z0-9-]*"
)
# `bg-[url(...)]`, `text-[0.6rem]`: valor arbitrario, nunca e token.
VALOR_OU_NOME = re.compile(r"^[\[(]")

# Coisas que casam o padrao acima mas NAO sao classe utilitaria:
#   - valor de custom property: `var(--accent-indigo)`
#   - rota/slug dentro de href: `/biblioteca/manifesto-sota-axiomas`
#   - animacao CSS: `auto-restart`, `uto-scroll` (corta de `auto-`+`scroll`)
NAO_E_CLASSE = re.compile(r"^--|[/.]|^(auto|uto)-")


def css_compilado() -> str:
    for pasta in CANDIDATOS:
        if pasta.is_dir():
            css = "".join(f.read_text(encoding="utf-8", errors="replace") for f in sorted(pasta.rglob("*.css")))
            if css.strip():
                return css
    return ""


def classe_emitida(classe: str, css: str) -> bool:
    """O seletor existe no CSS? Tailwind escapa SO `:` e `/` no seletor.

    Nao usar `re.escape`: ele escapa o hifen tambem (`bg\\-slate`) e o CSS
    real escreve `bg-slate`. Isso faz a checagem nunca encontrar nada e o
    guard accuse 328 classes que existem. MEDIDO EM 2026-09-29.
    """
    if VALOR_OU_NOME.match(classe):
        return True  # `text-[10px]` vira regra propria; nao e token
    if NAO_E_CLASSE.search(classe):
        return True  # custom property, rota, slug, animacao
    escapado = classe.replace(":", r"\:").replace("/", r"\/")
    return f".{escapado}" in css


def test_toda_classe_de_cor_usada_e_efetivamente_emitida() -> None:
    css = css_compilado()
    assert css.strip(), (
        "Nenhum CSS compilado encontrado. Rode `npm run build` (ou `npm run "
        "dev`) em frontend/ antes deste guard: sem o artefato compilado nao "
        "ha como saber o que o Tailwind emitiu, e o guard passaria verde sem "
        "verificar nada."
    )

    nao_emitidas: dict[str, list[str]] = {}
    for arquivo in sorted(SRC.rglob("*.tsx")):
        texto = arquivo.read_text(encoding="utf-8")
        for i, linha in enumerate(texto.splitlines(), 1):
            # Só a linha que DECLARA classe entra na conta. Um slug como
            # `slug: 'teto-equidade-river-icm'` ou um path em comentário
            # casam o padrao de utilitario sem nunca virar className —
            # 4 dos 5 achados iniciais eram exatamente isso.
            if "className" not in linha and "cn:" not in linha:
                continue
            for m in CLASSE_COR.finditer(linha):
                classe = m.group(0)
                if not classe_emitida(classe, css):
                    nao_emitidas.setdefault(classe, []).append(f"{arquivo.relative_to(RAIZ).as_posix()}:{i}")

    if nao_emitidas:
        total = sum(len(v) for v in nao_emitidas.values())
        detalhe = "\n  ".join(
            f".{classe}  ({len(locais)}x)  ex: {locais[0]}"
            for classe, locais in sorted(nao_emitidas.items(), key=lambda kv: -len(kv[1]))
        )
        raise AssertionError(
            f"{len(nao_emitidas)} classe(s) de cor usada(s) que o Tailwind nao "
            f"emitiu — {total} usos, nenhum produz efeito. O elemento fica com a "
            f"cor herdada do pai, e nenhum relatorio de acessibilidade acusa "
            f"ausencia de efeito:\n  {detalhe}\n"
            f"  CSS verificado: {len(css):,} bytes compilados"
        )


def test_o_guard_ainda_enxerga_as_classes_medidas() -> None:
    """Trava o comportamento, nao so a implementacao.

    Se `classe_emitida` perder a forma, o guard fica cego — e um guard
    cego passa verde. As 4 classes abaixo sao as medidas em 2026-09-29.
    """
    css = ".hover\\:bg-slate-800{color:red} .to-text-dim{color:blue}"
    assert classe_emitida("hover:bg-slate-800", css), "variante com escape perdeu"
    assert classe_emitida("to-text-dim", css), "classe simples perdeu"
    assert not classe_emitida("hover:bg-slate-850", css), "aceitou classe inexistente"
    assert not classe_emitida("text-text-light", css), "aceitou token inexistente"
    # valor arbitrario nunca e token
    assert classe_emitida("text-[0.6rem]", css), "valor arbitrario reprovado"
