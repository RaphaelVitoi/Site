import json
import time
import sys
import os
import base64
import re
import subprocess
import socket
import shlex
import hashlib
import urllib.request
import urllib.error
import aiohttp
import ctypes
if os.name == 'nt':
    from ctypes import wintypes
else:
    import fcntl
from aiohttp import web
import logging
import asyncio
import shutil
from functools import lru_cache
import threading
import ssl
import certifi
import functools
import gc
import unicodedata
import aiosqlite
import sqlite3
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from core.schemas import Task
from pydantic import BaseModel, Field, ValidationError, field_validator
from database.queue_manager import QueueManager
from datetime import datetime, timedelta, timezone
from rich.logging import RichHandler
from rich.console import Console
from rich.panel import Panel
from rich.status import Status
from rich.text import Text
from rich.table import Table

# SOTA 8.0: Importa o novo cerebro de arbitragem
from core.arbitrator import UniversalArbitrator
import core.config as _core_config
from memory_rag import MemoryRAG
import core.runtime as _runtime

# Imports dos modulos extraidos (Fases 1-4)
from llm.budget import (
    APIBudgetExhaustedError, APIKeysExhaustedError,
    ENV_KEYS, ALL_ENV_VARS,
    GEMINI_PRO_KEYS, GEMINI_FLASH_KEYS, GEMINI_KEYS, GEMINI_ALL_KEYS, GEMINI_ALL_KEYS_WITH_POOLS,
    ANTHROPIC_KEYS, OPENROUTER_KEYS, TAVILY_KEYS, PERPLEXITY_KEYS, API_SECRET_TOKEN,
    web_search_cache, WEB_SEARCH_CACHE_TTL,
    KEY_BLOCK_DURATION, GEMINI_MODEL_KEY_BLOCK_DURATION, KEY_BLOCKLIST, GEMINI_MODEL_KEY_BLOCKLIST,
    ROUTE_COOLDOWN_DURATION, ROUTE_FAILURE_THRESHOLD,
    DEEPSEEK_ROUTE_COOLDOWN_DURATION, DEEPSEEK_ROUTE_FAILURE_THRESHOLD,
    ROUTE_BLOCKLIST, ROUTE_FAILURE_COUNTS, COMPRESSION_CIRCUIT_BREAKER,
    SYSTEM_PROMPT_CACHE,
    get_telemetry_lock, _key_identifier, _is_key_blocked, _block_key,
    _gemini_model_key_identifier, _is_gemini_model_key_blocked, _block_gemini_model_key,
    _gemini_key_pool_for_model, _is_semantic_gemini_error,
    _route_identifier, _is_route_blocked, _register_route_success, _register_route_failure,
    _key_fingerprint, _score_key_from_stats, _rank_keys_by_health,
    AsyncTokenBucket, _RATE_LIMITERS
)
from utils.text import enforce_pure_ascii
from utils.cache import _read_file_cached_internal, _read_file_with_cache
from utils.heuristics import _calculate_heuristic_score
from llm.session import get_global_http_session, get_api_semaphore, _sync_fallback_request
from llm.gemini import call_gemini
from llm.anthropic import call_anthropic
from llm.openrouter import call_openrouter
from llm.search import call_perplexity_search, call_tavily_search
from llm.routing import (
    _infer_provider_for_model, _reorder_models_for_economy,
    _inject_openrouter_alternatives, _get_model_recent_health, _apply_model_health_gate
)
from llm.providers import _try_provider
from llm.orchestrator import call_llm_api, _compress_context
from agents.autonomy import get_autonomy_mode, apply_god_mode, _AUTONOMY_CACHE as AUTONOMY_MODE_CACHE
from agents.prompts import get_agent_system_prompt
from agents.dispatcher import DispatcherSubtask, _parse_dispatcher_subtasks_strict, _retry_dispatcher_schema_once
from agents.fallback import _create_dispatcher_fallback_plan
from agents.execution import process_agent_task, execute_task_workflow, _create_system_task
from web.handlers import (
    handle_add_task, handle_get_status, handle_get_key_health_summary,
    handle_get_task_result, handle_get_state, handle_set_state, handle_ask_oracle
)
from web.middleware import auth_middleware, cors_middleware
from web.server import start_api_server
from monitoring.telemetry import send_toast, write_economic_log, _write_economic_log_sync
from monitoring.watchdog import system_watchdog
from worker.loop import start_worker
from worker.startup import start_worker_and_api

# Arquivo para armazenar o Process ID do worker para parada graciosa
PID_FILE = Path(__file__).parent / ".nexus_worker.pid"

