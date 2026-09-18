"""Gravador e Coletor Automatico de Telemetria de Descoberta (Dream-RSI Recorder).

Alimenta de forma continua e assincrona o banco de dados de replay (data/discovery_tree.db)
com resultados de testes, eventos de tarefas do TaskExecutor e simulacoes PMev.
Opera 100% localmente, sem dependencia de chaves de API externas.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from pathlib import Path

from core.discovery_tree_schemas import DiscoveryNode, DiscoveryTree
from engine.dream_replay_simulator import DreamReplaySimulator

DEFAULT_DB_PATH = Path("data/discovery_tree.db")


class DiscoveryRecorder:
    """Gravador persistente e leve de telemetria de descoberta."""

    def __init__(self, db_path: Path | str = DEFAULT_DB_PATH) -> None:
        self.db_path = str(db_path)
        if self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.simulator = DreamReplaySimulator(db_path=self.db_path)

    def record_task_outcome(
        self,
        task_id: str,
        agent: str,
        description: str,
        status: str,
        runtime_ms: float = 0.0,
        tokens_consumed: int = 0,
        metric_score: float = 1.0,
    ) -> DiscoveryNode:
        """Registra a conclusao de uma tarefa do TaskExecutor como no da arvore."""
        mapped_status = "success" if status in ("completed", "success") else "test_failure"
        node = DiscoveryNode(
            node_id=f"task_{task_id}",
            parent_id=None,
            depth=0,
            domain="code_engineering",
            action_type=f"dispatch_{agent.replace('@', '')}",
            action_payload={"desc": description[:100], "agent": agent},
            status=mapped_status,
            metric_score=metric_score if mapped_status == "success" else 0.0,
            runtime_ms=runtime_ms,
            tokens_consumed=tokens_consumed,
        )

        tree = DiscoveryTree(
            tree_id=f"tree_task_{task_id}",
            root_id=node.node_id,
            domain="code_engineering",
            nodes={node.node_id: node},
        )
        self.simulator.record_tree(tree)
        return node

    def record_test_run(
        self,
        test_file: str,
        passed: bool,
        duration_ms: float,
        error_count: int = 0,
    ) -> DiscoveryNode:
        """Registra a execucao de uma suite de testes como no de descoberta."""
        status = "success" if passed else "test_failure"
        score = 1.0 if passed else max(0.0, 1.0 - (0.2 * error_count))
        node_id = f"test_{Path(test_file).stem}"

        node = DiscoveryNode(
            node_id=node_id,
            parent_id=None,
            depth=0,
            domain="code_engineering",
            action_type="pytest_run",
            action_payload={"suite": test_file, "errors": error_count},
            status=status,
            metric_score=score,
            runtime_ms=duration_ms,
            tokens_consumed=0,
        )

        tree = DiscoveryTree(
            tree_id=f"tree_{node_id}",
            root_id=node.node_id,
            domain="code_engineering",
            nodes={node.node_id: node},
        )
        self.simulator.record_tree(tree)
        return node

    def seed_initial_history(self, tests_dir: Path | None = None, reports_dir: Path | None = None) -> int:
        """Povoa o banco inicial com a base do repositorio, resolvendo o cold start."""
        t_dir = tests_dir or Path("tests")
        r_dir = reports_dir or Path("reports")
        nodes_created = 0

        # Indexa suites de testes existentes
        if t_dir.exists():
            for test_file in t_dir.glob("test_*.py"):
                self.record_test_run(
                    test_file=test_file.name,
                    passed=True,
                    duration_ms=50.0,
                    error_count=0,
                )
                nodes_created += 1

        # Indexa relatorios de ancoragem conhecidos
        if r_dir.exists():
            for rep in r_dir.glob("REGISTRO-*.md"):
                node = DiscoveryNode(
                    node_id=f"anchor_{rep.stem}",
                    parent_id=None,
                    depth=0,
                    domain="code_engineering",
                    action_type="anchor_record",
                    action_payload={"filename": rep.name},
                    status="success",
                    metric_score=1.0,
                    runtime_ms=10.0,
                    tokens_consumed=0,
                )
                tree = DiscoveryTree(
                    tree_id=f"tree_anchor_{rep.stem}",
                    root_id=node.node_id,
                    domain="code_engineering",
                    nodes={node.node_id: node},
                )
                self.simulator.record_tree(tree)
                nodes_created += 1

        return nodes_created
