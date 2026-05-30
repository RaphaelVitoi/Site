"""
Web Handlers -- Endpoints HTTP do micro-servidor SOTA.
"""
# pylint: disable=broad-exception-caught

import asyncio
import json
import logging
import re
import time
from pathlib import Path

from aiohttp import web
from pydantic import ValidationError

import core.runtime as _te
from core.schemas import RAGQuery, Task
from llm.budget import _RATE_LIMITERS
from utils.cache import _read_file_cached_internal
from utils.cache import cache as sota_cache
from utils.harmonizer import harmonizer
from utils.resources import ResourceGuard
from utils.storage import buckets as sota_buckets

logger = logging.getLogger(__name__)


def _get_bg_tasks(app) -> set:
    """Recupera ou inicializa o set de background tasks no app aiohttp."""
    if "bg_tasks" not in app:
        app["bg_tasks"] = set()
    return app["bg_tasks"]


@harmonizer.ultra_fast_async
async def handle_ping(_request: web.Request) -> web.Response:
    """Heartbeat SOTA para monitoramento de latencia de rede."""
    return web.json_response({"status": "PONG", "timestamp": time.time()})


async def handle_add_task(request):
    """Lida com a adicao de novas tarefas a fila."""
    manager = request.app["manager"]
    try:
        post_data = await request.json()
        new_task = Task.model_validate(post_data)
        await manager.add_task(new_task)
        return web.json_response({"status": "SUCCESS", "id": new_task.id})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_status(request):
    """Retorna o status das tarefas na fila (todas ou filtradas)."""
    manager = request.app["manager"]
    try:
        status = request.query.get("status", None)
        if status == "all":
            status = None
        tasks = await manager.get_tasks(status)
        return web.json_response([t.model_dump() for t in tasks])
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_key_health_summary(request):
    """Retorna o relatorio de saude e latencia das chaves de API."""
    manager = request.app["manager"]
    try:
        raw_window = request.query.get("window_minutes", "180")
        window_minutes = int(raw_window)
        window_minutes = max(5, min(window_minutes, 10080))

        report = await manager.get_key_health_report(window_minutes)
        total_keys = len(report)
        online_keys = sum(1 for row in report if row.get("success_rate", 0) > 0)
        online_rate = round((online_keys / total_keys), 4) if total_keys > 0 else 0.0

        latencies = sorted([float(r["avg_latency_ms"]) for r in report if r.get("avg_latency_ms") is not None])
        if latencies:
            idx = max(0, min(len(latencies) - 1, int((len(latencies) - 1) * 0.95)))
            p95_latency_ms = round(latencies[idx], 2)
        else:
            p95_latency_ms = None

        payload = {
            "window_minutes": window_minutes,
            "total_keys": total_keys,
            "online_rate": online_rate,
            "p95_latency_ms": p95_latency_ms,
        }
        return web.json_response(payload)
    except ValueError:
        return web.json_response({"error": "window_minutes invalido."}, status=400)
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_task_result(request):
    """Obtem o resultado de uma tarefa finalizada a partir do disco."""
    try:
        task_id = request.query.get("id", "").strip()
        if not task_id:
            return web.json_response({"error": "Parametro 'id' ausente."}, status=400)
        # Guardrail: aceita ids alfanumericos, '-', '_' e '@' para evitar path traversal.
        if not re.fullmatch(r"^[A-Za-z0-9@_-]+$", task_id):
            return web.json_response({"error": "Parametro 'id' invalido."}, status=400)

        # SOTA: Isolamento de I/O bloqueante (disco) para fora do Event Loop
        def _resolve_and_read():
            result_path = (Path(".cerebro/task_results") / f"{task_id}.md").resolve()
            base_dir = Path(".cerebro/task_results").resolve()
            if not str(result_path).startswith(str(base_dir)):
                return False, "INVALID_PATH"
            if not result_path.exists():
                return False, "NOT_FOUND"
            return True, result_path.read_text(encoding="utf-8", errors="ignore")

        success, content = await asyncio.to_thread(_resolve_and_read)
        if not success:
            return web.json_response(
                {"error": "Caminho invalido." if content == "INVALID_PATH" else "Resultado nao encontrado."},
                status=400 if content == "INVALID_PATH" else 404,
            )

        return web.json_response(
            {
                "status": "SUCCESS",
                "id": task_id,
                "content": content,
            }
        )
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_state(request):
    """Recupera uma variavel de estado dinamico do sistema."""
    manager = request.app["manager"]
    try:
        key = request.query.get("key")
        if not key:
            return web.json_response({"error": "key param missing"}, status=400)
        val = await manager.get_system_state(key)
        return web.json_response({"value": val})
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_set_state(request):
    """Define uma variavel de estado dinamico do sistema."""
    manager = request.app["manager"]
    try:
        data = await request.json()
        key = data.get("key")
        value = data.get("value")
        if not key:
            return web.json_response({"error": "key missing"}, status=400)
        await manager.set_system_state(key, value)
        return web.json_response({"status": "SUCCESS"})
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_ask_oracle(request):
    """Rota Hibrida do Oraculo para o Frontend SOTA (RAG Local)."""
    try:
        # SOTA: Fallback de encoding para lidar com PowerShell antigo (Windows-1252/latin-1)
        raw_body = await request.read()
        try:
            body_text = raw_body.decode("utf-8")
        except UnicodeDecodeError:
            body_text = raw_body.decode("latin-1", errors="ignore")

        data = json.loads(body_text) if body_text else {}
        question = data.get("question")
        n_results = data.get("n_results", 3)
        if not question:
            return web.json_response({"error": "Parametro 'question' ausente."}, status=400)

        rag = await _te.get_rag_async()
        # SOTA BYOK: Bloqueio estrito de vazamento de tokens. Retrieval 100% local (CPU/SQLite).
        answer = await rag.query_memory(question, n_results=n_results, local_only=True)
        return web.json_response({"status": "SUCCESS", "answer": answer})
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha na consulta ao Oraculo: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_health(request):
    """Retorna status operacional do worker: contagens de tarefas e uptime."""
    manager = request.app["manager"]
    try:
        counts = await manager.get_task_counts()
        start_time = request.app.get("start_time", time.time())
        uptime_s = int(time.time() - start_time)

        agents_count = len(_te.AGENTS_MANIFEST)

        return web.json_response(
            {
                "status": "ok",
                "uptime_s": uptime_s,
                "tasks": counts,
                "agents": agents_count,
            }
        )
    except Exception as e:  # noqa: BLE001
        return web.json_response({"status": "error", "error": str(e)}, status=500)