class CrossProcessMutex:
    """SOTA: OS-Level Mutex (Lei 1) para sincronizacao entre Python e PowerShell."""
    def __init__(self, name: str):
        self.name = name
        if os.name == 'nt':
            self._mutex = ctypes.windll.kernel32.CreateMutexW(None, False, self.name)
        else:
            self._fd = open(f"/tmp/{self.name}.lock", "w")

    def __enter__(self):
        if os.name == 'nt':
            ctypes.windll.kernel32.WaitForSingleObject(self._mutex, 0xFFFFFFFF)
        else:
            fcntl.flock(self._fd, fcntl.LOCK_EX)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if os.name == 'nt':
            ctypes.windll.kernel32.ReleaseMutex(self._mutex)
        else:
            fcntl.flock(self._fd, fcntl.LOCK_UN)

# Carregamento Lazzy do RAG para evitar overhead no db-add
rag_engine = None
_RAG_LOCK = CrossProcessMutex("Global\\NexusRagLock")

def get_rag() -> MemoryRAG:
    global rag_engine
    if rag_engine is None:
        with _RAG_LOCK:
            if rag_engine is None:
                from memory_rag import MemoryRAG
                rag_engine = MemoryRAG()
    return rag_engine

async def get_rag_async() -> MemoryRAG:
    """Descarrega a inicializacao pesada e síncrona do ChromaDB para uma thread de IO isolada, evitando paralisia do Event Loop."""
    return await asyncio.to_thread(get_rag)

# Configuracao estetica e persistente de Log (Estado da Arte)
console = Console()
log_dir = Path(".claude/logs")
log_dir.mkdir(parents=True, exist_ok=True)
archive_dir = Path(".claude/.archive")
archive_dir.mkdir(parents=True, exist_ok=True)
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
logger = logging.getLogger()
logger.setLevel(getattr(logging, log_level, logging.INFO))
logger.propagate = False

# SOTA: Garante que os handlers nao sejam duplicados em reloads do worker
if not logger.handlers:
    rich_handler = RichHandler(
        console=console,
        rich_tracebacks=True,
        markup=True,
        show_path=False,
        tracebacks_show_locals=True
    )
    rich_handler.setFormatter(logging.Formatter("%(message)s", datefmt="[%X]"))
    logger.addHandler(rich_handler)

    import logging.handlers
    rotating_handler = logging.handlers.RotatingFileHandler(
        log_dir / "task_executor.log",
        maxBytes=1024*1024*10,
        backupCount=10,
        encoding="utf-8"
    )
    rotating_handler.setFormatter(logging.Formatter("%(asctime)s - [%(levelname)s] - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"))
    logger.addHandler(rotating_handler)

DO_PS1_PATH = Path(__file__).parent.resolve() / "do.ps1"
DO_PS1_THRESHOLD = int(os.environ.get("DO_PS1_THRESHOLD", "5"))

# ==========================================
# 1. SCHEMAS (A Lei da Honestidade Radical)
# ==========================================

def load_json_config(file_path: Path, default_value: Any = None) -> Any:
    # Checagem de seguranca ANTES de abrir o arquivo
    try:
        if not file_path.resolve().is_relative_to(Path(__file__).parent.resolve()):
            logging.critical(f"[SEC] Caminho suspeito detectado (path traversal out of bounds): {file_path}. Operacao abortada.")
            return default_value
    except Exception as e:
        logging.critical(f"[SEC] Erro na resolucao do caminho {file_path}: {e}. Operacao abortada.")
        return default_value
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                content = f.read()
                content = content.lstrip('\ufeff')
                return json.loads(content)
        except (json.JSONDecodeError, IOError) as e:
            logging.error(f"Falha ao carregar ou parsear {file_path}: {e}")
    return default_value

# --- Carregamento Dinamico da Consciencia do Sistema ---
_BASE_DIR = Path(__file__).parent.resolve()
AGENTS_MANIFEST = _core_config.AGENTS_MANIFEST
AGENT_SOURCE = str(_BASE_DIR / "data/agents_manifest.json") if AGENTS_MANIFEST else str(_BASE_DIR / "data/intentmap.json")

# SOTA: Implementacao do protocolo de resiliencia (HOLOGRAPHIC ROUTING PROTOCOL, Secao 8)
if not AGENTS_MANIFEST:
    logging.warning("[RESILIENCIA] agents_manifest.json nao encontrado ou vazio. Acionando fallback via intentmap.json.")
    # Em modo fallback, nao temos preferencias de modelo ou cores, usamos defaults.
    INTENT_MAP = _core_config.INTENT_MAP
    AGENT_ROUTING_MAP = {agent: "fast_operations" for agent in _core_config.INTENT_MAP.keys()}
    AGENT_COLOR_MAP = {agent: "white" for agent in _core_config.INTENT_MAP.keys()}
    # Recria um AGENTS_MANIFEST basico para o resto do sistema funcionar
    AGENTS_MANIFEST = {name.lstrip('@'): {"routing_pattern": data.get("pattern")} for name, data in _core_config.INTENT_MAP.items()}
