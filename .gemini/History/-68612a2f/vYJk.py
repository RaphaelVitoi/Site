"""
Web Handlers -- Endpoints HTTP do micro-servidor SOTA.
"""

import asyncio
import json
import logging
import re
import time
from datetime import datetime, timezone
from pathlib import Path

from aiohttp import web
from pydantic import ValidationError

import core.runtime as _te
from core.schemas import Task
from llm.budget import _RATE_LIMITERS
from utils.cache import _read_file_cached_internal

logger = logging.getLogger(__name__)


def _get_bg_tasks(app) -> set:
    if "bg_tasks" not in app:
        app["bg_tasks"] = set()
    return app["bg_tasks"]


async def handle_add_task(request):
    """Processa a adicao de uma nova tarefa a fila do gerenciador."""
    manager = request.app["manager"]
    try:
        post_data = await request.json()
        new_task = Task.model_validate(post_data)
        await manager.add_task(new_task)
        return web.json_response({"status": "SUCCESS", "id": new_task.id})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_status(request):
    """Recupera o status atual das tarefas na fila, com filtro opcional."""
    manager = request.app["manager"]
    try:
        status = request.query.get("status", None)
        if status == "all":
            status = None
        tasks = await manager.get_tasks(status)
        return web.json_response([t.model_dump() for t in tasks])
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_key_health_summary(request):
    """Gera um relatorio resumido de saude das chaves LLM."""
    manager = request.app["manager"]
    try:
        raw_window = request.query.get("window_minutes", "180")
        window_minutes = int(raw_window)
        window_minutes = max(5, min(window_minutes, 10080))

        report = await manager.get_key_health_report(window_minutes)
        total_keys = len(report)
        online_keys = sum(1 for row in report if row.get("success_rate", 0) > 0)
        online_rate = round((online_keys / total_keys), 4) if total_keys > 0 else 0.0

        latencies = sorted(
            [
                float(r["avg_latency_ms"])
                for r in report
                if r.get("avg_latency_ms") is not None
            ]
        )
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
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_task_result(request):
    """Recupera o resultado processado de uma tarefa especifica pelo ID."""
    try:
        task_id = request.query.get("id", "").strip()
        if not task_id:
            return web.json_response({"error": "Parametro 'id' ausente."}, status=400)
        # Guardrail: aceita ids alfanumericos, '-', '_' e '@' para evitar path traversal.
        if not re.fullmatch(r"^[A-Za-z0-9@_-]+$", task_id):
            return web.json_response({"error": "Parametro 'id' invalido."}, status=400)

        # SOTA: Isolamento de I/O bloqueante (disco) para fora do Event Loop
        def _resolve_and_read():
            result_path = (Path(".claude/task_results") / f"{task_id}.md").resolve()
            base_dir = Path(".claude/task_results").resolve()
            if not str(result_path).startswith(str(base_dir)):
                return False, "INVALID_PATH"
            if not result_path.exists():
                return False, "NOT_FOUND"
            return True, result_path.read_text(encoding="ascii", errors="ignore")

        success, content = await asyncio.to_thread(_resolve_and_read)
        if not success:
            return web.json_response(
                {
                    "error": "Caminho invalido."
                    if content == "INVALID_PATH"
                    else "Resultado nao encontrado."
                },
                status=400 if content == "INVALID_PATH" else 404,
            )

        return web.json_response(
            {
                "status": "SUCCESS",
                "id": task_id,
                "content": content,
            }
        )
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_state(request):
    """Busca um valor de estado no sistema global pelo nome da chave."""
    manager = request.app["manager"]
    try:
        key = request.query.get("key")
        if not key:
            return web.json_response({"error": "key param missing"}, status=400)
        val = await manager.get_system_state(key)
        return web.json_response({"value": val})
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_set_state(request):
    """Define ou atualiza um valor de estado no sistema global."""
    manager = request.app["manager"]
    try:
        data = await request.json()
        key = data.get("key")
        value = data.get("value")
        if not key:
            return web.json_response({"error": "key missing"}, status=400)
        await manager.set_system_state(key, value)
        return web.json_response({"status": "SUCCESS"})
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
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
            return web.json_response(
                {"error": "Parametro 'question' ausente."}, status=400
            )

        rag = await _te.get_rag_async()
        # SOTA BYOK: Bloqueio estrito de vazamento de tokens. Retrieval 100% local (CPU/SQLite).
        try:
            answer = await asyncio.wait_for(
                rag.query_memory(question, n_results=n_results, local_only=True),
                timeout=15.0,
            )
        except asyncio.TimeoutError:
            return web.json_response(
                {
                    "error": (
                        "Timeout SOTA: O Oraculo excedeu o tempo limite de inferencia (15s). "
                        "A operacao foi abortada para proteger o pool de I/O."
                    )
                },
                status=504,
            )
        return web.json_response({"status": "SUCCESS", "answer": answer})
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
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
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
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
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.exception("Falha ao obter sumario do DB: %s", e)
        return web.json_response({"status": "error", "error": str(e)}, status=500)


