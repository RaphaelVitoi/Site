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
from aiohttp import web
import logging
import asyncio
import shutil
from functools import lru_cache
import ssl
import certifi
import functools
import gc
import unicodedata
import aiosqlite
import sqlite3
from pathlib import Path
from typing import List, Optional, Literal, Dict, Any, Tuple
from pydantic import BaseModel, Field, ValidationError, field_validator
from core.schemas import Task
from database.queue_manager import QueueManager
from datetime import datetime, timedelta
from rich.logging import RichHandler
from rich.console import Console
from rich.panel import Panel
from rich.status import Status
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, TimeElapsedColumn, TextColumn
from rich.table import Table

def enforce_pure_ascii(text: str) -> str:
    """Purificacao absoluta SOTA: Erradica emojis, acentos e caracteres especiais, forcando Pure ASCII."""
    if not text: return ""
    replacements = {
        '“': '"', '”': '"', '‘': "'", '’': "'", '–': '-', '—': '-', '…': '...',
        'º': 'o', 'ª': 'a', 'ç': 'c', 'Ç': 'C', 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'ã': 'a', 'õ': 'o', 'Ã': 'A', 'Õ': 'O',
        'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u', 'Â': 'A', 'Ê': 'E', 'Î': 'I', 'Ô': 'O', 'Û': 'U',
        'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u', 'À': 'A', 'È': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
        '”': '"', '“': '"', '’': "'", '‘': "'"
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Destroi qualquer byte nao-ASCII restante
    return unicodedata.normalize('NFKD', str(text)).encode('ASCII', 'ignore').decode('ASCII')

# Arquivo para armazenar o Process ID do worker para parada graciosa

PID_FILE = Path(__file__).parent / ".nexus_worker.pid"

# Carregamento Lazzy do RAG para evitar overhead no db-add

rag_engine = None
def get_rag():
    global rag_engine
    if rag_engine is None:
        from memory_rag import MemoryRAG
        rag_engine = MemoryRAG()
    return rag_engine

# Configuracao estetica e persistente de Log (Estado da Arte)

# Use Rich Progress for cleaner UI (Chico)

console_progress = Progress(
    SpinnerColumn(),
    TimeElapsedColumn(),
    TextColumn("[bold blue]{task.description}[/]")
)

task_progress_id = None

console = Console()
log_dir = Path(".claude/logs")
log_dir.mkdir(parents=True, exist_ok=True)
archive_dir = Path(".claude/.archive")
archive_dir.mkdir(parents=True, exist_ok=True)
log_level = os.environ.get("LOG_LEVEL", "INFO").upper()  # Obtem o nível de log da variável de ambiente
logger = logging.getLogger()
logger.setLevel(getattr(logging, log_level, logging.INFO))
logger.propagate = False # Impede que logs subam para o logger raiz

# SOTA: Garante que os handlers nao sejam duplicados em reloads do worker

if not logger.handlers:
    # Handler visual interativo para o administrador do sistema
    rich_handler = RichHandler(
        console=console,
        rich_tracebacks=True,
        markup=True,
        show_path=False,
        tracebacks_show_locals=True # Expansão de debug
    )
    rich_handler.setFormatter(logging.Formatter("%(message)s", datefmt="[%X]"))
    logger.addHandler(rich_handler)

    # Handler persistente para auditoria e recuperação de desastres (Disaster Recovery)
    import logging.handlers
    rotating_handler = logging.handlers.RotatingFileHandler(
        log_dir / "task_executor.log",
        maxBytes=1024*1024*10, # Expandido para 10MB para reter mais histórico SOTA
        backupCount=10,
        encoding="utf-8"
    )
    rotating_handler.setFormatter(logging.Formatter("%(asctime)s - [%(levelname)s] - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"))
    logger.addHandler(rotating_handler)

# =================================================

# ORCAMENTO COGNITIVO E HIBERNACAO (Logistica SOTA)

# =================================================

DAILY_API_BUDGET = 5000 # Escala massiva liberada (Orquestracao SOTA)

class APIBudgetExhaustedError(Exception):
    """Excecao customizada para quando o orcamento de API e esgotado."""

    pass

class APIKeysExhaustedError(Exception):
    """Excecao disparada quando o pool de chaves SOTA esgota, exigindo preservacao da tarefa."""
    pass

# =================================================

# OTIMIZACOES DE PERFORMANCE (Cache SOTA)

# =================================================

def _load_env_keys() -> Dict[str, str]:
    """Lê chaves de forma implacavel de_env.ps1 ou .env para garantir operacao SOTA."""
    keys = {}
    base_dir = Path(__file__).parent.resolve()
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        match = re.search(r'(?:\:|$)?([a-zA-Z0-9_]+)\s*[:=]\s*[\'"]?[[^\'"\s#]+](\'")?', line)
                        if match:
                            keys[match.group(1)] = match.group(2).strip()
            except Exception as e:
                logging.warning(f"Aviso ao ler {file_name}: {e}")
    return keys

# Caches para otimização de performance

SYSTEM_PROMPT_CACHE: Dict[str, str] = {}
AUTONOMY_MODE_CACHE = {"mode": "off", "timestamp": 0.0}

# Carregamento unico das chaves de API para evitar I/O repetitivo

ENV_KEYS =_load_env_keys()
ALL_ENV_VARS = {**os.environ,**ENV_KEYS}

def _is_real_key_value(value: str) -> bool:
    if not value:
        return False
    v = value.strip()
    invalid_prefixes = (":", "${", "sk-REPLACE", "SUA_KEY", "COLE_SUA_KEY")
    if any(v.startswith(prefix) for prefix in invalid_prefixes):
        return False

    # SOTA: Expurgacao Definitiva de Chaves Fantasmas/Revogadas do SO
    invalid_suffixes = ("XfUE",)
    if any(v.endswith(suffix) for suffix in invalid_suffixes):
        return False

    return True

def _collect_keys(prefixes: tuple, exclude_prefixes: tuple = ()) -> List[str]:
    keys: List[str] = []
    for k, v in ALL_ENV_VARS.items():
        key_name = k.upper()
        if not _is_real_key_value(v):
            continue
        if any(key_name.startswith(ex) for ex in exclude_prefixes):
            continue
        if any(key_name.startswith(pf) for pf in prefixes):
            keys.append(v)
    return list(dict.fromkeys(keys))

GEMINI_PRO_KEYS = _collect_keys(("GEMINI_PRO", "GOOGLE_PRO"))
GEMINI_FLASH_KEYS = _collect_keys(("GEMINI_FLASH", "GOOGLE_FLASH"))
GEMINI_KEYS =_collect_keys(
    ("GEMINI", "GOOGLE"),
    exclude_prefixes=("GEMINI_CLI", "GEMINI_PRO", "GOOGLE_PRO", "GEMINI_FLASH", "GOOGLE_FLASH"),
)

# Pool total para auditorias/telemetria

GEMINI_ALL_KEYS = list(dict.fromkeys(GEMINI_PRO_KEYS + GEMINI_FLASH_KEYS + GEMINI_KEYS))
ANTHROPIC_KEYS = list(dict.fromkeys([
    v for k, v in ALL_ENV_VARS.items() if _is_real_key_value(v) and k.upper().startswith("ANTHROPIC")
]))
OPENROUTER_KEYS = list(dict.fromkeys([
    v for k, v in ALL_ENV_VARS.items()
    if_is_real_key_value(v) and (k.upper().startswith("OPENROUTER") or k.upper().startswith("DEEPSEEK") or k.upper().startswith("LLAMA"))
    and "MODELS" not in k.upper()
    and "," not in v
    and "/" not in v
]))
TAVILY_KEYS = _collect_keys(("TAVILY",))
PERPLEXITY_KEYS =_collect_keys(("PERPLEXITY",))
API_SECRET_TOKEN = ALL_ENV_VARS.get("API_SECRET_TOKEN", "")

# Cache para resultados da WebSearch

web_search_cache: Dict[str, Tuple[str, float]] = {}

# Tempo de vida do cache em segundos (ex: 3600 = 1 hora)

# SOTA: Cache de 1 hora para evitar chamadas redundantes e economizar API

# Em um ambiente de alta velocidade, pode ser reduzido para 5-15 minutos

# Para o @pesquisador, um cache mais longo e aceitavel

# Para o @maverick, um cache mais curto pode ser preferivel

WEB_SEARCH_CACHE_TTL = 3600

# Circuit breaker para chaves bloqueadas temporariamente

KEY_BLOCK_DURATION = timedelta(minutes=15)
GEMINI_MODEL_KEY_BLOCK_DURATION = timedelta(minutes=int(os.environ.get("GEMINI_MODEL_KEY_BLOCK_MINUTES", "45")))

# Add a rate limit variable to the ENV

MAX_CALLS_PER_MINUTE = int(os.environ.get("MAX_CALLS_PER_MINUTE", "30")) # SOTA: Aumentado para 30 RPM devido a velocidade de latencia do 2.5 Flash
KEY_BLOCKLIST: Dict[str, datetime] = {}
GEMINI_MODEL_KEY_BLOCKLIST: Dict[str, datetime] = {}
ROUTE_COOLDOWN_DURATION = timedelta(minutes=int(os.environ.get("ROUTE_COOLDOWN_MINUTES", "5")))
ROUTE_FAILURE_THRESHOLD = int(os.environ.get("ROUTE_FAILURE_THRESHOLD", "3"))
DEEPSEEK_ROUTE_COOLDOWN_DURATION = timedelta(minutes=int(os.environ.get("DEEPSEEK_ROUTE_COOLDOWN_MINUTES", "10")))
DEEPSEEK_ROUTE_FAILURE_THRESHOLD = int(os.environ.get("DEEPSEEK_ROUTE_FAILURE_THRESHOLD", "1"))
ROUTE_BLOCKLIST: Dict[str, datetime] = {}
ROUTE_FAILURE_COUNTS: Dict[str, int] = {}
COMPRESSION_CIRCUIT_BREAKER = {"consecutive_failures": 0, "last_failure": 0.0}

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

def _gemini_model_key_identifier(model: str, key: str) -> str:
    return f"gemini:{model}:{key}"

def _is_gemini_model_key_blocked(model: str, key: str) -> bool:
    block_id = _gemini_model_key_identifier(model, key)
    expiry = GEMINI_MODEL_KEY_BLOCKLIST.get(block_id)
    if expiry:
        if expiry > datetime.now():
            return True
        GEMINI_MODEL_KEY_BLOCKLIST.pop(block_id, None)
    return False

def _block_gemini_model_key(model: str, key: str):
    block_id =_gemini_model_key_identifier(model, key)
    GEMINI_MODEL_KEY_BLOCKLIST[block_id] = datetime.now() + GEMINI_MODEL_KEY_BLOCK_DURATION

def _gemini_key_pool_for_model(model: str) -> List[str]:
    model_l = str(model).lower()
    if "pro" in model_l:
        return list(dict.fromkeys(GEMINI_PRO_KEYS + GEMINI_KEYS + GEMINI_FLASH_KEYS))
    if "flash" in model_l:
        return list(dict.fromkeys(GEMINI_FLASH_KEYS + GEMINI_KEYS + GEMINI_PRO_KEYS))
    return list(dict.fromkeys(GEMINI_KEYS + GEMINI_PRO_KEYS + GEMINI_FLASH_KEYS))

def _is_semantic_gemini_error(err: Exception) -> bool:
    msg = str(err).lower()
    semantic_markers = (
        "http 400", "http 401", "http 403", "http 404", "http 429",
        "permission_denied", "not_found", "unsupported", "quota", "rate limit",
    )
    return any(marker in msg for marker in semantic_markers)

def _route_identifier(provider: str, model: str) -> str:
    return f"{provider}:{model}"

def _is_route_blocked(route_key: str) -> bool:
    expiry = ROUTE_BLOCKLIST.get(route_key)
    if expiry:
        if expiry > datetime.now():
            return True
        ROUTE_BLOCKLIST.pop(route_key, None)
    return False

def _register_route_success(route_key: str):
    ROUTE_FAILURE_COUNTS.pop(route_key, None)
    ROUTE_BLOCKLIST.pop(route_key, None)

def _register_route_failure(route_key: str):
    count = ROUTE_FAILURE_COUNTS.get(route_key, 0) + 1
    ROUTE_FAILURE_COUNTS[route_key] = count
    threshold = ROUTE_FAILURE_THRESHOLD
    cooldown = ROUTE_COOLDOWN_DURATION
    if "deepseek/" in route_key.lower():
        threshold = DEEPSEEK_ROUTE_FAILURE_THRESHOLD
        cooldown = DEEPSEEK_ROUTE_COOLDOWN_DURATION
    if count >= threshold:
        ROUTE_BLOCKLIST[route_key] = datetime.now() + cooldown

def _key_fingerprint(provider: str, key: str) -> str:
    digest = hashlib.sha256(f"{provider}:{key}".encode("utf-8")).hexdigest()
    return digest[:24]

def _score_key_from_stats(stats: Dict[str, Any]) -> float:
    attempts = stats.get("attempts", 0) or 0
    successes = stats.get("successes", 0) or 0
    failures = stats.get("failures", 0) or 0
    avg_latency_ms = stats.get("avg_latency_ms")

    # Economia Generalizada: maximiza confiabilidade/latencia e minimiza retrabalho.
    if attempts == 0:
        return 50.0
    success_rate = successes / attempts if attempts else 0.0
    latency_penalty = min((avg_latency_ms or 1200.0) / 2000.0, 1.5)
    failure_penalty = min(failures * 0.15, 1.5)
    return (success_rate * 100.0) - (latency_penalty * 15.0) - (failure_penalty * 10.0)

async def _rank_keys_by_health(provider: str, keys: List[str], manager: QueueManager) -> List[str]:
    ranked = []
    for idx, key in enumerate(keys):
        key_hash =_key_fingerprint(provider, key)
        stats = await manager.get_key_recent_stats(provider, key_hash, window_minutes=180)
        score = _score_key_from_stats(stats)
        ranked.append((score, idx, key))

    # score desc; desempate preserva ordem original do pool
    ranked.sort(key=lambda x: (-x[0], x[1]))
    return [item[2] for item in ranked]

class AsyncTokenBucket:
    """
    Implementacao SOTA de Rate Limiter (Token Bucket) em ambiente estritamente assincrono.
    Controla o fluxo sanguineo do sistema (chamadas de API), garantindo que a entropia
    causada por HTTP 429 (Too Many Requests) seja extirpada pela raiz.
    """
    def __init__(self, capacity: int, fill_rate_per_minute: int):
        self.capacity = capacity
        self.tokens = float(capacity)
        self.fill_rate_per_sec = fill_rate_per_minute / 60.0
        self.last_fill = time.monotonic()
        self.lock = asyncio.Lock()
        self.starvation_events = 0 # Telemetria interna de exaustao

    async def consume(self, tokens: int = 1):
        async with self.lock:
            while True:
                now = time.monotonic()
                elapsed = now - self.last_fill
                self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate_per_sec)
                self.last_fill = now

                if self.tokens >= tokens:
                    self.tokens -= tokens
                    return

                self.starvation_events += 1
                deficit = tokens - self.tokens
                wait_time = deficit / self.fill_rate_per_sec
                logging.debug(f"[Rate Limiter] Starvation detectado. Aguardando {wait_time:.2f}s para {tokens} tokens.")
                await asyncio.sleep(wait_time)

    def get_metrics(self) -> dict:
        return {
            "current_tokens": round(self.tokens, 2),
            "capacity": self.capacity,
            "starvation_events": self.starvation_events
        }

