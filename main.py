"""Main entry point for starting the API server."""

import asyncio
import logging

from api.v1.server import start_api_server
from database.queue_manager import QueueManager


async def main():
    """Start the queue manager and the API server."""
    logging.basicConfig(level=logging.INFO)
    manager = QueueManager()
    await start_api_server(manager)


if __name__ == "__main__":
    asyncio.run(main())
