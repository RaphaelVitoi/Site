import json
import logging
import os
import sys
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).parent.parent.resolve()
logger = logging.getLogger(__name__)

# Constantes e Paths
PATH_AGENTS_MANIFEST = BASE_DIR / "data/agents_manifest.json"
PATH_INTENTMAP = BASE_DIR / "data/intentmap.json"
PATH_SYSTEM_CONFIG = BASE_DIR / "data/system_config.json"
PATH_ROUTING_MAP = BASE_DIR / "data/routing_map.json"
MODEL_GEMINI_FLASH = "gemini-2.0-flash"

def load_json_config(file_path: Path, default_value: Any = None) -> Any:
    try:
        if not file_path.resolve().is_relative_to(BASE_DIR):
            logger.critical(f"[SEC] Caminho suspeito detectado (path traversal out of bounds): {file_path}. Operacao abortada.")
            return default_value
    except Exception as e:
        logger.critical(f"[SEC] Erro na resolucao do caminho {file_path}: {e}. Operacao abortada.")
        return default_value

    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                content = f.read().lstrip('\ufeff \t\n\r')
                return json.loads(content)
        except (OSError, json.JSONDecodeError) as e:
            logger.error(f"Falha ao carregar ou parsear {file_path}: {e}")
    return default_value

# Defaults SOTA do Ecossistema
DEFAULT_GEMINI_FAST_MODEL = os.environ.get("DEFAULT_GEMINI_FAST_MODEL", MODEL_GEMINI_FLASH)
DEFAULT_WORKFLOW_FLAGS = {
    "enable_dynamic_fallback": True, "enable_dispatcher_schema_retry": True,
    "enable_security_gate": True, "enable_domain_validation_gate": True,
    "enable_strategy_gate": True, "enable_research_gate": True,
    "enable_web_infra_gate": True, "enable_orchestration_gate": True,
    "prefer_cost_saving_mode": True, "anthropic_last": True,
}

# Estado Global Mutavel (Sincronizado via Hot-Reload)
AGENTS_MANIFEST = {}
INTENT_MAP = {}
AGENT_ROUTING_MAP = {}
AGENT_COLOR_MAP = {}
VALID_AGENTS = []
AGENT_SOURCE = ""

SYSTEM_CONFIG = {}
ROUTING_CONFIG = {}
MODEL_ROUTING = {}
DEEP_THINKING_MODELS = ()
FAST_OPERATIONS_MODELS = ()
PROTECTED_AGENTS_FROM_CLEANUP = ()
HANDOFF_PIPELINE = {}
WORKFLOW_FLAGS = {}
ROUTING_HEURISTICS = {}
AGENT_SLA = {}
MODEL_HEALTH_GATE = {}
OPENROUTER_ALTERNATIVE_MODELS = ()
HEURISTIC_THRESHOLD = 2
TECHNICAL_AGENTS = ()
PRIORITY_WEIGHTS = {}

_CONFIG_LOCK = threading.Lock()
_CONFIG_MTIME: dict[str, float] = {}

def _reload_system_config() -> bool:
    global SYSTEM_CONFIG, ROUTING_CONFIG, MODEL_ROUTING, DEEP_THINKING_MODELS, FAST_OPERATIONS_MODELS
    global PROTECTED_AGENTS_FROM_CLEANUP, HANDOFF_PIPELINE, WORKFLOW_FLAGS
    global ROUTING_HEURISTICS, AGENT_SLA, MODEL_HEALTH_GATE, OPENROUTER_ALTERNATIVE_MODELS
    global HEURISTIC_THRESHOLD, TECHNICAL_AGENTS, PRIORITY_WEIGHTS
    try:
        mtime = PATH_SYSTEM_CONFIG.stat().st_mtime
        if _CONFIG_MTIME.get("system_config") != mtime:
            new_config = load_json_config(PATH_SYSTEM_CONFIG, {})
            if new_config:
                _CONFIG_MTIME["system_config"] = mtime
                SYSTEM_CONFIG = new_config
                ROUTING_CONFIG = load_json_config(PATH_ROUTING_MAP, {})
                MODEL_ROUTING = SYSTEM_CONFIG.get("model_routing", ROUTING_CONFIG)
                DEEP_THINKING_MODELS = tuple(MODEL_ROUTING.get("deep_thinking", (MODEL_GEMINI_FLASH, "deepseek/deepseek-r1:free")))
                FAST_OPERATIONS_MODELS = tuple(MODEL_ROUTING.get("fast_operations", (MODEL_GEMINI_FLASH, "meta-llama/llama-3.1-8b-instruct")))
                PROTECTED_AGENTS_FROM_CLEANUP = tuple(SYSTEM_CONFIG.get("protected_agents_from_cleanup", ("@maverick", "@chico")))
                HANDOFF_PIPELINE = SYSTEM_CONFIG.get("handoff_pipeline", {})
                WORKFLOW_FLAGS = SYSTEM_CONFIG.get("workflow_flags", {})
                ROUTING_HEURISTICS = SYSTEM_CONFIG.get("routing_heuristics", {})
                AGENT_SLA = SYSTEM_CONFIG.get("agent_sla", {})
                MODEL_HEALTH_GATE = SYSTEM_CONFIG.get("model_health_gate", {})
                PRIORITY_WEIGHTS = SYSTEM_CONFIG.get("priority_weights", {"alpha": 1.0, "beta": 1.5, "gamma": 0.5, "lambda_age": 0.01})

                _alt_raw = os.environ.get("OPENROUTER_ALTERNATIVE_MODELS", "")
                OPENROUTER_ALTERNATIVE_MODELS = tuple([m.strip() for m in _alt_raw.split(",") if m.strip()] + [m for m in SYSTEM_CONFIG.get("openrouter_alternatives", []) if str(m).strip()])

                sys_heuristics = SYSTEM_CONFIG.get("system_heuristics", {})
                HEURISTIC_THRESHOLD = sys_heuristics.get("heuristic_threshold", 2)
                TECHNICAL_AGENTS = tuple(sys_heuristics.get("technical_agents", ["@implementor", "@verifier", "@skillmaster", "@organizador", "@sequenciador"]))
                logger.info(f"[HOT-RELOAD] system_config.json. deep_thinking={DEEP_THINKING_MODELS}")
                return True
    except OSError:
        pass
    return False

