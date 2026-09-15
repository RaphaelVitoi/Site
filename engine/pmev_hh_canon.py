"""Estruturas canonicas de premio + estados reais de hand history = cenarios ICM coerentes.

MEDIDO EM 2026-09-14 sobre as maos PokerStars da Drive e da base DB Duckriver:

- Dos 4.861 torneios PS com maos, so 28 tem estrutura de premios COMPLETA e sem bounty
  nos resumos do PokerTracker 4. Eles se reduzem a TRES logicas de premio, sempre com o
  mesmo vetor dentro de cada familia: STT 9 jogadores (3 pagos), SNG de 45 jogadores em 5
  mesas (7 pagos) e Spin 3-max winner-take-all com multiplicador sorteado.
- A estrutura e canonica; o que se adapta e o estado. Toda mao da MESMA familia (mesmo
  buy-in e mesmo max de mesa) herda o vetor de premios do canonico, mesmo sem resumo
  proprio. Stack inicial e escala de blinds nao entram na chave: foram MEDIDOS iguais na
  familia (1500 em 187 de 191 torneios 9-max). A familia 9-max tem 8.991 maos, todas com
  field completo na mesa (soma das fichas = 9 x 1500).
- "Field completo" e medido, nunca presumido: a soma dos stacks da mesa tem de ser o
  field vezes o stack inicial. No SNG de 45 isso so acontece na mesa final; antes dela a
  mesa observada e uma fracao do torneio e NAO e estado ICM.

O gerador produz quantos estados se pedir, e cada um e coerente por construcao: parte de
um estado real da familia, preserva o numero de jogadores, o nivel de blinds e o total de
fichas, e perturba so a distribuicao das fichas. Um estado gerado declara de qual estado
real veio e com qual semente; ele nao finge ser observado.

Nenhum dado de mao nem nome de jogador mora no repositorio. Este modulo le arquivos
locais e o catalogo de estruturas, que so tem numeros.
"""

from __future__ import annotations

import hashlib
import json
import random
import re
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from pathlib import Path
from typing import Final

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_baselines import chip_ev_dollars
from engine.pmev_scenario import Read, Regime, ScenarioContract, Seat, StackUnit, Unreadable

RAIZ: Final[Path] = Path(__file__).resolve().parents[1]
STRUCTURES_PATH: Final[Path] = RAIZ / "data" / "pmev_canonical_structures.json"

__all__ = [
    "STRUCTURES_PATH",
    "CanonicalStructure",
    "CoherentStateGenerator",
    "GeneratedState",
    "HandState",
    "coherence_violations",
    "is_complete_field",
    "load_structures",
    "match_structure",
    "parse_pokerstars_hands",
    "remaining_payouts",
    "to_scenario",
]

_ROMANOS: Final[dict[str, int]] = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}

_CABECALHO = re.compile(
    r"^PokerStars Hand #(?P<mao>\d+): Tournament #(?P<torneio>\d+), (?P<buyin>[^ ]+) (?:USD |EUR )?"
    r"Hold'em No Limit - Level (?P<nivel>[IVXLC]+) \((?P<sb>\d+)/(?P<bb>\d+)\)",
    re.MULTILINE,
)
_MESA = re.compile(r"^Table '\d+ (?P<mesa>\d+)' (?P<max>\d+)-max", re.MULTILINE)
_ASSENTO = re.compile(r"^Seat (?P<assento>\d+): .*? \((?P<fichas>\d+) in chips", re.MULTILINE)
_ANTE = re.compile(r"posts the ante (\d+)")


def _arabico(romano: str) -> int:
    total = 0
    for i, c in enumerate(romano):
        valor = _ROMANOS[c]
        proximo = _ROMANOS[romano[i + 1]] if i + 1 < len(romano) else 0
        total += -valor if valor < proximo else valor
    return total


@dataclass(frozen=True, slots=True)
class HandState:
    """Inicio de uma mao PS: so numeros e numero de assento, nunca nome de jogador."""

    hand_id: int
    tournament_id: str
    buyin: str
    level: int
    small_blind: int
    big_blind: int
    ante: int
    table_max: int
    table: str
    stacks: tuple[tuple[int, int], ...]  # (assento, fichas) no inicio da mao

    @property
    def total_chips(self) -> int:
        return sum(fichas for _, fichas in self.stacks)

    @property
    def fingerprint(self) -> str:
        """Identidade estavel do estado real, para declarar a origem de um estado gerado."""
        return hashlib.sha256(f"{self.tournament_id}:{self.hand_id}".encode()).hexdigest()[:16]


