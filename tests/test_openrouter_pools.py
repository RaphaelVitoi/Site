"""
Unit tests for SOTA OpenRouter Multi-Tier Key Pool Manager.
"""

from __future__ import annotations

import os
from unittest.mock import patch

import pytest

from llm.openrouter_pool import OpenRouterPoolManager, _key_sha8


@pytest.fixture
def mock_env_pools():
    env_vars = {
        "OPENROUTER_TIER1_KEY_1": "sk-or-v1-tier1-key-alpha-1234567890",
        "OPENROUTER_TIER1_KEY_2": "sk-or-v1-tier1-key-bravo-1234567890",
        "OPENROUTER_TIER1_KEY_3": "sk-or-v1-tier1-key-charlie-1234567890",
        "OPENROUTER_TIER2_KEY_1": "sk-or-v1-tier2-key-delta-1234567890",
        "OPENROUTER_TIER2_KEY_2": "sk-or-v1-tier2-key-echo-1234567890",
        "OPENROUTER_TIER2_KEY_3": "sk-or-v1-tier2-key-echo2-1234567890",
        "OPENROUTER_TIER3_KEY_1": "sk-or-v1-tier3-key-foxtrot-1234567890",
        "OPENROUTER_TIER3_KEY_2": "sk-or-v1-tier3-key-golf-1234567890",
        "OPENROUTER_TIER3_KEY_3": "sk-or-v1-tier3-key-hotel-1234567890",
        "OPENROUTER_TIER3_KEY_4": "sk-or-v1-tier3-key-india-1234567890",
        "OPENROUTER_TIER3_KEY_5": "sk-or-v1-tier3-key-juliet-1234567890",
        "OPENROUTER_TIER4_KEY_1": "sk-or-v1-tier4-key-kilo-1234567890",
        "OPENROUTER_TIER4_KEY_2": "sk-or-v1-tier4-key-lima-1234567890",
        "OPENROUTER_TIER4_KEY_3": "sk-or-v1-tier4-key-mike-1234567890",
        "OPENROUTER_TIER4_KEY_4": "sk-or-v1-tier4-key-november-1234567890",
        "OPENROUTER_TIER4_KEY_5": "sk-or-v1-tier4-key-oscar-1234567890",
    }
    with patch.dict(os.environ, env_vars, clear=False):
        yield env_vars


@pytest.mark.asyncio
async def test_pool_loading(mock_env_pools):
    mgr = OpenRouterPoolManager()
    assert len(mgr.get_pool_keys(1)) == 3
    assert len(mgr.get_pool_keys(2)) == 3
    assert len(mgr.get_pool_keys(3)) == 5
    assert len(mgr.get_pool_keys(4)) == 5


@pytest.mark.asyncio
async def test_get_key_for_tier(mock_env_pools):
    mgr = OpenRouterPoolManager()

    # Tier 1 deve receber uma chave do pool Tier 1
    key_t1, eff_tier_1 = await mgr.get_key_for_tier(1)
    assert key_t1 in mgr.get_pool_keys(1)
    assert eff_tier_1 == 1

    # Tier 3 deve receber uma chave do pool Tier 3
    key_t3, eff_tier_3 = await mgr.get_key_for_tier(3)
    assert key_t3 in mgr.get_pool_keys(3)
    assert eff_tier_3 == 3


@pytest.mark.asyncio
async def test_circuit_breaker_429(mock_env_pools):
    mgr = OpenRouterPoolManager()
    t1_keys = mgr.get_pool_keys(1)
    key_1 = t1_keys[0]

    # Simula HTTP 429 na key_1 com cooldown de 60s
    await mgr.mark_failure(key_1, status_code=429, retry_after_s=60.0)

    # Proxima solicitacao para Tier 1 deve rotacionar para key_2 ou key_3
    next_key, eff_tier = await mgr.get_key_for_tier(1)
    assert next_key != key_1
    assert next_key in t1_keys
    assert eff_tier == 1


@pytest.mark.asyncio
async def test_circuit_breaker_401_revocation(mock_env_pools):
    mgr = OpenRouterPoolManager()
    t2_keys = mgr.get_pool_keys(2)
    key_dead = t2_keys[0]

    # Simula HTTP 401 (chave revogada)
    await mgr.mark_failure(key_dead, status_code=401)

    telemetry = mgr.get_telemetry_summary()
    s8_dead = _key_sha8(key_dead)
    item = next(x for x in telemetry if x["sha8"] == s8_dead)
    assert item["is_revoked"] is True
    assert item["score"] < -900.0


@pytest.mark.asyncio
async def test_tier_isolation(mock_env_pools):
    mgr = OpenRouterPoolManager()
    t3_keys = mgr.get_pool_keys(3)

    # Exaure todas as chaves do Tier 3 com HTTP 429
    for k in t3_keys:
        await mgr.mark_failure(k, status_code=429, retry_after_s=300.0)

    # Tier 3 agora retorna None (permitindo fallback para Tier 6 local)
    key_t3, eff_tier_3 = await mgr.get_key_for_tier(3, allow_fallback=False)
    assert key_t3 is None
    assert eff_tier_3 == 0

    # Tier 1 continua 100% saudavel e intocado!
    key_t1, eff_tier_1 = await mgr.get_key_for_tier(1)
    assert key_t1 is not None
    assert eff_tier_1 == 1


@pytest.mark.asyncio
async def test_adaptive_health_scoring(mock_env_pools):
    mgr = OpenRouterPoolManager()
    t1_keys = mgr.get_pool_keys(1)
    fast_key = t1_keys[0]
    slow_key = t1_keys[1]

    # fast_key: 3 sucessos com 120ms
    for _ in range(3):
        await mgr.mark_success(fast_key, latency_ms=120.0)

    # slow_key: 3 sucessos com 2500ms
    for _ in range(3):
        await mgr.mark_success(slow_key, latency_ms=2500.0)

    # A melhor chave deve ser a fast_key
    selected_key, _ = await mgr.get_key_for_tier(1)
    assert selected_key == fast_key


@pytest.mark.asyncio
async def test_telemetry_summary(mock_env_pools):
    mgr = OpenRouterPoolManager()
    summary = mgr.get_telemetry_summary()
    assert len(summary) == 16  # 3 + 3 + 5 + 5
    for item in summary:
        assert len(item["sha8"]) == 8
        assert item["tier"] in (1, 2, 3, 4)