else:
    # Construcao dinamica do INTENT_MAP e AGENT_ROUTING_MAP a partir do Manifesto
    INTENT_MAP = _core_config.INTENT_MAP
    AGENT_ROUTING_MAP = {f"@{name}": data.get("model_preference", "fast_operations") for name, data in AGENTS_MANIFEST.items()}
    AGENT_COLOR_MAP = {f"@{name}": data.get("color", "white") for name, data in AGENTS_MANIFEST.items()}

VALID_AGENTS = _core_config.VALID_AGENTS

# SOTA: Fail-Fast contra Drift de Configuracao (Homeostase Holografica)
_intentmap_path = _BASE_DIR / "data/intentmap.json"
if AGENTS_MANIFEST and _intentmap_path.exists():
    _intentmap_disk = load_json_config(_intentmap_path, {})
    if _intentmap_disk and set(AGENTS_MANIFEST.keys()) != set([k.lstrip('@') for k in _intentmap_disk.keys()]):
        logging.critical("[CRITICAL] FAIL-FAST SOTA: Assimetria detectada entre agents_manifest.json e intentmap.json. Risco de entropia no Roteamento Holografico. Abortando inicializacao.")
        sys.exit(1)

ROUTING_MAP = load_json_config(_BASE_DIR / "data/routing_map.json", {})

SYSTEM_CONFIG = load_json_config(_BASE_DIR / "data/system_config.json", {})
PRIORITY_WEIGHTS = SYSTEM_CONFIG.get("priority_weights", {"alpha": 1.0, "beta": 1.5, "gamma": 0.5, "lambda_age": 0.01})
MODEL_ROUTING = SYSTEM_CONFIG.get("model_routing", ROUTING_MAP)
DEFAULT_GEMINI_FAST_MODEL = os.environ.get("DEFAULT_GEMINI_FAST_MODEL", "gemini-2.0-flash")
DEEP_THINKING_MODELS = tuple(MODEL_ROUTING.get("deep_thinking", ("gemini-2.0-flash", "deepseek/deepseek-r1:free")))
FAST_OPERATIONS_MODELS = tuple(MODEL_ROUTING.get("fast_operations", ("gemini-2.0-flash", "meta-llama/llama-3.1-8b-instruct")))
PROTECTED_AGENTS_FROM_CLEANUP = tuple(SYSTEM_CONFIG.get("protected_agents_from_cleanup", ("@maverick", "@chico")))
HANDOFF_PIPELINE = SYSTEM_CONFIG.get("handoff_pipeline", {})
WORKFLOW_FLAGS = SYSTEM_CONFIG.get("workflow_flags", {})
ROUTING_HEURISTICS = SYSTEM_CONFIG.get("routing_heuristics", {})
AGENT_SLA = SYSTEM_CONFIG.get("agent_sla", {})
MODEL_HEALTH_GATE = SYSTEM_CONFIG.get("model_health_gate", {})

_alt_models_raw = os.environ.get("OPENROUTER_ALTERNATIVE_MODELS", "")
OPENROUTER_ALTERNATIVE_MODELS = tuple(
    [m.strip() for m in _alt_models_raw.split(",") if m.strip()]
    + [m for m in SYSTEM_CONFIG.get("openrouter_alternatives", []) if str(m).strip()]
)

DEFAULT_WORKFLOW_FLAGS = {
    "enable_dynamic_fallback": True,
    "enable_dispatcher_schema_retry": True,
    "enable_security_gate": True,
    "enable_domain_validation_gate": True,
    "enable_strategy_gate": True,
    "enable_research_gate": True,
    "enable_web_infra_gate": True,
    "enable_orchestration_gate": True,
    "prefer_cost_saving_mode": True,
    "anthropic_last": True,
}

