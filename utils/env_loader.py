"""Module for loading environment variables."""

import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)


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

                key = ""
                value = ""

                if line.startswith("$env:"):
                    parts = line[5:].split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip()
                elif line.startswith("export "):
                    parts = line[7:].split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip()
                else:
                    if "=" in line:
                        parts = line.split("=", 1)
                        key = parts[0].strip()
                        value = parts[1].strip()
                    elif ":" in line:
                        parts = line.split(":", 1)
                        key = parts[0].strip()
                        value = parts[1].strip()

                if not key:
                    continue

                # Limpeza robusta do valor preservando espacos internos
                if value.startswith('"'):
                    end_idx = value.find('"', 1)
                    value = value[1:end_idx] if end_idx != -1 else value[1:]
                elif value.startswith("'"):
                    end_idx = value.find("'", 1)
                    value = value[1:end_idx] if end_idx != -1 else value[1:]
                else:
                    # Remove comentarios de fim de linha
                    comment_idx = value.find("#")
                    if comment_idx != -1:
                        value = value[:comment_idx].strip()

                keys[key] = value
                os.environ[key] = value
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.warning("Falha ao carregar arquivo %s: %s", file_name, e)

    return keys
