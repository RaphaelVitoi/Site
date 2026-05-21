"""
Worker Startup -- Inicializacao conjunta do Worker, API e Watchdog.
"""

import asyncio
import logging

import aiosqlite

from database.queue_manager import QueueManager
from monitoring.watchdog import system_watchdog
from web.server import start_api_server
from worker.loop import start_worker

logger = logging.getLogger(__name__)


async def start_worker_and_api():
    """Inicia o Worker, Servidor de API e o Watchdog de Supervisao Ativa 24/7."""
    # Garante que core.runtime esteja sincronizado com a fonte de verdade do task_executor
    # antes de handlers/worker dependerem de helpers dinamicos.
    import task_executor as _task_executor

    if hasattr(_task_executor, "_sync_runtime"):
        _task_executor._sync_runtime()

    manager = QueueManager()

    # SOTA: Ativacao persistente do modo WAL (Write-Ahead Logging)
    # Otimiza o disco para latencia zero em altissima concorrencia assincrona.
    try:
        async with aiosqlite.connect(manager.db_path) as db:
            await db.execute("PRAGMA journal_mode=WAL;")
            await db.execute("PRAGMA synchronous=NORMAL;")
            await db.execute("PRAGMA wal_autocheckpoint=1000;")
            await db.execute("PRAGMA busy_timeout=5000;")
            await db.execute("PRAGMA temp_store=MEMORY;")
            await db.execute("PRAGMA mmap_size=2147483648;")
            await db.execute("PRAGMA cache_size=-64000;")
            await db.commit()
    except Exception as e:  # noqa: BLE001
        logger.error(f"[SISTEMA] Falha ao configurar SQLite WAL: {e}")

    try:
        await asyncio.gather(
            start_api_server(manager), start_worker(manager), system_watchdog(manager)
        )
    except asyncio.CancelledError:
        raise