global_rate_limiter = AsyncTokenBucket(capacity=MAX_CALLS_PER_MINUTE, fill_rate_per_minute=MAX_CALLS_PER_MINUTE)
DO_PS1_PATH = Path(__file__).parent.resolve() / "do.ps1"
DO_PS1_THRESHOLD = int(os.environ.get("DO_PS1_THRESHOLD", "5"))

# =================================================

# FIM DAS OTIMIZACOES DE PERFORMANCE

# =================================================

# ==========================================

# 1. SCHEMAS (A Lei da Honestidade Radical)

# ==========================================

def load_json_config(file_path: Path, default_value: Any = None) -> Any:
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                # Blindagem Extra (Seguranca SOTA): Prevenir contra Path Traversal
                if ".." in str(file_path):
                    logging.critical(f"[SEC] Caminho suspeito detectado. Operacao abortada.")
                    return default_value
                content = f.read()
                content = content.lstrip('\ufeff')
                return json.loads(content)
        except (json.JSONDecodeError, IOError) as e:
            logging.error(f"Falha ao carregar ou parsear {file_path}: {e}")
    return default_value

# --- Carregamento Dinamico da Consciencia do Sistema ---

AGENTS_MANIFEST = load_json_config(Path("data/agents_manifest.json"), {})

# Construcao dinamica do INTENT_MAP e AGENT_ROUTING_MAP a partir do Manifesto

