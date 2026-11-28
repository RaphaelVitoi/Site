"""
Web Handlers -- Endpoints HTTP do micro-servidor SOTA.
"""

# pylint: disable=broad-exception-caught, too-many-lines
from __future__ import annotations

import asyncio
import contextlib
from datetime import UTC, datetime
import json
import logging
import math
import re
import time
from typing import Any, Literal, cast, get_args
from uuid import uuid4

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore[assignment]

from aiohttp import web
from pydantic import BaseModel, ConfigDict, Field, ValidationError, ValidationInfo, field_validator

from api.v1.handler_support import BASE_WORKSPACE_DIR as BASE_WORKSPACE_DIR
from api.v1.handler_support import (
    INVALID_JSON_BODY,
    _internal_error,
    _with_execution_provenance,
    read_json_object,
)
from api.v1.handlers_canonical import (
    handle_canonical_akq as handle_canonical_akq,
)
from api.v1.handlers_canonical import (
    handle_canonical_bluff_ratios as handle_canonical_bluff_ratios,
)
from api.v1.handlers_canonical import (
    handle_canonical_clairvoyance as handle_canonical_clairvoyance,
)
from api.v1.handlers_canonical import (
    handle_canonical_geometric_sizing as handle_canonical_geometric_sizing,
)
from api.v1.handlers_canonical import (
    handle_canonical_janda_mdf as handle_canonical_janda_mdf,
)
from api.v1.handlers_files import _ENV_TEMPLATE_MARKERS as _ENV_TEMPLATE_MARKERS
from api.v1.handlers_files import _MOUNTED_SECRET_DIRS as _MOUNTED_SECRET_DIRS
from api.v1.handlers_files import _SENSITIVE_DIR_COMPONENTS as _SENSITIVE_DIR_COMPONENTS
from api.v1.handlers_files import _SENSITIVE_NAMES as _SENSITIVE_NAMES
from api.v1.handlers_files import _SENSITIVE_SUFFIXES as _SENSITIVE_SUFFIXES
from api.v1.handlers_files import ARCHIVE_EXTS as ARCHIVE_EXTS
from api.v1.handlers_files import IMAGE_EXTS as IMAGE_EXTS
from api.v1.handlers_files import RAW_MIME_TYPES as RAW_MIME_TYPES
from api.v1.handlers_files import SPREADSHEET_EXTS as SPREADSHEET_EXTS
from api.v1.handlers_files import _categorize_file as _categorize_file
from api.v1.handlers_files import _content_disposition as _content_disposition
from api.v1.handlers_files import _e_modelo_publico as _e_modelo_publico
from api.v1.handlers_files import _get_allowed_roots as _get_allowed_roots
from api.v1.handlers_files import _get_raw_content_type as _get_raw_content_type
from api.v1.handlers_files import _is_file_access_allowed as _is_file_access_allowed
from api.v1.handlers_files import _is_sensitive_path as _is_sensitive_path
from api.v1.handlers_files import _list_zip as _list_zip
from api.v1.handlers_files import _nome_e_da_familia_ambiente as _nome_e_da_familia_ambiente
from api.v1.handlers_files import _parse_image as _parse_image
from api.v1.handlers_files import _parse_image_response as _parse_image_response
from api.v1.handlers_files import _parse_spreadsheet as _parse_spreadsheet
from api.v1.handlers_files import _resolve_ecosystem_root as _resolve_ecosystem_root
from api.v1.handlers_files import _resolve_onedrive_root as _resolve_onedrive_root
from api.v1.handlers_files import _scan_root as _scan_root
from api.v1.handlers_files import _serve_parsed_file as _serve_parsed_file
from api.v1.handlers_files import handle_list_files as handle_list_files
from api.v1.handlers_files import handle_view_file as handle_view_file
from api.v1.handlers_game_theory import (
    handle_claudico_translate_action as handle_claudico_translate_action,
)
from api.v1.handlers_game_theory import (
    handle_deepstack_resolve as handle_deepstack_resolve,
)
from api.v1.handlers_game_theory import (
    handle_pluribus_solve as handle_pluribus_solve,
)
from api.v1.handlers_game_theory import (
    handle_rebel_pbs_evaluate as handle_rebel_pbs_evaluate,
)
from api.v1.http_metrics import HTTP_METRICS_KEY
from api.v1.keys import AUDIT_ENGINE_KEY, BG_TASKS_KEY, LAB_MANAGER_KEY, MANAGER_KEY, START_TIME_KEY
from core.perspective_schemas import (
    PerspectivaResult,
    PerspectiveCalculationRequest,
    PerspectiveTreeRequest,
    PerspectiveTreeResponse,
    PmevHeatmapRequest,
    PmevHeatmapResponse,
    SolverImportRequest,
)
import core.runtime as _te
from core.schemas import RAGQuery, Task
from database.lab_manager import LabPersistenceUnavailableError
from engine.bayesian_range import calculate_pmev_call_threshold
from engine.capability_registry import load_engine_capability_manifest
from engine.chrysalis_bridge import (
    CHRYSALIS_ERROR_STALE_REVISION,
    ChrysalisClient,
    EditPlan,
    compute_revision,
    validate_workspace_path,
)
from engine.solver_importers import UniversalSolverImporter
from engine.solver_importers.deep_solver import DeepSolverImporter
from engine.timesfm_engine import (
    TimesFMEngine,
    TimesFMForecastRequest,
    TimesFMForecastResponse,
    TimesFMGovernanceError,
)
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine
from llm.budget import (
    _RATE_LIMITERS,  # pyright: ignore[reportPrivateUsage]
    DAILY_API_BUDGET,
)
from llm.laya_bridge import ruin_priority_from_intencao
from monitoring.telemetry import get_prometheus_metrics_snapshot
from utils.cache import _read_file_cached_internal  # pyright: ignore[reportPrivateUsage]
from utils.cache import cache as sota_cache
from utils.harmonizer import harmonizer
from utils.resources import ResourceGuard
from utils.storage import buckets as sota_buckets
from utils.web_search import get_search_engine_from_env

#: SEC-06/SEC-10 (auditoria 2026-09-30): limites e allowlist de `/api/web-search`.
#: `max_results` ja era limitado no handler (20); a query nao era, e o
#: `provider` chegava sem validacao com o `Literal` desligado por `# type: ignore`.
#: As duas regras sao declaradas aqui, ao lado das demais constantes do modulo,
#: porque sao contrato de entrada -- e contrato declarado em um so lugar e o que
#: sobrevive a proxima refatoracao.
MAX_WEB_SEARCH_QUERY_CHARS = 512

#: O tipo e a allowlist sao derives um do outro por construcao, nao por
#: convencao: `frozenset(get_args(SearchProvider))` nao pode divergir de
#: `SearchProvider`, porque um dos dois e funcao do outro. Duas listas
#: declaradas em paralelo e a forma como o defeito de SEC-06 entrou --
#: validador aceitando o que o tipo nao previa, e nada reclamando.
SearchProvider = Literal["tavily", "duckduckgo", "auto"]
ALLOWED_SEARCH_PROVIDERS = frozenset(get_args(SearchProvider))

logger = logging.getLogger(__name__)


def _get_bg_tasks(app: web.Application) -> set[asyncio.Task[Any]]:
    """Recupera ou inicializa o set de background tasks no app aiohttp."""
    if BG_TASKS_KEY not in app:
        app[BG_TASKS_KEY] = set()
    return app[BG_TASKS_KEY]


@harmonizer.ultra_fast_async  # pyright: ignore[reportUnknownMemberType]
async def handle_ping(_request: web.Request) -> web.Response:
    """Heartbeat SOTA para monitoramento de latencia de rede."""
    return web.json_response({"status": "PONG", "timestamp": time.time()})