def _reload_agents_manifest() -> bool:
    global AGENTS_MANIFEST, INTENT_MAP, AGENT_ROUTING_MAP, AGENT_COLOR_MAP, VALID_AGENTS, AGENT_SOURCE
    try:
        mtime = PATH_AGENTS_MANIFEST.stat().st_mtime
        if _CONFIG_MTIME.get("agents_manifest") != mtime:
            new_manifest = load_json_config(PATH_AGENTS_MANIFEST, {})
            _CONFIG_MTIME["agents_manifest"] = mtime
            if new_manifest:
                AGENT_SOURCE = str(PATH_AGENTS_MANIFEST)
                AGENTS_MANIFEST = new_manifest
                INTENT_MAP = {f"@{n}": {"pattern": d.get("routing_pattern", "")} for n, d in AGENTS_MANIFEST.items()}
                AGENT_ROUTING_MAP = {f"@{n}": d.get("model_preference", "fast_operations") for n, d in AGENTS_MANIFEST.items()}
                AGENT_COLOR_MAP = {f"@{n}": d.get("color", "white") for n, d in AGENTS_MANIFEST.items()}
                VALID_AGENTS = list(INTENT_MAP.keys())
            else:
                logger.warning(f"[RESILIENCIA] {PATH_AGENTS_MANIFEST} vazio. Fallback via {PATH_INTENTMAP}.")
                intent_map_disk = load_json_config(PATH_INTENTMAP, {})
                AGENT_SOURCE = str(PATH_INTENTMAP)
                AGENT_ROUTING_MAP = dict.fromkeys(intent_map_disk.keys(), "fast_operations")
                AGENT_COLOR_MAP = dict.fromkeys(intent_map_disk.keys(), "white")
                VALID_AGENTS = list(intent_map_disk.keys())
                AGENTS_MANIFEST = {name.lstrip('@'): {"pattern": data.get("pattern")} for name, data in intent_map_disk.items()}
            logger.info(f"[HOT-RELOAD] Agents Manifest. {len(VALID_AGENTS)} agentes.")
            return True
    except OSError:
        pass
    return False

def maybe_reload_config() -> bool:
    with _CONFIG_LOCK:
        c_reloaded = _reload_system_config()
        m_reloaded = _reload_agents_manifest()
        return c_reloaded or m_reloaded

def get_agent_color(agent: str) -> str:
    return AGENT_COLOR_MAP.get(agent, 'white')

def feature_enabled(flag_name: str) -> bool:
    if flag_name in WORKFLOW_FLAGS:
        return bool(WORKFLOW_FLAGS.get(flag_name))
    return bool(DEFAULT_WORKFLOW_FLAGS.get(flag_name, False))

def heuristic_terms(group_name: str) -> dict[str, int]:
    configured_terms = ROUTING_HEURISTICS.get(group_name, {})
    return {str(k).lower(): int(v) for k, v in configured_terms.items()}

def agent_sla_value(agent: str, key: str, default: int) -> int:
    agent_cfg = AGENT_SLA.get(agent, {})
    default_cfg = AGENT_SLA.get("default", {})
    if key in agent_cfg:
        return int(agent_cfg[key])
    if key in default_cfg:
        return int(default_cfg[key])
    return int(default)

def health_gate_value(key: str, default: Any) -> Any:
    if key in MODEL_HEALTH_GATE:
        return MODEL_HEALTH_GATE.get(key)
    return default

# Inicialização Direta (Cold-Start)
_reload_system_config()
_reload_agents_manifest()

if not VALID_AGENTS:
    logger.critical("CRITICAL: intentmap.json nao encontrado ou vazio. O sistema nao tem consciencia de seus agentes.")
    sys.exit(1)

# Circuit breaker para chaves bloqueadas temporariamente
KEY_BLOCK_DURATION = timedelta(minutes=15)
KEY_BLOCKLIST: dict[str, datetime] = {}

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
