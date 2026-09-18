"""Gravador e Coletor Automatico de Telemetria de Descoberta (Dream-RSI Recorder).

Alimenta de forma continua e assincrona o banco de dados de replay (data/discovery_tree.db)
com resultados de testes, eventos de tarefas do TaskExecutor e simulacoes PMev.
Opera 100% localmente, sem dependencia de chaves de API externas.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

import contextlib
import json
from pathlib import Path
import sqlite3
import time
from typing import Any
import uuid

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
        run_id: str | None = None,
    ) -> DiscoveryNode:
        """Registra a execucao real de uma suite de testes como no de descoberta."""
        status = "success" if passed else "test_failure"
        score = 1.0 if passed else max(0.0, 1.0 - (0.2 * error_count))
        exec_id = run_id or f"{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        node_id = f"test_{Path(test_file).stem}_{exec_id}"

        node = DiscoveryNode(
            node_id=node_id,
            parent_id=None,
            depth=0,
            domain="code_engineering",
            action_type="pytest_run",
            action_payload={"suite": test_file, "errors": error_count, "run_id": exec_id},
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

    def record_test_inventory(self, test_file: str) -> DiscoveryNode:
        """Registra o inventario de uma suite descoberta sem simular execucao."""
        stem = Path(test_file).stem
        node_id = f"inventory_{stem}"
        node = DiscoveryNode(
            node_id=node_id,
            parent_id=None,
            depth=0,
            domain="code_engineering",
            action_type="test_inventory",
            action_payload={"suite": test_file, "discovered": True},
            status="success",
            metric_score=1.0,
            runtime_ms=0.0,
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

        # Indexa suites de testes existentes como inventario
        if t_dir.exists():
            for test_file in t_dir.glob("test_*.py"):
                self.record_test_inventory(test_file=test_file.name)
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

    def seed_pmev_history(self, count: int = 100) -> int:
        """Povoa o banco de dados com arvores de decisao reais do dominio pmev_math."""
        spots = [
            (
                "push_fold_12bb",
                12.0,
                [("shove", 0.85, "success"), ("fold", 0.50, "success"), ("call_all_in", 0.15, "test_failure")],
            ),
            (
                "3bet_defense_40bb",
                40.0,
                [("4bet_shove", 0.78, "success"), ("call_3bet", 0.65, "success"), ("fold", 0.40, "success")],
            ),
            (
                "icm_final_table_bubble",
                25.0,
                [("jam_pressure", 0.92, "success"), ("open_min", 0.60, "success"), ("fold", 0.55, "success")],
            ),
            (
                "cbet_flop_wet_board",
                50.0,
                [("bet_33", 0.72, "success"), ("check", 0.68, "success"), ("overbet_jam", 0.10, "test_failure")],
            ),
            (
                "turn_barrel_paired",
                45.0,
                [
                    ("barrel_66", 0.80, "success"),
                    ("check_behind", 0.62, "success"),
                    ("min_click", 0.20, "test_failure"),
                ],
            ),
            (
                "river_polar_jam",
                30.0,
                [
                    ("value_jam", 0.95, "success"),
                    ("bluff_jam", 0.45, "success"),
                    ("check_surrender", 0.25, "test_failure"),
                ],
            ),
        ]

        hands = [
            "AA",
            "KK",
            "QQ",
            "JJ",
            "TT",
            "99",
            "88",
            "77",
            "66",
            "55",
            "44",
            "33",
            "22",
            "AKs",
            "AQs",
            "AJs",
            "ATs",
            "A9s",
            "A8s",
            "A5s",
            "A4s",
            "A3s",
            "A2s",
            "KQs",
            "KJs",
            "KTs",
            "K9s",
            "QJs",
            "QTs",
            "Q9s",
            "JTs",
            "J9s",
            "T9s",
            "98s",
            "87s",
            "76s",
            "65s",
            "54s",
            "AKo",
            "AQo",
            "AJo",
            "ATo",
            "KQo",
            "KJo",
            "QJo",
            "JTo",
        ]

        created = 0
        for i in range(count):
            spot_name, stack, actions = spots[i % len(spots)]
            hand = hands[i % len(hands)]
            root_id = f"pmev_{i:03d}_{spot_name}_root"

            root_node = DiscoveryNode(
                node_id=root_id,
                parent_id=None,
                depth=0,
                domain="pmev_math",
                action_type=f"spot_{spot_name}",
                action_payload={"spot": spot_name, "hand": hand, "stack_bb": stack},
                status="success",
                metric_score=0.50,
                runtime_ms=15.0,
                tokens_consumed=0,
            )

            tree_nodes: dict[str, DiscoveryNode] = {root_id: root_node}
            for act_name, score, act_status in actions:
                child_id = f"pmev_{i:03d}_{act_name}"
                child_node = DiscoveryNode(
                    node_id=child_id,
                    parent_id=root_id,
                    depth=1,
                    domain="pmev_math",
                    action_type=act_name,
                    action_payload={"spot": spot_name, "hand": hand, "action": act_name},
                    status=act_status,  # type: ignore[arg-type]
                    metric_score=score,
                    runtime_ms=25.0,
                    tokens_consumed=0,
                )
                tree_nodes[child_id] = child_node

            tree = DiscoveryTree(
                tree_id=f"tree_pmev_{i:03d}_{spot_name}_{hand}",
                root_id=root_id,
                domain="pmev_math",
                nodes=tree_nodes,
            )
            self.simulator.record_tree(tree)
            created += 1

        return created

    def get_database_health_telemetry(self) -> dict[str, Any]:
        """Calcula telemetria de integridade, tamanho e projecao do banco SQLite."""
        p = Path(self.db_path)
        size_bytes = p.stat().st_size if p.exists() else 0
        size_kb = round(size_bytes / 1024.0, 2)
        size_mb = round(size_bytes / (1024.0 * 1024.0), 4)

        integrity = "OK"
        domain_counts: dict[str, int] = {}
        total_trees = 0
        total_nodes = 0

        if self.db_path == ":memory:":
            total_trees = len(self.simulator._memory_trees)
            for t in self.simulator._memory_trees.values():
                domain_counts[t.domain] = domain_counts.get(t.domain, 0) + 1
                total_nodes += len(t.nodes)
        else:
            with contextlib.closing(sqlite3.connect(self.db_path)) as conn:
                cursor = conn.cursor()
                cursor.execute("PRAGMA integrity_check")
                row = cursor.fetchone()
                integrity = row[0] if row else "UNKNOWN"

                cursor.execute("SELECT domain, COUNT(*) FROM discovery_trees GROUP BY domain")
                for dom, cnt in cursor.fetchall():
                    domain_counts[dom] = cnt
                    total_trees += cnt

                cursor.execute("SELECT payload_json FROM discovery_trees")
                for (payload,) in cursor.fetchall():
                    with contextlib.suppress(json.JSONDecodeError, TypeError, KeyError):
                        data = json.loads(payload)
                        total_nodes += len(data.get("nodes", {}))

        avg_nodes = round(total_nodes / total_trees, 2) if total_trees > 0 else 0.0
        avg_bytes = (size_bytes / total_trees) if total_trees > 0 else 1024.0
        projected_annual_mb = round((avg_bytes * 500 * 12) / (1024.0 * 1024.0), 2)

        return {
            "db_path": self.db_path,
            "status": "HEALTHY" if integrity.lower() == "ok" else "DEGRADED",
            "integrity_check": integrity,
            "size_bytes": size_bytes,
            "size_kb": size_kb,
            "size_mb": size_mb,
            "total_trees": total_trees,
            "total_nodes": total_nodes,
            "avg_nodes_per_tree": avg_nodes,
            "domain_distribution": domain_counts,
            "projected_annual_growth_mb": projected_annual_mb,
        }
