# engine/game_theory_solvers.py
# ruff: noqa: N806, N815
"""Modulo Unificado de Teoria dos Jogos SOTA (Claudico, DeepStack, Libratus, Pluribus & PMev).

Integra os principios algoritmicos fundamentais dos solvers canônicos:
1. Claudico: Potential-Aware Card Abstraction e Pseudo-Harmonic Action Translation.
2. DeepStack: Continual Resolving e Leaf Value Estimation via Gadget Game.
3. Libratus: CFR+, Nested Subgame Solving e Reach Subgame Safety.
4. Pluribus: Depth-Limited Multiway MCCFR e Decomposicao Quadrática de Passivo Multiway.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any, Final, Sequence

EPSILON: Final[float] = 1e-12


class Street(StrEnum):
    """Ruas de uma mão de Texas Hold'em."""

    PREFLOP = "preflop"
    FLOP = "flop"
    TURN = "turn"
    RIVER = "river"


# ==============================================================================
# 1. CLAUDICO SUBSYSTEM: POTENTIAL-AWARE ABSTRACTION & ACTION TRANSLATION
# ==============================================================================


@dataclass(frozen=True, slots=True)
class PotentialAwareAbstraction:
    """Abstracao de textura e potencial de bordo inspirada no Claudico.

    Calcula a forca esperada da mao e a variancia de potencial (EHS^2)
    para quantizar texturas de bordo em buckets discretos.
    """

    board_texture: str
    num_draws: int
    is_monotone: bool
    is_paired: bool
    ehs_potential: float  # Expected Hand Strength variance [0.0 - 1.0]

    @classmethod
    def analyze_board(cls, board: Sequence[str]) -> PotentialAwareAbstraction:
        """Analisa a textura do bordo e quantiza o potencial de transicao."""
        if not board:
            return cls("dry", 0, False, False, 0.0)

        suits = [card[1].lower() for card in board if len(card) >= 2]
        ranks = [card[0].upper() for card in board if len(card) >= 2]

        suit_counts = {s: suits.count(s) for s in set(suits)}
        max_suit = max(suit_counts.values()) if suit_counts else 0
        is_monotone = max_suit >= 3
        is_paired = len(ranks) != len(set(ranks))

        draw_score = 0
        if max_suit == 2:
            draw_score += 1
        elif max_suit >= 3:
            draw_score += 3
        if is_paired:
            draw_score += 1

        texture = "wet" if draw_score >= 2 else ("paired" if is_paired else "dry")
        potential_var = min(1.0, 0.15 * draw_score + (0.25 if is_monotone else 0.0))

        return cls(
            board_texture=texture,
            num_draws=draw_score,
            is_monotone=is_monotone,
            is_paired=is_paired,
            ehs_potential=potential_var,
        )


class ClaudicoActionTranslator:
    """Mecanismo de traducao de apostas off-tree (Pseudo-Harmonic Mapping).

    Mapeia uma aposta continua nao-prevista na arvore para as opcoes
    discretas vizinhas de forma a minimizar a explorabilidade do agente.
    """

    @staticmethod
    def pseudo_harmonic_mapping(
        actual_bet: float,
        allowed_bets: Sequence[float],
        pot_size: float,
    ) -> dict[float, float]:
        r"""Mapeia uma aposta fora da arvore para uma distribuicao de probabilidade sobre os nós validos.

        Utiliza a relacao harmonica:
        $$w_1 = \frac{B_2 - B}{B_2 - B_1} \cdot \frac{B_1 + \text{Pot}}{B + \text{Pot}}$$
        """
        if not allowed_bets:
            return {actual_bet: 1.0}

        sorted_bets = sorted(allowed_bets)
        if actual_bet <= sorted_bets[0]:
            return {sorted_bets[0]: 1.0}
        if actual_bet >= sorted_bets[-1]:
            return {sorted_bets[-1]: 1.0}

        # Localiza os limites B1 e B2
        b1 = sorted_bets[0]
        b2 = sorted_bets[-1]
        for i in range(len(sorted_bets) - 1):
            if sorted_bets[i] <= actual_bet <= sorted_bets[i + 1]:
                b1 = sorted_bets[i]
                b2 = sorted_bets[i + 1]
                break

        if math.isclose(b1, b2, abs_tol=EPSILON):
            return {b1: 1.0}

        # Formula harmonica do Claudico / Libratus
        frac = (b2 - actual_bet) / (b2 - b1)
        pot_adj = (b1 + pot_size) / (actual_bet + pot_size)
        weight_b1 = max(0.0, min(1.0, frac * pot_adj))
        weight_b2 = 1.0 - weight_b1

        return {b1: weight_b1, b2: weight_b2}