SYSTEM_HEURISTICS = SYSTEM_CONFIG.get("system_heuristics", {})
HEURISTIC_THRESHOLD = SYSTEM_HEURISTICS.get("heuristic_threshold", 2)
RAG_IGNORE_PATTERNS = SYSTEM_HEURISTICS.get("rag_ignore_patterns", [".venv", ".git", ".chroma_db", "__pycache__", "node_modules", ".archive"])
RAG_INJECTION_THRESHOLD = SYSTEM_HEURISTICS.get("rag_injection_threshold", 5) # SOTA: Limiar para injecao automatica de RAG
TECHNICAL_AGENTS = tuple(SYSTEM_HEURISTICS.get("technical_agents", ["@implementor", "@verifier", "@skillmaster", "@organizador", "@sequenciador"]))
DEFAULT_ROUTING_HEURISTICS = {
    "research_terms": {"pesquisa": 2, "research": 2, "benchmark": 3, "mercado": 2, "competidor": 2, "fonte": 1, "referencia": 1, "web": 1, "sota": 3},
    "strategic_terms": {"estrateg": 3, "roadmap": 2, "visao": 2, "tradeoff": 2, "produto": 1, "governanca": 1, "hipotese": 2, "cenario": 1},
    "security_terms": {"auth": 3, "autentic": 3, "token": 2, "rbac": 3, "cors": 2, "secret": 3, "chave": 2, "vazamento": 3, "seguranca": 3, "privacy": 3, "compliance": 2, "ethics": 1},
    "domain_terms": {
        "icm": 3, "gto": 3, "nash": 3, "ev": 2, "roi": 2, "matemat": 2, "calculo": 2, "poker": 2,
        "jurid": 1, "medic": 1, "financ": 1, "datascience": 2, "psychology": 1, "philosophy": 1, "filosofia": 1, "ciencia": 1, "science": 1,
        "rp": 2, "bf": 2, "bayes": 2
    },
    "web_infra_terms": {
        "next.js": 3, "react": 3, "frontend": 2, "backend": 2, "ui": 1, "ux": 1, "web": 1, "componente": 1, "gamificacao": 2
    },
    "curator_terms": {"estetica": 3, "estética": 3, "ux": 2, "ui": 2, "copywriting": 3, "copy": 2, "design": 2, "voz": 2, "tom": 2, "texto": 1},
    "orchestration_terms": {
        "autopoiese": 3, "maverick": 2, "fila": 1, "task_executor": 3, "orquestracao": 3, "agente": 1, "workflow": 2, "pipeline": 2, "script": 1, "powershell": 1, "python": 1
    }
}

DEFAULT_AGENT_SLA = {
    "default": {
        "llm_timeout_seconds": 600,
        "provider_retries": 2,
        "dispatcher_schema_retries": 1,
    },
    "@dispatcher": {
        "llm_timeout_seconds": 240,
        "provider_retries": 1,
        "dispatcher_schema_retries": 1,
    },
    "@implementor": {
        "llm_timeout_seconds": 900,
        "provider_retries": 2,
    },
}

DEFAULT_MODEL_HEALTH_GATE = {
    "enabled": True,
    "window_minutes": 180,
    "min_attempts": 3,
    "min_success_rate_pct": 10.0,
    "drop_only_free_models": True,
    "protect_models": ["gemini-2.0-flash"],
}

# ==========================================
# HOT-RELOAD: system_config.json sem restart
# ==========================================

_CONFIG_LOCK = CrossProcessMutex("Global\\NexusConfigLock")
_CONFIG_MTIME: Dict[str, float] = {}

def _reload_system_config() -> bool:
    """Helper SOTA para recarregar configuracoes de sistema minimizando V(G)."""
    global SYSTEM_CONFIG, MODEL_ROUTING, DEEP_THINKING_MODELS, FAST_OPERATIONS_MODELS, \
           PROTECTED_AGENTS_FROM_CLEANUP, HANDOFF_PIPELINE, WORKFLOW_FLAGS, \
           ROUTING_HEURISTICS, AGENT_SLA, MODEL_HEALTH_GATE, \
           OPENROUTER_ALTERNATIVE_MODELS, HEURISTIC_THRESHOLD, PRIORITY_WEIGHTS

    config_path = _BASE_DIR / "data/system_config.json"
    try:
        mtime = config_path.stat().st_mtime
        if _CONFIG_MTIME.get("system_config") != mtime:
            new_config = load_json_config(config_path, {})
            if new_config:
                _CONFIG_MTIME["system_config"] = mtime
                SYSTEM_CONFIG = new_config
                MODEL_ROUTING = SYSTEM_CONFIG.get("model_routing", ROUTING_MAP)
                DEEP_THINKING_MODELS = tuple(MODEL_ROUTING.get("deep_thinking", ("gemini-2.0-flash", "deepseek/deepseek-r1:free")))
                FAST_OPERATIONS_MODELS = tuple(MODEL_ROUTING.get("fast_operations", ("gemini-2.0-flash", "meta-llama/llama-3.1-8b-instruct")))
                PROTECTED_AGENTS_FROM_CLEANUP = tuple(SYSTEM_CONFIG.get("protected_agents_from_cleanup", ("@maverick", "@chico")))
                HANDOFF_PIPELINE = SYSTEM_CONFIG.get("handoff_pipeline", {})
                WORKFLOW_FLAGS = SYSTEM_CONFIG.get("workflow_flags", {})
                ROUTING_HEURISTICS = SYSTEM_CONFIG.get("routing_heuristics", {})
                AGENT_SLA = SYSTEM_CONFIG.get("agent_sla", {})
                MODEL_HEALTH_GATE = SYSTEM_CONFIG.get("model_health_gate", {})
                PRIORITY_WEIGHTS = SYSTEM_CONFIG.get("priority_weights", {"alpha": 1.0, "beta": 1.5, "gamma": 0.5, "lambda_age": 0.01})
                _alt_raw = os.environ.get("OPENROUTER_ALTERNATIVE_MODELS", "")
                OPENROUTER_ALTERNATIVE_MODELS = tuple([m.strip() for m in _alt_raw.split(",") if m.strip()] + [m for m in SYSTEM_CONFIG.get("openrouter_alternatives", []) if str(m).strip()])
                HEURISTIC_THRESHOLD = SYSTEM_CONFIG.get("system_heuristics", {}).get("heuristic_threshold", 2)
                logging.info(f"[HOT-RELOAD] system_config.json. deep_thinking={DEEP_THINKING_MODELS}")
                # SOTA: Purga de Amnesia em RAM. Garante sincronia estrita de contexto com RAG.
                SYSTEM_PROMPT_CACHE.clear()
                if hasattr(_read_file_cached_internal, 'cache_clear'):
                    _read_file_cached_internal.cache_clear()
                return True
    except OSError:
        pass
    return False

