"""Module for loading environment variables."""

import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)


def _parse_env_line(line: str) -> tuple[str, str]:
    """Parses a single line into key and value based on different formats."""
    if line.startswith("$env:"):
        parts = line[5:].split("=", 1)
        if len(parts) == 2:
            return parts[0].strip(), parts[1].strip()
    elif line.startswith("export "):
        parts = line[7:].split("=", 1)
        if len(parts) == 2:
            return parts[0].strip(), parts[1].strip()
    elif "=" in line:
        parts = line.split("=", 1)
        return parts[0].strip(), parts[1].strip()
    elif ":" in line:
        parts = line.split(":", 1)
        return parts[0].strip(), parts[1].strip()
    return "", ""


def _clean_env_value(value: str) -> str:
    """Cleans enclosing quotes and end-of-line comments from an env value."""
    if value.startswith('"'):
        end_idx = value.find('"', 1)
        return value[1:end_idx] if end_idx != -1 else value[1:]
    if value.startswith("'"):
        end_idx = value.find("'", 1)
        return value[1:end_idx] if end_idx != -1 else value[1:]
    comment_idx = value.find("#")
    if comment_idx != -1:
        return value[:comment_idx].strip()
    return value


def _apply_platform_guards(keys: dict[str, str]) -> None:
    """Applies SOTA auto-cure & platform guard configurations to environment."""
    import sys

    if sys.platform.startswith("linux") or os.name == "posix":
        # Guest (WSL Debian) Protection Shield
        os.environ["UV_PROJECT_ENVIRONMENT"] = ".venv-wsl"
        os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
        os.environ["NODE_OPTIONS"] = "--max-old-space-size=4096"
        keys["UV_PROJECT_ENVIRONMENT"] = ".venv-wsl"
        keys["PYTHONDONTWRITEBYTECODE"] = "1"
        keys["NODE_OPTIONS"] = "--max-old-space-size=4096"
    elif sys.platform == "win32":
        # Host (Windows NT) Protection Shield
        os.environ["UV_PROJECT_ENVIRONMENT"] = ".venv"
        os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
        keys["UV_PROJECT_ENVIRONMENT"] = ".venv"
        keys["PYTHONDONTWRITEBYTECODE"] = "1"


def load_env() -> dict[str, str]:
    """
    Carrega as variaveis de ambiente a partir de .env e _env.ps1 na raiz do projeto.
    Atualiza o os.environ global de forma robusta e sem truncamentos.
    """
    keys: dict[str, str] = {}
    base_dir = Path(__file__).parent.parent.resolve()

    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if not env_path.exists():
            continue
        try:
            content = env_path.read_text(encoding="utf-8", errors="replace")
            for line in content.splitlines():
                line = line.strip()
                if not line or line.startswith(("#", "//")):
                    continue

                key, raw_value = _parse_env_line(line)
                if not key:
                    continue

                value = _clean_env_value(raw_value)
                keys[key] = value
                os.environ[key] = value
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.warning("Falha ao carregar arquivo %s: %s", file_name, e)

    _apply_platform_guards(keys)

    return keys
