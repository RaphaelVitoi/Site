"""Motor do Replay Simulator Offline do Dream-RSI para o Ecossistema Nexus.

Permite simular trajetorias de politicas de exploracao sobre arvores de historico
acumuladas a custo zero de execucao (sem recompilacao, sem chamadas ao LLM ou GPU).

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from collections.abc import Sequence
import contextlib
import json
import sqlite3

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
        self._memory_trees[tree.tree_id] = tree
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

    def simulate_policy_on_tree(self, policy: ExplorationPolicy, tree: DiscoveryTree) -> ReplayEvaluationResult:
        """Simula o comportamento da politica sobre uma arvore de descoberta exata."""
        candidates = policy.select_candidates(tree)
        evaluated_nodes: list[DiscoveryNode] = []
        pruned_nodes_count = 0
        tokens_saved = 0
        simulated_runtime = 0.0

        for node in candidates:
            if policy.should_prune(node, tree):
                pruned_nodes_count += 1
                tokens_saved += node.tokens_consumed
            else:
                evaluated_nodes.append(node)
                simulated_runtime += node.runtime_ms

        # Calculo do score ponderado por acuracia e economia computacional
        if evaluated_nodes:
            avg_metric = sum(n.metric_score for n in evaluated_nodes) / len(evaluated_nodes)
            best_node = max(evaluated_nodes, key=lambda n: n.metric_score)
            best_node_id = best_node.node_id
            # Bonus por economia de tokens e reducao de latencia simulada
            total_score = avg_metric * 100.0 + (tokens_saved * 0.01) - (simulated_runtime * 0.001)
        else:
            total_score = 0.0
            best_node_id = None

        return ReplayEvaluationResult(
            policy_name=policy.name,
            total_score=max(0.0, float(total_score)),
            nodes_evaluated=len(evaluated_nodes),
            simulated_runtime_ms=float(simulated_runtime),
            simulated_tokens_saved=tokens_saved,
            pruned_nodes_count=pruned_nodes_count,
            best_node_id=best_node_id,
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
            )

        tree_results = [self.simulate_policy_on_tree(policy, t) for t in history_pool]

        agg_total_score = sum(r.total_score for r in tree_results) / len(tree_results)
        agg_nodes_evaluated = sum(r.nodes_evaluated for r in tree_results)
        agg_runtime = sum(r.simulated_runtime_ms for r in tree_results)
        agg_tokens_saved = sum(r.simulated_tokens_saved for r in tree_results)
        agg_pruned = sum(r.pruned_nodes_count for r in tree_results)

        # Seleciona o melhor no entre todos os mundos
        best_id: str | None = None
        highest_score = float("-inf")
        for res in tree_results:
            if res.best_node_id and res.total_score > highest_score:
                highest_score = res.total_score
                best_id = res.best_node_id

        return ReplayEvaluationResult(
            policy_name=policy.name,
            total_score=float(agg_total_score),
            nodes_evaluated=agg_nodes_evaluated,
            simulated_runtime_ms=float(agg_runtime),
            simulated_tokens_saved=agg_tokens_saved,
            pruned_nodes_count=agg_pruned,
            best_node_id=best_id,
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
        score_map[current_policy.name] = current_eval.total_score

        # Avalia todos os candidatos concorrentes
        for candidate in candidates:
            if candidate.name == current_policy.name:
                continue
            cand_eval = self.evaluate_policy(candidate, history_pool)
            evaluations.append(cand_eval)
            score_map[candidate.name] = cand_eval.total_score

        winning_policy = select_monotonic_best_policy(candidates, current_policy, score_map)
        return winning_policy, evaluations
