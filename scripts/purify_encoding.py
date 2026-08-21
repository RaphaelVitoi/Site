"""
Script SOTA para Purificação e Correção de Encoding (Mojibake UTF-8 -> Latin1 -> UTF-8)
"""
import re
from pathlib import Path

# Dicionário determinístico de substituições para casos complexos ou corrompidos
DIRECT_REPLACEMENTS = {
    # Minúsculas acentuadas
    "Ã¡": "á",
    "Ã©": "é",
    "Ã\xad": "í",
    "Ã³": "ó",
    "Ãº": "ú",
    "Ã£": "ã",
    "Ãµ": "õ",
    "Ã§": "ç",
    "Ãª": "ê",
    "Ã¢": "â",
    "Ã\xa0": "à",
    # Maiúsculas acentuadas
    "Ã\x81": "Á",
    "Ã\x89": "É",
    "Ã\x8d": "Í",
    "Ã\x93": "Ó",
    "Ã\x9a": "Ú",
    "Ã\x82": "Â",
    "Ã\x8a": "Ê",
    "Ã\x87": "Ç",
    "Ã\x83": "Ã",
    "Ã\x95": "Õ",
    "Ã\x80": "À",
    # Pontuação e aspas
    "â€œ": '"',
    "â€\x9d": '"',
    "â€\x9c": '"',
    "â€™": "'",
    "â€˜": "'",
    "â€“": "–",
    "â€”": "—",
    "Â°": "°",
    "Âª": "ª",
    "Âº": "º",
    # Símbolos matemáticos e setas
    "â‰¥": "≥",
    "â‰¤": "≤",
    "â‰": "≠",
    "â†’": "→",
    "â†\x92": "→",
    "â†‘": "↑",
    "â†“": "↓",
    "âˆ−": "−",
    "âˆ’": "−",
    "âˆž": "∞",
    "âˆ‘": "∑",
    "âˆ‚": "∂",
    "âˆ«": "∫",
    "â‰ˆ": "≈",
    "â€¢": "•",
    "Â\xa0": " ",
    # Caracteres Gregos
    "Î”": "Δ",
    "Î¨": "Ψ",
    "Î²": "β",
    "Î±": "α",
    "Î¸": "θ",
    "Î»": "λ",
    "Î¼": "μ",
    "Î¨RP": "ΨRP",
    "Î”RP": "ΔRP",
}

MOJIBAKE_PATTERN = re.compile(r"[\xc2\xc3][\x80-\xbf]")
VALID_EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".json", ".md", ".css"}
IGNORED_PARTS = {"node_modules", ".next", "dist-workers", "dist"}


def clean_mojibake(text: str) -> str:
    """Aplica correções determinísticas e heurística de decodificação Latin-1/UTF-8."""
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
    """Verifica se o arquivo é elegível para sanitização."""
    if not path.is_file() or path.suffix not in VALID_EXTENSIONS:
        return False
    return not any(part in path.parts for part in IGNORED_PARTS)


def process_file(file_path: Path) -> bool:
    """Processa e corrige o encoding de um único arquivo se necessário."""
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
    """Varre diretórios-alvo e expurga mojibake."""
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
