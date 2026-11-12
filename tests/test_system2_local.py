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
        for k in ("CHICO_S2_FAST_MODEL", "CHICO_S2_DEEP_MODEL", "CHICO_S2_CODE_MODEL"):
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
        patch.object(system2_local, "_ollama_model_fits_ram", return_value=True),
        patch("urllib.request.urlopen", return_value=fake_resp),
        # hermetico: se o caminho local falhar, o fallback nao pode sair para a rede
        patch.object(system2_local, "_flash_lite_fallback", return_value=("FALLBACK-INESPERADO", {})),
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
    # formato e limites dos campos, sem pressupor GPU especifica:
    # hosts com GPU integrada ou leitura de registro indisponivel medem 0.0
    assert isinstance(snap["ram_gb"], float)
    assert snap["ram_gb"] >= 0.0
    assert isinstance(snap["vram_gb"], float)
    assert snap["vram_gb"] >= 0.0


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
        # hermetico: se o llama-server falhar, o fallback nao pode sair para a rede
        patch.object(system2_local, "_flash_lite_fallback", return_value=("FALLBACK-INESPERADO", {})),
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
        patch.object(system2_local, "_ollama_model_fits_ram", return_value=True),
        patch("urllib.request.urlopen", return_value=fake_resp),
        # hermetico: se o caminho local falhar, o fallback nao pode sair para a rede
        patch.object(system2_local, "_flash_lite_fallback", return_value=("FALLBACK-INESPERADO", {})),
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


# ---------------------------------------------------------------------------
# _ollama_model_fits_ram — implementacao real, fontes de telemetria mockadas
# ---------------------------------------------------------------------------

_GIB = 1024**3


def _ps_entry(name: str, size_gib: float, vram_gib: float = 0.0) -> dict:
    return {"name": name, "size": int(size_gib * _GIB), "size_vram": int(vram_gib * _GIB)}


def test_ollama_model_fits_ram_casos() -> None:
    """RAM suficiente/insuficiente/zero-valido, modelo carregado, telemetria
    ausente (None) e memoria recuperavel de modelo ocioso -- sem rede."""
    with (
        patch.dict(system2_local._MANIFEST_SIZES, {"m:big": 10.0}, clear=True),
        patch.object(system2_local, "_vram_total_gb", return_value=0.0),
        patch.object(system2_local, "_ollama_ps_models", return_value=[]),
    ):
        # needed = 10.0 * 1.4 = 14 GiB
        with patch.object(system2_local, "_available_ram_gb", return_value=20.0):
            assert system2_local._ollama_model_fits_ram("m:big") is True
        with patch.object(system2_local, "_available_ram_gb", return_value=5.0):
            assert system2_local._ollama_model_fits_ram("m:big") is False
        # 0.0 e leitura VALIDA de RAM esgotada -- nao e telemetria ausente
        with patch.object(system2_local, "_available_ram_gb", return_value=0.0):
            assert system2_local._ollama_model_fits_ram("m:big") is False
        # None = telemetria falhou -> nao bloqueia
        with patch.object(system2_local, "_available_ram_gb", return_value=None):
            assert system2_local._ollama_model_fits_ram("m:big") is True
        # modelo fora do manifesto -> sem size_gb -> mantem a tentativa
        with patch.object(system2_local, "_available_ram_gb", return_value=0.0):
            assert system2_local._ollama_model_fits_ram("desconhecido:9b") is True


def test_ollama_model_fits_ram_carregado_e_recuperavel() -> None:
    with (
        patch.dict(system2_local._MANIFEST_SIZES, {"m:big": 10.0}, clear=True),
        patch.object(system2_local, "_vram_total_gb", return_value=0.0),
    ):
        # ja carregado: consumo ja esta debitado do available -> True
        with (
            patch.object(system2_local, "_available_ram_gb", return_value=1.0),
            patch.object(system2_local, "_ollama_ps_models", return_value=[_ps_entry("m:big", 12.0)]),
        ):
            assert system2_local._ollama_model_fits_ram("m:big") is True
        # modelo ocioso ocupa RAM recuperavel (size - size_vram): 20-4=16 GiB
        # cobre o deficit de 14-5=9 GiB -> Ollama pode evictar e admitir
        with (
            patch.object(system2_local, "_available_ram_gb", return_value=5.0),
            patch.object(system2_local, "_ollama_ps_models", return_value=[_ps_entry("outro:1b", 20.0, vram_gib=4.0)]),
        ):
            assert system2_local._ollama_model_fits_ram("m:big") is True
        # VRAM total cobre a faixa intermediaria -> delega admissao ao Ollama
        with (
            patch.object(system2_local, "_available_ram_gb", return_value=5.0),
            patch.object(system2_local, "_ollama_ps_models", return_value=[]),
            patch.object(system2_local, "_vram_total_gb", return_value=12.0),
        ):
            assert system2_local._ollama_model_fits_ram("m:big") is True
