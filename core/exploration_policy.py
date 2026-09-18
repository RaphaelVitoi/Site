"""Politicas de exploracao como codigo executavel para o Dream-RSI.

Padrao SOTA: Pure ASCII, PEP 585/604, Zero-Any, Tipagem Estrita Python 3.12+.
Principio fundamental: Semantic guidance is worse than replay.
A politica e codigo formal executavel, sem poluir prompts com dicas textuais.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Sequence
from typing import TYPE_CHECKING

from core.discovery_tree_schemas import DiscoveryNode, DiscoveryTree

if TYPE_CHECKING:
    from engine.dream_timesfm_forecaster import DreamTimesFMForecaster


class ExplorationPolicy(ABC):
    """Interface abstrata para uma politica de exploracao de arvore."""

    def __init__(self, name: str, version: int = 1) -> None:
        self.name = name
        self.version = version

    @abstractmethod
    def select_candidates(self, tree: DiscoveryTree) -> list[DiscoveryNode]:
        """Seleciona quais nos da arvore devem ser continuados/expandidos."""

    @abstractmethod
    def should_prune(self, node: DiscoveryNode, tree: DiscoveryTree) -> bool:
        """Determina se uma tentativa deve ser descartada antes da execucao."""

    @abstractmethod
    def should_stop(self, tree: DiscoveryTree, round_count: int, best_metric: float) -> bool:
        """Determina o criterio de parada da exploracao."""

    @abstractmethod
    def branch_factor(self, current_depth: int) -> int:
        """Define o fator de ramificacao permitido para a profundidade atual."""


class ParallelRefinePolicy(ExplorationPolicy):
    """Politica base hand-written (pi_1): refinamento paralelo com feixe fixo."""

    def __init__(self, beam_width: int = 3, max_depth: int = 5, max_rounds: int = 10) -> None:
        super().__init__(name="ParallelRefinePolicy", version=1)
        self.beam_width = beam_width
        self.max_depth = max_depth
        self.max_rounds = max_rounds

    def select_candidates(self, tree: DiscoveryTree) -> list[DiscoveryNode]:
        """Seleciona os top-N nos com melhor pontuacao para expansao paralela."""
        valid_nodes = [node for node in tree.nodes.values() if node.status != "pruned"]
        if not valid_nodes:
            return []
        sorted_nodes = sorted(valid_nodes, key=lambda n: n.metric_score, reverse=True)
        return sorted_nodes[: self.beam_width]

    def should_prune(self, node: DiscoveryNode, tree: DiscoveryTree) -> bool:  # noqa: ARG002
        """Poda nos com pontuacao excessivamente baixa ou profundidade excedida."""
        if node.depth > self.max_depth:
            return True
        return node.status in ("compiler_error", "test_failure", "anchor_collision")

    def should_stop(self, tree: DiscoveryTree, round_count: int, best_metric: float) -> bool:  # noqa: ARG002
        """Para quando atingir o maximo de rodadas ou score satisfatorio."""
        if round_count >= self.max_rounds:
            return True
        return best_metric >= 1.0

    def branch_factor(self, current_depth: int) -> int:
        """Fator de ramificacao constante."""
        return max(1, self.beam_width - current_depth)


class AdaptiveDreamPolicy(ExplorationPolicy):
    """Politica adaptativa aprendida via 'sonho' retrospectivo.

    Implementa conservacao de orcamento durante ganhos continuos e
    alargamento de busca (anti-plateau) quando o progresso estagna.
    """

    def __init__(
        self,
        base_beam_width: int = 2,
        wide_beam_width: int = 5,
        stagnation_patience: int = 2,
        max_depth: int = 8,
        min_metric_threshold: float = 0.35,
    ) -> None:
        super().__init__(name="AdaptiveDreamPolicy", version=2)
        self.base_beam_width = base_beam_width
        self.wide_beam_width = wide_beam_width
        self.stagnation_patience = stagnation_patience
        self.max_depth = max_depth
        self.min_metric_threshold = min_metric_threshold
        self._plateau_counter = 0
        self._last_best_metric = 0.0

    def select_candidates(self, tree: DiscoveryTree) -> list[DiscoveryNode]:
        """Seleciona candidatos adaptando o feixe com base no historico recente."""
        leaf_nodes = tree.get_leaf_nodes()
        if not leaf_nodes:
            leaf_nodes = list(tree.nodes.values())

        candidate_leaves = [n for n in leaf_nodes if n.status != "pruned"]
        if not candidate_leaves:
            candidate_leaves = [n for n in tree.nodes.values() if n.status != "pruned"]

        if not candidate_leaves:
            return []

        # Detecao de plateaus para decidir largura do feixe
        best_node = tree.best_node()
        current_best = best_node.metric_score if best_node else 0.0

        if current_best <= self._last_best_metric + 1e-4:
            self._plateau_counter += 1
        else:
            self._plateau_counter = 0
            self._last_best_metric = current_best

        # Se estagnado, alarga a busca (exploration); se progredindo, economiza compute (exploitation)
        effective_width = (
            self.wide_beam_width if self._plateau_counter >= self.stagnation_patience else self.base_beam_width
        )

        sorted_leaves = sorted(candidate_leaves, key=lambda n: n.metric_score, reverse=True)
        return sorted_leaves[:effective_width]

    def should_prune(self, node: DiscoveryNode, tree: DiscoveryTree) -> bool:  # noqa: ARG002
        """Poda com base em historico de erro estrutural ou baixa pontuacao."""
        if node.depth > self.max_depth:
            return True
        if node.status in ("compiler_error", "test_failure", "anchor_collision"):
            return True
        return node.metric_score < self.min_metric_threshold and node.depth >= 2

    def should_stop(self, tree: DiscoveryTree, round_count: int, best_metric: float) -> bool:  # noqa: ARG002
        """Para ao atingir convergencia ou estagnacao prolongada em profundidade maxima."""
        if best_metric >= 0.999:
            return True
        return round_count >= 15

    def branch_factor(self, current_depth: int) -> int:
        """Ramificacao adaptativa: mais agressiva na raiz, refinada nas pontas."""
        if self._plateau_counter >= self.stagnation_patience:
            return max(2, self.wide_beam_width - current_depth)
        return max(1, self.base_beam_width - (current_depth // 2))


class TimesFMPredictivePolicy(ExplorationPolicy):
    """Politica autopoietica combinada: Dream-RSI com projecoes temporais do TimesFM 2.5."""

    def __init__(
        self,
        base_beam_width: int = 2,
        wide_beam_width: int = 5,
        max_depth: int = 8,
        min_metric_threshold: float = 0.35,
        forecaster: DreamTimesFMForecaster | None = None,
    ) -> None:
        super().__init__(name="TimesFMPredictivePolicy", version=3)
        self.base_beam_width = base_beam_width
        self.wide_beam_width = wide_beam_width
        self.max_depth = max_depth
        self.min_metric_threshold = min_metric_threshold
        self._forecaster = forecaster

    def select_candidates(self, tree: DiscoveryTree) -> list[DiscoveryNode]:
        """Seleciona candidatos adaptando a largura do feixe via previsao antecipada de plateau."""
        leaf_nodes = tree.get_leaf_nodes()
        if not leaf_nodes:
            leaf_nodes = list(tree.nodes.values())

        candidate_leaves = [n for n in leaf_nodes if n.status != "pruned"]
        if not candidate_leaves:
            candidate_leaves = [n for n in tree.nodes.values() if n.status != "pruned"]

        if not candidate_leaves:
            return []

        sorted_leaves = sorted(candidate_leaves, key=lambda n: n.metric_score, reverse=True)
        effective_width = self.base_beam_width

        # Inferencia de plateau pró-ativo usando TimesFM se houver dados suficientes
        if self._forecaster and sorted_leaves:
            best_leaf = sorted_leaves[0]
            scores = self._forecaster.extract_trajectory_scores(tree, best_leaf.node_id)
            if self._forecaster.is_plateau_imminent(scores):
                effective_width = self.wide_beam_width

        return sorted_leaves[:effective_width]

    def should_prune(self, node: DiscoveryNode, tree: DiscoveryTree) -> bool:
        """Poda deterministica combinada com previsao quantilica TimesFM (Q90)."""
        if node.depth > self.max_depth:
            return True
        if node.status in ("compiler_error", "test_failure", "anchor_collision"):
            return True
        if node.metric_score < self.min_metric_threshold and node.depth >= 2:
            return True

        # Poda preditiva via TimesFM
        if self._forecaster:
            scores = self._forecaster.extract_trajectory_scores(tree, node.node_id)
            best_node = tree.best_node()
            global_best = best_node.metric_score if best_node else 0.0
            prune, _ = self._forecaster.should_prune_predictively(scores, global_best)
            if prune:
                return True

        return False

    def should_stop(self, tree: DiscoveryTree, round_count: int, best_metric: float) -> bool:  # noqa: ARG002
        """Criterio de parada baseado em convergencia de score ou teto de rodadas."""
        if best_metric >= 0.999:
            return True
        return round_count >= 15

    def branch_factor(self, current_depth: int) -> int:
        """Fator de ramificacao dinamico."""
        return max(1, self.base_beam_width - (current_depth // 2))


def select_monotonic_best_policy(
    candidates: Sequence[ExplorationPolicy],
    current_policy: ExplorationPolicy,
    policy_scores: dict[str, float],
) -> ExplorationPolicy:
    """Garante o Teorema da Nao-Regressao Monotonica.

    A politica candidata vencedora nunca pode pontuar pior do que a
    politica atualmente em producao sobre o historico de replay acumulado.
    """
    current_score = policy_scores.get(current_policy.name, float("-inf"))
    best_candidate = current_policy
    best_score = current_score

    for policy in candidates:
        score = policy_scores.get(policy.name, float("-inf"))
        if score > best_score:
            best_score = score
            best_candidate = policy

    return best_candidate
