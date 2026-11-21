"""
Testes unitarios para o GeminiPoolManager (Pool Rotacional Inteligente).
Protocolo Chico SOTA v8.0 GOLD.
"""

from __future__ import annotations

import os
from unittest.mock import MagicMock, patch

import pytest

from llm.gemini import call_gemini_flash_lite
from llm.gemini_pool import (
    GeminiPoolManager,
    GeminiWorkload,
    _key_sha8,
)


@pytest.fixture
def mock_pool_keys(monkeypatch):
    """Configura 5 chaves simuladas para teste isolado."""
    for k in list(os.environ.keys()):
        if k.startswith(("GEMINI_API_KEY", "GEMINI_FLASH_KEY", "GEMINI_KEY")):
            monkeypatch.delenv(k, raising=False)
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
    from llm.gemini_pool import gemini_pool_manager

    gemini_pool_manager.reload_from_environment(read_registry=False)
    return keys


@pytest.mark.asyncio
async def test_gemini_pool_initialization(mock_pool_keys):
    """Valida carregamento das 5 chaves a partir do ambiente."""
    manager = GeminiPoolManager(read_registry=False)
    assert manager.total_keys() == 5
    assert manager.available_keys_count() == 5


@pytest.mark.asyncio
async def test_gemini_pool_round_robin_rotation(mock_pool_keys):
    """Valida rotacao homogenea entre as chaves em chamadas sucessivas."""
    manager = GeminiPoolManager(read_registry=False)
    selected_keys = []
    for _ in range(5):
        key, sha8 = manager.get_key_for_workload(GeminiWorkload.TRIAGEM)
        selected_keys.append(key)
        assert sha8 == _key_sha8(key)

    # Garante que as 5 chaves distintas foram acionadas
    assert len(set(selected_keys)) == 5


@pytest.mark.asyncio
async def test_gemini_pool_circuit_breaker_429(mock_pool_keys):
    """Valida que uma chave que recebe HTTP 429 entra em cooldown e a pool rotaciona imediatamente."""
    manager = GeminiPoolManager(read_registry=False)
    key1, sha1 = manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)

    # Marca erro 429 com 60 segundos de retry_after
    manager.mark_failure(key1, status_code=429, retry_after_s=60.0)

    # Chave 1 agora deve estar indisponivel
    assert manager.available_keys_count() == 4

    # Proxima requisicao deve retornar chave diferente
    key2, sha2 = manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)
    assert key2 != key1
    assert sha2 != sha1


@pytest.mark.asyncio
async def test_gemini_pool_permanent_isolation_401_403(mock_pool_keys):
    """Valida que chave com 401 ou 403 e revogada permanentemente e removida da rotacao."""
    manager = GeminiPoolManager(read_registry=False)
    key1, sha1 = manager.get_key_for_workload(GeminiWorkload.LINTING)

    manager.mark_failure(key1, status_code=401, error_msg="API_KEY_INVALID")

    # Verifica marcacao definitiva
    assert manager.available_keys_count() == 4
    summary = manager.get_telemetry_summary()
    revoked_entry = [s for s in summary if s["sha8"] == sha1][0]
    assert revoked_entry["is_revoked"] is True
    assert revoked_entry["health_score"] == 0.0

    # Proximas 10 chamadas nunca devem selecionar a chave revogada
    for _ in range(10):
        next_key, _ = manager.get_key_for_workload(GeminiWorkload.LINTING)
        assert next_key != key1


@pytest.mark.asyncio
async def test_gemini_pool_workload_counters(mock_pool_keys):
    """Valida o rastreamento das 3 funcoes prioritarias do Gemini 3.5 Flash-Lite."""
    manager = GeminiPoolManager(read_registry=False)

    manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)
    manager.get_key_for_workload(GeminiWorkload.ATOMIC_EDITS)
    manager.get_key_for_workload(GeminiWorkload.TRIAGEM)
    manager.get_key_for_workload(GeminiWorkload.LINTING)

    summary = manager.get_telemetry_summary()
    total_edits = sum(s["atomic_edits"] for s in summary)
    total_triagem = sum(s["triagem"] for s in summary)
    total_linting = sum(s["linting"] for s in summary)

    assert total_edits == 2
    assert total_triagem == 1
    assert total_linting == 1


@pytest.mark.asyncio
async def test_gemini_pool_latency_and_success_update(mock_pool_keys):
    """Valida atualizacao de media movel de latencia e contagem de sucesso."""
    manager = GeminiPoolManager(read_registry=False)
    key, sha = manager.get_key_for_workload(GeminiWorkload.TRIAGEM)

    manager.mark_success(key, latency_ms=100.0)
    summary = manager.get_telemetry_summary()
    entry = [s for s in summary if s["sha8"] == sha][0]

    assert entry["successes"] == 1
    assert entry["attempts"] == 1
    # Inicial era 250, (250*0.7) + (100*0.3) = 175.0 + 30.0 = 205.0
    assert entry["avg_latency_ms"] == 205.0


