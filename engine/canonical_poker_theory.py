# engine/canonical_poker_theory.py
"""Modulo Unificado de Teoria Canonica de Poker SOTA.

Fundamentado estritamente nas obras canonicas:
1. "The Mathematics of Poker" (Bill Chen & Jerrod Ankenman, 2006)
   - Cap. 11: Half-Street [0, 1] Games & Clairvoyance Game.
   - Cap. 13 & 15: O Jogo AKQ Discreto e No-Limit AKQ Game.
   - Cap. 26: Doubling-Up Tournament Model.
   - Cap. 29: Multiplayer Games ("Three's a Crowd") & Externalidades.

2. "Applications of No-Limit Hold'em" (Matthew Janda, 2013)
   - Parte 1: Minimum Defense Frequency (MDF = 1 - alpha) e Indiferenca.
   - Partes 3 & 14: Dimensionamento Geometrico de Apostas (Multi-Street Geometric Sizing).
   - Parte 5: Proporcoes Otima de Blefe para Valor por Rua (Flop, Turn, River).
   - Parte 12: Responsabilidade Defensiva Compartilhada em Potes Multiway.

Protocolo Chico SOTA v8.0 GOLD -- Tipagem Estrita PEP 585/604 & Zero-Any.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Final

EPSILON: Final[float] = 1e-12


# ==============================================================================
# 1. CHEN & ANKENMAN: THE MATHEMATICS OF POKER (2006)
# ==============================================================================


@dataclass(frozen=True, slots=True)
class ClairvoyanceSolution:
    """Solucao analitica exata para o Clairvoyance Game (Chen & Ankenman, Cap. 11).

    O Jogador X conhece a mao de Y ou detem informacao perfeita sobre a distribuicao.
    Distribui maos continuas em [0, 1], onde 1 e o topo absoluto (nuts) e 0 e lixo puro.
    """

    pot: float
    bet: float
    alpha: float
    defense_frequency: float
    value_bet_cutoff: float
    bluff_cutoff: float
    game_value_player_x: float
    bluff_to_value_ratio: float


class ChenClairvoyanceSolver:
    """Solucionador analitico para Jogos de Meia-Rua e Clairvoyance (Cap. 11)."""

    @staticmethod
    def solve(pot: float, bet: float) -> ClairvoyanceSolution:
        r"""Calcula o equilibrio de Nash em forma fechada.

        Pot odds oferecidas ao defensor:
        $$\alpha = \frac{B}{P + B}$$

        Frequencia de defesa indiferente do defensor Y:
        $$s^* = \frac{P}{P + B} = 1 - \alpha$$

        No jogo [0, 1], se X aposta com valor nas melhores maos $[1 - a, 1]$
        e blefa com as piores $[0, b]$, a razao otima e $b = \alpha \cdot a$.
        Para a aposta com todo o range de valor viavel, o valor do jogo para X e:
        $$V(X) = \frac{B^2}{2(P + B)}$$
        """
        p = max(EPSILON, pot)
        b = max(EPSILON, bet)

        alpha = b / (p + b)
        defense_freq = p / (p + b)

        # Regiao de valor e blefe no espaco normalizado [0, 1]
        # Se X aposta por valor o topo 1 - a (ex: a = 1 / (1 + alpha))
        value_fraction = 1.0 / (1.0 + alpha)
        bluff_fraction = alpha / (1.0 + alpha)

        value_cutoff = 1.0 - value_fraction
        bluff_cutoff = bluff_fraction

        game_value = (b**2) / (2.0 * (p + b))

        return ClairvoyanceSolution(
            pot=p,
            bet=b,
            alpha=round(alpha, 6),
            defense_frequency=round(defense_freq, 6),
            value_bet_cutoff=round(value_cutoff, 6),
            bluff_cutoff=round(bluff_cutoff, 6),
            game_value_player_x=round(game_value, 6),
            bluff_to_value_ratio=round(alpha, 6),
        )


@dataclass(frozen=True, slots=True)
class AKQGameSolution:
    """Solucao analitica do jogo discreto AKQ (Chen & Ankenman, Cap. 13 & 15).

    Baralho simplificado: 1 As, 1 Rei, 1 Dama.
    Hero (X) e Villain (Y) recebem 1 carta cada; 1 carta fica oculta.
    """

    pot: float
    bet: float
    hero_bet_ace_freq: float
    hero_check_king_freq: float
    hero_bluff_queen_freq: float
    villain_call_ace_freq: float
    villain_call_king_freq: float
    villain_fold_queen_freq: float
    game_value_hero: float


class ChenAKQGameSolver:
    """Solucionador analitico para o Jogo AKQ Canônico."""

    @staticmethod
    def solve(pot: float, bet: float = 1.0) -> AKQGameSolution:
        r"""Calcula o equilibrio de Nash do jogo AKQ classico.

        Hero:
        - As: aposta sempre (100% de frequencia de valor).
        - Rei: passa sempre (100% de showdown value).
        - Dama: blefa com frequencia $\alpha = \frac{B}{P + B}$.

        Villain:
        - As: paga sempre (100%).
        - Rei: paga com frequencia $c = \frac{P}{P + B} = 1 - \alpha$.
        - Dama: desiste sempre (100%).

        Valor do jogo para Hero (em potes normais):
        $$V(\text{Hero}) = \frac{B}{6 \cdot (P + B)} \cdot B = \frac{B^2}{6(P + B)}$$
        """
        p = max(EPSILON, pot)
        b = max(EPSILON, bet)

        alpha = b / (p + b)
        call_king_freq = p / (p + b)

        # Ganho marginal do Hero pelo blefe balanceado
        hero_value = (b**2) / (6.0 * (p + b))

        return AKQGameSolution(
            pot=p,
            bet=b,
            hero_bet_ace_freq=1.0,
            hero_check_king_freq=1.0,
            hero_bluff_queen_freq=round(alpha, 6),
            villain_call_ace_freq=1.0,
            villain_call_king_freq=round(call_king_freq, 6),
            villain_fold_queen_freq=1.0,
            game_value_hero=round(hero_value, 6),
        )


@dataclass(frozen=True, slots=True)
class IndifferenceAnalysis:
    """Verificacao do principio da indiferenca de Chen & Ankenman."""

    ev_bluff: float
    ev_check_giveup: float
    is_bluff_indifferent: bool
    ev_call_bluffcatcher: float
    ev_fold_bluffcatcher: float
    is_defense_indifferent: bool
    indifference_margin: float


class ChenIndifferenceCalculator:
    """Calculador de pontos de indiferenca no equilibrio de Nash."""

    @staticmethod
    def verify_indifference(
        pot: float,
        bet: float,
        defender_call_prob: float,
        bluffer_bluff_prob: float,
    ) -> IndifferenceAnalysis:
        r"""Verifica as condicoes de indiferenca de Nash:

        Para o atacante que blefa:
        $$EV(\text{Bluff}) = (1 - s) \cdot \text{Pot} - s \cdot \text{Bet}$$
        $$EV(\text{Check}) = 0$$

        Para o defensor com bluffcatcher enfrentando aposta B no pote P:
        A probabilidade de que o oponente esteja blefando (frequencia de blefe no range de aposta) e p_bluff.
        No equilibrio, p_bluff = B / (P + 2B) = alpha / (1 + alpha).
        $$EV(\text{Call}) = p_{\text{bluff}} \cdot (\text{Pot} + \text{Bet}) - (1 - p_{\text{bluff}}) \cdot \text{Bet}$$
        $$EV(\text{Fold}) = 0$$
        """
        # EV do blefe para o atacante
        ev_bluff = ((1.0 - defender_call_prob) * pot) - (defender_call_prob * bet)
        ev_check = 0.0

        # EV do call para o defensor com bluffcatcher
        # bluffer_bluff_prob representa a fracao de blefes no range total de aposta: P(Blefe | Aposta)
        ev_call = (bluffer_bluff_prob * (pot + bet)) - ((1.0 - bluffer_bluff_prob) * bet)
        ev_fold = 0.0

        margin_bluff = abs(ev_bluff - ev_check)
        margin_call = abs(ev_call - ev_fold)

        return IndifferenceAnalysis(
            ev_bluff=round(ev_bluff, 6),
            ev_check_giveup=0.0,
            is_bluff_indifferent=math.isclose(ev_bluff, 0.0, abs_tol=1e-3),
            ev_call_bluffcatcher=round(ev_call, 6),
            ev_fold_bluffcatcher=0.0,
            is_defense_indifferent=math.isclose(ev_call, 0.0, abs_tol=1e-3),
            indifference_margin=round(max(margin_bluff, margin_call), 6),
        )


# ==============================================================================
# 2. MATTHEW JANDA: APPLICATIONS OF NO-LIMIT HOLD'EM (2013)
# ==============================================================================


@dataclass(frozen=True, slots=True)
class JandaMDFResult:
    """Resultado do calculo de Minimum Defense Frequency (Janda, Parte 1 e 12)."""

    pot: float
    bet: float
    alpha: float
    mdf: float
    mdf_percentage: float
    pot_odds_percentage: float
    is_multiway: bool
    num_defenders: int
    individual_mdf: float


class JandaMDFCalculator:
    """Calculador de Minimum Defense Frequency e Responsabilidade Multiway."""

    @staticmethod
    def calculate_mdf(pot: float, bet: float, num_defenders: int = 1) -> JandaMDFResult:
        r"""Calcula a frequencia minima de defesa canonica de Janda:

        $$\alpha = \frac{\text{Bet}}{\text{Pot} + \text{Bet}}$$
        $$\text{MDF} = 1 - \alpha = \frac{\text{Pot}}{\text{Pot} + \text{Bet}}$$

        Em potes multiway (Parte 12), para evitar sobredefesa coletiva:
        $$\text{MDF}_{\text{ind}} = 1 - \alpha^{1/k}$$
        onde $k$ e o numero de defensores ativos.
        """
        p = max(EPSILON, pot)
        b = max(EPSILON, bet)
        k = max(1, num_defenders)

        alpha = b / (p + b)
        mdf = p / (p + b)

        if k == 1:
            ind_mdf = mdf
        else:
            # Formula de responsabilidade compartilhada da Parte 12
            ind_mdf = 1.0 - math.pow(alpha, 1.0 / k)

        return JandaMDFResult(
            pot=p,
            bet=b,
            alpha=round(alpha, 6),
            mdf=round(mdf, 6),
            mdf_percentage=round(mdf * 100.0, 2),
            pot_odds_percentage=round(alpha * 100.0, 2),
            is_multiway=k > 1,
            num_defenders=k,
            individual_mdf=round(ind_mdf, 6),
        )


@dataclass(frozen=True, slots=True)
class GeometricStreetStep:
    """Passo individual de dimensionamento geometrico por rua."""

    street_index: int
    street_name: str
    starting_pot: float
    bet_size: float
    pot_fraction: float
    final_pot_if_called: float
    remaining_stack_after_bet: float


@dataclass(frozen=True, slots=True)
class JandaGeometricSizingResult:
    """Resultado do Dimensionamento Geometrico de Apostas (Janda, Partes 3 & 14)."""

    starting_pot: float
    effective_stack: float
    target_final_pot: float
    num_streets: int
    constant_pot_fraction: float
    pot_fraction_percentage: float
    steps: list[GeometricStreetStep]


class JandaGeometricBetSizing:
    """Algoritmo de Dimensionamento Geometrico Multi-Rua de Janda."""

    STREET_NAMES: Final[tuple[str, ...]] = ("Flop", "Turn", "River")

    @classmethod
    def calculate_geometric_sizing(
        cls,
        pot: float,
        effective_stack: float,
        num_streets: int = 3,
    ) -> JandaGeometricSizingResult:
        r"""Calcula a fracao constante do pote $r$ para colocar o oponente em All-in:

        $$(1 + 2r)^n = \frac{P + 2S}{P} \implies r = \frac{1}{2} \left[ \left(\frac{P + 2S}{P}\right)^{1/n} - 1 \right]$$
        """
        p = max(EPSILON, pot)
        s = max(EPSILON, effective_stack)
        n = max(1, num_streets)

        target_pot = p + (2.0 * s)
        growth_factor = target_pot / p
        r = 0.5 * (math.pow(growth_factor, 1.0 / n) - 1.0)

        steps: list[GeometricStreetStep] = []
        current_p = p
        current_s = s

        for i in range(n):
            name = cls.STREET_NAMES[i] if i < len(cls.STREET_NAMES) else f"Street_{i + 1}"
            bet_size = min(current_s, r * current_p)
            new_p = current_p + (2.0 * bet_size)
            new_s = max(0.0, current_s - bet_size)

            steps.append(
                GeometricStreetStep(
                    street_index=i + 1,
                    street_name=name,
                    starting_pot=round(current_p, 2),
                    bet_size=round(bet_size, 2),
                    pot_fraction=round(r, 4),
                    final_pot_if_called=round(new_p, 2),
                    remaining_stack_after_bet=round(new_s, 2),
                )
            )
            current_p = new_p
            current_s = new_s

        return JandaGeometricSizingResult(
            starting_pot=round(p, 2),
            effective_stack=round(s, 2),
            target_final_pot=round(target_pot, 2),
            num_streets=n,
            constant_pot_fraction=round(r, 6),
            pot_fraction_percentage=round(r * 100.0, 2),
            steps=steps,
        )


@dataclass(frozen=True, slots=True)
class JandaBluffRatioResult:
    """Proporcao equilibrada de blefe para valor por rua (Janda, Parte 5)."""

    bet_fraction_of_pot: float
    alpha: float
    river_bluff_to_value_ratio: float
    river_bluff_percentage: float
    turn_bluff_to_value_ratio: float
    turn_bluff_percentage: float
    flop_bluff_to_value_ratio: float
    flop_bluff_percentage: float


class JandaStreetBluffValueRatio:
    """Calculador de Ratios de Blefe/Valor para 1, 2 e 3 streets de valor (Parte 5)."""

    @staticmethod
    def calculate_ratios(bet_fraction: float) -> JandaBluffRatioResult:
        r"""Calcula as razoes de blefe por rua conforme a formulacao de Janda.

        Quando se aposta uma fracao $f$ do pote:
        $$\alpha = \frac{f}{1 + f}$$

        No River (1 street de valor):
        $$\text{Ratio}_{\text{river}} = \alpha$$
        $$\% \text{Blefes} = \frac{\alpha}{1 + \alpha} = \frac{f}{1 + 2f}$$

        No Turn (2 streets de valor):
        O range de aposta no Turn deve conter blefes suficientes para que, quando o adversario
        pagar e chegar ao river, tenhamos a proporcao correta de valor e blefe no river:
        $$\text{Ratio}_{\text{turn}} = (1 + \alpha)^2 - 1 = 2\alpha + \alpha^2$$

        No Flop (3 streets de valor):
        $$\text{Ratio}_{\text{flop}} = (1 + \alpha)^3 - 1$$
        """
        f = max(0.01, bet_fraction)
        alpha = f / (1.0 + f)

        # River
        r_river = alpha
        pct_river = r_river / (1.0 + r_river)

        # Turn
        r_turn = math.pow(1.0 + alpha, 2) - 1.0
        pct_turn = r_turn / (1.0 + r_turn)

        # Flop
        r_flop = math.pow(1.0 + alpha, 3) - 1.0
        pct_flop = r_flop / (1.0 + r_flop)

        return JandaBluffRatioResult(
            bet_fraction_of_pot=round(f, 4),
            alpha=round(alpha, 6),
            river_bluff_to_value_ratio=round(r_river, 4),
            river_bluff_percentage=round(pct_river * 100.0, 2),
            turn_bluff_to_value_ratio=round(r_turn, 4),
            turn_bluff_percentage=round(pct_turn * 100.0, 2),
            flop_bluff_to_value_ratio=round(r_flop, 4),
            flop_bluff_percentage=round(pct_flop * 100.0, 2),
        )
