"""Testes de alta concorrencia, estresse e integridade ACID para o QueueManager."""

from __future__ import annotations

# pylint: disable=redefined-outer-name

import asyncio
import uuid
from datetime import UTC, datetime
from pathlib import Path
import pytest
from core.schemas import Task
from database.queue_manager import QueueManager


@pytest.fixture
def temp_queue_manager():
    """Fixture que cria uma instancia isolada de QueueManager dentro da arvore do projeto."""
    db_id = uuid.uuid4().hex[:8]
    temp_dir = Path("temp") / "pytest_dbs"
    temp_dir.mkdir(parents=True, exist_ok=True)
    db_path = temp_dir / f"test_queue_{db_id}.db"

    qm = QueueManager(queue_path=str(db_path))
    yield qm

    # Cleanup apos os testes
    try:
        if db_path.exists():
            db_path.unlink(missing_ok=True)
        for extra in temp_dir.glob(f"test_queue_{db_id}.db*"):
            extra.unlink(missing_ok=True)
    except OSError:
        pass


@pytest.mark.asyncio
async def test_queue_acid_concurrent_insertions(temp_queue_manager: QueueManager):
    """Valida insercao concorrente massiva com WAL mode e transacoes ACID."""
    qm = temp_queue_manager

    num_tasks = 20
    priorities = ["critical", "high", "medium", "low"]

    async def insert_worker(idx: int):
        task_id = f"CONC-TASK-{uuid.uuid4().hex[:8]}-{idx}"
        priority = priorities[idx % len(priorities)]
        task = Task(
            id=task_id,
            description=f"Concurrent stress task payload #{idx}",
            status="pending",
            agent="@implementor",
            timestamp=datetime.now(UTC).isoformat(),
            metadata={"priority": priority, "idx": idx},
        )
        await qm.add_task(task)
        return task_id

    # Insercoes concorrentes
    task_ids = await asyncio.gather(*(insert_worker(i) for i in range(num_tasks)))
    assert len(task_ids) == num_tasks

    counts = await qm.get_task_counts()
    assert counts["pending"] == num_tasks


@pytest.mark.asyncio
async def test_queue_priority_ordering_under_concurrency(temp_queue_manager: QueueManager):
    """Valida que o pop de tarefas respeita a prioridade (critical > high > medium > low)."""
    qm = temp_queue_manager
    now = datetime.now(UTC).isoformat()
    uid = uuid.uuid4().hex[:6]

    t_low = Task(id=f"T-LOW-{uid}", description="Low", status="pending", agent="@implementor", timestamp=now, metadata={"priority": "low"})
    t_med = Task(id=f"T-MED-{uid}", description="Med", status="pending", agent="@implementor", timestamp=now, metadata={"priority": "medium"})
    t_high = Task(id=f"T-HIGH-{uid}", description="High", status="pending", agent="@implementor", timestamp=now, metadata={"priority": "high"})
    t_crit = Task(id=f"T-CRIT-{uid}", description="Crit", status="pending", agent="@implementor", timestamp=now, metadata={"priority": "critical"})

    await qm.add_task(t_low)
    await qm.add_task(t_med)
    await qm.add_task(t_high)
    await qm.add_task(t_crit)

    first = await qm.get_next_task()
    assert first is not None
    assert first.id == f"T-CRIT-{uid}"


@pytest.mark.asyncio
async def test_queue_auto_heal_stalled_tasks(temp_queue_manager: QueueManager):
    """Valida que tarefas travadas em 'running' sao recuperadas automaticamente para 'pending'."""
    qm = temp_queue_manager
    uid = uuid.uuid4().hex[:6]

    t_stalled = Task(
        id=f"T-STALLED-{uid}",
        description="Task travada",
        status="running",
        agent="@implementor",
        timestamp="2026-01-01T00:00:00+00:00",
        metadata={"retry_count": 0},
    )
    await qm.add_task(t_stalled)

    recovered = await qm.recover_stalled_tasks(max_running_minutes=1)
    assert recovered == 1

    healed = await qm.get_task(f"T-STALLED-{uid}")
    assert healed is not None
    assert healed.status == "pending"
    assert healed.metadata.get("retry_count") == 1


@pytest.mark.asyncio
async def test_queue_anti_starvation_promotion(temp_queue_manager: QueueManager):
    """Valida promocao de prioridade para tarefas pendentes ha muito tempo."""
    qm = temp_queue_manager
    uid = uuid.uuid4().hex[:6]

    t_old = Task(
        id=f"T-STARVED-{uid}",
        description="Task antiga",
        status="pending",
        agent="@implementor",
        timestamp="2026-01-01T00:00:00+00:00",
        metadata={"priority": "low"},
    )
    await qm.add_task(t_old)

    promoted = await qm.promote_starved_tasks(max_wait_hours=1)
    assert promoted == 1

    updated = await qm.get_task(f"T-STARVED-{uid}")
    assert updated is not None
    assert updated.metadata.get("priority") == "medium"
