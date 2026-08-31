"""
Script SOTA para Purificacao e Correcao de Encoding (Mojibake UTF-8 -> Latin1 -> UTF-8)
"""

from pathlib import Path
import re

# Dicionario deterministico de substituicoes para casos complexos ou corrompidos
DIRECT_REPLACEMENTS = {
    # Minusculas acentuadas
    "\xc3\xa1": "a",
    "\xc3\xa9": "e",
    "\xc3\xad": "i",
    "\xc3\xb3": "o",
    "\xc3\xba": "u",
    "\xc3\xa0": "a",
    "\xc3\xb5": "o",
    "\xc3\xa7": "c",
    "\xc3\xaa": "e",
    "\xc3\xa3": "a",
    "\xc2\xa0": " ",
    # Maiusculas acentuadas
    "\xc3\x81": "A",
    "\xc3\x89": "E",
    "\xc3\x8d": "I",
    "\xc3\x93": "O",
    "\xc3\x9a": "U",
    "\xc3\x80": "A",
    "\xc3\x8a": "E",
    "\xc3\x87": "C",
    "\xc3\x83": "A",
    "\xc3\x95": "O",
    # Pontuacao e aspas
    "\xe2\x80\x9c": '"',
    "\xe2\x80\x9d": '"',
    "\xe2\x80\x98": "'",
    "\xe2\x80\x99": "'",
    "\xe2\x80\x94": "--",
    "\xe2\x80\x93": "-",
    "\xe2\x80\xa6": "...",
    # Simbolos e setas
    "\xe2\x86\x92": "->",
    "\xe2\x86\x90": "<-",
    "\xe2\x89\xa4": "<=",
    "\xe2\x89\xa5": ">=",
    "\xe2\x89\xa0": "!=",
    "\xc2\xb1": "+/-",
    "\xc2\xb0": "o",
    "\xc2\xaa": "a",
}

MOJIBAKE_PATTERN = re.compile(r"[\xc2\xc3][\x80-\xbf]")
VALID_EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".json", ".md", ".css"}
IGNORED_PARTS = {"node_modules", ".next", "dist-workers", "dist"}


def clean_mojibake(text: str) -> str:
    """Aplica correcoes deterministicas e heuristica de decodificacao Latin-1/UTF-8."""
    for bad, good in DIRECT_REPLACEMENTS.items():
        text = text.replace(bad, good)

    def try_decode(m: re.Match[str]) -> str:
        raw = m.group(0)
        try:
            return raw.encode("latin1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return raw

    return MOJIBAKE_PATTERN.sub(try_decode, text)


def should_process(path: Path) -> bool:
    """Verifica se o arquivo e elegivel para sanitizacao."""
    if not path.is_file() or path.suffix not in VALID_EXTENSIONS:
        return False
    return not any(part in path.parts for part in IGNORED_PARTS)


def process_file(file_path: Path) -> bool:
    """Processa e corrige o encoding de um unico arquivo se necessario."""
    try:
        content = file_path.read_text(encoding="utf-8")
        cleaned = clean_mojibake(content)
        if cleaned != content:
            file_path.write_text(cleaned, encoding="utf-8")
            print(f"Fixed encoding in: {file_path}")
            return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    return False


def main() -> None:
    """Varre diretorios-alvo e expurga mojibake."""
    target_dirs = [Path("frontend/src"), Path("content"), Path("data")]
    total_files_fixed = sum(
        1
        for base_dir in target_dirs
        if base_dir.exists()
        for p in base_dir.rglob("*")
        if should_process(p) and process_file(p)
    )
    print(f"\n[SUCESSO] Total de arquivos purificados: {total_files_fixed}")


if __name__ == "__main__":
    main()