async def handle_get_db_summary(request: web.Request) -> web.Response:
    """Retorna um sumario de metricas do banco de dados (contagens e orcamento)."""
    manager = request.app["manager"]
    try:
        # SOTA: Centraliza a leitura de metricas via API para evitar lock de DB
        counts = await manager.get_task_counts()
        budget = await manager.get_daily_budget_usage()
        return web.json_response(
            {
                "tasks": counts,
                "budget": budget,
            }
        )
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha ao obter sumario do DB: %s", e)
        return web.json_response({"status": "error", "error": str(e)}, status=500)


async def handle_get_system_status(_request: web.Request) -> web.Response:  # NOSONAR
    """Endpoint SOTA para retornar o status de componentes internos vitais."""
    try:
        # SOTA: Agrega as metricas de todos os baldes do sistema Multi-Bucket
        bucket_metrics = {name: limiter.get_metrics() for name, limiter in _RATE_LIMITERS.items()}

        # Preserva contrato de retrocompatibilidade com o nexus-status do CLI
        status_data = {
            "rate_limiter": {
                "capacity": sum(limiter.capacity for limiter in _RATE_LIMITERS.values()),
                "current_tokens": round(sum(limiter.tokens for limiter in _RATE_LIMITERS.values()), 2),
                "starvation_events": sum(limiter.starvation_events for limiter in _RATE_LIMITERS.values()),
                "buckets": bucket_metrics,
            }
        }
        return web.json_response(status_data, status=200)
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha ao coletar status do sistema: %s", e)
        return web.json_response({"error": f"Falha ao coletar status: {e!s}"}, status=500)


