"""
OS INTEGRATION - Membrana Cognitiva SOTA (v7.0 GOLD)
Provides unified interfaces for default browser resolution, system clipboard, and OS notifications.
"""

import logging
import os
import platform
import subprocess
import sys

logger = logging.getLogger(__name__)

# Default Chrome Dev path on Windows Host
CHROME_DEV_WIN_PATH = "C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe"
WINRAR_WIN_PATH = "C:\\Program Files\\WinRAR\\WinRAR.exe"


def get_chrome_dev_path() -> str:
    """Resolves the default Google Chrome Dev executable path."""
    if sys.platform == "win32":
        if os.path.exists(CHROME_DEV_WIN_PATH):
            return CHROME_DEV_WIN_PATH
    # Fallback to PATH search on Linux/WSL or general Chrome binary
    for bin_name in ["google-chrome-unstable", "google-chrome-stable", "google-chrome", "chrome"]:
        cmd = "which" if sys.platform != "win32" else "where"
        try:
            res = subprocess.run([cmd, bin_name], capture_output=True, text=True, check=True)
            path = res.stdout.strip().split("\n")[0]
            if path and os.path.exists(path):
                return path
        except Exception:
            continue
    return "chrome"  # Generic fallback


def get_winrar_path() -> str | None:
    """Resolves WinRAR executable path on Windows Host."""
    if sys.platform == "win32" and os.path.exists(WINRAR_WIN_PATH):
        return WINRAR_WIN_PATH
    return None


def get_clipboard_text() -> str:
    """Reads text from the OS system clipboard with robust fallbacks."""
    try:
        import pyperclip  # type: ignore

        text = pyperclip.paste()
        if text:
            return str(text)
    except Exception as e:
        logger.debug(f"[OS Clipboard] Pyperclip error: {e}. Trying PowerShell fallback.")

    if sys.platform == "win32":
        try:
            res = subprocess.run(
                ["powershell", "-Command", "Get-Clipboard"],
                capture_output=True,
                text=True,
                check=True,
                encoding="utf-8",
                errors="ignore",
            )
            return res.stdout.strip()
        except Exception as e:
            logger.warning(f"[OS Clipboard] PowerShell Get-Clipboard failed: {e}")
    return ""


def set_clipboard_text(text: str) -> bool:
    """Writes text to the OS system clipboard with fallbacks."""
    try:
        import pyperclip  # type: ignore

        pyperclip.copy(text)
        return True
    except Exception as e:
        logger.debug(f"[OS Clipboard] Pyperclip copy error: {e}. Trying PowerShell fallback.")

    if sys.platform == "win32":
        try:
            # Avoid quotes issues by feeding stdin to Set-Clipboard
            process = subprocess.Popen(
                ["powershell", "-Command", "Set-Clipboard"], stdin=subprocess.PIPE, text=True, encoding="utf-8"
            )
            process.communicate(input=text)
            return process.returncode == 0
        except Exception as e:
            logger.warning(f"[OS Clipboard] PowerShell Set-Clipboard failed: {e}")
    return False


def show_toast(title: str, message: str) -> None:
    """Displays an OS-level desktop notification/balloon tip."""
    logger.info(f"[OS Notification] {title}: {message}")
    if sys.platform == "win32":
        # Dynamic PowerShell Balloon Tip to avoid importing heavy GUI frameworks (e.g. win10toast)
        # SOTA v7.0 Gold: zero-dependencies, zero-friction
        ps_script = f"""
        [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
        $objNotifyIcon = New-Object System.Windows.Forms.NotifyIcon
        $objNotifyIcon.Icon = [System.Drawing.SystemIcons]::Information
        $objNotifyIcon.BalloonTipIcon = "Info"
        $objNotifyIcon.BalloonTipTitle = "{title.replace('"', '`"')}"
        $objNotifyIcon.BalloonTipText = "{message.replace('"', '`"')}"
        $objNotifyIcon.Visible = $True
        $objNotifyIcon.ShowBalloonTip(10000)
        """
        try:
            subprocess.Popen(
                ["powershell", "-Command", ps_script], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
        except Exception as e:
            logger.warning(f"[OS Notification] Failed to trigger Windows balloon tip: {e}")
    elif sys.platform == "linux" or (sys.platform == "posix" and platform.system() == "Linux"):
        # notify-send on Linux/WSL if GUI session is active
        try:
            subprocess.Popen(["notify-send", title, message], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
