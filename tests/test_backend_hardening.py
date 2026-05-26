"""
Testes de integridade e hardening do backend — middlewares, queue e task executor.
Marcadores: unit (sem I/O externo), integration (requer servicos).
"""

# pylint: disable=redefined-outer-name, protected-access, line-too-long

import asyncio
from datetime import UTC, datetime
import importlib
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

from aiohttp import web
import pytest

from agents.context_builder import _inject_task_docs  # type: ignore
from api.v1 import handlers, middleware
from core.schemas import Task
from database.queue_manager import QueueManager

REPO_ROOT = Path(__file__).resolve().parents[1]


# ==============================================================================
# Fixtures
# ==============================================================================

@pytest.fixture
def local_tmp_dir():
    """Diretorio temporario isolado dentro da raiz do projeto para evitar fallbacks de seguranca."""
    import shutil
    base_tmp = REPO_ROOT / ".pytest_tmp"
    base_tmp.mkdir(parents=True, exist_ok=True)
    path = base_tmp / f"case_{uuid4().hex}"
    path.mkdir(parents=True, exist_ok=True)
    yield path
    try:
        shutil.rmtree(path, ignore_errors=True)
    except Exception:
        pass


def _make_task(task_id: str, description: str = "desc") -> Task:
    """Factory de Task com timestamp UTC automatico."""
    return Task(
        id=task_id,
        description=description,
        agent="@chico",
        timestamp=datetime.now(UTC).isoformat(),
    )


# ==============================================================================
# Middleware de Autenticacao
# ==============================================================================

@pytest.mark.asyncio
@pytest.mark.unit
async def test_auth_middleware_blocks_browser_origin_when_token_is_not_configured(
    monkeypatch,
) -> None:
    """Middleware bloqueia origens de navegador quando nenhum token esta configurado."""
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    request = SimpleNamespace(
        method="POST",
        headers={"Origin": "https://evil.example"},
        remote="127.0.0.1",
        app={},
    )

    async def handler(_request):
        return web.json_response({"status": "ok"})

    response = await middleware.auth_middleware(request, handler)
    assert response.status == 403


@pytest.mark.asyncio
@pytest.mark.unit
async def test_cors_middleware_does_not_reflect_wildcard_for_untrusted_origin() -> None:
    """CORS nao reflete wildcard (*) para origens nao confiaveis."""
    request = SimpleNamespace(
        method="GET",
        headers={"Origin": "https://evil.example"},
        remote="127.0.0.1",
        app={},
    )

    async def handler(_request):
        return web.json_response({"status": "ok"})

    response = await middleware.cors_middleware(request, handler)
    assert response.headers.get("Access-Control-Allow-Origin") != "*"


# ==============================================================================
# Path Traversal via Task Docs
# ==============================================================================

@pytest.mark.asyncio
@pytest.mark.unit
async def test_inject_task_docs_ignores_markdown_paths_outside_workspace(
    local_tmp_dir: Path, monkeypatch
) -> None:
    """Injecao de docs rejeita caminhos fora do workspace (Path Traversal)."""
    workspace = local_tmp_dir / "workspace"
    workspace.mkdir()
    outside_file = local_tmp_dir / "secret.md"
    outside_file.write_text("TOP SECRET", encoding="utf-8")
    monkeypatch.chdir(workspace)

    task = _make_task("TASK-EXT-DOC", "../secret.md")
    injected = await _inject_task_docs(task)

    assert "TOP SECRET" not in injected


# ==============================================================================
# Queue Manager
# ==============================================================================

@pytest.mark.asyncio
@pytest.mark.unit
async def test_add_task_rejects_duplicate_ids(local_tmp_dir: Path) -> None:
    """QueueManager rejeita adicao de tarefas com IDs duplicados (UNIQUE constraint)."""
    manager = QueueManager(str(local_tmp_dir / "tasks.db"))
    task = _make_task("TASK-DUP")

    await manager.add_task(task)

    with pytest.raises(Exception, match=r"(?i)UNIQUE|duplicate|already|constraint"):
        await manager.add_task(task)


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_cache_lookup_matches_real_model_key(
    local_tmp_dir: Path,
) -> None:
    """Cache do LLM associa corretamente a chave de modelo ao resultado cacheado."""
    manager = QueueManager(str(local_tmp_dir / "tasks.db"))

    await manager.update_llm_cache("gemini-2.5-flash", "prompt-x", "cached")
    cached = await manager.get_llm_cache("@chico", "prompt-x")

    assert cached == "cached"


# ==============================================================================
# RAG Ingest Handler
# ==============================================================================

