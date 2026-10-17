# ruff: noqa: E501
"""
Motor de Voz Neural SOTA (Voice Nexus Client) — Site / Poker Theory Ecosystem.

Conexão fractal com o Voice Nexus Orchestrator (127.0.0.1:9333), provendo:
1. Normalização acústica e fonética para Poker, PMev, Teoria dos Jogos e Termos Matemáticos.
2. Síntese neural de voz (Gemini 3.8 Flash Studio / Google Cloud Neural2 / SAPI fallback).
3. Transcrição neural de áudio (STT) com vocabulário técnico autoguiado.
4. Interface assíncrona (aiohttp) e síncrona (urllib) com timeouts estritos e resiliência.
"""

from __future__ import annotations

import base64
import json
import logging
import re
import urllib.error
import urllib.request
from typing import TypedDict

import aiohttp

logger = logging.getLogger("sota.voice_client")

VOICE_NEXUS_DEFAULT_URL = "http://127.0.0.1:9333"

# Termos de calibração fonética canônica para MTTs, ICM e Teoria dos Jogos
POKER_PHONETIC_REPLACEMENTS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bc-bet\b|\bcbet\b", re.IGNORECASE), "continuation bet"),
    (re.compile(r"\bICM\b"), "I C M"),
    (re.compile(r"\bchipEV\b"), "chip E V"),
    (re.compile(r"\bPMev\b"), "P M E V"),
    (re.compile(r"\bEV\b"), "E V"),
    (re.compile(r"\bvPIP\b", re.IGNORECASE), "V P I P"),
    (re.compile(r"\bPKO\b"), "P K O"),
    (re.compile(r"\bNash\b"), "Nésh"),
    (re.compile(r"\bGTO\b"), "G T O"),
    (re.compile(r"\br/c\b", re.IGNORECASE), "raise call"),
    (re.compile(r"\bb/f\b", re.IGNORECASE), "bet fold"),
    (re.compile(r"\b3-bet\b|\b3bet\b", re.IGNORECASE), "three bet"),
    (re.compile(r"\b4-bet\b|\b4bet\b", re.IGNORECASE), "four bet"),
    (re.compile(r"\bshove\b", re.IGNORECASE), "chove"),
    (re.compile(r"\ball-in\b|\ballin\b", re.IGNORECASE), "ol-in"),
    (re.compile(r"\bBB\b"), "big blinds"),
    (re.compile(r"\bSB\b"), "small blind"),
    (re.compile(r"\bBTN\b"), "button"),
    (re.compile(r"\bCO\b"), "cut-off"),
    (re.compile(r"\bHJ\b"), "hijack"),
    (re.compile(r"\bUTG\b"), "under the gun"),
    (re.compile(r"\bpot odds\b", re.IGNORECASE), "pót odds"),
    (re.compile(r"\bfold equity\b", re.IGNORECASE), "fôuld équiti"),
    (re.compile(r"\s*->\s*"), " para "),
    (re.compile(r"\s*=>\s*"), " implica "),
    (re.compile(r"\s*<=\s*"), " menor ou igual a "),
    (re.compile(r"\s*>=\s*"), " maior ou igual a "),
]


class VoiceNexusStatus(TypedDict):
    active: bool
    url: str
    gemini_studio: bool
    providers: list[str]
    latency_ms: float
    error: str | None


class SynthesisResult(TypedDict):
    success: bool
    audio_base64: str
    mime_type: str
    voice: str
    tier: str
    latency_ms: float
    error: str | None


class TranscriptionResult(TypedDict):
    success: bool
    text: str
    confidence: float
    model: str
    latency_ms: float
    error: str | None