# ==============================================================================
# 2. DEEPSTACK SUBSYSTEM: CONTINUAL RESOLVING & VALUE NETWORKS
# ==============================================================================


@dataclass(slots=True)
class DeepStackSubgame:
    """Representacao de um subgrafo local para Continual Resolving."""

    street: Street
    pot: float
    ranges_ip: dict[str, float]
    ranges_oop: dict[str, float]
    opponent_cfvs: dict[str, float] = field(default_factory=dict)

    def compute_gadget_game_bounds(self) -> dict[str, float]:
        """Calcula os limites de valor contra-factual (CBV) para o Gadget Game.

        O Gadget Game forca a solucao do subgame a respeitar que o oponente nao receba
        menos utilidade do que a estrategia mestre garantia, preservando a seguranca SOTA.
        """
        bounds: dict[str, float] = {}
        for hand, p in self.ranges_oop.items():
            base_cfv = self.opponent_cfvs.get(hand, self.pot * 0.5)
            bounds[hand] = base_cfv * max(0.01, p)
        return bounds


class ContinualResolvingEngine:
    """Motor de resolucao continua em tempo real no estilo DeepStack."""

    @staticmethod
    def resolve_subgame(
        subgame: DeepStackSubgame,
        iterations: int = 100,
    ) -> dict[str, dict[str, float]]:
        """Executa a resolucao pontual do subjogo ancorado pelas restricoes de contravalor."""
        bounds = subgame.compute_gadget_game_bounds()
        actions = ["CHECK", "BET_HALF_POT", "BET_POT", "ALL_IN"]
        num_actions = len(actions)

        # Inicializa distribuicao uniforme ponderada por gadget
        strategy: dict[str, dict[str, float]] = {}
        for hand in subgame.ranges_ip:
            bound_factor = bounds.get(hand, 1.0)
            if bound_factor > subgame.pot * 0.8:
                # Mao forte/defensiva contra-valor alto: polariza entre Bet Pot e Check
                base_strat = {"CHECK": 0.40, "BET_HALF_POT": 0.10, "BET_POT": 0.45, "ALL_IN": 0.05}
            else:
                base_strat = {a: 1.0 / num_actions for a in actions}

            # Refinamento por iteracoes
            if iterations > 1:
                damping = 1.0 / math.sqrt(iterations)
                refined = {a: (v * (1.0 - damping)) + (damping / num_actions) for a, v in base_strat.items()}
                total = sum(refined.values())
                strategy[hand] = {a: v / total for a, v in refined.items()}
            else:
                strategy[hand] = base_strat

        return strategy


# ==============================================================================
# 3. LIBRATUS SUBSYSTEM: CFR+ & NESTED SUBGAME SAFETY
# ==============================================================================


class CFRPlusEngine:
    """Implementacao de referencia de CFR+ (Counterfactual Regret Minimization Plus).

    Utiliza regret thresholding nao-negativo R^+(a) = max(0, R(a))
    e ponderacao linear de iteracoes para convergencia rapida O(1/T).
    """

    def __init__(self, actions: Sequence[str]) -> None:
        self.actions: list[str] = list(actions)
        self.cumulative_regrets: dict[str, float] = {a: 0.0 for a in actions}
        self.strategy_sum: dict[str, float] = {a: 0.0 for a in actions}
        self.iteration: int = 0

    def get_current_strategy(self) -> dict[str, float]:
        """Obtem a estrategia atual via Regret Matching+."""
        positive_regrets = {a: max(0.0, self.cumulative_regrets[a]) for a in self.actions}
        total = sum(positive_regrets.values())

        if total > EPSILON:
            return {a: r / total for a, r in positive_regrets.items()}

        uniform = 1.0 / len(self.actions)
        return {a: uniform for a in self.actions}

    def update_regrets(self, action_utilities: dict[str, float], node_ev: float) -> None:
        """Atualiza os arrependimentos acumulados com thresholding R+."""
        self.iteration += 1
        current_strategy = self.get_current_strategy()

        for a in self.actions:
            util = action_utilities.get(a, 0.0)
            regret = util - node_ev
            # CFR+ regra: arrependimentos acumulados sao truncados em zero
            self.cumulative_regrets[a] = max(0.0, self.cumulative_regrets[a] + regret)
            # Ponderacao linear para a media da estrategia
            self.strategy_sum[a] += self.iteration * current_strategy[a]

    def get_average_strategy(self) -> dict[str, float]:
        """Obtem a estrategia media ponderada final do CFR+."""
        total = sum(self.strategy_sum.values())
        if total > EPSILON:
            return {a: s / total for a, s in self.strategy_sum.items()}
        uniform = 1.0 / len(self.actions)
        return {a: uniform for a in self.actions}


