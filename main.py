"""Entrypoint API-only do Nexus (desenvolvimento local, porta 17042).

Sobe SOMENTE o servidor aiohttp + QueueManager — nao consome a fila de
tasks. O entrypoint de stack completa (API + worker + watchdog) e
`core/runtime.py`, usado pelo CMD do Dockerfile e pelo deploy Cloud Run.
Para desenvolvimento local que precise do worker, use
`python core/runtime.py` ou `scripts/ops/` conforme a skill
sota-server-lifecycle-warmup.
"""

import asyncio
import logging

from api.v1.server import start_api_server
from database.queue_manager import QueueManager
from worker.startup import _silence_proactor_reset


async def main():
    logging.basicConfig(level=logging.INFO)
    loop = asyncio.get_running_loop()
    loop.set_exception_handler(_silence_proactor_reset)
    manager = QueueManager()
    await start_api_server(manager)


if __name__ == "__main__":
    asyncio.run(main())
