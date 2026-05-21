"""
Testes de performance e estabilidade numérica do motor SOTA.
"""

import time
import math
from engine.math_sota import (
    solve_icm_distortion_v2,
    compute_quantum_metrics,
    calculate_rio_tension,
)
from engine.bayesian_range import update_posterior, build_likelihood_matrix


def test_performance_bayesian_contraction():
    """Valida se a contracao Bayesiana mantem latencia sub-milissegundo."""
    prior = [[1.0 / 169.0 for _ in range(13)] for _ in range(13)]
    likelihood = build_likelihood_matrix("bet", ["Ah", "Kd", "2s"])

    start = time.perf_counter()
    for _ in range(1000):
        prior = update_posterior(prior, likelihood)
    end = time.perf_counter()

    avg_time = (end - start) / 1000
    print(f"\n[PERF] Tempo medio de contracao Bayesiana: {avg_time * 1000:.4f}ms")
    assert avg_time < 0.001  # Deve ser < 1ms por operacao


def test_numerical_stability_extreme_pots():
    """Valida a estabilidade do motor em potes colossais (Gravidade Extrema)."""
    # Pote de 1.000.000 BBs
    res = solve_icm_distortion_v2(
        ip_rp=0.8,
        oop_rp=0.8,
        topologic_aggression=2.0,
        active_players=2,
        pot_size=1000000.0,
        street_idx=2,
        fold=0.1,
        call=0.5,
        raise_val=0.4,
    )
    assert 0.0 <= res["fold"] <= 1.0
    assert 0.0 <= res["call"] <= 1.0
    assert 0.0 <= res["raise"] <= 1.0
    assert math.isclose(sum(res.values()), 1.0, rel_tol=1e-9)


def test_quantum_metrics_solvency():
    """Valida o Coeficiente de Insolvencia (Ci) em condicoes de borda."""
    # Hero investe muito em pote pequeno com baixa equidade
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
    ci = metrics.get("ci")
    assert ci is not None
    assert float(ci) < 1.0
    assert metrics["is_solvent"] is False


def test_rio_tension_scaling():
    """Valida se a tensao de RIO escala exponencialmente com o numero de oponentes."""
    t2 = calculate_rio_tension(10, 50, 100, "OOP", 0.6, active_players=2)
    t6 = calculate_rio_tension(10, 50, 100, "OOP", 0.6, active_players=6)
    assert t6 > t2
    print(f"\n[SOTA] Tensao RIO: 2p={t2:.3f}, 6p={t6:.3f}")
