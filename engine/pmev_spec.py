"""Contratos minimos e verificaveis da PMev v0.1.

Este modulo nao declara superioridade empirica da PMev. Ele fixa uma fronteira
de compatibilidade verificavel: com extensoes desligadas, o estado e a
utilidade recuperam o baseline ICMev calculado por Malmuth-Harville.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


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
        if not self.stacks:
            raise ValueError("TournamentState requer ao menos um stack.")
        if any(stack < 0 for stack in self.stacks):
            raise ValueError("Stacks nao podem ser negativos.")
        if sum(self.stacks) <= 0:
            raise ValueError("A soma dos stacks deve ser positiva.")
        if not self.payouts:
            raise ValueError("TournamentState requer ao menos um payout.")
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