def _reload_agents_manifest() -> bool:
    """Helper SOTA para gerenciar Hot Reload do manifesto de agentes."""
    global AGENTS_MANIFEST, INTENT_MAP, AGENT_ROUTING_MAP, AGENT_COLOR_MAP, VALID_AGENTS, AGENT_SOURCE
    manifest_path = _BASE_DIR / "data/agents_manifest.json"
    try:
        mtime = manifest_path.stat().st_mtime
        if _CONFIG_MTIME.get("agents_manifest") != mtime:
            new_manifest = load_json_config(manifest_path, {})
            _CONFIG_MTIME["agents_manifest"] = mtime
            if new_manifest:
                AGENT_SOURCE = "data/agents_manifest.json"
                AGENTS_MANIFEST = new_manifest
                _core_config.INTENT_MAP = {f"@{n}": {"pattern": d.get("routing_pattern", "")} for n, d in AGENTS_MANIFEST.items()}
                INTENT_MAP = _core_config.INTENT_MAP
                AGENT_ROUTING_MAP = {f"@{n}": d.get("model_preference", "fast_operations") for n, d in AGENTS_MANIFEST.items()}
                AGENT_COLOR_MAP = {f"@{n}": d.get("color", "white") for n, d in AGENTS_MANIFEST.items()}
                _core_config.VALID_AGENTS = list(INTENT_MAP.keys())
                VALID_AGENTS = _core_config.VALID_AGENTS
                logging.info(f"[HOT-RELOAD] agents_manifest.json. {len(VALID_AGENTS)} agentes.")
            else:
                logging.warning("[RESILIENCIA] Hot-reload detectou agents_manifest.json vazio. Acionando fallback via intentmap.json.")
                _core_config.INTENT_MAP = load_json_config(_BASE_DIR / "data/intentmap.json", {})
                INTENT_MAP = _core_config.INTENT_MAP
                AGENT_SOURCE = str(_BASE_DIR / "data/intentmap.json")
                AGENT_ROUTING_MAP = {agent: "fast_operations" for agent in INTENT_MAP.keys()}
                AGENT_COLOR_MAP = {agent: "white" for agent in INTENT_MAP.keys()}
                _core_config.VALID_AGENTS = list(INTENT_MAP.keys())
                VALID_AGENTS = _core_config.VALID_AGENTS
                AGENTS_MANIFEST = {name.lstrip('@'): {"pattern": data.get("pattern")} for name, data in INTENT_MAP.items()}
            _sync_runtime()
            # SOTA: Purga de Amnesia em RAM apos mutacao do manifesto.
            SYSTEM_PROMPT_CACHE.clear()
            if hasattr(_read_file_cached_internal, 'cache_clear'):
                _read_file_cached_internal.cache_clear()
            return True
    except OSError:
        pass
    return False

def _maybe_reload_config() -> bool:
    """
    Verifica se system_config.json ou agents_manifest.json foram modificados.
    """
    reloaded = False

    with _CONFIG_LOCK:
        c_reloaded = _reload_system_config()
        m_reloaded = _reload_agents_manifest()
        reloaded = c_reloaded or m_reloaded

    return reloaded

async def _maybe_reload_config_async() -> bool:
    """Delegador de IO Síncrono: Envolve o lock bloqueante e o acesso a disco em uma Thread separada."""
    return await asyncio.to_thread(_maybe_reload_config)

if not VALID_AGENTS:
    logging.critical("CRITICAL: agents_manifest.json nao encontrado ou vazio. O sistema nao tem consciencia de seus agentes.")
    sys.exit(1)

def _c(agent: str) -> str:
    return str(AGENT_COLOR_MAP.get(agent, 'white'))

def _feature_enabled(flag_name: str) -> bool:
    if flag_name in WORKFLOW_FLAGS:
        return bool(WORKFLOW_FLAGS.get(flag_name))
    return bool(DEFAULT_WORKFLOW_FLAGS.get(flag_name, False))

def _heuristic_terms(group_name: str) -> Dict[str, int]:
    configured_terms = ROUTING_HEURISTICS.get(group_name, {})
    return {str(k).lower(): int(v) for k, v in configured_terms.items()}

