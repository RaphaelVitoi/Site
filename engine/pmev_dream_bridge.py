"""Ponte de integracao Dream-RSI para o Motor de Teoria dos Jogos PMev.

Permite podar sub-ramos de apostas dominadas antes de disparar simulacoes pesadas
de Monte Carlo em Rust/WASM, reutilizando avaliacoes passadas como Replay Simulator.

Consumido por api/v1/handlers.py (handle_simulate_perspective_tree) em modo
OBSERVACIONAL: grava cada arvore simulada e anexa o diagnostico de poda a resposta,
sem alterar nenhum valor do PMev -- decidir com a poda e escolha matematica do Tier 0.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import TYPE_CHECKING
import uuid

from core.discovery_tree_schemas import DiscoveryNode, DiscoveryTree

if TYPE_CHECKING:
    from engine.dream_replay_simulator import DreamReplaySimulator


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

        # Se houver arvore de historico, refina com os nos anteriores do dominio pmev_math
        if replay_tree:
            known_bad_actions = {
                node.action_type
                for node in replay_tree.nodes.values()
                if node.domain == "pmev_math" and (node.status != "success" or node.metric_score < 0.2)
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
        run_id: str | None = None,
    ) -> DiscoveryNode:
        """Cria um no de descoberta formal para persistir a execucao PMev na arvore."""
        exec_suffix = run_id or uuid.uuid4().hex[:8]
        node_id = f"pmev_{tree_id}_{action_name}_{exec_suffix}"
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

    def diagnosticar_arvore_de_perspectiva(
        self,
        tree_result: Mapping[str, object],
        runtime_ms: float,
        simulator: DreamReplaySimulator,
    ) -> dict[str, object]:
        """Registra a arvore do VitoiPerspectiveEngine e devolve o diagnostico de poda.

        Observacional: le pm_fold / pm_call / pm_raise e best_action e nao os altera.
        """
        ramos = [
            PMevActionBranch(action_name=nome, bet_size_bb=0.0, estimated_ev=float(valor), risk_metric=0.0)
            for nome, chave in (("fold", "pm_fold"), ("call", "pm_call"), ("raise", "pm_raise"))
            if isinstance(valor := tree_result.get(chave), int | float)
        ]
        poda = self.filter_dominated_branches(ramos)

        melhor = str(tree_result.get("best_action", "desconhecida")).lower()
        pm_best = tree_result.get("pm_best")
        no = self.record_pmev_run(
            tree_id="perspectiva",
            action_name=melhor,
            metric_score=float(pm_best) if isinstance(pm_best, int | float) else 0.0,
            runtime_ms=runtime_ms,
        )
        simulator.record_tree(
            DiscoveryTree(tree_id=f"tree_{no.node_id}", root_id=no.node_id, domain="pmev_math", nodes={no.node_id: no})
        )

        # Instrumentacao S1/S2: Grava o trio (HandHistory, SolucaoExataPMev, ResiduoDeIncerteza)
        trio_id: str | None = None
        if hasattr(simulator, "record_pmev_distillation_trio"):
            residuo = max(0.0, min(1.0, 1.0 - (poda.cpu_cycles_saved_estimate_pct / 100.0)))
            trio_id = simulator.record_pmev_distillation_trio(
                hand_history=str(
                    tree_result.get("hand_history") or tree_result.get("cenario") or f"PMev Tree {no.node_id}"
                ),
                exact_solution={
                    "best_action": melhor,
                    "pm_best": float(pm_best) if isinstance(pm_best, int | float) else 0.0,
                },
                uncertainty_residual=residuo,
                metadata={"runtime_ms": runtime_ms, "limiar_ev": self.min_ev_threshold},
            )

        return {
            "registrado": no.node_id,
            "distillation_trio_id": trio_id,
            "ramos_podados": [r.action_name for r in poda.pruned_branches],
            "ramos_sobreviventes": [r.action_name for r in poda.surviving_branches],
            "limiar_ev": self.min_ev_threshold,
        }
