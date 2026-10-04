# pylint: disable=import-outside-toplevel
"""
Worker Startup -- Inicializacao conjunta do Worker, API e Watchdog.
"""

import asyncio
from collections.abc import Callable
import logging
import signal
from types import FrameType
from typing import Any, cast

from api.v1.server import start_api_server
from database.queue_manager import QueueManager
from monitoring.watchdog import system_watchdog
import task_executor as _task_executor
from worker.loop import start_worker  # type: ignore[attr-defined]

logger = logging.getLogger(__name__)
_SignalHandler = Callable[[int, FrameType | None], Any] | int | signal.Handlers | None


def _install_shutdown_handlers(
    loop: asyncio.AbstractEventLoop,
    shutdown_event: asyncio.Event,
) -> Callable[[], None]:
    """Install cross-platform SIGINT/SIGTERM handlers and return their cleanup."""
    loop_signals: list[signal.Signals] = []
    previous_signal_handlers: dict[signal.Signals, _SignalHandler] = {}
    restored = False

    def request_shutdown(signum: int, _frame: FrameType | None) -> None:
        logger.info("Sinal %s recebido; iniciando encerramento gracioso.", signal.Signals(signum).name)
        loop.call_soon_threadsafe(shutdown_event.set)

    for signum in (signal.SIGINT, signal.SIGTERM):
        try:
            previous_handler = signal.getsignal(signum)
        except (OSError, RuntimeError, ValueError) as error:
            logger.warning("Nao foi possivel consultar handler de %s: %s", signum.name, error)
            continue

        try:
            loop.add_signal_handler(signum, shutdown_event.set)
            loop_signals.append(signum)
            previous_signal_handlers[signum] = previous_handler
        except (NotImplementedError, OSError, RuntimeError, ValueError):
            try:
                signal.signal(signum, request_shutdown)
                previous_signal_handlers[signum] = previous_handler
            except (OSError, RuntimeError, ValueError) as error:
                logger.warning("Nao foi possivel registrar %s: %s", signum.name, error)

    def restore() -> None:
        nonlocal restored
        if restored:
            return
        restored = True
        for signum in loop_signals:
            try:
                loop.remove_signal_handler(signum)
            except (NotImplementedError, OSError, RuntimeError, ValueError) as error:
                logger.warning("Nao foi possivel remover handler de %s: %s", signum.name, error)
        for signum, previous_handler in previous_signal_handlers.items():
            try:
                signal.signal(signum, previous_handler)
            except (OSError, RuntimeError, ValueError) as error:
                logger.warning("Nao foi possivel restaurar handler de %s: %s", signum.name, error)

    return restore


async def _run_service_group(manager: QueueManager, shutdown_event: asyncio.Event) -> None:
    """Run long-lived services together; fail fast and drain all siblings on exit."""
    services = (
        ("api", start_api_server),
        ("worker", start_worker),
        ("watchdog", system_watchdog),
    )
    shutdown_task = asyncio.create_task(shutdown_event.wait(), name="nexus-shutdown-waiter")
    service_tasks: dict[asyncio.Task[None], str] = {}

    try:
        for name, service in services:
            service_tasks[asyncio.create_task(service(manager), name=f"nexus-{name}")] = name

        done, _ = await asyncio.wait(
            (*service_tasks, shutdown_task),
            return_when=asyncio.FIRST_COMPLETED,
        )
        for completed_task in done:
            if completed_task is shutdown_task:
                continue
            service_task = cast(asyncio.Task[None], completed_task)
            service_task.result()
            raise RuntimeError(f"Servico de longa duracao encerrou inesperadamente: {service_tasks[service_task]}")

        logger.info("Encerramento solicitado; cancelando servicos e drenando tarefas.")
    finally:
        shutdown_task.cancel()
        for task in service_tasks:
            if not task.done():
                task.cancel()
        await asyncio.gather(shutdown_task, *service_tasks, return_exceptions=True)


async def start_worker_and_api():
    """Inicia o Worker, Servidor de API e o Watchdog de Supervisao Ativa 24/7."""
    # Garante que core.runtime esteja sincronizado com a fonte de verdade do task_executor
    # antes de handlers/worker dependerem de helpers dinamicos.
    sync_fn = getattr(_task_executor, "_sync_runtime", None)
    if callable(sync_fn):
        sync_fn()  # pylint: disable=not-callable

    manager = QueueManager()
    shutdown_event = asyncio.Event()
    restore_signal_handlers: Callable[[], None] | None = None

    try:
        loop = asyncio.get_running_loop()
        restore_signal_handlers = _install_shutdown_handlers(loop, shutdown_event)

        # SOTA v8.0: Ativacao persistente do modo WAL e checkpoint no cabecalho do banco
        try:
            async with manager._get_async_db() as db:  # pylint: disable=protected-access
                await db.execute("PRAGMA journal_mode=WAL;")
                await db.execute("PRAGMA wal_autocheckpoint=1000;")
                await db.commit()
        except Exception:  # noqa: BLE001
            logger.exception("[SISTEMA] Falha ao configurar SQLite WAL")

        await _run_service_group(manager, shutdown_event)
    finally:
        if restore_signal_handlers is not None:
            restore_signal_handlers()
        await manager.close()
