import asyncio
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4
import importlib

import pytest
from aiohttp import web

from agents.execution import _inject_task_docs
from core.schemas import Task
from database.queue_manager import QueueManager
from web import handlers, middleware


REPO_ROOT = Path(__file__).resolve().parents[1]


class DummyRequest:
    def __init__(self, *, method="GET", headers=None, remote="127.0.0.1", app=None):
        self.method = method
        self.headers = headers or {}
        self.remote = remote
        self.app = app or {}


@pytest.fixture
def local_tmp_dir():
    root = Path.cwd() / ".pytest_tmp"
    root.mkdir(exist_ok=True)
    path = root / f"case_{uuid4().hex}"
    path.mkdir()
    try:
        yield path
    finally:
        for item in sorted(path.rglob("*"), reverse=True):
            if item.is_file():
                item.unlink(missing_ok=True)
            elif item.is_dir():
                item.rmdir()
        path.rmdir()


@pytest.mark.asyncio
async def test_auth_middleware_blocks_browser_origin_when_token_is_not_configured(monkeypatch):
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    request = DummyRequest(
        method="POST",
        headers={"Origin": "https://evil.example"},
        remote="127.0.0.1",
    )

    async def handler(_request):
        return web.json_response({"status": "ok"})

    response = await middleware.auth_middleware(request, handler)

    assert response.status == 403


@pytest.mark.asyncio
async def test_cors_middleware_does_not_reflect_wildcard_for_untrusted_origin():
    request = DummyRequest(headers={"Origin": "https://evil.example"})

    async def handler(_request):
        return web.json_response({"status": "ok"})

    response = await middleware.cors_middleware(request, handler)

    assert response.headers.get("Access-Control-Allow-Origin") != "*"


def test_inject_task_docs_ignores_markdown_paths_outside_workspace(local_tmp_dir, monkeypatch):
    workspace = local_tmp_dir / "workspace"
    workspace.mkdir()
    docs_dir = workspace / "docs" / "tasks" / "safe"
    docs_dir.mkdir(parents=True)
    outside_file = local_tmp_dir / "secret.md"
    outside_file.write_text("TOP SECRET", encoding="utf-8")
    monkeypatch.chdir(workspace)

    task = Task(
        id="TASK-EXT-DOC",
        description="../secret.md",
        agent="@chico",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

    injected = _inject_task_docs(task)

    assert "TOP SECRET" not in injected


@pytest.mark.asyncio
async def test_add_task_rejects_duplicate_ids(local_tmp_dir):
    manager = QueueManager(str(local_tmp_dir / "tasks.db"))
    task = Task(
        id="TASK-DUP",
        description="Primeira versao",
        agent="@chico",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

    await manager.add_task(task)

    with pytest.raises(Exception):
        await manager.add_task(task)


@pytest.mark.asyncio
async def test_handle_rag_ingest_preserves_existing_bg_tasks(monkeypatch):
    existing_task = asyncio.create_task(asyncio.sleep(0))

    async def fake_ingest():
        await asyncio.sleep(0)

    async def fake_get_rag_async():
        return SimpleNamespace(ingest_all_memories=fake_ingest)

    monkeypatch.setattr(handlers._te, "get_rag_async", fake_get_rag_async)
    monkeypatch.setattr(handlers._te, "SYSTEM_PROMPT_CACHE", {})
    monkeypatch.setattr(handlers, "_read_file_cached_internal", SimpleNamespace(cache_clear=lambda: None))

    app = {"bg_tasks": {existing_task}}
    request = SimpleNamespace(app=app)

    await handlers.handle_rag_ingest(request)

    assert existing_task in app["bg_tasks"]

    for task in list(app["bg_tasks"]):
        task.cancel()


@pytest.mark.asyncio
async def test_queue_manager_cache_lookup_matches_real_model_key(local_tmp_dir):
    manager = QueueManager(str(local_tmp_dir / "tasks.db"))

    await manager.update_llm_cache("gemini-2.5-flash", "prompt-x", "cached")

    cached = await manager.get_llm_cache("@chico", "prompt-x")

    assert cached == "cached"


def test_core_runtime_exposes_start_worker_entrypoint():
    runtime = importlib.import_module("core.runtime")
    assert hasattr(runtime, "start_worker_and_api")


def test_memory_rag_no_longer_imports_task_executor_for_llm_access():
    content = (REPO_ROOT / "memory_rag.py").read_text(encoding="utf-8", errors="ignore")
    assert "from task_executor import" not in content


def test_frontend_uses_canonical_nexus_api_contract():
    logger_source = (REPO_ROOT / "frontend" / "src" / "lib" / "logger.ts").read_text(encoding="utf-8", errors="ignore")
    dashboard_source = (REPO_ROOT / "frontend" / "src" / "components" / "nexus" / "Dashboard.tsx").read_text(encoding="utf-8", errors="ignore")
    quiz_source = (REPO_ROOT / "frontend" / "src" / "components" / "quiz" / "QuizQuestion.tsx").read_text(encoding="utf-8", errors="ignore")
    rag_route_source = (REPO_ROOT / "frontend" / "src" / "app" / "api" / "rag" / "route.ts").read_text(encoding="utf-8", errors="ignore")

    assert "NEXT_PUBLIC_API_URL" not in logger_source
    assert "localhost:8000" not in logger_source
    assert "127.0.0.1:17042" not in quiz_source
    assert "127.0.0.1:17042" not in rag_route_source
    assert "api-contract" in logger_source
    assert "api-contract" in dashboard_source
    assert "api-contract" in quiz_source
    assert "api-contract" in rag_route_source


def test_client_components_do_not_import_server_telemetry_module():
    client_files = [
        REPO_ROOT / "frontend" / "src" / "components" / "ErrorBoundary.tsx",
        REPO_ROOT / "frontend" / "src" / "components" / "quiz" / "QuizEngine.tsx",
        REPO_ROOT / "frontend" / "src" / "components" / "simulator" / "hooks" / "useQuantumEngine.ts",
        REPO_ROOT / "frontend" / "src" / "components" / "simulator" / "hooks" / "useSotaTelemetry.tsx",
    ]
    telemetry_client = (REPO_ROOT / "frontend" / "src" / "lib" / "telemetry-client.ts").read_text(encoding="utf-8", errors="ignore")
    telemetry_route = (REPO_ROOT / "frontend" / "src" / "app" / "api" / "telemetry" / "route.ts").read_text(encoding="utf-8", errors="ignore")

    assert "fetch('/api/telemetry'" in telemetry_client
    assert "TelemetryPayloadSchema" in telemetry_route

    for file_path in client_files:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        assert "@/components/telemetry" not in source
        assert "../../telemetry" not in source
        assert "@/lib/telemetry-client" in source
