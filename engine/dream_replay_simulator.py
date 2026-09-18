"""Motor do Replay Simulator Offline do Dream-RSI para o Ecossistema Nexus.

Permite simular trajetorias de politicas de exploracao sobre arvores de historico
acumuladas a custo zero de execucao (sem recompilacao, sem chamadas ao LLM ou GPU).

EXPERIMENTAL (2026-09-18): sem consumidor no runtime -- so os testes o alcancam.
Nao importar de rota, worker ou UI sem antes liga-lo ao fluxo real com teste ponta
a ponta (CLAUDE.md do Site, secao 6, item 5).

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from collections.abc import Sequence
import contextlib
import copy
import json
from pathlib import Path
import sqlite3
from typing import Any

from core.discovery_tree_schemas import (
    DiscoveryNode,
    DiscoveryTree,
    ReplayEvaluationResult,
)
from core.exploration_policy import (
    ExplorationPolicy,
    select_monotonic_best_policy,
)


class DreamReplaySimulator:
    """Simulador de Replay exato que opera sobre o historico de descobertas."""

    def __init__(self, db_path: str = ":memory:") -> None:
        self.db_path = db_path
        self._memory_trees: dict[str, DiscoveryTree] = {}
        if self.db_path != ":memory:":
            self._init_db()

    @property
    def memory_trees(self) -> dict[str, DiscoveryTree]:
        """Acesso publico seguro ao mapa de arvores em memoria."""
        return self._memory_trees

    def _init_db(self) -> None:
        """Inicializa as tabelas necessarias no SQLite para persistencia persistente."""
        with contextlib.closing(sqlite3.connect(self.db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS discovery_trees (
                    tree_id TEXT PRIMARY KEY,
                    root_id TEXT NOT NULL,
                    domain TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def record_tree(self, tree: DiscoveryTree) -> None:
        """Registra uma arvore de descoberta concluida no pool de mundos."""
        self._memory_trees[tree.tree_id] = copy.deepcopy(tree)
        if self.db_path != ":memory:":
            with contextlib.closing(sqlite3.connect(self.db_path)) as conn:
                cursor = conn.cursor()
                payload = tree.model_dump_json()
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO discovery_trees
                    (tree_id, root_id, domain, created_at, payload_json)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (tree.tree_id, tree.root_id, tree.domain, tree.created_at, payload),
                )
                conn.commit()

    def load_trees(self, domain: str | None = None) -> list[DiscoveryTree]:
        """Carrega arvores persistidas, opcionalmente filtradas por dominio."""
        if self.db_path == ":memory:":
            trees = list(self._memory_trees.values())
            if domain:
                return [t for t in trees if t.domain == domain]
            return trees

        loaded_trees: list[DiscoveryTree] = []
        with contextlib.closing(sqlite3.connect(self.db_path)) as conn:
            cursor = conn.cursor()
            if domain:
                cursor.execute("SELECT payload_json FROM discovery_trees WHERE domain = ?", (domain,))
            else:
                cursor.execute("SELECT payload_json FROM discovery_trees")

            for (payload_json,) in cursor.fetchall():
                data = json.loads(payload_json)
                loaded_trees.append(DiscoveryTree.model_validate(data))

        return loaded_trees

    def get_database_health_telemetry(self) -> dict[str, Any]:
        """Consulta a telemetria de integridade e crescimento do banco SQLite."""
        p = Path(self.db_path)
        size_bytes = p.stat().st_size if p.exists() else 0
        size_kb = round(size_bytes / 1024.0, 2)
        size_mb = round(size_bytes / (1024.0 * 1024.0), 4)

        integrity = "OK"
        domain_counts: dict[str, int] = {}
        total_trees = 0
        total_nodes = 0
        invalid_payloads = 0

        if self.db_path == ":memory:":
            total_trees = len(self._memory_trees)
            for t in self._memory_trees.values():
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
                    try:
                        data = json.loads(payload)
                        if isinstance(data, dict) and isinstance(data.get("nodes"), dict):
                            total_nodes += len(data["nodes"])
                        else:
                            invalid_payloads += 1
                    except (json.JSONDecodeError, TypeError):
                        invalid_payloads += 1

        avg_nodes = round(total_nodes / total_trees, 2) if total_trees > 0 else 0.0
        avg_bytes = (size_bytes / total_trees) if total_trees > 0 else 1024.0
        projected_annual_mb = round((avg_bytes * 500 * 12) / (1024.0 * 1024.0), 2)

        is_healthy = integrity.lower() == "ok" and invalid_payloads == 0
        return {
            "db_path": self.db_path,
            "status": "HEALTHY" if is_healthy else "DEGRADED",
            "integrity_check": integrity,
            "invalid_payloads": invalid_payloads,
            "size_bytes": size_bytes,
            "size_kb": size_kb,
            "size_mb": size_mb,
            "total_trees": total_trees,
            "total_nodes": total_nodes,
            "avg_nodes_per_tree": avg_nodes,
            "domain_distribution": domain_counts,
            "projected_annual_growth_mb": projected_annual_mb,
        }

    def simulate_policy_on_tree(self, policy: ExplorationPolicy, tree: DiscoveryTree) -> ReplayEvaluationResult:
        """Simula o comportamento da politica sobre uma arvore de descoberta exata rodada por rodada."""
        if not tree.nodes:
            return ReplayEvaluationResult(
                policy_name=policy.name,
                total_score=0.0,
                nodes_evaluated=0,
                simulated_runtime_ms=0.0,
                simulated_tokens_saved=0,
                pruned_nodes_count=0,
                best_node_id=None,
                best_node_metric=0.0,
            )

        root_node = tree.nodes.get(tree.root_id)
        if not root_node:
            root_node = next(iter(tree.nodes.values()))

        reachable_nodes: dict[str, DiscoveryNode] = {root_node.node_id: root_node}
        evaluated_nodes: list[DiscoveryNode] = [root_node]
        pruned_ids: set[str] = set()
        pruned_nodes_count = 0
        tokens_saved = 0
        simulated_runtime = root_node.runtime_ms

        best_node = root_node
        best_metric = root_node.metric_score if root_node.status == "success" else 0.0

        round_count = 0
        max_rounds = getattr(policy, "max_rounds", 15)

        while round_count < max_rounds:
            current_tree = DiscoveryTree(
                tree_id=tree.tree_id,
                root_id=tree.root_id,
                domain=tree.domain,
                nodes=reachable_nodes,
            )

            if policy.should_stop(current_tree, round_count, best_metric):
                break

            candidates = policy.select_candidates(current_tree)
            valid_candidates = [n for n in candidates if n.node_id in reachable_nodes]
            if not valid_candidates:
                break

            newly_reached = 0
            for candidate in valid_candidates:
                children = tree.get_children(candidate.node_id)
                unvisited_children = [
                    c for c in children if c.node_id not in reachable_nodes and c.node_id not in pruned_ids
                ]
                branch_limit = policy.branch_factor(candidate.depth)
                target_children = unvisited_children[:branch_limit]

                for child in target_children:
                    if policy.should_prune(child, current_tree):
                        pruned_nodes_count += 1
                        tokens_saved += child.tokens_consumed
                        pruned_ids.add(child.node_id)
                    else:
                        evaluated_nodes.append(child)
                        reachable_nodes[child.node_id] = child
                        simulated_runtime += child.runtime_ms
                        newly_reached += 1
                        if child.metric_score > best_metric and child.status == "success":
                            best_metric = child.metric_score
                            best_node = child

            round_count += 1
            if newly_reached == 0:
                break

        # Calculo do score ponderado por acuracia e economia computacional
        if evaluated_nodes:
            avg_metric = sum(n.metric_score for n in evaluated_nodes) / len(evaluated_nodes)
            best_node_id = best_node.node_id
            best_metric_val = float(best_node.metric_score)
            total_score = avg_metric * 100.0 + (tokens_saved * 0.01) - (simulated_runtime * 0.001)
        else:
            total_score = 0.0
            best_node_id = None
            best_metric_val = 0.0

        return ReplayEvaluationResult(
            policy_name=policy.name,
            total_score=max(0.0, float(total_score)),
            nodes_evaluated=len(evaluated_nodes),
            simulated_runtime_ms=float(simulated_runtime),
            simulated_tokens_saved=tokens_saved,
            pruned_nodes_count=pruned_nodes_count,
            best_node_id=best_node_id,
            best_node_metric=best_metric_val,
        )

    def evaluate_policy(
        self, policy: ExplorationPolicy, history_pool: Sequence[DiscoveryTree]
    ) -> ReplayEvaluationResult:
        """Avalia a politica sobre todo o pool de mundos acumulado."""
        if not history_pool:
            return ReplayEvaluationResult(
                policy_name=policy.name,
                total_score=0.0,
                nodes_evaluated=0,
                simulated_runtime_ms=0.0,
                simulated_tokens_saved=0,
                pruned_nodes_count=0,
                best_node_id=None,
                best_node_metric=0.0,
            )

        tree_results: list[ReplayEvaluationResult] = []
        for t in history_pool:
            cloned_policy = copy.deepcopy(policy)
            if hasattr(cloned_policy, "reset"):
                cloned_policy.reset()
            tree_results.append(self.simulate_policy_on_tree(cloned_policy, t))

        agg_total_score = sum(r.total_score for r in tree_results) / len(tree_results)
        agg_nodes_evaluated = sum(r.nodes_evaluated for r in tree_results)
        agg_runtime = sum(r.simulated_runtime_ms for r in tree_results)
        agg_tokens_saved = sum(r.simulated_tokens_saved for r in tree_results)
        agg_pruned = sum(r.pruned_nodes_count for r in tree_results)

        # Seleciona o melhor no entre todos os mundos comparando a metrica do no
        best_id: str | None = None
        highest_metric = float("-inf")
        for res in tree_results:
            if res.best_node_id and res.best_node_metric > highest_metric:
                highest_metric = res.best_node_metric
                best_id = res.best_node_id

        return ReplayEvaluationResult(
            policy_name=policy.name,
            total_score=float(agg_total_score),
            nodes_evaluated=agg_nodes_evaluated,
            simulated_runtime_ms=float(agg_runtime),
            simulated_tokens_saved=agg_tokens_saved,
            pruned_nodes_count=agg_pruned,
            best_node_id=best_id,
            best_node_metric=max(0.0, highest_metric) if best_id else 0.0,
        )

    def run_dream_optimization(
        self,
        candidates: Sequence[ExplorationPolicy],
        current_policy: ExplorationPolicy,
        history_pool: Sequence[DiscoveryTree],
    ) -> tuple[ExplorationPolicy, list[ReplayEvaluationResult]]:
        """Executa a fase de Sonho completa.

        Avalia todas as politicas candidatas sobre o pool de historico
        e seleciona a melhor assegurando nao-regressao monotonica.
        """
        evaluations: list[ReplayEvaluationResult] = []
        score_map: dict[str, float] = {}

        # Avalia a politica corrente primeiro
        current_eval = self.evaluate_policy(current_policy, history_pool)
        evaluations.append(current_eval)
        current_id = getattr(current_policy, "identifier", current_policy.name)
        score_map[current_id] = current_eval.total_score
        score_map[current_policy.name] = current_eval.total_score

        # Avalia todos os candidatos concorrentes
        for candidate in candidates:
            cand_id = getattr(candidate, "identifier", candidate.name)
            # Pula apenas a instancia exata da politica atual
            if candidate is current_policy or cand_id == current_id:
                continue
            cand_eval = self.evaluate_policy(candidate, history_pool)
            evaluations.append(cand_eval)
            score_map[cand_id] = cand_eval.total_score
            if candidate.name not in score_map:
                score_map[candidate.name] = cand_eval.total_score

        winning_policy = select_monotonic_best_policy(candidates, current_policy, score_map)
        return winning_policy, evaluations
