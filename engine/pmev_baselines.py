"""Baselines da PMev: o que a composicao precisa reproduzir antes de acrescentar qualquer coisa.

Item 5 da ordem vinculante do handoff-2026-09-13-integracao-paralela-pmev-engines, com o
plano da auditoria do mesmo dia: preservar ChipEV, ICMev e FGS como implementacoes
independentes, provar a identidade de reducao PMev-0 = ICMev e manter o modelo aditivo
existente como baseline versionado.

MEDIDO EM 2026-09-13, antes deste modulo: a identidade so passava por ABLACAO. Com os
operadores ligados e parametros neutros, f2 (orbita 0) e f4 (ruina 0) reduziam
exatamente, mas f3 desviava de 5,06 a 21,72 T$: o prior Dirichlet estava fixo em 1,0 e
nao havia elemento neutro. `OperatorF3Behavioral` ganhou `dirichlet_alpha`; o default
continua 1,0, e so `NEUTRAL_CHAIN` o zera.

FGS NAO EXISTE neste repositorio. `fgs_health` em `engine/math_sota.py` e um escalar de
entrada, nao simulacao de jogo futuro. Esta ausencia fica declarada, nao preenchida.
"""

from __future__ import annotations

import importlib
from dataclasses import dataclass
from enum import StrEnum
from math import isfinite
from pathlib import Path
from typing import Final

from engine.pmev_pipeline import PMevCompositionalPipeline
from engine.pmev_spec import TournamentState

RAIZ: Final[Path] = Path(__file__).resolve().parents[1]
ADDITIVE_BASELINE_VERSION: Final[str] = "math_sota.compute_quantum_metrics@v7.0"
ADDITIVE_SNAPSHOT_PATH: Final[Path] = RAIZ / "data" / "pmev_additive_baseline_snapshot.json"


@dataclass(frozen=True, slots=True)
class NeutralChain:
    """Parametros sob os quais cada operador da cadeia e a identidade."""

    risk_aversion: float = 1.0
    dirichlet_alpha: float = 0.0
    orbit_cost_bb: float = 0.0
    p_ruin: float = 0.0


NEUTRAL_CHAIN: Final[NeutralChain] = NeutralChain()

__all__ = [
    "ADDITIVE_BASELINE_VERSION",
    "ADDITIVE_SNAPSHOT_PATH",
    "BASELINES",
    "NEUTRAL_CHAIN",
    "Baseline",
    "BaselineState",
    "NeutralChain",
    "chip_ev_dollars",
    "evaluate_neutral_chain",
    "resolve_implementation",
]


class BaselineState(StrEnum):
    IMPLEMENTED = "implementado"
    NOT_IMPLEMENTED = "nao_implementado"


@dataclass(frozen=True, slots=True)
class Baseline:
    id: str
    descricao: str
    estado: BaselineState
    implementacao: str | None
    limite: str


BASELINES: Final[tuple[Baseline, ...]] = (
    Baseline(
        id="chipEV",
        descricao="valor linear em T$: fracao das fichas vezes o prize pool",
        estado=BaselineState.IMPLEMENTED,
        implementacao="engine.pmev_baselines.chip_ev_dollars",
        limite="limite didatico em MTT, nunca a linha-base da mesa final (PMEV_SPEC_V0_1)",
    ),
    Baseline(
        id="icmEV",
        descricao="Malmuth-Harville exato",
        estado=BaselineState.IMPLEMENTED,
        implementacao="engine.icm_matrix.calculate_malmuth_harville_icm",
        limite="sem blinds, posicao, habilidade nem transicoes futuras",
    ),
    Baseline(
        id="fgs",
        descricao="Future Game Simulation",
        estado=BaselineState.NOT_IMPLEMENTED,
        implementacao=None,
        limite="nenhuma implementacao no repositorio; fgs_health em math_sota e escalar de entrada",
    ),
    Baseline(
        id="aditivo_v7",
        descricao="heuristica aditiva vigente: expectativa menos RIO multiway menos EV do fold",
        estado=BaselineState.IMPLEMENTED,
        implementacao="engine.math_sota.compute_quantum_metrics",
        limite="baseline heuristico versionado, nao teoria final nem saida de solver",
    ),
)


def chip_ev_dollars(stacks: list[float], payouts: list[float]) -> list[float]:
    """ChipEV em T$, independente do codigo de ICM: s_i / S vezes a soma dos premios."""
    if any(not isfinite(v) or v < 0 for v in [*stacks, *payouts]):
        raise ValueError("Stacks e payouts devem ser finitos e nao negativos.")
    total = sum(stacks)
    if not stacks or not payouts or total <= 0:
        return [0.0] * len(stacks)
    pool = sum(payouts[: len(stacks)])
    return [s / total * pool for s in stacks]


def evaluate_neutral_chain(state: TournamentState, neutral: NeutralChain = NEUTRAL_CHAIN) -> list[float]:
    """Cadeia f1..f5 COMPLETA, com todos os operadores ligados sob parametros neutros."""
    n = len(state.stacks)
    pipeline = PMevCompositionalPipeline(risk_aversion=neutral.risk_aversion, dirichlet_alpha=neutral.dirichlet_alpha)
    medido = pipeline.evaluate(
        state,
        orbit_cost_bb=neutral.orbit_cost_bb,
        p_ruin_vector=tuple(neutral.p_ruin for _ in range(n)),
    )
    return list(medido.value.decision_vector)


def resolve_implementation(baseline: Baseline) -> object:
    """Importa a implementacao declarada. Baseline nao implementado nao resolve para nada."""
    if baseline.implementacao is None:
        raise LookupError(f"{baseline.id} esta declarado como nao implementado.")
    modulo, _, nome = baseline.implementacao.rpartition(".")
    return getattr(importlib.import_module(modulo), nome)
