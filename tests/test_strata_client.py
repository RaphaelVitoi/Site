"""
Testes unitarios automatizados para o cliente e integracao Strata v0.1.39.
Governança: Protocolo Chico SOTA v8.0 Gold.
"""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from engine.llm_api import _resolve_model_provider_and_target
from llm.strata_client import (
    AsyncStrataClient,
    LocalStrataClient,
    sanitize_think_tags,
)


def test_sanitize_think_tags() -> None:
    """Verifica a remocao confiavel de blocos de raciocinio <think>."""
    raw = "<think>Analise interna do modelo</think>Resultado final limpo"
    assert sanitize_think_tags(raw) == "Resultado final limpo"
    assert sanitize_think_tags("") == ""
    assert sanitize_think_tags("Sem tags aqui") == "Sem tags aqui"
    multiline = "<think>\nLinha 1\nLinha 2\n</think>\nTexto valido"
    assert sanitize_think_tags(multiline) == "Texto valido"


def test_resolve_model_provider_strata() -> None:
    """Verifica se o roteador de modelos identifica variantes do Strata e Qwen3.8."""
    provider, target = _resolve_model_provider_and_target("strata-coder", [], [], [])
    assert provider == "strata"
    assert target == "strata-coder"

    provider, target = _resolve_model_provider_and_target("qwen3.8-flash-next", [], [], [])
    assert provider == "strata"
    assert target == "qwen3.8-flash-next"


def test_local_strata_health_ok() -> None:
    """Testa deteccao de saude quando o servidor esta pronto."""
    with patch.object(LocalStrataClient, "_request", return_value=(200, b'{"status": "loaded"}')):
        client = LocalStrataClient()
        assert client.is_healthy() is True


def test_local_strata_health_offline() -> None:
    """Testa retorno gracioso False quando o servidor esta offline."""
    with patch.object(LocalStrataClient, "_request", side_effect=OSError("Connection refused")):
        client = LocalStrataClient()
        assert client.is_healthy() is False


def test_local_strata_is_sleeping() -> None:
    """Testa deteccao de descarregamento por ociosidade via /props."""
    with patch.object(LocalStrataClient, "_request", return_value=(200, b'{"is_sleeping": true}')):
        client = LocalStrataClient()
        assert client.is_sleeping() is True


def test_local_strata_vram_elastic() -> None:
    """Testa chamada ao endpoint /v1/vram para redimensionamento elastico."""
    with patch.object(LocalStrataClient, "_request", return_value=(200, b"{}")):
        client = LocalStrataClient()
        assert client.set_vram_elastic(reserve_mib=4000) is True
        assert client.set_vram_elastic(reserve_mib=None) is True


def test_local_strata_chat_completion() -> None:
    """Testa chat completion com sanitizacao e telemetria injetada."""
    fake_output = {
        "id": "chatcmpl-123",
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "<think>pensando...</think>Resposta assertiva",
                }
            }
        ],
    }
    with patch.object(
        LocalStrataClient,
        "_request",
        return_value=(200, json.dumps(fake_output).encode("utf-8")),
    ):
        client = LocalStrataClient()
        res = client.chat_completion(messages=[{"role": "user", "content": "Ola"}])

        assert res["choices"][0]["message"]["content"] == "Resposta assertiva"
        assert "_sota_telemetry" in res
        assert res["_sota_telemetry"]["engine"] == "Strata-v0.1.39"
        assert client.complete("Ola") == "Resposta assertiva"


def test_local_strata_responses_api() -> None:
    """Testa o endpoint /v1/responses (OpenAI Responses API) adicionado na v0.1.39."""
    fake_output = {
        "id": "resp-456",
        "output": [{"type": "message", "content": [{"type": "text", "text": "Codigo gerado"}]}],
    }
    with patch.object(
        LocalStrataClient,
        "_request",
        return_value=(200, json.dumps(fake_output).encode("utf-8")),
    ):
        client = LocalStrataClient()
        res = client.responses(
            input_messages=[{"role": "user", "content": "Refatore o modulo"}],
            reasoning_effort="low",
        )

        assert "_sota_telemetry" in res
        assert res["_sota_telemetry"]["api"] == "responses"
        assert res["id"] == "resp-456"


def test_local_strata_unload_load() -> None:
    """Testa endpoints de ciclo de vida /unload e /load."""
    with patch.object(LocalStrataClient, "_request", return_value=(200, b"{}")):
        client = LocalStrataClient()
        assert client.unload() is True
        assert client.load() is True


@pytest.mark.asyncio
async def test_async_strata_client() -> None:
    """Testa cliente assincrono do Strata com sessao simulada."""
    client = AsyncStrataClient()

    # Mock health
    mock_session = MagicMock()
    mock_resp = AsyncMock()
    mock_resp.status = 200
    mock_resp.json.return_value = {"status": "ok"}
    mock_session.get.return_value.__aenter__.return_value = mock_resp

    healthy = await client.is_healthy(session=mock_session)
    assert healthy is True

    # Mock chat completion
    mock_post_resp = AsyncMock()
    mock_post_resp.status = 200
    mock_post_resp.json.return_value = {"choices": [{"message": {"role": "assistant", "content": "Async ok"}}]}
    mock_session.post.return_value.__aenter__.return_value = mock_post_resp

    res = await client.chat_completion(
        session=mock_session,
        messages=[{"role": "user", "content": "Ping"}],
    )
    assert res["choices"][0]["message"]["content"] == "Async ok"
    assert res["_sota_telemetry"]["engine"] == "Strata-v0.1.39"
