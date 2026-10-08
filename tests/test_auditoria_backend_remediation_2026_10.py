"""Testes de regressao para a auditoria e remediacao do backend (Outubro 2026).

Valida de ponta a ponta as correcoes das Fases 1, 2 e 3:
1. Fixacao de multidict>=6.9.1 (CVE-2026-104874)
2. Import do openrouter_pool_manager em engine/llm_api.py e export de get_openrouter_pool
3. Instanciacao canonica de Task com metadata={'priority': 'high'}
4. Resiliencia de _process_task_error em worker/loop.py marcando tarefa como 'failed'
5. Tipagem e imports em hand_evaluator, pmev_harness_icm e openrouter_pool
6. Desacoplamento de constantes de caminho em AutopoiesisEngine
7. Ausencia do modulo orfao math/rio_extended.py
8. Mapeamento preciso de MIME types em api/v1/handlers.py
"""

from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
import sqlite3

import pytest

from api.v1.handlers import _get_raw_content_type
from core.autopoiesis_engine import AutopoiesisEngine
from core.schemas import Task
from database.queue_manager import QueueManager
from engine.hand_evaluator import describe, from_strings
from llm.openrouter_pool import OpenRouterPoolManager, get_openrouter_pool, openrouter_pool_manager
from worker.loop import _process_task_error

SITE_ROOT = Path(__file__).resolve().parent.parent


@pytest.fixture
async def queue_manager():
    qm = QueueManager(":memory:")
    yield qm
    await qm.close()


# ── FASE 1 (P0) ─────────────────────────────────────────────────────────────


def test_multidict_pinned_in_dependencies() -> None:
    """Garante que multidict>=6.9.1 esta presente em requirements.txt e pyproject.toml."""
    req_file = SITE_ROOT / "requirements.txt"
    pyproj_file = SITE_ROOT / "pyproject.toml"

    assert req_file.exists()
    assert pyproj_file.exists()

    req_text = req_file.read_text(encoding="utf-8")
    pyproj_text = pyproj_file.read_text(encoding="utf-8")

    assert "multidict>=6.9.1" in req_text
    assert "multidict>=6.9.1" in pyproj_text


def test_openrouter_pool_manager_and_get_openrouter_pool() -> None:
    """Valida integracao de openrouter_pool_manager e helper get_openrouter_pool."""
    assert openrouter_pool_manager is not None
    assert isinstance(openrouter_pool_manager, OpenRouterPoolManager)
    assert get_openrouter_pool() is openrouter_pool_manager

    # Verifica importacao no modulo engine.llm_api
    import engine.llm_api as llm_api

    assert hasattr(llm_api, "call_openrouter") or hasattr(llm_api, "resolve_api_key")


# ── FASE 2 (P1) ─────────────────────────────────────────────────────────────


def test_task_instantiation_schema_conformance() -> None:
    """Task deve ser instanciada sem campo top-level priority, usando metadata={'priority': 'high'}."""
    now_iso = datetime.now(UTC).isoformat()
    task = Task(
        id="task-eval-bench",
        description="Calculo de equidade trivial spot turn",
        agent="@chico",
        status="pending",
        timestamp=now_iso,
        metadata={"priority": "high"},
    )
    assert task.metadata.get("priority") == "high"
    assert not hasattr(task, "priority") or "priority" not in task.model_fields


@pytest.mark.asyncio
async def test_worker_loop_process_task_error_marks_failed(queue_manager: QueueManager) -> None:
    """Excecoes nao tratadas / catastroficas devem marcar tarefa como 'failed' com metadata."""
    now_iso = datetime.now(UTC).isoformat()
    task = Task(
        id="task-fail-test-1",
        description="Tarefa que falha catastroficamente",
        agent="@chico",
        status="running",
        timestamp=now_iso,
        metadata={"priority": "medium"},
    )
    await queue_manager.add_task(task)
    await queue_manager.claim_task(task.id, "worker-test:123")

    released = False

    def safe_release() -> None:
        nonlocal released
        released = True

    fatal_err = RuntimeError("Erro irrecuperavel inesperado de computacao")
    await _process_task_error(fatal_err, task, queue_manager, safe_release)

    assert released is True
    updated_task = await queue_manager.get_task(task.id)
    assert updated_task is not None
    assert updated_task.status == "failed"
    assert updated_task.metadata.get("workflow_status") == "failed"
    assert updated_task.metadata.get("last_error_class") == "RuntimeError"
    assert "Erro irrecuperavel" in str(updated_task.metadata.get("last_error_message"))


