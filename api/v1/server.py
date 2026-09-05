"""
Web Server -- Micro-servidor SOTA (aiohttp) com routing e ciclo de vida.
"""

# pylint: disable=broad-exception-caught, import-outside-toplevel
import asyncio
import logging
import time

from aiohttp import web

from database.lab_manager import LabManager
from database.queue_manager import QueueManager

try:
    from monitoring.audit_engine import AuditEngine  # type: ignore
except Exception:  # noqa: BLE001 - fallback de resiliencia para ambientes sem modulo opcional

    class AuditEngine:
        """Fallback mock para o Motor de Auditoria."""

        def __init__(self, manager):
            self.manager = manager

        async def process_frontend_events(self, events):
            """Processamento emulando operacao assincrona (noop)."""
            _ = events
            await asyncio.sleep(0)


from api.v1.handlers import (
    handle_add_task,
    handle_ask_oracle,
    handle_bucket_op,
    handle_calculate_perspective,
    handle_frontend_logs,
    handle_get_db_summary,
    handle_get_key_health_summary,
    handle_get_resource_usage,
    handle_get_state,
    handle_get_status,
    handle_get_system_status,
    handle_get_task_result,
    handle_get_tournaments,
    handle_health,
    handle_import_solver_tree,
    handle_list_files,
    handle_ping,
    handle_pmev_heatmap,
    handle_prometheus_metrics,
    handle_rag_ingest,
    handle_rag_query,
    handle_set_state,
    handle_simulate_perspective_tree,
    handle_view_file,
    handle_web_search,
)
from api.v1.keys import AUDIT_ENGINE_KEY, LAB_MANAGER_KEY, MANAGER_KEY, START_TIME_KEY
from api.v1.middleware import (
    auth_middleware,
    cookie_middleware,
    cors_middleware,
    rate_limit_middleware,
    security_headers_middleware,
)

logger = logging.getLogger(__name__)


async def handle_predictive_profile(_request: web.Request) -> web.Response:
    """Endpoint Proxy para expor o perfil preditivo ao front-end."""
    from predictive_forest import PredictiveForestEngine  # noqa: PLC0415

    def _get_profile():
        engine = PredictiveForestEngine()
        return engine.get_predictive_profile()

    profile = await asyncio.to_thread(_get_profile)
    return web.json_response({"profile": profile})


def create_app(manager: QueueManager) -> web.Application:
    """Monta a aplicacao aiohttp com middlewares, estado e tabela de rotas."""
    app = web.Application(
        middlewares=[
            cors_middleware,
            rate_limit_middleware,
            auth_middleware,
            cookie_middleware,
            security_headers_middleware,
        ]
    )
    app[MANAGER_KEY] = manager
    app[LAB_MANAGER_KEY] = LabManager()  # Instancia o DAO do Laboratorio SOTA
    app[AUDIT_ENGINE_KEY] = AuditEngine(manager)  # Instancia o Motor de Auditoria SOTA
    app[START_TIME_KEY] = time.time()
    app.add_routes(
        [
            web.get("/ping", handle_ping),
            web.get("/metrics", handle_prometheus_metrics),
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
            web.get("/predictive-profile", handle_predictive_profile),  # type: ignore
            web.get("/resources", handle_get_resource_usage),
            web.post("/rag/query", handle_rag_query),
            web.post("/buckets", handle_bucket_op),
            web.get("/api/files/list", handle_list_files),
            web.get("/api/files/view", handle_view_file),
            web.get("/api/web-search", handle_web_search),
            web.post("/api/v1/perspective", handle_calculate_perspective),
            web.post("/api/v1/perspective/tree", handle_simulate_perspective_tree),
            web.post("/api/v1/perspective/import-solver", handle_import_solver_tree),
            web.post("/api/v1/pmev/heatmap", handle_pmev_heatmap),
            web.post("/api/v1/perspective/heatmap", handle_pmev_heatmap),
        ]
    )
    return app


async def start_api_server(manager: QueueManager, port: int = 17042):
    """Inicializa, configura rotas e executa o servidor web SOTA na porta especificada."""
    app = create_app(manager)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", port, reuse_address=True, backlog=4096)
    try:
        await site.start()
        logger.info("Micro-Servidor SOTA API (aiohttp) escutando em http://127.0.0.1:%d", port)
        # Roda indefinidamente
        await asyncio.Event().wait()
    except OSError as e:
        logger.exception(
            "Falha ao iniciar o Micro-Servidor SOTA na porta %d: %s. (A porta pode estar em uso)",
            port,
            e,
        )
        raise
    finally:
        await runner.cleanup()
