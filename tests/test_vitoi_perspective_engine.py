"""Testes unitários rigorosos para o motor VitoiPerspectiveEngine (PMev / Teoria dos Jogos SOTA)."""

import pytest
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine


class TestVitoiPerspectiveEngine:
    """Suíte de testes de validação dos axiomas matemáticos de VitoiPerspectiveEngine."""

    def test_calculate_dynamic_ev_fold_utg_penalty(self):
        """Valida que a posição UTG aplica a penalidade posicional de 0.5."""
        ev_btn = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
            base_antes=1.0,
            time_to_blind_minutes=10.0,
            payjump_proximity_factor=0.5,
            position="BTN",
        )
        ev_utg = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
            base_antes=1.0,
            time_to_blind_minutes=10.0,
            payjump_proximity_factor=0.5,
            position="UTG",
        )
        # UTG deve ser 0.5 menor que BTN
        assert round(ev_btn - ev_utg, 4) == 0.5

    def test_calculate_dynamic_ev_fold_time_penalty(self):
        """Valida a penalidade de tempo quando faltam <= 3 minutos para o aumento de blinds."""
        ev_normal = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
            base_antes=1.0,
            time_to_blind_minutes=5.0,
            payjump_proximity_factor=0.5,
            position="BTN",
        )
        ev_urgent = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
            base_antes=1.0,
            time_to_blind_minutes=1.0,
            payjump_proximity_factor=0.5,
            position="BTN",
        )
        # Com 1 min restando, penalidade = (3.0 - 1.0) * 0.25 = 0.5
        assert round(ev_normal - ev_urgent, 4) == 0.5

    def test_calculate_structural_liability_single_vs_multiway(self):
        """Valida crescimento exponencial (x^2) de RIO em potes multiway."""
        base_rio = 1.5
        rio_heads_up = VitoiPerspectiveEngine.calculate_structural_liability(1, base_rio)
        rio_3way = VitoiPerspectiveEngine.calculate_structural_liability(3, base_rio)
        
        assert rio_heads_up == base_rio
        assert rio_3way == round(base_rio * (3 ** 2), 4)

    def test_calculate_edge_amortization_boundaries(self):
        """Valida amortização de edge conforme a profundidade de stack."""
        assert VitoiPerspectiveEngine.calculate_edge_amortization(0.0, 1.5, 2.0) == 0.0
        
        edge_10bb = VitoiPerspectiveEngine.calculate_edge_amortization(10.0, 1.0, 1.0)
        edge_100bb = VitoiPerspectiveEngine.calculate_edge_amortization(100.0, 1.0, 1.0)
        
        assert edge_100bb > edge_10bb

    def test_calculate_utility_prospect_theory(self):
        """Valida assimetria da Teoria do Prospecto (Kahneman-Tversky): Loss(X) > Gain(X)."""
        loss_aversion = 2.25
        gain_utility = VitoiPerspectiveEngine.calculate_utility(10.0, loss_aversion)
        loss_utility = VitoiPerspectiveEngine.calculate_utility(-10.0, loss_aversion)
        
        assert gain_utility > 0
        assert loss_utility < 0
        assert abs(loss_utility) > gain_utility

    def test_simulate_decision_tree_high_equity_scenario(self):
        """Simula árvore de decisão com alta equidade e valida preferência por RAISE/CALL."""
        result = VitoiPerspectiveEngine.simulate_decision_tree(
            equity=0.85,
            pot_size=20.0,
            stack_eff=50.0,
            active_players=2,
            street_idx=0,
            hero_invested=2.0,
            ev_fold_dynamic=-1.0,
            structural_liability=0.5,
            valuation_stack=1.0,
            amortized_edge=1.2,
            aggression_factor=2.0,
            realization_factor=1.1,
        )
        assert result["best_action"] in ["RAISE", "CALL"]
        assert result["pm_best"] > result["pm_fold"]
        assert 0.0 <= float(result["p_best_outcome"]) <= 1.0

    def test_simulate_decision_tree_low_equity_scenario(self):
        """Simula árvore de decisão com baixa equidade e passivo estrutural alto forçando FOLD."""
        result = VitoiPerspectiveEngine.simulate_decision_tree(
            equity=0.05,
            pot_size=10.0,
            stack_eff=20.0,
            active_players=4,
            street_idx=0,
            hero_invested=2.0,
            ev_fold_dynamic=0.5,
            structural_liability=15.0,
            valuation_stack=1.0,
            amortized_edge=0.5,
            aggression_factor=0.5,
            realization_factor=0.4,
            fold_equity=0.0,
        )
        assert result["best_action"] == "FOLD"

    def test_get_mathematical_perspective_legacy_wrapper(self):
        """Valida o wrapper legado get_mathematical_perspective."""
        pm = VitoiPerspectiveEngine.get_mathematical_perspective(
            equity=0.60,
            realization_factor=1.0,
            valuation_stack=1.0,
            ev_fold_dynamic=-1.0,
            structural_liability=0.5,
            stack_depth_bb=30.0,
        )
        assert isinstance(pm, float)