@pytest.mark.asyncio
@pytest.mark.unit
async def test_handle_rag_ingest_preserves_existing_bg_tasks(monkeypatch) -> None:
    """Rota de ingestao RAG nao cancela tarefas bg pre-existentes."""
    existing_task = asyncio.create_task(asyncio.sleep(0))

    async def fake_ingest():
        await asyncio.sleep(0)

    async def fake_get_rag_async():
        await asyncio.sleep(0)
        return SimpleNamespace(ingest_all_memories=fake_ingest)

    monkeypatch.setattr(handlers._te, "get_rag_async", fake_get_rag_async)
    monkeypatch.setattr(handlers._te, "SYSTEM_PROMPT_CACHE", {})
    monkeypatch.setattr(
        handlers,
        "_read_file_cached_internal",
        SimpleNamespace(cache_clear=lambda: None),
    )

    app = {"bg_tasks": {existing_task}}
    request = SimpleNamespace(app=app)
    await handlers.handle_rag_ingest(request)

    assert existing_task in app["bg_tasks"]

    for t in app["bg_tasks"].copy():
        t.cancel()


# ==============================================================================
# Contratos de Modulo (importacao e contratos de API)
# ==============================================================================

@pytest.mark.unit
def test_core_runtime_exposes_start_worker_entrypoint() -> None:
    """core.runtime deve expor a funcao de entrada start_worker_and_api."""
    runtime = importlib.import_module("core.runtime")
    assert hasattr(runtime, "start_worker_and_api")


@pytest.mark.unit
def test_memory_rag_no_longer_imports_task_executor_for_llm_access() -> None:
    """memory_rag.py nao deve importar task_executor (evita dependencia circular)."""
    content = (REPO_ROOT / "memory_rag.py").read_text(encoding="utf-8", errors="ignore")
    assert "from task_executor import" not in content


@pytest.mark.unit
def test_frontend_uses_canonical_nexus_api_contract() -> None:
    """Frontend usa o contrato canonico api-contract sem hardcode de localhost."""
    logger_source = (REPO_ROOT / "frontend" / "src" / "lib" / "logger.ts").read_text(
        encoding="utf-8", errors="ignore"
    )
    dashboard_source = (
        REPO_ROOT / "frontend" / "src" / "app" / "(user)" / "dashboard" / "page.tsx"
    ).read_text(encoding="utf-8", errors="ignore")
    quiz_source = (
        REPO_ROOT / "frontend" / "src" / "app" / "api" / "v1" / "predictive" / "route.ts"
    ).read_text(encoding="utf-8", errors="ignore")
    rag_route_source = (
        REPO_ROOT / "frontend" / "src" / "app" / "api" / "v1" / "rag" / "route.ts"
    ).read_text(encoding="utf-8", errors="ignore")

    assert "NEXT_PUBLIC_API_URL" not in logger_source
    assert "localhost:8000" not in logger_source
    assert "127.0.0.1:17042" not in quiz_source
    assert "127.0.0.1:17042" not in rag_route_source
    assert "api-contract" in logger_source
    assert "api-contract" in dashboard_source
    assert "api-contract" in quiz_source
    assert "api-contract" in rag_route_source


@pytest.mark.unit
def test_client_components_do_not_import_server_telemetry_module() -> None:
    """Componentes React client-side nao importam modulos server-side de telemetria."""
    client_files = [
        REPO_ROOT / "frontend" / "src" / "components" / "analytics" / "ErrorBoundary.tsx",
        REPO_ROOT / "frontend" / "src" / "components" / "quiz" / "QuizEngine.tsx",
        REPO_ROOT / "frontend" / "src" / "components" / "simulator" / "hooks" / "useQuantumEngine.ts",
        REPO_ROOT / "frontend" / "src" / "components" / "simulator" / "hooks" / "useSotaTelemetry.tsx",
    ]
    telemetry_client = (
        REPO_ROOT / "frontend" / "src" / "lib" / "telemetry-client.ts"
    ).read_text(encoding="utf-8", errors="ignore")
    telemetry_route = (
        REPO_ROOT / "frontend" / "src" / "app" / "api" / "v1" / "telemetry" / "route.ts"
    ).read_text(encoding="utf-8", errors="ignore")

    assert "fetch('/api/v1/telemetry'" in telemetry_client
    assert "PerspectiveMetricSchema" in telemetry_route

    for file_path in client_files:
        source = file_path.read_text(encoding="utf-8", errors="ignore")
        assert "@/components/telemetry" not in source
        assert "../../telemetry" not in source
        assert "@/lib/telemetry-client" in source
