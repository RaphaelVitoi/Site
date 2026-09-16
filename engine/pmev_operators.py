"""Operadores composicionais do arcabouco PMev (f1 a f5).

Formalismo: Raphael Vitoi -- Ecossistema Nexus SOTA v8.0 GOLD.
Auditoria Integrada: Sol (Codex) x Hermes.

A cadeia compositiva de seis operadores:
    ChipEV -> ICMev (f1) -> Esperanca (f2) -> Expectativa (f3) -> Perspectiva (f4) -> PMev (f5)
opera como um sistema dinamico y = (f5 o f4 o f3 o f2 o f1)(x).
Garante contracao espectral rho(J_global) <= 1 e barreira absorvente sem dupla contagem.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Protocol, runtime_checkable

import numpy as np
from numpy.typing import NDArray

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_spec import (
    AbsorptionState,
    Bounds,
    Measured,
    Provenance,
    Unit,
)

ENGINE_VERSION = "0.2.0-compositional-sota"
DEFAULT_SOLVER_ID = "vitoi-pmev-matrix-engine"


@runtime_checkable
class CompositionalOperator(Protocol):
    """Protocolo formal para operadores da cadeia compositiva PMev."""

    def forward(self, input_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        """Calcula o mapeamento direto f_k(x)."""
        raise NotImplementedError

    def jacobian(self, input_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        """Calcula ou aproxima o Jacobiano J_f_k(x) = df_k / dx."""
        raise NotImplementedError


def spectral_radius(matrix: NDArray[np.float64]) -> float:
    """Calcula o raio espectral rho(M) = max |lambda_i|."""
    eigenvalues = np.linalg.eigvals(matrix)
    return float(np.max(np.abs(eigenvalues)))


def tangent_spectral_radius(matrix: NDArray[np.float64]) -> float:
    """Raio espectral no subespaco de redistribuicao (perturbacoes de soma zero).

    Camadas T$ -> T$ que conservam o prize pool tem autovalor 1 na direcao do total, logo
    rho(J) < 1 e impossivel para elas. O que se mede e se amplificam ou contraem a
    REDISTRIBUICAO entre jogadores: rho(P J P), com P o projetor de soma zero.
    """
    n = matrix.shape[0]
    projetor = np.eye(n, dtype=np.float64) - np.full((n, n), 1.0 / n)
    return spectral_radius(projetor @ matrix @ projetor)


# ==============================================================================
# OPERADOR f1: Normalizacao de Estado & Baseline ICMev Contrativo (Malmuth-Harville)
# ==============================================================================


class OperatorF1Baseline:
    """Operador f1: ChipEV -> ICMev via Malmuth-Harville.

    Contrativo por construcao: concavidade da funcao de valor de fichas garante ||J1|| <= 1.
    """

    def __init__(self, payouts: tuple[float, ...]) -> None:
        if not payouts:
            raise ValueError("OperatorF1Baseline requer payouts nao vazios.")
        self.payouts = payouts

    def forward(self, stacks: NDArray[np.float64]) -> NDArray[np.float64]:
        stacks_list = [float(s) for s in stacks]
        icm_equities = calculate_malmuth_harville_icm(stacks_list, list(self.payouts))
        return np.array(icm_equities, dtype=np.float64)

    def jacobian(self, stacks: NDArray[np.float64], delta: float = 1e-4) -> NDArray[np.float64]:
        """Calcula a matriz Jacobiana J1 = d(ICM)/d(stacks) via diferencas finitas centradas."""
        n = len(stacks)
        j1 = np.zeros((n, n), dtype=np.float64)

        for j in range(n):
            stacks_plus = np.copy(stacks)
            stacks_minus = np.copy(stacks)
            stacks_plus[j] += delta
            stacks_minus[j] = max(0.0, stacks_minus[j] - delta)

            actual_delta = stacks_plus[j] - stacks_minus[j]
            if actual_delta <= 0.0:
                continue

            f_plus = self.forward(stacks_plus)
            f_minus = self.forward(stacks_minus)
            j1[:, j] = (f_plus - f_minus) / actual_delta

        return j1


# ==============================================================================
# OPERADOR f2: Projecao Temporal / Isometria (Markov R1-R6, Relogio t-3, Blinds)
# ==============================================================================


class OperatorF2Temporal:
    """Operador f2: ICMev -> Esperanca via projecao temporal e atrito de blinds.

    Mapeamento proximo de isometria (||J2|| ~ 1), preservando conservacao de massa.
    """

    def __init__(
        self,
        time_to_blind_jump_minutes: float,
        orbit_cost_bb: float,
        hero_index: int = 0,
    ) -> None:
        self.time_to_blind = max(0.0, time_to_blind_jump_minutes)
        self.orbit_cost = max(0.0, orbit_cost_bb)
        self.hero_index = hero_index

    def forward(self, icm_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        n = len(icm_vector)
        result = np.copy(icm_vector)

        # Fator de atrito temporal t-3: proximidade dos blinds acelera erosao
        urgency = 1.0 + (1.0 / max(1.0, self.time_to_blind)) * 0.05
        friction_per_player = (self.orbit_cost / max(1, n)) * urgency

        # Decaimento marginal preservando conservacao no prize pool
        for i in range(n):
            loss = min(result[i] * 0.05, friction_per_player * 0.01)
            result[i] -= loss

        # Re-normalizacao conservativa (prize pool permanece invariante)
        total_before = np.sum(icm_vector)
        total_after = np.sum(result)
        if total_after > 0:
            result = result * (total_before / total_after)

        return result

    def jacobian(self, icm_vector: NDArray[np.float64], delta: float = 1e-4) -> NDArray[np.float64]:
        n = len(icm_vector)
        j2 = np.zeros((n, n), dtype=np.float64)
        for j in range(n):
            v_plus = np.copy(icm_vector)
            v_minus = np.copy(icm_vector)
            v_plus[j] += delta
            v_minus[j] = max(0.0, v_minus[j] - delta)
            actual_delta = v_plus[j] - v_minus[j]
            if actual_delta > 0:
                j2[:, j] = (self.forward(v_plus) - self.forward(v_minus)) / actual_delta
            else:
                j2[j, j] = 1.0
        return j2


# ==============================================================================
# OPERADOR f3: Politica Comportamental / AQRE com Trava Espectral Dirichlet/Tikhonov
# ==============================================================================


class OperatorF3Behavioral:
    """Operador f3: Esperanca -> Expectativa (politica comportamental e densidades de range).

    Possui risco de ser expansor (rho(J3) > 1). Aplica regularizacao de Dirichlet / Tikhonov
    ou projecao baricentrica para garantir rigorosamente que rho(J_hat_3) <= 1.0.
    """

    def __init__(
        self,
        risk_aversion_factor: float = 0.88,
        regularization_lambda: float = 0.1,
        dirichlet_alpha: float = 1.0,
    ) -> None:
        # dirichlet_alpha era 1.0 fixo dentro de forward: sem elemento neutro, a cadeia
        # nunca reduzia ao ICM (desvio medido de 5 a 22 T$). Com alpha 0 e aversao 1,
        # f3 e a identidade. Ver engine/pmev_baselines.py.
        if not math.isfinite(dirichlet_alpha) or dirichlet_alpha < 0:
            raise ValueError(f"dirichlet_alpha deve ser finito e nao negativo, recebido {dirichlet_alpha}.")
        self.risk_aversion = risk_aversion_factor
        self.reg_lambda = max(1e-6, regularization_lambda)
        self.dirichlet_alpha = dirichlet_alpha

    def forward(self, expected_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        """Aplica modulacao quantal / prospectiva com prior Dirichlet."""
        n = len(expected_vector)
        dirichlet_alpha = self.dirichlet_alpha
        total_expected = float(np.sum(expected_vector))

        if total_expected <= 0:
            return expected_vector

        shares = expected_vector / total_expected
        smoothed_shares = (shares + (dirichlet_alpha / n)) / (1.0 + dirichlet_alpha)

        utility_shares = np.power(np.maximum(1e-9, smoothed_shares), self.risk_aversion)
        sum_u = np.sum(utility_shares)
        if sum_u > 0:
            utility_shares = utility_shares / sum_u

        return utility_shares * total_expected

    def raw_jacobian(self, expected_vector: NDArray[np.float64], delta: float = 1e-4) -> NDArray[np.float64]:
        n = len(expected_vector)
        j3 = np.zeros((n, n), dtype=np.float64)
        for j in range(n):
            v_plus = np.copy(expected_vector)
            v_minus = np.copy(expected_vector)
            v_plus[j] += delta
            v_minus[j] = max(0.0, v_minus[j] - delta)
            actual_delta = v_plus[j] - v_minus[j]
            if actual_delta > 0:
                j3[:, j] = (self.forward(v_plus) - self.forward(v_minus)) / actual_delta
            else:
                j3[j, j] = 1.0
        return j3

    def jacobian(self, expected_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        """Calcula o Jacobiano regularizado por Tikhonov: J_hat_3 = J3 * (I + lambda J3^T J3)^(-1).

        NAO E A DERIVADA DE f3, e nao deve propagar incerteza: medido em 2026-09-13, subestimou
        o erro padrao do heroi em ~4% contra Monte Carlo, e declarou rho 0,909 onde o real e 1,0.
        A regularizacao e o reescalamento agem sobre a matriz, nao sobre o operador. f5 usa
        `raw_jacobian`.
        """
        j_raw = self.raw_jacobian(expected_vector)
        n = j_raw.shape[0]
        ident = np.eye(n, dtype=np.float64)

        tikhonov_matrix = ident + (self.reg_lambda * (j_raw.T @ j_raw))
        j_reg = j_raw @ np.linalg.inv(tikhonov_matrix)

        rho = spectral_radius(j_reg)
        if rho > 1.0:
            j_reg = j_reg * (0.999 / rho)

        return j_reg


# ==============================================================================
# OPERADOR f4: Absorcao Estocastica & Barreira via Bellman (gamma = 1)
# ==============================================================================


class OperatorF4Absorption:
    """Operador f4: Expectativa -> Perspectiva.

    Particiona estritamente o espaco amostral entre transiente e absorvente:
        E[U | s, a] = P(R | s, a) * U(s_abs) + sum_{s' not in S_abs} P(s' | s, a) * V(s')
    Rejeita a formula multiplicativa cega (1 - P(ruina)) por gerar dupla contagem.
    """

    def __init__(
        self,
        p_ruin_vector: tuple[float, ...],
        absorption_states: tuple[AbsorptionState, ...],
    ) -> None:
        self.p_ruin = np.array(p_ruin_vector, dtype=np.float64)
        self.absorption_states = absorption_states

    def forward(self, expectation_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        n = len(expectation_vector)
        result = np.zeros(n, dtype=np.float64)

        for i in range(n):
            p_r = float(self.p_ruin[i]) if i < len(self.p_ruin) else 0.0
            p_r = max(0.0, min(1.0, p_r))

            u_terminal = 0.0
            if i < len(self.absorption_states):
                u_terminal = self.absorption_states[i].payout

            v_continue = float(expectation_vector[i])
            result[i] = (p_r * u_terminal) + ((1.0 - p_r) * v_continue)

        return result

    def jacobian(self, expectation_vector: NDArray[np.float64]) -> NDArray[np.float64]:
        n = len(expectation_vector)
        j4 = np.zeros((n, n), dtype=np.float64)
        for i in range(n):
            p_r = float(self.p_ruin[i]) if i < len(self.p_ruin) else 0.0
            p_r = max(0.0, min(1.0, p_r))
            j4[i, i] = 1.0 - p_r
        return j4


# ==============================================================================
# OPERADOR f5: Funcional PMev com Incerteza & Propagacao de Covariancia
# ==============================================================================


@dataclass(frozen=True, slots=True)
class PMevCompositionResult:
    """Resultado final da cadeia compositiva PMev com rastreabilidade integral."""

    decision_vector: list[float]
    global_jacobian: list[list[float]]
    spectral_radius: float
    covariance_matrix: list[list[float]]
    is_contractive: bool
    intermediate_states: dict[str, list[float]]


class OperatorF5Functional:
    """Operador f5: Perspectiva -> PMev.

    Consolida o vetor decisorio final, compoe o Jacobiano global J_global = prod J_fk,
    propaga a matriz de covariancia Sigma_y = J_global Sigma_x J_global^T e afere
    a condicao de estabilidade espectral rho(J_global) <= 1.0.
    """

    def __init__(
        self,
        operators: tuple[OperatorF1Baseline, OperatorF2Temporal, OperatorF3Behavioral, OperatorF4Absorption],
    ) -> None:
        self.f1, self.f2, self.f3, self.f4 = operators

    def evaluate_chain(
        self,
        initial_stacks: NDArray[np.float64],
        initial_covariance: NDArray[np.float64] | None = None,
    ) -> Measured[PMevCompositionResult]:
        """Executa a cadeia completa com auditoria estrita de Jacobiano e covariancia."""
        n = len(initial_stacks)
        if initial_covariance is None:
            initial_covariance = np.diag((initial_stacks * 0.01) ** 2)

        # 1. Forward Pass em cascata
        x1 = self.f1.forward(initial_stacks)
        x2 = self.f2.forward(x1)
        x3 = self.f3.forward(x2)
        x4 = self.f4.forward(x3)
        y = np.copy(x4)

        # 2. Derivadas REAIS de cada camada (f3: raw_jacobian, nunca a matriz regularizada)
        j1 = self.f1.jacobian(initial_stacks)
        j2 = self.f2.jacobian(x1)
        j3 = self.f3.raw_jacobian(x2)
        j4 = self.f4.jacobian(x3)
        j5 = np.eye(n, dtype=np.float64)

        j_global = j5 @ j4 @ j3 @ j2 @ j1

        # 3. Propagacao da Covariancia: Sigma_y = J_global * Sigma_x * J_global^T
        sigma_y = j_global @ initial_covariance @ j_global.T

        # 4. Auditoria espectral bem posta: so as camadas T$ -> T$ (J1 leva fichas a T$ e seu
        # raio muda com a unidade das stacks) e so no subespaco de redistribuicao. Tolerancia
        # de diferencas finitas: a identidade mede ~1,00004.
        rho = tangent_spectral_radius(j5 @ j4 @ j3 @ j2)
        is_contractive = rho <= 1.0 + 1e-3

        hero_var = float(sigma_y[0, 0])
        hero_se = math.sqrt(max(0.0, hero_var))
        hero_val = float(y[0])

        comp_result = PMevCompositionResult(
            decision_vector=[float(v) for v in y],
            global_jacobian=[[float(cell) for cell in row] for row in j_global],
            spectral_radius=rho,
            covariance_matrix=[[float(cell) for cell in row] for row in sigma_y],
            is_contractive=is_contractive,
            intermediate_states={
                "f1_icm": [float(v) for v in x1],
                "f2_temporal": [float(v) for v in x2],
                "f3_behavioral": [float(v) for v in x3],
                "f4_absorption": [float(v) for v in x4],
            },
        )

        # Cadeia deterministica: nao ha solver, iteracoes nem distancia de Nash a declarar.
        provenance = Provenance(
            engine_version=ENGINE_VERSION,
            solver_id=DEFAULT_SOLVER_ID,
        )

        bounds = Bounds(
            lower=hero_val - (1.96 * hero_se),
            upper=hero_val + (1.96 * hero_se),
            confidence_level=0.95,
        )

        return Measured(
            value=comp_result,
            unit=Unit.TOURNAMENT_DOLLARS,
            is_valid=is_contractive,
            standard_error=hero_se,
            confidence_interval=bounds,
            provenance=provenance,
        )
