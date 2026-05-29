"""Module for sending desktop notifications."""

import logging
import os
import subprocess
import sys
from pathlib import Path

# ruff: noqa: S404, S603

logger = logging.getLogger(__name__)


def send_toast(title: str, message: str):
    """Dispara uma notificacao de sistema de forma agnostica."""
    if sys.platform == "win32":
        _send_windows_toast(title, message)
    elif sys.platform == "linux":
        _send_linux_notification(title, message)
    else:
        logger.info("[NOTIFY] %s: %s", title, message)


def _send_windows_toast(title: str, message: str):
    """Send a Windows toast notification using PowerShell."""
    try:
        ps_code = f"""
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml_payload = "<toast><visual><binding template='ToastText02'><text id='1'>{title}</text><text id='2'>{message}</text></binding></visual></toast>"
        $xml.LoadXml($xml_payload)
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Nexus Worker").Show($toast)
        """
        # Caminho agnostico para PowerShell no Windows
        systemroot = os.environ.get("SYSTEMROOT", "C:\\\\Windows")
        powershell_path = Path(systemroot) / "System32/WindowsPowerShell/v1.0/powershell.exe"

        if not powershell_path.exists():
            logger.warning("PowerShell nao encontrado em %s", powershell_path)
            return

        subprocess.Popen(
            [
                str(powershell_path),
                "-NoProfile",
                "-WindowStyle",
                "Hidden",
                "-Command",
                ps_code,
            ]
        )
    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.error("Falha ao disparar Windows Toast: %s", e)


def _send_linux_notification(title: str, message: str):
    """Dispara notificacao via notify-send (comum em Linux/WSL com GUI)."""
    try:
        # Tenta notify-send, ignora se falhar (ex: headless WSL)
        subprocess.Popen(["notify-send", title, message], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:  # pylint: disable=broad-exception-caught
        logger.info("[NOTIFY-LINUX] %s: %s", title, message)
