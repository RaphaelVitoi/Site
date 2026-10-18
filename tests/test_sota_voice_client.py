"""Testes unitários para o SOTA Voice Client (Site/engine/sota_voice_client.py)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from engine.sota_voice_client import (
    SotaVoiceClient,
    normalize_poker_phonetics,
)


def test_normalize_poker_phonetics() -> None:
    raw = "No BB, com 10 BBs e fold equity, o Hero dá shove contra o c-bet do BTN em ICM e chipEV."
    result = normalize_poker_phonetics(raw)

    assert "big blinds" in result
    assert "fôuld équiti" in result
    assert "chove" in result
    assert "continuation bet" in result
    assert "button" in result
    assert "I C M" in result
    assert "chip E V" in result


def test_normalize_markdown_elements() -> None:
    raw = "# Título Principal\n\n```python\nprint(1)\n```\n\nTexto com **negrito** e $x=1$."
    result = normalize_poker_phonetics(raw)

    assert "```" not in result
    assert "[bloco de código omitido]" not in raw
    assert "[bloco de código omitido]" in result
    assert "**" not in result
    assert "negrito" in result
    assert "$" not in result
    assert "x=1" in result


@patch("urllib.request.urlopen")
def test_check_status_sync_success(mock_urlopen: MagicMock) -> None:
    mock_resp = MagicMock()
    mock_resp.read.return_value = b'{"ok": true, "latencyMs": 1.2, "providers": {"gemini": {"active": true}}}'
    mock_resp.__enter__.return_value = mock_resp
    mock_urlopen.return_value = mock_resp

    client = SotaVoiceClient(base_url="http://127.0.0.1:9333")
    status = client.check_status_sync()

    assert status["active"]
    assert status["gemini_studio"]
    assert "gemini" in status["providers"]
    assert status["error"] is None


@patch("urllib.request.urlopen")
def test_synthesize_speech_sync_success(mock_urlopen: MagicMock) -> None:
    mock_resp = MagicMock()
    mock_resp.read.return_value = (
        b'{"success": true, "audioData": "b64string", "mimeType": "audio/mp3", "tier": "studio"}'
    )
    mock_resp.__enter__.return_value = mock_resp
    mock_urlopen.return_value = mock_resp

    client = SotaVoiceClient(base_url="http://127.0.0.1:9333")
    res = client.synthesize_speech_sync("Teste de áudio em ICM")

    assert res["success"]
    assert res["audio_base64"] == "b64string"
    assert res["tier"] == "studio"
