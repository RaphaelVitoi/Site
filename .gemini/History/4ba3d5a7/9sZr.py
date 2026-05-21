import os
import re
import time
import hashlib
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from database.queue_manager import QueueManager


# =================================================
# ORCAMENTO COGNITIVO E HIBERNACAO (Logistica SOTA)
# =================================================
DAILY_API_BUDGET = 5000  # Escala massiva liberada (Orquestracao SOTA)


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
    """Le chaves de forma implacavel de _env.ps1 ou .env para garantir operacao SOTA."""
    keys = {}
    base_dir = Path(__file__).parent.parent.resolve()
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        match = re.search(r'(?:\$env:|\$)?([a-zA-Z0-9_]+)\s*[:=]\s*[\'"]?([^\'"\s#]+)[\'"]?', line)
                        if match:
                            keys[match.group(1)] = match.group(2).strip()
            except Exception as e:
                logging.warning(f"Aviso ao ler {file_name}: {e}")
    return keys


# Carregamento unico das chaves de API para evitar I/O repetitivo
ENV_KEYS = _load_env_keys()
ALL_ENV_VARS = {**os.environ, **ENV_KEYS}


def _is_real_key_value(value: str) -> bool:
    if not value:
        return False
    v = value.strip()
    invalid_prefixes = ("$env:", "${", "sk-REPLACE", "SUA_KEY", "COLE_SUA_KEY")
    if any(v.startswith(prefix) for prefix in invalid_prefixes):
        return False

    # Sufixos de chaves conhecidamente revogadas (configuravel via REVOKED_KEY_SUFFIXES no env)
    revoked_raw = ALL_ENV_VARS.get("REVOKED_KEY_SUFFIXES", "XfUE")
    invalid_suffixes = tuple(s.strip() for s in revoked_raw.split(",") if s.strip())
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

def _collect_keys_with_pool(prefixes: tuple, exclude_prefixes: tuple = ()) -> List[Dict[str, str]]:
    """Coleta chaves e extrai o 'pool' (ex: nome do projeto) do nome da variavel."""
    keys_with_pools = []
    seen_keys = set()

    for k, v in ALL_ENV_VARS.items():
        key_name = k.upper()
        if not _is_real_key_value(v) or v in seen_keys:
            continue
        if any(key_name.startswith(ex) for ex in exclude_prefixes):
            continue

        if any(key_name.startswith(pf) for pf in prefixes):
            # SOTA: Extrai o nome do Pool do nome da variavel (GEMINI_[POOL_NAME]_...)
            # Ex: GEMINI_PROJETO_B_KEY_1 -> pool 'projeto_b'
            pool_match = re.search(r'GEMINI_([A-Z0-9_]+?)_KEY', key_name)
            pool_name = pool_match.group(1).lower() if pool_match else 'legacy'

            keys_with_pools.append({'key': v, 'pool': pool_name})
            seen_keys.add(v)

    return keys_with_pools


GEMINI_PRO_KEYS = _collect_keys(("GEMINI_PRO", "GOOGLE_PRO"))
GEMINI_FLASH_KEYS = _collect_keys(("GEMINI_FLASH", "GOOGLE_FLASH"))
GEMINI_KEYS = _collect_keys(
    ("GEMINI", "GOOGLE"),
    exclude_prefixes=("GEMINI_CLI", "GEMINI_PRO", "GOOGLE_PRO", "GEMINI_FLASH", "GOOGLE_FLASH"),
)
# Pool total para auditorias/telemetria.
GEMINI_ALL_KEYS = list(dict.fromkeys(GEMINI_PRO_KEYS + GEMINI_FLASH_KEYS + GEMINI_KEYS))

# SOTA: Nova fonte de verdade para auditoria com pools de projetos
GEMINI_ALL_KEYS_WITH_POOLS = _collect_keys_with_pool(
    ("GEMINI", "GOOGLE"),
    exclude_prefixes=("GEMINI_CLI",)
)

