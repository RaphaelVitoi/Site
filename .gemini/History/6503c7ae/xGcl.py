import os
import sys
import json
import logging
from pathlib import Path
from typing import Any, Dict
from datetime import datetime, timedelta

def load_json_config(file_path: Path, default_value: Any = None) -> Any:
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                content = f.read().lstrip('\ufeff \t\n\r')
                return json.loads(content)
        except (json.JSONDecodeError, IOError) as e:
            logging.error(f"Falha ao carregar ou parsear {file_path}: {e}")
    return default_value

BASE_DIR = Path(__file__).parent.parent.resolve()

# --- Carregamento Dinamico da Consciencia do Sistema ---
INTENT_MAP = load_json_config(BASE_DIR / "data/intentmap.json", {})
VALID_AGENTS = list(INTENT_MAP.keys())

ROUTING_CONFIG = load_json_config(BASE_DIR / "data/routing_map.json", {})
AGENT_ROUTING_MAP = ROUTING_CONFIG.get("agent_map", {})
DEEP_THINKING_MODELS = tuple(ROUTING_CONFIG.get("deep_thinking", ("gemini-2.5-pro",)))
FAST_OPERATIONS_MODELS = tuple(ROUTING_CONFIG.get("fast_operations", ("gemini-2.5-flash",)))

SYSTEM_CONFIG = load_json_config(BASE_DIR / "data/system_config.json", {})
PROTECTED_AGENTS_FROM_CLEANUP = tuple(SYSTEM_CONFIG.get("protected_agents_from_cleanup", ("@maverick", "@chico")))

if not VALID_AGENTS:
    logging.critical("CRITICAL: intentmap.json nao encontrado ou vazio. O sistema nao tem consciencia de seus agentes.")
    sys.exit(1)

# Circuit breaker para chaves bloqueadas temporariamente
KEY_BLOCK_DURATION = timedelta(minutes=15)
KEY_BLOCKLIST: Dict[str, datetime] = {}

def _key_identifier(provider: str, key: str) -> str:
    return f"{provider}:{key}"

def _is_key_blocked(provider_key: str) -> bool:
    expiry = KEY_BLOCKLIST.get(provider_key)
    if expiry:
        if expiry > datetime.now():
            return True
        KEY_BLOCKLIST.pop(provider_key, None)
    return False

def _block_key(provider_key: str):
    KEY_BLOCKLIST[provider_key] = datetime.now() + KEY_BLOCK_DURATION