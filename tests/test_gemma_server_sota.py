# pylint: disable=wrong-import-position
"""Auditoria Estrita do Servidor de Inferencia SOTA (gemma_server.py)."""

import os
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
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
def test_generate_auth_fails_closed_when_server_token_is_missing(monkeypatch: pytest.MonkeyPatch):
    """A proxy must never replace a missing credential with a predictable literal."""
    monkeypatch.setattr("engine.gemma_server.API_SECRET_TOKEN", None)
    from engine.gemma_server import verify_sota_auth

    with pytest.raises(HTTPException) as exc_info:
        verify_sota_auth(None, "any-value", None)  # type: ignore[arg-type]

    assert exc_info.value.status_code == 503


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
    # NOME EXATO VENCE HEURISTICA. Esta linha exigia "gemma4:26b" -> "12b", um
    # desvio deliberado para o cavalo-de-batalha local. O desvio foi removido em
    # 2026-09-03 por decisao do Tier 0 ("nao precisamos de 26b"), e a regra que o
    # substitui e mais forte: quem nomeia uma TAG do Ollama aponta para o disco,
    # e servir outra coisa e trocar de motor sem avisar.
    assert normalize_model("gemma4:26b") == "26b"
    assert normalize_model("Qwen-coder") == "qwen"
    assert normalize_model("llama-3-8b") == "llama3_8b"
    assert normalize_model("gemma-4-4b") == "e4b"
    assert normalize_model("gemma-4-e2b") == "e2b"
    assert normalize_model("gemma4:12b") == "12b"
    assert normalize_model("deepseek-coder:1.3b") == "deepseek"
    assert normalize_model("") == "12b"  # SOTA default local model is 12b


@pytest.mark.unit
def test_normalize_model_nao_colapsa_qwen_instalado():
    """Guarda de regressao: os 6 qwen instalados resolviam todos errado.

    Medido em 2026-09-03, antes da correcao:
      qwen2.5-coder:0.5b / 1.5b / 7b / 7b-instruct-q5_K_M  -> alias "qwen",
        que o manifesto mapeia para qwen2.5-coder:3b -- o unico qwen NAO
        instalado nesta maquina.
      qwen-pmev-math / qwen-code-surgical / qwen-poetics    -> alias "e4b",
        porque a cascata testava "latest" antes de "qwen" e aqueles perfis usam
        a tag :latest. Tres modelos `required: true` eram servidos como
        gemma4:e4b, outro motor, silenciosamente.

    A cascata de substring continua valendo para pedidos VAGOS -- e o que
    `test_normalize_model_logic` exercita com "Qwen-coder" e "llama-3-8b".
    """
    exatos = {
        "qwen2.5-coder:0.5b": "qwen_coder_0_5b",
        "qwen2.5-coder:1.5b": "qwen_coder_1_5b",
        "qwen2.5-coder:7b": "qwen_coder_7b",
        "qwen2.5-coder:7b-instruct-q5_K_M": "qwen_coder_7b_q5",
        "qwen-pmev-math:latest": "qwen_pmev_math",
        "qwen-code-surgical:latest": "qwen_code_surgical",
        "qwen-poetics:latest": "qwen_poetics",
    }
    for tag, alias_esperado in exatos.items():
        assert normalize_model(tag) == alias_esperado, (
            f"{tag} resolveu para {normalize_model(tag)}, nao {alias_esperado}"
        )

    # E o alias tambem resolve para si mesmo, sem passar pela heuristica.
    for alias_esperado in exatos.values():
        assert normalize_model(alias_esperado) == alias_esperado


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