def parse_pokerstars_hands(text: str) -> Iterator[HandState]:
    """Le todas as maos de torneio PS de um texto. Mao sem cabecalho de mesa e ignorada.

    O ante e procurado SO dentro do bloco da propria mao, ate as cartas fechadas: uma janela
    fixa de caracteres atravessava para a mao seguinte e atribuia ante a Spins, que nao tem.
    """
    texto = text.replace("\r\n", "\n")
    cabecalhos = list(_CABECALHO.finditer(texto))
    for i, cab in enumerate(cabecalhos):
        fim = cabecalhos[i + 1].start() if i + 1 < len(cabecalhos) else len(texto)
        bloco = texto[cab.start() : fim]
        pre_cartas = bloco.split("*** HOLE CARDS ***", 1)[0]
        mesa = _MESA.search(pre_cartas)
        assentos = tuple((int(a["assento"]), int(a["fichas"])) for a in _ASSENTO.finditer(pre_cartas))
        if mesa is None or not assentos:
            continue
        ante = _ANTE.search(pre_cartas)
        yield HandState(
            hand_id=int(cab["mao"]),
            tournament_id=cab["torneio"],
            buyin=cab["buyin"],
            level=_arabico(cab["nivel"]),
            small_blind=int(cab["sb"]),
            big_blind=int(cab["bb"]),
            ante=int(ante.group(1)) if ante else 0,
            table_max=int(mesa["max"]),
            table=mesa["mesa"],
            stacks=assentos,
        )


@dataclass(frozen=True, slots=True)
class CanonicalStructure:
    """Logica de premio de uma familia, lida de um resumo com estrutura completa."""

    id: str
    buyin: str
    table_max: int
    field: int
    starting_stack: int
    payout_fractions: tuple[float, ...]
    reference_prize_pool: float
    winner_take_all: bool
    canonical_tournaments: tuple[str, ...]
    blind_levels: dict[int, tuple[int, int, int]]

    def __post_init__(self) -> None:
        if self.field < 2 or self.starting_stack <= 0:
            raise ValueError(f"{self.id}: field e stack inicial devem ser positivos.")
        if not self.payout_fractions or len(self.payout_fractions) > self.field:
            raise ValueError(f"{self.id}: vetor de premios vazio ou maior que o field.")
        if abs(sum(self.payout_fractions) - 1.0) > 1e-9:
            raise ValueError(f"{self.id}: fracoes de premio devem somar 1, somam {sum(self.payout_fractions)}.")
        if self.winner_take_all != (len(self.payout_fractions) == 1):
            raise ValueError(f"{self.id}: winner_take_all incoerente com o vetor de premios.")

    @property
    def total_chips(self) -> int:
        return self.field * self.starting_stack


def load_structures(path: Path = STRUCTURES_PATH) -> dict[str, CanonicalStructure]:
    dados = json.loads(path.read_text(encoding="utf-8"))
    estruturas = {}
    for e in dados["estruturas"]:
        estruturas[e["id"]] = CanonicalStructure(
            id=e["id"],
            buyin=e["buyin"],
            table_max=e["table_max"],
            field=e["field"],
            starting_stack=e["starting_stack"],
            payout_fractions=tuple(e["payout_fractions"]),
            reference_prize_pool=e["reference_prize_pool"],
            winner_take_all=e["winner_take_all"],
            canonical_tournaments=tuple(e["canonical_tournaments"]),
            blind_levels={int(k): tuple(v) for k, v in e["blind_levels"].items()},
        )
    return estruturas


def match_structure(hand: HandState, structures: Iterable[CanonicalStructure]) -> CanonicalStructure | None:
    """Familia pelo formato da mao: buy-in e max da mesa iguais aos do canonico."""
    for estrutura in structures:
        if hand.buyin == estrutura.buyin and hand.table_max == estrutura.table_max:
            return estrutura
    return None


def is_complete_field(hand: HandState, structure: CanonicalStructure) -> bool:
    """Estado ICM so existe se a mesa contem todas as fichas do torneio."""
    return hand.total_chips == structure.total_chips


def remaining_payouts(structure: CanonicalStructure, players_left: int, prize_pool: float) -> tuple[float, ...]:
    """Premios em disputa: com r jogadores vivos, os r melhores lugares ainda nao foram pagos."""
    if players_left < 1 or players_left > structure.field:
        raise ValueError(f"{structure.id}: {players_left} jogadores vivos fora de 1..{structure.field}.")
    if prize_pool <= 0:
        raise ValueError("prize_pool deve ser positivo.")
    return tuple(f * prize_pool for f in structure.payout_fractions[:players_left])