def _agent_sla_value(agent: str, key: str, default: int) -> int:
    agent_cfg = AGENT_SLA.get(agent, {})
    default_cfg = AGENT_SLA.get("default", {})
    if key in agent_cfg:
        return int(agent_cfg[key])
    if key in default_cfg:
        return int(default_cfg[key])
    return int(DEFAULT_AGENT_SLA.get(agent, {}).get(key, DEFAULT_AGENT_SLA["default"].get(key, default)))

def _health_gate_value(key: str, default: Any) -> Any:
    if key in MODEL_HEALTH_GATE:
        return MODEL_HEALTH_GATE.get(key)
    return DEFAULT_MODEL_HEALTH_GATE.get(key, default)


def _sync_runtime():
    """Sincroniza core.runtime com o estado atual do task_executor.
    Chamada no startup e em cada hot-reload para manter sub-módulos atualizados."""
    _runtime.VALID_AGENTS = VALID_AGENTS
    _runtime.OPENROUTER_ALTERNATIVE_MODELS = OPENROUTER_ALTERNATIVE_MODELS
    _runtime.AGENTS_MANIFEST = AGENTS_MANIFEST
    _runtime.AGENT_COLOR_MAP = AGENT_COLOR_MAP
    _runtime.AGENT_ROUTING_MAP = AGENT_ROUTING_MAP
    _runtime.DEEP_THINKING_MODELS = DEEP_THINKING_MODELS
    _runtime.FAST_OPERATIONS_MODELS = FAST_OPERATIONS_MODELS
    _runtime.SYSTEM_PROMPT_CACHE = SYSTEM_PROMPT_CACHE
    _runtime.TECHNICAL_AGENTS = TECHNICAL_AGENTS
    _runtime.SYSTEM_CONFIG = SYSTEM_CONFIG
    _runtime.HEURISTIC_THRESHOLD = HEURISTIC_THRESHOLD
    _runtime.HANDOFF_PIPELINE = HANDOFF_PIPELINE
    _runtime.PID_FILE = PID_FILE
    _runtime.get_rag = get_rag
    _runtime.get_rag_async = get_rag_async
    _runtime._maybe_reload_config = _maybe_reload_config
    _runtime._maybe_reload_config_async = _maybe_reload_config_async
    _runtime._feature_enabled = _feature_enabled
    _runtime._heuristic_terms = _heuristic_terms
    _runtime._agent_sla_value = _agent_sla_value
    _runtime._health_gate_value = _health_gate_value
    _runtime._c = _c

# SOTA: Alocacao estatica para evitar reconstrucao do objeto a cada chamada (Economia Generalizada)
ROUTING_HEURISTICS_MAPPING = [
    ("domain_terms", "@validador", {"icm": 3, "gto": 3, "nash": 3, "ev": 2, "roi": 2, "matemat": 2, "calculo": 2, "poker": 2, "jurid": 1, "medic": 1, "financ": 1, "datascience": 2, "psychology": 1, "philosophy": 1, "filosofia": 1, "ciencia": 1, "science": 1, "rp": 2, "bf": 2, "bayes": 2}),
    ("curator_terms", "@curator", {"estetica": 3, "estética": 3, "ux": 2, "ui": 2, "copywriting": 3, "copy": 2, "design": 2, "voz": 2, "tom": 2, "texto": 1}),
    ("security_terms", "@securitychief", {"auth": 3, "autentic": 3, "token": 2, "rbac": 3, "cors": 2, "secret": 3, "chave": 2, "vazamento": 3, "seguranca": 3, "privacy": 3, "compliance": 2, "ethics": 1}),
    ("research_terms", "@pesquisador", {"pesquisa": 2, "research": 2, "benchmark": 3, "mercado": 2, "competidor": 2, "fonte": 1, "referencia": 1, "web": 1, "sota": 3}),
    ("backend_terms", "@implementor", {"banco de dados": 3, "database": 3, "sql": 3, "sqlite": 3, "prisma": 3, "backend": 3, "back-end": 3, "api": 2, "endpoint": 2, "query": 2, "script": 1, "python": 2})
]

def _apply_routing_heuristics(desc_lower: str, metadata: dict) -> Tuple[Optional[str], int]:
    """Despacho padronizado das regras de inferencia semantica."""
    for group_name, agent_target, fallback_dict in ROUTING_HEURISTICS_MAPPING:
        terms = _heuristic_terms(group_name) or fallback_dict
        score = sum(weight for term, weight in terms.items() if term in desc_lower)
        if score >= HEURISTIC_THRESHOLD:
            logging.info(f"[ROUTING SOTA] Heuristica de '{group_name}' atingida (score: {score}). Roteando proativamente para {agent_target}.")
            return agent_target, score
    return None, 0

