"""
Testes SOTA para os gerenciadores de banco de dados (LabManager e QueueManager) do Nexus Orchestrator.
"""

import contextlib
from datetime import UTC, datetime
from pathlib import Path

import aiosqlite
import pytest

from core.schemas import Task
from database.lab_manager import LabManager
from database.queue_manager import QueueManager


@pytest.fixture(autouse=True)
def patch_valid_agents(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante que agentes de teste sao considerados validos pelo Pydantic."""
    import core.config

    monkeypatch.setattr(core.config, "VALID_AGENTS", ["@maverick", "@chico", "@implementor"])
    monkeypatch.setattr(core.config, "PROTECTED_AGENTS_FROM_CLEANUP", ["@maverick", "@chico"])


@pytest.mark.asyncio
@pytest.mark.unit
async def test_lab_manager_flow(tmp_path: Path) -> None:
    """Valida a leitura de torneios e cenarios pelo LabManager."""
    db_file = tmp_path / "dev.db"

    async with aiosqlite.connect(db_file) as db:
        await db.execute("""
            CREATE TABLE Tournament (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                start_date TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE TournamentScenario (
                id TEXT PRIMARY KEY,
                tournamentId TEXT NOT NULL,
                name TEXT NOT NULL
            )
        """)
        await db.execute(
            "INSERT INTO Tournament (id, name, start_date) VALUES (?, ?, ?)",
            ("T1", "Torneio SOTA 1", "2026-05-26T12:00:00"),
        )
        await db.execute(
            "INSERT INTO TournamentScenario (id, tournamentId, name) VALUES (?, ?, ?)", ("S1", "T1", "Cenario 1")
        )
        await db.commit()

    manager = LabManager()
    manager.db_path = db_file

    tournaments = await manager.get_tournaments()
    assert len(tournaments) == 1
    assert tournaments[0]["name"] == "Torneio SOTA 1"

    scenarios = await manager.get_scenarios_for_tournament("T1")
    assert len(scenarios) == 1
    assert scenarios[0]["name"] == "Cenario 1"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_lab_manager_operational_error(tmp_path: Path) -> None:
    """Valida o tratamento de erro operacional no LabManager."""
    manager = LabManager()
    manager.db_path = tmp_path / "nonexistent.db"

    tournaments = await manager.get_tournaments()
    assert tournaments == []

    scenarios = await manager.get_scenarios_for_tournament("T1")
    assert scenarios == []


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_in_memory_crud() -> None:
    """Valida as operacoes de CRUD assincronas no QueueManager."""
    manager = QueueManager(queue_path=":memory:")
    try:
        task = Task(
            id="T-100",
            description="Tarefa base",
            agent="@maverick",
            timestamp=datetime.now(UTC).isoformat(),
            metadata={"priority": "high", "depends_on": []},
        )

        await manager.add_task(task)

        retrieved = await manager.get_task("T-100")
        assert retrieved is not None
        assert retrieved.description == "Tarefa base"

        next_task = await manager.get_next_task()
        assert next_task is not None
        assert next_task.id == "T-100"

        await manager.update_task_status("T-100", "completed")
        retrieved_after = await manager.get_task("T-100")
        assert retrieved_after is not None
        assert retrieved_after.status == "completed"
        assert retrieved_after.completedAt is not None

        await manager.delete_task("T-100")
        assert await manager.get_task("T-100") is None
    finally:
        await manager.close()


@pytest.mark.unit
def test_queue_manager_path_traversal_detection() -> None:
    """Valida a blindagem contra Path Traversal no QueueManager."""
    import os

    manager = QueueManager(queue_path=":memory:")
    manager._is_memory = False
    if os.name == "nt":
        manager.db_path = Path("C:/temp/outside_sota.db")
    else:
        manager.db_path = Path("/tmp/outside_sota.db")  # NOSONAR
    with pytest.raises(PermissionError, match="Database path is outside the project root"):
        manager._validate_path_traversal()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_cache_and_usage() -> None:
    """Valida o cache do LLM e controle de orcamento diario no QueueManager."""
    manager = QueueManager(queue_path=":memory:")
    try:
        await manager.update_llm_cache("model-a", "prompt-a", "response-a")
        cached = await manager.get_llm_cache("model-a", "prompt-a")
        assert cached == "response-a"

        await manager.update_llm_cache("@fallback", "prompt-b", "response-b")
        cached_fallback = await manager.get_llm_cache("@any", "prompt-b")
        assert cached_fallback == "response-b"

        res = await manager.get_first_cached_response(["model-missing", "model-a"], "prompt-a")
        assert res == "response-a"

        await manager.record_api_usage("T-101", "@maverick", "model-a", "provider-a", 10, 20)

        await manager.record_key_usage_metric("provider-a", "hash-123", "success", latency_ms=150)
        stats = await manager.get_key_recent_stats("provider-a", "hash-123")
        assert stats["attempts"] == 1
        assert stats["successes"] == 1

        report = await manager.get_key_health_report()
        assert len(report) == 1
        assert report[0]["provider"] == "provider-a"

        budget_initial = await manager.get_daily_budget_usage()
        assert budget_initial == 0

        success = await manager.check_and_increment_usage(daily_budget=2)
        assert success is True
        success2 = await manager.check_and_increment_usage(daily_budget=2)
        assert success2 is True
        success3 = await manager.check_and_increment_usage(daily_budget=2)
        assert success3 is False

        budget_after = await manager.get_daily_budget_usage()
        assert budget_after == 2
    finally:
        await manager.close()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_backup_and_maintenance(tmp_path: Path) -> None:
    """Valida manutencao profunda e backup online em arquivo fisico no QueueManager."""
    db_file = tmp_path / "queue" / "test_tasks.db"

    # Limpa possiveis bancos persistidos de execucoes anteriores
    fallback_db = Path(__file__).resolve().parents[1] / ".nexus_runtime" / "queue" / "test_tasks.db"
    if fallback_db.exists():
        try:
            fallback_db.unlink(missing_ok=True)
            Path(str(fallback_db) + "-journal").unlink(missing_ok=True)
            Path(str(fallback_db) + "-wal").unlink(missing_ok=True)
            Path(str(fallback_db) + "-shm").unlink(missing_ok=True)
        except OSError:
            pass

    manager = QueueManager(queue_path=str(db_file))
    try:
        await manager.set_system_state("k1", "v1")
        assert await manager.get_system_state("k1") == "v1"

        await manager.perform_maintenance()

        resolved_db_path = Path(manager.db_path)
        backup_dir = resolved_db_path.parent / "backups"
        if backup_dir.exists():
            for old_backup in backup_dir.glob(f"{resolved_db_path.stem}_*.db"):
                with contextlib.suppress(OSError):
                    old_backup.unlink(missing_ok=True)

        await manager.online_backup()
        assert backup_dir.exists()
        backups = list(backup_dir.glob(f"{resolved_db_path.stem}_*.db"))
        assert len(backups) == 1

        task_old = Task(
            id="T-OLD",
            description="Tarefa antiga",
            agent="@implementor",
            timestamp="2020-01-01T12:00:00",
            status="completed",
            completedAt="2020-01-01T12:05:00",
        )
        await manager.add_task(task_old)

        await manager.cleanup(days=1)
        assert await manager.get_task("T-OLD") is None
    finally:
        await manager.close()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_prompt_canonicalization() -> None:
    """Valida se a canonicalizacao de prompts otimiza o cache de LLM."""
    manager = QueueManager(queue_path=":memory:")
    try:
        prompt_a = "  Determine   o   vencedor \r\n da rodada.   "
        prompt_b = "Determine o vencedor\nda rodada."

        # Salva usando prompt com espacos extras e quebras
        await manager.update_llm_cache("model-x", prompt_a, "resultado_esperado")

        # Verifica se o prompt limpo atinge o cache (hit)
        cached = await manager.get_llm_cache("model-x", prompt_b)
        assert cached == "resultado_esperado"
    finally:
        await manager.close()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_recover_stalled_tasks() -> None:
    """Valida a detecao e recuperacao (auto-cura) de tarefas travadas."""
    manager = QueueManager(queue_path=":memory:")
    try:
        # Tarefa travada ha 1 hora
        task = Task(
            id="T-STUCK",
            description="Tarefa travada",
            agent="@chico",
            timestamp="2020-01-01T12:00:00",
            status="running",
        )
        await manager.add_task(task)

        # 1. Primeira recuperacao -> deve voltar para pending, retry_count=1
        recovered = await manager.recover_stalled_tasks(max_running_minutes=15)
        assert recovered == 1

        t1 = await manager.get_task("T-STUCK")
        assert t1 is not None
        assert t1.status == "pending"
        assert t1.metadata is not None
        assert t1.metadata.get("retry_count") == 1

        # Altera para running novamente para simular novo travamento
        await manager.update_task_status("T-STUCK", "running")
        # Altera o timestamp para o passado novamente para cair no cutoff
        async with manager._get_async_db() as db:
            await db.execute("UPDATE tasks SET timestamp = '2020-01-01T12:00:00' WHERE id = 'T-STUCK'")
            await db.commit()

        # 2. Segunda recuperacao -> retry_count=2
        recovered2 = await manager.recover_stalled_tasks(max_running_minutes=15)
        assert recovered2 == 1
        t2 = await manager.get_task("T-STUCK")
        assert t2 is not None
        assert t2.status == "pending"
        assert t2.metadata is not None
        assert t2.metadata.get("retry_count") == 2

        # Terceiro travamento
        await manager.update_task_status("T-STUCK", "running")
        async with manager._get_async_db() as db:
            await db.execute("UPDATE tasks SET timestamp = '2020-01-01T12:00:00' WHERE id = 'T-STUCK'")
            await db.commit()

        # 3. Terceira recuperacao -> excede limite de 3 e deve falhar definitivamente
        recovered3 = await manager.recover_stalled_tasks(max_running_minutes=15)
        assert recovered3 == 1
        t3 = await manager.get_task("T-STUCK")
        assert t3 is not None
        assert t3.status == "failed"
        assert t3.metadata is not None
        assert "Processamento abortado" in str(t3.metadata.get("last_stall_reason", ""))
    finally:
        await manager.close()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_promote_starved_tasks() -> None:
    """Valida a promocao automatica de prioridade para tarefas famintas."""
    manager = QueueManager(queue_path=":memory:")
    try:
        # Tarefa pendente ha muito tempo com prioridade low
        task = Task(
            id="T-STARVED",
            description="Tarefa faminta",
            agent="@maverick",
            timestamp="2020-01-01T12:00:00",
            status="pending",
            metadata={"priority": "low"},
        )
        await manager.add_task(task)

        promoted = await manager.promote_starved_tasks(max_wait_hours=2)
        assert promoted == 1

        t1 = await manager.get_task("T-STARVED")
        assert t1 is not None
        assert t1.metadata is not None
        assert t1.metadata.get("priority") == "medium"
        assert t1.metadata.get("original_priority") == "low"
    finally:
        await manager.close()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_bayesian_health_report() -> None:
    """Valida o relatorio de saude avancado com pontuacao bayesiana e anomalias."""
    manager = QueueManager(queue_path=":memory:")
    try:
        # Registra chave bem sucedida e rapida
        await manager.record_key_usage_metric("provider-x", "key-a", "success", latency_ms=100)

        # Registra chave com alta taxa de erro e alta latencia
        await manager.record_key_usage_metric("provider-x", "key-b", "error", latency_ms=4000)
        await manager.record_key_usage_metric("provider-x", "key-b", "error", latency_ms=4500)

        report = await manager.get_key_health_report()
        assert len(report) == 2

        key_a_report = next(r for r in report if r["key_hash"] == "key-a")
        key_b_report = next(r for r in report if r["key_hash"] == "key-b")

        # Key A deve estar saudavel
        assert key_a_report["health_score"] > 90
        assert key_a_report["is_anomaly"] is False

        # Key B deve ter anomalia e health score baixo
        assert key_b_report["health_score"] < 50
        assert key_b_report["is_anomaly"] is True
    finally:
        await manager.close()
