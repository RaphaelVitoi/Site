"""Engine Clippy SOTA v8.0 GOLD - Gestao Resiliente da Area de Transferencia (Clipboard).

Fornece integracao de alta confiabilidade para transferencia automatica de
contexto, payloads de handoff e prompts de continuacao entre modelos e sessoes.
"""
from __future__ import annotations

import ctypes
import logging
import subprocess
import sys
from typing import Final

try:
    import pyperclip  # type: ignore
except ImportError:
    pyperclip = None

logger = logging.getLogger("clippy_clipboard")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

MAX_PREVIEW_LEN: Final[int] = 120
_GMEM_MOVEABLE: Final[int] = 0x0002
_CF_UNICODETEXT: Final[int] = 13


class ClippyClipboard:
    """Mecanismo universal SOTA para manipulacao da Area de Transferencia."""

    @classmethod
    def copy(cls, text: str) -> bool:
        """Copia texto para a Area de Transferencia com fallback multicamada."""
        if not text:
            logger.warning("[CLIPPY] Tentativa de copiar texto vazio abortada.")
            return False

        # 1. Metodo primario: PowerShell Set-Clipboard nativo (Windows)
        if sys.platform == "win32":
            try:
                ps_cmd = [
                    "powershell.exe",
                    "-NoProfile",
                    "-Command",
                    "Set-Clipboard -Value ([Console]::In.ReadToEnd())",
                ]
                proc = subprocess.Popen(
                    ps_cmd,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    text=True,
                    encoding="utf-8",
                )
                proc.communicate(input=text)
                if proc.returncode == 0:
                    logger.info("[CLIPPY] Texto copiado com sucesso via PowerShell (%d chars).", len(text))
                    return True
            except Exception as e:
                logger.debug("[CLIPPY] Falha no Set-Clipboard via PowerShell: %s", e)

        # 2. Metodo secundario: pyperclip (se instalado)
        if pyperclip is not None:
            try:
                pyperclip.copy(text)
                logger.info("[CLIPPY] Texto copiado com sucesso via pyperclip (%d chars).", len(text))
                return True
            except Exception as e:
                logger.debug("[CLIPPY] Falha no pyperclip: %s", e)

        # 3. Metodo terciario no Windows: ctypes OpenClipboard
        if sys.platform == "win32" and hasattr(ctypes, "windll"):
            try:
                user32 = ctypes.windll.user32
                kernel32 = ctypes.windll.kernel32

                data_bytes = text.encode("utf-16-le") + b"\x00\x00"
                h_mem = kernel32.GlobalAlloc(_GMEM_MOVEABLE, len(data_bytes))
                if h_mem:
                    p_mem = kernel32.GlobalLock(h_mem)
                    if p_mem:
                        ctypes.memmove(p_mem, data_bytes, len(data_bytes))
                        kernel32.GlobalUnlock(h_mem)
                        if user32.OpenClipboard(None):
                            user32.EmptyClipboard()
                            user32.SetClipboardData(_CF_UNICODETEXT, h_mem)
                            user32.CloseClipboard()
                            logger.info("[CLIPPY] Texto copiado com sucesso via Win32 ctypes (%d chars).", len(text))
                            return True
            except Exception as e:
                logger.warning("[CLIPPY] Falha no Win32 ctypes clipboard: %s", e)

        logger.error("[CLIPPY] Todos os mecanismos de copia para o Clipboard falharam.")
        return False

    @classmethod
    def paste(cls) -> str:
        """Le conteudo atual da Area de Transferencia."""
        if sys.platform == "win32":
            try:
                ps_cmd = ["powershell.exe", "-NoProfile", "-Command", "Get-Clipboard"]
                res = subprocess.run(ps_cmd, capture_output=True, text=True, encoding="utf-8", check=False)
                if res.returncode == 0:
                    return res.stdout
            except Exception as e:
                logger.debug("[CLIPPY] Falha no Get-Clipboard: %s", e)

        if pyperclip is not None:
            try:
                return str(pyperclip.paste())
            except Exception:
                return ""
        return ""

    @classmethod
    def assemble_and_copy_handoff(
        cls,
        summary: str,
        files_modified: list[str],
        test_status: str,
        decisions: list[str],
        next_tasks: list[str],
        continuity_prompt: str,
        target_llm: str = "Claude 3.7 Sonnet / Gemini 3.7 Flash",
    ) -> dict[str, str | int | bool]:
        """Monta o payload canonico de Handoff e o copia para a Area de Transferencia."""
        lines = [
            "================================================================================",
            f"=== PROTOCOLO DE HANDOFF SOTA v8.0 GOLD -> [{target_llm.upper()}] ===",
            "================================================================================",
            "SOBERANO: Raphael Vitoi (AHSD QI 136, PMev Game Theory)",
            "GOVERNANCA: Protocolo Chico SOTA v8.0 GOLD, Zero-Any, Target Lock, Pure ASCII",
            "--------------------------------------------------------------------------------",
            "1. RESUMO EXECUTIVO DA SESSAO:",
            summary,
            "--------------------------------------------------------------------------------",
            "2. ARQUIVOS MODIFICADOS / ADICIONADOS:",
        ]
        for f in files_modified:
            lines.append(f"  • {f}")

        lines.extend([
            "--------------------------------------------------------------------------------",
            f"3. ESTADO DA BATERIA DE TESTES & HOMEOSTASE:\n  • {test_status}",
            "--------------------------------------------------------------------------------",
            "4. DECISOES ARQUITETURAIS & MODELOS:",
        ])
        for d in decisions:
            lines.append(f"  • {d}")

        lines.extend([
            "--------------------------------------------------------------------------------",
            "5. PROXIMAS TAREFAS PRIORITARIAS (BACKLOG):",
        ])
        for t in next_tasks:
            lines.append(f"  [ ] {t}")

        lines.extend([
            "================================================================================",
            "=== PROMPT DE CONTINUACAO IMEDIATA (COLE DIRETAMENTE NO CHAT SEGUINTE) ===",
            "================================================================================",
            continuity_prompt,
            "================================================================================",
            "INSTRUCAO: RESPONDA DIRETAMENTE O PRODUTO FINAL EM ALTA DENSIDADE SEM METALINGUAGEM.",
        ])

        payload = "\n".join(lines)
        success = cls.copy(payload)

        return {
            "success": success,
            "char_count": len(payload),
            "payload_preview": payload[:MAX_PREVIEW_LEN] + "...",
            "target_llm": target_llm,
        }
