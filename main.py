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
