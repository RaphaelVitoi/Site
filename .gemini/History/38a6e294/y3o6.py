from engine.math_sota import calculate_geometric_sizing, cfr_mock_strategy


def test_geometric_sizing_returns_correct_fraction():
    # Pot: 100, Target Pot: 1000, Streets: 3 (Flop, Turn, River)
    fraction = calculate_geometric_sizing(100, 1000, 3)
    # Expected: (1000/100)^(1/3) = 2.154 => 1+2f = 2.154 => f = 0.577
    assert round(fraction, 3) == 0.577

def test_cfr_mock_strategy_balances_regrets():
    regrets = {"fold": 10.0, "call": 20.0, "raise": -5.0}
    strategy = cfr_mock_strategy(regrets)
    # Positive regrets: fold=10, call=20, raise=0. Total = 30.
    # fold: 10/30 = 0.333, call: 20/30 = 0.667
    assert round(strategy["fold"], 3) == 0.333
    assert round(strategy["call"], 3) == 0.667
    assert strategy["raise"] == 0.0