def coherence_violations(stacks: tuple[int, ...], level: int, structure: CanonicalStructure) -> list[str]:
    """Todas as violacoes, nao so a primeira: estado incoerente precisa dizer por que."""
    violacoes: list[str] = []
    r = len(stacks)
    if not 2 <= r <= min(structure.field, structure.table_max):
        violacoes.append(
            f"{r} jogadores numa mesa de estado completo; esperado 2..{min(structure.field, structure.table_max)}"
        )
    if any(s <= 0 for s in stacks):
        violacoes.append("stack nao positivo entre jogadores vivos")
    if sum(stacks) != structure.total_chips:
        violacoes.append(f"soma das fichas {sum(stacks)} != field x inicial {structure.total_chips}")
    if level not in structure.blind_levels:
        violacoes.append(f"nivel {level} fora da escala medida da familia")
    return violacoes


def to_scenario(
    stacks: tuple[int, ...], structure: CanonicalStructure, prize_pool: float | None = None
) -> ScenarioContract:
    """Cenario ICMev do contrato existente. Ranges e politica: a HH nao os revela."""
    pool = structure.reference_prize_pool if prize_pool is None else prize_pool
    return ScenarioContract(
        regime=Regime.ICM_EV,
        stack_unit=StackUnit.CHIPS,
        seats=tuple(Seat(seat_id=f"seat_{i + 1}", stack=Read(float(s))) for i, s in enumerate(stacks)),
        ranges=Unreadable("hand history nao revela ranges"),
        provenance=None,
        horizon=Read("inicio da mao"),
        agent_policy=Unreadable("hand history nao revela politica dos agentes"),
        payouts=Read(remaining_payouts(structure, len(stacks), pool)),
    )


@dataclass(frozen=True, slots=True)
class GeneratedState:
    structure_id: str
    level: int
    stacks: tuple[int, ...]
    source_fingerprint: str
    seed: int
    concentration: float
    icm_ev: tuple[float, ...]
    chip_ev: tuple[float, ...]


def _distribuir_inteiro(pesos: list[float], total: int, minimo: int) -> list[int]:
    """Fichas inteiras que somam exatamente `total`, cada uma >= minimo (maiores restos)."""
    livre = total - minimo * len(pesos)
    soma = sum(pesos)
    brutos = [livre * p / soma for p in pesos]
    base = [int(b) for b in brutos]
    faltam = livre - sum(base)
    for i in sorted(range(len(pesos)), key=lambda k: brutos[k] - base[k], reverse=True)[:faltam]:
        base[i] += 1
    return [b + minimo for b in base]


class CoherentStateGenerator:
    """Infinitos estados coerentes por familia, ancorados em estados reais completos.

    Cada amostra: escolhe um estado real completo (preserva jogadores vivos e nivel), sorteia
    fracoes de fichas por Dirichlet centrada nas fracoes reais e redistribui o total exato de
    fichas em inteiros com stack minimo de 1 ficha -- stack abaixo de 1 big blind existe nas
    maos reais e cortar o suporte ali mudaria a familia. `concentration` alta fica perto do
    real; baixa explora a vizinhanca. O ICM sai do kernel exato do repositorio.
    """

    def __init__(
        self,
        structure: CanonicalStructure,
        real_states: Iterable[HandState],
        seed: int,
        concentration: float = 50.0,
    ) -> None:
        if concentration <= 0:
            raise ValueError("concentration deve ser positiva.")
        self.structure = structure
        self.seed = seed
        self.concentration = concentration
        self._rng = random.Random(seed)
        self._reais = [
            h
            for h in real_states
            if match_structure(h, [structure]) is structure
            and is_complete_field(h, structure)
            and not coherence_violations(tuple(f for _, f in h.stacks), h.level, structure)
        ]
        if not self._reais:
            raise ValueError(f"{structure.id}: nenhum estado real completo e coerente para ancorar o gerador.")

    @property
    def anchors(self) -> int:
        return len(self._reais)

    def sample(self) -> GeneratedState:
        real = self._rng.choice(self._reais)
        fichas = [f for _, f in real.stacks]
        total = self.structure.total_chips
        pesos = [self._rng.gammavariate(self.concentration * f / total, 1.0) + 1e-12 for f in fichas]
        stacks = tuple(_distribuir_inteiro(pesos, total, minimo=1))
        violacoes = coherence_violations(stacks, real.level, self.structure)
        if violacoes:  # defesa: a construcao garante; se falhar, e defeito do gerador
            raise AssertionError(f"estado gerado incoerente: {violacoes}")
        premios = list(remaining_payouts(self.structure, len(stacks), self.structure.reference_prize_pool))
        return GeneratedState(
            structure_id=self.structure.id,
            level=real.level,
            stacks=stacks,
            source_fingerprint=real.fingerprint,
            seed=self.seed,
            concentration=self.concentration,
            icm_ev=tuple(calculate_malmuth_harville_icm([float(s) for s in stacks], premios)),
            chip_ev=tuple(chip_ev_dollars([float(s) for s in stacks], premios)),
        )

    def __iter__(self) -> Iterator[GeneratedState]:
        while True:
            yield self.sample()
