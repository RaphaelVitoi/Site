"""
Testes unitarios para calculos de Reverse Implied Odds (RIO).
"""

import pytest

from engine.math_rio import calculate_rio_risk, get_bb_vs_utg_rio_table


def test_rio_risk_calculation():
    """Valida o calculo basico de risco RIO para uma decisao limiar (CALL)."""
    # Cenario: Hero investiu 4bb num pote de 8bb, com 30bb de stack.
    # rio_mw = 0 (HU)
    # gravity = ln(8/7.5) = 0.0645
    # pot_entrapment = ((4 + 4) / 30) * (1 + 0.0645 * 0.1) = 0.2683
    # rio_tension = 0.006 + (0.2683 * 1.25) = 0.3414
    # 0.3414 < 0.6 -> CALL
    risk = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "CALL"
    assert risk["rio_risk_score"] == pytest.approx(0.341, abs=1e-3)


def test_rio_risk_high_passivity_low_odds():
    """Valida o risco RIO em um cenario passivo (baixo odds) proximo a insolvencia."""
    # Cenario: ATo com 15bb, enfrentando aposta de 5bb num pote de 10bb.
    # gravity = ln(10/7.5) = 0.2877
    # pot_entrapment = ((1.5 + 5.0) / 15) * (1 + 0.2877 * 0.1) = 0.4333 * 1.02877 = 0.4458
    # downward_drift = 1.25 (OOP)
    # rio_tension = 0.006 + (0.4458 * 1.25) = 0.5632
    # 0.5632 < 0.6 -> CALL (Proximo do teto de insolvencia)
    risk = calculate_rio_risk(1.5, 10.0, 15.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "CALL"
    assert risk["rio_risk_score"] == pytest.approx(0.563, abs=1e-3)


def test_table_generation():
    """Testa se a tabela de perigos do RIO e gerada corretamente."""
    table = get_bb_vs_utg_rio_table()
    assert len(table) == 3
    assert table[0]["hand"] == "KJo"
