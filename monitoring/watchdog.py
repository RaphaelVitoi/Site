"""
Watchdog -- Supervisao Ativa 24/7 SOTA (Monitoramento Preditivo de Latencia e Entropia).
"""

import asyncio
import json
import logging
from datetime import UTC, datetime

from core.schemas import Task
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)


async def _create_watchdog_task(
    manager: QueueManager,
    task_id: str,
    description: str,
    agent: str,
    priority: str = "high",
):
    """Cria uma tarefa de alerta do watchdog de forma robusta."""

    try:
        if not await manager.get_task(task_id):
            alert_task = Task(
                id=task_id,
                description=description,
                agent=agent,
                timestamp=datetime.now(UTC).isoformat(),
                metadata={"priority": priority},
            )
            await manager.add_task(alert_task)
    except Exception as e:  # pylint: disable=broad-exception-caught
        logger.exception(
            "[WATCHDOG] Falha ao criar tarefa de alerta '%s': %s", task_id, e
        )


async def _get_last_metrics(manager: QueueManager) -> dict:
    """Recupera o estado anterior do banco de dados para analise de tendencia."""
    last_metrics_json = await manager.get_system_state("watchdog_last_metrics")
    try:
        return json.loads(last_metrics_json) if last_metrics_json else {}
    except json.JSONDecodeError:
        return {}


def _calculate_failure_rate(
    now: datetime, current_failed: int, last_metrics: dict
) -> tuple[float, int]:
    """Calcula a taxa de falha (falhas por minuto) baseada no historico."""
    last_failed = last_metrics.get("failed")
    last_timestamp_str = last_metrics.get("timestamp")

    if last_timestamp_str and last_failed is not None:
        try:
            last_ts = datetime.fromisoformat(last_timestamp_str)
            # SOTA: Garantia de Coerence Temporal (Blindagem contra mismatch naive/aware)
            if last_ts.tzinfo is None:
                last_ts = last_ts.replace(tzinfo=UTC)

            time_delta = now - last_ts
            minutes_delta = time_delta.total_seconds() / 60
            recent_failures = max(0, current_failed - last_failed)
            if minutes_delta > 0:
                return recent_failures / minutes_delta, recent_failures
        except (ValueError, TypeError):
            pass
    return 0.0, 0


def _evaluate_triggers(
    current_pending: int, recent_failures: int, failure_rate: float
) -> str | None:
    """Avalia gatilhos de anomalia preditiva SOTA."""
    if current_pending > 40:
        return f"Engarrafamento na Fila ({current_pending} pendentes)"
    if recent_failures > 5:
        return f"Pico de Falhas Acumuladas ({recent_failures} falhas recentes)"
    if failure_rate > 0.6 and recent_failures > 0:
        return f"Taxa de Falha Anormal ({failure_rate:.2f} falhas/min)"
    return None


async def _process_watchdog_triggers(
    manager: QueueManager,
    trigger: str,
    current_pending: int,
    recent_failures: int,
    failure_rate: float,
):
    """Processa e enfileira alertas de degradacao."""
    alert_id = f"WATCHDOG-ALERT-{datetime.now(UTC).strftime('%Y%m%d%H')}"
    desc = (
        f"[SUPERVISAO 24/7 SOTA] ALERTA DE DEGRADACAO: {trigger}.\n\n"
        f"Metricas Atuais:\n"
        f"- Pendentes: {current_pending}\n"
        f"- Falhas Recentes: {recent_failures}\n"
        f"- Taxa de Falha: {failure_rate:.2f}/min\n\n"
        f"Diretriz para @maverick: Inspecione a raiz desta entropia, corrija as inconsistencias "
        f"e restaure a harmonia do fluxo para garantir operacao em capacidade maxima."
    )
    await _create_watchdog_task(manager, alert_id, desc, "@maverick", "critical")


async def _run_watchdog_cycle(manager: QueueManager):
    """Executa um ciclo unico de monitoramento e avaliacao de metricas."""
    counts = await manager.get_task_counts()
    current_failed = counts.get("failed", 0)
    current_pending = counts.get("pending", 0)
    now = datetime.now(UTC)

    last_metrics = await _get_last_metrics(manager)
    failure_rate, recent_failures = _calculate_failure_rate(
        now, current_failed, last_metrics
    )

    await manager.set_system_state(
        "watchdog_last_metrics",
        json.dumps({"failed": current_failed, "timestamp": now.isoformat()}),
    )

    trigger = _evaluate_triggers(current_pending, recent_failures, failure_rate)
    if trigger:
        await _process_watchdog_triggers(
            manager, trigger, current_pending, recent_failures, failure_rate
        )


async def system_watchdog(manager: QueueManager):
    """Supervisao Ativa 24/7 SOTA (Monitoramento Preditivo de Latencia e Entropia)."""
    await asyncio.sleep(30)  # Delay inicial para estabilizacao do sistema
    while True:
        try:
            await _run_watchdog_cycle(manager)
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.exception("[WATCHDOG] Falha no monitoramento 24/7: %s", e)

        await asyncio.sleep(300)  # O coracao do vigia bate a cada 5 minutos
