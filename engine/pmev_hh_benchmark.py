"""Benchmark do item 9: ICM contra ChipEV nos estados reais de hand history, com o resultado observado.

O estado de cada mao vem de `engine.pmev_hh_canon` (field completo medido pela soma das
fichas). O RESULTADO vem da propria hand history: a PokerStars escreve na mao em que o
jogador sai "<nome> finished the tournament in Nth place", e "<nome> wins the tournament"
para o campeao. O lugar final do heroi -- o dono da mao, `Dealt to` -- e portanto sempre
observado, tambem nos torneios sem resumo.

Nomes de jogador so existem dentro de uma chamada: a observacao guarda assento, stacks e
lugar, nunca nome.

Metricas, todas sobre o heroi em cada estado:
- Brier multiclasse e log-loss da distribuicao de lugar final (Malmuth-Harville) contra o
  modelo uniforme 1/r, que e a referencia sem informacao de fichas;
- Brier do evento ITM;
- erro quadratico do premio realizado contra o $EV do ICM e contra o ChipEV.

ChipEV nao define distribuicao de lugares -- so valor. Por isso ele e comparado no premio,
e o uniforme e a referencia nas metricas de probabilidade. Nenhum modelo tem parametro
ajustado aqui: toda a avaliacao e fora da amostra por construcao. Estados da mesma mao de
torneio sao correlacionados, e o intervalo e bootstrap por TORNEIO, nunca por mao.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
import math
import random
import re
from statistics import fmean
from typing import Final

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_baselines import chip_ev_dollars
from engine.pmev_hh_canon import CanonicalStructure, is_complete_field, match_structure, parse_pokerstars_hands

__all__ = [
    "BenchmarkReport",
    "HeroObservation",
    "MetricSummary",
    "hero_observations",
    "place_probabilities",
    "run_benchmark",
    "score_observation",
]

_CABECALHO: Final = re.compile(r"^PokerStars Hand #(\d+): Tournament #(\d+),", re.MULTILINE)
_DEALT: Final = re.compile(r"^Dealt to (.+?) \[", re.MULTILINE)
_FINAL: Final = re.compile(r"^(.+?) finished the tournament in (\d+)(?:st|nd|rd|th) place", re.MULTILINE)
_CAMPEAO: Final = re.compile(r"^(.+?) wins the tournament", re.MULTILINE)
_EPS: Final[float] = 1e-12


@dataclass(frozen=True, slots=True)
class HeroObservation:
    tournament_id: str
    hand_id: int
    level: int
    stacks: tuple[int, ...]  # na ordem dos assentos
    hero_index: int
    hero_place: int

    @property
    def players_left(self) -> int:
        return len(self.stacks)


def hero_observations(text: str, structure: CanonicalStructure) -> Iterator[HeroObservation]:
    """Estados completos da familia com o lugar final do heroi observado na propria HH."""
    texto = text.replace("\r\n", "\n")
    cabecalhos = list(_CABECALHO.finditer(texto))
    lugares: dict[tuple[str, str], int] = {}
    heroi_da_mao: dict[int, str] = {}
    assentos_da_mao: dict[int, list[str]] = {}
    for i, cab in enumerate(cabecalhos):
        fim = cabecalhos[i + 1].start() if i + 1 < len(cabecalhos) else len(texto)
        bloco = texto[cab.start() : fim]
        tid = cab.group(2)
        for nome, lugar in _FINAL.findall(bloco):
            lugares[(tid, nome)] = int(lugar)
        for nome in _CAMPEAO.findall(bloco):
            lugares[(tid, nome)] = 1
        pre = bloco.split("*** HOLE CARDS ***", 1)
        if len(pre) == 2:
            dealt = _DEALT.search(pre[1])
            if dealt:
                heroi_da_mao[int(cab.group(1))] = dealt.group(1)
        assentos_da_mao[int(cab.group(1))] = re.findall(r"^Seat \d+: (.+?) \(\d+ in chips", pre[0], re.MULTILINE)

    for mao in parse_pokerstars_hands(texto):
        if match_structure(mao, [structure]) is not structure or not is_complete_field(mao, structure):
            continue
        heroi = heroi_da_mao.get(mao.hand_id)
        nomes = assentos_da_mao.get(mao.hand_id, [])
        if heroi is None or heroi not in nomes or len(nomes) != len(mao.stacks):
            continue
        lugar = lugares.get((mao.tournament_id, heroi))
        if lugar is None or not 1 <= lugar <= len(mao.stacks):
            continue  # lugar ausente ou incoerente com os vivos: fora, nunca completado
        yield HeroObservation(
            tournament_id=mao.tournament_id,
            hand_id=mao.hand_id,
            level=mao.level,
            stacks=tuple(f for _, f in mao.stacks),
            hero_index=nomes.index(heroi),
            hero_place=lugar,
        )


def place_probabilities(stacks: tuple[int, ...], player: int) -> list[float]:
    """P(jogador termina em k), k = 1..r, pelo kernel Malmuth-Harville com premio unitario."""
    r = len(stacks)
    fichas = [float(s) for s in stacks]
    return [calculate_malmuth_harville_icm(fichas, [0.0] * k + [1.0])[player] for k in range(r)]


@dataclass(frozen=True, slots=True)
class ScoredObservation:
    tournament_id: str
    brier_icm: float
    brier_uniforme: float
    logloss_icm: float
    logloss_uniforme: float
    brier_itm_icm: float
    brier_itm_uniforme: float
    erro2_premio_icm: float
    erro2_premio_chip: float


def score_observation(obs: HeroObservation, structure: CanonicalStructure) -> ScoredObservation:
    r = obs.players_left
    p = place_probabilities(obs.stacks, obs.hero_index)
    u = [1.0 / r] * r
    real = [1.0 if k + 1 == obs.hero_place else 0.0 for k in range(r)]
    pagos = min(len(structure.payout_fractions), r)
    premios = [f * structure.reference_prize_pool for f in structure.payout_fractions[:r]]
    realizado = premios[obs.hero_place - 1] if obs.hero_place <= len(premios) else 0.0
    itm_real = 1.0 if obs.hero_place <= pagos else 0.0
    fichas = [float(s) for s in obs.stacks]
    return ScoredObservation(
        tournament_id=obs.tournament_id,
        brier_icm=sum((a - b) ** 2 for a, b in zip(p, real, strict=True)),
        brier_uniforme=sum((a - b) ** 2 for a, b in zip(u, real, strict=True)),
        logloss_icm=-math.log(max(p[obs.hero_place - 1], _EPS)),
        logloss_uniforme=-math.log(1.0 / r),
        brier_itm_icm=(sum(p[:pagos]) - itm_real) ** 2,
        brier_itm_uniforme=(pagos / r - itm_real) ** 2,
        erro2_premio_icm=(calculate_malmuth_harville_icm(fichas, premios)[obs.hero_index] - realizado) ** 2,
        erro2_premio_chip=(chip_ev_dollars(fichas, premios)[obs.hero_index] - realizado) ** 2,
    )


@dataclass(frozen=True, slots=True)
class MetricSummary:
    modelo: float
    referencia: float
    diferenca: float  # modelo - referencia; negativo = modelo melhor
    ic95: tuple[float, float]


@dataclass(frozen=True, slots=True)
class BenchmarkReport:
    observacoes: int
    torneios: int
    brier_lugar: MetricSummary  # ICM x uniforme
    logloss_lugar: MetricSummary  # ICM x uniforme
    brier_itm: MetricSummary  # ICM x uniforme
    erro2_premio: MetricSummary  # ICM x ChipEV


def _bootstrap(por_torneio: dict[str, list[tuple[float, float]]], n_boot: int, rng: random.Random) -> MetricSummary:
    pares = [par for lista in por_torneio.values() for par in lista]
    modelo, ref = fmean(a for a, _ in pares), fmean(b for _, b in pares)
    chaves = list(por_torneio)
    difs = []
    for _ in range(n_boot):
        amostra = [par for c in (rng.choice(chaves) for _ in chaves) for par in por_torneio[c]]
        difs.append(fmean(a - b for a, b in amostra))
    difs.sort()
    return MetricSummary(modelo, ref, modelo - ref, (difs[int(0.025 * (n_boot - 1))], difs[int(0.975 * (n_boot - 1))]))


def run_benchmark(
    observations: Iterable[HeroObservation], structure: CanonicalStructure, n_boot: int = 2000, seed: int = 0
) -> BenchmarkReport:
    notas = [score_observation(o, structure) for o in observations]
    if not notas:
        raise ValueError("benchmark sem observacoes: nada medido nao e resultado.")
    rng = random.Random(seed)  # noqa: S311 - bootstrap reprodutivel por seed, nao criptografia  # Record-Id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
    metricas: dict[str, dict[str, list[tuple[float, float]]]] = defaultdict(lambda: defaultdict(list))
    for n in notas:
        metricas["brier"][n.tournament_id].append((n.brier_icm, n.brier_uniforme))
        metricas["logloss"][n.tournament_id].append((n.logloss_icm, n.logloss_uniforme))
        metricas["itm"][n.tournament_id].append((n.brier_itm_icm, n.brier_itm_uniforme))
        metricas["premio"][n.tournament_id].append((n.erro2_premio_icm, n.erro2_premio_chip))
    return BenchmarkReport(
        observacoes=len(notas),
        torneios=len({n.tournament_id for n in notas}),
        brier_lugar=_bootstrap(metricas["brier"], n_boot, rng),
        logloss_lugar=_bootstrap(metricas["logloss"], n_boot, rng),
        brier_itm=_bootstrap(metricas["itm"], n_boot, rng),
        erro2_premio=_bootstrap(metricas["premio"], n_boot, rng),
    )