ANTHROPIC_KEYS = list(dict.fromkeys([
    v for k, v in ALL_ENV_VARS.items() if _is_real_key_value(v) and k.upper().startswith("ANTHROPIC")
]))
OPENROUTER_KEYS = list(dict.fromkeys([
    v for k, v in ALL_ENV_VARS.items()
    if _is_real_key_value(v) and (k.upper().startswith("OPENROUTER") or k.upper().startswith("DEEPSEEK") or k.upper().startswith("LLAMA"))
    and "MODELS" not in k.upper()
    and "," not in v
    and "/" not in v
]))
TAVILY_KEYS = _collect_keys(("TAVILY",))
PERPLEXITY_KEYS = _collect_keys(("PERPLEXITY",))
API_SECRET_TOKEN = ALL_ENV_VARS.get("API_SECRET_TOKEN", "")

# Cache para resultados da WebSearch
web_search_cache: Dict[str, Any] = {}
# Tempo de vida do cache em segundos (ex: 3600 = 1 hora)
WEB_SEARCH_CACHE_TTL = 3600

# Circuit breaker para chaves bloqueadas temporariamente
# SOTA: Reduzido de 15 para 5 minutos. O ciclo de hibernacao (worker/loop.py) acorda em 3 mins e limpa a memoria.
# Um bloqueio longo causava dessincronia severa, derrubando o flash_health pela insistencia prematura.
KEY_BLOCK_DURATION = timedelta(minutes=5)
GEMINI_MODEL_KEY_BLOCK_DURATION = timedelta(minutes=int(os.environ.get("GEMINI_MODEL_KEY_BLOCK_MINUTES", "5")))

# SOTA: O TokenBucket agora multiplica o RPM base pelo numero de chaves ativas.
# Se temos 3 chaves, o limite real pula de 14 para 42 RPM, erradicando a Friccao Artificial.
_BASE_RPM = int(os.environ.get("MAX_CALLS_PER_MINUTE", "14"))
MAX_CALLS_PER_MINUTE = _BASE_RPM * (len(GEMINI_ALL_KEYS_WITH_POOLS) if GEMINI_ALL_KEYS_WITH_POOLS else 1)
KEY_BLOCKLIST: Dict[str, datetime] = {}
GEMINI_MODEL_KEY_BLOCKLIST: Dict[str, datetime] = {}
ROUTE_COOLDOWN_DURATION = timedelta(minutes=int(os.environ.get("ROUTE_COOLDOWN_MINUTES", "5")))
ROUTE_FAILURE_THRESHOLD = int(os.environ.get("ROUTE_FAILURE_THRESHOLD", "5")) # Aumentado para permitir rotacao completa do pool antes de bloquear a rota
DEEPSEEK_ROUTE_COOLDOWN_DURATION = timedelta(minutes=int(os.environ.get("DEEPSEEK_ROUTE_COOLDOWN_MINUTES", "10")))
DEEPSEEK_ROUTE_FAILURE_THRESHOLD = int(os.environ.get("DEEPSEEK_ROUTE_FAILURE_THRESHOLD", "1"))
ROUTE_BLOCKLIST: Dict[str, datetime] = {}
ROUTE_FAILURE_COUNTS: Dict[str, int] = {}
COMPRESSION_CIRCUIT_BREAKER = {"consecutive_failures": 0, "last_failure": 0.0}

# Caches para otimizacao de performance
SYSTEM_PROMPT_CACHE: Dict[str, str] = {}
AUTONOMY_MODE_CACHE = {"mode": "off", "timestamp": 0.0}


# Trava de Seguranca Global para variaveis de telemetria
_TELEMETRY_LOCK = None
def get_telemetry_lock():
    global _TELEMETRY_LOCK
    if _TELEMETRY_LOCK is None:
        _TELEMETRY_LOCK = asyncio.Lock()
    return _TELEMETRY_LOCK


def _key_identifier(provider: str, key: str) -> str:
    return f"{provider}:{key}"


