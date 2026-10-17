"""Testes unitários para o SOTA Voice Client (Site/engine/sota_voice_client.py)."""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from engine.sota_voice_client import (
    SotaVoiceClient,
    normalize_poker_phonetics,
)


class TestSotaVoiceClient(unittest.TestCase):
    def test_normalize_poker_phonetics(self) -> None:
        raw = "No BB, com 10 BBs e fold equity, o Hero dá shove contra o c-bet do BTN em ICM e chipEV."
        result = normalize_poker_phonetics(raw)

        self.assertIn("big blinds", result)
        self.assertIn("fôuld équiti", result)
        self.assertIn("chove", result)
        self.assertIn("continuation bet", result)
        self.assertIn("button", result)
        self.assertIn("I C M", result)
        self.assertIn("chip E V", result)

    def test_normalize_markdown_elements(self) -> None:
        raw = "# Título Principal\n\n```python\nprint(1)\n```\n\nTexto com **negrito** e $x=1$."
        result = normalize_poker_phonetics(raw)

        self.assertNotIn("```", result)
        self.assertNotIn("[bloco de código omitido]", raw)
        self.assertIn("[bloco de código omitido]", result)
        self.assertNotIn("**", result)
        self.assertIn("negrito", result)
        self.assertNotIn("$", result)
        self.assertIn("x=1", result)

    @patch("urllib.request.urlopen")
    def test_check_status_sync_success(self, mock_urlopen: MagicMock) -> None:
        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"ok": true, "latencyMs": 1.2, "providers": {"gemini": {"active": true}}}'
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        client = SotaVoiceClient(base_url="http://127.0.0.1:9333")
        status = client.check_status_sync()

        self.assertTrue(status["active"])
        self.assertTrue(status["gemini_studio"])
        self.assertIn("gemini", status["providers"])
        self.assertIsNone(status["error"])

    @patch("urllib.request.urlopen")
    def test_synthesize_speech_sync_success(self, mock_urlopen: MagicMock) -> None:
        mock_resp = MagicMock()
        mock_resp.read.return_value = (
            b'{"success": true, "audioData": "b64string", "mimeType": "audio/mp3", "tier": "studio"}'
        )
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        client = SotaVoiceClient(base_url="http://127.0.0.1:9333")
        res = client.synthesize_speech_sync("Teste de áudio em ICM")

        self.assertTrue(res["success"])
        self.assertEqual(res["audio_base64"], "b64string")
        self.assertEqual(res["tier"], "studio")


if __name__ == "__main__":
    unittest.main()
