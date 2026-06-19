"""Module for text purification and normalization."""

import unicodedata


def enforce_pure_ascii(text: str) -> str:
    """Purificacao absoluta SOTA: Erradica emojis, acentos e caracteres especiais, forcando Pure ASCII."""
    if not text:
        return ""
    replacements = {
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
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Destroi qualquer byte nao-ASCII restante
    return unicodedata.normalize("NFKD", str(text)).encode("ASCII", "ignore").decode("ASCII")
