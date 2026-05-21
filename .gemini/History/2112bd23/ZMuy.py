"""
Telemetria e Auditoria -- Toast notifications e economic log.
"""

import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path

from core.schemas import Task

logger = logging.getLogger(__name__)


def send_toast(title: str, message: str, status: str = "success"):
    """Dispara uma notificacao Toast nativa do Windows sem dependencias externas."""
    _ = status
    try:
        ps_code = f"""
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml("<toast><visual><binding template='ToastText02'><text id='1'>{title}</text><text id='2'>{message}</text></binding></visual></toast>")
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Nexus Worker").Show($toast)
        """
        import shutil
        import subprocess  # noqa: S404

        ps_path = shutil.which("powershell") or "powershell"
        subprocess.Popen(  # noqa: S603
            [
                ps_path,
                "-NoProfile",
                "-WindowStyle",
                "Hidden",
                "-Command",
                ps_code,
            ]
        )
    except OSError as e:
        logger.error(f"Falha ao disparar Toast: {e}")


def _write_economic_log_sync(task: Task, duration_secs: float, status: str):
    """Grava o log economico de forma sincrona (executado em thread separada)."""
    audit_dir = Path(".claude/logs/audit")
    audit_dir.mkdir(parents=True, exist_ok=True)
    log_file = (
        audit_dir / f"economic_audit_{datetime.now(timezone.utc).strftime('%Y-%m')}.log"
    )

    priority = (
        task.metadata.get("priority", "medium").upper() if task.metadata else "MEDIUM"
    )
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    log_entry = (
        f"[{timestamp}] | LVL:{priority} | AGENT:{task.agent} | STAT:{status}"
        f" | DUR:{duration_secs:.1f}s | ID:{task.id} | DESC:{task.description[:60]}...\n"
    )
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
    except OSError as e:
        logger.error(f"[LOG] Falha ao escrever log economico (I/O isolado): {e}")


def write_economic_log(task: Task, duration_secs: float, status: str):
    """
    Dispara a gravacao do log em uma thread isolada para garantir latencia zero (Friccao Zero)
    na orquestracao assincrona principal.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.run_in_executor(
            None, _write_economic_log_sync, task, duration_secs, status
        )
    except RuntimeError:
        _write_economic_log_sync(task, duration_secs, status)