@pytest.mark.asyncio
async def test_telemetry_table_zero_plaintext_leak(mock_pool_keys):
    """Garante que a tabela Markdown gerada nao expoe chaves em texto claro."""
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
        return "Edi\u00e7\u00e3o at\u00f4mica executada com sucesso", {"totalTokenCount": 42}

    with patch("llm.gemini._execute_primary_request", side_effect=fake_execute_primary):
        text, usage = await call_gemini_flash_lite(
            session=mock_session,
            user_prompt="Substituir bloco X por Y",
            workload=GeminiWorkload.ATOMIC_EDITS,
            max_retries=2,
        )

        assert "Edi\u00e7\u00e3o at\u00f4mica executada com sucesso" in text
        assert usage["totalTokenCount"] == 42
        assert call_count == 2


@pytest.mark.asyncio
async def test_gemini_pool_429_isolation_is_per_model(mock_pool_keys):
    """429 em gemini-pro-latest nao pode quarentenar a chave para gemini-3.5-flash-lite nem 3.8-flash."""
    manager = GeminiPoolManager(read_registry=False)
    for k in mock_pool_keys:
        manager.mark_failure(k, status_code=429, retry_after_s=37000.0, model="gemini-pro-latest")

    assert manager.available_keys_count(model="gemini-pro-latest") == 0
    assert manager.available_keys_count(model="gemini-3.5-flash-lite") == 5
    assert manager.available_keys_count(model="gemini-3.8-flash") == 5

    key_lite, _ = manager.get_key_for_workload(GeminiWorkload.TRIAGEM, model="gemini-3.5-flash-lite")
    assert key_lite in mock_pool_keys


@pytest.mark.asyncio
async def test_gemini_pool_ensure_keys_tracks_extra_keys(mock_pool_keys):
    """Chaves extras fora do prefixo numerado 1..20 passam a ser rastreadas no pool."""
    manager = GeminiPoolManager(read_registry=False)
    extra_key = "CHAVE_SINTETICA_EXTRA_KEY_9999999999999999999999999999"
    manager.ensure_keys([*mock_pool_keys, extra_key])

    assert manager.total_keys() == 6
    manager.mark_failure(extra_key, status_code=429, retry_after_s=120.0, model="gemini-pro-latest")
    assert manager.available_keys_count(model="gemini-pro-latest") == 5
    assert manager.available_keys_count(model="gemini-3.5-flash-lite") == 6


@pytest.mark.asyncio
async def test_custom_agents_routing_hierarchy_in_runtime(monkeypatch):
    """Custom agents privilegiam especialistas locais/free, 3.5-flash-lite em fast_operations e 3.8-flash em reasoning."""
    from datetime import UTC, datetime

    import core.runtime as te
    from core.schemas import Task
    from llm.orchestrator import _prepare_routing_pipeline

    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    te._maybe_reload_config()

    async def _passthrough_gate(models, _manager, _task):
        return models

    with patch("llm.orchestrator._apply_model_health_gate", new=_passthrough_gate):
        # Fast operations / Triagem: gemini-3.5-flash-lite primeiro
        t_disp = Task(
            id="T-disp",
            description="triagem e encaminhamento",
            agent="@dispatcher",
            status="running",
            timestamp=datetime.now(UTC).isoformat(),
        )
        m_disp, _, _ = await _prepare_routing_pipeline(t_disp, MagicMock())
        assert m_disp[0] == "gemini-3.5-flash-lite"

        # Fast operations / Codigo (@implementor / @verifier): coder local e free especializados na frente,
        # seguido de gemini-3.5-flash-lite antes de gemini-3.8-flash
        for agent in ("@implementor", "@verifier"):
            t_code = Task(
                id=f"T-{agent}",
                description="linting e patch",
                agent=agent,
                status="running",
                timestamp=datetime.now(UTC).isoformat(),
            )
            m_code, _, _ = await _prepare_routing_pipeline(t_code, MagicMock())
            assert m_code[0] == "qwen2.5-coder:7b-instruct-q5_K_M"
            assert m_code.index("gemini-3.5-flash-lite") < m_code.index("gemini-3.8-flash")

        # Deep thinking / Reasoning (@chico, @maverick, @architect, @auditor): gemini-3.8-flash primeiro,
        # com laguna/3.5-flash-lite antes de gemini-4-neon
        for agent in ("@chico", "@maverick", "@architect", "@auditor"):
            t_reason = Task(
                id=f"T-{agent}",
                description="raciocinio sistemico",
                agent=agent,
                status="running",
                timestamp=datetime.now(UTC).isoformat(),
            )
            m_reason, _, _ = await _prepare_routing_pipeline(t_reason, MagicMock())
            assert m_reason[0] == "gemini-3.8-flash", f"{agent} selecionou {m_reason}"
            assert m_reason.index("gemini-3.5-flash-lite") < m_reason.index("gemini-4-neon")
