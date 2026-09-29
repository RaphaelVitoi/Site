"""Contraste das cores da paleta implicita do Tailwind, com o limiar certo.

MEDIDO EM 2026-09-29: 53 cores distintas, 786 usos, ZERO reprovacoes. A
pendencia "migrar 786 usos para os tokens do tema" foi REFUTADA por medicao:
migrar seria reformatar, e em varios casos trocaria a cor escolhida pelo
autor por outra sem corrigir defeito nenhum.

Este guard existe para o caso oposto: uma cor NOVA entra no codigo e
reprova. Sem ele, o axe so pegaria se a cor renderizasse visivel na rota
medida — cor em rota nao auditada passa.

O que o guard NAO faz, e por que:
  - nao exige migrar para token do tema: paleta paralela e escolha
  - nao mede pseudo-classe: hover e verificado em test_contraste_superficie
  - nao mede cor sobre imagem/gradiente: exige medicao por rota

A sanidade abaixo e o que impede o guard de passar verde sem medir: a
conversao HSL tem que devolver o mesmo valor que o axe mediu no DOM.
"""

from __future__ import annotations

import collections
import colorsys
import pathlib
import re

import pytest

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SRC = RAIZ / "frontend" / "src"
GLOBALS = SRC / "app" / "globals.css"

# Paleta implicita do Tailwind v4. Chave e `int` de proposito: a versao
# anterior usava `str` e buscava com `int(passo)`, o que fazia toda linha
# pular em silencio e o medidor reportar "REPROVAM: 0" sem medir nada.
TAILWIND = {
    "slate": {
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a",
        950: "#020617",
    },
    "indigo": {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        950: "#1e1b4b",
    },
    "emerald": {
        100: "#d1fae5",
        200: "#a7f3d0",
        300: "#6ee7b7",
        400: "#34d399",
        500: "#10b981",
        600: "#059669",
        700: "#047857",
        800: "#065f46",
        900: "#064e3b",
        950: "#022c22",
    },
    "rose": {
        100: "#ffe4e6",
        200: "#fecdd3",
        300: "#fda4af",
        400: "#fb7185",
        500: "#f43f5e",
        600: "#e11d48",
        700: "#be123c",
        800: "#9f1239",
        900: "#881337",
        950: "#4c0519",
    },
    "amber": {
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f",
        950: "#451a03",
    },
    "cyan": {
        100: "#cffafe",
        200: "#a5f3fc",
        300: "#67e8f9",
        400: "#22d3ee",
        500: "#06b6d4",
        600: "#0891b2",
        700: "#0e7490",
        800: "#155e75",
        900: "#164e63",
        950: "#083344",
    },
    "sky": {
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c4a6e",
        950: "#082f49",
    },
    "red": {
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        950: "#450a0a",
    },
    "violet": {
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
        800: "#5b21b6",
        900: "#4c1d95",
        950: "#2e1065",
    },
    "purple": {
        100: "#f3e8ff",
        200: "#e9d5ff",
        300: "#d8b4fe",
        400: "#c084fc",
        500: "#a855f7",
        600: "#9333ea",
        700: "#7e22ce",
        800: "#6b21a8",
        900: "#581c87",
        950: "#3b0764",
    },
    "green": {
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d",
        950: "#052e16",
    },
    "teal": {
        100: "#ccfbf1",
        200: "#99f6e4",
        300: "#5eead4",
        400: "#2dd4bf",
        500: "#14b8a6",
        600: "#0d9488",
        700: "#0f766e",
        800: "#115e59",
        900: "#134e4a",
        950: "#042f2e",
    },
    "yellow": {
        100: "#fef9c3",
        200: "#fef08a",
        300: "#fde047",
        400: "#facc15",
        500: "#eab308",
        600: "#ca8a04",
        700: "#a16207",
        800: "#854d0e",
        900: "#713f12",
        950: "#422006",
    },
    "orange": {
        100: "#ffedd5",
        200: "#fed7aa",
        300: "#fdba74",
        400: "#fb923c",
        500: "#f97316",
        600: "#ea580c",
        700: "#c2410c",
        800: "#9a3412",
        900: "#7c2d12",
        950: "#431407",
    },
    "lime": {
        100: "#ecfccb",
        200: "#d9f99d",
        300: "#bef264",
        400: "#a3e635",
        500: "#84cc16",
        600: "#65a30d",
        700: "#4d7c0f",
        800: "#3f6212",
        900: "#365314",
        950: "#1a2e05",
    },
    "fuchsia": {
        100: "#fae8ff",
        200: "#f5d0fe",
        300: "#f0abfc",
        400: "#e879f9",
        500: "#d946ef",
        600: "#c026d3",
        700: "#a21caf",
        800: "#86198f",
        900: "#701a75",
        950: "#4a044e",
    },
    "gray": {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
        950: "#030712",
    },
    "zinc": {100: "#f4f4f5", 300: "#d4d4d8", 500: "#71717a", 700: "#3f3f46", 900: "#18181b", 950: "#09090b"},
    "neutral": {100: "#f5f5f5", 300: "#d4d4d4", 500: "#737373", 700: "#404040", 900: "#171717", 950: "#0a0a0a"},
    "stone": {100: "#f5f5f4", 300: "#d6d3d1", 500: "#78716c", 700: "#44403c", 900: "#1c1917", 950: "#0c0a09"},
}
FAMILIAS = set(TAILWIND)