async def handle_get_tournaments(request) -> web.Response:
    """Endpoint do Laboratorio de ICM para listar Torneios."""
    lab_manager = request.app.get("lab_manager")
    if not lab_manager:
        return web.json_response({"error": "LabManager nao inicializado"}, status=500)
    try:
        tournaments = await lab_manager.get_tournaments()
        return web.json_response({"status": "SUCCESS", "data": tournaments})
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_rag_ingest(request) -> web.Response:
    """Endpoint SOTA para disparar a ingestao do RAG em background (Zero Cold-Start)."""
    try:
        # SOTA: Expurga caches em RAM. Se os arquivos MD mudaram para o RAG, devem mudar para o LLM.
        _te.SYSTEM_PROMPT_CACHE.clear()
        if hasattr(_read_file_cached_internal, "cache_clear"):
            _read_file_cached_internal.cache_clear()  # type: ignore

        rag = await _te.get_rag_async()
        # Friccao Zero: Fire and forget para nao segurar a resposta HTTP do PowerShell
        bg_tasks = _get_bg_tasks(request.app)
        task = asyncio.create_task(rag.ingest_all_memories())
        bg_tasks.add(task)
        task.add_done_callback(bg_tasks.discard)
        return web.json_response(
            {
                "status": "SUCCESS",
                "message": "Ingestao RAG iniciada em background.",
            },
            status=202,
        )
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha ao disparar ingestao RAG: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_resource_usage(_request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Monitoramento de VRAM e RAM em tempo real."""
    try:

        def _get_usage():
            return {
                "ram": ResourceGuard.get_ram_usage(),
                "vram": ResourceGuard.get_vram_usage(),
                "is_healthy": ResourceGuard.check_health(),
            }

        usage = await asyncio.to_thread(_get_usage)
        return web.json_response({"status": "SUCCESS", "usage": usage})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_rag_query(request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Consulta RAG com Caching de Multi-Tier."""
    try:
        data = await request.json()
        query_data = RAGQuery.model_validate(data)

        # Check Cache Tier 1/2
        cache_key = f"rag_query:{query_data.query}:{query_data.top_k}"
        cached_result = sota_cache.get(cache_key)
        if cached_result:
            return web.json_response({"status": "SUCCESS", "answer": cached_result, "cached": True})

        rag = await _te.get_rag_async()
        answer = await rag.query_memory(query_data.query, n_results=query_data.top_k, local_only=True)

        # Save to Cache
        sota_cache.set(cache_key, answer)

        return web.json_response({"status": "SUCCESS", "answer": answer, "cached": False})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_bucket_op(request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Operacoes de Bucketing (Storage Abstraction)."""
    try:
        data = await request.json()
        op = data.get("op")  # 'upload' or 'download'
        bucket = data.get("bucket", "default")
        filename = data.get("filename")

        if op == "upload":
            content = data.get("content", "").encode()
            sota_buckets.upload_file(bucket, filename, content)
            return web.json_response({"status": "SUCCESS", "message": f"File {filename} uploaded to {bucket}"})
        if op == "download":
            content = sota_buckets.download_file(bucket, filename)
            if content:
                return web.json_response({"status": "SUCCESS", "content": content.decode()})
            return web.json_response({"error": "File not found"}, status=404)

        return web.json_response({"error": "Invalid operation"}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_frontend_logs(request) -> web.Response:
    """Endpoint para processar logs e eventos vindos do Frontend SOTA."""
    audit_engine = request.app.get("audit_engine")
    if not audit_engine:
        return web.json_response({"error": "AuditEngine nao inicializado"}, status=500)
    try:
        data = await request.json()
        events = data.get("events", [])
        if events:
            # Processamento assincrono para nao travar a resposta HTTP
            bg_tasks = _get_bg_tasks(request.app)
            task = asyncio.create_task(audit_engine.process_frontend_events(events))
            bg_tasks.add(task)
            task.add_done_callback(bg_tasks.discard)
        return web.json_response({"status": "SUCCESS", "processed": len(events)})
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha ao processar logs do frontend: %s", e)
        return web.json_response({"error": str(e)}, status=500)
