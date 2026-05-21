"""
Web Server -- Micro-servidor SOTA (aiohttp) com routing e ciclo de vida.
"""
import asyncio
import time
import logging

from aiohttp import web

from database.queue_manager import QueueManager
from database.lab_manager import LabManager
try:
    from monitoring.audit_engine import AuditEngine
except Exception:  # pragma: no cover - fallback de resiliencia para ambientes sem modulo opcional
    class AuditEngine:
        def __init__(self, manager):
            self.manager = manager

        async def process_frontend_events(self, events):
            return None
from web.handlers import (
    handle_add_task,
    handle_get_status,
    handle_get_key_health_summary,
    handle_get_task_result,
    handle_get_state,
    handle_set_state,
    handle_ask_oracle,
    handle_health,
    handle_get_db_summary,
    handle_get_system_status,
    handle_get_tournaments,
    handle_frontend_logs,
    handle_rag_ingest,
)
from web.middleware import cors_middleware, auth_middleware, rate_limit_middleware
from core.perspective_router import routes as perspective_routes


logger = logging.getLogger(__name__)


async def start_api_server(manager: QueueManager, port: int = 17042):
    app = web.Application(middlewares=[cors_middleware, rate_limit_middleware, auth_middleware])
    app['manager'] = manager
    app['lab_manager'] = LabManager() # Instancia o DAO do Laboratorio SOTA
    app['audit_engine'] = AuditEngine(manager) # Instancia o Motor de Auditoria SOTA
    app['start_time'] = time.time()
    app.add_routes([
        web.get('/db-summary', handle_get_db_summary),
        web.get('/health', handle_health),
        web.post('/add', handle_add_task),
        web.get('/status', handle_get_status),
        web.get('/key-health-summary', handle_get_key_health_summary),
        web.get('/task-result', handle_get_task_result),
        web.get('/state', handle_get_state),
        web.post('/state', handle_set_state),
        web.post('/ask-oracle', handle_ask_oracle),
        web.get('/system-status', handle_get_system_status),
        web.get('/lab/tournaments', handle_get_tournaments),
        web.post('/api/logs/frontend', handle_frontend_logs),
        web.post('/ingest', handle_rag_ingest),
    ])
    app.add_routes(perspective_routes)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '127.0.0.1', port, reuse_address=True)
    try:
        await site.start()
        logger.info(f"Micro-Servidor SOTA API (aiohttp) escutando em http://127.0.0.1:{port}")
        # Roda indefinidamente
        await asyncio.Event().wait()
    except OSError as e:
        logger.error(f"Falha ao iniciar o Micro-Servidor SOTA na porta {port}: {e}. (A porta pode estar em uso)")
    finally:
        await runner.cleanup()
