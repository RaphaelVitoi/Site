import pytest

from engine.math_rio import calculate_rio_risk, get_bb_vs_utg_rio_table


def test_rio_risk_calculation():
    # Cenário: Hero investiu 4bb num pote de 8bb, com 30bb de stack.
    # rio_mw = 4 * 0.15 * 1^2 = 0.6
    # pot_entrapment = (4 + 4) / 30 = 0.266
    # rio_tension = (0.6 / 100) + (0.266 * 1.25) = 0.006 + 0.3325 = 0.3385
    # 0.3385 < 0.6 -> CALL
    risk = calculate_rio_risk(4.0, 8.0, 30.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "CALL"
    assert risk["rio_risk_score"] == pytest.approx(0.339, abs=1e-3)


def test_rio_risk_high_passivity_low_odds():
    # Cenário: ATo com 15bb, enfrentando aposta de 5bb num pote de 10bb.
    # rio_mw = 1.5 * 0.15 = 0.225
    # pot_entrapment = (1.5 + 5.0) / 15 = 0.433
    # downward_drift = 1.25 (OOP)
    # rio_tension = 0.00225 + (0.433 * 1.25) = 0.00225 + 0.541 = 0.543
    # 0.543 < 0.6 -> CALL (Mas próximo do limite de FOLD)
    risk = calculate_rio_risk(1.5, 10.0, 15.0, hero_position="BB", active_players=2)
    assert risk["decision"] == "CALL"
    assert risk["rio_risk_score"] == pytest.approx(0.544, abs=1e-3)


def test_table_generation():
    table = get_bb_vs_utg_rio_table()
    assert len(table) == 3
    assert table[0]["hand"] == "KJo"
