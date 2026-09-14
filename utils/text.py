"""Module for text purification and normalization."""

import unicodedata

# Transliteracao explicita. Tudo o que NAO estiver aqui e nao se decompuser em
# ASCII pelo NFKD e descartado -- e `caracteres_sem_transliteracao` existe para
# que esse descarte seja declarado por quem o consome, nunca silencioso.
#
# Simbolos com carga semantica ganham equivalente ASCII: medido em 2026-09-14, o
# handoff de governanca perdia `\u00a7` (secao), `\u2192`, `\u2260` e `\u00d7`, e "regra
# \u2260 fato" chegava ao proximo agente como "regra  fato" -- o oposto do sentido.
_SUBSTITUICOES: dict[str, str] = {
    "\u201c": '"',
    "\u201d": '"',
    "\u2018": "'",
    "\u2019": "'",
    "\u2013": "-",
    "\u2014": "-",
    "\u2026": "...",
    "\u00ba": "o",
    "\u00aa": "a",
    "\u00e7": "c",
    "\u00c7": "C",
    "\u00e1": "a",
    "\u00e9": "e",
    "\u00ed": "i",
    "\u00f3": "o",
    "\u00fa": "u",
    "\u00c1": "A",
    "\u00c9": "E",
    "\u00cd": "I",
    "\u00d3": "O",
    "\u00da": "U",
    "\u00e3": "a",
    "\u00f5": "o",
    "\u00c3": "A",
    "\u00d5": "O",
    "\u00e2": "a",
    "\u00ea": "e",
    "\u00ee": "i",
    "\u00f4": "o",
    "\u00fb": "u",
    "\u00c2": "A",
    "\u00ca": "E",
    "\u00ce": "I",
    "\u00d4": "O",
    "\u00db": "U",
    "\u00e0": "a",
    "\u00e8": "e",
    "\u00ec": "i",
    "\u00f2": "o",
    "\u00f9": "u",
    "\u00c0": "A",
    "\u00c8": "E",
    "\u00cc": "I",
    "\u00d2": "O",
    "\u00d9": "U",
    "\u00f1": "n",
    "\u00d1": "N",
    "\u00fc": "u",
    "\u00dc": "U",
    "\u00f6": "o",
    "\u00d6": "O",
    "\u00df": "ss",
    "\u00e6": "ae",
    "\u00c6": "AE",
    "\u00e4": "a",
    "\u00c4": "A",
    # Simbolos semanticos. `SS` para secao e a convencao ja em uso nos arquivos
    # ASCII do repositorio (hooks, catalogo de identidades).
    "\u00a7": "SS",
    "\u2192": "->",
    "\u2190": "<-",
    "\u2194": "<->",
    "\u21d2": "=>",
    "\u27f6": "-->",
    "\u2260": "!=",
    "\u2264": "<=",
    "\u2265": ">=",
    "\u2248": "~=",
    "\u00b1": "+/-",
    "\u00d7": "x",
    "\u00f7": "/",
    "\u2212": "-",
    "\u2022": "-",
    "\u00b7": "-",
    "\u2500": "-",
    "\u2502": "|",
    "\u2550": "=",
    "\u221e": "inf",
    "\u2713": "[OK]",
    "\u2705": "[OK]",
    "\u274c": "[X]",
    "\u26a0": "[!]",
    # Seletor de variacao de emoji: invisivel, nao carrega sentido proprio.
    "\ufe0f": "",
}


def _aplicar_substituicoes(text: str) -> str:
    for k, v in _SUBSTITUICOES.items():
        text = text.replace(k, v)
    return unicodedata.normalize("NFKD", text)


def enforce_pure_ascii(text: str) -> str:
    """Purificacao absoluta SOTA: Erradica emojis, acentos e caracteres especiais, forcando Pure ASCII."""
    if not text:
        return ""
    # Destroi qualquer byte nao-ASCII restante
    return _aplicar_substituicoes(text).encode("ASCII", "ignore").decode("ASCII")


def caracteres_sem_transliteracao(text: str) -> dict[str, int]:
    """Conta o que `enforce_pure_ascii` descartaria sem equivalente ASCII.

    Acento nao conta: a marca combinante separada pelo NFKD e a perda que a
    Blindagem ASCII declara aceitar. Conta o caractere que some inteiro.
    """
    descartes: dict[str, int] = {}
    if not text:
        return descartes
    for ch in _aplicar_substituicoes(text):
        if ord(ch) > 127 and not unicodedata.combining(ch):
            descartes[ch] = descartes.get(ch, 0) + 1
    return descartes