INTENT_MAP = {f"@{name}": {"pattern": data.get("routing_pattern", "")} for name, data in AGENTS_MANIFEST.items()}
AGENT_ROUTING_MAP = {f"@{name}": data.get("model_preference", "fast_operations") for name, data in AGENTS_MANIFEST.items()}
AGENT_COLOR_MAP = {f"@{name}": data.get("color", "white") for name, data in AGENTS_MANIFEST.items()}
VALID_AGENTS = list(INTENT_MAP.keys())

ROUTING_MAP = load_json_config(Path("data/routing_map.json"), {})
AGENT_ROUTING_MAP.update(ROUTING_MAP.get("agent_map", {}))

SYSTEM_CONFIG = load_json_config(Path("data/system_config.json"), {})
MODEL_ROUTING = SYSTEM_CONFIG.get("model_routing", ROUTING_MAP)
DEFAULT_GEMINI_FAST_MODEL = os.environ.get("DEFAULT_GEMINI_FAST_MODEL", "gemini-2.5-flash")
DEEP_THINKING_MODELS = tuple(MODEL_ROUTING.get("deep_thinking", ("gemini-2.5-pro", "deepseek/deepseek-r1:free")))
FAST_OPERATIONS_MODELS = tuple(MODEL_ROUTING.get("fast_operations", ("gemini-2.5-flash", "meta-llama/llama-3.1-8b-instruct")))
PROTECTED_AGENTS_FROM_CLEANUP = tuple(SYSTEM_CONFIG.get("protected_agents_from_cleanup", ("@maverick", "@chico")))
HANDOFF_PIPELINE = SYSTEM_CONFIG.get("handoff_pipeline", {})
WORKFLOW_FLAGS = SYSTEM_CONFIG.get("workflow_flags", {})
ROUTING_HEURISTICS = SYSTEM_CONFIG.get("routing_heuristics", {})
AGENT_SLA = SYSTEM_CONFIG.get("agent_sla", {})
MODEL_HEALTH_GATE = SYSTEM_CONFIG.get("model_health_gate", {})