def normalizar_timestamp_iso(valor: str) -> str:
    """Normaliza para ISO-8601 em UTC, o formato que a fila compara lexicograficamente.

    BK-11: `Task.timestamp` aceitava string livre por `POST /add`, e `cleanup` e
    `promote_starved_tasks` comparam essa coluna como TEXTO contra isoformat UTC.
    `"9999"` nunca expirava; `"16/09/2026"` ordenava ao acaso. Data sem fuso e
    tratada como UTC.
    """
    momento = datetime.fromisoformat(valor.strip())
    if momento.tzinfo is None:
        momento = momento.replace(tzinfo=UTC)
    return momento.astimezone(UTC).isoformat()


async def handle_add_task(request: web.Request) -> web.Response:
    """Lida com a adicao de novas tarefas a fila."""
    manager = request.app[MANAGER_KEY]
    post_data, err_resp = await read_json_object(request)
    if err_resp is not None or post_data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        new_task = Task.model_validate(post_data)
        try:
            new_task.timestamp = normalizar_timestamp_iso(new_task.timestamp)
        except ValueError:
            return web.json_response(
                {"error": "timestamp deve ser ISO-8601 (ex.: 2026-09-16T23:40:00-03:00)."}, status=400
            )
        await manager.add_task(new_task)
        return web.json_response({"status": "SUCCESS", "id": new_task.id})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_add_task")


async def handle_get_status(request: web.Request) -> web.Response:
    """Retorna o status das tarefas na fila (todas ou filtradas)."""
    manager = request.app[MANAGER_KEY]
    try:
        status = request.rel_url.query.get("status", None)
        if status == "all":
            status = None
        since_hours_raw = request.rel_url.query.get("since_hours")
        since_hours: int | None = None
        if since_hours_raw is not None:
            try:
                since_hours = int(since_hours_raw)
            except ValueError:
                return web.json_response({"error": "since_hours deve ser inteiro."}, status=400)
            if not 1 <= since_hours <= 24 * 365:
                return web.json_response({"error": "since_hours deve estar entre 1 e 8760."}, status=400)
        limit_raw = request.rel_url.query.get("limit")
        limit: int | None = None
        if limit_raw is not None:
            try:
                limit = int(limit_raw)
            except ValueError:
                return web.json_response({"error": "limit deve ser inteiro."}, status=400)
            if not 1 <= limit <= 500:
                return web.json_response({"error": "limit deve estar entre 1 e 500."}, status=400)
        tasks = await manager.get_tasks(status, since_hours=since_hours, limit=limit)
        return web.json_response([t.model_dump() for t in tasks])
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_get_status")


async def handle_get_key_health_summary(request: web.Request) -> web.Response:
    """Retorna o relatorio de saude e latencia das chaves de API."""
    manager = request.app[MANAGER_KEY]
    try:
        raw_window = request.rel_url.query.get("window_minutes", "180")
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
        return _internal_error(e, "handle_get_key_health_summary")


async def handle_get_key_observatory(request: web.Request) -> web.Response:
    """Retorna snapshot mascarado do observatorio de pools, chaves, HKCU/HKLM e DB."""
    from llm.key_observatory import collect_observatory_snapshot  # noqa: PLC0415

    manager = request.app[MANAGER_KEY]
    pool_filter = request.rel_url.query.get("pool", "").strip()
    if len(pool_filter) > 40 or (pool_filter and not re.fullmatch(r"^[A-Za-z0-9_ .-]+$", pool_filter)):
        return web.json_response({"error": "Parametro 'pool' invalido."}, status=400)
    try:
        snapshot = await collect_observatory_snapshot(manager, live=False, pool_filter=pool_filter)
        return web.json_response(snapshot)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_get_key_observatory")


async def handle_probe_key_observatory(request: web.Request) -> web.Response:
    """Executa auditoria mascarada opcionalmente com sonda HTTP live (0 tokens LLM)."""
    from llm.key_observatory import collect_observatory_snapshot  # noqa: PLC0415

    manager = request.app[MANAGER_KEY]
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)

    live = bool(data.get("live", False))
    pool_filter = str(data.get("pool", "") or "").strip()
    if len(pool_filter) > 40 or (pool_filter and not re.fullmatch(r"^[A-Za-z0-9_ .-]+$", pool_filter)):
        return web.json_response({"error": "Campo 'pool' invalido."}, status=400)
    try:
        snapshot = await collect_observatory_snapshot(manager, live=live, pool_filter=pool_filter)
        return web.json_response(snapshot)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_probe_key_observatory")


async def handle_get_task_result(request: web.Request) -> web.Response:
    """Obtem o resultado de uma tarefa finalizada a partir do disco."""
    try:
        task_id = request.rel_url.query.get("id", "").strip()
        if not task_id:
            return web.json_response({"error": "Parametro 'id' ausente."}, status=400)
        # Guardrail: aceita ids alfanumericos, '-', '_' e '@' para evitar path traversal.
        if not re.fullmatch(r"^[A-Za-z0-9@_-]+$", task_id):
            return web.json_response({"error": "Parametro 'id' invalido."}, status=400)

        # SOTA: Isolamento de I/O bloqueante (disco) para fora do Event Loop
        def _resolve_and_read():
            base_dir = (BASE_WORKSPACE_DIR / ".claude" / "RELATORIOS").resolve()
            result_path = (base_dir / f"{task_id}.md").resolve()
            if not result_path.is_relative_to(base_dir):
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
        return _internal_error(e, "handle_get_task_result")


#: A-07 (auditoria 2026-09-29): `/state` aceitava chave LIVRE, e o worker le
#: `hibernation_until` para dormir enquanto o timestamp for futuro
#: (`worker/loop.py:105`). Bastava a credencial de servico para paralisar a fila
#: inteira sem precisar de mais nada.
#:
#: A lista nao e politica minha: e o fecho por AST das chamadas
#: `get_system_state`/`set_system_state` do proprio repositorio. Medido em
#: 2026-09-29, sao exatamente estas quatro chaves. Chave nova que o sistema
#: comece a ler precisa ser declarada aqui -- e a falha e visivel, em vez de um
#: escritor silencioso decidir o valor de um campo que o loop consome.
#:
#: Leitura e mais permissiva que escrita de proposito: `GET /state?key=<outra>`
#: devolve `None` inofensivo, enquanto `POST /state` com chave desconhecida vira
#: linha nova na tabela que ninguem le. O date de escrita e a superficie.
CHAVES_DE_ESTADO = frozenset({"autonomy_mode", "hibernation_until", "keys_last_audit", "watchdog_last_metrics"})


async def handle_get_state(request: web.Request) -> web.Response:
    """Recupera uma variavel de estado dinamico do sistema."""
    manager = request.app[MANAGER_KEY]
    try:
        key = request.rel_url.query.get("key")
        if not key:
            return web.json_response({"error": "key param missing"}, status=400)
        val = await manager.get_system_state(key)
        return web.json_response({"value": val})
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_get_state")


async def handle_set_state(request: web.Request) -> web.Response:
    """Define uma variavel de estado dinamico do sistema."""
    manager = request.app[MANAGER_KEY]
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        key = data.get("key")
        value = data.get("value")
        if not key:
            return web.json_response({"error": "key missing"}, status=400)
        if not isinstance(key, str):
            return web.json_response({"error": "key deve ser string."}, status=400)
        if key not in CHAVES_DE_ESTADO:
            return web.json_response(
                {"error": f"Chave de estado nao declarada: {key}. Consultar CHAVES_DE_ESTADO."},
                status=400,
            )
        if value is None:
            return web.json_response({"error": "value missing"}, status=400)
        value_str = value if isinstance(value, str) else str(value)
        await manager.set_system_state(key, value_str)
        return web.json_response({"status": "SUCCESS"})
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_set_state")


