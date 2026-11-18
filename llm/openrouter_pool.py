"""
SOTA OpenRouter Multi-Tier Key Pool Manager.

Provides intelligent, adaptive key rotation, circuit breaking, and quota isolation
across agent tiers:
  - Tier 1: Core Cognitive Mastery (5 keys) - High reasoning, zero-tolerance latency.
  - Tier 2: Cloud Superagents & Research (10 keys) - Tool calling, search, context.
  - Tier 3: Specialist Fleet & Heavy Batch (5 keys) - High throughput, dream replay.
  - Tier 4: Dedicated Subagents (5 keys) - Dynamic task delegation.

Credentials are read from HKCU / HKLM (Windows Registry) and process environment,
guaranteeing zero plaintext exposure in code or version control.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import logging
import os
import re
import sys
import threading
from typing import NamedTuple, TypedDict
import weakref

from utils.env_loader import is_real_key_value

logger = logging.getLogger(__name__)

# Pattern para chaves particionadas por tier: OPENROUTER_TIER1_KEY_1, OPENROUTER_TIER3_KEY_5, etc.
RE_TIER_KEY = re.compile(r"^OPENROUTER_TIER(?P<tier>[1-4])_KEY_(?P<idx>\d+)$")

DEFAULT_COOLDOWN_429 = timedelta(minutes=5)
DEFAULT_COOLDOWN_402 = timedelta(minutes=15)
DEFAULT_COOLDOWN_SERVER_ERROR = timedelta(minutes=2)


_HMAC_SALT: bytes = b"sota_openrouter_pool_salt"


def _key_sha8(key: str) -> str:
    """Calcula fingerprint truncado de 8 caracteres do token para telemetria sem vazamento."""
    return hmac.new(_HMAC_SALT, key.encode("utf-8"), hashlib.sha256).hexdigest()[:8]


def _is_real_key_value(value: str) -> bool:
    """Valida chave real delegando para llm.budget quando carregado (sem ciclo de import)."""
    budget_mod = sys.modules.get("llm.budget")
    fn = getattr(budget_mod, "_is_real_key_value", None) if budget_mod is not None else None
    if callable(fn):
        return bool(fn(value))
    return is_real_key_value(value)


class KeyHealth(NamedTuple):
    key: str
    sha8: str
    tier: int
    attempts: int
    successes: int
    failures: int
    consecutive_failures: int
    avg_latency_ms: float
    blocked_until: datetime | None
    is_revoked: bool


class KeyStats(TypedDict):
    key: str
    tier: int
    attempts: int
    successes: int
    failures: int
    consecutive_failures: int
    avg_latency_ms: float
    blocked_until: datetime | None
    is_revoked: bool


def _read_windows_registry_openrouter(env_map: dict[str, str]) -> None:
    if sys.platform != "win32":
        return
    try:
        import winreg  # noqa: PLC0415

        for hkey, subkey in (
            (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
            (winreg.HKEY_CURRENT_USER, r"Environment"),
        ):
            try:
                with winreg.OpenKey(hkey, subkey) as k:
                    idx = 0
                    while True:
                        try:
                            name, val, _ = winreg.EnumValue(k, idx)
                            if name.startswith("OPENROUTER_"):
                                env_map[name] = str(val).strip()
                            idx += 1
                        except OSError:
                            break
            except OSError:
                pass
    except ImportError:
        pass


_NAMED_OPENROUTER_KEY_VARS = (
    "OPENROUTER_ANTIGRAVITY_KEY",
    "OPENROUTER_DEVIN_KEY",
    "OPENROUTER_HERMES_KEY",
    "OPENROUTER_GEMINI_IMAGE_KEY",
    "OPENROUTER_GEMINI_TRANSLATE_KEY",
    "OPENROUTER_GEMINI_TTS_KEY",
    "OPENROUTER_GEMINI_VIDEO_KEY",
)


def _build_openrouter_pools(env_map: dict[str, str]) -> dict[int, list[str]]:
    new_pools: dict[int, list[str]] = {1: [], 2: [], 3: [], 4: []}
    for var_name, var_value in env_map.items():
        if not var_value or not _is_real_key_value(var_value):
            continue
        m = RE_TIER_KEY.match(var_name.upper())
        if m:
            tier = int(m.group("tier"))
            if var_value not in new_pools[tier]:
                new_pools[tier].append(var_value)

    known_keys = {k for tier_keys in new_pools.values() for k in tier_keys}
    legacy_key = env_map.get("OPENROUTER_API_KEY", "").strip()
    if legacy_key and _is_real_key_value(legacy_key):
        if not new_pools[1]:
            new_pools[1].append(legacy_key)
            known_keys.add(legacy_key)
        elif legacy_key not in known_keys:
            # Chave legada distinta atua como reforco isolado de subagentes/fallback (Tier 4).
            new_pools[4].append(legacy_key)
            known_keys.add(legacy_key)

    for var_name in _NAMED_OPENROUTER_KEY_VARS:
        val = env_map.get(var_name, "").strip()
        if val and _is_real_key_value(val) and val not in known_keys:
            new_pools[4].append(val)
            known_keys.add(val)
    return new_pools


def _init_key_stats(stats: dict[str, KeyStats], pools: dict[int, list[str]]) -> None:
    for tier, keys in pools.items():
        for key in keys:
            s8 = _key_sha8(key)
            if s8 not in stats:
                stats[s8] = {
                    "key": key,
                    "tier": tier,
                    "attempts": 0,
                    "successes": 0,
                    "failures": 0,
                    "consecutive_failures": 0,
                    "avg_latency_ms": 500.0,
                    "blocked_until": None,
                    "is_revoked": False,
                }


class OpenRouterPoolManager:
    """
    Gerenciador com isolamento de cotas por Tier, selecao adaptativa e circuit breaker.
    Thread-safe e preparado para event loops assincronos.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._loop_locks: dict[int, tuple[asyncio.AbstractEventLoop, asyncio.Lock]] = {}
        self._loop_locks_guard = threading.Lock()
        self._loop_refs: dict[int, weakref.ref[asyncio.AbstractEventLoop]] = {}
        self._sync_lock = threading.RLock()
        self._pools: dict[int, list[str]] = {1: [], 2: [], 3: [], 4: []}
        self._stats: dict[str, KeyStats] = {}
        self._tier_cursors: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0}
        self.reload_from_environment()

    def _get_lock(self) -> asyncio.Lock:
        """Retorna lock asyncio isolado por event loop."""
        loop = asyncio.get_running_loop()
        loop_id = id(loop)
        with self._loop_locks_guard:
            dead_ids = [lid for lid, (lp, _) in self._loop_locks.items() if lp.is_closed() and lp is not loop]
            for lid in dead_ids:
                self._loop_locks.pop(lid, None)
                self._loop_refs.pop(lid, None)
            prev_ref = self._loop_refs.get(loop_id)
            prev_loop = prev_ref() if prev_ref is not None else None
            entry = self._loop_locks.get(loop_id)
            if entry is None or entry[0] is not loop or prev_loop is not loop or loop.is_closed():
                lock = asyncio.Lock()
                self._loop_locks[loop_id] = (loop, lock)
                self._loop_refs[loop_id] = weakref.ref(loop)
                return lock
            return entry[1]

    def reload_from_environment(self) -> None:
        """Carrega todas as chaves por Tier a partir do os.environ e do Registro (HKCU/HKLM no Windows)."""
        env_map: dict[str, str] = dict(os.environ)
        _read_windows_registry_openrouter(env_map)
        with self._sync_lock:
            self._pools = _build_openrouter_pools(env_map)
            _init_key_stats(self._stats, self._pools)
            t1, t2, t3, t4 = (len(self._pools[i]) for i in (1, 2, 3, 4))

        logger.info(
            "[OPENROUTER POOL] Pools carregados: Tier1=%d, Tier2=%d, Tier3=%d, Tier4=%d",
            t1,
            t2,
            t3,
            t4,
        )

    def get_pool_keys(self, tier: int) -> list[str]:
        """Devolve as chaves brutas registradas para o tier informado."""
        with self._sync_lock:
            return list(self._pools.get(tier, []))

    def _score_key(self, s8: str) -> float:
        """Calcula score de saude (0-100) para desempate adaptativo."""
        data = self._stats.get(s8)
        if not data:
            return 50.0
        if data["is_revoked"]:
            return -1000.0

        blocked_until = data["blocked_until"]
        if blocked_until and datetime.now(UTC) < blocked_until:
            return -500.0  # Em cooldown

        attempts = data["attempts"]
        successes = data["successes"]
        consecutive_failures = data["consecutive_failures"]
        latency = data["avg_latency_ms"]

        if attempts == 0:
            return 80.0  # Chave limpa pronta para uso

        success_rate = (successes / attempts) * 100.0
        latency_penalty = min(latency / 100.0, 30.0)
        failure_penalty = min(consecutive_failures * 15.0, 50.0)

        return success_rate - latency_penalty - failure_penalty

    @staticmethod
    def _authorized_tier_order(tier: int, allow_fallback: bool) -> list[int]:
        tiers_to_try = [tier]
        if allow_fallback:
            if tier == 2:
                tiers_to_try.extend([4, 1])
            elif tier == 4:
                tiers_to_try.append(3)
        return tiers_to_try

    def is_key_available(self, key: str) -> bool:
        """Retorna True se a chave nao esta revogada nem em cooldown ativo."""
        s8 = _key_sha8(key)
        with self._sync_lock:
            return self._score_key(s8) > -400.0

    def has_available_key(self, tier: int | None = None) -> bool:
        """Verifica em O(N) sem mutar estado se existe ao menos uma chave saudavel."""
        tiers = [tier] if tier is not None else [1, 2, 3, 4]
        with self._sync_lock:
            for t in tiers:
                for key in self._pools.get(t, []):
                    if self._score_key(_key_sha8(key)) > -400.0:
                        return True
        return False

    def get_ranked_keys_for_tier(self, tier: int, allow_fallback: bool = True) -> list[str]:
        """Retorna chaves disponiveis por tier ordenadas por saude com desempate round-robin."""
        tiers_to_try = self._authorized_tier_order(tier, allow_fallback)
        ordered: list[str] = []
        seen: set[str] = set()
        with self._sync_lock:
            for t in tiers_to_try:
                candidate_keys = self._pools.get(t, [])
                if not candidate_keys:
                    continue
                n = len(candidate_keys)
                cursor = self._tier_cursors.get(t, 0) % n
                rotated = [(idx, candidate_keys[(cursor + idx) % n]) for idx in range(n)]
                ranked = sorted(
                    rotated,
                    key=lambda item: (-round(self._score_key(_key_sha8(item[1])), 3), item[0]),
                )
                for _, cand in ranked:
                    if cand not in seen and self._score_key(_key_sha8(cand)) > -400.0:
                        ordered.append(cand)
                        seen.add(cand)
                self._tier_cursors[t] = (cursor + 1) % n
        return ordered

    async def get_key_for_tier(self, tier: int, allow_fallback: bool = True) -> tuple[str | None, int]:
        """
        Seleciona a chave mais saudavel do pool do tier requisitado.
        Devolve (chave, tier_efetivo) ou (None, 0) caso todas estejam esgotadas.
        """
        async with self._get_lock():
            tiers_to_try = self._authorized_tier_order(tier, allow_fallback)

            for t in tiers_to_try:
                candidate_keys = self._pools.get(t, [])
                if not candidate_keys:
                    continue

                n = len(candidate_keys)
                with self._sync_lock:
                    cursor = self._tier_cursors.get(t, 0) % n
                    rotated = [(idx, candidate_keys[(cursor + idx) % n]) for idx in range(n)]
                    ranked = sorted(
                        rotated,
                        key=lambda item: (-round(self._score_key(_key_sha8(item[1])), 3), item[0]),
                    )
                    for _, best_key in ranked:
                        if self._score_key(_key_sha8(best_key)) > -400.0:
                            self._tier_cursors[t] = (cursor + 1) % n
                            return best_key, t

            return None, 0

    async def mark_success(self, key: str, latency_ms: float) -> None:
        """Registra requisicao bem-sucedida, atualizando latencia e zerando cooldowns."""
        s8 = _key_sha8(key)
        async with self._get_lock():
            if s8 not in self._stats:
                return
            st = self._stats[s8]
            st["attempts"] += 1
            st["successes"] += 1
            st["consecutive_failures"] = 0
            st["blocked_until"] = None

            # Media movel exponencial para latencia
            old_lat = st["avg_latency_ms"]
            st["avg_latency_ms"] = (old_lat * 0.7) + (latency_ms * 0.3)

    async def mark_failure(self, key: str, status_code: int = 500, retry_after_s: float = 0.0) -> None:
        """Registra falha e aciona circuit breaker com base no status HTTP."""
        s8 = _key_sha8(key)
        now = datetime.now(UTC)
        async with self._get_lock():
            if s8 not in self._stats:
                return
            st = self._stats[s8]
            st["attempts"] += 1
            st["failures"] += 1
            st["consecutive_failures"] += 1

            if status_code in (401, 403):
                # Chave invalida ou revogada: banimento definitivo
                st["is_revoked"] = True
                logger.error("[OPENROUTER POOL] Chave sha8=%s foi REVOGADA/REJEITADA (HTTP %d).", s8, status_code)
            elif status_code == 402:
                # Conta sem creditos: cooldown estendido para evitar queima em cascata
                st["blocked_until"] = now + DEFAULT_COOLDOWN_402
                logger.warning(
                    "[OPENROUTER POOL] Chave sha8=%s retornou HTTP 402 (saldo). Cooldown de %ds aplicado.",
                    s8,
                    int(DEFAULT_COOLDOWN_402.total_seconds()),
                )
            elif status_code == 429:
                # Rate limit: cooldown inteligente
                cooldown_dur = timedelta(seconds=retry_after_s) if retry_after_s > 0 else DEFAULT_COOLDOWN_429
                st["blocked_until"] = now + cooldown_dur
                logger.warning(
                    "[OPENROUTER POOL] Chave sha8=%s atingiu rate limit (HTTP 429). Cooldown de %ds aplicado.",
                    s8,
                    int(cooldown_dur.total_seconds()),
                )
            elif status_code >= 500:
                # Falha temporaria de servidor do provedor
                st["blocked_until"] = now + DEFAULT_COOLDOWN_SERVER_ERROR

    def get_telemetry_summary(self) -> list[dict[str, str | int | float | bool]]:
        """Gera resumo factual de saude de todas as chaves sem expor segredos."""
        summary: list[dict[str, str | int | float | bool]] = []
        with self._sync_lock:
            stats_snapshot = sorted(self._stats.items(), key=lambda x: (x[1]["tier"], x[0]))
            for s8, st in stats_snapshot:
                blocked = False
                b_until = st["blocked_until"]
                if b_until and isinstance(b_until, datetime):
                    blocked = datetime.now(UTC) < b_until

                summary.append(
                    {
                        "sha8": s8,
                        "tier": st["tier"],
                        "attempts": st["attempts"],
                        "successes": st["successes"],
                        "failures": st["failures"],
                        "avg_latency_ms": round(st["avg_latency_ms"], 1),
                        "is_blocked": blocked,
                        "is_revoked": st["is_revoked"],
                        "score": round(self._score_key(s8), 1),
                    }
                )
        return summary


# Instancia singleton para uso em todo o backend
openrouter_pool_manager = OpenRouterPoolManager()


def get_openrouter_pool() -> OpenRouterPoolManager:
    """Retorna a instancia singleton do gerenciador de pool."""
    return openrouter_pool_manager
