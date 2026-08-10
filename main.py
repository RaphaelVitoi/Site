import asyncio
import logging

from api.v1.server import start_api_server
from database.queue_manager import QueueManager


async def main():
    logging.basicConfig(level=logging.INFO)
    manager = QueueManager()
    await start_api_server(manager)


if __name__ == "__main__":
    asyncio.run(main())