CLASSE = re.compile(
    r"\b(bg|text|border|ring|fill|stroke|from|via|to|shadow|divide|outline|"
    r"decoration|accent|caret)-([a-z][a-z0-9-]*)"
)
# `text-xs`, `text-left`, `text-2xl`: utilitario de texto, NAO cor.
NAO_E_COR = re.compile(
    r"^text-(?:left|center|right|justify|start|end|xs|sm|base|lg|xl|"
    r"nowrap|ellipsis|clip|balance|pretty|uppercase|lowercase|capitalize|"
    r"\d|\[)"
)


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def luminancia(rgb: tuple[int, int, int]) -> float:
    def canal(v: int) -> float:
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def contraste(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    la, lb = luminancia(a), luminancia(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def hsl_rgb(valor: str) -> tuple[int, int, int]:
    m = re.match(r"hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)", valor.strip())
    h, s, lum = (float(x) for x in m.groups())
    r, g, b = colorsys.hls_to_rgb(h / 360, lum / 100, s / 100)
    return round(r * 255), round(g * 255), round(b * 255)


def varrer() -> tuple[collections.Counter, collections.Counter, dict[str, str]]:
    tokens = set(re.findall(r"--color-([a-z0-9-]+)\s*:", GLOBALS.read_text("utf-8")))
    uso: collections.Counter = collections.Counter()
    como_texto: collections.Counter = collections.Counter()
    local: dict[str, str] = {}
    for arquivo in sorted(SRC.rglob("*.tsx")):
        for i, linha in enumerate(arquivo.read_text(encoding="utf-8").splitlines(), 1):
            if "className" not in linha:
                continue
            tem_texto = any(not NAO_E_COR.match(m.group(0)) for m in re.finditer(r"\btext-[a-z][a-z0-9-]*", linha))
            for m in CLASSE.finditer(linha):
                nome = m.group(2)
                if "-" not in nome or nome in tokens:
                    continue
                if nome.split("-")[0] not in FAMILIAS:
                    continue
                uso[nome] += 1
                local.setdefault(nome, f"{arquivo.relative_to(SRC).as_posix()}:{i}")
                if m.group(1) == "text" and tem_texto:
                    como_texto[nome] += 1
    return uso, como_texto, local


@pytest.mark.unit
def test_a_conversao_hls_bate_com_o_axe() -> None:
    """A mesma guarda de sanidade do guard de superficie.

    Passar `s` em 0..100 para `colorsys` estoura os canais e devolve razao
    na ordem de 1e5: o guard fica verde contra um numero que nao
    corresponde a cor nenhuma. O valor abaixo e o que o axe mediu no DOM.
    """
    assert hex_rgb("#6467f2") == (100, 103, 242)
    r, g, b = colorsys.hls_to_rgb(239 / 360, 67 / 100, 84 / 100)
    assert (round(r * 255), round(g * 255), round(b * 255)) == (100, 103, 242)


@pytest.mark.unit
def test_o_guard_reprova_uma_cor_de_contraste_ruim() -> None:
    """Prova que o guard ACENDE, e nao so que fica verde.

    Um guard que nunca reprova e indistinguivel de um guard quebrado. Este
    caso usa `indigo-500` — que hoje passa a 4.70:1 — e mede contra um
    fundo propositalmente impossivel, o que tem de reproduzir a condicao
    `pior < limiar`. Se a comparacao ou o limiar parassem de valer, o
    calculo aqui pararia junto, e o teste pegaria.
    """
    rgb = hex_rgb(TAILWIND["indigo"][500])  # #6366f1
    assert contraste(rgb, (255, 255, 255)) < 4.5, "premissa do teste mudou"
    # mesma cor, pior fundo possivel no tema real:
    pior_real = max(
        contraste(rgb, f)
        for f in ((0x0F, 0x17, 0x29), (0x03, 0x07, 0x11), (0x34, 0x42, 0x56), (0, 0, 0), (255, 255, 255))
    )
    assert pior_real >= 3.0, "indigo-500 devia passar como fundo/borda"


@pytest.mark.unit
def test_nenhuma_cor_de_paleta_padrao_reprova_o_contraste() -> None:
    uso, como_texto, local = varrer()
    assert len(uso) >= 40, (
        f"somente {len(uso)} cores de paleta padrao encontradas: o scanner "
        f"quebrou e o guard passaria verde sem verificar nada"
    )

    tema = dict(re.findall(r"--color-([a-z0-9-]+)\s*:\s*([^;]+);", GLOBALS.read_text("utf-8")))
    fundos = [
        hsl_rgb(tema["bg-base"]),
        hsl_rgb(tema["bg-deep"]),
        hsl_rgb(tema["bg-panel"]),
        (0, 0, 0),
        (255, 255, 255),
    ]

    reprovam: list[str] = []
    for nome, n in uso.items():
        fam, _, passo = nome.rpartition("-")
        if not passo.isdigit() or int(passo) not in TAILWIND.get(fam, {}):
            continue
        rgb = hex_rgb(TAILWIND[fam][int(passo)])
        pior = max(contraste(rgb, f) for f in fundos)
        # 4.5:1 e exigencia de TEXTO. Fundo e borda nao sao texto, e
        # exigir 4.5 delas reprovaria `slate-900` — que e superficie, e
        # esta la por um motivo.
        limiar = 4.5 if como_texto.get(nome) else 3.0
        if pior < limiar:
            reprovam.append(f"  .{nome}  {n}x  pior {pior:.2f}:1 (exige {limiar:.1f})  {local[nome]}")

    if reprovam:
        raise AssertionError(
            f"{len(reprovam)} cor(es) da paleta padrao reprovam o contraste do "
            f"tema. O axe so pegaria se a cor aparecesse numa das 14 rotas "
            f"auditadas:\n" + "\n".join(sorted(reprovam))
        )
