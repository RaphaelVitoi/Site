"""
IDENTITY: SOTA Voice Synthesis Engine CLI (v7.0 GOLD)
PATH: scripts/cli/nexus_voice.py
ROLE: Sintese de voz neural padrao ouro (PT-BR Feminina e Gemini Audio)
      com reproducao imediata no driver de som do Windows e exportacao WAV/MP3.
"""

# pylint: disable=broad-exception-caught

from __future__ import annotations

import argparse
import asyncio
import concurrent.futures
import os
from pathlib import Path
import subprocess
import sys
from typing import Any

try:
    import dotenv

    dotenv.load_dotenv()
except ImportError:
    pass

# Raiz DESTE projeto, derivada do proprio arquivo  scripts/cli/ -> raiz.
# Nao usar cwd: o script pode ser chamado de qualquer lugar, e a raiz
# multiprojeto (~/.gemini) nao e a raiz deste projeto.
PROJECT_ROOT = Path(__file__).resolve().parents[2]

try:
    import edge_tts
except ImportError:
    edge_tts = None

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

# Vozes Padrao Ouro PT-BR e Gemini
DEFAULT_VOICE_PTBR = "pt-BR-FranciscaNeural"  # Feminina Padrao Ouro Brasil
ALTERNATIVE_VOICE_PTBR = "pt-BR-ThalitaNeural"  # Feminina Expressiva
GEMINI_VOICE_FEMALE = "Aoede"  # Gemini Multimodal Audio Feminina


async def synthesize_edge_tts(text: str, voice: str, output_path: Path) -> Path:
    """Sintetiza audio neural em PT-BR de altissima fidelidade via Edge TTS."""
    if edge_tts is None:
        raise RuntimeError("edge_tts package is not installed")

    communicate = edge_tts.Communicate(text=text, voice=voice, rate="+0%", pitch="+0Hz")
    await communicate.save(str(output_path))
    return output_path


def _extract_gemini_audio_bytes(response: Any) -> bytes | None:
    """Extrai os bytes de audio do payload de resposta do Gemini."""
    if not getattr(response, "candidates", None):
        return None
    candidates = response.candidates
    if not candidates:
        return None
    first = candidates[0]
    content = getattr(first, "content", None)
    if not content or not getattr(content, "parts", None):
        return None
    for part in content.parts:
        inline_data = getattr(part, "inline_data", None)
        if inline_data and getattr(inline_data, "data", None):
            return bytes(inline_data.data)
    return None


def synthesize_gemini_audio(text: str, voice_name: str, output_path: Path) -> bool:
    """Tenta sintetizar audio nativo usando o SDK oficial google-genai se a API Key estiver ativa."""
    if genai is None or types is None:
        return False

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return False

    try:
        client = genai.Client(api_key=api_key)
        generate_fn = client.models.generate_content
        response = generate_fn(
            model="gemini-2.5-flash",
            contents=text,
            config=types.GenerateContentConfigDict(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfigDict(
                    voice_config=types.VoiceConfigDict(
                        prebuilt_voice_config=types.PrebuiltVoiceConfigDict(voice_name=voice_name)
                    )
                ),
                safety_settings=[
                    types.SafetySettingDict(
                        category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    ),
                    types.SafetySettingDict(
                        category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    ),
                    types.SafetySettingDict(
                        category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    ),
                    types.SafetySettingDict(
                        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    ),
                    types.SafetySettingDict(
                        category=types.HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
                        threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    ),
                ],
            ),
        )
        audio_bytes = _extract_gemini_audio_bytes(response)
        if audio_bytes:
            output_path.write_bytes(audio_bytes)
            return True
        return False
    except Exception as e:
        print(f"[NEXUS VOICE] Fallback para motor neural local (motivo: {e})", file=sys.stderr)
        return False