def _scan_and_validate_context(description: str, base_dir: Path) -> List[str]:
    """SOTA: Gate de Contexto Inicial (Anti-Alucinacao). Valida integridade fisica dos arquivos citados na porta de entrada."""
    missing_files = []
    file_pattern = re.compile(r'\b[\w\-\.\/\\\\]+\.(?:md|py|ps1|ts|tsx|json|html)\b', re.IGNORECASE)
    potential_files = file_pattern.findall(description)

    for pf in set(potential_files):
        if len(pf) < 4 or "node_modules" in pf.lower():
            continue
        try:
            target_path = (base_dir / pf).resolve()
            if target_path.is_relative_to(base_dir) and not target_path.exists():
                missing_files.append(pf)
        except Exception:
            pass
    return missing_files

# SOTA: Roteamento Semântico e Auto-Escalonamento
def _intelligent_route_task(description: str, explicit_agent: Optional[str] = None) -> Tuple[str, Dict[str, Any]]:
    """
    Intercepta o roteamento para aplicar a Lei da Fricção Zero.
    """
    metadata = {}

    # SOTA: Principio da Realidade Contextual - Inspecao Antecipada de CORTEX SHIELD
    missing_dependencies = _scan_and_validate_context(description, _BASE_DIR)
    if missing_dependencies:
        metadata["missing_context"] = missing_dependencies
        logging.warning(f"[CORTEX SHIELD] Arquivos ausentes detectados no roteamento: {missing_dependencies}. Entropia prevenida.")
        if explicit_agent not in ["@maverick", "@chico", "@organizador"]:
            metadata["cortex_block_warning"] = True

    # SOTA: Degradação Graciosa baseada na Saúde do Budget (Mitigação de pending_keys_exhausted)
    try:
        # SOTA: Avaliacao sincrona em memoria (Friccao Zero) para mitigar erro de tipagem/asyncio loop
        total_keys = max(1, len(GEMINI_ALL_KEYS))
        total_starvation = sum(limiter.starvation_events for limiter in _RATE_LIMITERS.values())
        keys_critical = (len(KEY_BLOCKLIST) / total_keys > 0.75) or (total_starvation > 15)
    except Exception:
        keys_critical = False

    # SOTA: Avaliacao preguicosa (Lazy Evaluation) para contencao de alocacao desnecessaria
    if explicit_agent not in ["@dispatcher", "@architect", "@maverick"]:
        complexity_score = len(description.split())
        is_epic = any(keyword in description.lower() for keyword in ["épico", "epico", "sistema inteiro", "arquitetura", "refatorar tudo", "módulo completo"])
        if complexity_score > 150 or is_epic:
            logging.warning(f"[ROUTING SOTA] Tarefa muito complexa detectada ({complexity_score} palavras). Interceptando e roteando para @dispatcher com @maverick de observador.")
            if not keys_critical:
                metadata["observers"] = ["@maverick"]
            else:
                logging.warning("[BUDGET SOTA] Exaustão de chaves crítica. Observador @maverick suprimido para priorizar Fricção Zero do @dispatcher.")
            return "@dispatcher", metadata

    if not explicit_agent or explicit_agent not in VALID_AGENTS:
        desc_lower = description.lower()
        heuristic_agent, heuristic_score = _apply_routing_heuristics(desc_lower, metadata)
        if heuristic_agent:
            metadata['heuristic_score'] = heuristic_score
            return heuristic_agent, metadata

    if explicit_agent == "@implementor":
        desc_lower = description.lower()
        frontend_terms = {"react": 3, "next.js": 3, "frontend": 3, "ui": 2, "ux": 2, "tailwind": 2, "componente": 1, "estilo": 2, "css": 2, "layout": 1}
        frontend_score = sum(weight for term, weight in frontend_terms.items() if term in desc_lower)
        if frontend_score >= HEURISTIC_THRESHOLD:
            if not keys_critical:
                metadata.setdefault("observers", []).append("@curator")
                logging.info(f"[ROUTING SOTA] Front-end detectado (score {frontend_score}). Anexando @curator como Sentinela Estético.")
            else:
                logging.warning(f"[BUDGET SOTA] Front-end detectado, mas chaves próximas à exaustão. Sentinela @curator suprimido para garantir materialização pelo @implementor.")

    if explicit_agent and explicit_agent in VALID_AGENTS:
        return explicit_agent, metadata

    return "@dispatcher", metadata

# Sincronização inicial (cold start)
_sync_runtime()