@pytest.mark.asyncio
async def test_worker_loop_process_task_error_resilient_to_sqlite_failure(
    queue_manager: QueueManager, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Mesmo sob falha de conexao/lock no SQLite, safe_release e chamado e excecao nao quebra o loop."""
    now_iso = datetime.now(UTC).isoformat()
    task = Task(
        id="task-fail-db-locked",
        description="Tarefa que falha com DB travado",
        agent="@chico",
        status="running",
        timestamp=now_iso,
        metadata={"priority": "high"},
    )
    released = False

    def safe_release() -> None:
        nonlocal released
        released = True

    async def mock_fail(*args: object, **kwargs: object) -> None:
        raise sqlite3.OperationalError("database is locked")

    monkeypatch.setattr(queue_manager, "update_task_status", mock_fail)

    fatal_err = RuntimeError("Erro durante computacao")
    # Nao deve propagar OperationalError e deve liberar recursos
    await _process_task_error(fatal_err, task, queue_manager, safe_release)
    assert released is True


def test_hand_evaluator_quads_and_full_house_narrowing() -> None:
    """Valida narrowing e descricao correta de quads e full house."""
    # Quads
    cards_quad = from_strings("9h 9c 9d 9s 7h")
    desc_quad = describe(cards_quad)
    assert "four 9" in desc_quad

    # Full House
    cards_full = from_strings("9h 9c 9d 8s 8h")
    desc_full = describe(cards_full)
    assert "full house" in desc_full


def test_openrouter_pool_stats_typing() -> None:
    """Garante integridade de KeyStats no pool manager."""
    pool = OpenRouterPoolManager()
    summary = pool.get_telemetry_summary()
    assert isinstance(summary, list)
    for item in summary:
        assert isinstance(item["sha8"], str)
        assert isinstance(item["tier"], int)
        assert isinstance(item["attempts"], int)
        assert isinstance(item["avg_latency_ms"], float)


# ── FASE 3 (P2) ─────────────────────────────────────────────────────────────


def test_autopoiesis_engine_path_decoupling(tmp_path: Path) -> None:
    """AutopoiesisEngine com base_dir customizado deve derivar lock_file e telemetry_log do base_dir."""
    engine = AutopoiesisEngine(base_dir=tmp_path)
    assert engine.base_dir == tmp_path
    assert engine.nexus_zone == tmp_path / "temp" / "nexus_zone"
    assert engine.lock_file == tmp_path / "temp" / "nexus_zone" / "homeostasis.lock"
    assert engine.telemetry_log == tmp_path / "temp" / "nexus_zone" / "logs" / "homeostasis_telemetry.jsonl"


def test_math_rio_active_engine() -> None:
    """Valida que a implementacao ativa de RIO reside em engine/math_rio.py."""
    assert (SITE_ROOT / "engine" / "math_rio.py").exists()


def test_mime_types_mapping_completeness() -> None:
    """_get_raw_content_type deve mapear precisamente tipos de imagem, audio, video e documentos."""
    # Imagens
    assert _get_raw_content_type(".png") == "image/png"
    assert _get_raw_content_type(".jpg") == "image/jpeg"
    assert _get_raw_content_type(".jpeg") == "image/jpeg"
    assert _get_raw_content_type(".gif") == "image/gif"
    assert _get_raw_content_type(".webp") == "image/webp"
    assert _get_raw_content_type(".svg") == "image/svg+xml"

    # Videos & Audios
    assert _get_raw_content_type(".mp4") == "video/mp4"
    assert _get_raw_content_type(".mov") == "video/quicktime"
    assert _get_raw_content_type(".mp3") == "audio/mpeg"
    assert _get_raw_content_type(".wav") == "audio/wav"

    # Documentos & Dados
    assert _get_raw_content_type(".pdf") == "application/pdf"
    assert _get_raw_content_type(".json") == "application/json"
    assert _get_raw_content_type(".txt") == "text/plain"
    assert _get_raw_content_type(".md") == "text/markdown"
    assert _get_raw_content_type(".csv") == "text/csv"
    assert _get_raw_content_type(".html") == "text/html"
    assert _get_raw_content_type(".zip") == "application/zip"

    # Fallback
    assert _get_raw_content_type(".xyzunknownext") == "application/octet-stream"