def play_audio_windows(file_path: Path) -> None:
    """Reproduz audio nativamente no Windows sem travar o shell."""
    try:
        if file_path.suffix.lower() == ".wav":
            cmd = f"$player = New-Object System.Media.SoundPlayer '{file_path}'; $player.PlaySync()"
            subprocess.run(["powershell.exe", "-NoProfile", "-Command", cmd], check=True)
        else:
            cmd = f"Add-Type -AssemblyName presentationCore; $mediaPlayer = New-Object system.windows.media.mediaplayer; $mediaPlayer.open('{file_path}'); $mediaPlayer.Play(); Start-Sleep -Seconds 4"
            subprocess.run(["powershell.exe", "-NoProfile", "-Command", cmd], check=False)
    except Exception as err:
        print(f"[NEXUS VOICE] Aviso na reproducao de audio: {err}", file=sys.stderr)


async def async_speak_text(
    text: str,
    voice: str = DEFAULT_VOICE_PTBR,
    output_file: str | None = None,
    play: bool = True,
) -> Path:
    """Execucao assincrona de sintese de voz."""
    # Ate 2026-08-21 este caminho era o literal absoluto
    # "C:/Users/rapha/.gemini/antigravity/scratch/voice"  codigo do projeto
    # Site escrevendo dentro do projeto irmao `antigravity`, por caminho fixo.
    # Isso quebra em qualquer outra maquina, amarra dois projetos que deveriam
    # ser independentes, e some se `antigravity` for movido ou renomeado.
    # Agora: variavel de ambiente primeiro, e o proprio projeto como padrao.
    temp_dir = Path(os.environ.get("SOTA_VOICE_TMP") or (PROJECT_ROOT / ".cache" / "voice"))
    temp_dir.mkdir(parents=True, exist_ok=True)

    out_path = Path(output_file) if output_file else temp_dir / "sota_voice_output.mp3"

    print("\n[NEXUS VOICE SOTA v7.0 GOLD]")
    print(f'Texto: "{text}"')
    print(f"Voz: {voice}")
    print(f"Destino: {out_path}")

    success = False
    if voice.lower() in ["aoede", "kore", "puck", "fenrir", "charon"]:
        wav_path = out_path.with_suffix(".wav")
        if synthesize_gemini_audio(text, voice, wav_path):
            out_path = wav_path
            success = True

    if not success:
        actual_voice = voice if "Neural" in voice else DEFAULT_VOICE_PTBR
        await synthesize_edge_tts(text, actual_voice, out_path)
        success = True

    print(f"[NEXUS VOICE] \u2705 \u00c1udio sintetizado com sucesso ({out_path.stat().st_size} bytes).")

    if play and out_path.exists():
        print("[NEXUS VOICE] \U0001f50a Reproduzindo nos alto-falantes do sistema...")
        play_audio_windows(out_path)

    return out_path


def speak_text(
    text: str,
    voice: str = DEFAULT_VOICE_PTBR,
    output_file: str | None = None,
    play: bool = True,
) -> Path:
    """Wrapper sincrono que detecta event loops ativos e executa com seguranca."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, async_speak_text(text, voice, output_file, play)).result()
    else:
        return asyncio.run(async_speak_text(text, voice, output_file, play))


def main():
    parser = argparse.ArgumentParser(description="Nexus SOTA Voice Synthesizer CLI")
    parser.add_argument(
        "text",
        nargs="?",
        default="Sistema SOTA v7.0 GOLD operando em excelencia sob governanca de Raphael Vitoi.",
        help="Texto a sintetizar",
    )
    parser.add_argument(
        "--voice",
        "-v",
        default=DEFAULT_VOICE_PTBR,
        help=f"Voz (Padrao: {DEFAULT_VOICE_PTBR}, ou Thalita, Aoede)",
    )
    parser.add_argument("--output", "-o", default=None, help="Arquivo de saida (.mp3/.wav)")
    parser.add_argument("--no-play", action="store_true", help="Nao reproduzir audio automaticamente")

    args = parser.parse_args()
    speak_text(args.text, voice=args.voice, output_file=args.output, play=not args.no_play)


if __name__ == "__main__":
    main()