_alt_models_raw = os.environ.get("OPENROUTER_ALTERNATIVE_MODELS", "")
OPENROUTER_ALTERNATIVE_MODELS = tuple(
    [m.strip() for m in_alt_models_raw.split(",") if m.strip()]
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
TECHNICAL_AGENTS = tuple(SYSTEM_HEURISTICS.get("technical_agents", ["@implementor", "@verifier", "@skillmaster", "@organizador", "@sequenciador"]))
DEFAULT_ROUTING_HEURISTICS = {
    "research_terms": {"pesquisa": 2, "research": 2, "benchmark": 3, "mercado": 2, "competidor": 2, "fonte": 1, "referencia": 1, "web": 1, "sota": 3},
    "strategic_terms": {"estrateg": 3, "roadmap": 2, "visao": 2, "tradeoff": 2, "produto": 1, "governanca": 1, "hipotese": 2, "cenario": 1},
    "security_terms": {"auth": 3, "autentic": 3, "token": 2, "rbac": 3, "cors": 2, "secret": 3, "chave": 2, "vazamento": 3, "seguranca": 3, "privacy": 3, "compliance": 2, "ethics": 1},
    "domain_terms": {
        "icm": 3, "gto": 3, "nash": 3, "ev": 2, "roi": 2, "matemat": 2, "calculo": 2, "poker": 2,
        "jurid": 1, "medic": 1, "financ": 1, "datascience": 2, "psychology": 1, "filosophy": 1, "cience": 1,
        "rp": 2, "bf": 2, "bayes": 2
    },
    "web_infra_terms": {
        "next.js": 3, "react": 3, "frontend": 2, "backend": 2, "ui": 1, "ux": 1, "web": 1, "componente": 1, "gamificacao": 2
    },
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
    "protect_models": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.1-flash", "gemini-3.1-pro"],
}

if not VALID_AGENTS:
    logging.critical("CRITICAL: agents_manifest.json nao encontrado ou vazio. O sistema nao tem consciencia de seus agentes.")
    sys.exit(1)

def _c(agent: str) -> str:
    return AGENT_COLOR_MAP.get(agent, 'white')

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

"""
Definição do schema para a classe Task, garantindo a estrutura de dados utilizada no sistema.
"""
class LegacyTask(BaseModel):
    id: str

    description: str
    status: Literal["pending", "running", "completed", "failed", "cancelled"] = "pending"
    timestamp: str
    agent: str = Field(..., pattern=r"^@[\w]+$")
    completedAt: Optional[str] = None
    model: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator('agent')
    @classmethod
    def validate_agent_existence(cls, v: str) -> str:
        if v not in VALID_AGENTS:
            raise ValueError(f"Agente desconhecido: {v}")
        return v

class DispatcherSubtask(BaseModel):
    description: str = Field(min_length=5)
    agent: str = Field(..., pattern=r"^@[\w]+$")
    depends_on: List[int] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("agent", mode="before")
    @classmethod
    def validate_known_agent(cls, v: str) -> str:
        if not isinstance(v, str) or not v.startswith("@"):
            return "@implementor"
        if v not in VALID_AGENTS:
            return "@implementor"
        return v

    @field_validator("depends_on")
    @classmethod
    def validate_depends_on(cls, deps: List[int]) -> List[int]:
        if any(idx < 0 for idx in deps):
            raise ValueError("depends_on nao pode conter indices negativos.")
        return deps

# ==========================================

# 2.5 O MOTOR COGNITIVO (API Integration)

# ==========================================

_global_http_session: Optional[aiohttp.ClientSession] = None
API_CONCURRENCY_SEMAPHORE = asyncio.Semaphore(2) # SOTA: Estrangulamento tatico para prevenir Drop TCP (Layer 7 Throttling)

async def get_global_http_session() -> aiohttp.ClientSession:
    global_global_http_session
    if _global_http_session is None or_global_http_session.closed:
        # SOTA: Bypass de TLS Fingerprinting. Usa o contexto padrao sem desabilitar protocolos modernos.
        # As opcoes ssl.OP_NO_TLSv1 e ssl.OP_NO_TLSv1_1 estao depreciadas e podem ser removidas.
        ssl_context = ssl.create_default_context(cafile=certifi.where())

        # SOTA: Forca o uso de IPv4 e ativa o Connection Pooling (limite de 100 conexoes)
        connector = aiohttp.TCPConnector(
            ssl=ssl_context,
            family=socket.AF_INET,
            limit=100,
            limit_per_host=15,
            keepalive_timeout=30,
            enable_cleanup_closed=True
        )

        # SOTA: Mimetizacao de Navegador Padrao (Impede o WAF do Google/OpenRouter de derrubar o socket)
        default_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Connection": "keep-alive"
        }

        _global_http_session = aiohttp.ClientSession(trust_env=True, connector=connector, headers=default_headers)
    return _global_http_session

