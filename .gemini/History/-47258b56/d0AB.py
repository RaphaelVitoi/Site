"""
Web Handlers -- Endpoints HTTP do micro-servidor SOTA.
"""
import json
import re
import time
import logging
import asyncio
from pathlib import Path

from aiohttp import web
from pydantic import ValidationError

from llm.budget import global_rate_limiter
from core.schemas import Task
import core.runtime as _te


logger = logging.getLogger(__name__)


async def handle_add_task(request):
    manager = request.app['manager']
    try:
        post_data = await request.json()
        new_task = Task.model_validate(post_data)
        await manager.add_task(new_task)
        return web.json_response({"status": "SUCCESS", "id": new_task.id})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_status(request):
    manager = request.app['manager']
    try:
        status = request.query.get('status', None)
        if status == 'all':
            status = None
        tasks = await manager.get_tasks(status)
        return web.json_response([t.model_dump() for t in tasks])
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_key_health_summary(request):
    manager = request.app['manager']
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
            "p95_latency_ms": p95_latency_ms
        }
        return web.json_response(payload)
    except ValueError:
        return web.json_response({"error": "window_minutes invalido."}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_task_result(request):
    try:
        task_id = request.query.get('id', '').strip()
        if not task_id:
            return web.json_response({"error": "Parametro 'id' ausente."}, status=400)
        # Guardrail: aceita ids alfanumericos, '-', '_' e '@' para evitar path traversal.
        if not re.fullmatch(r"^[A-Za-z0-9@_-]+$", task_id):
            return web.json_response({"error": "Parametro 'id' invalido."}, status=400)

        result_path = (Path(".claude/task_results") / f"{task_id}.md").resolve()
        base_dir = Path(".claude/task_results").resolve()
        if not str(result_path).startswith(str(base_dir)):
            return web.json_response({"error": "Caminho invalido."}, status=400)
        if not result_path.exists():
            return web.json_response({"error": "Resultado nao encontrado."}, status=404)

        content = result_path.read_text(encoding="utf-8", errors="ignore")
        return web.json_response({"status": "SUCCESS", "id": task_id, "content": content})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_state(request):
    manager = request.app['manager']
    try:
        key = request.query.get('key')
        if not key:
            return web.json_response({"error": "key param missing"}, status=400)
        val = await manager.get_system_state(key)
        return web.json_response({"value": val})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_set_state(request):
    manager = request.app['manager']
    try:
        data = await request.json()
        key = data.get('key')
        value = data.get('value')
        if not key:
            return web.json_response({"error": "key missing"}, status=400)
        await manager.set_system_state(key, value)
        return web.json_response({"status": "SUCCESS"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_ask_oracle(request):
    """Rota Hibrida do Oraculo para o Frontend SOTA (RAG Local)."""
    try:
        # SOTA: Fallback de encoding para lidar com PowerShell antigo (Windows-1252/latin-1)
        raw_body = await request.read()
        try:
            body_text = raw_body.decode('utf-8')
        except UnicodeDecodeError:
            body_text = raw_body.decode('latin-1', errors='ignore')

        data = json.loads(body_text) if body_text else {}
        question = data.get('question')
        n_results = data.get('n_results', 3)
        if not question:
            return web.json_response({"error": "Parametro 'question' ausente."}, status=400)

        rag = _te.get_rag()
        # CUSTO ZERO GARANTIDO: local_only=True forca a busca puramente matematica no ChromaDB (CPU local)
        answer = await rag.query_memory(question, n_results=n_results, local_only=True)
        return web.json_response({"status": "SUCCESS", "answer": answer})
    except Exception as e:
        logger.error(f"Falha na consulta ao Oraculo: {e}")
        return web.json_response({"error": str(e)}, status=500)


async def handle_health(request):
    """Retorna status operacional do worker: contagens de tarefas e uptime."""
    manager = request.app['manager']
    try:
        counts = await manager.get_task_counts()
        start_time = request.app.get('start_time', time.time())
        uptime_s = int(time.time() - start_time)

        agents_count = len(_te.AGENTS_MANIFEST)

        return web.json_response({
            "status": "ok",
            "uptime_s": uptime_s,
            "tasks": counts,
            "agents": agents_count,
        })
    except Exception as e:
        return web.json_response({"status": "error", "error": str(e)}, status=500)


async def handle_get_db_summary(request: web.Request) -> web.Response:
    """Retorna um sumario de metricas do banco de dados (contagens e orcamento)."""
    manager = request.app['manager']
    try:
        # SOTA: Centraliza a leitura de metricas via API para evitar lock de DB
        counts = await manager.get_task_counts()
        budget = await manager.get_daily_budget_usage()
        return web.json_response({
            "tasks": counts,
            "budget": budget,
        })
    except Exception as e:
        logger.error(f"Falha ao obter sumario do DB: {e}")
        return web.json_response({"status": "error", "error": str(e)}, status=500)


async def handle_get_system_status(request: web.Request) -> web.Response:
    """Endpoint SOTA para retornar o status de componentes internos vitais."""
    try:
        rate_limiter_metrics = global_rate_limiter.get_metrics()
        status_data = {
            "rate_limiter": rate_limiter_metrics
        }
        return web.json_response(status_data, status=200)
    except Exception as e:
        logger.error(f"Falha ao coletar status do sistema: {e}")
        return web.json_response({"error": f"Falha ao coletar status: {str(e)}"}, status=500)


async def handle_get_tournaments(request: web.Request) -> web.Response:
    """Endpoint do Laboratorio de ICM para listar Torneios."""
    lab_manager = request.app.get('lab_manager')
    if not lab_manager:
        return web.json_response({"error": "LabManager nao inicializado"}, status=500)
    try:
        tournaments = await lab_manager.get_tournaments()
        return web.json_response({"status": "SUCCESS", "data": tournaments})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def handle_rag_ingest(request: web.Request) -> web.Response:
    """Endpoint SOTA para disparar a ingestao do RAG em background (Zero Cold-Start)."""
    try:
        # SOTA: Expurga caches em RAM. Se os arquivos MD mudaram para o RAG, devem mudar para o LLM.
        _te.SYSTEM_PROMPT_CACHE.clear()
        if hasattr(_read_file_cached_internal, 'cache_clear'):
            _read_file_cached_internal.cache_clear()

        rag = await _te.get_rag_async()
        # Friccao Zero: Fire and forget para nao segurar a resposta HTTP do PowerShell
        asyncio.create_task(rag.ingest_all_memories())
        return web.json_response({"status": "SUCCESS", "message": "Ingestao RAG iniciada em background."})
    except Exception as e:
        logger.error(f"Falha ao disparar ingestao RAG: {e}")
        return web.json_response({"error": str(e)}, status=500)


async def handle_frontend_logs(request: web.Request) -> web.Response:
    """Endpoint para processar logs e eventos vindos do Frontend SOTA."""
    audit_engine = request.app.get('audit_engine')
    if not audit_engine:
        return web.json_response({"error": "AuditEngine nao inicializado"}, status=500)
    try:
        data = await request.json()
        events = data.get('events', [])
        if events:
            # Processamento assincrono para nao travar a resposta HTTP
            asyncio.create_task(audit_engine.process_frontend_events(events))
        return web.json_response({"status": "SUCCESS", "processed": len(events)})
    except Exception as e:
        logger.error(f"Falha ao processar logs do frontend: {e}")
        return web.json_response({"error": str(e)}, status=500)
