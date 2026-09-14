"""Contrato de cenario PMev: o que um numero de solver precisa declarar para ser comparavel.

Item 3 da ordem vinculante do handoff-2026-09-13-integracao-paralela-pmev-engines:
tipar unidades, regime, stacks, payouts, ranges, solver/build, e-Nash, seed,
horizonte e politica dos agentes ANTES de qualquer coeficiente.

Espelha no Python o contrato de evidencia do simulador
(frontend/src/components/simulator/solver/evidenceContract.ts), sem criar um
segundo significado:

- "nao lido" e diferente de "lido como zero". Todo campo que uma captura pode
  deixar de mostrar e um `Reading`: `Read(valor)` ou `Unreadable(motivo)`.
- Nada e inferido nem completado. Campo ausente e reportado.
- VALIDO e REPRODUTIVEL sao coisas diferentes. Reprodutivel exige build e
  e-Nash com unidade nos dois regimes do par (`assessReproducibility` no TS).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import StrEnum
from math import isfinite
from typing import Generic, TypeVar

T = TypeVar("T")

__all__ = [
    "ENashUnit",
    "EvidencePairContract",
    "Read",
    "Reading",
    "Regime",
    "ReproducibilityAssessment",
    "ScenarioContract",
    "Seat",
    "SolverProvenance",
    "StackUnit",
    "Unreadable",
    "count_reproducible_pairs",
]


@dataclass(frozen=True, slots=True)
class Read(Generic[T]):
    """Valor efetivamente lido da fonte."""

    value: T


@dataclass(frozen=True, slots=True)
class Unreadable:
    """Valor que a fonte nao mostra. NAO e zero e NAO e ausencia de acao."""

    reason: str

    def __post_init__(self) -> None:
        if not self.reason.strip():
            raise ValueError("Unreadable exige o motivo: ausencia sem motivo nao e auditavel.")


type Reading[V] = Read[V] | Unreadable


class Regime(StrEnum):
    """Regime de calculo do solver. Valores iguais aos do contrato TypeScript."""

    CHIP_EV = "chipEV"
    ICM_EV = "icmEV"


class StackUnit(StrEnum):
    BIG_BLINDS = "bb"
    CHIPS = "chips"


class ENashUnit(StrEnum):
    """Unidade do e-Nash. Sem padrao, de proposito: `pct` e `pctOfPot` diferem."""

    PCT = "pct"
    PCT_OF_POT = "pctOfPot"
    BB = "bb"
    BB_PER_100 = "bbPer100"
    CHIPS = "chips"


_SEM_ENASH = Unreadable("sem e-Nash lido, a unidade nao descreve nada")
_SEED_NAO_DECLARADA = Unreadable("seed nao declarada pela fonte")


def _read_value(reading: Read[T]) -> T:
    """Extrai o valor de um Read garantido por isinstance."""
    return reading.value


@dataclass(frozen=True, slots=True)
class SolverProvenance:
    """O que separa transcricao de medicao.

    `seed` e tipada mas nao entra na reprodutibilidade, como no TypeScript: o HRC
    nao expoe seed de Monte Carlo, e exigi-la tornaria o portao inalcancavel.
    """

    solver: str
    build: Reading[str]
    e_nash: Reading[float]
    e_nash_unit: Reading[ENashUnit] = _SEM_ENASH
    seed: Reading[int] = _SEED_NAO_DECLARADA

    def __post_init__(self) -> None:
        if not self.solver.strip():
            raise ValueError("SolverProvenance exige o nome do solver.")
        build = self.build
        if isinstance(build, Read):
            if not str(_read_value(build)).strip():
                raise ValueError("Build lido nao pode ser vazio; use Unreadable.")
        e_nash = self.e_nash
        if isinstance(e_nash, Read):
            val_e_nash = _read_value(e_nash)
            if not isfinite(val_e_nash) or val_e_nash < 0:
                raise ValueError(f"e-Nash lido deve ser finito e nao negativo, recebido {val_e_nash}.")
        seed = self.seed
        if isinstance(seed, Read):
            val_seed = _read_value(seed)
            if val_seed < 0:
                raise ValueError("Seed lida nao pode ser negativa.")

    def missing_fields(self) -> list[str]:
        """Mesmos nomes de `camposDeProcedenciaFaltando` no TypeScript."""
        faltando: list[str] = []
        if isinstance(self.build, Unreadable):
            faltando.append("build")
        if isinstance(self.e_nash, Unreadable):
            faltando.append("eNash")
        elif isinstance(self.e_nash_unit, Unreadable):
            faltando.append("eNashUnit")
        return faltando


@dataclass(frozen=True, slots=True)
class Seat:
    seat_id: str
    stack: Reading[float]

    def __post_init__(self) -> None:
        if not self.seat_id.strip():
            raise ValueError("Seat exige identificador.")
        stack = self.stack
        if isinstance(stack, Read):
            val_stack = _read_value(stack)
            if not isfinite(val_stack) or val_stack < 0:
                raise ValueError(f"Stack lida de {self.seat_id} deve ser finita e nao negativa.")


@dataclass(frozen=True, slots=True)
class ScenarioContract:
    """Estado declarado de um spot, como UM solver o modela.

    `payouts` e None em ChipEV (o regime nao usa premios) e obrigatorio em ICMev,
    lido ou nao. Declarar payouts num cenario ChipEV sugeriria ICM onde nao ha.
    """

    regime: Regime
    stack_unit: StackUnit
    seats: tuple[Seat, ...]
    ranges: Reading[str]
    provenance: SolverProvenance | None
    horizon: Reading[str]
    agent_policy: Reading[str]
    payouts: Reading[tuple[float, ...]] | None = None

    def __post_init__(self) -> None:
        if not self.seats:
            raise ValueError("ScenarioContract exige ao menos um assento.")
        ids = [s.seat_id for s in self.seats]
        if len(set(ids)) != len(ids):
            raise ValueError(f"Assentos repetidos: {ids}.")
        if self.regime is Regime.CHIP_EV and self.payouts is not None:
            raise ValueError("ChipEV nao usa payouts; declare-os so no cenario ICMev.")
        if self.regime is Regime.ICM_EV and self.payouts is None:
            raise ValueError("ICMev exige payouts, lidos ou Unreadable com motivo.")
        if isinstance(self.payouts, Read):
            valores = self.payouts.value
            if not valores or any(not isfinite(v) or v < 0 for v in valores) or sum(valores) <= 0:
                raise ValueError("Payouts lidos devem ser finitos, nao negativos e com soma positiva.")

    @property
    def missing_provenance(self) -> list[str]:
        # Sem bloco de procedencia, o TypeScript reporta ['provenance'] (camposDeProcedenciaFaltando).
        return ["provenance"] if self.provenance is None else self.provenance.missing_fields()

    @property
    def is_reproducible(self) -> bool:
        return not self.missing_provenance


@dataclass(frozen=True, slots=True)
class ReproducibilityAssessment:
    reproducible: bool
    missing_chip_ev: list[str] = field(default_factory=list)
    missing_icm_ev: list[str] = field(default_factory=list)


_SHA256 = re.compile(r"^[0-9a-f]{64}$")


@dataclass(frozen=True, slots=True)
class EvidencePairContract:
    """O MESMO no de decisao resolvido nos dois regimes."""

    document_sha256: str
    figure_index: int
    node_label: str
    chip_ev: ScenarioContract
    icm_ev: ScenarioContract

    def __post_init__(self) -> None:
        if not _SHA256.match(self.document_sha256):
            raise ValueError("document_sha256 deve ter 64 hexadecimais minusculos.")
        if self.figure_index < 0:
            raise ValueError("figure_index e 0-based e nao pode ser negativo.")
        if not self.node_label.strip():
            raise ValueError("node_label exige o rotulo da captura.")
        if self.chip_ev.regime is not Regime.CHIP_EV or self.icm_ev.regime is not Regime.ICM_EV:
            raise ValueError("O par exige chip_ev em ChipEV e icm_ev em ICMev.")

    def assess_reproducibility(self) -> ReproducibilityAssessment:
        chip, icm = self.chip_ev.missing_provenance, self.icm_ev.missing_provenance
        return ReproducibilityAssessment(reproducible=not chip and not icm, missing_chip_ev=chip, missing_icm_ev=icm)


def count_reproducible_pairs(pairs: tuple[EvidencePairContract, ...] | list[EvidencePairContract]) -> int:
    """Quantos pares sao reproduziveis. Contar validade no lugar disto abre a calibracao cedo."""
    return sum(1 for p in pairs if p.assess_reproducibility().reproducible)
