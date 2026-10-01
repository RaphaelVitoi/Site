# pylint: disable=import-outside-toplevel
"""
Worker Startup -- Inicializacao conjunta do Worker, API e Watchdog.
"""

import asyncio
import logging

from api.v1.server import start_api_server
from database.queue_manager import QueueManager
from monitoring.watchdog import system_watchdog
import task_executor as _task_executor
from worker.loop import start_worker  # type: ignore[attr-defined]

logger = logging.getLogger(__name__)


async def start_worker_and_api():
    """Inicia o Worker, Servidor de API e o Watchdog de Supervisao Ativa 24/7."""
    # Garante que core.runtime esteja sincronizado com a fonte de verdade do task_executor
    # antes de handlers/worker dependerem de helpers dinamicos.
    sync_fn = getattr(_task_executor, "_sync_runtime", None)
    if callable(sync_fn):
        sync_fn()  # pylint: disable=not-callable

    manager = QueueManager()

    # SOTA v8.0: Ativacao persistente do modo WAL e checkpoint no cabecalho do banco
    try:
        async with manager._get_async_db() as db:  # pylint: disable=protected-access
            await db.execute("PRAGMA journal_mode=WAL;")
            await db.execute("PRAGMA wal_autocheckpoint=1000;")
            await db.commit()
    except Exception:  # noqa: BLE001
        logger.exception("[SISTEMA] Falha ao configurar SQLite WAL")

    await asyncio.gather(start_api_server(manager), start_worker(manager), system_watchdog(manager))  # type: ignore
