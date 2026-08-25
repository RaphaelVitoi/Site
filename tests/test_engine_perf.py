"""
Testes de performance, estabilidade numerica e corretude do motor Bayesiano SOTA.
Inclui benchmarks de latencia e validacao de invariantes matematicos.
"""

import math
import time

import pytest

from engine.bayesian_range import build_likelihood_matrix, update_posterior
from engine.math_sota import (
    calculate_rio_tension,
    compute_quantum_metrics,
    solve_icm_distortion_v2,
)

# ==============================================================================
# Benchmarks de Performance
# ==============================================================================


@pytest.mark.slow
def test_performance_bayesian_contraction() -> None:
    """Valida se a contracao Bayesiana mantem latencia sub-milissegundo por operacao."""
    prior = [[1.0 / 169.0 for _ in range(13)] for _ in range(13)]
    likelihood = build_likelihood_matrix("bet", ["Ah", "Kd", "2s"])

    start = time.perf_counter()
    for _ in range(1000):
        prior = update_posterior(prior, likelihood)
    elapsed = time.perf_counter() - start

    avg_ms = (elapsed / 1000) * 1000
    assert avg_ms < 1.0, f"Contracao Bayesiana deve ser <1ms por op, obteve {avg_ms:.4f}ms"


@pytest.mark.slow
def test_performance_9max_stress() -> None:
    """Stress test do motor em cenario 9-max com alta entropia (Psi=1.5)."""
    start = time.perf_counter()
    for _ in range(100):
        solve_icm_distortion_v2(
            ip_rp=0.3,
            oop_rp=0.3,
            topologic_aggression=1.5,
            active_players=9,
            pot_size=100.0,
            street_idx=1,
            fold=0.2,
            call=0.4,
            raise_val=0.4,
        )
    avg_ms = ((time.perf_counter() - start) / 100) * 1000
    assert avg_ms < 5.0, f"9-max deve processar em <5ms, obteve {avg_ms:.4f}ms"


# ==============================================================================
# Estabilidade Numerica
# ==============================================================================


@pytest.mark.unit
def test_numerical_stability_extreme_pots() -> None:
    """Valida a estabilidade do motor em potes colossais (Gravidade Extrema)."""
    res = solve_icm_distortion_v2(
        ip_rp=0.8,
        oop_rp=0.8,
        topologic_aggression=2.0,
        active_players=2,
        pot_size=1_000_000.0,
        street_idx=2,
        fold=0.1,
        call=0.5,
        raise_val=0.4,
    )
    assert 0.0 <= res["fold"] <= 1.0
    assert 0.0 <= res["call"] <= 1.0
    assert 0.0 <= res["raise"] <= 1.0
    assert math.isclose(sum(res.values()), 1.0, rel_tol=1e-9)


@pytest.mark.unit
def test_icm_distortion_probabilities_sum_to_one() -> None:
    """A soma fold+call+raise deve ser sempre 1.0 (invariante de probabilidade)."""
    for active_players in [2, 3, 6, 9]:
        res = solve_icm_distortion_v2(
            ip_rp=0.5,
            oop_rp=0.5,
            topologic_aggression=1.0,
            active_players=active_players,
            pot_size=50.0,
            street_idx=1,
            fold=0.33,
            call=0.33,
            raise_val=0.34,
        )
        assert math.isclose(sum(res.values()), 1.0, rel_tol=1e-9), (
            f"Soma divergente para active_players={active_players}: {sum(res.values())}"
        )


# ==============================================================================
# Coeficiente de Insolvencia (Ci)
# ==============================================================================


@pytest.mark.unit
def test_quantum_metrics_solvency_insolvent_scenario() -> None:
    """Valida o Ci < 1 em condicoes extremas de sub-equidade e sobre-investimento."""
    metrics = compute_quantum_metrics(
        current_equity_pct=10.0,
        delta_win_pct=50.0,
        delta_lose_pct=-500.0,
        dynamic_ev_fold=-1.0,
        realization_factor=0.8,
        fgs_health=0.5,
        active_players=2,
        hero_invested=500.0,
        current_pot=50.0,
        stack_eff=1000.0,
    )
    ci = metrics["ci"]
    assert isinstance(ci, (int, float))
    assert float(ci) < 1.0
    assert metrics["is_solvent"] is False


@pytest.mark.unit
def test_quantum_metrics_returns_required_keys() -> None:
    """Garante que compute_quantum_metrics retorna todos os campos esperados."""
    metrics = compute_quantum_metrics(
        current_equity_pct=50.0,
        delta_win_pct=20.0,
        delta_lose_pct=-20.0,
        dynamic_ev_fold=0.0,
        realization_factor=1.0,
        fgs_health=1.0,
        active_players=2,
        hero_invested=10.0,
        current_pot=20.0,
        stack_eff=100.0,
    )
    for key in ("ci", "is_solvent"):
        assert key in metrics, f"Campo ausente: '{key}'"


# ==============================================================================
# RIO Tension Scaling
# ==============================================================================


@pytest.mark.unit
def test_rio_tension_scaling_with_players() -> None:
    """A tensao RIO deve escalar com o numero de oponentes ativos."""
    t2 = calculate_rio_tension(10, 50, 100, "OOP", 0.6, active_players=2)
    t6 = calculate_rio_tension(10, 50, 100, "OOP", 0.6, active_players=6)
    assert t6 > t2, f"Tensao RIO deve crescer com mais oponentes: t2={t2:.3f}, t6={t6:.3f}"


@pytest.mark.unit
def test_rio_tension_ip_less_than_oop() -> None:
    """A tensao RIO deve ser menor em posicao IP vs OOP (mesmo cenario)."""
    t_oop = calculate_rio_tension(10, 50, 100, "OOP", 0.6, active_players=3)
    t_ip = calculate_rio_tension(10, 50, 100, "IP", 0.6, active_players=3)
    assert t_ip <= t_oop, "Posicao IP deve ter tensao RIO menor ou igual a OOP"


# ==============================================================================
# Bayesian Range  Normalizacao
# ==============================================================================


@pytest.mark.unit
def test_posterior_normalization_sums_to_one() -> None:
    """O posterior Bayesiano deve sempre somar 1.0 (distribuicao de probabilidade valida)."""
    prior = [[1.0 / 169.0 for _ in range(13)] for _ in range(13)]
    likelihood = build_likelihood_matrix("bet", ["Ah", "Kd", "2s"])
    posterior = update_posterior(prior, likelihood)
    total = sum(posterior[r][c] for r in range(13) for c in range(13))
    assert math.isclose(total, 1.0, rel_tol=1e-9), f"Posterior nao normalizado: soma={total}"


@pytest.mark.unit
def test_build_likelihood_matrix_preflop_valid() -> None:
    """Matriz de likelihood pre-flop (board vazio) deve ter valores no intervalo [0, 1]."""
    matrix = build_likelihood_matrix("bet", [])
    for row in matrix:
        for val in row:
            assert 0.0 <= val <= 1.0, f"Valor invalido no pre-flop: {val}"
