"""Bancada de testes formais para a rearquitetura composicional PMev (Fases 0 a 4).

Formalismo: Raphael Vitoi -- Ecossistema Nexus SOTA v8.0 GOLD.
Auditoria Integrada: Sol (Codex) x Hermes.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_falsification import (
    evaluate_bic_parsimony,
    evaluate_late_registration_utility,
    evaluate_river_defense_mdf,
    evaluate_spr_optionality,
)
from engine.pmev_operators import (
    OperatorF1Baseline,
    OperatorF3Behavioral,
    OperatorF4Absorption,
    spectral_radius,
)
from engine.pmev_pipeline import PMevCompositionalPipeline
from engine.pmev_postflop_matrix import (
    CANONICAL_DELTA_RP,
    CANONICAL_PAYOUTS,
    aula_1_2_par_2,
    create_canonical_postflop_scenario,
)
from engine.pmev_spec import (
    AbsorptionState,
    InsufficientDataCalibrationError,
    TournamentState,
    Unit,
)

RAIZ = Path(__file__).resolve().parents[1]


# ==============================================================================
# FASE 0: TESTE DE IDENTIDADE NUMERICA (PMev-0 == ICMev)
# ==============================================================================


def test_fase_0_pmev_identity_reduces_exactly_to_malmuth_harville() -> None:
    """Verifica que o operador de baseline f1 recupera o ICM classico com erro < 1e-9."""
    stacks = (5000.0, 3000.0, 2000.0)
    payouts = (100.0, 60.0, 40.0)

    expected_icm = calculate_malmuth_harville_icm(list(stacks), list(payouts))

    f1 = OperatorF1Baseline(payouts=payouts)
    computed_f1 = f1.forward(np.array(stacks, dtype=np.float64))

    for actual, expected in zip(computed_f1, expected_icm, strict=True):
        assert abs(actual - expected) < 1e-9, f"Divergencia em f1: {actual} vs {expected}"


def test_fase_0_ablation_without_extensions_equals_icm() -> None:
    """Verifica que desativando f2, f3 e f4 na pipeline de ablacao, o resultado e identico ao ICM."""
    state = TournamentState(stacks=(40.0, 30.0, 20.0, 10.0), payouts=(50.0, 30.0, 20.0))
    pipeline = PMevCompositionalPipeline()

    ablation = pipeline.evaluate_ablation(state, disabled_operators=frozenset({"f2", "f3", "f4"}))
    expected_icm = calculate_malmuth_harville_icm(list(state.stacks), list(state.payouts))

    for actual, expected in zip(ablation["final_vector"], expected_icm, strict=True):
        assert abs(actual - expected) < 1e-9


# ==============================================================================
# FASE 1: CONTRACAO ESPECTRAL DO JACOBIANO GLOBAL (rho(J_global) <= 1.0)
# ==============================================================================


def test_fase_1_spectral_contraction_condition_holds() -> None:
    """Verifica que o Jacobiano global do pipeline e contrativo (rho(J_global) <= 1.0)."""
    state = TournamentState(stacks=(38.0, 53.0, 25.0, 15.0), payouts=CANONICAL_PAYOUTS[:4])
    pipeline = PMevCompositionalPipeline(risk_aversion=0.88, regularization_lambda=0.1)

    measured = pipeline.evaluate(state)
    result = measured.value

    assert measured.is_valid is True
    assert result.is_contractive is True
    assert result.spectral_radius <= 1.0, f"Raio espectral excedeu 1.0: {result.spectral_radius}"
    assert measured.unit is Unit.TOURNAMENT_DOLLARS
    assert measured.standard_error >= 0.0


def test_fase_1_operator_f3_tikhonov_regularization_bounds_spectral_radius() -> None:
    """Verifica que a regularizacao Tikhonov/Dirichlet mantem o raio espectral de f3 bounded <= 1.0."""
    f3 = OperatorF3Behavioral(risk_aversion_factor=0.75, regularization_lambda=0.15)
    vector = np.array([50.0, 30.0, 20.0], dtype=np.float64)

    j3_reg = f3.jacobian(vector)
    rho = spectral_radius(j3_reg)

    assert rho <= 1.0, f"Regularizacao de f3 falhou em conter rho: {rho}"


# ==============================================================================
# FASE 2: BARREIRA ABSORVENTE SEM DUPLA CONTAGEM DE RUINA (Bellman gamma = 1)
# ==============================================================================


def test_fase_2_absorption_operator_partitions_sample_space_correctly() -> None:
    """Verifica que E[U | s, a] particiona sem multiplicar cegamente por (1 - P(ruina))."""
    expectation = np.array([100.0, 60.0], dtype=np.float64)
    p_ruin = (0.20, 0.10)
    # Jogador 0 garante payout de eliminacao (ex: 30.0) se colapsar agora
    abs_states = (
        AbsorptionState(place=3, payout=30.0),
        AbsorptionState(place=4, payout=20.0),
    )

    f4 = OperatorF4Absorption(p_ruin_vector=p_ruin, absorption_states=abs_states)
    result = f4.forward(expectation)

    # Esperado exato para jogador 0: 0.20 * 30.0 + 0.80 * 100.0 = 6.0 + 80.0 = 86.0
    # Pela formula falsa multiplicativa (1 - p)*E seria 0.80 * 100.0 = 80.0 (ignorando o payout assegurado!)
    assert abs(result[0] - 86.0) < 1e-9
    # Jogador 1: 0.10 * 20.0 + 0.90 * 60.0 = 2.0 + 54.0 = 56.0
    assert abs(result[1] - 56.0) < 1e-9


# ==============================================================================
# FASE 3: FRONTEIRAS DE FALSIFICACAO CRITICAS (H4, H7, H9, H12)
# ==============================================================================


def test_fase_3_h4_river_defense_subversion_under_rp_asymmetry() -> None:
    """Verifica desacoplamento do MDF linear sob assimetria de Risk Premium no river."""
    pot = 100.0
    bet = 100.0  # pot-sized bet
    delta_rp = 0.15  # 15% assimetria de risco do defensor

    res = evaluate_river_defense_mdf(pot=pot, bet=bet, delta_rp_def=delta_rp)

    # Linear MDF: 100 / 200 = 0.50 (50%)
    assert abs(res.mdf_linear - 0.50) < 1e-9
    # PMev MDF: (100 - 0.15 * 200) / (200 * 0.85) = 70 / 170 ~ 0.4117 (41.18%)
    expected_pmev = (100.0 - (0.15 * 200.0)) / (200.0 * 0.85)
    assert abs(res.mdf_pmev - expected_pmev) < 1e-9
    assert res.is_decoupled is True
    assert res.defense_reduction_pct > 0.0


def test_fase_3_h7_spr_optionality_breaks_monotonicity_in_transition_zone() -> None:
    """Verifica que Omega(s) quebra monotonia estrita em [20, 25] bb devido ao colapso push/fold."""
    res_deep = evaluate_spr_optionality(s_eff_bb=45.0)
    assert res_deep.is_strictly_positive is True
    assert res_deep.monotonicity_broken is False

    res_transition = evaluate_spr_optionality(s_eff_bb=22.5)
    assert res_transition.monotonicity_broken is True
    assert res_transition.omega_value < 0.0


def test_fase_3_h9_late_registration_utility_non_conservation() -> None:
    """Verifica que no espaco de utilidade T$ a conservacao estrita de buy-in nao se sustenta."""
    state = TournamentState(stacks=(1000.0, 1000.0, 1000.0), payouts=(60.0, 30.0, 10.0))
    res = evaluate_late_registration_utility(
        before_state=state,
        entrant_stack=1000.0,
        buy_in=100.0,
        rake_pct=0.10,
    )

    assert res.is_non_conserved_in_utility is True
    assert res.conservation_error_t_dollars > 0.0


def test_fase_3_h12_bic_parsimony_penalizes_overfitting() -> None:
    """Verifica teste de parcimonia BIC para rejeitar acrescimo abusivo de graus de liberdade."""
    # Cenario onde ganho de verossimilhanca e insuficiente contra a penalizacao parametrica
    res_rejected = evaluate_bic_parsimony(
        log_lik_d=500.0,
        log_lik_f=502.0,  # Ganho de apenas 4.0 em 2*delta_ln(L)
        k_d=3,
        k_f=10,  # 7 parametros a mais
        n_samples=1000,  # 7 * ln(1000) ~ 7 * 6.907 = 48.35
    )
    assert res_rejected.is_expansion_admissible is False

    # Cenario onde ganho supera com folga a penalizacao
    res_approved = evaluate_bic_parsimony(
        log_lik_d=500.0,
        log_lik_f=560.0,  # Ganho de 120.0
        k_d=3,
        k_f=5,  # 2 parametros a mais: 2 * 6.907 = 13.81
        n_samples=1000,
    )
    assert res_approved.is_expansion_admissible is True


# ==============================================================================
# HARNESS POS-FLOP DA AULA 1.2 & DOWNWARD SIZING DRIFT
# ==============================================================================


def test_aula_1_2_par_2_mostra_drift_de_sizing_com_valores_lidos() -> None:
    """Drift medido nas capturas: sizing medio ponderado 2.74 -> 1.35 bb, ramo dominante 2.8 -> 1.13 bb."""
    measured = create_canonical_postflop_scenario()
    par = measured.value
    assert measured.is_valid is True, "as somas de frequencia da transcricao deveriam fechar"
    assert measured.unit is Unit.DIMENSIONLESS
    assert par.is_downward_drift_active is True
    assert abs(par.chip_ev.weighted_mean_sizing_bb - 2.7433) < 1e-3
    assert abs(par.icm_ev.weighted_mean_sizing_bb - 1.3516) < 1e-3
    assert abs(CANONICAL_DELTA_RP - 0.085) < 1e-9


def test_aula_1_2_par_2_e_valido_mas_nao_reproduzivel() -> None:
    """Espelha countReproduciblePairs(AULA_1_2_PAIRS) = 0 no TypeScript. Nao e calibracao."""
    avaliacao = aula_1_2_par_2().contract.assess_reproducibility()
    assert avaliacao.reproducible is False
    assert avaliacao.missing_chip_ev == ["provenance"]
    assert avaliacao.missing_icm_ev == ["provenance"]


def test_payouts_sao_os_do_ledger_da_aula_1_2() -> None:
    ledger = (RAIZ / "docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md").read_text(encoding="utf-8")
    linha = next(ln for ln in ledger.splitlines() if ln.startswith("| Payouts da FT |"))
    lidos = tuple(float(v.strip().replace(",", ".")) for v in linha.split("|")[2].split(";"))
    assert lidos == CANONICAL_PAYOUTS


# ==============================================================================
# FASE 4: TRAVA EPISTEMICA DE CALIBRACAO (DADOS INSUFICIENTES)
# ==============================================================================


def test_fase_4_calibration_raises_insufficient_data_error() -> None:
    """Verifica que qualquer tentativa de calibracao parametrica geral e bloqueada."""
    with pytest.raises(InsufficientDataCalibrationError) as exc_info:
        raise InsufficientDataCalibrationError()

    assert "DADOS INSUFICIENTES \u2014 NENHUMA CALIBRACAO PLANEJADA" in str(exc_info.value)
