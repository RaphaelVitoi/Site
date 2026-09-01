"""Testes unitarios rigorosos para o motor VitoiPerspectiveEngine (PMev / Teoria dos Jogos SOTA)."""

from __future__ import annotations

import pytest

from engine.vitoi_perspective_engine import (
    DynamicFoldEngine,
    HandContext,
    PerspectiveActionEvaluator,
    ProspectRiskEngine,
    RiskContext,
    TableState,
    VitoiPerspectiveEngine,
)


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
        eq_flop = VitoiPerspectiveEngine.calculate_static_overpair_decay(
            eq_preflop, street_idx=1, board_connectedness=0.8, active_opponents=3
        )
        eq_turn = VitoiPerspectiveEngine.calculate_static_overpair_decay(
            eq_preflop, street_idx=2, board_connectedness=0.8, active_opponents=3
        )
        eq_river = VitoiPerspectiveEngine.calculate_static_overpair_decay(
            eq_preflop, street_idx=3, board_connectedness=0.8, active_opponents=3
        )

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

    def test_calculate_utg_disguised_open_ev(self):
        """Valida o Teorema 5: Open Disfarcado do UTG & Escudo de Transito."""
        res_with_shield = VitoiPerspectiveEngine.calculate_utg_disguised_open_ev(
            hero_stack_bb=25.0,
            hero_open_size_bb=2.0,
            dead_money_bb=2.5,
            num_players_behind=7,
            short_stacks_behind_count=2,
            hero_equity_vs_bb=0.62,
        )
        res_no_shield = VitoiPerspectiveEngine.calculate_utg_disguised_open_ev(
            hero_stack_bb=25.0,
            hero_open_size_bb=2.0,
            dead_money_bb=2.5,
            num_players_behind=7,
            short_stacks_behind_count=0,
            hero_equity_vs_bb=0.62,
        )
        assert res_with_shield["transit_shield_active"] == 1.0
        assert res_no_shield["transit_shield_active"] == 0.0
        # O escudo de transito suprime a 3-bet e eleva o EV liquido do open
        assert res_with_shield["prob_3bet_absorbed"] < res_no_shield["prob_3bet_absorbed"]
        assert res_with_shield["net_ev_open"] > res_no_shield["net_ev_open"]
        assert res_with_shield["open_approved"] == 1.0

    def test_calculate_check_condensation_and_ip_aggression(self):
        """Valida o Teorema 8: Poda Bipolar do Check e Meiuca Condensada."""
        # 1. OOP checa 100% (Range nao-capado / "quem checa tudo, tem tudo")
        res_pure = VitoiPerspectiveEngine.calculate_check_condensation_and_ip_aggression(
            oop_check_strategy_pct=1.0,
            is_multiway=True,
            pot_size=15.0,
        )
        assert res_pure["is_pure_range_check"] == 1.0
        assert res_pure["oop_range_capped"] == 0.0
        assert res_pure["uncapped_retention"] == 1.0
        assert res_pure["recommended_ip_bet_frequency"] <= 0.40

        # 2. OOP checa parcialmente (Range capado na meiuca)
        res_capped = VitoiPerspectiveEngine.calculate_check_condensation_and_ip_aggression(
            oop_check_strategy_pct=0.60,
            is_multiway=False,
            pot_size=15.0,
            board_texture_wetness=0.8,
        )
        assert res_capped["is_pure_range_check"] == 0.0
        assert res_capped["oop_range_capped"] == 1.0
        assert res_capped["uncapped_retention"] < 0.30
        assert res_capped["recommended_ip_bet_frequency"] > 0.50

    def test_evaluate_vitoi_theorems_synthesis(self):
        """Valida o diagnostico unificado dos 10 Teoremas da PMev."""
        report = VitoiPerspectiveEngine.evaluate_vitoi_theorems(
            equity=0.65,
            pot_size=18.0,
            stack_eff_bb=30.0,
            active_players=2,
            street_idx=0,
            position="BTN",
            bubble_factor=1.35,
        )
        assert "teorema_1_dynamic_ev_fold" in report
        assert "teorema_2_river_inversion" in report
        assert "teorema_3_thermodynamic_dissipation" in report
        assert "teorema_4_convex_speculation" in report
        assert "teorema_5_utg_disguised_open" in report
        assert "teorema_6_janda_vitoi_defense" in report
        assert "teorema_7_multiway_liability" in report
        assert "teorema_8_check_condensation" in report
        assert "teorema_9_overpair_decay" in report
        assert "teorema_10_dual_navigation_vector" in report
        assert "decision_tree_synthesis" in report
        assert report["recommended_action"] in ["RAISE", "CALL", "FOLD"]
        assert isinstance(report["pmev_value"], (int, float))

    # ==========================================================================
    # TESTES DEDICADOS DAS ETAPAS 1, 2 E 3 (TRIADE AXIOMATICA PMev)
    # ==========================================================================

    def test_ev_fold_monotonicity_with_blinds_proximity(self):
        """[Etapa 1] Garante que estar em Late Position retem mais equidade de fold que no UTG."""
        state = TableState(
            stacks=[25.0, 50.0, 15.0, 8.0],
            payouts=[1000.0, 600.0, 400.0],
            small_blind=0.5,
            big_blind=1.0,
            hero_index=0,
        )
        engine = DynamicFoldEngine(state)

        ev_fold_btn = engine.evaluate_dynamic_ev_fold(pos_from_bb=1)
        ev_fold_utg = engine.evaluate_dynamic_ev_fold(pos_from_bb=3)

        assert ev_fold_btn > ev_fold_utg

    def test_bystander_gain_elevates_fold_value_with_short_stacks(self):
        """[Etapa 1] Garante que a presenca de Short Stacks eleva o valor do Fold do Hero."""
        state_balanced = TableState(
            stacks=[30.0, 30.0, 30.0],
            payouts=[1000.0, 500.0],
            small_blind=0.5,
            big_blind=1.0,
            hero_index=0,
        )
        state_short_in_danger = TableState(
            stacks=[30.0, 56.0, 4.0],
            payouts=[1000.0, 500.0],
            small_blind=0.5,
            big_blind=1.0,
            hero_index=0,
        )

        gain_balanced = DynamicFoldEngine(state_balanced).calculate_bystander_collision_gain()
        gain_short = DynamicFoldEngine(state_short_in_danger).calculate_bystander_collision_gain()

        assert gain_short > gain_balanced

    def test_realization_factor_ip_superior_to_oop(self):
        """[Etapa 2] Garante que a realizacao de equidade em posicao (IP) e superior a fora de posicao (OOP)."""
        ctx_ip = HandContext(
            raw_equity=0.45,
            is_in_position=True,
            spr=3.5,
            num_opponents=1,
            hand_playability_index=1.0,
        )
        ctx_oop = HandContext(
            raw_equity=0.45,
            is_in_position=False,
            spr=3.5,
            num_opponents=1,
            hand_playability_index=1.0,
        )

        r_ip = PerspectiveActionEvaluator(ctx_ip).calculate_realization_factor()
        r_oop = PerspectiveActionEvaluator(ctx_oop).calculate_realization_factor()

        assert r_ip > r_oop

    def test_multiway_structural_liability_scales_quadratically(self):
        """[Etapa 2] Garante que o passivo de risco escala com N^2 conforme o numero de oponentes."""
        ctx_2opp = HandContext(raw_equity=0.35, is_in_position=True, spr=2.0, num_opponents=2)
        ctx_3opp = HandContext(raw_equity=0.35, is_in_position=True, spr=2.0, num_opponents=3)

        l_2opp = PerspectiveActionEvaluator(ctx_2opp).calculate_multiway_structural_liability(
            pot_size=12.0, hero_stack=25.0
        )
        l_3opp = PerspectiveActionEvaluator(ctx_3opp).calculate_multiway_structural_liability(
            pot_size=12.0, hero_stack=25.0
        )

        ratio = l_3opp / l_2opp
        expected_ratio = 9.0 / 4.0  # 2.25

        assert ratio == pytest.approx(expected_ratio, rel=1e-2)

    def test_prospect_theory_loss_aversion_ratio(self):
        """[Etapa 3] Garante que a perda e penalizada em razao de lambda = 2.25 sobre ganhos identicos."""
        engine = ProspectRiskEngine(
            RiskContext(
                delta_win_dollars=150.0,
                delta_lose_dollars=150.0,
                hero_edge=0.0,
                time_to_blind_increase=20,
                is_in_position=True,
                loss_aversion_lambda=2.25,
            )
        )

        u_win = engine.calculate_prospect_utility(150.0)
        u_lose = abs(engine.calculate_prospect_utility(-150.0))

        assert (u_lose / u_win) == pytest.approx(2.25, rel=1e-2)

    def test_edge_and_deep_structure_attenuates_risk_premium(self):
        """[Etapa 3] Garante que jogadores com alto Edge em estruturas lentas tem menor corte de equidade."""
        ctx_high_edge = RiskContext(
            delta_win_dollars=200.0,
            delta_lose_dollars=400.0,
            hero_edge=0.8,
            time_to_blind_increase=40,
            is_in_position=True,
        )
        ctx_low_edge = RiskContext(
            delta_win_dollars=200.0,
            delta_lose_dollars=400.0,
            hero_edge=-0.5,
            time_to_blind_increase=40,
            is_in_position=True,
        )

        req_high = ProspectRiskEngine(ctx_high_edge).evaluate_required_equilibrium_equity(raw_pot_odds=0.33)
        req_low = ProspectRiskEngine(ctx_low_edge).evaluate_required_equilibrium_equity(raw_pot_odds=0.33)

        assert req_high < req_low
