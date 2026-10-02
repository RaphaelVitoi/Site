# ruff: noqa: I001
# pylint: disable=protected-access
"""
Testes SOTA para a camada LLM (session.py, budget.py, routing.py) do Nexus Orchestrator.
"""

import asyncio
from datetime import UTC, datetime, timedelta
import json
from unittest.mock import AsyncMock, MagicMock, patch
import urllib.error

import pytest

import core.config
from core.schemas import Task
import llm.session as session
import llm.budget as budget
import llm.routing as routing


@pytest.fixture(autouse=True)
def patch_valid_agents(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante que os agentes de teste sao validos."""
    monkeypatch.setattr(core.config, "VALID_AGENTS", ["@maverick", "@chico"])


# ==============================================================================
# Testes do modulo Session
# ==============================================================================


@pytest.mark.unit
def test_get_api_semaphore() -> None:
    """Valida que o semaforo de concorrencia e criado e retornado corretemente."""
    sem = session.get_api_semaphore()
    assert isinstance(sem, asyncio.Semaphore)


@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_global_http_session() -> None:
    """Valida o singleton de ClientSession do aiohttp no session.py."""
    with patch("llm.session._GLOBAL_HTTP_SESSION", None):
        sess = await session.get_global_http_session()
        assert not sess.closed
        sess2 = await session.get_global_http_session()
        assert sess is sess2
        await sess.close()


@pytest.mark.unit
def test_sync_fallback_request_validation() -> None:
    """Valida que esquemas de URL invalidos/suspeitos sao bloqueados."""
    code, body = session._sync_fallback_request("file:///etc/passwd", {}, {}, 5)
    assert code == 0
    assert "Bloqueio de Seguranca" in body


@pytest.mark.unit
def test_sync_fallback_request_success() -> None:
    """Valida execucao com sucesso da requisicao sincrona de fallback."""
    mock_response = MagicMock()
    mock_response.getcode.return_value = 200
    mock_response.read.return_value = b'{"result": "success"}'

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.return_value.__enter__.return_value = mock_response
        code, body = session._sync_fallback_request("https://api.openai.com/v1", {"p": 1}, {}, 5)
        assert code == 200
        assert json.loads(body) == {"result": "success"}


@pytest.mark.unit
def test_sync_fallback_request_httperror() -> None:
    """Valida tratamento de erro HTTPError da urllib."""
    mock_fp = MagicMock()
    mock_fp.closed = False
    mock_fp.read.return_value = b"Unauthorized key"
    err = urllib.error.HTTPError("https://api.com", 401, "Unauthorized", None, mock_fp)  # type: ignore

    with patch("urllib.request.urlopen", side_effect=err):
        code, body = session._sync_fallback_request("https://api.openai.com/v1", {}, {}, 5)
        assert code == 401
        assert "Unauthorized key" in body


@pytest.mark.unit
def test_sync_fallback_request_urlerror() -> None:
    """Valida tratamento de erro URLError da urllib."""
    err = urllib.error.URLError("DNS resolution failed")
    with patch("urllib.request.urlopen", side_effect=err):
        code, body = session._sync_fallback_request("https://api.openai.com/v1", {}, {}, 5)
        assert code == 0
        assert "DNS/TCP" in body


# ==============================================================================
# Testes do modulo Budget
# ==============================================================================


@pytest.mark.unit
@pytest.mark.parametrize(
    ("key_val", "expected"),
    [
        ("sk-proj-1234", True),
        ("sk-REPLACE-me", False),
        ("", False),
        ("SUA_KEY_AQUI", False),
        ("key_ends_with_XfUE", False),  # XfUE eh o sufixo revogado padrao
    ],
)
def test_is_real_key_value(key_val: str, expected: bool) -> None:
    """Valida a heuristica que detecta chaves reais vs placeholders/revogadas."""
    assert budget._is_real_key_value(key_val) == expected


@pytest.mark.unit
def test_score_key_from_stats() -> None:
    """Valida calculo de score de chave com base no historico de latencia/falhas."""
    # Zero tentativas
    assert budget._score_key_from_stats({}) == 50.0

    # 100% sucesso, baixa latencia
    stats_good = {"attempts": 10, "successes": 10, "failures": 0, "avg_latency_ms": 200}
    score_good = budget._score_key_from_stats(stats_good)

    # Algumas falhas, latencia alta
    stats_bad = {"attempts": 10, "successes": 7, "failures": 3, "avg_latency_ms": 2500}
    score_bad = budget._score_key_from_stats(stats_bad)

    assert score_good > score_bad


@pytest.mark.asyncio
@pytest.mark.unit
async def test_rank_keys_by_health() -> None:
    """Valida ordenacao das chaves conforme o score de saude (health)."""
    mock_manager = MagicMock()
    # Mock de estatistica para chave 1 (boa) e chave 2 (ruim)
    mock_manager.get_key_recent_stats = AsyncMock(
        side_effect=lambda _p, key_hash, **kwargs: (
            {"attempts": 10, "successes": 10, "failures": 0, "avg_latency_ms": 100}
            if "good" in key_hash
            else {"attempts": 10, "successes": 2, "failures": 8, "avg_latency_ms": 2000}
        )
    )

    # Usando fingerprints unicos
    with patch("llm.budget._key_fingerprint", side_effect=lambda _p, k: f"hash_{k}"):
        keys = ["bad_key", "good_key"]
        ranked = await budget._rank_keys_by_health("gemini", keys, mock_manager)
        # A boa deve vir primeiro
        assert ranked == ["good_key", "bad_key"]


@pytest.mark.asyncio
@pytest.mark.unit
async def test_is_cognitive_hibernation_active() -> None:
    """Valida deteccao do estado de hibernacao cognitiva."""
    mock_manager = MagicMock()
    mock_manager.get_system_state = AsyncMock(return_value=(datetime.now(UTC) + timedelta(minutes=10)).isoformat())

    task_normal = Task(id="T1", description="normal task", agent="@maverick", timestamp=datetime.now(UTC).isoformat())
    task_skip_llm = Task(
        id="T2",
        description="skip task",
        agent="@maverick",
        timestamp=datetime.now(UTC).isoformat(),
        metadata={"skip_llm": True},
    )

    # Tarefa normal deve respeitar a hibernacao
    assert await budget.is_cognitive_hibernation_active(mock_manager, task_normal) is True
    # Tarefa que pula LLM nao deve ser afetada por hibernacao
    assert await budget.is_cognitive_hibernation_active(mock_manager, task_skip_llm) is False


@pytest.mark.asyncio
@pytest.mark.unit
async def test_async_token_bucket() -> None:
    """Valida o funcionamento do rate limiter SOTA (AsyncTokenBucket)."""
    bucket_limiter = budget.AsyncTokenBucket(capacity=2, fill_rate_per_minute=60)  # 1 token/sec
    # Deve consumir imediatamente
    await bucket_limiter.consume(1)
    await bucket_limiter.consume(1)

    t0 = asyncio.get_event_loop().time()
    # Deve pausar ate encher
    await bucket_limiter.consume(1)
    t1 = asyncio.get_event_loop().time()
    assert (t1 - t0) >= 0.8  # Espera aproximada de 1s para 1 token


# ==============================================================================
# Testes do modulo Routing
# ==============================================================================


@pytest.mark.unit
@pytest.mark.parametrize(
    ("model", "expected_provider"),
    [
        ("gemini-3.7-flash", "gemini"),
        ("anthropic/claude-3-opus", "anthropic"),
        ("meta-llama/llama-3.3-70b-instruct", "openrouter"),
        ("gemma-2-27b-it", "local"),
        ("unknown-model", None),
    ],
)
def test_infer_provider_for_model(model: str, expected_provider: str | None) -> None:
    """Valida inferencia correta do provedor pelo nome/slug do modelo."""
    assert routing._infer_provider_for_model(model) == expected_provider


@pytest.mark.unit
def test_reorder_models_for_economy() -> None:
    """Valida reordenacao economica priorizando custo/local."""
    models = ["meta-llama/llama-3.3-70b-instruct:free", "gemini-3.5-flash-lite", "gemini-3.7-flash"]

    with patch("core.runtime._feature_enabled", return_value=True):
        reordered = routing._reorder_models_for_economy(models, prefer_local=False)
        # Gemini 3.5 Flash Lite deve ser o primeiro (mais economico)
        assert reordered[0] == "gemini-3.5-flash-lite"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_apply_model_health_gate() -> None:
    """Valida gate de saude de modelos removendo modelos com falhas recorrentes."""
    mock_manager = MagicMock()
    mock_manager._get_async_db = MagicMock()

    with patch("llm.routing._get_model_recent_health") as mock_health:
        mock_health.side_effect = lambda _p, model, _m, _w: (
            {"attempts": 10, "successes": 0, "success_rate_pct": 0.0}
            if "model-a" in model
            else {"attempts": 10, "successes": 10, "success_rate_pct": 100.0}
        )

        with patch(
            "core.runtime._health_gate_value",
            side_effect=lambda key, default: (
                True
                if key == "enabled"
                else 3
                if key == "min_attempts"
                else 50.0
                if key == "min_success_rate_pct"
                else default
            ),
        ):
            models = ["openrouter/model-a:free", "openrouter/model-b:free"]
            task = Task(id="T1", description="desc", agent="@maverick", timestamp=datetime.now(UTC).isoformat())

            filtered = await routing._apply_model_health_gate(models, mock_manager, task)
            # Apenas o saudavel (model-b) deve restar
            assert filtered == ["openrouter/model-b:free"]


# ==============================================================================
# Testes SOTA de Resolucao de Modelos, Hermes Harness e Ollama Cloud
# ==============================================================================


@pytest.mark.unit
def test_resolve_model_provider_and_target_sota() -> None:
    """Valida mapeamento deterministico de modelos locais, Cloud Ollama, Hermes/Nous e APIs."""
    from engine.llm_api import _resolve_model_provider_and_target

    gemini_keys = ["CHAVE_SINTETICA_GEMINI_POOL_01"]
    anthropic_keys = ["CHAVE_SINTETICA_ANTHROPIC_01"]
    openrouter_keys = ["CHAVE_SINTETICA_OPENROUTER_01"]
    nous_keys = ["CHAVE_SINTETICA_NOUS_TOKEN_01"]

    cases = [
        ("poolside/laguna-s-2.1:free", "nous", "poolside/laguna-s-2.1:free"),
        ("laguna", "nous", "poolside/laguna-s-2.1:free"),
        ("stealth/space-bunny-alpha", "nous", "stealth/space-bunny-alpha"),
        ("hermes", "nous", "nousresearch/hermes-3-llama-3.1-70b"),
        ("gpt-oss:120b", "ollama", "gpt-oss:120b-cloud"),
        ("gpt-oss:20b", "ollama", "gpt-oss:20b-cloud"),
        ("gemma4:31b", "ollama", "gemma4:31b-cloud"),
        ("glm-5.1:cloud", "ollama", "glm-5.1:cloud"),
        ("ai9stars_G9v3-3B", "local_llama", "ai9stars_G9v3-3B"),
        ("qwen2.5-coder-1.5b", "local_llama", "qwen2.5-coder-1.5b"),
        ("gemini-3.5-flash-lite", "gemini", "gemini-3.5-flash-lite"),
        ("claude-sonnet-5", "anthropic", "claude-sonnet-5"),
    ]

    for model, expected_prov, expected_target in cases:
        prov, target = _resolve_model_provider_and_target(
            model, gemini_keys, anthropic_keys, openrouter_keys, nous_keys=nous_keys
        )
        assert prov == expected_prov, f"Falha para modelo {model}: esperado {expected_prov}, obteve {prov}"
        assert target == expected_target, f"Falha para modelo {model}: esperado {expected_target}, obteve {target}"


@pytest.mark.unit
def test_extract_provider_keys_filters_project_ids() -> None:
    """Valida que _extract_provider_keys descarta poluição de variaveis de projeto."""
    from engine.llm_api import _extract_provider_keys

    dummy_env = {
        "GEMINI_PROJECT_ID": "projects/my-test-project-12345",
        "GEMINI_PROJECT_NAME": "original-my-project-name",
        "GEMINI_API_KEY": "CHAVE_SINTETICA_GEMINI_POOL_01",
        "OPENROUTER_API_KEY": "CHAVE_SINTETICA_OPENROUTER_01",
        "NOUS_API_KEY": "CHAVE_SINTETICA_NOUS_TOKEN_01",
    }

    gemini_keys, anthropic_keys, openrouter_keys, nous_keys = _extract_provider_keys(dummy_env)
    assert len(gemini_keys) == 1
    assert gemini_keys[0] == "CHAVE_SINTETICA_GEMINI_POOL_01"
    assert "projects/my-test-project-12345" not in gemini_keys
    assert len(openrouter_keys) == 1
    assert len(nous_keys) == 1
