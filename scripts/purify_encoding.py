"""
Script SOTA para Purificacao e Correcao de Encoding (Mojibake UTF-8 -> Latin1 -> UTF-8)
"""

import re
from pathlib import Path

# Dicionario deterministico de substituicoes para casos complexos ou corrompidos
DIRECT_REPLACEMENTS = {
    # Minusculas acentuadas
    "A": "a",
    "A": "e",
    "A\xad": "i",
    "A3": "o",
    "Ao": "u",
    "A": "a",
    "A": "o",
    "A": "c",
    "Aa": "e",
    "A": "a",
    "A\xa0": "a",
    # Maiusculas acentuadas
    "A\x81": "A",
    "A\x89": "E",
    "A\x8d": "I",
    "A\x93": "O",
    "A\x9a": "U",
    "A\x82": "A",
    "A\x8a": "E",
    "A\x87": "C",
    "A\x83": "A",
    "A\x95": "O",
    "A\x80": "A",
    # Pontuacao e aspas
    "a": '"',
    "a\x9d": '"',
    "a\x9c": '"',
    "aTM": "'",
    "a ": "'",
    "a": "",
    "a": "",
    "A": "",
    "Aa": "a",
    "Ao": "o",
    # Simbolos matematicos e setas
    "a": "",
    "a": "",
    "a": "=",
    "a": "",
    "a\x92": "",
    "a": "",
    "a": "",
    "a": "",
    "a": "",
    "az": "",
    "a": "",
    "a": "",
    "a": "",
    "a": "",
    "a": "",
    "A\xa0": " ",
    # Caracteres Gregos
    "I": "",
    "I ": "",
    "I2": "",
    "I": "",
    "I ": "",
    "I": "",
    "I14": "",
    "I RP": "RP",
    "IRP": "RP",
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