# ==========================================
# YIELD DINAMICO E CONTROLE DE FILA SOTA
# ==========================================
class DynamicYieldManager:
    """
    Implementa a sugestao do @sequenciador:
    Yield dinamico para tarefas que falham repetidamente por dependencias lentas.
    Usa backoff exponencial e alerta o @chico em caso de starvation/deadlock.
    """
    def __init__(self):
        self.blocked_tasks: Dict[str, int] = {}
        self.exhausted_tasks: Dict[str, int] = {}
        self.max_yield_seconds = 300.0  # 5 minutos de teto

    async def apply_yield(self, task: Task, manager: QueueManager) -> float:
        attempts = self.blocked_tasks.get(task.id, 0) + 1
        self.blocked_tasks[task.id] = attempts

        # Backoff exponencial SOTA: 2^attempts, limitado ao max_yield_seconds
        yield_time = min(float(2 ** attempts), self.max_yield_seconds)

        logging.info(f"[[{_c(task.agent)}]{task.agent}[/]] Yield Dinamico ativado para {task.id}. Aguardando dependencias por {yield_time}s (Tentativa {attempts}).")

        # Se atingiu o teto e continua bloqueada, aciona o @chico (Arbitragem de Deadlock)
        if yield_time >= self.max_yield_seconds and attempts % 3 == 0:
            logging.warning(f"[STARVATION] Tarefa {task.id} em deadlock aparente. Acionando @chico para intervencao.")
            alert_task = Task(
                id=f"DEADLOCK-{int(time.time())}",
                description=f"A tarefa {task.id} (Agente: {task.agent}) esta sofrendo starvation devido a dependencias lentas ou nao resolvidas (Tentativa {attempts}). Arbitrar fila e resolver possivel deadlock.",
                agent="@chico",
                status="pending",
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"priority": "high", "blocked_task": task.id}
            )
            await manager.add_task(alert_task)

        return yield_time

    async def apply_exhaustion_yield(self, task: Task, manager: QueueManager) -> float:
        """SOTA: Backoff exponencial agressivo para tarefas bloqueadas por pending_keys_exhausted."""
        # --- FASE 4: HIBERNACAO TATICA ---
        # Se a maioria das chaves estiver bloqueada, entramos em modo de preservacao sistemica.
        total_keys = len(GEMINI_ALL_KEYS_WITH_POOLS)
        blocked_keys = len(KEY_BLOCKLIST)
        exhaustion_ratio = blocked_keys / total_keys if total_keys > 0 else 1.0

        if exhaustion_ratio > 0.9:
            hibernation_time = 300.0 # 5 minutos
            hibernation_until = datetime.now() + timedelta(seconds=hibernation_time)
            await manager.set_system_state("hibernation_until", hibernation_until.isoformat())
            logging.critical(f"[BUDGET] HIBERNACAO TATICA SOTA ACIONADA. Exaustao de {blocked_keys}/{total_keys} chaves. Sistema em pausa por {hibernation_time}s.")
            send_toast("[CRITICAL] Hibernacao Tatica SOTA", f"Exaustao de {blocked_keys}/{total_keys} chaves. Sistema em pausa por 5 minutos.", "error")
            return hibernation_time

        attempts = self.exhausted_tasks.get(task.id, 0) + 1
        self.exhausted_tasks[task.id] = attempts

        # Backoff agressivo de resfriamento: 10s, 20s, 40s... Teto de 10 minutos (600s)
        yield_time = min(float(10 * (2 ** (attempts - 1))), 600.0)

        logging.warning(f"[[{_c(task.agent)}]{task.agent}[/]] API Exhaustion Shield ativado para {task.id}. Resfriando rota por {yield_time}s (Tentativa {attempts}).")
        return yield_time

    def clear_yield(self, task_id: str):
        """Limpa o registro de yield quando a tarefa finalmente resolve suas dependencias."""
        self.blocked_tasks.pop(task_id, None)
        self.exhausted_tasks.pop(task_id, None)

global_yield_manager = DynamicYieldManager()

if __name__ == "__main__":
    try:
        # Hook de Roteamento Semântico SOTA via CLI para o do.ps1
        if len(sys.argv) >= 3 and sys.argv[1] == "route-task":
            desc = sys.argv[2]
            explicit = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3].strip() else None
            agent, meta = _intelligent_route_task(desc, explicit)
            print(json.dumps({"agent": agent, "metadata": meta}))
            sys.exit(0)

        if len(sys.argv) >= 2 and sys.argv[1] == "test-hibernation":
            from llm.budget import KEY_BLOCKLIST, GEMINI_ALL_KEYS_WITH_POOLS, _key_identifier
            from datetime import datetime, timedelta
            for k in GEMINI_ALL_KEYS_WITH_POOLS:
                KEY_BLOCKLIST[_key_identifier("gemini", k['key'])] = datetime.now() + timedelta(minutes=5)
            print("[CHAOS ENGINEERING] Todas as chaves foram bloqueadas artificialmente (Dry-Run).")
            print("Verifique os logs do Worker. A Hibernacao Tatica devera ser acionada no proximo disparo de tarefa.")
            sys.exit(0)

        from cli.commands import run_cli
        run_cli(sys.argv)

    except Exception as e:
        import traceback
        traceback.print_exc()
        input("\n[FALHA FATAL] Ocorreu um erro catastrofico na inicializacao. Pressione Enter para fechar a janela...")
        sys.exit(1)
