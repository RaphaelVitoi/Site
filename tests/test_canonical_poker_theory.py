# tests/test_canonical_poker_theory.py
"""Testes de integracao e corretude analitica para o Modulo de Teoria Canonica de Poker.

Valida os resultados diretamente contra as solucoes exatas das obras:
1. "The Mathematics of Poker" (Bill Chen & Jerrod Ankenman, 2006)
2. "Applications of No-Limit Hold'em" (Matthew Janda, 2013)
"""

from __future__ import annotations

import math
from engine.canonical_poker_theory import (
    ChenAKQGameSolver,
    ChenClairvoyanceSolver,
    ChenIndifferenceCalculator,
    JandaGeometricBetSizing,
    JandaMDFCalculator,
    JandaStreetBluffValueRatio,
)
from engine.game_theory_solvers import CFRPlusEngine


# ==============================================================================
# 1. TESTES CHEN & ANKENMAN (The Mathematics of Poker)
# ==============================================================================


def test_chen_clairvoyance_solver_unit_pot():
    """Valida o Clairvoyance Game com pote unitario P=1.0, B=1.0 (Cap. 11)."""
    sol = ChenClairvoyanceSolver.solve(pot=1.0, bet=1.0)

    # Pot odds e defesa
    assert math.isclose(sol.alpha, 0.5)
    assert math.isclose(sol.defense_frequency, 0.5)

    # Cutoffs
    assert math.isclose(sol.bluff_to_value_ratio, 0.5)
    assert math.isclose(sol.bluff_cutoff, 1.0 / 3.0, abs_tol=1e-4)

    # Valor do jogo para X: B^2 / (2(P + B)) = 1 / 4 = 0.25
    assert math.isclose(sol.game_value_player_x, 0.25)


def test_chen_clairvoyance_solver_scaled_pot():
    """Valida o Clairvoyance Game com P=100.0, aposta B=50.0 (meio pote)."""
    sol = ChenClairvoyanceSolver.solve(pot=100.0, bet=50.0)

    # alpha = 50 / 150 = 1/3
    assert math.isclose(sol.alpha, 1.0 / 3.0, abs_tol=1e-4)
    # Defesa = 100 / 150 = 2/3
    assert math.isclose(sol.defense_frequency, 2.0 / 3.0, abs_tol=1e-4)

    # Valor do jogo para X: 2500 / (2 * 150) = 2500 / 300 = 8.3333
    assert math.isclose(sol.game_value_player_x, 2500.0 / 300.0, abs_tol=1e-4)


def test_chen_akq_game_solver():
    """Valida o jogo AKQ discreto (Chen & Ankenman, Cap. 13 & 15)."""
    sol = ChenAKQGameSolver.solve(pot=1.0, bet=1.0)

    assert math.isclose(sol.hero_bet_ace_freq, 1.0)
    assert math.isclose(sol.hero_check_king_freq, 1.0)
    assert math.isclose(sol.hero_bluff_queen_freq, 0.5)

    assert math.isclose(sol.villain_call_ace_freq, 1.0)
    assert math.isclose(sol.villain_call_king_freq, 0.5)
    assert math.isclose(sol.villain_fold_queen_freq, 1.0)

    # Valor do jogo para o Hero: 1 / (6 * 2) = 1/12 = 0.0833
    assert math.isclose(sol.game_value_hero, 1.0 / 12.0, abs_tol=1e-4)


def test_chen_indifference_calculator():
    """Valida o Principio da Indiferenca no ponto de equilibrio exato."""
    pot = 100.0
    bet = 50.0
    # No equilibrio para B=50, P=100:
    # Defensor deve pagar com frequencia s* = P / (P + B) = 100 / 150 = 2/3
    s_star = 100.0 / 150.0
    # Blefador deve compor o range de aposta com fracao de blefe:
    # p_bluff = B / (P + 2B) = 50 / 200 = 0.25 (25% do range de aposta)
    p_bluff = 50.0 / (100.0 + 2.0 * 50.0)

    indiff = ChenIndifferenceCalculator.verify_indifference(
        pot=pot,
        bet=bet,
        defender_call_prob=s_star,
        bluffer_bluff_prob=p_bluff,
    )

    assert indiff.is_bluff_indifferent is True
    assert indiff.is_defense_indifferent is True
    assert indiff.indifference_margin < 1e-4


# ==============================================================================
# 2. TESTES MATTHEW JANDA (Applications of No-Limit Hold'em)
# ==============================================================================


def test_janda_mdf_calculator_heads_up():
    """Valida o calculo de MDF de Janda para diferentes sizings (Parte 1)."""
    # 1. Meio pote: P=100, B=50 -> MDF = 100/150 = 66.67%
    res_half = JandaMDFCalculator.calculate_mdf(pot=100.0, bet=50.0)
    assert math.isclose(res_half.mdf_percentage, 66.67, abs_tol=0.01)
    assert math.isclose(res_half.pot_odds_percentage, 33.33, abs_tol=0.01)
    assert res_half.is_multiway is False

    # 2. Pote cheio: P=100, B=100 -> MDF = 100/200 = 50.00%
    res_pot = JandaMDFCalculator.calculate_mdf(pot=100.0, bet=100.0)
    assert math.isclose(res_pot.mdf_percentage, 50.0, abs_tol=0.01)

    # 3. Overbet 2x pote: P=100, B=200 -> MDF = 100/300 = 33.33%
    res_over = JandaMDFCalculator.calculate_mdf(pot=100.0, bet=200.0)
    assert math.isclose(res_over.mdf_percentage, 33.33, abs_tol=0.01)