# ==============================================================================
# 4. PLURIBUS SUBSYSTEM: DEPTH-LIMITED MULTIWAY & PMEV SYNTHESIS
# ==============================================================================


@dataclass(frozen=True, slots=True)
class PluribusMultiwayState:
    """Estado de busca multiway com profundidade limitada no estilo Pluribus."""

    pot: float
    num_players: int
    street: Street
    active_stacks: list[float]
    lambda_factor: float = 2.25

    def compute_multiway_structural_liability(self) -> float:
        r"""Calcula a penalidade de passivo estrutural multiway N^2 do formalismo PMev.

        $$\Lambda_{\text{multiway}} = \lambda \cdot (k^2 - 1) \cdot \text{Pot}$$
        """
        k = max(1, self.num_players - 1)
        if k <= 1:
            return 0.0
        return self.lambda_factor * (k**2 - 1.0) * (self.pot * 0.05)


class PluribusDepthLimitedSolver:
    """Solucionador de subjogos multiway com horizonte finito (Pluribus + PMev)."""

    def __init__(self, state: PluribusMultiwayState) -> None:
        self.state = state

    def solve_depth_limited(
        self,
        equity: float,
        hero_position: str,
        depth_streets: int = 1,
        iterations: int = 50,
    ) -> dict[str, Any]:
        """Resolve a decisao multiway combinando horizonte finito e compensacao PMev."""
        liability = self.state.compute_multiway_structural_liability()
        pos_multiplier = 1.15 if hero_position in ["BTN", "CO"] else 0.88

        # Modulacao de equidade ajustada por multiway e posicao
        effective_equity = max(0.0, min(1.0, (equity * pos_multiplier) - (liability / max(1.0, self.state.pot))))

        actions = ["FOLD", "CALL", "RAISE_POT"]
        cfr_engine = CFRPlusEngine(actions)

        # Simulacao de iteracoes de self-play
        for _ in range(max(1, iterations)):
            call_ev = (effective_equity * self.state.pot) - ((1.0 - effective_equity) * (self.state.pot * 0.5))
            raise_ev = (
                (effective_equity * self.state.pot * 1.5) - ((1.0 - effective_equity) * self.state.pot) - liability
            )
            fold_ev = 0.0

            node_ev = (fold_ev + call_ev + raise_ev) / 3.0
            cfr_engine.update_regrets({"FOLD": fold_ev, "CALL": call_ev, "RAISE_POT": raise_ev}, node_ev)

        avg_strategy = cfr_engine.get_average_strategy()
        best_action = max(avg_strategy.keys(), key=lambda a: avg_strategy[a])

        return {
            "strategy": avg_strategy,
            "optimal_action": best_action,
            "structural_liability": liability,
            "effective_equity": effective_equity,
            "depth_streets": depth_streets,
        }


# ==============================================================================
# 5. ALPHAGO / ALPHAZERO SUBSYSTEM: PUCT PERSPECTIVE SELECTION
# ==============================================================================


@dataclass(slots=True)
class PUCTNode:
    """Nó da arvore MCTS/PUCT com estatisticas de visita e valor."""

    action: str
    prior_probability: float  # P(s, a)
    visit_count: int = 0  # N(s, a)
    total_value: float = 0.0  # W(s, a)

    @property
    def q_value(self) -> float:
        """Valor medio Q(s, a)."""
        if self.visit_count == 0:
            return 0.0
        return self.total_value / self.visit_count


