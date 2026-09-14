"""Composicao PMev uma camada por vez, com reducao, ablacao e propagacao de incerteza.

Item 6 da ordem vinculante do handoff-2026-09-13-integracao-paralela-pmev-engines, com o
passo 3 do plano da auditoria (estados terminais explicitos, sem dupla contagem de ruina).

TRES CORRECOES MEDIDAS EM 2026-09-13 que este modulo incorpora:

1. ESTABILIDADE. O criterio rho(J_global) <= 1 incluia f1, que leva fichas a T$: rho(J1)
   foi 3,32 com stacks em bb e 0,033 com as mesmas stacks x100. Um criterio que muda com a
   unidade nao mede nada. E as camadas T$ -> T$ que conservam o prize pool tem autovalor 1
   por construcao, logo rho < 1 e impossivel para elas. O diagnostico aqui e o raio
   espectral no subespaco de REDISTRIBUICAO (perturbacoes de soma zero), so nas camadas
   T$ -> T$: invariante a unidade das stacks e informativo (0,45 no default da mesa da
   Aula 1.2; 1,0 na identidade).

2. INCERTEZA. `OperatorF3Behavioral.jacobian` e uma matriz regularizada e reescalada, nao a
   derivada: subestimou o erro padrao do heroi em ~4% contra Monte Carlo, enquanto a
   derivada real (`raw_jacobian`) bateu. A propagacao usa sempre a derivada real.

3. RUINA. f4 particiona P(ruina)*terminal + (1-P)*continuacao, e isso so e exato se a
   continuacao for CONDICIONAL a sobreviver. Alimentado com a equidade ICM incondicional,
   que ja embute a chance de quebrar, conta a ruina duas vezes: 86,27 contra 106,23 T$
   exatos num all-in do BU na mesa da Aula. O caminho exato e materializar os ramos
   (`all_in_branch_values`): o ICM das stacks resultantes ja trata stack zero como estado
   terminal no n-esimo lugar.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from enum import StrEnum
from math import isfinite, sqrt
from typing import Final, Protocol

import numpy as np
from numpy.typing import NDArray

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_operators import (
    OperatorF1Baseline,
    OperatorF2Temporal,
    OperatorF3Behavioral,
    OperatorF4Absorption,
    spectral_radius,
    tangent_spectral_radius,
)
from engine.pmev_spec import TournamentState

# Diferencas finitas centradas com delta 1e-4 erram ~4e-5 no raio da identidade.
RADIUS_TOLERANCE: Final[float] = 1e-3

__all__ = [
    "RADIUS_TOLERANCE",
    "AblationReport",
    "CompositionReport",
    "CompositionStep",
    "Layer",
    "all_in_branch_values",
    "compose_one_at_a_time",
    "derivative",
    "terminal_payout_if_eliminated_now",
]


class Layer(StrEnum):
    F2 = "f2_temporal"
    F3 = "f3_behavioral"
    F4 = "f4_absorption"


class _Operator(Protocol):
    def forward(self, input_vector: NDArray[np.float64]) -> NDArray[np.float64]: ...


LayerOperator = OperatorF2Temporal | OperatorF3Behavioral | OperatorF4Absorption


def derivative(operator: LayerOperator, x: NDArray[np.float64]) -> NDArray[np.float64]:
    """Derivada REAL da camada em x. Nunca a matriz regularizada de f3."""
    if isinstance(operator, OperatorF3Behavioral):
        return operator.raw_jacobian(x)
    return operator.jacobian(x)


def terminal_payout_if_eliminated_now(state: TournamentState) -> float:
    """Quem quebra agora termina em n-esimo, com n jogadores ativos."""
    n = len(state.stacks)
    return state.payouts[n - 1] if len(state.payouts) >= n else 0.0


def all_in_branch_values(state: TournamentState, hero: int, villain: int, p_hero_wins: float) -> list[float]:
    """Valor esperado de todos os jogadores num all-in heroi x vilao, pelos dois ramos materializados.

    Cada ramo e um estado de torneio de verdade: a stack que chega a zero vira estado
    terminal no proprio ICM. Nao ha desconto multiplicativo de ruina aplicado por cima.
    """
    n = len(state.stacks)
    if hero == villain or not (0 <= hero < n and 0 <= villain < n):
        raise ValueError("heroi e vilao devem ser indices distintos e validos.")
    if not isfinite(p_hero_wins) or not 0.0 <= p_hero_wins <= 1.0:
        raise ValueError("p_hero_wins deve estar em [0, 1].")
    efetiva = min(state.stacks[hero], state.stacks[villain])
    ganha, perde = list(state.stacks), list(state.stacks)
    ganha[hero] += efetiva
    ganha[villain] -= efetiva
    perde[hero] -= efetiva
    perde[villain] += efetiva
    payouts = list(state.payouts)
    ev_ganha = calculate_malmuth_harville_icm(ganha, payouts)
    ev_perde = calculate_malmuth_harville_icm(perde, payouts)
    return [p_hero_wins * g + (1.0 - p_hero_wins) * p for g, p in zip(ev_ganha, ev_perde, strict=True)]


@dataclass(frozen=True, slots=True)
class CompositionStep:
    layer: Layer
    before: list[float]
    after: list[float]
    delta: list[float]
    prize_pool_before: float
    prize_pool_after: float
    redistribution_radius: float
    standard_errors: list[float]

    @property
    def conserves_prize_pool(self) -> bool:
        return abs(self.prize_pool_after - self.prize_pool_before) <= 1e-9 * max(1.0, abs(self.prize_pool_before))

    @property
    def expands_redistribution(self) -> bool:
        return self.redistribution_radius > 1.0 + RADIUS_TOLERANCE


@dataclass(frozen=True, slots=True)
class AblationReport:
    only_layer: dict[Layer, list[float]]
    leave_one_out: dict[Layer, list[float]]
    interaction: list[float]


@dataclass(frozen=True, slots=True)
class CompositionReport:
    icm: list[float]
    icm_standard_errors: list[float]
    steps: tuple[CompositionStep, ...]
    ablation: AblationReport

    @property
    def final(self) -> list[float]:
        return self.steps[-1].after if self.steps else self.icm


def _recusar_ruina_incondicional(layer: Layer, operator: LayerOperator) -> None:
    if layer is Layer.F4 and isinstance(operator, OperatorF4Absorption) and np.any(operator.p_ruin > 0):
        raise ValueError(
            "f4 com ruina positiva exige valor de continuacao CONDICIONAL a sobreviver. Na composicao a "
            "entrada e a equidade incondicional, e isso conta a ruina duas vezes; materialize os ramos com "
            "all_in_branch_values."
        )


def _aplicar(layers: Sequence[tuple[Layer, LayerOperator]], x: NDArray[np.float64]) -> NDArray[np.float64]:
    for _, operator in layers:
        x = operator.forward(x)
    return x


def compose_one_at_a_time(
    state: TournamentState,
    layers: Sequence[tuple[Layer, LayerOperator]],
    stack_covariance: NDArray[np.float64] | None = None,
) -> CompositionReport:
    """ICM, depois cada camada acrescentada isoladamente, com a incerteza propagada pela derivada real."""
    if not layers:
        raise ValueError("Informe ao menos uma camada; sem camada, o resultado e o proprio ICM.")
    vistos = [layer for layer, _ in layers]
    if len(set(vistos)) != len(vistos):
        raise ValueError(f"Camada repetida na composicao: {vistos}.")
    for layer, operator in layers:
        _recusar_ruina_incondicional(layer, operator)

    stacks = np.array(state.stacks, dtype=np.float64)
    f1 = OperatorF1Baseline(state.payouts)
    x = f1.forward(stacks)
    if stack_covariance is None:
        stack_covariance = np.diag((stacks * 0.01) ** 2)
    cov = f1.jacobian(stacks) @ stack_covariance @ f1.jacobian(stacks).T
    icm, icm_se = x.copy(), [sqrt(max(0.0, c)) for c in np.diag(cov)]

    passos: list[CompositionStep] = []
    for layer, operator in layers:
        j = derivative(operator, x)
        depois = operator.forward(x)
        cov = j @ cov @ j.T
        passos.append(
            CompositionStep(
                layer=layer,
                before=[float(v) for v in x],
                after=[float(v) for v in depois],
                delta=[float(v) for v in depois - x],
                prize_pool_before=float(np.sum(x)),
                prize_pool_after=float(np.sum(depois)),
                redistribution_radius=tangent_spectral_radius(j),
                standard_errors=[sqrt(max(0.0, c)) for c in np.diag(cov)],
            )
        )
        x = depois

    so_uma = {layer: [float(v) for v in operator.forward(icm) - icm] for layer, operator in layers}
    sem_uma = {
        layer: [float(v) for v in _aplicar([par for par in layers if par[0] is not layer], icm)] for layer, _ in layers
    }
    total = x - icm
    interacao = total - np.sum([np.array(d) for d in so_uma.values()], axis=0)
    return CompositionReport(
        icm=[float(v) for v in icm],
        icm_standard_errors=icm_se,
        steps=tuple(passos),
        ablation=AblationReport(
            only_layer=so_uma,
            leave_one_out=sem_uma,
            interaction=[float(v) for v in interacao],
        ),
    )


def global_radius_depends_on_stack_unit(state: TournamentState, scale: float) -> tuple[float, float]:
    """rho(J1) nas stacks originais e nas mesmas stacks multiplicadas por `scale`. Existe para o teste."""
    f1 = OperatorF1Baseline(state.payouts)
    s = np.array(state.stacks, dtype=np.float64)
    return spectral_radius(f1.jacobian(s)), spectral_radius(f1.jacobian(s * scale, delta=1e-4 * scale))
