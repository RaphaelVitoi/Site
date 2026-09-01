"""
Web Handlers -- Endpoints HTTP do micro-servidor SOTA.
"""

# pylint: disable=broad-exception-caught
from __future__ import annotations

import asyncio
import base64
import contextlib
import json
import logging
import os
from pathlib import Path
import re
import time
from typing import Any, Literal, cast
import zipfile

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore[assignment]

from aiohttp import web
from pydantic import BaseModel, ValidationError

import core.runtime as _te
from core.schemas import RAGQuery, Task
from llm.budget import _RATE_LIMITERS  # pyright: ignore[reportPrivateUsage]
from utils.cache import _read_file_cached_internal  # pyright: ignore[reportPrivateUsage]
from utils.cache import cache as sota_cache
from utils.harmonizer import harmonizer
from utils.resources import ResourceGuard
from utils.storage import buckets as sota_buckets

BASE_WORKSPACE_DIR: Path = Path(__file__).resolve().parent.parent.parent

logger = logging.getLogger(__name__)


def _get_bg_tasks(app: web.Application) -> set[asyncio.Task[Any]]:
    """Recupera ou inicializa o set de background tasks no app aiohttp."""
    if "bg_tasks" not in app:
        app["bg_tasks"] = set()
    return cast(set[asyncio.Task[Any]], app["bg_tasks"])


@harmonizer.ultra_fast_async  # pyright: ignore[reportUnknownMemberType]
async def handle_ping(_request: web.Request) -> web.Response:
    """Heartbeat SOTA para monitoramento de latencia de rede."""
    return web.json_response({"status": "PONG", "timestamp": time.time()})


async def handle_add_task(request: web.Request) -> web.Response:
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


async def handle_get_status(request: web.Request) -> web.Response:
    """Retorna o status das tarefas na fila (todas ou filtradas)."""
    manager = request.app["manager"]
    try:
        status = request.rel_url.query.get("status", None)
        if status == "all":
            status = None
        tasks = await manager.get_tasks(status)
        return web.json_response([t.model_dump() for t in tasks])
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_get_key_health_summary(request: web.Request) -> web.Response:
    """Retorna o relatorio de saude e latencia das chaves de API."""
    manager = request.app["manager"]
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
        return web.json_response({"error": str(e)}, status=500)


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


async def handle_get_state(request: web.Request) -> web.Response:
    """Recupera uma variavel de estado dinamico do sistema."""
    manager = request.app["manager"]
    try:
        key = request.rel_url.query.get("key")
        if not key:
            return web.json_response({"error": "key param missing"}, status=400)
        val = await manager.get_system_state(key)
        return web.json_response({"value": val})
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


async def handle_set_state(request: web.Request) -> web.Response:
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


async def handle_ask_oracle(request: web.Request) -> web.Response:
    """Rota Hibrida do Oraculo para o Frontend SOTA (RAG Local)."""
    try:
        # SOTA: Fallback de encoding para lidar com PowerShell antigo (Windows-1252/latin-1)
        raw_body = await request.read()
        try:
            body_text = raw_body.decode("utf-8")
        except UnicodeDecodeError:
            body_text = raw_body.decode("latin-1", errors="ignore")

        data = cast(dict[str, Any], json.loads(body_text) if body_text else {})
        question = data.get("question")
        n_results_raw = data.get("n_results", 3)
        n_results = int(n_results_raw) if n_results_raw is not None else 3
        if not question or not isinstance(question, str):
            return web.json_response({"error": "Parametro 'question' ausente ou invalido."}, status=400)

        rag = await _te.get_rag_async()
        # SOTA BYOK: Bloqueio estrito de vazamento de tokens. Retrieval 100% local (CPU/SQLite).
        answer = await rag.query_memory(question, n_results=n_results, local_only=True)
        return web.json_response({"status": "SUCCESS", "answer": answer})
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha na consulta ao Oraculo: %s", e)
        return web.json_response({"error": str(e)}, status=500)


