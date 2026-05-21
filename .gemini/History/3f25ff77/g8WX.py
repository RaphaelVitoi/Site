"""
Web Server -- Micro-servidor SOTA (aiohttp) com routing e ciclo de vida.
"""

import asyncio
import logging
import time

from aiohttp import web

from database.lab_manager import LabManager  # type: ignore
from database.queue_manager import QueueManager
from web.handlers import (
    handle_add_task,
    handle_ask_oracle,
    handle_frontend_logs,
    handle_get_db_summary,
    handle_get_key_health_summary,
    handle_get_state,
    handle_get_status,
    handle_get_system_status,
    handle_get_task_result,
    handle_get_tournaments,
    handle_health,
    handle_rag_ingest,
    handle_set_state,
)
from web.middleware import auth_middleware, cors_middleware, rate_limit_middleware

try:
    from monitoring.audit_engine import AuditEngine  # type: ignore
except Exception:  # noqa: BLE001 - fallback de resiliencia para ambientes sem modulo opcional

    class AuditEngine:
        def __init__(self, manager):
            self.manager = manager

        async def process_frontend_events(self, events):
            _ = events
            await asyncio.sleep(0)


# SOTA: Cache Termodinâmico L1 para evitar sufocamento do I/O SQLite/ProcessPool
_PREDICTIVE_PROFILE_CACHE = {"data": None, "timestamp": 0.0}
_CACHE_TTL_SECONDS = 300  # 5 minutos de homeostase


async def handle_predictive_profile(request: web.Request) -> web.Response:
    from predictive_forest import PredictiveForestEngine

    current_time = time.time()
    if _PREDICTIVE_PROFILE_CACHE["data"] is not None and (current_time - _PREDICTIVE_PROFILE_CACHE["timestamp"] < _CACHE_TTL_SECONDS):
        return web.json_response({"profile": _PREDICTIVE_PROFILE_CACHE["data"], "source": "l1_cache"})

    def _get_profile():
        engine = PredictiveForestEngine()
        return engine.get_predictive_profile()

    profile = await asyncio.to_thread(_get_profile)

    _PREDICTIVE_PROFILE_CACHE["data"] = profile
    _PREDICTIVE_PROFILE_CACHE["timestamp"] = current_time

    return web.json_response({"profile": profile, "source": "disk_inference"})


logger = logging.getLogger(__name__)


async def start_api_server(manager: QueueManager, port: int = 17042):
    # SOTA: Instanciacao Eager (Singleton) do RAG no boot do Orquestrador
    # Aniquila o cold-start de 16s alocando o ONNX Runtime na memoria vitalicia
    _rag_preload_task = None
    try:
        from core.runtime import get_rag_async

        _rag_preload_task = asyncio.create_task(get_rag_async())
    except Exception as e:
        logger.warning(f"[SOTA] Falha no eager-load do RAG: {e}")

    app = web.Application(
        middlewares=[cors_middleware, rate_limit_middleware, auth_middleware]
    )
    app["manager"] = manager
    app["lab_manager"] = LabManager()  # Instancia o DAO do Laboratorio SOTA
    app["audit_engine"] = AuditEngine(manager)  # Instancia o Motor de Auditoria SOTA
    app["start_time"] = time.time()
    app.add_routes(
        [
            web.get("/db-summary", handle_get_db_summary),
            web.get("/health", handle_health),
            web.post("/add", handle_add_task),
            web.get("/status", handle_get_status),
            web.get("/key-health-summary", handle_get_key_health_summary),
            web.get("/task-result", handle_get_task_result),
            web.get("/state", handle_get_state),
            web.post("/state", handle_set_state),
            web.post("/ask-oracle", handle_ask_oracle),
            web.get("/system-status", handle_get_system_status),
            web.get("/lab/tournaments", handle_get_tournaments),
            web.post("/api/logs/frontend", handle_frontend_logs),
            web.post("/ingest", handle_rag_ingest),
            web.get("/predictive-profile", handle_predictive_profile),
        ]
    )

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", port, reuse_address=True)
    try:
        await site.start()
        logger.info(
            f"Micro-Servidor SOTA API (aiohttp) escutando em http://127.0.0.1:{port}"
        )
        # Roda indefinidamente
        await asyncio.Event().wait()
    except OSError as e:
        logger.exception(
            f"Falha ao iniciar o Micro-Servidor SOTA na porta {port}: {e}. (A porta pode estar em uso)"
        )
    finally:
        await runner.cleanup()
