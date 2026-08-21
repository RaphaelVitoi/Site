import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def purify_file(path: Path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        # Normalize to NFKD (separates accents from characters)
        normalized = unicodedata.normalize("NFKD", content)
        # Encode to ASCII, ignoring characters that cannot be represented in ASCII
        ascii_content = normalized.encode("ascii", "ignore").decode("ascii")

        if content != ascii_content:
            with open(path, "w", encoding="ascii") as f:
                f.write(ascii_content)
            print(f"[PURIFIED] {path.relative_to(BASE_DIR)}")
    except Exception as e:
        print(f"[ERROR] {path}: {e}")


def scan_and_purify(dir_path: Path):
    try:
        for path in dir_path.iterdir():
            if path.is_dir():
                if path.name not in [
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
                    ".cerebro",
                ]:
                    scan_and_purify(path)
            elif path.is_file() and path.suffix == ".py":
                purify_file(path)
    except (PermissionError, FileNotFoundError):
        pass


if __name__ == "__main__":
    print("=== STARTING PYTHON ASCII PURIFICATION ===")
    scan_and_purify(BASE_DIR)
    print("=== PURIFICATION COMPLETED ===")
