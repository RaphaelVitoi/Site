from engine.math_rio import calculate_rio_risk, get_bb_vs_utg_rio_table


def test_rio_risk_calculation():
    # KJo vs UTG (High Passivity)
    risk = calculate_rio_risk(4.0, 0.45, 0.8, hero_position="BB", active_players=2)
    # RIO_Factor = 0.8 * (1 - 0.45) = 0.8 * 0.55 = 0.44
    # Risk_Score = 0.44 / 4.0 = 0.11 -> Threshold is 0.25 for FOLD?
    # Wait, 0.11 < 0.25 should be CALL.
    assert risk["decision"] == "CALL"


def test_rio_risk_high_passivity_low_odds():
    # ATo with low pot odds and high passivity
    risk = calculate_rio_risk(1.5, 0.52, 0.9, hero_position="BB", active_players=2)
    # RIO_Factor = 0.9 * 0.48 = 0.432
    # Score = 0.432 / 1.5 = 0.288 > 0.25 => FOLD
    assert risk["decision"] == "FOLD"


def test_table_generation():
    table = get_bb_vs_utg_rio_table()
    assert len(table) == 3
    assert table[0]["hand"] == "KJo"
