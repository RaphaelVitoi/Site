# pylint: disable=wrong-import-position
"""Auditoria Estrita do Servidor de Inferencia SOTA (gemma_server.py)."""

import os
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

# Setup inicial para evitar colapso de ambiente ausente durante o spawn do app
os.environ["API_SECRET_TOKEN"] = "test-token-sota-gold"  # noqa: S105

from engine.gemma_server import (
    API_SECRET_TOKEN,
    RATE_LIMIT_STORE,
    InferenceRequest,
    PhysicsSnapshot,
    _build_messages,
    app,
    normalize_model,
)

client = TestClient(app)


@pytest.mark.unit
def test_root_health_check():
    """Valida o endpoint raiz e as metricas vitais do motor."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "Motor SOTA Operacional" in data["status"]
    assert "backend" in data


@pytest.mark.unit
def test_generate_auth_failure():
    """Valida a blindagem SOTA contra requisicoes sem criptografia (X-Vitoi-Auth)."""
    RATE_LIMIT_STORE.clear()
    response = client.post("/generate", json={"prompt": "teste SOTA"}, headers={"X-Vitoi-Auth": "wrong-token"})
    assert response.status_code == 403
    assert "Acesso Negado" in response.json()["detail"]


@pytest.mark.unit
@patch("engine.gemma_server._get_rag_context_async", new_callable=AsyncMock)
@patch("engine.gemma_server._orchestrate_streams")
def test_generate_success_stream(mock_orchestrate, mock_rag):
    """Valida a orquestracao e o streaming hibrido (Friccao Zero)."""
    mock_rag.return_value = ""

    async def mock_stream(*_args, **_kwargs):
        yield "SOTA "
        yield "STREAM "
        yield "OK"

    mock_orchestrate.side_effect = mock_stream

    headers = {"X-Vitoi-Auth": API_SECRET_TOKEN or ""}
    payload = {"prompt": "Inicie o motor quantico.", "model": "31b", "max_tokens": 100}
    RATE_LIMIT_STORE.clear()

    response = client.post("/generate", json=payload, headers=headers)

    assert response.status_code == 200
    assert response.text == "SOTA STREAM OK"
    assert "text/plain" in response.headers.get("content-type", "")


@pytest.mark.unit
def test_normalize_model_logic():
    """Valida a ontologia de normalizacao de modelos da Mente Coletiva."""
    assert normalize_model("gemma-4-31b-it") == "31b_cloud"
    assert normalize_model("gemma4:26b") == "12b"
    assert normalize_model("Qwen-coder") == "qwen"
    assert normalize_model("llama-3-8b") == "llama3_8b"
    assert normalize_model("gemma-4-4b") == "e4b"
    assert normalize_model("gemma-4-e2b") == "e2b"
    assert normalize_model("gemma4:12b") == "12b"
    assert normalize_model("deepseek-coder:1.3b") == "deepseek"
    assert normalize_model("") == "12b"  # SOTA default local model is 12b


@pytest.mark.unit
def test_build_messages_with_snapshot():
    """Audita a injecao de PhysicsSnapshot no framing agentico."""
    snapshot = PhysicsSnapshot(heroStack=100.0, pot=10.0, heroInvested=2.0, position="BTN", referenceStatus="baseline")
    req = InferenceRequest(prompt="Acao?", physics_snapshot=snapshot)
    msgs = _build_messages(req, "")

    user_content = msgs[1]["content"]
    assert "[SOTA_SNAPSHOT_ACTIVE]" in user_content
    assert "Hero Stack: 100.0bb" in user_content
    assert "Position: BTN" in user_content


@pytest.mark.unit
def test_multimodal_vision_inference_request():
    """Valida o payload multimodal com imagens em base64 e audio para Gemma 4."""
    req = InferenceRequest(
        prompt="Analise este screenshot da mesa e diga as odds.",
        images=[
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        ],
        audios=["data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="],
        model="12b",
    )
    assert req.images is not None
    assert len(req.images) == 1
    assert req.audios is not None
    assert len(req.audios) == 1
    assert normalize_model(req.model) == "12b"
