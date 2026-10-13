"""Testes unitarios do UniversalArbitrator e motor Rust (nexus_core_rust)."""

from __future__ import annotations

from datetime import UTC, datetime
import json

import nexus_core_rust
import pytest

from core.arbitrator import RUST_CORE_AVAILABLE, UniversalArbitrator
from core.schemas import Task


@pytest.mark.unit
def test_rust_core_available() -> None:
    """Verifica que a extensao compilada CPython foi carregada com sucesso."""
    assert RUST_CORE_AVAILABLE is True
    assert nexus_core_rust is not None
    assert hasattr(nexus_core_rust, "extract_optimal_task_py")


@pytest.mark.unit
def test_nexus_core_rust_direct_execution() -> None:
    """Valida chamada direta a funcao PyO3 exportada pelo crate Rust."""
    now_str = datetime.now(UTC).isoformat()
    tasks = [
        {
            "id": "T1",
            "agent": "@maverick",
            "description": "Tarefa base",
            "status": "pending",
            "timestamp": now_str,
            "metadata": {"priority": "low"},
        },
        {
            "id": "T2",
            "agent": "@maverick",
            "description": "Tarefa dependente",
            "status": "pending",
            "timestamp": now_str,
            "metadata": {"priority": "critical", "depends_on": ["T1"]},
        },
    ]
    scalars = {"critical": 10000.0, "high": 5000.0, "medium": 1000.0, "low": 100.0}
    result_json = nexus_core_rust.extract_optimal_task_py(json.dumps(tasks), json.dumps(scalars), 1.5, 0.8)
    assert result_json is not None
    optimal = json.loads(result_json)
    # T1 deve ser escolhida porque T2 tem in_degree > 0
    assert optimal["id"] == "T1"


@pytest.mark.unit
def test_universal_arbitrator_rust_integration() -> None:
    """Valida a integracao do UniversalArbitrator consumindo o modulo Rust."""
    now_str = datetime.now(UTC).isoformat()
    tasks = [
        Task(
            id="T1",
            agent="@maverick",
            description="Tarefa 1",
            status="pending",
            timestamp=now_str,
            metadata={"priority": "low"},
        ),
        Task(
            id="T2",
            agent="@maverick",
            description="Tarefa 2",
            status="pending",
            timestamp=now_str,
            metadata={"priority": "critical", "depends_on": ["T1"]},
        ),
    ]
    optimal = UniversalArbitrator.extract_optimal_task(tasks)
    assert optimal is not None
    assert optimal.id == "T1"


@pytest.mark.unit
def test_arbitrator_empty_tasks() -> None:
    """Valida retorno limpo para lista de tarefas vazia."""
    assert UniversalArbitrator.extract_optimal_task([]) is None
    assert nexus_core_rust.extract_optimal_task_py("[]", "{}", 1.5, 0.8) is None
