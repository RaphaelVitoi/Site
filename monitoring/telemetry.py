"""
Telemetria e Auditoria -- Toast notifications e economic log.
"""

import asyncio
import logging
from datetime import UTC, datetime

from core.config import PATH_AUDIT_LOGS
from core.schemas import Task
from utils.notifications import send_toast as agnostic_send_toast
from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)


def send_toast(title: str, message: str, status: str = "success"):
    """Wrapper para a notificacao agnostica SOTA."""
    agnostic_send_toast(title, message)


def _write_economic_log_sync(task: Task, duration_secs: float, status: str):
    """Grava o log economico de forma sincrona (executado em thread separada)."""
    try:
        PATH_AUDIT_LOGS.mkdir(parents=True, exist_ok=True)
        log_file = PATH_AUDIT_LOGS / f"economic_audit_{datetime.now(UTC).strftime('%Y-%m')}.log"

        priority = str(task.metadata.get("priority", "medium")).upper() if task.metadata else "MEDIUM"
        timestamp = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S")

        log_entry = (
            f"[{timestamp}] | LVL:{priority} | AGENT:{task.agent} | STAT:{status}"
            f" | DUR:{duration_secs:.1f}s | ID:{task.id} | DESC:{task.description[:60]}...\n"
        )
        log_entry = enforce_pure_ascii(log_entry)

        with open(log_file, "a", encoding="ascii", errors="backslashreplace") as f:
            f.write(log_entry)
    except Exception as e:
        logger.exception("[LOG] Falha ao escrever log economico (I/O isolado): %s", e)


def write_economic_log(task: Task, duration_secs: float, status: str):
    """
    Dispara a gravacao do log em uma thread isolada para garantir latencia zero (Friccao Zero)
    na orquestracao assincrona principal.
    """
    try:
        loop = asyncio.get_running_loop()
        loop.run_in_executor(None, _write_economic_log_sync, task, duration_secs, status)
    except RuntimeError:
        _write_economic_log_sync(task, duration_secs, status)
