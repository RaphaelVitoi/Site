# tests/test_pmev_engines_consumption.py
"""Testes de consumo concreto e efetivo das dependencias e engines SOTA do ecossistema.

Cobre a integracao harmoniosa e autopoietica de:
- Polars: conversao colunar de alta performance da NormalizedGameTree para Apache Arrow (polars>=2.1.0).
- SymPy: derivacao analitica e simbolica exata de pot odds, MDF, sizing geometrico e sensibilidades de PMev.
- Numba: aceleracao JIT de calculos vetorizados de perspectiva na CPU.
- Prometheus / OpenTelemetry: instrumentacao de telemetria e snapshot de metricas da malha Nexus.

Protocolo Chico SOTA v8.0 GOLD -- Tipagem Estrita PEP 585/604 & Zero-Any.
"""

from __future__ import annotations

from collections.abc import Iterable
import math

import pytest

from core.perspective_schemas import NormalizedGameTree, PerspectivaResult, SolverNode
from core.schemas import Task
from engine.canonical_poker_theory import (
    ChenClairvoyanceSolver,
    JandaGeometricBetSizing,
    JandaMDFCalculator,
)
from engine.solver_importers.universal import UniversalSolverImporter
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine
from monitoring.telemetry import (
    PROMETHEUS_AVAILABLE,
    get_prometheus_metrics_snapshot,
    record_pmev_metric,
    write_economic_log,
)


@pytest.mark.pmev
@pytest.mark.unit
def test_polars_game_tree_conversion() -> None:
    """Verifica a conversao de NormalizedGameTree para Polars DataFrame colunar."""
    tree = NormalizedGameTree(
        solver_type="deep_solver",
        source_format="json",
        game_type="MTT",
        num_players=2,
        starting_pot=10.0,
        nodes={
            "root": SolverNode(
                node_id="root",
                player="BTN",
                street="flop",
                pot=10.0,
                actions=["CHECK", "BET_33"],
                strategy={"CHECK": 0.40, "BET_33": 0.60},
                ev={"CHECK": 5.2, "BET_33": 6.8},
                range_equity=0.58,
                children=["n1", "n2"],
            )
        },
        pmev_converted_nodes={
            "root": PerspectivaResult(
                pmev=7.15,
                dynamic_ev_fold=-1.0,
                structural_liability=0.0,
                amortized_edge=0.05,
                risk_advantage=15.0,
                required_equity=0.50,
                bubble_factor=1.2,
                utility_win=12.0,
                utility_lose=-10.0,
                optimal_action="BET_33",
            )
        },
    )

    df = tree.to_polars()
    assert df is not None
    assert df.height == 2
    assert "node_id" in df.columns
    assert "action" in df.columns
    assert "strategy_freq" in df.columns
    assert "ev" in df.columns
    assert "pmev" in df.columns
    assert "optimal_action" in df.columns

    # Testa o importador universal exportando para Polars
    df_univ = UniversalSolverImporter.export_tree_to_polars(tree)
    assert df_univ.height == 2
    assert df_univ["action"].to_list() == ["CHECK", "BET_33"]


@pytest.mark.pmev
@pytest.mark.unit
def test_sympy_canonical_derivations() -> None:
    """Verifica a integracao com SymPy para derivacoes analiticas exatas de Game Theory."""
    # 1. Clairvoyance Game (Chen & Ankenman)
    sol_clairvoyance = ChenClairvoyanceSolver.solve_symbolic()
    assert sol_clairvoyance is not None
    assert str(sol_clairvoyance.alpha) == "B/(B + P)"
    assert str(sol_clairvoyance.defense_frequency) == "P/(B + P)"
    assert str(sol_clairvoyance.bluff_ratio) == "B/P"

    # 2. MDF de Janda (Applications of No-Limit Hold'em)
    sol_mdf = JandaMDFCalculator.solve_symbolic(num_defenders=1)
    assert str(sol_mdf.mdf) == "P/(B + P)"

    sol_mdf_mw = JandaMDFCalculator.solve_symbolic(num_defenders=2)
    assert "-sqrt(B)/sqrt(B + P) + 1" in str(sol_mdf_mw.multiway_mdf_expr) or "1 - sqrt(B/(B + P))" in str(
        sol_mdf_mw.multiway_mdf_expr
    )

    # 3. Geometric Sizing de Janda
    sol_geom = JandaGeometricBetSizing.solve_symbolic(num_streets=3)
    assert sol_geom.streets == 3
    assert "P" in str(sol_geom.pot_fraction_expr)
    assert "S" in str(sol_geom.pot_fraction_expr)


@pytest.mark.pmev
@pytest.mark.unit
def test_sympy_vitoi_pmev_sensitivities() -> None:
    """Verifica a derivacao de sensibilidades analiticas de PMev via SymPy."""
    sens = VitoiPerspectiveEngine.derive_symbolic_pmev_sensitivities()
    assert "pmev_expr" in sens
    assert "d_pmev_dR" in sens
    assert "d_pmev_dBF" in sens
    assert "d_pmev_dLambda" in sens

    # d(PMev)/dR = E * Pot / BF
    assert "E*Pot/BF" in str(sens["d_pmev_dR"])
    # d(PMev)/dLambda = -1
    assert str(sens["d_pmev_dLambda"]) == "-1"


@pytest.mark.pmev
@pytest.mark.unit
def test_numba_vectorized_perspective_execution() -> None:
    """Verifica a execucao do calculo vetorizado acelerado de perspectiva."""
    equities = [0.45, 0.55, 0.70]
    pots = [10.0, 20.0, 50.0]
    res = VitoiPerspectiveEngine.calculate_perspective_vectorized(equities, pots, human_noise_factor=0.05)
    assert isinstance(res, Iterable)

    factor = 0.95
    expected = [round(e * p * factor, 4) for e, p in zip(equities, pots, strict=True)]
    actual = [round(float(v), 4) for v in res]
    assert math.isclose(actual[0], expected[0], abs_tol=1e-3)
    assert math.isclose(actual[1], expected[1], abs_tol=1e-3)
    assert math.isclose(actual[2], expected[2], abs_tol=1e-3)


@pytest.mark.security_governance
@pytest.mark.unit
def test_monitoring_telemetry_prometheus_integration() -> None:
    """Verifica a instrumentacao de metricas Prometheus na camada de telemetria."""
    if not PROMETHEUS_AVAILABLE:
        pytest.skip("prometheus_client nao disponivel neste runtime")

    # Registro pontual de metrica PMev
    record_pmev_metric(position="BTN", action="RAISE")

    # Registro de log economico
    mock_task = Task(
        id="task-test-pmev-1",
        description="Teste de integracao de metricas telemetricas SOTA",
        agent="@chico",
        timestamp="2026-11-08T12:00:00Z",
        metadata={"priority": "high"},
    )
    write_economic_log(mock_task, 0.35, "completed")

    snapshot = get_prometheus_metrics_snapshot()
    assert isinstance(snapshot, bytes)
    assert len(snapshot) > 0
    snapshot_str = snapshot.decode("utf-8", errors="replace")
    assert "nexus_pmev_calculations_total" in snapshot_str
    assert "nexus_task_executions_total" in snapshot_str
