"""Module for sending desktop notifications."""

import base64
import html
import logging
import os
import shlex
import subprocess  # nosec # noqa: S404
import sys
from pathlib import Path

# ruff: noqa: S404, S603

logger = logging.getLogger(__name__)


def send_toast(title: str, message: str) -> None:
    """Dispara uma notificacao de sistema de forma agnostica."""
    if sys.platform == "win32":
        _send_windows_toast(title, message)
    elif sys.platform == "linux":
        _send_linux_notification(title, message)
    else:
        logger.info("[NOTIFY] %s: %s", title, message)


def _send_windows_toast(title: str, message: str) -> None:
    """Send a Windows toast notification using PowerShell EncodedCommand."""
    try:
        safe_title = html.escape(title, quote=True)
        safe_message = html.escape(message, quote=True)
        ps_code = (
            "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, "
            "ContentType = WindowsRuntime] | Out-Null;\n"
            "[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null;\n"
            "$xml = New-Object Windows.Data.Xml.Dom.XmlDocument;\n"
            f"$xml_payload = '<toast><visual><binding template=\"ToastText02\"><text id=\"1\">{safe_title}</text>"
            f"<text id=\"2\">{safe_message}</text></binding></visual></toast>';\n"
            "$xml.LoadXml($xml_payload);\n"
            "$toast = [Windows.UI.Notifications.ToastNotification]::new($xml);\n"
            '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Nexus Worker").Show($toast);'
        )
        encoded_cmd = base64.b64encode(ps_code.encode("utf-16le")).decode("ascii")

        systemroot = os.environ.get("SYSTEMROOT", "C:\\Windows")
        powershell_path = Path(systemroot) / "System32" / "WindowsPowerShell" / "v1.0" / "powershell.exe"

        if not powershell_path.exists():
            logger.warning("PowerShell nao encontrado em %s", powershell_path)
            return

        cmd = [
            str(powershell_path),
            "-NoProfile",
            "-NonInteractive",
            "-WindowStyle",
            "Hidden",
            "-EncodedCommand",
            shlex.quote(encoded_cmd),
        ]
        # pylint: disable=consider-using-with
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)  # nosec B603 # noqa: S603,S607
    except Exception as e:  # pylint: disable=broad-exception-caught
        err_msg = str(e)
        if "Access denied" in err_msg or "Acesso negado" in err_msg:
            logger.warning("Falha ao disparar Windows Toast: Permissao negada (Access denied).")
        else:
            logger.exception("Falha ao disparar Windows Toast")


def _send_linux_notification(title: str, message: str) -> None:
    """Dispara notificacao via notify-send (comum em Linux/WSL com GUI)."""
    try:
        # pylint: disable=consider-using-with
        subprocess.Popen(["notify-send", shlex.quote(title), shlex.quote(message)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)  # nosec B603 # noqa: S603,S607
    except Exception:  # pylint: disable=broad-exception-caught
        logger.info("[NOTIFY-LINUX] %s: %s", title, message)
