"""Testes hermeticos para llm/media_pool.py (pool multimodal Gemini)."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from llm.media_pool import (
    MEDIA_MODALITIES,
    MediaPoolManager,
    _collect_modality_keys,
    _sha8,
    _validate_modality,
)


def _env_com_pools() -> dict[str, str]:
    return {
        "GEMINI_TTS_KEY": "a" * 30 + "-tts",
        "OPENROUTER_GEMINI_TTS_KEY": "o" * 30 + "-tts-or",
        "GEMINI_VIDEO_KEY": "a" * 30 + "-vid",
        "GEMINI_IMAGE_KEY_1": "a" * 30 + "-img1",
        "GEMINI_TRANSLATE_KEY": "a" * 30 + "-tr",
        "OPENROUTER_API_KEY": "o" * 30 + "-legacy",
    }


def test_validate_modality() -> None:
    assert _validate_modality("TTS") == "tts"
    with pytest.raises(ValueError, match="invalida"):
        _validate_modality("audio-3d")


def test_collect_por_modalidade_e_provider() -> None:
    env = _env_com_pools()
    tts = _collect_modality_keys(env, "tts")
    assert tts["aistudio"] == [env["GEMINI_TTS_KEY"]]
    assert tts["openrouter"] == [env["OPENROUTER_GEMINI_TTS_KEY"]]
    # modalidade sem dedicada openrouter cai no fallback OPENROUTER_API_KEY
    vid = _collect_modality_keys(env, "video")
    assert vid["openrouter"] == [env["OPENROUTER_API_KEY"]]
    # sufixo numerado aceito
    img = _collect_modality_keys(env, "image")
    assert img["aistudio"] == [env["GEMINI_IMAGE_KEY_1"]]


def test_fallback_so_sem_dedicada() -> None:
    env = {"GEMINI_TTS_KEY": "a" * 30, "GEMINI_API_KEY": "g" * 30}
    tts = _collect_modality_keys(env, "tts")
    assert tts["aistudio"] == [env["GEMINI_TTS_KEY"]]  # fallback nao entra


def test_pool_carrega_e_next_key() -> None:
    env = _env_com_pools()
    with patch.dict("os.environ", env, clear=True):
        pool = MediaPoolManager(read_registry=False)
    assert pool.total_keys("tts") == 2
    sel = pool.next_key("tts")
    assert sel.modality == "tts"
    assert sel.provider in ("aistudio", "openrouter")
    assert sel.sha8 == _sha8(sel.key)
    assert sel.key not in ("",)


def test_ordem_auto_aistudio_primeiro() -> None:
    env = _env_com_pools()
    with patch.dict("os.environ", env, clear=True):
        pool = MediaPoolManager(read_registry=False)
    # aistudio primeiro na ordem de provider
    sels = pool.iter_candidates("tts")
    assert sels[0].provider == "aistudio"
    assert sels[1].provider == "openrouter"


def test_provider_preferido_openrouter() -> None:
    env = _env_com_pools()
    env["MEDIA_POOL_PROVIDER"] = "openrouter"
    with patch.dict("os.environ", env, clear=True):
        pool = MediaPoolManager(read_registry=False)
    sels = pool.iter_candidates("tts")
    assert sels[0].provider == "openrouter"


def test_modalidade_sem_chaves_levanta() -> None:
    env = {"UNRELATED": "x"}
    with patch.dict("os.environ", env, clear=True):
        pool = MediaPoolManager(read_registry=False)
        with pytest.raises(RuntimeError, match="vazio"):
            pool.next_key("tts")


def test_circuit_breaker_401_e_429() -> None:
    env = _env_com_pools()
    with patch.dict("os.environ", env, clear=True):
        pool = MediaPoolManager(read_registry=False)
    k_or = env["OPENROUTER_GEMINI_TTS_KEY"]
    pool.mark_failure("tts", k_or, status_code=401)
    # openrouter revogada -> so aistudio sobra
    for _ in range(3):
        assert pool.next_key("tts").provider == "aistudio"

    k_as = env["GEMINI_TTS_KEY"]
    pool.mark_failure("tts", k_as, status_code=429)
    with pytest.raises(RuntimeError):
        pool.next_key("tts")


def test_telemetria_sem_segredo() -> None:
    env = _env_com_pools()
    with patch.dict("os.environ", env, clear=True):
        pool = MediaPoolManager(read_registry=False)
    tel = pool.telemetry()
    assert set(tel.keys()) == set(MEDIA_MODALITIES)
    blob = str(tel)
    for v in env.values():
        if len(v) > 20:
            assert v not in blob
    tts_tel = tel["tts"]
    assert {t["provider"] for t in tts_tel} == {"aistudio", "openrouter"}
    assert all("sha8" in t for t in tts_tel)
