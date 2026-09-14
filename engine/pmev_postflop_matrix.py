"""Drift de sizing pos-flop da Aula 1.2 (Raphael Vitoi), medido sobre valores lidos.

CORRECAO DE 2026-09-13, por aprovacao do Tier 0. A versao anterior declarava
frequencias de acao (0.482, 0.285, 0.141, 0.072, 0.020), solver
`HRC-Pro-2.14-Build-97`, seed, 50000 iteracoes, e-Nash 0.08 e checksum
verificado. Nenhum desses valores existe na fonte, no ledger ou no fixture, e
os payouts divergiam do ledger em 7 de 9 posicoes.

ESTE MODULO NAO TEM NUMERO DE EVIDENCIA PROPRIO. O par vem de
`engine.pmev_aula12_evidence`, que le o espelho do fixture curado
(`aula12Pairs.ts`); aqui so se mede sizing sobre ele.

O QUE ISTO NAO AUTORIZA: o par e VALIDO (somas de frequencia fecham) e NAO e
REPRODUTIVEL (build e e-Nash fora do recorte). Nao e calibracao.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import isfinite
from typing import Final

from engine.pmev_aula12_evidence import (
    AULA_1_2_SHA256,
    CANONICAL_PAYOUTS,
    FREQUENCY_SUM_TOLERANCE_PCT,
    EvidenceSide,
    pair_by_key,
)
from engine.pmev_scenario import EvidencePairContract, Read, ScenarioContract
from engine.pmev_spec import Measured, Provenance, Unit

# Cenario-ancora, literal de docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md.
CANONICAL_POT_BB: Final[float] = 5.63
CANONICAL_BTN_STACK_BB: Final[float] = 38.0
CANONICAL_BB_STACK_BB: Final[float] = 53.0
CANONICAL_BTN_RP: Final[float] = 0.214
CANONICAL_BB_RP: Final[float] = 0.129
CANONICAL_DELTA_RP: Final[float] = CANONICAL_BTN_RP - CANONICAL_BB_RP  # +8.5 p.p.

PAR_2_KEY: Final[str] = "PAR_2_IP_APOS_CHECK"

__all__ = [
    "AULA_1_2_SHA256",
    "CANONICAL_BB_RP",
    "CANONICAL_BB_STACK_BB",
    "CANONICAL_BTN_RP",
    "CANONICAL_BTN_STACK_BB",
    "CANONICAL_DELTA_RP",
    "CANONICAL_PAYOUTS",
    "CANONICAL_POT_BB",
    "FREQUENCY_SUM_TOLERANCE_PCT",
    "PAR_2_KEY",
    "PostflopEvidencePair",
    "RegimeNode",
    "SizingBranch",
    "aula_1_2_par_2",
    "create_canonical_postflop_scenario",
]


@dataclass(frozen=True, slots=True)
class SizingBranch:
    """Ramo de aposta como a captura o exibe: sizing em bb e frequencia em pontos percentuais."""

    label: str
    sizing_bb: float
    frequency_pct: float

    def __post_init__(self) -> None:
        if not isfinite(self.sizing_bb) or self.sizing_bb <= 0:
            raise ValueError(f"Sizing de {self.label} deve ser finito e positivo.")
        if not isfinite(self.frequency_pct) or not 0.0 <= self.frequency_pct <= 100.0:
            raise ValueError(f"Frequencia de {self.label} deve estar em [0, 100].")


@dataclass(frozen=True, slots=True)
class RegimeNode:
    """Um lado do par: cenario declarado, acoes passivas e ramos de aposta, sem normalizar."""

    scenario: ScenarioContract
    passive_actions: tuple[tuple[str, float], ...]
    bets: tuple[SizingBranch, ...]

    def __post_init__(self) -> None:
        if not self.bets:
            raise ValueError("RegimeNode exige ao menos um ramo de aposta para medir sizing.")

    @classmethod
    def from_side(cls, lado: EvidenceSide) -> RegimeNode:
        """Separa passivas de apostas pela presenca de sizing. Leitura ilegivel recusa a medida."""
        passivas: list[tuple[str, float]] = []
        apostas: list[SizingBranch] = []
        for acao in lado.actions:
            if not isinstance(acao.frequency_pct, Read):
                raise ValueError(f"{acao.label}: frequencia ilegivel, sizing medio nao se calcula.")
            if acao.sizing_bb is None:
                passivas.append((acao.label, acao.frequency_pct.value))
            elif isinstance(acao.sizing_bb, Read):
                apostas.append(SizingBranch(acao.label, acao.sizing_bb.value, acao.frequency_pct.value))
            else:
                raise ValueError(f"{acao.label}: sizing ilegivel, sizing medio nao se calcula.")
        return cls(scenario=lado.scenario, passive_actions=tuple(passivas), bets=tuple(apostas))

    @property
    def frequency_sum_pct(self) -> float:
        return sum(pct for _, pct in self.passive_actions) + sum(b.frequency_pct for b in self.bets)

    @property
    def aggressive_mass_pct(self) -> float:
        return sum(b.frequency_pct for b in self.bets)

    @property
    def weighted_mean_sizing_bb(self) -> float:
        massa = self.aggressive_mass_pct
        if massa <= 0:
            raise ValueError("Sem massa agressiva o sizing medio nao existe.")
        return sum(b.sizing_bb * b.frequency_pct for b in self.bets) / massa

    @property
    def largest_mass_sizing_bb(self) -> float:
        return max(self.bets, key=lambda b: b.frequency_pct).sizing_bb


@dataclass(frozen=True, slots=True)
class PostflopEvidencePair:
    contract: EvidencePairContract
    board: str
    pot_bb: float
    chip_ev: RegimeNode
    icm_ev: RegimeNode

    def __post_init__(self) -> None:
        if self.chip_ev.scenario is not self.contract.chip_ev or self.icm_ev.scenario is not self.contract.icm_ev:
            raise ValueError("Os nos devem carregar os mesmos cenarios declarados no contrato do par.")

    @property
    def frequency_sums_close(self) -> bool:
        return all(
            abs(no.frequency_sum_pct - 100.0) <= FREQUENCY_SUM_TOLERANCE_PCT for no in (self.chip_ev, self.icm_ev)
        )

    @property
    def is_downward_drift_active(self) -> bool:
        """ICMev desloca a massa agressiva para sizings menores: media ponderada E ramo dominante caem."""
        return (
            self.icm_ev.weighted_mean_sizing_bb < self.chip_ev.weighted_mean_sizing_bb
            and self.icm_ev.largest_mass_sizing_bb < self.chip_ev.largest_mass_sizing_bb
        )


def aula_1_2_par_2() -> PostflopEvidencePair:
    """PAR 2: BTN (IP) age apos o check do BB no flop Kd Jc Ts. Nos 3 (ChipEV) e 41 (ICMev)."""
    par = pair_by_key(PAR_2_KEY)
    if not isinstance(par.board, Read) or not isinstance(par.pot_bb, Read):
        raise ValueError(f"{PAR_2_KEY}: board e pote precisam estar lidos para medir sizing.")
    return PostflopEvidencePair(
        contract=par.contract,
        board=str(par.board.value),
        pot_bb=par.pot_bb.value,
        chip_ev=RegimeNode.from_side(par.chip_ev),
        icm_ev=RegimeNode.from_side(par.icm_ev),
    )


def create_canonical_postflop_scenario() -> Measured[PostflopEvidencePair]:
    """Par 2 da Aula 1.2 como grandeza medida.

    `is_valid` diz se a transcricao fecha (somas de frequencia dentro da
    tolerancia). Reprodutibilidade e outra pergunta, respondida por
    `value.contract.assess_reproducibility()`, e hoje e `False`.
    Frequencias em pontos percentuais: a unidade e adimensional, nao probabilidade.
    """
    pair = aula_1_2_par_2()
    return Measured(
        value=pair,
        unit=Unit.DIMENSIONLESS,
        is_valid=pair.frequency_sums_close,
        provenance=Provenance(
            engine_version=f"Aula 1.2.docx sha256:{AULA_1_2_SHA256}",
            solver_id="GTO Wizard (ChipEV) x HRC (ICMev), build nao lido",
        ),
    )
