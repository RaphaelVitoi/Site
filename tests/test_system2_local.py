"""Testes hermeticos para llm/system2_local.py (System-2 Ollama + fallback)."""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from llm import system2_local


def test_resolve_model_usa_manifesto() -> None:
    assert system2_local.resolve_model("qwen3_5_4b") == "qwen3.5:4b"
    assert system2_local.resolve_model("qwen3.8:27b") == "qwen3.8:27b"
    assert system2_local.resolve_model("tag-desconhecida:1b") == "tag-desconhecida:1b"


def test_tier_model_defaults() -> None:
    with patch.dict("os.environ", {}, clear=False):
        for k in ("CHICO_S2_FAST_MODEL", "CHICO_S2_DEEP_MODEL"):
            import os

            os.environ.pop(k, None)
        assert system2_local.tier_model("fast") == "qwen3.5:4b"
        assert system2_local.tier_model("deep") == "qwen3.8:27b"
        assert system2_local.tier_model("code") == "qwen-code-surgical:latest"


def test_tier_model_env_override() -> None:
    with patch.dict("os.environ", {"CHICO_S2_FAST_MODEL": "qwen_coder_1_5b"}):
        assert system2_local.tier_model("fast") == "qwen2.5-coder:1.5b"


def test_ollama_online_falso_quando_offline() -> None:
    with patch("urllib.request.urlopen", side_effect=OSError("refused")):
        assert system2_local.ollama_online() is False


def test_system2_generate_local_primeiro() -> None:
    fake_resp = MagicMock()
    fake_resp.read.return_value = json.dumps({"response": "resposta local", "eval_count": 12}).encode()
    fake_resp.__enter__.return_value = fake_resp

    with (
        patch.object(system2_local, "ollama_online", return_value=True),
        patch("urllib.request.urlopen", return_value=fake_resp),
    ):
        text, meta = system2_local.system2_generate("pergunta", tier="fast")

    assert text == "resposta local"
    assert meta["engine"] == "ollama-local"
    assert meta["model"] == "qwen3.5:4b"
    assert meta["fallback_used"] is False
    assert "ram_gb" in meta["hardware"]


def test_system2_generate_cai_para_cloud_quando_offline() -> None:
    with (
        patch.object(system2_local, "ollama_online", return_value=False),
        patch.object(
            system2_local, "_flash_lite_fallback", return_value=("resposta cloud", {"model": "gemini-3.5-flash-lite"})
        ) as mock_fb,
    ):
        text, meta = system2_local.system2_generate("pergunta", tier="fast")

    mock_fb.assert_called_once()
    assert text == "resposta cloud"
    assert meta["engine"] == "gemini-3.5-flash-lite"
    assert meta["fallback_used"] is True


def test_system2_generate_sem_nada_devolve_meta_erro() -> None:
    with (
        patch.object(system2_local, "ollama_online", return_value=False),
        patch.object(system2_local, "_flash_lite_fallback", side_effect=RuntimeError("429")),
    ):
        text, meta = system2_local.system2_generate("pergunta", tier="fast")
    assert text == ""
    assert meta["engine"] == "none"
    assert meta["fallback_used"] is True


def test_system2_generate_no_cloud_quando_desligado() -> None:
    with patch.object(system2_local, "ollama_online", return_value=False):
        text, meta = system2_local.system2_generate("pergunta", allow_cloud_fallback=False)
    assert text == ""
    assert meta["engine"] == "none"
    assert "no-cloud-fallback" in meta["error"]


def test_hardware_snapshot_tem_campos() -> None:
    snap = system2_local.hardware_snapshot()
    assert snap["cpu_threads"] > 0
    assert "ram_gb" in snap
    assert "vram_gb" in snap
    # no Windows mede VRAM real (RX 570 8GB); fora do Windows pode ser 0
    if system2_local.os.name == "nt":
        assert snap["vram_gb"] >= 4.0


@pytest.mark.parametrize("tier", ["fast", "balanced", "deep", "code", "moe", "inexistente"])
def test_tier_model_sempre_resolve(tier: str) -> None:
    model = system2_local.tier_model(tier)
    assert isinstance(model, str)
    assert model


def test_tier_model_moe_default() -> None:
    with patch.dict("os.environ", {}, clear=False):
        import os

        os.environ.pop("CHICO_S2_MOE_MODEL", None)
        assert system2_local.tier_model("moe") == "qwen3.6-35b-a3b-mtp"


def test_llama_server_online_falso_quando_offline() -> None:
    with patch("urllib.request.urlopen", side_effect=OSError("refused")):
        assert system2_local.llama_server_online() is False


def _fake_chat_response(text: str = "resposta moe") -> MagicMock:
    fake = MagicMock()
    fake.read.return_value = json.dumps(
        {
            "choices": [{"message": {"content": text}}],
            "usage": {"completion_tokens": 42},
        }
    ).encode()
    fake.__enter__.return_value = fake
    return fake


def test_system2_generate_moe_usa_llama_server() -> None:
    with (
        patch.object(system2_local, "llama_server_online", return_value=True),
        patch("urllib.request.urlopen", return_value=_fake_chat_response()),
    ):
        text, meta = system2_local.system2_generate("pergunta", tier="moe")
    assert text == "resposta moe"
    assert meta["engine"] == "llama-cpp-vulkan"
    assert meta["model"] == "qwen3.6-35b-a3b-mtp"
    assert meta["fallback_used"] is False
    assert meta["tier"] == "moe"


def test_system2_generate_moe_cai_para_ollama_deep() -> None:
    fake_resp = MagicMock()
    fake_resp.read.return_value = json.dumps({"response": "resposta deep", "eval_count": 9}).encode()
    fake_resp.__enter__.return_value = fake_resp

    with (
        patch.object(system2_local, "llama_server_online", return_value=False),
        patch.object(system2_local, "ollama_online", return_value=True),
        patch("urllib.request.urlopen", return_value=fake_resp),
    ):
        text, meta = system2_local.system2_generate("pergunta", tier="moe")

    assert text == "resposta deep"
    assert meta["engine"] == "ollama-local"
    assert meta["model"] == "qwen3.8:27b"
    assert meta["degraded_from"] == "llama-cpp-vulkan"


def test_system2_generate_moe_cai_para_cloud_sem_locais() -> None:
    with (
        patch.object(system2_local, "llama_server_online", return_value=False),
        patch.object(system2_local, "ollama_online", return_value=False),
        patch.object(
            system2_local, "_flash_lite_fallback", return_value=("resposta cloud", {"model": "gemini-3.5-flash-lite"})
        ),
    ):
        text, meta = system2_local.system2_generate("pergunta", tier="moe")

    assert text == "resposta cloud"
    assert meta["engine"] == "gemini-3.5-flash-lite"
    assert meta["fallback_used"] is True
