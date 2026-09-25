"""
SOTA OpenRouter Multi-Tier Key Pool Manager.

Provides intelligent, adaptive key rotation, circuit breaking, and quota isolation
across agent tiers:
  - Tier 1: Core Cognitive Mastery (3 keys) - High reasoning, zero-tolerance latency.
  - Tier 2: Cloud Superagents & Research (2 keys) - Tool calling, search, context.
  - Tier 3: Specialist Fleet & Heavy Batch (5 keys) - High throughput, dream replay.
  - Tier 4: Dedicated Subagents (4 keys) - Dynamic task delegation.

Credentials are read from HKCU / HKLM (Windows Registry) and process environment,
guaranteeing zero plaintext exposure in code or version control.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
import hashlib
import logging
import os
import re
import sys
from typing import NamedTuple

logger = logging.getLogger(__name__)

# Pattern para chaves particionadas por tier: OPENROUTER_TIER1_KEY_1, OPENROUTER_TIER3_KEY_5, etc.
RE_TIER_KEY = re.compile(r"^OPENROUTER_TIER(?P<tier>[1-4])_KEY_(?P<idx>\d+)$")

DEFAULT_COOLDOWN_429 = timedelta(minutes=5)
DEFAULT_COOLDOWN_SERVER_ERROR = timedelta(minutes=2)


def _key_sha8(key: str) -> str:
    """Calcula fingerprint truncado de 8 caracteres do token para telemetria sem vazamento."""
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:8]


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


class OpenRouterPoolManager:
    """
    Gerenciador com isolamento de cotas por Tier, selecao adaptativa e circuit breaker.
    Thread-safe e preparado para event loops assincronos.
    """

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._pools: dict[int, list[str]] = {1: [], 2: [], 3: [], 4: []}
        self._stats: dict[str, dict[str, float | int | datetime | bool | None]] = {}
        self.reload_from_environment()

    def reload_from_environment(self) -> None:
        """Carrega todas as chaves por Tier a partir do os.environ e do Registro (HKCU/HKLM no Windows)."""
        env_map: dict[str, str] = dict(os.environ)

        # No Windows, complementa com HKCU e HKLM se disponivel
        if sys.platform == "win32":
            try:
                import winreg  # noqa: PLC0415

                for hkey, subkey in [
                    (winreg.HKEY_CURRENT_USER, r"Environment"),
                    (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
                ]:
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

        new_pools: dict[int, list[str]] = {1: [], 2: [], 3: [], 4: []}
        for var_name, var_value in env_map.items():
            if not var_value or len(var_value) < 10:
                continue
            m = RE_TIER_KEY.match(var_name.upper())
            if m:
                tier = int(m.group("tier"))
                if var_value not in new_pools[tier]:
                    new_pools[tier].append(var_value)

        # Se houver OPENROUTER_API_KEY global legada e o tier 1 estiver vazio, injeta no tier 1
        legacy_key = env_map.get("OPENROUTER_API_KEY", "").strip()
        if legacy_key and len(legacy_key) >= 10 and not new_pools[1]:
            new_pools[1].append(legacy_key)

        self._pools = new_pools

        # Inicializa registros de telemetria para chaves novas
        for tier, keys in self._pools.items():
            for key in keys:
                s8 = _key_sha8(key)
                if s8 not in self._stats:
                    self._stats[s8] = {
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

        logger.info(
            "[OPENROUTER POOL] Pools carregados: Tier1=%d, Tier2=%d, Tier3=%d, Tier4=%d",
            len(self._pools[1]),
            len(self._pools[2]),
            len(self._pools[3]),
            len(self._pools[4]),
        )

    def get_pool_keys(self, tier: int) -> list[str]:
        """Devolve as chaves brutas registradas para o tier informado."""
        return list(self._pools.get(tier, []))

    def _score_key(self, s8: str) -> float:
        """Calcula score de saude (0-100) para desempate adaptativo."""
        data = self._stats.get(s8)
        if not data:
            return 50.0
        if data.get("is_revoked"):
            return -1000.0

        blocked_until = data.get("blocked_until")
        if blocked_until and isinstance(blocked_until, datetime) and datetime.now(UTC) < blocked_until:
            return -500.0  # Em cooldown

        attempts = int(data.get("attempts", 0))
        successes = int(data.get("successes", 0))
        consecutive_failures = int(data.get("consecutive_failures", 0))
        latency = float(data.get("avg_latency_ms", 500.0))

        if attempts == 0:
            return 80.0  # Chave limpa pronta para uso

        success_rate = (successes / attempts) * 100.0
        latency_penalty = min(latency / 100.0, 30.0)
        failure_penalty = min(consecutive_failures * 15.0, 50.0)

        return success_rate - latency_penalty - failure_penalty

    async def get_key_for_tier(self, tier: int, allow_fallback: bool = True) -> tuple[str | None, int]:
        """
        Seleciona a chave mais saudavel do pool do tier requisitado.
        Devolve (chave, tier_efetivo) ou (None, 0) caso todas estejam esgotadas.
        """
        async with self._lock:
            # Ordem de busca: tier solicitado -> fallbacks autorizados
            tiers_to_try = [tier]
            if allow_fallback:
                if tier == 2:
                    tiers_to_try.extend([4, 1])  # Tier 2 pode usar 4 ou 1
                elif tier == 4:
                    tiers_to_try.append(3)  # Tier 4 pode cair para 3
                elif tier == 3:
                    # Tier 3 nao desce: se esgotar, sinaliza None para acionar Tier 6 local
                    pass
                elif tier == 1:
                    # Tier 1 nunca usa tiers inferiores
                    pass

            for t in tiers_to_try:
                candidate_keys = self._pools.get(t, [])
                if not candidate_keys:
                    continue

                # Rankeia por score de saude decrescente
                ranked = sorted(
                    candidate_keys,
                    key=lambda k: self._score_key(_key_sha8(k)),
                    reverse=True,
                )

                for best_key in ranked:
                    s8 = _key_sha8(best_key)
                    score = self._score_key(s8)
                    if score > -400.0:  # Nao esta em cooldown nem revogada
                        return best_key, t

            return None, 0

    async def mark_success(self, key: str, latency_ms: float) -> None:
        """Registra requisicao bem-sucedida, atualizando latencia e zerando cooldowns."""
        s8 = _key_sha8(key)
        async with self._lock:
            if s8 not in self._stats:
                return
            st = self._stats[s8]
            st["attempts"] = int(st["attempts"]) + 1
            st["successes"] = int(st["successes"]) + 1
            st["consecutive_failures"] = 0
            st["blocked_until"] = None

            # Media movel exponencial para latencia
            old_lat = float(st["avg_latency_ms"])
            st["avg_latency_ms"] = (old_lat * 0.7) + (latency_ms * 0.3)

    async def mark_failure(self, key: str, status_code: int = 500, retry_after_s: float = 0.0) -> None:
        """Registra falha e aciona circuit breaker com base no status HTTP."""
        s8 = _key_sha8(key)
        now = datetime.now(UTC)
        async with self._lock:
            if s8 not in self._stats:
                return
            st = self._stats[s8]
            st["attempts"] = int(st["attempts"]) + 1
            st["failures"] = int(st["failures"]) + 1
            st["consecutive_failures"] = int(st["consecutive_failures"]) + 1

            if status_code in (401, 403):
                # Chave invalida ou revogada: banimento definitivo
                st["is_revoked"] = True
                logger.error("[OPENROUTER POOL] Chave sha8=%s foi REVOGADA/REJEITADA (HTTP %d).", s8, status_code)
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
        for s8, st in sorted(self._stats.items(), key=lambda x: (x[1]["tier"], x[0])):
            blocked = False
            b_until = st.get("blocked_until")
            if b_until and isinstance(b_until, datetime):
                blocked = datetime.now(UTC) < b_until

            summary.append(
                {
                    "sha8": s8,
                    "tier": int(st["tier"]),
                    "attempts": int(st["attempts"]),
                    "successes": int(st["successes"]),
                    "failures": int(st["failures"]),
                    "avg_latency_ms": round(float(st["avg_latency_ms"]), 1),
                    "is_blocked": blocked,
                    "is_revoked": bool(st["is_revoked"]),
                    "score": round(self._score_key(s8), 1),
                }
            )
        return summary


# Instancia singleton para uso em todo o backend
openrouter_pool_manager = OpenRouterPoolManager()