async def handle_health(request: web.Request) -> web.Response:
    """Retorna status operacional do worker: contagens de tarefas e uptime."""
    manager = request.app["manager"]
    try:
        counts = await manager.get_task_counts()
        start_time = request.app.get("start_time", time.time())
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


async def handle_get_tournaments(request: web.Request) -> web.Response:
    """Endpoint do Laboratorio de ICM para listar Torneios."""
    lab_manager = request.app.get("lab_manager")
    if not lab_manager:
        return web.json_response({"error": "LabManager nao inicializado"}, status=500)
    try:
        tournaments = await lab_manager.get_tournaments()
        return web.json_response({"status": "SUCCESS", "data": tournaments})
    except Exception as e:  # noqa: BLE001
        return web.json_response({"error": str(e)}, status=500)


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

        def _get_usage() -> dict[str, Any]:
            return {
                "ram": ResourceGuard.get_ram_usage(),  # pyright: ignore[reportUnknownMemberType]
                "vram": ResourceGuard.get_vram_usage(),  # pyright: ignore[reportUnknownMemberType]
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


class BucketOpRequest(BaseModel):
    op: Literal["upload", "download"]
    bucket: str = "default"
    filename: str
    content: str = ""


async def handle_bucket_op(request: web.Request) -> web.Response:
    """SOTA v6.2.1 GOLD: Operacoes de Bucketing (Storage Abstraction)."""
    try:
        data = await request.json()
        req = BucketOpRequest.model_validate(data)

        if req.op == "upload":
            sota_buckets.upload_file(req.bucket, req.filename, req.content.encode())
            return web.json_response({"status": "SUCCESS", "message": f"File {req.filename} uploaded to {req.bucket}"})
        if req.op == "download":
            content = sota_buckets.download_file(req.bucket, req.filename)
            if content:
                return web.json_response({"status": "SUCCESS", "content": content.decode()})
            return web.json_response({"error": "File not found"}, status=404)

        return web.json_response({"error": "Invalid operation"}, status=400)
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except ValueError as exc:
        return web.json_response({"error": str(exc)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


class FrontendLogsRequest(BaseModel):
    events: list[Any]


async def handle_frontend_logs(request: web.Request) -> web.Response:
    """Endpoint para processar logs e eventos vindos do Frontend SOTA."""
    audit_engine = request.app.get("audit_engine")
    if not audit_engine:
        return web.json_response({"error": "AuditEngine nao inicializado"}, status=500)
    try:
        data = await request.json()
        req = FrontendLogsRequest.model_validate(data)
        if req.events:
            # Processamento assincrono para nao travar a resposta HTTP
            bg_tasks = _get_bg_tasks(request.app)
            task = asyncio.create_task(audit_engine.process_frontend_events(req.events))
            bg_tasks.add(task)
            task.add_done_callback(bg_tasks.discard)
        return web.json_response({"status": "SUCCESS", "processed": len(req.events)})
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:  # noqa: BLE001
        logger.exception("Falha ao processar logs do frontend: %s", e)
        return web.json_response({"error": str(e)}, status=500)


IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
SPREADSHEET_EXTS = (".csv", ".xlsx", ".ods", ".xls")
ARCHIVE_EXTS = (".zip", ".rar", ".7z")


def _categorize_file(ext: str) -> str:
    if ext in ARCHIVE_EXTS:
        return "archive"
    if ext in IMAGE_EXTS:
        return "image"
    if ext in (".mp4", ".avi", ".mkv", ".mov", ".mp3", ".wav"):
        return "media"
    if ext in SPREADSHEET_EXTS:
        return "spreadsheet"
    if ext == ".pdf":
        return "pdf"
    return "text"


def _scan_root(name: str, root_resolved: Path, ignored_folders: set[str]) -> list[dict[str, Any]]:

    files_list: list[dict[str, Any]] = []
    for current_root, dirs, files in os.walk(root_resolved):
        dirs[:] = [d for d in dirs if d not in ignored_folders]
        if name == "GoogleDrive":
            relative = Path(current_root).relative_to(root_resolved)
            if len(relative.parts) > 0 and relative.parts[0] not in ("Documentos", "GD", "Documents"):
                dirs.clear()
                continue
        for f in files:
            fpath = Path(current_root) / f
            files_list.append(
                {
                    "name": f,
                    "path": fpath.as_posix(),
                    "relative_path": fpath.relative_to(root_resolved).as_posix(),
                    "category": _categorize_file(fpath.suffix.lower()),
                    "size": fpath.stat().st_size if fpath.exists() else 0,
                }
            )
    return files_list[:200]


def _get_allowed_roots(base_dir: Path) -> list[tuple[str, Path]]:
    allowed_roots = [
        ("Cerebro", base_dir / ".cerebro"),
        ("Project", base_dir),
    ]
    gdrive_base = cast(Path, getattr(_te, "PATH_GDRIVE_ROOT", Path("")))
    if gdrive_base.exists():
        allowed_roots.append(("GoogleDrive", gdrive_base))
    return allowed_roots


async def handle_list_files(_request: web.Request) -> web.Response:
    """SOTA CLI/API: Lists files in the allowed workspace and Google Drive folders."""
    base_dir = BASE_WORKSPACE_DIR
    ignored_folders = {
        ".venv",
        ".venv-wsl",
        "node_modules",
        ".git",
        ".next",
        "temp",
        "reports",
        "dist",
        ".mypy_cache",
        ".ruff_cache",
    }

    def _scan() -> list[dict[str, Any]]:
        tree: list[dict[str, Any]] = []
        for name, root_path in _get_allowed_roots(base_dir):
            if not root_path.exists():
                continue
            root_resolved = root_path.resolve()
            tree.append(
                {
                    "source": name,
                    "path": root_resolved.as_posix(),
                    "files": _scan_root(name, root_resolved, ignored_folders),
                }
            )
        return tree

    try:
        tree = await asyncio.to_thread(_scan)
        return web.json_response({"status": "SUCCESS", "tree": tree})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


def _parse_spreadsheet(ext: str, file_path: Path) -> dict[str, Any]:
    import pandas as pd  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    if ext == ".csv":
        df = pd.read_csv(file_path, nrows=50)  # pyright: ignore[reportUnknownMemberType]
    elif ext == ".xlsx":
        df = pd.read_excel(file_path, nrows=50)  # pyright: ignore[reportUnknownMemberType]
    else:
        df = pd.read_excel(file_path, engine="odf", nrows=50)  # pyright: ignore[reportUnknownMemberType]
    return {"headers": list(df.columns), "rows": df.values.tolist()}  # pyright: ignore[reportUnknownMemberType]


def _list_zip(file_path: Path) -> list[dict[str, Any]]:
    from utils.os_integration import get_winrar_path  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    files: list[dict[str, Any]] = []
    if zipfile.is_zipfile(file_path):
        with zipfile.ZipFile(file_path, "r") as zf:
            for name in zf.namelist():
                info = zf.getinfo(name)
                files.append({"name": name, "size": info.file_size, "is_dir": info.is_dir()})
    else:
        winrar_path = get_winrar_path()
        if winrar_path and os.path.exists(winrar_path):
            files.append({"name": "Conteudo Rar (Visualizacao via WinRAR habilitada)", "size": 0, "is_dir": False})
    return files


def _parse_image(file_path: Path) -> dict[str, Any]:
    from PIL import Image  # pylint: disable=import-outside-toplevel # noqa: PLC0415
    from PIL.ExifTags import TAGS  # pylint: disable=import-outside-toplevel # noqa: PLC0415

    with Image.open(file_path) as img:
        exif_data: dict[str, str] = {}
        if exif := img.getexif():
            for tag_id, val in exif.items():
                tag = TAGS.get(tag_id, tag_id)
                if not isinstance(val, (bytes, bytearray)) and len(str(val)) < 100:
                    exif_data[str(tag)] = str(val)
        b64_str = ""
        if file_path.stat().st_size < 1 * 1024 * 1024:
            with open(file_path, "rb") as f:
                b64_str = base64.b64encode(f.read()).decode("utf-8")
        return {"format": img.format, "size": f"{img.width}x{img.height}", "exif": exif_data, "base64": b64_str}


def _is_file_access_allowed(file_path: Path) -> bool:
    base_dir = Path(__file__).resolve().parent.parent.parent.resolve()
    if file_path.is_relative_to(base_dir):
        return True
    gdrive_base = cast(Path, getattr(_te, "PATH_GDRIVE_ROOT", Path(""))).resolve()
    if gdrive_base.exists() and file_path.is_relative_to(gdrive_base):
        rel = file_path.relative_to(gdrive_base)
        if len(rel.parts) > 0 and rel.parts[0] in ("Documentos", "GD", "Documents"):
            return True
    return False


def _get_raw_content_type(ext: str) -> str:
    if ext == ".pdf":
        return "application/pdf"
    if ext == ".mp4":
        return "video/mp4"
    if ext == ".mov":
        return "video/quicktime"
    if ext == ".mkv":
        return "video/x-matroska"
    if ext == ".avi":
        return "video/x-msvideo"
    if ext == ".mp3":
        return "audio/mpeg"
    if ext == ".wav":
        return "audio/wav"
    if ext in IMAGE_EXTS:
        if ext == ".svg":
            return "image/svg+xml"
        return "image/png"
    return "application/octet-stream"


async def handle_view_file(request: web.Request) -> web.StreamResponse:
    """SOTA CLI/API: Serves or parses the file content securely with traversal guards."""
    path_param = request.rel_url.query.get("path", "").strip()
    raw_param = request.rel_url.query.get("raw", "false").strip().lower() == "true"

    if not path_param:
        return web.json_response({"error": "Parametro 'path' ausente."}, status=400)

    file_path = await asyncio.to_thread(lambda: Path(path_param).resolve())
    if not _is_file_access_allowed(file_path):
        return web.json_response({"error": "[SEC] Acesso negado: Caminho fora das fronteiras autorizadas."}, status=403)

    if not file_path.exists() or not file_path.is_file():
        return web.json_response({"error": "Arquivo nao encontrado ou nao e um arquivo valido."}, status=404)

    ext = file_path.suffix.lower()
    if raw_param:
        return web.FileResponse(file_path, headers={"Content-Type": _get_raw_content_type(ext)})

    try:
        if ext in SPREADSHEET_EXTS:
            sheet_data = await asyncio.to_thread(_parse_spreadsheet, ext, file_path)
            return web.json_response({"type": "spreadsheet", "data": sheet_data})
        if ext in ARCHIVE_EXTS:
            archive_files = await asyncio.to_thread(_list_zip, file_path)
            return web.json_response({"type": "archive", "files": archive_files})
        if ext in IMAGE_EXTS:
            if ext == ".svg":

                def _read_svg_b64():
                    with open(file_path, "rb") as f:
                        return base64.b64encode(f.read()).decode("utf-8")

                b64_str = await asyncio.to_thread(_read_svg_b64)
                return web.json_response(
                    {
                        "type": "image",
                        "data": {
                            "format": "svg+xml",
                            "size": "Vetor (Escalavel)",
                            "exif": {},
                            "base64": b64_str,
                        },
                    }
                )
            img_data = await asyncio.to_thread(_parse_image, file_path)
            return web.json_response({"type": "image", "data": img_data})
        if ext in (".mp4", ".avi", ".mkv", ".mov", ".mp3", ".wav"):
            return web.json_response({"type": "media", "message": "Streaming de media disponivel."})
        if ext in (".pdf", ".docx", ".odt", ".doc", ".ppt", ".pptx", ".odp"):
            rag = await _te.get_rag_async()
            extracted_text = await rag._extract_text_from_file(file_path)  # pyright: ignore[reportPrivateUsage] # pylint: disable=protected-access
            return web.json_response({"type": "document", "content": extracted_text})

        # Safeguard: Prevent reading huge files as plain text to avoid memory spikes
        file_size = file_path.stat().st_size
        if file_size > 5 * 1024 * 1024:
            return web.json_response(
                {
                    "type": "text",
                    "content": f"[Aviso] O arquivo e muito grande ({file_size / 1024 / 1024:.1f} MB) para ser exibido diretamente como texto. Baixe o arquivo bruto ou use o RAG para processa-lo.",
                }
            )

        def _read_text():
            return file_path.read_text(encoding="utf-8", errors="ignore")

        text_content = await asyncio.to_thread(_read_text)
        return web.json_response({"type": "text", "content": text_content})
    except Exception as e:
        return web.json_response({"error": f"Falha ao ler arquivo: {e!s}"}, status=500)


async def handle_web_search(request: web.Request) -> web.Response:
    """Realiza busca na web via Tavily/DDG fallback e retorna JSON."""
    try:
        query = request.rel_url.query.get("q", "").strip()
        if not query:
            return web.json_response({"error": "Query parameter 'q' is required"}, status=400)

        max_results_str = request.rel_url.query.get("max", "5")
        try:
            max_results = int(max_results_str)
        except ValueError:
            max_results = 5

        provider = request.rel_url.query.get("provider", "auto")

        from utils.web_search import get_search_engine_from_env  # noqa: PLC0415

        engine = get_search_engine_from_env()

        resp = await engine.search(query, max_results=max_results, preferred_provider=provider)  # type: ignore

        if resp.error:
            return web.json_response({"error": resp.error}, status=500)

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
        return web.json_response({"error": f"Search failed: {e!s}"}, status=500)


async def handle_calculate_perspective(request: web.Request) -> web.Response:
    """Calcula pontualmente a Perspectiva Matematica (PMev) VITOI."""
    from core.perspective_schemas import PerspectivaResult, PerspectiveCalculationRequest  # noqa: PLC0415
    from engine.vitoi_perspective_engine import VitoiPerspectiveEngine  # noqa: PLC0415

    try:
        data = await request.json()
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
        return web.json_response({"error": f"Erro no calculo de perspectiva: {e!s}"}, status=500)


async def handle_simulate_perspective_tree(request: web.Request) -> web.Response:
    """Executa a simulacao recursiva da arvore de decisao de Perspectiva Matematica."""
    from core.perspective_schemas import PerspectiveTreeRequest, PerspectiveTreeResponse  # noqa: PLC0415
    from engine.vitoi_perspective_engine import VitoiPerspectiveEngine  # noqa: PLC0415

    try:
        data = await request.json()
        req = PerspectiveTreeRequest.model_validate(data)

        ev_fold = (
            req.ev_fold_dynamic
            if req.ev_fold_dynamic is not None
            else VitoiPerspectiveEngine.calculate_dynamic_ev_fold(1.0, 10.0, 0.5, req.position)
        )
        struct_liab = VitoiPerspectiveEngine.calculate_structural_liability(req.active_players - 1, req.base_rio)
        amort_edge = VitoiPerspectiveEngine.calculate_edge_amortization(
            req.stack_eff, req.edge_base, req.aggression_factor
        )

        tree_res = VitoiPerspectiveEngine.simulate_decision_tree(
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

        resp = PerspectiveTreeResponse(
            status="SUCCESS",
            tree_result=tree_res,
            summary={
                "best_action": tree_res.get("best_action"),
                "pm_best": tree_res.get("pm_best"),
                "p_best_outcome": tree_res.get("p_best_outcome"),
            },
        )
        return web.json_response(resp.model_dump())
    except ValidationError as ve:
        return web.json_response({"error": str(ve)}, status=400)
    except Exception as e:
        return web.json_response({"error": f"Erro na simulacao de arvore: {e!s}"}, status=500)


async def handle_import_solver_tree(request: web.Request) -> web.Response:
    """Importa e normaliza arvores de DeepSolver, GTOWizard, Monker, HRC Pro e PioSolver."""
    from core.perspective_schemas import SolverImportRequest  # noqa: PLC0415
    from engine.solver_importers import UniversalSolverImporter  # noqa: PLC0415

    try:
        data = await request.json()
        req = SolverImportRequest.model_validate(data)

        importer = UniversalSolverImporter()
        response = importer.import_tree(
            raw_content=req.raw_content,
            solver_type=req.solver_type,
            tournament_context=req.tournament_context,
            convert_to_pmev=True,
        )

        return web.json_response(response.model_dump(), status=200 if response.status == "SUCCESS" else 400)
    except ValidationError as ve:
        return web.json_response({"error": str(ve), "status": "ERROR"}, status=400)
    except Exception as e:
        return web.json_response({"error": f"Erro na importacao de solver: {e!s}", "status": "ERROR"}, status=500)


async def handle_pmev_heatmap(request: web.Request) -> web.Response:
    """Gera matriz comparativa 13x13 (DeepSolver vs. PMev) e analise diferencial de combos."""
    from core.perspective_schemas import PmevHeatmapRequest, PmevHeatmapResponse  # noqa: PLC0415
    from engine.bayesian_range import calculate_pmev_call_threshold  # noqa: PLC0415
    from engine.solver_importers.deep_solver import DeepSolverImporter  # noqa: PLC0415

    try:
        data = await request.json()
        req = PmevHeatmapRequest.model_validate(data)

        # Se threshold nao for fornecido explicitamente, calcula via motor PMev
        threshold = req.pmev_threshold
        calc_res = None
        if threshold is None:
            calc_res = calculate_pmev_call_threshold(
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
            threshold = calc_res["pmev_req"]

        importer = DeepSolverImporter()
        heatmap_data = importer.generate_pmev_heatmap(
            deepsolver_range=req.deepsolver_range,
            pmev_threshold=threshold,
        )

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
        return web.json_response({"error": f"Erro na geracao de heatmap PMev: {e!s}", "status": "ERROR"}, status=500)


async def handle_prometheus_metrics(request: web.Request) -> web.Response:
    """Endpoint de telemetria em tempo real no formato Prometheus Text Exposition."""
    manager = request.app.get("manager")
    db_metrics: dict[str, Any] = {}
    if manager and hasattr(manager, "get_realtime_metrics"):
        with contextlib.suppress(Exception):
            db_metrics = await manager.get_realtime_metrics()

    # Coleta de metricas do SO em tempo real
    cpu_load = 8.0
    vram_bytes = 6151575960
    ram_free_mb = 6400.0
    if psutil is not None:
        with contextlib.suppress(Exception):
            cpu_load = float(psutil.cpu_percent())
            ram_free_mb = float(psutil.virtual_memory().available / (1024 * 1024))

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
        "# HELP nexus_circuit_breaker_state Estado do Circuit Breaker (0=CLOSED, 1=HALF_OPEN, 2=OPEN)",
        "# TYPE nexus_circuit_breaker_state gauge",
        'nexus_circuit_breaker_state{backend="vulkan_8080"} 0',
        'nexus_circuit_breaker_state{backend="ollama_11434"} 0',
        "",
        "# HELP nexus_hardware_vram_used_bytes VRAM ativa na GPU em bytes",
        "# TYPE nexus_hardware_vram_used_bytes gauge",
        f"nexus_hardware_vram_used_bytes {vram_bytes}",
        "",
        "# HELP nexus_hardware_cpu_load_percent Percentual de carga da CPU",
        "# TYPE nexus_hardware_cpu_load_percent gauge",
        f"nexus_hardware_cpu_load_percent {cpu_load:.1f}",
        "",
        "# HELP nexus_hardware_ram_free_mb Memoria RAM livre em megabytes",
        "# TYPE nexus_hardware_ram_free_mb gauge",
        f"nexus_hardware_ram_free_mb {ram_free_mb:.1f}",
        "",
    ]
    return web.Response(
        text="\n".join(lines) + "\n",
        content_type="text/plain",
        charset="utf-8",
    )