async def _is_key_blocked(provider_key: str) -> bool:
    async with get_telemetry_lock():
        expiry = KEY_BLOCKLIST.get(provider_key)
        if expiry:
            if expiry > datetime.now():
                return True
            KEY_BLOCKLIST.pop(provider_key, None)
        return False


async def _block_key(provider_key: str):
    async with get_telemetry_lock():
        KEY_BLOCKLIST[provider_key] = datetime.now() + KEY_BLOCK_DURATION


def _gemini_model_key_identifier(model: str, key: str) -> str:
    return f"gemini:{model}:{key}"


async def _is_gemini_model_key_blocked(model: str, key: str) -> bool:
    async with get_telemetry_lock():
        block_id = _gemini_model_key_identifier(model, key)
        expiry = GEMINI_MODEL_KEY_BLOCKLIST.get(block_id)
        if expiry:
            if expiry > datetime.now():
                return True
            GEMINI_MODEL_KEY_BLOCKLIST.pop(block_id, None)
        return False


async def _block_gemini_model_key(model: str, key: str):
    async with get_telemetry_lock():
        block_id = _gemini_model_key_identifier(model, key)
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


async def _is_route_blocked(route_key: str) -> bool:
    async with get_telemetry_lock():
        expiry = ROUTE_BLOCKLIST.get(route_key)
        if expiry:
            if expiry > datetime.now():
                return True
            ROUTE_BLOCKLIST.pop(route_key, None)
        return False


async def _register_route_success(route_key: str):
    async with get_telemetry_lock():
        ROUTE_FAILURE_COUNTS.pop(route_key, None)
        ROUTE_BLOCKLIST.pop(route_key, None)


async def _register_route_failure(route_key: str):
    async with get_telemetry_lock():
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
        key_hash = _key_fingerprint(provider, key)
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
        self.lock = None  # SOTA (Correcao 1): Instanciamento tardio sob o Event Loop ativo
        self.starvation_events = 0  # Telemetria interna de exaustao
        self.last_consume = 0.0

    async def consume(self, tokens: int = 1):
        if self.lock is None:
            self.lock = asyncio.Lock()
        async with self.lock:
            # SOTA: Global Burst Limiter (Anti-Manada)
            # Espacamento estrito baseado na cota (ex: 60s / 14 reqs = 4.28s)
            min_spacing = 1.0 / self.fill_rate_per_sec if self.fill_rate_per_sec > 0 else 4.2
            now = time.monotonic()
            if now - self.last_consume < min_spacing:
                await asyncio.sleep(min_spacing - (now - self.last_consume))
            self.last_consume = time.monotonic()

            while True:
                current_time = time.monotonic()
                elapsed = current_time - self.last_fill
                self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate_per_sec)
                self.last_fill = current_time

                if self.tokens >= tokens:
                    self.tokens -= tokens
                    return

                self.starvation_events += 1
                deficit = tokens - self.tokens
                wait_time = deficit / self.fill_rate_per_sec

                # SOTA: Dispara Alerta Proativo (Toast) se a cota secar para evitar silent failures
                if self.starvation_events % 5 == 1:
                    try:
                        from monitoring.telemetry import send_toast
                        send_toast("[WARN] Rate Limit Fallback SOTA", f"Cota de API esgotada. Aguardando {wait_time:.1f}s para resfriar chaves.", "warning")
                    except ImportError:
                        pass

                logging.warning(f"[Rate Limiter SOTA] Starvation detectado. Aguardando {wait_time:.2f}s para {tokens} tokens.")
                await asyncio.sleep(wait_time)

    def get_metrics(self) -> dict:
        return {
            "current_tokens": round(self.tokens, 2),
            "capacity": self.capacity,
            "starvation_events": self.starvation_events
        }


global_rate_limiter = AsyncTokenBucket(capacity=MAX_CALLS_PER_MINUTE, fill_rate_per_minute=MAX_CALLS_PER_MINUTE)
