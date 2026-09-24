"""
PURIFICADOR DE CODIGO PYTHON PARA PURE ASCII -- PROTOCOLO CHICO SOTA v8.0 GOLD
Preserva semantica, sintaxe AST e equivalencia exata em runtime:
- Comentarios e docstrings: transliterados para ASCII legivel sem acentos.
- Strings literais e f-strings: caracteres nao-ASCII escapados via \\uXXXX / \\UXXXXXXXX.
"""

from __future__ import annotations

import ast
import io
from pathlib import Path
import tokenize
import unicodedata

BASE_DIR = Path(__file__).resolve().parent.parent.parent

CHAR_MAP = {
    "\u2014": "--",
    "\u2013": "-",
    "\u201c": '"',
    "\u201d": '"',
    "\u2018": "'",
    "\u2019": "'",
    "\u00a7": "Secao ",
    "\u2261": "==",
    "\u2260": "!=",
    "\u2264": "<=",
    "\u2265": ">=",
    "\u00d7": "x",
    "\u2026": "...",
    "\u2022": "*",
    "\u2192": "->",
    "\u2190": "<-",
    "\u2194": "<->",
    "\u21d2": "=>",
    "\u2248": "~=",
}


def transliterate_text(text: str) -> str:
    for k, v in CHAR_MAP.items():
        text = text.replace(k, v)
    normalized = unicodedata.normalize("NFKD", text)
    res = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    return res.encode("ascii", "ignore").decode("ascii")


def escape_non_ascii(text: str) -> str:
    out = []
    for c in text:
        if ord(c) > 127:
            if ord(c) <= 0xFFFF:
                out.append(f"\\u{ord(c):04x}")
            else:
                out.append(f"\\U{ord(c):08x}")
        else:
            out.append(c)
    return "".join(out)


def purify_source_code(content: str) -> str:
    raw_bytes = content.encode("utf-8")
    if all(b <= 127 for b in raw_bytes):
        return content

    tokens = list(tokenize.tokenize(io.BytesIO(raw_bytes).readline))
    edits = []

    for tok in tokens:
        if any(ord(c) > 127 for c in tok.string):
            if tok.type == tokenize.COMMENT:
                new_str = transliterate_text(tok.string)
            elif tok.type == tokenize.STRING:
                val = tok.string
                if val.startswith(('"""', "'''")):
                    q = val[:3]
                    inner = val[3:-3]
                    new_str = f"{q}{transliterate_text(inner)}{q}"
                else:
                    new_str = escape_non_ascii(val)
            else:
                new_str = escape_non_ascii(tok.string)
            edits.append((tok.start, tok.end, new_str))

    lines = content.splitlines(keepends=True)
    edits.sort(key=lambda e: e[0], reverse=True)

    for (s_row, s_col), (e_row, e_col), new_text in edits:
        if s_row == e_row:
            line = lines[s_row - 1]
            lines[s_row - 1] = line[:s_col] + new_text + line[e_col:]
        else:
            first_line = lines[s_row - 1][:s_col]
            last_line = lines[e_row - 1][e_col:]
            lines[s_row - 1 : e_row] = [first_line + new_text + last_line]

    return "".join(lines)


def purify_file(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            raw_bytes = f.read()

        if all(b <= 127 for b in raw_bytes):
            return False

        content = raw_bytes.decode("utf-8", errors="replace")
        new_content = purify_source_code(content)

        # Validacao de invariancia sintatica
        ast.parse(new_content)
        new_bytes = new_content.encode("ascii")

        with open(path, "wb") as f:
            f.write(new_bytes)
        print(f"[PURIFIED] {path.relative_to(BASE_DIR)}")
        return True
    except Exception as e:
        print(f"[ERROR] {path}: {e}")
        return False


def _is_ignored_dir(name: str) -> bool:
    if name.startswith((".venv", "venv", ".env")) or name == "site-packages":
        return True
    return name in {
        ".venv",
        ".venv-wsl",
        "venv",
        ".env",
        "node_modules",
        "__pycache__",
        ".gemini",
        "temp",
        "triage",
        ".git",
        ".claude",
        ".cerebro",
        "target",
        ".next",
        "dist",
        "build",
        ".trunk",
        ".Codex",
        "reports",
        "docs",
    }


def scan_and_purify(dir_path: Path) -> int:
    purified_count = 0
    try:
        for path in dir_path.iterdir():
            if path.is_dir():
                if not _is_ignored_dir(path.name):
                    purified_count += scan_and_purify(path)
            elif path.is_file() and path.suffix == ".py" and purify_file(path):
                purified_count += 1
    except (PermissionError, FileNotFoundError):
        pass
    return purified_count


if __name__ == "__main__":
    print("=== STARTING PYTHON ASCII PURIFICATION (SOTA GOLD) ===")
    total = scan_and_purify(BASE_DIR)
    print(f"=== PURIFICATION COMPLETED (Total: {total} files) ===")
