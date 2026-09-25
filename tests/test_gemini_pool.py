"""
Testes unitários para o GeminiPoolManager (Pool Rotacional Inteligente).
Protocolo Chico SOTA v8.0 GOLD.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from llm.gemini import call_gemini, call_gemini_flash_lite
from llm.gemini_pool import (
    GeminiPoolManager,
    GeminiWorkload,
    _key_sha8,
)


@pytest.fixture
def mock_pool_keys(monkeypatch):
    """Configura 5 chaves simuladas para teste isolado."""
    keys = [
        "CHAVE_SINTETICA_MOCK_KEY_11111111111111111111111111111111",
        "CHAVE_SINTETICA_MOCK_KEY_22222222222222222222222222222222",
        "CHAVE_SINTETICA_MOCK_KEY_33333333333333333333333333333333",
        "CHAVE_SINTETICA_MOCK_KEY_44444444444444444444444444444444",
        "CHAVE_SINTETICA_MOCK_KEY_55555555555555555555555555555555",
    ]
    for i, k in enumerate(keys, 1):
        monkeypatch.setenv(f"GEMINI_API_KEY_{i}", k)
    monkeypatch.setenv("GEMINI_PROJECT_ID", "projects/913870412920")
    monkeypatch.setenv("GEMINI_PROJECT_NAME", "original-498419")
    return keys


@pytest.mark.asyncio
async def test_gemini_pool_initialization(mock_pool_keys):
    """Valida carregamento das 5 chaves a partir do ambiente."""
    manager = GeminiPoolManager(read_registry=False)
    assert manager.total_keys() == 5
    assert manager.available_keys_count() == 5


@pytest.mark.asyncio
async def test_gemini_pool_round_robin_rotation(mock_pool_keys):
    """Valida rotação homogênea entre as chaves em chamadas sucessivas."""
    manager = GeminiPoolManager(read_registry=False)
    selected_keys = []
    for _ in range(5):
        key, sha8 = await manager.get_key_for_workload(GeminiWorkload.TRIAGEM)
        selected_keys.append(key)
        assert sha8 == _key_sha8(key)

    # Garante que as 5 chaves distintas foram acionadas
    assert len(set(selected_keys)) == 5


@pytest.mark.asyncio
async def test_gemini_pool_circuit_breaker_429(mock_pool_keys):
    """Valida que uma chave que recebe HTTP 429 entra em cooldown e a pool rotaciona imediatamente."""
    manager = GeminiPoolManager(read_registry=False)
    key1, sha1 = await manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)

    # Marca erro 429 com 60 segundos de retry_after
    await manager.mark_failure(key1, status_code=429, retry_after_s=60.0)

    # Chave 1 agora deve estar indisponível
    assert manager.available_keys_count() == 4

    # Próxima requisição deve retornar chave diferente
    key2, sha2 = await manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)
    assert key2 != key1
    assert sha2 != sha1


@pytest.mark.asyncio
async def test_gemini_pool_permanent_isolation_401_403(mock_pool_keys):
    """Valida que chave com 401 ou 403 é revogada permanentemente e removida da rotação."""
    manager = GeminiPoolManager(read_registry=False)
    key1, sha1 = await manager.get_key_for_workload(GeminiWorkload.LINTING)

    await manager.mark_failure(key1, status_code=401, error_msg="API_KEY_INVALID")

    # Verifica marcação definitiva
    assert manager.available_keys_count() == 4
    summary = manager.get_telemetry_summary()
    revoked_entry = [s for s in summary if s["sha8"] == sha1][0]
    assert revoked_entry["is_revoked"] is True
    assert revoked_entry["health_score"] == 0.0

    # Próximas 10 chamadas nunca devem selecionar a chave revogada
    for _ in range(10):
        next_key, _ = await manager.get_key_for_workload(GeminiWorkload.LINTING)
        assert next_key != key1


@pytest.mark.asyncio
async def test_gemini_pool_workload_counters(mock_pool_keys):
    """Valida o rastreamento das 3 funções prioritárias do Gemini 3.5 Flash-Lite."""
    manager = GeminiPoolManager(read_registry=False)

    await manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)
    await manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)
    await manager.get_key_for_workload(GeminiWorkload.TRIAGEM)
    await manager.get_key_for_workload(GeminiWorkload.LINTING)

    summary = manager.get_telemetry_summary()
    total_edits = sum(s["atomic_edits"] for s in summary)
    total_triagem = sum(s["triagem"] for s in summary)
    total_linting = sum(s["linting"] for s in summary)

    assert total_edits == 2
    assert total_triagem == 1
    assert total_linting == 1


@pytest.mark.asyncio
async def test_gemini_pool_latency_and_success_update(mock_pool_keys):
    """Valida atualização de média móvel de latência e contagem de sucesso."""
    manager = GeminiPoolManager(read_registry=False)
    key, sha = await manager.get_key_for_workload(GeminiWorkload.TRIAGEM)

    await manager.mark_success(key, latency_ms=100.0)
    summary = manager.get_telemetry_summary()
    entry = [s for s in summary if s["sha8"] == sha][0]

    assert entry["successes"] == 1
    assert entry["attempts"] == 1
    # Inicial era 250, (250*0.7) + (100*0.3) = 175.0 + 30.0 = 205.0
    assert entry["avg_latency_ms"] == 205.0


@pytest.mark.asyncio
async def test_telemetry_table_zero_plaintext_leak(mock_pool_keys):
    """Garante que a tabela Markdown gerada não expõe chaves em texto claro."""
    manager = GeminiPoolManager(read_registry=False)
    table = manager.format_markdown_table()

    # Nenhuma das chaves brutas pode constar na tabela
    for k in mock_pool_keys:
        assert k not in table

    # Os sha8 devem estar presentes
    for k in mock_pool_keys:
        assert _key_sha8(k) in table


@pytest.mark.asyncio
async def test_call_gemini_flash_lite_automatic_failover(mock_pool_keys):
    """Testa se call_gemini_flash_lite failover rotaciona chave quando ocorre erro 429."""
    mock_session = MagicMock()

    call_count = 0

    async def fake_execute_primary(session, url, data, headers, request_kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise RuntimeError("HTTP 429: RESOURCE_EXHAUSTED retry_after=5s")
        return "Edição atômica executada com sucesso", {"totalTokenCount": 42}

    with patch("llm.gemini._execute_primary_request", side_effect=fake_execute_primary):
        text, usage = await call_gemini_flash_lite(
            session=mock_session,
            user_prompt="Substituir bloco X por Y",
            workload=GeminiWorkload.ATOMIC_EDITS,
            max_retries=2,
        )

        assert "Edição atômica executada com sucesso" in text
        assert usage["totalTokenCount"] == 42
        assert call_count == 2
