"""
IDENTITY: SOTA Voice Synthesis Engine CLI (v7.0 GOLD)
PATH: scripts/cli/nexus_voice.py
ROLE: Síntese de voz neural padrão ouro (PT-BR Feminina e Gemini Audio)
      com reprodução imediata no driver de som do Windows e exportação WAV/MP3.
"""

import argparse
import asyncio
import concurrent.futures
import os
import subprocess
import sys
from pathlib import Path

# Vozes Padrão Ouro PT-BR e Gemini
DEFAULT_VOICE_PTBR = "pt-BR-FranciscaNeural"  # Feminina Padrão Ouro Brasil
ALTERNATIVE_VOICE_PTBR = "pt-BR-ThalitaNeural"  # Feminina Expressiva
GEMINI_VOICE_FEMALE = "Aoede"  # Gemini Multimodal Audio Feminina


async def synthesize_edge_tts(text: str, voice: str, output_path: Path) -> Path:
    """Sintetiza áudio neural em PT-BR de altíssima fidelidade via Edge TTS."""
    import edge_tts

    communicate = edge_tts.Communicate(text=text, voice=voice, rate="+0%", pitch="+0Hz")
    await communicate.save(str(output_path))
    return output_path


def synthesize_gemini_audio(text: str, voice_name: str, output_path: Path) -> bool:
    """Tenta sintetizar áudio nativo usando o SDK oficial google-genai se a API Key estiver ativa."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return False

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice_name)
                    )
                ),
            ),
        )

        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                output_path.write_bytes(part.inline_data.data)
                return True
        return False
    except Exception as e:
        print(f"[NEXUS VOICE] Fallback para motor neural local (motivo: {e})", file=sys.stderr)
        return False


def play_audio_windows(file_path: Path) -> None:
    """Reproduz áudio nativamente no Windows sem travar o shell."""
    try:
        if file_path.suffix.lower() == ".wav":
            cmd = f"$player = New-Object System.Media.SoundPlayer '{file_path}'; $player.PlaySync()"
            subprocess.run(["powershell.exe", "-NoProfile", "-Command", cmd], check=True)
        else:
            cmd = f"Add-Type -AssemblyName presentationCore; $mediaPlayer = New-Object system.windows.media.mediaplayer; $mediaPlayer.open('{file_path}'); $mediaPlayer.Play(); Start-Sleep -Seconds 4"
            subprocess.run(["powershell.exe", "-NoProfile", "-Command", cmd], check=False)
    except Exception as err:
        print(f"[NEXUS VOICE] Aviso na reprodução de áudio: {err}", file=sys.stderr)


async def async_speak_text(
    text: str,
    voice: str = DEFAULT_VOICE_PTBR,
    output_file: str | None = None,
    play: bool = True,
) -> Path:
    """Execução assíncrona de síntese de voz."""
    temp_dir = Path("C:/Users/rapha/.gemini/antigravity/scratch/voice")
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
    """Wrapper síncrono que detecta event loops ativos e executa com segurança."""
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
        default="Sistema SOTA v7.0 GOLD operando em excelência sob governança de Raphael Vitoi.",
        help="Texto a sintetizar",
    )
    parser.add_argument(
        "--voice",
        "-v",
        default=DEFAULT_VOICE_PTBR,
        help=f"Voz (Padrão: {DEFAULT_VOICE_PTBR}, ou Thalita, Aoede)",
    )
    parser.add_argument("--output", "-o", default=None, help="Arquivo de saída (.mp3/.wav)")
    parser.add_argument("--no-play", action="store_true", help="Não reproduzir áudio automaticamente")

    args = parser.parse_args()
    speak_text(args.text, voice=args.voice, output_file=args.output, play=not args.no_play)


if __name__ == "__main__":
    main()
