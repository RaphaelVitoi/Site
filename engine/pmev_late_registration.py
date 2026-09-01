"""Benchmark H9: conservacao de valor em late registration.

O modulo usa o ICM exato do repositorio para fields pequenos. Nao infere ROI,
habilidade, estrutura futura ou justica normativa da regra de registro; mede a
identidade contabil que uma transicao conservativa precisa satisfazer.
"""

from __future__ import annotations

from dataclasses import dataclass

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_spec import TournamentState


@dataclass(frozen=True)
class LateRegistrationScenario:
    """Transicao deterministica de entrada tardia para H9.

    ``payouts_after`` deve adicionar exatamente ``net_contribution`` ao prize
    pool anterior. Rake, overlay, bounties e alteracoes de payout exigem
    operadores proprios e sao rejeitados neste benchmark-base.
    """

    before: TournamentState
    entrant_stack: float
    net_contribution: float
    payouts_after: tuple[float, ...]

    def __post_init__(self) -> None:
        if self.entrant_stack <= 0:
            raise ValueError("O stack inicial do entrante deve ser positivo.")
        if self.net_contribution < 0:
            raise ValueError("A contribuicao liquida nao pode ser negativa.")
        if not self.payouts_after or any(payout < 0 for payout in self.payouts_after):
            raise ValueError("Payouts posteriores devem ser nao negativos e nao vazios.")
        expected_pool = sum(self.before.payouts) + self.net_contribution
        if abs(sum(self.payouts_after) - expected_pool) > 1e-9:
            raise ValueError(
                "H9 exige transicao conservativa: payouts_after deve somar prize_pool_before + net_contribution."
            )


@dataclass(frozen=True)
class LateRegistrationResult:
    """Resultado auditavel de uma execucao H9 exata."""

    incumbent_equities_before: tuple[float, ...]
    incumbent_equities_after: tuple[float, ...]
    incumbent_deltas: tuple[float, ...]
    entrant_equity: float
    entrant_bonus: float
    conservation_residual: float

    @property
    def conserved(self) -> bool:
        """Se a identidade contabil do cenario fecha dentro da tolerancia."""

        return abs(self.conservation_residual) <= 1e-9


def evaluate_late_registration(scenario: LateRegistrationScenario) -> LateRegistrationResult:
    """Avalia a identidade H9 sob ICMev/Malmuth-Harville exato.

    A conservacao e ``sum(delta_incumbents) + entrant_bonus = 0``. O bonus do
    entrante e sua equity ICMev apos a entrada menos a contribuicao liquida
    adicionada ao prize pool.
    """

    before_equities = tuple(calculate_malmuth_harville_icm(list(scenario.before.stacks), list(scenario.before.payouts)))
    after_stacks = [*scenario.before.stacks, scenario.entrant_stack]
    after_equities = tuple(calculate_malmuth_harville_icm(after_stacks, list(scenario.payouts_after)))
    incumbent_after = after_equities[:-1]
    incumbent_deltas = tuple(after - before for after, before in zip(incumbent_after, before_equities, strict=True))
    entrant_equity = after_equities[-1]
    entrant_bonus = entrant_equity - scenario.net_contribution
    conservation_residual = sum(incumbent_deltas) + entrant_bonus

    return LateRegistrationResult(
        incumbent_equities_before=before_equities,
        incumbent_equities_after=incumbent_after,
        incumbent_deltas=incumbent_deltas,
        entrant_equity=entrant_equity,
        entrant_bonus=entrant_bonus,
        conservation_residual=conservation_residual,
    )
