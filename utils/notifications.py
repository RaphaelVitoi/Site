"""Module for sending desktop notifications."""

import base64
import html
import logging
from pathlib import Path
import re
import shutil
import subprocess  # nosec # noqa: S404
import sys

# ruff: noqa: S404, S603

logger = logging.getLogger(__name__)

SAFE_TEXT_PATTERN = re.compile(r"[^\w\s.,!?-]")


def _spawn_process(args: list[str]) -> None:
    """Spawns an isolated background process with devnull streams."""
    # pylint: disable=consider-using-with
    subprocess.Popen(  # nosec B603 # noqa: S603,S607 # NOSONAR
        args,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=False,
        close_fds=True,
    )


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
        clean_title = html.escape(SAFE_TEXT_PATTERN.sub("", title)[:100], quote=True)
        clean_message = html.escape(SAFE_TEXT_PATTERN.sub("", message)[:200], quote=True)
        ps_code = (
            "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, "
            "ContentType = WindowsRuntime] | Out-Null;\n"
            "[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null;\n"
            "$xml = New-Object Windows.Data.Xml.Dom.XmlDocument;\n"
            f'$xml_payload = \'<toast><visual><binding template="ToastText02"><text id="1">{clean_title}</text>'
            f'<text id="2">{clean_message}</text></binding></visual></toast>\';\n'
            "$xml.LoadXml($xml_payload);\n"
            "$toast = [Windows.UI.Notifications.ToastNotification]::new($xml);\n"
            '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Nexus Worker").Show($toast);'
        )
        encoded_cmd = base64.b64encode(ps_code.encode("utf-16le")).decode("ascii")

        powershell_exe = shutil.which("powershell.exe") or r"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
        if not Path(powershell_exe).exists():
            logger.warning("PowerShell nao encontrado em %s", powershell_exe)
            return

        _spawn_process(
            [
                powershell_exe,
                "-NoProfile",
                "-NonInteractive",
                "-WindowStyle",
                "Hidden",
                "-EncodedCommand",
                encoded_cmd,
            ]
        )
    except Exception as e:  # pylint: disable=broad-exception-caught
        err_msg = str(e)
        if "Access denied" in err_msg or "Acesso negado" in err_msg:
            logger.warning("Falha ao disparar Windows Toast: Permissao negada (Access denied).")
        else:
            logger.exception("Falha ao disparar Windows Toast")


def _send_linux_notification(title: str, message: str) -> None:
    """Dispara notificacao via notify-send (comum em Linux/WSL com GUI)."""
    try:
        clean_title = SAFE_TEXT_PATTERN.sub("", title)[:100]
        clean_message = SAFE_TEXT_PATTERN.sub("", message)[:200]
        notify_send_exe = shutil.which("notify-send") or "notify-send"
        _spawn_process([notify_send_exe, clean_title, clean_message])
    except Exception:  # pylint: disable=broad-exception-caught
        logger.info("[NOTIFY-LINUX] %s: %s", title, message)