async def handle_get_system_status(_request: web.Request) -> web.Response:  # NOSONAR
    """Endpoint SOTA para retornar o status de componentes internos vitais."""
    try:
        # SOTA: Agrega as metricas de todos os baldes do sistema Multi-Bucket
        bucket_metrics = {
            name: limiter.get_metrics() for name, limiter in _RATE_LIMITERS.items()
        }

        # Preserva contrato de retrocompatibilidade com o nexus-status do CLI
        status_data = {
            "rate_limiter": {
                "capacity": sum(
                    limiter.capacity for limiter in _RATE_LIMITERS.values()
                ),
                "current_tokens": round(
                    sum(limiter.tokens for limiter in _RATE_LIMITERS.values()), 2
                ),
                "starvation_events": sum(
                    limiter.starvation_events for limiter in _RATE_LIMITERS.values()
                ),
                "buckets": bucket_metrics,
            }
        }
        return web.json_response(status_data, status=200)
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.exception("Falha ao coletar status do sistema: %s", e)
        return web.json_response(
            {"error": f"Falha ao coletar status: {e!s}"}, status=500
        )


async def handle_get_tournaments(request) -> web.Response:
    """Endpoint do Laboratorio de ICM para listar Torneios."""
    lab_manager = request.app.get("lab_manager")
    if not lab_manager:
        return web.json_response({"error": "LabManager nao inicializado"}, status=500)
    try:
        tournaments = await lab_manager.get_tournaments()
        return web.json_response({"status": "SUCCESS", "data": tournaments})
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_rag_ingest(request) -> web.Response:
    """Endpoint SOTA para disparar a ingestao do RAG em background (Zero Cold-Start)."""
    try:
        # SOTA: Expurga caches em RAM. Se os arquivos MD mudaram para o RAG, devem mudar para o LLM.
        _te.SYSTEM_PROMPT_CACHE.clear()
        if hasattr(_read_file_cached_internal, "cache_clear"):
            _read_file_cached_internal.cache_clear()

        rag = await _te.get_rag_async()
        bg_tasks = _get_bg_tasks(request.app)

        async def _ingest_and_audit():
            await rag.ingest_all_memories()
            manager = request.app["manager"]
            validation_task = Task(
                id=f"RAG-AUDIT-{int(time.time())}",
                description=(
                    "A Ingestao do RAG (ChromaDB) em background foi concluida. Audite "
                    "a Base Vetorial e reporte a saude e contagem de fragmentos."
                ),
                agent="@bibliotecario",
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata={"priority": "low", "type": "system_audit"},
            )
            await manager.add_task(validation_task)

        task = asyncio.create_task(_ingest_and_audit())
        bg_tasks.add(task)
        task.add_done_callback(bg_tasks.discard)
        return web.json_response(
            {
                "status": "SUCCESS",
                "message": "Ingestao RAG iniciada em background.",
            }
        )
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.exception("Falha ao disparar ingestao RAG: %s", e)
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
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.exception("Falha ao processar logs do frontend: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_predictive_profile(_request: web.Request) -> web.Response:  # NOSONAR
    """Endpoint SOTA para fornecer o Perfil Preditivo de Oponentes ao MasterSimulator usando RAG."""
    try:
        rag = await _te.get_rag_async()
        prompt = (
            "Analise os perfis de jogadores no field de $55 (mid-stakes) e extraia "
            "as tendencias populacionais. Retorne APENAS um JSON valido contendo as chaves: "
            "'Aversao ao Risco', 'Pot Entrapment', 'Miopia de Payjump', "
            "'Excesso de Agressao', 'Passivo Estrutural (RIO)' e 'Desvio de Nash'. "
            "Os valores devem ser floats entre 0.0 e 1.0."
        )

        try:
            answer = await asyncio.wait_for(
                rag.query_memory(prompt, n_results=3, local_only=True),
                timeout=15.0,
            )

            # SOTA Robustness: Limpeza agressiva de Markdown no output do LLM
            clean_answer = answer.strip()
            if "```json" in clean_answer:
                clean_answer = clean_answer.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_answer:
                clean_answer = clean_answer.split("```")[1].split("```")[0].strip()

            parsed_data = json.loads(clean_answer)
            # Normalizacao de Chaves para o contrato do Frontend
            profile = parsed_data.get("profile", parsed_data)

        except (asyncio.TimeoutError, json.JSONDecodeError, IndexError) as e:
            logger.warning(
                "[PREDICTIVE] RAG indisponivel ou parse falhou (%s). "
                "Acionando Fallback Populacional.",
                type(e).__name__,
            )
            profile = {
                "Aversao ao Risco": 0.85,
                "Pot Entrapment": 0.65,
                "Miopia de Payjump": 0.90,
                "Excesso de Agressao": 0.30,
                "Passivo Estrutural (RIO)": 0.75,
                "Desvio de Nash": 0.45,
            }
        return web.json_response({"profile": profile})
    except Exception as e:  # pylint: disable=broad-exception-caught # noqa: BLE001
        logger.exception("[SYSTEM] Falha critica no endpoint preditivo: %s", e)
        return web.json_response({"error": str(e)}, status=500)