FALLBACK_MODEL = "gemini-2.0-flash"
@lru_cache(maxsize=32)
def _read_file_with_cache(file_path: Path) -> Optional[str]:
    """Le um arquivo e armazena seu conteudo em cache. Retorna None se o arquivo nao existir."""
    if not file_path.is_file():
        return None
    try:
        # Blindagem Extra (Seguranca SOTA): Prevenir contra Path Traversal
        if ".." in file_path.as_posix():
            logging.critical(f"[SEC] Caminho suspeito detectado no cache. Operacao abortada.")
            return None
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        logging.warning(f"Cache Read Fail: Nao foi possivel ler {file_path}: {e}")
    return None

def get_agent_system_prompt(agent_name: str) -> str:
    """
    Compila a Omnisciencia Sistemica.
    Funde as Instrucoes Globais, o Manual, o Indice Mestre e a Identidade do Agente.
    Utiliza cache para evitar releitura de arquivos.
   """

    is_technical_agent = agent_name in TECHNICAL_AGENTS

    system_prompt_parts = []

    def add_to_prompt(title, content):
        if content:
            system_prompt_parts.append(f"=== {title} ===\n{content}\n\n")
    agent_clean = agent_name.replace("@", "")


    # 1. Base Global (A Alma do Sistema)
    global_content = _read_file_with_cache(Path(".claude/GLOBAL_INSTRUCTIONS.md"))
    add_to_prompt("INSTRUCOES GLOBAIS", global_content)


    # 2. Leis de Orquestracao e Topologia (O Manual e o Mapa)
    infra_ctx = ""
    successfully_read_files = []

    philosophical_docs = {
        "ARQUITETURA DE REFERENCIA SOTA (FONTE DA VERDADE)",
        "COSMOVISAO FILOSOFICA (GUIA ETICO/INTELECTUAL)",
        "IDENTIDADE DO USUARIO",
        "LIDERANCA E GOVERNANCA",
        "TEMPLO DO APRENDIZADO GENERATIVO"
    }
    for doc_name, doc_paths in [
        ("COSMOVISAO FILOSOFICA (GUIA ETICO/INTELECTUAL)", [".claude/COSMOVISAO.md"]),
        ("ARQUITETURA DE REFERENCIA SOTA (FONTE DA VERDADE)", ["docs/SOTA_REFERENCE_ARCHITECTURE.md"]),
        ("MANIFESTO DOS AGENTES (VERDADE UNICA DE FUNCAO EXECUTIVA)", ["data/agents_manifest.json"]),
        ("STATUS RUNTIME DE CHAVES E ROTEAMENTO", [".claude/RUNTIME_KEYS_ROUTING_STATUS.md"]),
        ("PROTOCOLO DE ROTEAMENTO HOLOGRAFICO", [".claude/HOLOGRAPHIC_ROUTING_PROTOCOL.md"]),
        ("IDENTIDADE DO USUARIO", [".claude/CLAUDE.md"]),
        ("LIDERANCA E GOVERNANCA", [".claude/LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md"]),
        ("TEMPLO DO APRENDIZADO GENERATIVO", [".claude/ESTADO_ARTE_APRENDIZADO_GENERATIVO.md"]),
        ("MANUAL DO WORKFLOW", ["docs/MANUAL_WORKFLOW_AGENTES.md", "docs/tasks/MANUAL_WORKFLOW_AGENTES.md"]),
        ("INDICE MESTRE", ["docs/INDEX_MESTRE.md", "docs/tasks/INDEX_MESTRE.md"]),
        ("GUIA DE DEPLOY E STACK", ["docs/DEPLOY.md", "DEPLOY.md"]),
        ("INVENTARIO DE FERRAMENTAS", ["docs/INVENTARIO_FERRAMENTAS.md"]),
        ("ARQUITETURA DO CEREBRO HIBRIDO", [".claude/HYBRID_BRAIN_ARCHITECTURE.md"]),
        ("MANIFESTO DE COERENCIA E HARMONIA", [".claude/COHERENCE_MANIFEST.md"])
    ]:
        # Otimizacao Estrategica: Poda o contexto filosofico para agentes tecnicos.
        if is_technical_agent and doc_name in philosophical_docs:
            continue

        for doc_path in doc_paths:
            file_obj = Path(doc_path)
            content = _read_file_with_cache(file_obj)
            if content:
                add_to_prompt(doc_name, content)
                successfully_read_files.append(str(file_