async def handle_ask_oracle(request: web.Request) -> web.Response:
    """Rota Hibrida do Oraculo para o Frontend SOTA (RAG Local)."""
    try:
        # SOTA: Fallback de encoding para lidar com PowerShell antigo (Windows-1252/latin-1)
        raw_body = await request.read()
        try:
            body_text = raw_body.decode("utf-8")
        except UnicodeDecodeError:
            body_text = raw_body.decode("latin-1", errors="ignore")

        try:
            parsed = json.loads(body_text) if body_text else {}
        except json.JSONDecodeError:
            return web.json_response({"error": "Corpo JSON invalido."}, status=400)
        if not isinstance(parsed, dict):
            return web.json_response({"error": "Corpo JSON deve ser um objeto."}, status=400)
        data = cast(dict[str, Any], parsed)
        question = data.get("question")
        if not question or not isinstance(question, str) or len(question) > 4000:
            return web.json_response({"error": "Parametro 'question' ausente ou invalido."}, status=400)
        # BK-18: `int()` de valor invalido virava 500, e o valor nao tinha teto.
        n_results_raw = data.get("n_results", 3)
        try:
            n_results = int(n_results_raw) if n_results_raw is not None else 3
        except (TypeError, ValueError):
            return web.json_response({"error": "Parametro 'n_results' deve ser inteiro."}, status=400)
        if not 1 <= n_results <= 50:
            return web.json_response({"error": "Parametro 'n_results' deve estar entre 1 e 50."}, status=400)

        system1: dict[str, Any] | None = None
        try:
            from llm.laya_bridge import classificar_intencao  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

            system1 = classificar_intencao(question).metadados_s1()
        except Exception as laya_error:  # noqa: BLE001
            logger.debug("Laya System-1 indisponivel para /ask-oracle: %s", laya_error)

        rag = await _te.get_rag_async()
        # SOTA BYOK: Bloqueio estrito de vazamento de tokens. Retrieval 100% local (CPU/SQLite).
        answer = await rag.query_memory(question, n_results=n_results, local_only=True)
        return web.json_response({"status": "SUCCESS", "answer": answer, "system1": system1})
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_ask_oracle")


def _parse_s1_min_confidence(data: dict[str, Any]) -> tuple[float | None, bool, web.Response | None]:
    has_min_conf_key = "min_confidence" in data
    raw_min_conf = data.get("min_confidence")
    if raw_min_conf is None:
        return None, has_min_conf_key, None
    try:
        parsed = float(raw_min_conf)
    except (TypeError, ValueError):
        return (
            None,
            has_min_conf_key,
            web.json_response(
                {"status": "ERROR", "error": "Parametro 'min_confidence' deve ser numero entre 0 e 1."},
                status=400,
            ),
        )
    if not math.isfinite(parsed) or not 0.0 <= parsed <= 1.0:
        return (
            None,
            has_min_conf_key,
            web.json_response(
                {"status": "ERROR", "error": "Parametro 'min_confidence' deve estar entre 0.0 e 1.0."},
                status=400,
            ),
        )
    return parsed, has_min_conf_key, None


async def handle_s1_decide(request: web.Request) -> web.Response:
    """POST /api/v1/s1/decide -- cascata System-1 (Laya -> microservico -> Gemini Decision 1).

    Body: ``{"state": str|dict, "questions": {qid: {type,instructions,criteria}},
    "prefer_cloud": bool?}``. Resposta: ``DecisionResult.to_dict()`` com
    proveniencia secao 4 (engine ``laya-s1-trained`` | ``laya-s1-fallback`` |
    ``gemini-decision-1``). Erros de formato -> 400; nenhum motor -> 503.
    """
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    state = data.get("state")
    questions = data.get("questions")
    if state is None or state == "" or not isinstance(questions, dict) or not questions:
        return web.json_response(
            {"status": "ERROR", "error": "Parametros 'state' e 'questions' (mapa nao vazio) sao obrigatorios."},
            status=400,
        )
    prefer_cloud = bool(data.get("prefer_cloud", False))
    parsed_min_conf, has_min_conf_key, min_conf_err = _parse_s1_min_confidence(data)
    if min_conf_err is not None:
        return min_conf_err

    def _run_decide() -> Any:
        from llm.gemini_decisions import decide_s1, default_min_confidence  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        if parsed_min_conf is not None:
            eff_min_conf: float | None = parsed_min_conf
        elif has_min_conf_key:
            eff_min_conf = None
        else:
            eff_min_conf = default_min_confidence()
        return decide_s1(state, questions, prefer_cloud=prefer_cloud, min_confidence=eff_min_conf)

    try:
        result = await asyncio.to_thread(_run_decide)
    except RuntimeError as e:
        return web.json_response({"status": "ERROR", "error": str(e)[:300]}, status=503)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_s1_decide")

    payload = result.to_dict()
    payload["status"] = "SUCCESS"
    return web.json_response(payload)


def _parse_glossary_terms(raw: Any) -> tuple[list[str] | None, web.Response | None]:
    if raw is None:
        return None, None
    if not isinstance(raw, list):
        return None, web.json_response(
            {"status": "ERROR", "error": "Parametro 'glossary_terms' deve ser lista de strings."},
            status=400,
        )
    return ([str(t) for t in raw] if raw else None), None


def _parse_translate_payload(data: Any) -> tuple[dict[str, Any] | None, web.Response | None]:
    """Valida e normaliza payload JSON de ``POST /api/v1/translate``."""
    if not isinstance(data, dict):
        return None, web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)
    raw_image_path = data.get("image_path")
    if isinstance(raw_image_path, str) and raw_image_path.strip():
        return None, web.json_response(
            {"status": "ERROR", "error": "Parametro 'image_path' nao permitido via HTTP. Envie 'image_base64'."},
            status=400,
        )
    text_raw = data.get("text")
    img_raw = data.get("image_base64")
    text_val = text_raw if isinstance(text_raw, str) else ""
    img_val = img_raw if isinstance(img_raw, str) else ""
    has_text = bool(text_val.strip())
    has_img = bool(img_val.strip())
    if not has_text and not has_img:
        return None, web.json_response(
            {"status": "ERROR", "error": "Informe 'text' ou 'image_base64' nao vazio."},
            status=400,
        )
    if len(text_val) > 32_000:
        return None, web.json_response(
            {"status": "ERROR", "error": "Parametro 'text' excede limite de 32000 caracteres."},
            status=400,
        )
    if len(img_val) > 4 * 1024 * 1024:
        return None, web.json_response(
            {"status": "ERROR", "error": "Parametro 'image_base64' excede limite de 4MB."},
            status=400,
        )
    domain = str(data.get("domain") or "general").strip().lower()
    if domain not in ("general", "poker", "tech"):
        return None, web.json_response(
            {"status": "ERROR", "error": "Parametro 'domain' deve ser general, poker ou tech."},
            status=400,
        )
    glossary_list, glossary_err = _parse_glossary_terms(data.get("glossary_terms"))
    if glossary_err is not None:
        return None, glossary_err
    return {
        "has_img": has_img,
        "text": text_val,
        "image": img_val,
        "target_lang": str(data.get("target_lang") or "pt-BR"),
        "source_lang": str(data.get("source_lang") or "auto"),
        "domain": domain,
        "glossary_terms": glossary_list,
        "prefer_local": bool(data.get("prefer_local", True)),
        "allow_cloud_fallback": bool(data.get("allow_cloud_fallback", True)),
    }, None


