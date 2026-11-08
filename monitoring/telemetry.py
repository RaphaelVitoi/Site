"""
Telemetria e Auditoria -- Toast notifications e economic log.
"""

import asyncio
import contextlib
from datetime import UTC, datetime
import logging
from typing import Any

from core.config import PATH_AUDIT_LOGS
from core.schemas import Task
from utils.notifications import send_toast as agnostic_send_toast
from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)

_prom: Any = None

try:
    import prometheus_client as _prom

    PROMETHEUS_AVAILABLE = True
    TASK_EXECUTION_COUNTER = _prom.Counter(
        "nexus_task_executions_total",
        "Total de tarefas executadas pelos agentes Nexus",
        ["agent", "status"],
    )
    TASK_DURATION_HISTOGRAM = _prom.Histogram(
        "nexus_task_duration_seconds",
        "Duracao de execucao de tarefas em segundos",
        ["agent"],
        buckets=(0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0),
    )
    PMEV_CALCULATION_COUNTER = _prom.Counter(
        "nexus_pmev_calculations_total",
        "Total de calculos de Perspectiva Matematica (PMev)",
        ["position", "action"],
    )
except ImportError:
    _prom = None
    PROMETHEUS_AVAILABLE = False
    TASK_EXECUTION_COUNTER = None
    TASK_DURATION_HISTOGRAM = None
    PMEV_CALCULATION_COUNTER = None


def send_toast(title: str, message: str, _status: str = "success"):
    """Wrapper para a notificacao agnostica SOTA."""
    # pylint: disable=unused-argument
    # SOTA: _status parameter accepted for compatibility with client signatures
    _ = _status
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

        if PROMETHEUS_AVAILABLE and TASK_EXECUTION_COUNTER is not None and TASK_DURATION_HISTOGRAM is not None:
            with contextlib.suppress(Exception):
                TASK_EXECUTION_COUNTER.labels(agent=task.agent, status=status).inc()
                TASK_DURATION_HISTOGRAM.labels(agent=task.agent).observe(duration_secs)
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


def record_pmev_metric(position: str, action: str) -> None:
    """Registra evento de calculo PMev nas metricas Prometheus."""
    if PROMETHEUS_AVAILABLE and PMEV_CALCULATION_COUNTER is not None:
        with contextlib.suppress(Exception):
            PMEV_CALCULATION_COUNTER.labels(position=position, action=action).inc()


def get_prometheus_metrics_snapshot() -> bytes:
    """Gera um snapshot em bytes das metricas Prometheus ativas."""
    if not PROMETHEUS_AVAILABLE or _prom is None:
        return b""
    with contextlib.suppress(Exception):
        return _prom.generate_latest()
    return b""