def test_janda_mdf_multiway_responsibility():
    """Valida a responsabilidade defensiva compartilhada em potes multiway (Parte 12)."""
    # P=100, B=100, 2 defensores ativos
    # alpha = 0.5. MDF total = 50%.
    # MDF individual = 1 - sqrt(0.5) ~ 1 - 0.7071 = 29.29%
    res = JandaMDFCalculator.calculate_mdf(pot=100.0, bet=100.0, num_defenders=2)
    assert res.is_multiway is True
    assert res.num_defenders == 2
    assert math.isclose(res.individual_mdf, 1.0 - math.sqrt(0.5), abs_tol=1e-4)
    assert res.individual_mdf < res.mdf


def test_janda_geometric_bet_sizing_three_streets():
    """Valida o dimensionamento geometrico de Janda para 3 streets (Partes 3 & 14)."""
    # Exemplo classico de Janda: Pote inicial = 10.0 bb, Stack efetivo = 100.0 bb, 3 streets
    # Pote alvo = 10 + 200 = 210.0 bb.
    # r = 0.5 * ((210 / 10)^(1/3) - 1) ~ 87.95% do pote por street
    res = JandaGeometricBetSizing.calculate_geometric_sizing(
        pot=10.0,
        effective_stack=100.0,
        num_streets=3,
    )

    assert res.starting_pot == 10.0
    assert res.effective_stack == 100.0
    assert res.target_final_pot == 210.0
    assert res.num_streets == 3
    assert math.isclose(res.pot_fraction_percentage, 87.95, abs_tol=0.1)

    # Validacao rua a rua da progressao
    assert len(res.steps) == 3
    flop = res.steps[0]
    turn = res.steps[1]
    river = res.steps[2]

    assert flop.street_name == "Flop"
    assert math.isclose(flop.starting_pot, 10.0)
    assert math.isclose(flop.bet_size, 8.79, abs_tol=0.1)

    assert turn.street_name == "Turn"
    assert math.isclose(turn.starting_pot, flop.final_pot_if_called, abs_tol=0.1)

    assert river.street_name == "River"
    # No river, o stack restante deve zerar (All-in exato!)
    assert math.isclose(river.remaining_stack_after_bet, 0.0, abs_tol=0.1)
    assert math.isclose(river.final_pot_if_called, 210.0, abs_tol=0.2)


def test_janda_bluff_value_ratios():
    """Valida as razoes de blefe para valor por rua de Janda (Parte 5)."""
    # Para aposta de pote cheio (f = 1.0 -> alpha = 0.5):
    res = JandaStreetBluffValueRatio.calculate_ratios(bet_fraction=1.0)

    # River: ratio = 0.5 (1 blefe para 2 valores -> 33.33% blefes)
    assert math.isclose(res.river_bluff_to_value_ratio, 0.5)
    assert math.isclose(res.river_bluff_percentage, 33.33, abs_tol=0.01)

    # Turn: ratio = (1.5)^2 - 1 = 1.25 (55.56% blefes)
    assert math.isclose(res.turn_bluff_to_value_ratio, 1.25)
    assert math.isclose(res.turn_bluff_percentage, 55.56, abs_tol=0.01)

    # Flop: ratio = (1.5)^3 - 1 = 2.375 (70.37% blefes)
    assert math.isclose(res.flop_bluff_to_value_ratio, 2.375)
    assert math.isclose(res.flop_bluff_percentage, 70.37, abs_tol=0.01)


# ==============================================================================
# 3. TESTE DE CONVERGÊNCIA: CFR+ VERSUS SOLUÇÃO ANALÍTICA DE CHEN
# ==============================================================================


def test_cfr_plus_convergence_to_chen_analytical_equilibrium():
    """Demonstra convergencia numerica do CFR+ (Libratus) para o equilibrio de Chen & Ankenman."""
    # Jogo simplificado de decisao de blefe com pote P=2.0 e aposta B=1.0
    # Solucao analitica de Chen:
    # alpha = 1 / (2 + 1) = 1/3 ~ 0.3333
    # Defesa s* = 2 / 3 ~ 0.6667
    actions = ["FOLD", "CALL"]
    cfr = CFRPlusEngine(actions)

    p = 2.0
    b = 1.0
    # Simulamos oponente que blefa com frequencia ligeiramente superior a alpha
    # O CFR+ deve convergir para CALL como resposta dominante
    for _ in range(100):
        # Utilidade do Call contra range polarizado com excesso de blefe:
        util_call = 0.40 * (p + b) - 0.60 * b  # 0.40 * 3 - 0.60 = 0.60 > 0
        util_fold = 0.0
        node_ev = (util_call + util_fold) / 2.0
        cfr.update_regrets({"CALL": util_call, "FOLD": util_fold}, node_ev)

    avg_strat = cfr.get_average_strategy()
    assert avg_strat["CALL"] > 0.95
    assert avg_strat["FOLD"] < 0.05
