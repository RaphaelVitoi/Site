"""Testes de integracao do motor core e arbitragem topologica."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from core.arbitrator import RUST_CORE_AVAILABLE, UniversalArbitrator
from core.schemas import Task


@pytest.mark.unit
def test_core_arbitrator_fast_path_and_rust_integration() -> None:
    """Verifica comportamento ponta a ponta do arbitrator com e sem dependencias."""
    now_str = datetime.now(UTC).isoformat()
    t1 = Task(
        id="task-root",
        agent="@maverick",
        description="Root task",
        status="pending",
        timestamp=now_str,
        metadata={"priority": "high"},
    )
    t2 = Task(
        id="task-child",
        agent="@maverick",
        description="Child task",
        status="pending",
        timestamp=now_str,
        metadata={"priority": "critical", "depends_on": ["task-root"]},
    )

    # 1. Test Ingress Fast Path S1
    fast, remaining = UniversalArbitrator.ingress_fast_path_s1([t1, t2])
    assert fast is not None
    assert fast.id == "task-root"
    assert len(remaining) == 1
    assert remaining[0].id == "task-child"

    # 2. Test DAG optimal task extraction via Rust Speedforce
    opt = UniversalArbitrator.extract_optimal_task([t1, t2])
    assert opt is not None
    assert opt.id == "task-root"


@pytest.mark.unit
def test_core_dependency_cycle_detection() -> None:
    """Valida deteccao de ciclos no grafo topologico de tarefas."""
    now_str = datetime.now(UTC).isoformat()
    t1 = Task(
        id="C1",
        agent="@maverick",
        description="Ciclo 1",
        status="pending",
        timestamp=now_str,
        metadata={"depends_on": ["C2"]},
    )
    t2 = Task(
        id="C2",
        agent="@maverick",
        description="Ciclo 2",
        status="pending",
        timestamp=now_str,
        metadata={"depends_on": ["C1"]},
    )
    assert UniversalArbitrator.has_dependency_cycle([t1, t2]) is True


@pytest.mark.unit
def test_core_speedforce_availability_flag() -> None:
    """Garante que a flag de disponibilidade do core nativo reflete o ambiente."""
    try:
        import nexus_core_rust

        has_rust = nexus_core_rust is not None
    except ImportError:
        has_rust = False
    assert RUST_CORE_AVAILABLE is has_rust
