"""Module for loading environment variables."""

from __future__ import annotations

import logging
import os
from pathlib import Path
import sys

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


def _load_registry_env() -> dict[str, str]:
    """Carrega variaveis de ambiente persistidas em HKCU e HKLM no Windows (NT)."""
    reg_keys: dict[str, str] = {}
    if sys.platform != "win32":
        return reg_keys

    try:
        import winreg  # noqa: PLC0415
    except ImportError:
        return reg_keys

    hives = [
        (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
        (winreg.HKEY_CURRENT_USER, r"Environment"),
    ]

    for hkey, subkey in hives:
        try:
            with winreg.OpenKey(hkey, subkey) as k:
                idx = 0
                while True:
                    try:
                        name, val, _ = winreg.EnumValue(k, idx)
                        idx += 1
                        if name and isinstance(val, str) and val.strip():
                            reg_keys[name] = val.strip()
                    except OSError:
                        break
        except OSError:
            pass

    return reg_keys


def _parse_env_file(path: Path) -> dict[str, str]:
    """Extrai pares chave/valor de um arquivo .env ou script de ambiente."""
    parsed: dict[str, str] = {}
    if not path.exists():
        return parsed
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith(("#", "//")):
                continue
            key, raw_value = _parse_env_line(line)
            if not key or not raw_value:
                continue
            value = _clean_env_value(raw_value)
            if value:
                parsed[key] = value
    except Exception as err:
        logger.debug("Falha ao ler arquivo de ambiente %s: %s", path, err)
    return parsed


def _parse_hermes_auth(auth_json: Path) -> dict[str, str]:
    """Carrega credenciais ativas do auth.json do Hermes (Nous, Codex, etc.)."""
    keys: dict[str, str] = {}
    if not auth_json.exists():
        return keys
    try:
        import json  # noqa: PLC0415

        data = json.loads(auth_json.read_text(encoding="utf-8", errors="replace"))
        providers = data.get("providers", {})
        nous = providers.get("nous", {})
        nous_token = nous.get("agent_key") or nous.get("access_token")
        if nous_token:
            token_str = str(nous_token).strip()
            keys["NOUS_API_KEY"] = token_str
            keys["HERMES_API_KEY"] = token_str
            inference_base = nous.get("inference_base_url") or "https://inference-api.nousresearch.com/v1"
            keys["NOUS_BASE_URL"] = str(inference_base).strip()
    except Exception as err:
        logger.debug("Falha ao ler hermes auth.json: %s", err)
    return keys


def _load_hermes_harness_env() -> dict[str, str]:
    """Carrega credenciais ativas do harness Hermes Agent ($LOCALAPPDATA/hermes)."""
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if not local_app_data:
        return {}

    hermes_dir = Path(local_app_data) / "hermes"
    if not hermes_dir.exists():
        return {}

    hermes_keys = _parse_env_file(hermes_dir / ".env")
    hermes_keys.update(_parse_hermes_auth(hermes_dir / "auth.json"))
    return hermes_keys


def load_env() -> dict[str, str]:
    """
    Carrega as variaveis de ambiente a partir do Registro do Windows (HKCU/HKLM),
    do harness Hermes Agent, alem de .env e _env.ps1 na raiz do projeto.
    Atualiza o os.environ global de forma robusta e sem truncamentos.
    """
    keys: dict[str, str] = {}

    for source in (_load_registry_env(), _load_hermes_harness_env()):
        for k, v in source.items():
            keys[k] = v
            if not os.environ.get(k):
                os.environ[k] = v

    base_dir = Path(__file__).parent.parent.resolve()
    for file_name in ["_env.ps1", ".env"]:
        file_vars = _parse_env_file(base_dir / file_name)
        for key, value in file_vars.items():
            keys[key] = value
            os.environ[key] = value

    _apply_platform_guards(keys)

    return keys