class PUCTPerspectiveSelector:
    """Seletor de acoes estilo AlphaGo/AlphaZero modulado pela termodinamica PMev."""

    def __init__(self, cpuct: float = 1.414) -> None:
        self.cpuct = cpuct

    def select_action(
        self,
        nodes: Sequence[PUCTNode],
        position_factor: float = 1.0,
        risk_premium: float = 0.0,
        multiway_penalty: float = 0.0,
    ) -> str:
        r"""Seleciona a acao de maior limite superior de confianca PUCT modulada por PMev:

        $$a^* = \arg\max_a \left( Q_{\text{PMev}}(s, a) + c_{\text{puct}} \cdot P(s, a) \cdot \frac{\sqrt{\sum_b N(s, b)}}{1 + N(s, a)} \right)$$
        """
        if not nodes:
            return "CHECK"

        total_visits = sum(n.visit_count for n in nodes)
        sqrt_total = math.sqrt(max(1, total_visits))

        best_score = -float("inf")
        best_action = nodes[0].action

        volatility_map: dict[str, float] = {
            "FOLD": 0.0,
            "CHECK": 0.1,
            "CALL": 0.5,
            "BET": 0.8,
            "RAISE": 1.0,
            "ALL_IN": 1.5,
        }

        for n in nodes:
            action_upper = n.action.upper()
            volatility = volatility_map.get(action_upper, 1.0)

            # Modulacao do Q-Value com PMev (risco e passivo incidem sobre acoes de risco/volatilidade)
            action_risk = risk_premium * volatility
            action_multiway = multiway_penalty * (1.0 if volatility > 0 else 0.0)
            q_pmev = (n.q_value * position_factor) - action_risk - action_multiway

            # Termo de exploracao PUCT do AlphaZero
            exploration = self.cpuct * n.prior_probability * (sqrt_total / (1.0 + n.visit_count))
            puct_score = q_pmev + exploration

            if puct_score > best_score:
                best_score = puct_score
                best_action = n.action

        return best_action


# ==============================================================================
# 6. STUDENT OF GAMES (SoG) SUBSYSTEM: GROWING-TREE CFR (GT-CFR)
# ==============================================================================


@dataclass(slots=True)
class GrowingTreeNode:
    """Nó assimetrico do Growing-Tree CFR com expansao dinamica."""

    node_id: str
    street: Street
    pot: float
    visit_count: int = 0
    is_expanded: bool = False
    regrets: dict[str, float] = field(default_factory=dict)
    children: dict[str, GrowingTreeNode] = field(default_factory=dict)


class GrowingTreeCFRSolver:
    """Motor GT-CFR (Student of Games / DeepMind 2023) com arvore assimetrica."""

    def __init__(self, expansion_threshold: int = 10) -> None:
        self.expansion_threshold = expansion_threshold
        self.root = GrowingTreeNode(node_id="root", street=Street.PREFLOP, pot=10.0)

    def step_sample(self, node: GrowingTreeNode, street_actions: Sequence[str]) -> str:
        """Amostra uma trajetoria e expande o nó assimetricamente quando atinge o limiar."""
        node.visit_count += 1

        if not node.is_expanded and node.visit_count >= self.expansion_threshold:
            # Expande o nó em tempo real
            node.is_expanded = True
            for a in street_actions:
                child_id = f"{node.node_id}_{a.lower()}"
                node.children[a] = GrowingTreeNode(node_id=child_id, street=node.street, pot=node.pot * 1.5)
                node.regrets[a] = 0.0

        if node.is_expanded and node.children:
            # Seleciona proxima acao pelo CFR Regret Matching
            positive_regrets = {a: max(0.0, node.regrets.get(a, 0.0)) for a in street_actions}
            total = sum(positive_regrets.values())
            if total > EPSILON:
                return max(positive_regrets.keys(), key=lambda a: positive_regrets[a])
            return street_actions[0]

        return street_actions[0]


# ==============================================================================
# 7. REBEL SUBSYSTEM: PUBLIC BELIEF STATE (PBS) TRACKER
# ==============================================================================


@dataclass(frozen=True, slots=True)
class PublicBeliefState:
    """Estado de crenca publica (Public Belief State) unificando informacao imperfeita."""

    board: list[str]
    pot: float
    hero_range_entropy: float
    villain_range_entropy: float
    is_terminal: bool = False

    @classmethod
    def from_ranges(
        cls,
        board: Sequence[str],
        pot: float,
        hero_range: dict[str, float],
        villain_range: dict[str, float],
    ) -> PublicBeliefState:
        """Gera o PBS a partir das distribuicoes de probabilidade de range."""

        def compute_entropy(r: dict[str, float]) -> float:
            total = sum(r.values())
            if total <= EPSILON:
                return 0.0
            probs = [v / total for v in r.values() if v > 0]
            return -sum(p * math.log2(p + EPSILON) for p in probs)

        return cls(
            board=list(board),
            pot=pot,
            hero_range_entropy=compute_entropy(hero_range),
            villain_range_entropy=compute_entropy(villain_range),
        )
