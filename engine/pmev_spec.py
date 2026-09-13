"""Contratos minimos e verificaveis da PMev v0.1.

Este modulo nao declara superioridade empirica da PMev. Ele fixa uma fronteira
de compatibilidade verificavel: com extensoes desligadas, o estado e a
utilidade recuperam o baseline ICMev calculado por Malmuth-Harville.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import isfinite
from typing import Generic, TypeVar

T = TypeVar("T")


class PMevTier(StrEnum):
    """Degraus incrementais do programa de validacao PMev."""

    BASELINE = "PMev-0"
    DYNAMIC = "PMev-D"
    TRANSITIONS = "PMev-T"
    SKILL = "PMev-S"
    BELIEFS = "PMev-B"
    OPTIONALITY = "PMev-O"
    FULL = "PMev-F"


@dataclass(frozen=True)
class TournamentState:
    """Estado observavel minimo para benchmarks ICMev/PMev.

    Todos os valores monetarios usam a mesma unidade. O contrato
    intencionalmente nao inclui habilidade, crencas ou utilidade de carreira:
    extensoes posteriores devem declarar seus operadores para evitar dupla
    contagem.
    """

    stacks: tuple[float, ...]
    payouts: tuple[float, ...]

    def __post_init__(self) -> None:
        # A declaracao aceita sequencias no limite Python; o contrato guarda um
        # snapshot imutavel para que uma mutacao posterior do chamador nao
        # altere um estado que ja passou pela validacao.
        object.__setattr__(self, "stacks", tuple(self.stacks))
        object.__setattr__(self, "payouts", tuple(self.payouts))
        if not self.stacks:
            raise ValueError("TournamentState requer ao menos um stack.")
        if not all(isfinite(stack) for stack in self.stacks) or not all(isfinite(payout) for payout in self.payouts):
            raise ValueError("Stacks e payouts devem conter apenas valores finitos.")
        if any(stack < 0 for stack in self.stacks):
            raise ValueError("Stacks nao podem ser negativos.")
        if sum(self.stacks) <= 0:
            raise ValueError("A soma dos stacks deve ser positiva.")
        if not self.payouts:
            raise ValueError("TournamentState requer ao menos um payout.")
        if len(self.payouts) > len(self.stacks):
            raise ValueError("Os payouts nao podem exceder a quantidade de jogadores ativos.")
        if any(payout < 0 for payout in self.payouts):
            raise ValueError("Payouts nao podem ser negativos.")
        if sum(self.payouts) <= 0:
            raise ValueError("A soma dos payouts deve ser positiva.")


@dataclass(frozen=True)
class PMevConfiguration:
    """Configuracao declarativa que torna a recuperacao do baseline auditavel."""

    tier: PMevTier
    dynamic_rewards_enabled: bool = False
    stochastic_transitions_enabled: bool = False
    beliefs_enabled: bool = False
    optionality_enabled: bool = False

    def recovers_icmev(self) -> bool:
        """Retorna ``True`` apenas no caso-base sem extensoes ativas."""

        return (
            self.tier is PMevTier.BASELINE
            and not self.dynamic_rewards_enabled
            and not self.stochastic_transitions_enabled
            and not self.beliefs_enabled
            and not self.optionality_enabled
        )


class Unit(StrEnum):
    """Unidades fisicas e economicas estritas do arcabouco PMev."""

    TOURNAMENT_DOLLARS = "TournamentDollars"
    CHIPS = "Chips"
    PROBABILITY = "Probability"
    DIMENSIONLESS = "Dimensionless"


@dataclass(frozen=True, slots=True)
class Bounds:
    """Limites de intervalo de confianca estatistico."""

    lower: float
    upper: float
    confidence_level: float = 0.95

    def __post_init__(self) -> None:
        if not isfinite(self.lower) or not isfinite(self.upper) or not isfinite(self.confidence_level):
            raise ValueError("Bounds requer valores finitos.")
        if self.lower > self.upper:
            raise ValueError(f"Limite inferior ({self.lower}) nao pode exceder o superior ({self.upper}).")
        if not (0.0 < self.confidence_level <= 1.0):
            raise ValueError(f"Nivel de confianca deve estar em (0, 1], recebido: {self.confidence_level}.")


@dataclass(frozen=True, slots=True)
class Provenance:
    """Rastreabilidade e proveniencia deterministica de calculo/solver."""

    engine_version: str
    solver_id: str
    seed: int | None = None
    iterations: int | None = None
    nash_distance_epsilon: float | None = None

    def __post_init__(self) -> None:
        if not self.engine_version.strip():
            raise ValueError("Provenance requer engine_version nao vazia.")
        if not self.solver_id.strip():
            raise ValueError("Provenance requer solver_id nao vazio.")
        if self.nash_distance_epsilon is not None and self.nash_distance_epsilon < 0:
            raise ValueError("Distancia de Nash epsilon nao pode ser negativa.")


@dataclass(frozen=True, slots=True)
class Measured(Generic[T]):
    """Contrato estrutural de grandeza mensuravel com incerteza e proveniencia.

    Garante interoperabilidade e paridade de schema entre Python, TypeScript e WASM.
    """

    value: T
    unit: Unit
    is_valid: bool = True
    standard_error: float = 0.0
    confidence_interval: Bounds | None = None
    provenance: Provenance | None = None

    def __post_init__(self) -> None:
        if not isfinite(self.standard_error) or self.standard_error < 0:
            raise ValueError("Erro padrao deve ser finito e nao negativo.")


@dataclass(frozen=True, slots=True)
class AbsorptionState:
    """Representacao formal de estado terminal na barreira absorvente.

    Modela o particionamento exato de Bellman com payout ja garantido na
    eliminacao (k-esima colocacao), sem dupla contagem de ruina.
    """

    place: int
    payout: float
    terminal: bool = True

    def __post_init__(self) -> None:
        if self.place < 1:
            raise ValueError(f"Colocacao de eliminacao invalida: {self.place}.")
        if not isfinite(self.payout) or self.payout < 0:
            raise ValueError(f"Payout de absorcao invalido: {self.payout}.")


class InsufficientDataCalibrationError(RuntimeError):
    """Excecao formal para tentativa de calibracao antes de existir amostra elegivel.

    Estado literal de governanca: DADOS INSUFICIENTES — NENHUMA CALIBRACAO PLANEJADA.
    """

    def __init__(self, message: str = "DADOS INSUFICIENTES — NENHUMA CALIBRACAO PLANEJADA") -> None:
        super().__init__(message)
