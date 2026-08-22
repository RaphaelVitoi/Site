"""Contratos mínimos e verificáveis da PMev v0.1.

Este módulo não declara superioridade da PMev. Ele fixa a fronteira de
compatibilidade: quando as extensões estão desligadas, o estado e a utilidade
devem recuperar o baseline ICMev calculado por Malmuth-Harville.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class PMevTier(StrEnum):
    """Degraus incrementais do programa de validação PMev."""

    BASELINE = "PMev-0"
    DYNAMIC = "PMev-D"
    TRANSITIONS = "PMev-T"
    SKILL = "PMev-S"
    BELIEFS = "PMev-B"
    OPTIONALITY = "PMev-O"
    FULL = "PMev-F"


@dataclass(frozen=True)
class TournamentState:
    """Estado observável mínimo para benchmarks ICM/PMev.

    Todos os valores monetários usam a mesma unidade. Este contrato
    intencionalmente não inclui skill, crenças ou utilidade de carreira: essas
    extensões só entram em módulos posteriores, para evitar dupla contagem.
    """

    stacks: tuple[float, ...]
    payouts: tuple[float, ...]

    def __post_init__(self) -> None:
        if not self.stacks:
            raise ValueError("TournamentState requer ao menos um stack.")
        if any(stack < 0 for stack in self.stacks):
            raise ValueError("Stacks não podem ser negativos.")
        if sum(self.stacks) <= 0:
            raise ValueError("A soma dos stacks deve ser positiva.")
        if not self.payouts:
            raise ValueError("TournamentState requer ao menos um payout.")
        if any(payout < 0 for payout in self.payouts):
            raise ValueError("Payouts não podem ser negativos.")
        if sum(self.payouts) <= 0:
            raise ValueError("A soma dos payouts deve ser positiva.")


@dataclass(frozen=True)
class PMevConfiguration:
    """Configuração declarativa que torna a recuperação do baseline auditável."""

    tier: PMevTier
    dynamic_rewards_enabled: bool = False
    stochastic_transitions_enabled: bool = False
    beliefs_enabled: bool = False
    optionality_enabled: bool = False

    def recovers_icmev(self) -> bool:
        """Retorna ``True`` apenas no caso-base sem extensões ativas."""

        return (
            self.tier is PMevTier.BASELINE
            and not self.dynamic_rewards_enabled
            and not self.stochastic_transitions_enabled
            and not self.beliefs_enabled
            and not self.optionality_enabled
        )