async def handle_translate(request: web.Request) -> web.Response:
    """POST /api/v1/translate -- traducao multilingue/vision via TranslateGemma 4B."""
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    params, err_resp = _parse_translate_payload(data)
    if err_resp is not None or params is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    def _run_translate() -> Any:
        from llm.translategemma import translate_image, translate_text  # noqa: PLC0415

        if params["has_img"]:
            src = "en" if params["source_lang"] == "auto" else params["source_lang"]
            return translate_image(
                params["image"],
                target_lang=params["target_lang"],
                source_lang=src,
                domain=params["domain"],
                prefer_local=params["prefer_local"],
                allow_cloud_fallback=params["allow_cloud_fallback"],
                allow_local_path=False,
            )
        return translate_text(
            params["text"],
            target_lang=params["target_lang"],
            source_lang=params["source_lang"],
            domain=params["domain"],
            glossary_terms=params["glossary_terms"],
            prefer_local=params["prefer_local"],
            allow_cloud_fallback=params["allow_cloud_fallback"],
        )

    try:
        result = await asyncio.to_thread(_run_translate)
    except RuntimeError as e:
        return web.json_response({"status": "ERROR", "error": str(e)[:300]}, status=503)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_translate")

    payload = result.to_dict()
    payload["status"] = "ERROR" if result.error else "SUCCESS"
    return web.json_response(payload, status=503 if result.error else 200)


async def handle_health(request: web.Request) -> web.Response:
    """Retorna status operacional do worker: contagens de tarefas e uptime."""
    manager = request.app[MANAGER_KEY]
    try:
        counts = await manager.get_task_counts()
        start_time = request.app.get(START_TIME_KEY, time.time())
        uptime_s = int(time.time() - start_time)

        agents_manifest = getattr(_te, "AGENTS_MANIFEST", {})
        agents_count = len(cast(dict[str, Any], agents_manifest)) if isinstance(agents_manifest, dict) else 0

        return web.json_response(
            {
                "status": "ok",
                "uptime_s": uptime_s,
                "tasks": counts,
                "agents": agents_count,
            }
        )
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_health", status="error")


async def handle_get_db_summary(request: web.Request) -> web.Response:
    """Retorna um sumario de metricas do banco de dados (contagens e orcamento)."""
    manager = request.app[MANAGER_KEY]
    try:
        # SOTA: Centraliza a leitura de metricas via API para evitar lock de DB
        counts = await manager.get_task_counts()
        budget = await manager.get_daily_budget_usage()
        agents_manifest = getattr(_te, "AGENTS_MANIFEST", {})
        # FE-05 (auditoria de frontend 2026-09-17): o dashboard exibia o teto do orcamento e a
        # contagem de agentes como constantes (5000 e 15; o manifesto tem 19). Os dois saem das
        # fontes canonicas, e o nome diz o que se conta: agentes REGISTRADOS, nao vivos.
        return web.json_response(
            {
                "tasks": counts,
                "budget": budget,
                "budget_limit": DAILY_API_BUDGET,
                "agents_registered": len(agents_manifest) if isinstance(agents_manifest, dict) else 0,
            }
        )
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_get_db_summary", status="error")


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
        return _internal_error(e, "handle_get_system_status")


async def handle_get_tournaments(request: web.Request) -> web.Response:
    """Endpoint do Laboratorio de ICM para listar Torneios."""
    lab_manager = request.app.get(LAB_MANAGER_KEY)
    if not lab_manager:
        return web.json_response({"error": "LabManager nao inicializado"}, status=500)
    try:
        tournaments = await lab_manager.get_tournaments()
        return web.json_response({"status": "SUCCESS", "data": tournaments})
    except LabPersistenceUnavailableError as err:
        # 503 e nao 200-vazio: persistencia indisponivel NAO e "zero torneios".
        error_id = uuid4().hex[:12]
        logger.warning("[%s] handle_get_tournaments: %s", error_id, err)
        return web.json_response(
            {"status": "ERROR", "error": "Persistencia do laboratorio indisponivel.", "error_id": error_id},
            status=503,
        )
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_get_tournaments")


async def handle_rag_ingest(request: web.Request) -> web.Response:
    """Endpoint SOTA para disparar a ingestao do RAG em background (Zero Cold-Start)."""
    try:
        # SOTA: Expurga caches em RAM. Se os arquivos MD mudaram para o RAG, devem mudar para o LLM.
        system_prompt_cache = getattr(_te, "SYSTEM_PROMPT_CACHE", None)
        if isinstance(system_prompt_cache, dict):
            system_prompt_cache.clear()
        if hasattr(_read_file_cached_internal, "cache_clear"):
            _read_file_cached_internal.cache_clear()  # type: ignore

        rag = await _te.get_rag_async()
        # Friccao Zero: Single-flight para nao empilhar ingestoes concorrentes
        bg_tasks = _get_bg_tasks(request.app)
        if any(not existing.done() and existing.get_name() == "rag-ingest" for existing in bg_tasks):
            return web.json_response(
                {
                    "status": "SUCCESS",
                    "message": "Ingestao RAG ja esta em execucao em background.",
                },
                status=202,
            )

        def _on_rag_ingest_done(finished: asyncio.Task[Any]) -> None:
            bg_tasks.discard(finished)
            if not finished.cancelled():
                exc = finished.exception()
                if exc is not None:
                    logger.error("[RAG] Falha em ingestao background: %s", exc, exc_info=exc)

        task = asyncio.create_task(rag.ingest_all_memories(), name="rag-ingest")
        bg_tasks.add(task)
        task.add_done_callback(_on_rag_ingest_done)
        return web.json_response(
            {
                "status": "SUCCESS",
                "message": "Ingestao RAG iniciada em background.",
            },
            status=202,
        )
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_rag_ingest")


async def handle_get_resource_usage(_request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Monitoramento de VRAM e RAM em tempo real."""
    try:

        def _get_usage() -> dict[str, Any]:
            return {
                "ram": ResourceGuard.get_ram_usage(),  # pyright: ignore[reportUnknownMemberType]
                "vram": ResourceGuard.get_vram_usage(),  # pyright: ignore[reportUnknownMemberType]
                "is_healthy": ResourceGuard.check_health(),
            }

        usage = await asyncio.to_thread(_get_usage)
        return web.json_response({"status": "SUCCESS", "usage": usage})
    except Exception as e:
        return _internal_error(e, "handle_get_resource_usage")


async def handle_rag_query(request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Consulta RAG com Caching de Multi-Tier."""
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        query_data = RAGQuery.model_validate(data)

        # Check Cache Tier 1/2
        cache_key = f"rag_query:{query_data.query}:{query_data.top_k}"
        cached_result = sota_cache.get(cache_key)
        if cached_result:
            return web.json_response({"status": "SUCCESS", "answer": cached_result, "cached": True})

        rag = await _te.get_rag_async()
        answer = await rag.query_memory(query_data.query, n_results=query_data.top_k, local_only=True)

        # Save to Cache -- so em memoria (LRU com teto). O tier de disco criava um
        # arquivo por consulta distinta, sem eviccao (BK-18).
        sota_cache.set(cache_key, answer, persist=False)

        return web.json_response({"status": "SUCCESS", "answer": answer, "cached": False})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_rag_query")


class BucketOpRequest(BaseModel):
    op: Literal["upload", "download"]
    bucket: str = Field(default="default", min_length=1, max_length=255)
    filename: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="", max_length=2 * 1024 * 1024)


