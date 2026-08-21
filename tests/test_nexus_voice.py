"""Auditoria e Validacao SOTA do Modulo de Voz Neural (nexus_voice.py)."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from scripts.cli.nexus_voice import (
    DEFAULT_VOICE_PTBR,
    _extract_gemini_audio_bytes,
    async_speak_text,
    play_audio_windows,
    speak_text,
    synthesize_edge_tts,
    synthesize_gemini_audio,
)


def test_extract_gemini_audio_bytes_empty_and_valid():
    """Valida a extracao resiliente de bytes de audio a partir de payloads Gemini."""
    assert _extract_gemini_audio_bytes(None) is None
    assert _extract_gemini_audio_bytes(MagicMock(candidates=[])) is None

    # Mock response com payload de audio valido
    mock_part = MagicMock()
    mock_part.inline_data.data = b"RIFF_TEST_WAV_HEADER"
    mock_candidate = MagicMock()
    mock_candidate.content.parts = [mock_part]
    mock_response = MagicMock(candidates=[mock_candidate])

    extracted = _extract_gemini_audio_bytes(mock_response)
    assert extracted == b"RIFF_TEST_WAV_HEADER"


def test_synthesize_gemini_audio_fallback_without_key(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Garante fallback gracioso quando nenhuma API Key esta configurada."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)

    out_file = tmp_path / "out.wav"
    result = synthesize_gemini_audio("Teste", "Aoede", out_file)
    assert result is False
    assert not out_file.exists()


def test_synthesize_gemini_audio_success(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Valida sintetizacao bem-sucedida via Gemini Audio quando client responde."""
    monkeypatch.setenv("GEMINI_API_KEY", "dummy_key_for_test")

    out_file = tmp_path / "out.wav"
    mock_part = MagicMock()
    mock_part.inline_data.data = b"AUDIO_BYTES_TEST"
    mock_candidate = MagicMock()
    mock_candidate.content.parts = [mock_part]
    mock_response = MagicMock(candidates=[mock_candidate])

    with patch("scripts.cli.nexus_voice.genai") as mock_genai:
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_genai.Client.return_value = mock_client

        success = synthesize_gemini_audio("Ola Mundo", "Aoede", out_file)
        assert success is True
        assert out_file.exists()
        assert out_file.read_bytes() == b"AUDIO_BYTES_TEST"


@pytest.mark.asyncio
async def test_synthesize_edge_tts_execution(tmp_path: Path):
    """Valida a sintese de voz neural via Edge TTS."""
    out_file = tmp_path / "francisca.mp3"
    result = await synthesize_edge_tts("Teste SOTA de sintese neural.", DEFAULT_VOICE_PTBR, out_file)
    assert result == out_file
    assert out_file.exists()
    assert out_file.stat().st_size > 0


@pytest.mark.asyncio
async def test_async_speak_text_execution(tmp_path: Path):
    """Valida a execucao assincrona de sintese neural."""
    out_file = tmp_path / "async_test.mp3"
    result = await async_speak_text("Validacao async speak text.", output_file=str(out_file), play=False)
    assert result == out_file
    assert out_file.exists()
    assert out_file.stat().st_size > 0


def test_speak_text_synchronous_wrapper(tmp_path: Path):
    """Valida o wrapper sincrono speak_text operando com play=False."""
    out_file = tmp_path / "sync_test.mp3"
    result_path = speak_text("Validacao do wrapper sincrono.", output_file=str(out_file), play=False)
    assert result_path.exists()
    assert result_path.stat().st_size > 0


def test_play_audio_windows_dispatch(tmp_path: Path):
    """Valida a emissao correta dos comandos PowerShell para WAV e MP3."""
    wav_path = tmp_path / "test.wav"
    wav_path.write_bytes(b"dummy")
    mp3_path = tmp_path / "test.mp3"
    mp3_path.write_bytes(b"dummy")

    with patch("subprocess.run") as mock_run:
        play_audio_windows(wav_path)
        assert mock_run.called
        call_args = mock_run.call_args[0][0]
        assert "SoundPlayer" in call_args[3]

    with patch("subprocess.run") as mock_run:
        play_audio_windows(mp3_path)
        assert mock_run.called
        call_args = mock_run.call_args[0][0]
        assert "mediaplayer" in call_args[3]
