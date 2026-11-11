"""Testes unitarios para RStatisticalBridge (Engine R 4.6.1+)."""

from __future__ import annotations

import pytest

from engine.r_statistical_bridge import RStatisticalBridge, resolve_rscript_path

_RSCRIPT_PRESENTE = resolve_rscript_path() is not None
_requer_rscript = pytest.mark.skipif(not _RSCRIPT_PRESENTE, reason="Rscript nao instalado neste runtime")


@_requer_rscript
def test_rscript_path_resolution():
    path = resolve_rscript_path()
    assert path is not None
    assert path.exists()
    assert "Rscript" in path.name


@_requer_rscript
def test_tail_risk_computation():
    bridge = RStatisticalBridge()
    assert bridge.is_available

    # Amostra sintetica com cauda pesada de perdas
    samples = [-100.0, -50.0, -30.0, -10.0, 0.0, 10.0, 20.0, 30.0, 40.0, 100.0] * 10
    result = bridge.compute_tail_risk(samples)

    assert result.engine in {"R-4.6.1", "python-native-fallback"}
    assert result.var_95 > 0
    assert result.cvar_95 >= result.var_95
    assert isinstance(result.skewness, float)
    assert isinstance(result.kurtosis, float)


@_requer_rscript
def test_bayesian_mda_frequency():
    bridge = RStatisticalBridge()
    assert bridge.is_available

    # Prior uniforme Beta(1, 1), 70 sucessos em 100 observacoes
    res = bridge.compute_bayesian_mda_frequency(
        prior_alpha=1.0,
        prior_beta=1.0,
        successes=70,
        trials=100,
        threshold=0.5,
    )

    assert res.engine in {"R-4.6.1", "python-native-fallback"}
    assert 0.65 < res.posterior_mean < 0.75
    assert res.ci_95_lower < res.posterior_mean < res.ci_95_upper
    assert res.prob_above_threshold > 0.99
    assert res.total_observations == 100


def test_fallback_when_r_unavailable():
    # Instancia forcando binario inexistente para exercitar caminho de fallback
    dummy_bridge = RStatisticalBridge(rscript_bin="c:/caminho/falso/Rscript.exe")
    assert not dummy_bridge.is_available

    samples = [-50.0, -20.0, 0.0, 10.0, 30.0]
    res_tail = dummy_bridge.compute_tail_risk(samples)
    assert res_tail.engine == "python-native-fallback"

    res_mda = dummy_bridge.compute_bayesian_mda_frequency(1.0, 1.0, 15, 20)
    assert res_mda.engine == "python-native-fallback"
