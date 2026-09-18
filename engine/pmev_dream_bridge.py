"""Ponte de integracao Dream-RSI para o Motor de Teoria dos Jogos PMev.

Permite podar sub-ramos de apostas dominadas antes de disparar simulacoes pesadas
de Monte Carlo em Rust/WASM, reutilizando avaliacoes passadas como Replay Simulator.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from core.discovery_tree_schemas import DiscoveryNode, DiscoveryTree


@dataclass(frozen=True, slots=True)
class PMevActionBranch:
    """Ramo de acao em uma arvore de decisao de poker MTT."""

    action_name: str
    bet_size_bb: float
    estimated_ev: float
    risk_metric: float


@dataclass(frozen=True, slots=True)
class PMevPruningResult:
    """Resultado da triagem offline de sub-ramos PMev."""

    surviving_branches: list[PMevActionBranch]
    pruned_branches: list[PMevActionBranch]
    cpu_cycles_saved_estimate_pct: float


class PMevDreamBridge:
    """Ponte de autoaperfeicoamento para exploracao de arvores de decisao PMev."""

    def __init__(self, min_ev_threshold: float = -0.05) -> None:
        self.min_ev_threshold = min_ev_threshold

    def filter_dominated_branches(
        self,
        candidate_branches: Sequence[PMevActionBranch],
        replay_tree: DiscoveryTree | None = None,
    ) -> PMevPruningResult:
        """Poda ramos matematicamente dominados usando o simulador de replay."""
        surviving: list[PMevActionBranch] = []
        pruned: list[PMevActionBranch] = []

        # Poda heuristica imediata
        for branch in candidate_branches:
            if branch.estimated_ev < self.min_ev_threshold and branch.action_name != "fold":
                pruned.append(branch)
            else:
                surviving.append(branch)

        # Se houver arvore de historico, refina com os nos anteriores
        if replay_tree:
            known_bad_actions = {
                node.action_type
                for node in replay_tree.nodes.values()
                if node.status != "success" or node.metric_score < 0.2
            }
            further_filtered: list[PMevActionBranch] = []
            for b in surviving:
                if b.action_name in known_bad_actions:
                    pruned.append(b)
                else:
                    further_filtered.append(b)
            surviving = further_filtered

        total = len(candidate_branches)
        saved_pct = (len(pruned) / total * 100.0) if total > 0 else 0.0

        return PMevPruningResult(
            surviving_branches=surviving,
            pruned_branches=pruned,
            cpu_cycles_saved_estimate_pct=round(saved_pct, 2),
        )

    def record_pmev_run(
        self,
        tree_id: str,
        action_name: str,
        metric_score: float,
        runtime_ms: float,
        parent_id: str | None = None,
    ) -> DiscoveryNode:
        """Cria um no de descoberta formal para persistir a execucao PMev na arvore."""
        node_id = f"pmev_{tree_id}_{action_name}_{int(runtime_ms)}"
        return DiscoveryNode(
            node_id=node_id,
            parent_id=parent_id,
            depth=1 if parent_id else 0,
            domain="pmev_math",
            action_type=action_name,
            action_payload={"runtime": runtime_ms, "score": metric_score},
            status="success" if metric_score >= 0.0 else "test_failure",
            metric_score=metric_score,
            runtime_ms=runtime_ms,
            tokens_consumed=0,
        )
