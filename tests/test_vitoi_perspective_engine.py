"""Testes unitarios rigorosos para o motor VitoiPerspectiveEngine (PMev / Teoria dos Jogos SOTA)."""

from engine.vitoi_perspective_engine import VitoiPerspectiveEngine


class TestVitoiPerspectiveEngine:
    """Suite de testes de validacao dos axiomas matematicos de VitoiPerspectiveEngine."""

    def test_calculate_dynamic_ev_fold_utg_penalty(self):
        """Valida que a posicao UTG aplica a penalidade posicional de 0.5."""
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
        assert rio_3way == round(base_rio * (3**2), 4)

    def test_calculate_edge_amortization_boundaries(self):
        """Valida amortizacao de edge conforme a profundidade de stack."""
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
        """Simula arvore de decisao com alta equidade e valida preferencia por RAISE/CALL."""
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
        assert float(result["pm_best"]) > float(result["pm_fold"])
        assert 0.0 <= float(result["p_best_outcome"]) <= 1.0

    def test_simulate_decision_tree_low_equity_scenario(self):
        """Simula arvore de decisao com baixa equidade e passivo estrutural alto forcando FOLD."""
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

    def test_janda_vitoi_defense_exact_calculation(self):
        """Valida a deducao exata da Ponte Janda-Vitoi no River."""
        res = VitoiPerspectiveEngine.calculate_janda_vitoi_defense(
            pot_size=100.0,
            bet_size=100.0,
            bubble_factor=1.388,
        )
        assert res["equity_required_chipev"] == 0.3333
        assert res["mdf_chipev"] == 0.5000
        assert res["equity_required_pmev"] == 0.4097
        assert res["risk_premium_pp"] == 0.0763
        assert res["mdf_pmev"] == 0.5903

    def test_combinatorial_multiway_liability(self):
        """Valida calculo de passivo combinatorio K = n*(n-1)/2."""
        res_hu = VitoiPerspectiveEngine.calculate_combinatorial_multiway_liability(
            active_players=2,
            base_rio=1.0,
            equity=0.5,
        )
        assert res_hu == 0.5

        # 4-way: K = 4*3/2 = 6 interacoes
        res_4way = VitoiPerspectiveEngine.calculate_combinatorial_multiway_liability(
            active_players=4,
            base_rio=1.0,
            equity=0.5,
            bubble_factor_avg=1.5,
        )
        assert res_4way == round(1.0 * 6 * 0.5 * 1.5, 4)


    def test_calculate_negative_risk_premium_river(self):
        """Valida a deducao de Risk Premium Negativo (RP < 0) no River com micro-stack."""
        res = VitoiPerspectiveEngine.calculate_negative_risk_premium_river(
            pot_size=36.0,
            bet_size=4.0,
            residual_stack_bb=4.0,
            fold_survival_prob=0.025,
            call_win_survival_prob=0.380,
        )
        assert res["chipev_equity"] == 0.0909
        assert res["pmev_required_equity"] < res["chipev_equity"]
        assert res["risk_premium"] < 0.0
        assert res["is_negative_rp"] == 1.0
        assert res["bluffcatcher_call_mandatory"] == 1.0

    def test_calculate_symmetric_dissipation_vector(self):
        """Valida a conservacao e dissipacao simetrica da 1a Lei da Termodinamica do Poker."""
        stacks = [100.0, 50.0, 30.0, 20.0]
        # Jogador 3 (stack 20.0) perde 0.20 de perspectiva
        dissipation = VitoiPerspectiveEngine.calculate_symmetric_dissipation_vector(
            stacks=stacks,
            eliminated_idx=3,
            lost_perspective=0.20,
        )
        assert dissipation[3] == -0.20
        # A soma total da dissipacao deve ser identicamente 0.0 (Soma Zero no Simplex)
        assert round(sum(dissipation), 4) == 0.0
        # O Chip Leader (100.0) absorve a maior fatia da dissipacao
        assert dissipation[0] > dissipation[1] > dissipation[2]

    def test_calculate_convex_speculation_ev(self):
        """Valida o payoff hiper-convexo de especulacao barata contra o Chip Leader."""
        res = VitoiPerspectiveEngine.calculate_convex_speculation_ev(
            entry_cost_bb=2.0,
            prob_hit_cooler=0.15,
            current_title_prob=0.15,
            new_leader_title_prob=0.60,
        )
        assert res["linear_cost"] == -1.7
        assert res["perspective_jump"] == 0.45
        assert res["convex_payoff"] == 0.0675
        assert res["net_ev_speculation"] > 0.0
        assert res["speculation_approved"] == 1.0

    def test_calculate_static_overpair_decay(self):
        """Valida o decaimento entropico monotonico do Par de As (AA)."""
        eq_preflop = 0.85
        eq_flop = VitoiPerspectiveEngine.calculate_static_overpair_decay(eq_preflop, street_idx=1, board_connectedness=0.8, active_opponents=3)
        eq_turn = VitoiPerspectiveEngine.calculate_static_overpair_decay(eq_preflop, street_idx=2, board_connectedness=0.8, active_opponents=3)
        eq_river = VitoiPerspectiveEngine.calculate_static_overpair_decay(eq_preflop, street_idx=3, board_connectedness=0.8, active_opponents=3)

        assert eq_preflop > eq_flop > eq_turn > eq_river
        assert eq_river >= 0.15

    def test_calculate_dual_navigation_vector(self):
        """Valida a combinacao linear convexa do Vetor Duplo da PMev."""
        v_conservador = VitoiPerspectiveEngine.calculate_dual_navigation_vector(
            alpha_attack=0.10,
            expansion_title_value=0.80,
            conservation_survival_value=0.50,
        )
        v_agressivo = VitoiPerspectiveEngine.calculate_dual_navigation_vector(
            alpha_attack=0.90,
            expansion_title_value=0.80,
            conservation_survival_value=0.50,
        )
        assert v_agressivo > v_conservador
        assert round(v_conservador, 4) == 0.53
        assert round(v_agressivo, 4) == 0.77
