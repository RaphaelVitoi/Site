"""
Testes unitarios para a inferencia Bayesiana do motor SOTA.
Cobre os quadrantes da distribuicao Prior-Likelihood-Posterior.
"""

import pytest

from engine.math_sota import calculate_bayesian_win_prob


@pytest.mark.unit
@pytest.mark.parametrize(
    ("prior", "action", "description"),
    [
        (0.5, 0.8, "acao_forte_eleva_prob"),
        (0.5, 0.5, "acao_neutra_eleva_levemente"),  # acoes medianas ainda atualizam
        (0.9, 0.1, "acao_fraca_contra_prior_alto"),
        (0.1, 0.9, "acao_forte_contra_prior_baixo"),
    ],
)
def test_bayesian_update_returns_valid_probability(prior: float, action: float, description: str) -> None:
    """Garante que o resultado da inferencia Bayesiana e sempre [0.0, 1.0]."""
    result = calculate_bayesian_win_prob(prior, action)
    assert 0.0 <= result <= 1.0, f"[{description}] Resultado fora do intervalo: {result}"


@pytest.mark.unit
def test_bayesian_strong_action_increases_probability() -> None:
    """Acao forte (0.8) deve elevar a win prob acima do prior (0.5)."""
    assert calculate_bayesian_win_prob(0.5, 0.8) > 0.5


@pytest.mark.unit
def test_bayesian_weak_action_decreases_probability() -> None:
    """Acao fraca (0.2) deve reduzir a win prob abaixo do prior (0.5)."""
    assert calculate_bayesian_win_prob(0.5, 0.2) < 0.5


@pytest.mark.unit
def test_bayesian_polarized_range_amplifies_strong_action() -> None:
    """Range polarizado (density=0.1) amplifica o efeito de uma acao forte."""
    dense = calculate_bayesian_win_prob(0.5, 0.8, range_density=1.0)
    polarized = calculate_bayesian_win_prob(0.5, 0.8, range_density=0.1)
    assert polarized > dense, "Range polarizado deve amplificar o likelihood de acao forte"


@pytest.mark.unit
def test_bayesian_monotonicity_with_action_strength() -> None:
    """A probabilidade posterior deve crescer monotonicamente com a forca da acao."""
    prior = 0.5
    p_low = calculate_bayesian_win_prob(prior, 0.2)
    p_mid = calculate_bayesian_win_prob(prior, 0.5)
    p_high = calculate_bayesian_win_prob(prior, 0.8)
    assert p_low < p_mid < p_high, "Monotonicidade Bayesiana violada"
