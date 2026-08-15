"""Modulo de Perspectiva Matematica VITOI."""

import math


class VitoiPerspectiveEngine:
    """
    SOTA: Motor Hibrido de Perspectiva Matematica (VITOI 3.2).
    Substitui a metrica estatica de Pot Odds e o FGS Limitado pela Antevisao de Fluxo.
    """

    @staticmethod
    def calculate_dynamic_ev_fold(
        base_antes: float,
        time_to_blind_minutes: float,
        payjump_proximity_factor: float,
        position: str,
    ) -> float:
        """
        Calcula o baseline dinamico (Custo de Existencia na Orbita).
        :param base_antes: Custo base dos antes pagos na orbita.
        :param payjump_proximity_factor: 1.0 (longe) a 0.0 (bolha). Inverte a polaridade do EV fold.
        :param time_to_blind_minutes: Antevisao t-3. Acelera a erosao antecipada.
        :param position: A posicao atual do Hero na mesa (e.g. 'UTG', 'BB').
        """
        # Fator de Antevisao Posicional (UTG hoje -> BB amanha)
        positional_penalty = 0.5 if position.upper() == "UTG" else 0.0

        # Erosao Antecipada: Iminencia de salto de blinds encarece a espera
        time_penalty = 0.0
        if 0 < time_to_blind_minutes <= 3.0:
            time_penalty = (3.0 - time_to_blind_minutes) * 0.25

        # Efeito Payjump (Passivo Positivo): Passar a vez ganha utilidade
        payjump_bonus = (1.0 - payjump_proximity_factor) * 2.5

        # Baseline e -antes, ajustado pelas vetoriais sistemicas
        ev_fold = (-base_antes) - time_penalty - positional_penalty + payjump_bonus
        return round(ev_fold, 4)

    @staticmethod
    def calculate_structural_liability(multiway_opponents: int, base_rio: float) -> float:
        """
        O Passivo Estrutural de Colisao. Em Multiway, as Reverse Implied Odds
        crescem em coeficiente exponencial (x^2).
        """
        if multiway_opponents <= 1:
            return base_rio
        return round(base_rio * math.pow(multiway_opponents, 2), 4)

    @staticmethod
    def calculate_edge_amortization(
        stack_depth_bb: float, technical_superiority: float, human_noise_factor: float
    ) -> float:
        """
        Amortizacao de Edge pela Profundidade de Stack.
        A arvore de decisao colapsa logaritmicamente para a Invariancia de Nash em ~10bb.
        """
        if stack_depth_bb <= 0:
            return 0.0

        # Complexidade Sistemica: Poda da Arvore
        tree_complexity = math.log10(max(stack_depth_bb, 1.0))

        effective_edge = technical_superiority * tree_complexity
        capture_rate = human_noise_factor * 0.15  # Captura da taxa de 'besteira emocional'

        return round(effective_edge + capture_rate, 4)

    @classmethod
    def get_mathematical_perspective(
        cls,
        equity: float,
        realization_factor: float,
        valuation_stack: float,
        ev_fold_dynamic: float,
        structural_liability: float,
    ) -> float:
        """
        SINTESE FINAL: PM = [(Equity x R) x Valuation] - [EV_fold(t, d_pj, pos) + RIO_mw]
        Se o resultado for menor que 0, a acao representa Insolvencia Estrategica,
        mesmo que Pot Odds ou ChipEV puros digam o contrario.
        """
        base_value = (equity * realization_factor) * valuation_stack
        # O custo e a desistencia mais a vulnerabilidade invisivel
        cost_and_liability = ev_fold_dynamic + structural_liability

        return round(base_value - cost_and_liability, 4)
