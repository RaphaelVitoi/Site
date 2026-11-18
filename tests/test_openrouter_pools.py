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
    # Isola Registro E os.environ reais: chaves provisionadas em HKCU/HKLM
    # chegam ao processo de teste e quebram as contagens sinteticas 3/3/5/5.
    with (
        patch.dict(os.environ, env_vars, clear=False),
        patch("llm.openrouter_pool._read_windows_registry_openrouter", return_value=None),
    ):
        for k in list(os.environ):
            if k.upper().startswith("OPENROUTER") and k not in env_vars:
                os.environ.pop(k, None)
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
    assert item["score"] < -900.0  # type: ignore[comparison]


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
        assert len(item["sha8"]) == 8  # type: ignore[arg-type]
        assert item["tier"] in (1, 2, 3, 4)


@pytest.mark.asyncio
async def test_openrouter_404_trips_route_immediately_without_key_burn(monkeypatch: pytest.MonkeyPatch) -> None:
    """HTTP 404 (modelo descontinuado) deve bloquear a rota na 1a tentativa sem rodar 5 chaves."""
    from types import SimpleNamespace
    from unittest.mock import AsyncMock

    from core.schemas import Task
    import llm.providers as providers

    calls = 0

    async def fake_call_openrouter(*args, **kwargs):
        nonlocal calls
        calls += 1
        raise RuntimeError(
            'HTTP 404: Not Found - {"error":{"message":"model is no longer available on OpenRouter","code":404}}'
        )

    monkeypatch.setattr(providers, "call_openrouter", fake_call_openrouter)
    route_key = providers._route_identifier("openrouter", "dead/model-404-test:free")
    await providers._register_route_success(route_key)

    manager = SimpleNamespace(
        get_key_health_scores=AsyncMock(return_value={}),
        get_key_recent_stats=AsyncMock(return_value={}),
        record_key_usage_metric=AsyncMock(),
        is_circuit_open=AsyncMock(return_value=False),
    )
    task = Task(id="TEST-404", description="test", agent="@chico", timestamp="2026-11-18T00:00:00Z")
    keys = [f"sk-or-v1-key-{i}" for i in range(5)]

    res = await providers._try_provider(
        session=SimpleNamespace(),  # type: ignore[arg-type]
        provider="openrouter",
        model="dead/model-404-test:free",
        system_prompt="sys",
        user_prompt="user",
        keys=keys,
        task=task,
        manager=manager,  # type: ignore[arg-type]
        max_retries=0,
    )
    assert res is None
    assert calls == 1
    assert await providers._is_route_blocked(route_key) is True
    await providers._register_route_success(route_key)


def test_active_openrouter_free_models_resolve_to_openrouter() -> None:
    """Modelos :free ativos (incluindo Gemma/Ling OpenRouter) devem rotear para openrouter."""
    from engine.llm_api import _resolve_model_provider_and_target
    from llm.routing import _infer_provider_for_model

    for model in (
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "cohere/north-mini-code:free",
        "nvidia/nemotron-3.5-lightning:free",
        "inclusionai/ling-3.2-flash:free",
    ):
        assert _infer_provider_for_model(model) == "openrouter"
        assert _resolve_model_provider_and_target(model, [], [], ["or-key"], ["nous-key"]) == ("openrouter", model)
