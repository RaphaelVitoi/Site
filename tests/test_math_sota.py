"""
Testes unitarios para os calculos numericos SOTA (Geometric Sizing, CFR).
Cobre casos base, edge cases e invariantes matematicos.
# ruff: noqa: I001
"""

import math

import pytest

from engine.math_sota import calculate_geometric_sizing, cfr_mock_strategy

# ==============================================================================
# calculate_geometric_sizing
# ==============================================================================


@pytest.mark.unit
def test_geometric_sizing_returns_correct_fraction() -> None:
    """Valida o fracionamento geometrico canonico: Pot=100, Target=1000, 3 streets."""
    # (1000/100)^(1/3) = 2.154 => 1+2f = 2.154 => f = 0.577
    fraction = calculate_geometric_sizing(100, 1000, 3)
    assert fraction == pytest.approx(0.577, abs=1e-3)


@pytest.mark.unit
def test_geometric_sizing_no_growth_needed() -> None:
    """Quando pot == target, a fracao geometrica deve ser 0 (sem bet necessaria)."""
    fraction = calculate_geometric_sizing(100, 100, 3)
    assert fraction == pytest.approx(0.0, abs=1e-6)


@pytest.mark.unit
def test_geometric_sizing_single_street() -> None:
    """Em 1 street, o sizing deve cobrir o alvo em uma unica aposta."""
    # (400/100)^(1/1) = 4.0 => f = (4-1)/2 = 1.5
    fraction = calculate_geometric_sizing(100, 400, 1)
    assert fraction == pytest.approx(1.5, abs=1e-3)


@pytest.mark.unit
@pytest.mark.parametrize(
    ("pot", "target", "streets"),
    [
        (100, 1000, 3),
        (50, 200, 2),
        (200, 800, 4),
    ],
)
def test_geometric_sizing_always_positive(pot: float, target: float, streets: int) -> None:
    """O fracionamento geometrico nunca deve ser negativo quando target >= pot."""
    assert calculate_geometric_sizing(pot, target, streets) >= 0.0


# ==============================================================================
# cfr_mock_strategy
# ==============================================================================


@pytest.mark.unit
def test_cfr_mock_strategy_balances_regrets() -> None:
    """Garante que a estrategia CFR lida corretamente com arrependimentos mistos."""
    regrets = {"fold": 10.0, "call": 20.0, "raise": -5.0}
    strategy = cfr_mock_strategy(regrets)
    # Positivos: fold=10, call=20, raise=0 (clamp). Total=30.
    assert strategy["fold"] == pytest.approx(0.333, abs=1e-3)
    assert strategy["call"] == pytest.approx(0.667, abs=1e-3)
    assert strategy["raise"] == pytest.approx(0.0, abs=1e-3)


@pytest.mark.unit
def test_cfr_mock_strategy_all_negative_regrets_uniform() -> None:
    """Quando todos os arrependimentos sao negativos, a estrategia deve ser uniforme."""
    regrets = {"fold": -10.0, "call": -5.0, "raise": -1.0}
    strategy = cfr_mock_strategy(regrets)
    n = len(regrets)
    for action, prob in strategy.items():
        assert prob == pytest.approx(1.0 / n, abs=1e-6), (
            f"Arrependimentos todos negativos devem gerar prob uniforme. Acao '{action}': {prob}"
        )


@pytest.mark.unit
def test_cfr_mock_strategy_probabilities_sum_to_one() -> None:
    """A soma das probabilidades da estrategia CFR deve ser exatamente 1.0."""
    regrets = {"fold": 5.0, "call": 15.0, "raise": 0.0}
    strategy = cfr_mock_strategy(regrets)
    assert math.isclose(sum(strategy.values()), 1.0, rel_tol=1e-9)


@pytest.mark.unit
def test_cfr_mock_strategy_single_positive_action_dominates() -> None:
    """Quando apenas uma acao tem regret positivo, ela recebe probabilidade 1.0."""
    regrets = {"fold": 100.0, "call": -50.0, "raise": -20.0}
    strategy = cfr_mock_strategy(regrets)
    assert strategy["fold"] == pytest.approx(1.0, abs=1e-6)
    assert strategy["call"] == pytest.approx(0.0, abs=1e-6)
    assert strategy["raise"] == pytest.approx(0.0, abs=1e-6)