def normalize_poker_phonetics(raw_text: str) -> str:
    """Normaliza termos de poker, estatísticas e fórmulas matemáticas para prosódia SOTA."""
    if not raw_text:
        return ""

    text = raw_text
    # Limpeza de markdown que atrapalha narração
    text = re.sub(r"```[\s\S]*?```", " [bloco de código omitido] ", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\$\$[\s\S]*?\$\$", " [expressão matemática omitida] ", text)
    text = re.sub(r"\$([^$]+)\$", r"\1", text)
    text = re.sub(r"^#{1,6}\s+(\S[^\r\n]*)$", r"\1. ", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"^[*\-+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^>\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\[([^\][]+)\]\(([^()]+)\)", r"\1", text)
    text = re.sub(r"\|[-:\s|]+\|", "", text)
    text = text.replace("|", ", ")

    # Substituição de regras fonéticas
    for pattern, replacement in POKER_PHONETIC_REPLACEMENTS:
        text = pattern.sub(replacement, text)

    # Redução de múltiplos espaços
    text = re.sub(r"\s{2,}", " ", text).strip()
    return text


class SotaVoiceClient:
    """Cliente oficial para integração do Site ao Voice Nexus Orchestrator."""

    def __init__(self, base_url: str = VOICE_NEXUS_DEFAULT_URL, timeout_s: float = 4.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_s = timeout_s

    def check_status_sync(self) -> VoiceNexusStatus:
        """Verifica a integridade do Voice Nexus de forma síncrona."""
        url = f"{self.base_url}/api/voice/status"
        req = urllib.request.Request(url, headers={"User-Agent": "Site-PokerTheory/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_s) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "active": True,
                    "url": self.base_url,
                    "gemini_studio": bool(data.get("providers", {}).get("gemini", {}).get("active")),
                    "providers": list(data.get("providers", {}).keys()),
                    "latency_ms": float(data.get("latencyMs", 0.0)),
                    "error": None,
                }
        except Exception as exc:  # noqa: BLE001
            logger.debug("Voice Nexus offline: %s", exc)
            return {
                "active": False,
                "url": self.base_url,
                "gemini_studio": False,
                "providers": [],
                "latency_ms": 0.0,
                "error": str(exc),
            }

    async def check_status_async(self) -> VoiceNexusStatus:
        """Verifica a integridade do Voice Nexus de forma assíncrona."""
        url = f"{self.base_url}/api/voice/status"
        timeout = aiohttp.ClientTimeout(total=self.timeout_s)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers={"User-Agent": "Site-PokerTheory/1.0"}) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return {
                            "active": True,
                            "url": self.base_url,
                            "gemini_studio": bool(data.get("providers", {}).get("gemini", {}).get("active")),
                            "providers": list(data.get("providers", {}).keys()),
                            "latency_ms": float(data.get("latencyMs", 0.0)),
                            "error": None,
                        }
                    return {
                        "active": False,
                        "url": self.base_url,
                        "gemini_studio": False,
                        "providers": [],
                        "latency_ms": 0.0,
                        "error": f"HTTP {resp.status}",
                    }
        except Exception as exc:  # noqa: BLE001
            return {
                "active": False,
                "url": self.base_url,
                "gemini_studio": False,
                "providers": [],
                "latency_ms": 0.0,
                "error": str(exc),
            }

    def synthesize_speech_sync(
        self,
        text: str,
        voice: str = "pt-BR-Neural2-C",
        lang: str = "pt-BR",
        tier: str = "auto",
        apply_phonetics: bool = True,
    ) -> SynthesisResult:
        """Sintetiza áudio via Voice Nexus de forma síncrona."""
        normalized = normalize_poker_phonetics(text) if apply_phonetics else text
        url = f"{self.base_url}/api/voice/tts"
        payload = json.dumps(
            {
                "text": normalized,
                "voice": voice,
                "lang": lang,
                "tier": tier,
            }
        ).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "Site-PokerTheory/1.0"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_s) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "success": bool(data.get("success")),
                    "audio_base64": str(data.get("audioData", "")),
                    "mime_type": str(data.get("mimeType", "audio/mp3")),
                    "voice": str(data.get("voice", voice)),
                    "tier": str(data.get("tier", tier)),
                    "latency_ms": float(data.get("latencyMs", 0.0)),
                    "error": data.get("error"),
                }
        except Exception as exc:  # noqa: BLE001
            return {
                "success": False,
                "audio_base64": "",
                "mime_type": "audio/mp3",
                "voice": voice,
                "tier": tier,
                "latency_ms": 0.0,
                "error": str(exc),
            }

    async def synthesize_speech_async(
        self,
        text: str,
        voice: str = "pt-BR-Neural2-C",
        lang: str = "pt-BR",
        tier: str = "auto",
        apply_phonetics: bool = True,
    ) -> SynthesisResult:
        """Sintetiza áudio via Voice Nexus de forma assíncrona."""
        normalized = normalize_poker_phonetics(text) if apply_phonetics else text
        url = f"{self.base_url}/api/voice/tts"
        payload = {
            "text": normalized,
            "voice": voice,
            "lang": lang,
            "tier": tier,
        }

        timeout = aiohttp.ClientTimeout(total=self.timeout_s)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload, headers={"User-Agent": "Site-PokerTheory/1.0"}) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return {
                            "success": bool(data.get("success")),
                            "audio_base64": str(data.get("audioData", "")),
                            "mime_type": str(data.get("mimeType", "audio/mp3")),
                            "voice": str(data.get("voice", voice)),
                            "tier": str(data.get("tier", tier)),
                            "latency_ms": float(data.get("latencyMs", 0.0)),
                            "error": data.get("error"),
                        }
                    return {
                        "success": False,
                        "audio_base64": "",
                        "mime_type": "audio/mp3",
                        "voice": voice,
                        "tier": tier,
                        "latency_ms": 0.0,
                        "error": f"HTTP {resp.status}",
                    }
        except Exception as exc:  # noqa: BLE001
            return {
                "success": False,
                "audio_base64": "",
                "mime_type": "audio/mp3",
                "voice": voice,
                "tier": tier,
                "latency_ms": 0.0,
                "error": str(exc),
            }

    async def transcribe_audio_async(
        self,
        audio_bytes: bytes,
        mime_type: str = "audio/webm",
        language_codes: list[str] | None = None,
        extra_vocabulary: list[str] | None = None,
    ) -> TranscriptionResult:
        """Transcreve áudio para texto via Voice Nexus de forma assíncrona."""
        url = f"{self.base_url}/api/voice/transcribe"
        audio_b64 = base64.b64encode(audio_bytes).decode("ascii")

        payload = {
            "audioBase64": audio_b64,
            "mimeType": mime_type,
            "languageCodes": language_codes or ["pt-BR", "en-US"],
            "extraVocabulary": extra_vocabulary or ["ICM", "PMev", "GTO", "c-bet", "Nash", "vPIP"],
            "mode": "smart",
        }

        timeout = aiohttp.ClientTimeout(total=self.timeout_s * 2)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, json=payload, headers={"User-Agent": "Site-PokerTheory/1.0"}) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return {
                            "success": bool(data.get("success")),
                            "text": str(data.get("text", "")),
                            "confidence": float(data.get("confidence", 0.0)),
                            "model": str(data.get("model", "gemini-3.8-transcribe")),
                            "latency_ms": float(data.get("latencyMs", 0.0)),
                            "error": data.get("error"),
                        }
                    return {
                        "success": False,
                        "text": "",
                        "confidence": 0.0,
                        "model": "",
                        "latency_ms": 0.0,
                        "error": f"HTTP {resp.status}",
                    }
        except Exception as exc:  # noqa: BLE001
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "model": "",
                "latency_ms": 0.0,
                "error": str(exc),
            }


# Instância singleton para importação direta no backend
voice_client = SotaVoiceClient()
