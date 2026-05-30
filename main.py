"""Main entry point for starting the API server."""

# ==========================================
# SOTA GOLD: Inoculacao Prematura de Variaveis
# Deve ser estritamente o PRIMEIRO import para garantir que a
# supressao de modo bloqueante (WSL) contamine o processo antes do FastAPI inicializar.
# ==========================================
import asyncio
import logging

import core.config as _  # noqa: F401
from api.v1.server import start_api_server
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)


async def main():
    """Start the queue manager and the API server."""
    logger.info("[NEXUS SOTA] Inicializando Mente Coletiva (API Server & Queue Manager)...")
    manager = QueueManager()
    await start_api_server(manager)


if __name__ == "__main__":
    asyncio.run(main())