async def handle_bucket_op(request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Operacoes de Bucketing (Storage Abstraction)."""
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        req = BucketOpRequest.model_validate(data)

        if req.op == "upload":
            await asyncio.to_thread(sota_buckets.upload_file, req.bucket, req.filename, req.content.encode("utf-8"))
            return web.json_response({"status": "SUCCESS", "message": f"File {req.filename} uploaded to {req.bucket}"})
        if req.op == "download":
            content = await asyncio.to_thread(sota_buckets.download_file, req.bucket, req.filename)
            if content is not None:
                return web.json_response({"status": "SUCCESS", "content": content.decode("utf-8", errors="replace")})
            return web.json_response({"error": "File not found"}, status=404)

        return web.json_response({"error": "Invalid operation"}, status=400)
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except ValueError as exc:
        return web.json_response({"error": str(exc)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_bucket_op")


#: Teto de eventos por requisicao em `/api/logs/frontend` (BK-05). O cliente de
#: telemetria envia lotes; o teto limita o que UMA chamada pode empurrar ao disco.
MAX_FRONTEND_EVENTS_PER_REQUEST = 100


class FrontendLogEvent(BaseModel):
    """Evento de log do frontend. Campos extras sao descartados, nao gravados."""

    model_config = ConfigDict(extra="ignore")

    level: str = "info"
    component: str = "Unknown"
    message: str = ""

    @field_validator("level", "component", "message", mode="before")
    @classmethod
    def _truncar(cls, value: Any, info: ValidationInfo) -> str:
        """Trunca em vez de rejeitar: um stack longo nao deve descartar o lote inteiro."""
        limite = {"level": 16, "component": 128, "message": 4000}[info.field_name or "message"]
        return str(value if value is not None else "")[:limite]


class FrontendLogsRequest(BaseModel):
    """BK-05 (auditoria 2026-09-16): `events` era `list[Any]` sem teto.

    Cada `{}` virava ~107 bytes de JSONL: medido 1,36 MB de corpo -> 36,4 MB em
    disco (26,7x), numa rota de produto. E um evento nao-dict levantava
    AttributeError na task em background, descartando o lote inteiro.
    """

    events: list[FrontendLogEvent] = Field(..., max_length=MAX_FRONTEND_EVENTS_PER_REQUEST)


async def handle_frontend_logs(request: web.Request) -> web.Response:
    """Endpoint para processar logs e eventos vindos do Frontend SOTA."""
    audit_engine = request.app.get(AUDIT_ENGINE_KEY)
    if not audit_engine:
        return web.json_response({"error": "AuditEngine nao inicializado"}, status=500)
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        req = FrontendLogsRequest.model_validate(data)
        if req.events:
            # Processamento assincrono para nao travar a resposta HTTP
            bg_tasks = _get_bg_tasks(request.app)
            task = asyncio.create_task(
                audit_engine.process_frontend_events([event.model_dump() for event in req.events])
            )
            bg_tasks.add(task)
            task.add_done_callback(bg_tasks.discard)
        return web.json_response({"status": "SUCCESS", "processed": len(req.events)})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_frontend_logs")


async def handle_web_search(request: web.Request) -> web.Response:
    """Realiza busca na web via Tavily/DDG fallback e retorna JSON."""
    try:
        query = request.rel_url.query.get("q", "").strip()
        if not query:
            return web.json_response({"error": "Query parameter 'q' is required"}, status=400)
        # SEC-10 (auditoria 2026-09-30): `max_results` tinha teto (20) e a query
        # nao. Tavily e DDG cobram por chamada, entao o teto ausente e
        # superficie de custo, nao de seguranca -- mas e do mesmo modo de falha:
        # entrada sem limite numa rota que chama servico externo.
        if len(query) > MAX_WEB_SEARCH_QUERY_CHARS:
            return web.json_response({"error": f"Query excede {MAX_WEB_SEARCH_QUERY_CHARS} caracteres."}, status=400)

        max_results_str = request.rel_url.query.get("max", "5")
        try:
            max_results = max(1, min(int(max_results_str), 20))
        except ValueError:
            max_results = 5

        # SEC-06 (auditoria 2026-09-30): `provider` chegava sem validacao e com
        # `# type: ignore` apagando o `Literal` que o type checker leria. O
        # `if/elif/else` de `WebSearchEngine.search` e fail-safe -- valor
        # desconhecido cai no ramo `else` e vai para o DDG -- entao nao havia
        # SSRF nem bypass de provedor. O defeito era a supressao esconder a
        # violacao: o compilador via o erro e o comentario o desligava.
        # A allowlist abaixo e a mesma escolha de `rotas_e_de_produto`: o que
        # nao e declarado nao passa.
        raw_provider = request.rel_url.query.get("provider", "auto").strip().lower()
        if raw_provider not in ALLOWED_SEARCH_PROVIDERS:
            return web.json_response(
                {"error": f"provider invalido. Use um de: {', '.join(sorted(ALLOWED_SEARCH_PROVIDERS))}."},
                status=400,
            )
        # O `cast` e o que fecha o `reportArgumentType` que o pyright acusava
        # nesta linha. A allowlist acima ja provou que o valor e um dos tres
        # declarados, mas o type checker nao estreita `frozenset[str]` para
        # `Literal[...]` -- e a unica forma de expressar isso e nomear o tipo.
        # `cast` declara o que a VALIDACAO acima ja provou; `# type: ignore`
        # desligaria o proprio sinal que detects a validacao, e era o que
        # escondia o defeito antes (o comentario medido em SEC-06).
        provider = cast(SearchProvider, raw_provider)

        engine = get_search_engine_from_env()

        resp = await engine.search(query, max_results=max_results, preferred_provider=provider)

        if resp.error:
            # O texto do provedor pode trazer detalhe de conta ou de chave (BK-15): fica no log.
            error_id = uuid4().hex[:12]
            logger.warning("[%s] handle_web_search: provedor devolveu erro: %s", error_id, resp.error)
            return web.json_response({"error": "Falha no provedor de busca.", "error_id": error_id}, status=502)

        results_list: list[dict[str, Any]] = []
        for r in resp.results:
            results_list.append(
                {
                    "title": r.title,
                    "url": r.url,
                    "snippet": r.snippet,
                    "score": r.score,
                    "provider": r.provider,
                }
            )

        return web.json_response(
            {
                "query": resp.query,
                "results": results_list,
                "provider_used": resp.provider_used,
                "latency_ms": resp.latency_ms,
            }
        )
    except Exception as e:
        return _internal_error(e, "handle_web_search")


async def handle_calculate_perspective(request: web.Request) -> web.Response:
    """Calcula pontualmente a Perspectiva Matematica (PMev) VITOI."""
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        req = PerspectiveCalculationRequest.model_validate(data)

        ev_fold = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
            base_antes=req.base_antes,
            time_to_blind_minutes=req.time_to_blind_minutes,
            payjump_proximity_factor=req.payjump_proximity_factor,
            position=req.position,
        )
        struct_liab = VitoiPerspectiveEngine.calculate_structural_liability(
            multiway_opponents=req.multiway_opponents,
            base_rio=req.base_rio,
        )
        amort_edge = VitoiPerspectiveEngine.calculate_edge_amortization(
            stack_depth_bb=req.stack_depth_bb,
            edge_base=req.edge_base,
            aggression_factor=req.aggression_factor,
        )

        effective_eq = max(0.01, min(0.99, req.equity * req.realization_factor))
        win_delta = req.pot_size - req.hero_invested
        lose_delta = -(req.hero_invested + (req.pot_size * 0.5))

        u_win = VitoiPerspectiveEngine.calculate_utility(win_delta, req.loss_aversion_base) * req.valuation_stack
        u_lose = VitoiPerspectiveEngine.calculate_utility(lose_delta, req.loss_aversion_base) * req.valuation_stack

        pmev_value = round(
            (effective_eq * u_win) + ((1.0 - effective_eq) * u_lose) - ev_fold - struct_liab + amort_edge, 4
        )

        opt_action = "FOLD"
        if pmev_value > 0.5:
            opt_action = "RAISE"
        elif pmev_value >= 0.0:
            opt_action = "CALL"

        bf_est = round(1.0 + (req.payjump_proximity_factor * 0.8), 2)
        req_eq = round(bf_est / (bf_est + 1.0) if (bf_est + 1.0) > 0 else 0.5, 4)
        risk_adv = round((1.0 - req.payjump_proximity_factor) * 25.0, 2)

        result = PerspectivaResult(
            pmev=pmev_value,
            dynamic_ev_fold=ev_fold,
            structural_liability=struct_liab,
            amortized_edge=amort_edge,
            risk_advantage=risk_adv,
            required_equity=req_eq,
            bubble_factor=bf_est,
            utility_win=round(u_win, 4),
            utility_lose=round(u_lose, 4),
            optimal_action=opt_action,
            metadata={"position": req.position, "multiway_opponents": req.multiway_opponents},
        )
        return web.json_response(result.model_dump())
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_calculate_perspective")


async def _diagnostico_dream_rsi(tree_res: dict[str, Any], runtime_ms: float) -> dict[str, object]:
    """Grava a arvore no historico Dream-RSI e devolve o diagnostico de poda, fora do laco de eventos.

    Observacional: nenhum valor do PMev muda. Falha aqui nunca derruba a resposta -- aparece
    no log e no proprio diagnostico, nunca em silencio.
    """
    # pylint: disable=import-outside-toplevel
    try:
        from engine.discovery_recorder import recorder_do_runtime  # noqa: PLC0415 -- carga sob demanda
        from engine.pmev_dream_bridge import PMevDreamBridge  # noqa: PLC0415

        simulator = recorder_do_runtime().simulator
        return await asyncio.to_thread(
            PMevDreamBridge().diagnosticar_arvore_de_perspectiva, tree_res, runtime_ms, simulator
        )
    except Exception as exc:  # noqa: BLE001 -- telemetria nao pode derrubar o calculo
        logger.warning("[DREAM-RSI] arvore PMev nao registrada: %s", exc)
        return {"erro": type(exc).__name__}


async def handle_simulate_perspective_tree(request: web.Request) -> web.Response:
    """Executa a simulacao recursiva da arvore de decisao de Perspectiva Matematica."""
    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)
    try:
        req = PerspectiveTreeRequest.model_validate(data)

        def _simulate() -> tuple[dict[str, Any], float]:
            ev_fold = (
                req.ev_fold_dynamic
                if req.ev_fold_dynamic is not None
                else VitoiPerspectiveEngine.calculate_dynamic_ev_fold(1.0, 10.0, 0.5, req.position)
            )
            struct_liab = VitoiPerspectiveEngine.calculate_structural_liability(req.active_players - 1, req.base_rio)
            amort_edge = VitoiPerspectiveEngine.calculate_edge_amortization(
                req.stack_eff, req.edge_base, req.aggression_factor
            )

            inicio = time.perf_counter()
            res_tree: dict[str, Any] = VitoiPerspectiveEngine.simulate_decision_tree(
                equity=req.equity,
                pot_size=req.pot_size,
                stack_eff=req.stack_eff,
                active_players=req.active_players,
                street_idx=req.street_idx,
                hero_invested=req.hero_invested,
                ev_fold_dynamic=ev_fold,
                structural_liability=struct_liab,
                valuation_stack=req.valuation_stack,
                amortized_edge=amort_edge,
                aggression_factor=req.aggression_factor,
                realization_factor=req.realization_factor,
                loss_aversion_base=req.loss_aversion_base,
                fgs_health=req.fgs_health,
                rp_opp=req.rp_opp,
                fold_equity=req.fold_equity,
            )
            return res_tree, (time.perf_counter() - inicio) * 1000.0

        tree_res, runtime_ms = await asyncio.to_thread(_simulate)

        # Etapa 0 (laya S1): prior de ruina sobre a barreira de ruina (Teorema 2, BF<1).
        # intencao_s1 (Task.metadata['n']) -> ruin_priority via llm.laya_bridge.
        # Prefiltro: o premium de ruina e calculado apenas quando o input e incerto
        # (nao_latin>0 -> ruin_priority>1). S1 nao decide os 10 teoremas (Secao 3); modula
        # o prior de sobrevivencia. Proveniancia: 's1_ruin_prior'.
        ruin_prior_s1 = ruin_priority_from_intencao(req.intencao_s1)
        if not math.isclose(ruin_prior_s1, 1.0):
            tree_res["s1_ruin_prior"] = ruin_prior_s1
            tree_res["negative_risk_premium"] = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(
                pot_size=req.pot_size,
                bet_size=min(req.pot_size * 0.5, req.stack_eff),
                residual_stack_bb=req.stack_eff,
                fold_survival_prob=0.05,
                call_win_survival_prob=0.40,
                ruin_prior=ruin_prior_s1,
            )

        resp = PerspectiveTreeResponse(
            status="SUCCESS",
            tree_result=tree_res,
            summary={
                "best_action": tree_res.get("best_action"),
                "pm_best": tree_res.get("pm_best"),
                "p_best_outcome": tree_res.get("p_best_outcome"),
                "dream_rsi": await _diagnostico_dream_rsi(tree_res, runtime_ms),
            },
        )
        return web.json_response(resp.model_dump())
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_simulate_perspective_tree")


async def handle_import_solver_tree(request: web.Request) -> web.Response:
    """Importa e normaliza arvores de DeepSolver, GTOWizard, Monker, HRC Pro e PioSolver."""
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)
    try:
        req = SolverImportRequest.model_validate(data)

        def _run_import() -> Any:
            importer = UniversalSolverImporter()
            return importer.import_tree(
                raw_content=req.raw_content,
                solver_type=req.solver_type,
                tournament_context=req.tournament_context,
                convert_to_pmev=True,
            )

        response = await asyncio.to_thread(_run_import)

        return web.json_response(response.model_dump(), status=200 if response.status == "SUCCESS" else 400)
    except ValidationError as ve:
        return web.json_response({"error": str(ve), "status": "ERROR"}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_import_solver_tree", status="ERROR")


async def handle_pmev_heatmap(request: web.Request) -> web.Response:
    """Gera matriz comparativa 13x13 (DeepSolver vs. PMev) e analise diferencial de combos."""
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)
    try:
        req = PmevHeatmapRequest.model_validate(data)

        def _compute_heatmap() -> tuple[dict[str, Any], dict[str, Any] | None]:
            threshold = req.pmev_threshold
            calc_res_inner: dict[str, Any] | None = None
            if threshold is None:
                calc_res_inner = calculate_pmev_call_threshold(
                    pot=req.pot,
                    call_amount=req.call_amount,
                    bubble_factor=req.bubble_factor,
                    stack_bb=req.stack_bb,
                    position=req.position,
                    time_to_blind=req.time_to_blind_minutes,
                    edge_base=req.edge_base,
                    aggression=req.aggression,
                    loss_aversion_lambda=req.loss_aversion_lambda,
                    ante_bb=req.ante_bb,
                    players_behind=req.players_behind,
                    structure_speed=req.structure_speed,
                )
                threshold = calc_res_inner["pmev_req"]

            importer = DeepSolverImporter()
            return importer.generate_pmev_heatmap(
                deepsolver_range=req.deepsolver_range,
                pmev_threshold=threshold,
            ), calc_res_inner

        heatmap_data, calc_res = await asyncio.to_thread(_compute_heatmap)

        resp = PmevHeatmapResponse(
            status="SUCCESS",
            pmev_threshold=heatmap_data["pmev_threshold"],
            deepsolver_matrix=heatmap_data["deepsolver_matrix"],
            pmev_matrix=heatmap_data["pmev_matrix"],
            delta_matrix=heatmap_data["delta_matrix"],
            total_deepsolver_combos=heatmap_data["total_deepsolver_combos"],
            total_pmev_combos=heatmap_data["total_pmev_combos"],
            combo_delta=heatmap_data["combo_delta"],
            expanded_hands_count=heatmap_data["expanded_hands_count"],
            contracted_hands_count=heatmap_data["contracted_hands_count"],
            expanded_hands=heatmap_data["expanded_hands"],
            contracted_hands=heatmap_data["contracted_hands"],
            ev_fold_bb=calc_res["ev_fold_bb"] if calc_res else None,
            players_behind=int(calc_res["players_behind"])
            if (calc_res and calc_res["players_behind"] is not None)
            else None,
            ascii_heatmap=heatmap_data["ascii_heatmap"],
            cells=heatmap_data["cells"],
            error=None,
        )
        return web.json_response(resp.model_dump())
    except ValidationError as ve:
        return web.json_response({"error": str(ve), "status": "ERROR"}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_pmev_heatmap", status="ERROR")


async def handle_chrysalis_health(_request: web.Request) -> web.Response:
    """Sonda o servico Chrysalis (loopback) e devolve saude + proveniencia."""
    try:

        def _probe() -> dict[str, Any]:
            client = ChrysalisClient()
            return client.get_health().to_dict()

        health = await asyncio.to_thread(_probe)
        return web.json_response({"status": "SUCCESS", "health": health})
    except Exception as exc:
        return _internal_error(exc, "handle_chrysalis_health", status="ERROR")


async def handle_chrysalis_validate_plan(request: web.Request) -> web.Response:
    """Valida plano de edicao com revisao otimista (sem mutar arquivo)."""
    body, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or body is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)
    mode = str(body.get("mode", "accept"))
    approved = body.get("approved") is True
    mutation = mode != "plan"

    def _validate() -> dict[str, Any]:
        client = ChrysalisClient()
        path = validate_workspace_path(str(body.get("workspace_path", "")))
        content = str(body.get("content", ""))
        new_content = str(body.get("new_content", ""))
        expected = str(body.get("expected_revision") or compute_revision(content))
        if expected != compute_revision(content):
            raise RuntimeError(CHRYSALIS_ERROR_STALE_REVISION)
        plan = EditPlan(
            path=path,
            new_content=new_content,
            expected_revision=expected,
            mode=mode,
            approved=approved,
        )
        result = client.validate_edit(plan, current_revision=compute_revision(content), mutation=mutation)
        return {"path": result.path, "revision": result.revision, "undo_id": result.undo_id}

    try:
        data = await asyncio.to_thread(_validate)
        return web.json_response({"status": "SUCCESS", **data})
    except PermissionError as exc:
        return web.json_response({"status": "ERROR", "error": str(exc)}, status=403)
    except RuntimeError as exc:
        if "stale" in str(exc).lower() or "defasada" in str(exc).lower():
            return web.json_response({"status": "ERROR", "error": str(exc)}, status=409)
        return _internal_error(exc, "handle_chrysalis_validate_plan", status="ERROR")
    except ValueError as exc:
        return web.json_response({"status": "ERROR", "error": str(exc)}, status=400)
    except Exception as exc:
        return _internal_error(exc, "handle_chrysalis_validate_plan", status="ERROR")


async def handle_engine_capabilities(_request: web.Request) -> web.Response:
    """Publica o contrato estatico sem alegar que houve probe de runtime."""
    try:
        manifest = await asyncio.to_thread(load_engine_capability_manifest)
        return web.json_response(
            {
                "status": "SUCCESS",
                "runtime_probe_performed": False,
                "manifest": manifest.model_dump(mode="json"),
            }
        )
    except Exception as exc:
        return _internal_error(exc, "handle_engine_capabilities", status="ERROR")


async def handle_prometheus_metrics(request: web.Request) -> web.Response:
    """Endpoint de telemetria em tempo real no formato Prometheus Text Exposition."""
    manager = request.app.get(MANAGER_KEY)
    db_metrics: dict[str, Any] = {}
    if manager and hasattr(manager, "get_realtime_metrics"):
        with contextlib.suppress(Exception):
            db_metrics = await manager.get_realtime_metrics()

    # Coleta de metricas do SO em tempo real.
    #
    # BK-09 (auditoria 2026-09-16): este endpoint emitia VRAM constante
    # (6151575960), circuit breakers fixos em 0 para dois backends, e CPU 8.0 /
    # RAM 6400 quando psutil faltava. Um painel le serie Prometheus como medicao.
    # Serie sem medicao agora e OMITIDA -- ausencia e informacao; valor inventado
    # e desinformacao.
    cpu_load: float | None = None
    ram_free_mb: float | None = None
    if psutil is not None:
        with contextlib.suppress(Exception):
            cpu_load = float(psutil.cpu_percent())
            ram_free_mb = psutil.virtual_memory().available / (1024 * 1024)

    lines = [
        "# HELP nexus_tasks_total Total de tarefas registradas na fila por status",
        "# TYPE nexus_tasks_total gauge",
        f'nexus_tasks_total{{status="pending"}} {db_metrics.get("tasks_pending", 0)}',
        f'nexus_tasks_total{{status="running"}} {db_metrics.get("tasks_running", 0)}',
        f'nexus_tasks_total{{status="completed"}} {db_metrics.get("tasks_completed", 0)}',
        f'nexus_tasks_total{{status="failed"}} {db_metrics.get("tasks_failed", 0)}',
        f'nexus_tasks_total{{status="all"}} {db_metrics.get("tasks_total", 0)}',
        "",
        "# HELP nexus_llm_cache_total Quantidade de prompts em cache B-Tree/RAM",
        "# TYPE nexus_llm_cache_total gauge",
        f"nexus_llm_cache_total {db_metrics.get('cached_prompts_total', 0)}",
        "",
        "# HELP nexus_tokens_consumed_total Total acumulado de tokens consumidos",
        "# TYPE nexus_tokens_consumed_total counter",
        f"nexus_tokens_consumed_total {db_metrics.get('total_tokens_consumed', 0)}",
        "",
        "# HELP nexus_latency_ms_avg Media de latencia das chamadas na ultima hora",
        "# TYPE nexus_latency_ms_avg gauge",
        f"nexus_latency_ms_avg {float(db_metrics.get('avg_latency_ms_1h', 0.0)):.2f}",
        "",
    ]
    if cpu_load is not None:
        lines += [
            "# HELP nexus_hardware_cpu_load_percent Percentual de carga da CPU",
            "# TYPE nexus_hardware_cpu_load_percent gauge",
            f"nexus_hardware_cpu_load_percent {cpu_load:.1f}",
            "",
        ]
    if ram_free_mb is not None:
        lines += [
            "# HELP nexus_hardware_ram_free_mb Memoria RAM livre em megabytes",
            "# TYPE nexus_hardware_ram_free_mb gauge",
            f"nexus_hardware_ram_free_mb {ram_free_mb:.1f}",
            "",
        ]
    http_metrics = request.app.get(HTTP_METRICS_KEY)
    if http_metrics is not None:
        lines.extend(http_metrics.render().splitlines())
    prom_snapshot = get_prometheus_metrics_snapshot()
    if prom_snapshot:
        lines.extend(prom_snapshot.decode("utf-8", errors="replace").splitlines())
    return web.Response(
        text="\n".join(lines) + "\n",
        content_type="text/plain",
        charset="utf-8",
    )


async def _dispatch_timesfm_forecast(
    engine: TimesFMEngine,
    req: TimesFMForecastRequest,
) -> TimesFMForecastResponse:
    """Despacha a inferencia TimesFM conforme o tipo de serie (multivariada, covariadas ou univariada)."""
    if req.series_dict is not None:
        multi_results = await asyncio.to_thread(
            engine.forecast_multivariate,
            series_dict=req.series_dict,
            horizon=req.horizon,
        )
        return TimesFMForecastResponse(
            status="SUCCESS",
            forecast_type="multivariate",
            results={k: v.to_item() for k, v in multi_results.items()},
            model_used=engine.procedencia,
            license_tier=engine.metadata.license_tier.value,
            intended_model=engine.metadata.model_id,
            weights_loaded=engine.weights_loaded,
        )

    series = cast(list[float], req.series)
    if req.past_covariates is not None or req.future_covariates is not None:
        result = await asyncio.to_thread(
            engine.forecast_with_covariates,
            series=series,
            past_covariates=req.past_covariates,
            future_covariates=req.future_covariates,
            horizon=req.horizon,
            frequency_indicator=req.frequency_indicator,
            target_name=req.target_name,
        )
    else:
        result = await asyncio.to_thread(
            engine.forecast_univariate,
            series=series,
            horizon=req.horizon,
            frequency_indicator=req.frequency_indicator,
            target_name=req.target_name,
        )

    return TimesFMForecastResponse(
        status="SUCCESS",
        forecast_type="univariate",
        results={req.target_name: result.to_item()},
        model_used=engine.procedencia,
        license_tier=engine.metadata.license_tier.value,
        intended_model=engine.metadata.model_id,
        weights_loaded=engine.weights_loaded,
    )


async def handle_timesfm_forecast(request: web.Request) -> web.Response:
    """Endpoint de inferencia e previsao temporal via Google Research TimesFM."""
    data, err_resp = await read_json_object(request, error_envelope=True)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"status": "ERROR", "error": INVALID_JSON_BODY}, status=400)

    try:
        req = TimesFMForecastRequest.model_validate(data)
    except ValidationError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)

    if req.series is None and req.series_dict is None:
        return web.json_response(
            {
                "status": "ERROR",
                "error": "Ao menos um dos campos 'series' ou 'series_dict' deve ser fornecido.",
            },
            status=400,
        )

    try:
        engine = TimesFMEngine(
            mode=req.mode,
            preferred_model_key=req.preferred_model_key,
        )

        if not engine.metadata.is_commercial_allowed:
            return web.json_response(
                {
                    "status": "FORBIDDEN",
                    "error": "Pesos TimesFM nao comerciais nao podem ser servidos pela API do produto.",
                    "license_tier": engine.metadata.license_tier.value,
                },
                status=403,
            )

        if req.use_pretrained_weights:
            try:
                await asyncio.to_thread(engine.load_pretrained_weights, local_files_only=True)
            except RuntimeError as e:
                return web.json_response({"status": "NOT_IMPLEMENTED", "error": str(e)}, status=501)
            except Exception as e:  # noqa: BLE001
                logger.warning("TimesFM pretrained weights unavailable; using explicit analytic fallback: %s", e)

        resp = await _dispatch_timesfm_forecast(engine, req)

        return web.json_response(
            _with_execution_provenance(
                resp.model_dump(),
                "timesfm-forecast",
                model_used=engine.procedencia,
                intended_model=engine.metadata.model_id,
                weights_loaded=engine.weights_loaded,
                fallback_used=not engine.weights_loaded,
            )
        )

    except TimesFMGovernanceError as ge:
        logger.warning("TimesFM Violacao de Governanca: %s", ge)
        return web.json_response(
            {
                "status": "FORBIDDEN",
                "error": str(ge),
                "license_tier": "TimesFM Non-Commercial License v1.0 (Apenas Pesquisa)",
            },
            status=403,
        )
    except ValueError as ve:
        return web.json_response({"status": "ERROR", "error": str(ve)}, status=400)
    except Exception as e:
        return _internal_error(e, "handle_timesfm_forecast", status="ERROR")


async def handle_get_skills_index(_request: web.Request) -> web.Response:
    """Retorna taxonomia curada, dominios MECE, cookbooks e metricas da skills_library."""
    from core.skill_router import get_skill_router  # noqa: PLC0415

    try:
        index = await asyncio.to_thread(get_skill_router().load_index)
        return web.json_response(
            {
                "schema_version": index.get("schema_version"),
                "methodology": index.get("methodology"),
                "default_token_budget": index.get("default_token_budget"),
                "stats": index.get("stats"),
                "domains": index.get("domains"),
                "skills": index.get("skills"),
                "harness_skills": index.get("harness_skills"),
                "cookbooks": index.get("cookbooks"),
            }
        )
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_get_skills_index")


async def handle_route_skills(request: web.Request) -> web.Response:
    """Roteia uma tarefa para o dominio ICM especifico e devolve pacote dentro do orcamento."""
    from core.skill_router import route_and_compile_skill_context  # noqa: PLC0415

    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)

    task_text = str(data.get("task", "") or "").strip()
    if not task_text:
        return web.json_response({"error": "Campo 'task' obrigatorio."}, status=400)

    agent = str(data.get("agent", "") or "").strip()
    include_content = bool(data.get("include_content", False))
    raw_budget = data.get("token_budget")
    token_budget = (
        raw_budget if isinstance(raw_budget, int) and not isinstance(raw_budget, bool) and raw_budget >= 200 else None
    )
    raw_meta = data.get("metadata")
    metadata = raw_meta if isinstance(raw_meta, dict) else None

    try:
        packet = route_and_compile_skill_context(
            task_text,
            agent_name=agent,
            metadata=metadata,
            token_budget=token_budget,
            include_content=include_content,
        )
        return web.json_response(packet.to_dict(include_content=include_content))
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_route_skills")


async def handle_evaluate_roi_decision(request: web.Request) -> web.Response:
    """Avalia candidatos ou arbitra concorrencia sob o framework +ROI (Laya S1 / gemini-decision-1)."""
    from core.decision_roi_engine import (  # noqa: PLC0415
        RoiCandidate,
        arbitrate_competition,
        evaluate_roi_decision,
    )

    data, err_resp = await read_json_object(request)
    if err_resp is not None or data is None:
        return err_resp or web.json_response({"error": INVALID_JSON_BODY}, status=400)

    use_s1 = bool(data.get("use_s1", False))
    prefer_cloud = bool(data.get("prefer_cloud", False))

    try:
        if isinstance(data.get("candidates"), list):
            cands = [RoiCandidate.model_validate(item) for item in data["candidates"]]
            comp = arbitrate_competition(cands, use_s1=use_s1, prefer_cloud=prefer_cloud)
            return web.json_response(comp.model_dump())

        cand_raw = data.get("candidate", data)
        if not isinstance(cand_raw, dict):
            return web.json_response({"error": "Payload de candidato invalido."}, status=400)
        cand = RoiCandidate.model_validate({k: v for k, v in cand_raw.items() if k not in {"use_s1", "prefer_cloud"}})
        verdict = evaluate_roi_decision(cand, use_s1=use_s1, prefer_cloud=prefer_cloud)
        return web.json_response(verdict.model_dump())
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:  # noqa: BLE001
        return _internal_error(e, "handle_evaluate_roi_decision")
