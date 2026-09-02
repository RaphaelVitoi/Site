"""
Typed AppKey definitions for aiohttp web application context (M.O. SOTA v8.0 GOLD).
Eliminates NotAppKeyWarning and guarantees type-safe context access.
"""

from __future__ import annotations

import asyncio
from typing import Any

from aiohttp import web

from database.lab_manager import LabManager
from database.queue_manager import QueueManager

MANAGER_KEY: web.AppKey[QueueManager] = web.AppKey("manager", QueueManager)
LAB_MANAGER_KEY: web.AppKey[LabManager] = web.AppKey("lab_manager", LabManager)
AUDIT_ENGINE_KEY: web.AppKey[Any] = web.AppKey("audit_engine")
START_TIME_KEY: web.AppKey[float] = web.AppKey("start_time", float)
BG_TASKS_KEY: web.AppKey[set[asyncio.Task[Any]]] = web.AppKey("bg_tasks", set)
