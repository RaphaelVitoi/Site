"""Artefato publico do benchmark ICM x ChipEV: o recorte que o site pode mostrar.

Molde do caminho dado -> site nesta base:

    hand history local -> pmev_hh_canon (estado coerente) -> pmev_hh_benchmark (metrica)
    -> ESTE modulo (agregado publico, com contrato) -> JSON versionado no frontend
    -> contrato TypeScript validado em runtime -> pagina

O que sai daqui e o que um leitor pode ver sem expor ninguem: metricas com intervalo,
curvas de calibracao agregadas em faixas e uma amostra pequena de estados reais com
stacks, blinds e o lugar final do dono das maos. Nao sai nome de jogador, id de torneio
nem id de mao. O digest permite provar que dois artefatos vieram da mesma amostra sem
publica-la.

A saida e deterministica: mesma amostra, mesma semente e mesma data geram o mesmo JSON.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Mapping, Sequence
import hashlib
from statistics import fmean
from typing import Any, Final

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_baselines import chip_ev_dollars
from engine.pmev_hh_benchmark import (
    HeroObservation,
    MetricSummary,
    place_probabilities,
    run_benchmark,
    score_observation,
)
from engine.pmev_hh_canon import CanonicalStructure

SCHEMA_VERSION: Final[str] = "pmev-benchmark-icm-chipev/v1"
FAIXAS: Final[int] = 10
AMOSTRAS_POR_ESTRUTURA: Final[int] = 12
_CASAS: Final[int] = 6

__all__ = ["AMOSTRAS_POR_ESTRUTURA", "SCHEMA_VERSION", "build_public_dataset", "structure_label"]


def structure_label(structure: CanonicalStructure) -> str:
    if structure.winner_take_all:
        # Dois Spins so diferem pelo buy-in; sem ele, o rotulo repetido nao distingue as familias.
        return f"Spin {structure.field}-max de {structure.buyin}, vencedor leva tudo"
    if structure.field <= structure.table_max:
        return f"STT {structure.field} jogadores, {len(structure.payout_fractions)} pagos"
    return f"SNG {structure.field} jogadores, mesa final, {len(structure.payout_fractions)} pagos"


def _r(valor: float) -> float:
    return round(valor, _CASAS)


def _metrica(m: MetricSummary) -> dict[str, Any]:
    return {
        "modelo": _r(m.modelo),
        "referencia": _r(m.referencia),
        "diferenca": _r(m.diferenca),
        "ic95": [_r(m.ic95[0]), _r(m.ic95[1])],
    }


def _faixas(pares: Sequence[tuple[float, float]]) -> list[dict[str, Any]]:
    """Faixas iguais de [0, 1] na coordenada prevista; so faixas com observacao."""
    grupos: dict[int, list[tuple[float, float]]] = defaultdict(list)
    for previsto, observado in pares:
        grupos[min(int(previsto * FAIXAS), FAIXAS - 1)].append((previsto, observado))
    return [
        {
            "de": _r(k / FAIXAS),
            "ate": _r((k + 1) / FAIXAS),
            "n": len(g),
            "previsto": _r(fmean(p for p, _ in g)),
            "observado": _r(fmean(o for _, o in g)),
        }
        for k, g in sorted(grupos.items())
    ]


def _chave(structure_id: str, obs: HeroObservation) -> str:
    return hashlib.sha256(f"{structure_id}|{obs.tournament_id}|{obs.hand_id}".encode()).hexdigest()


def _amostras(structure: CanonicalStructure, obs: Sequence[HeroObservation]) -> list[dict[str, Any]]:
    """Estratificada por jogadores vivos, em ordem de hash: nem escolhida a dedo, nem aleatoria."""
    por_vivos: dict[int, list[HeroObservation]] = defaultdict(list)
    for o in sorted(obs, key=lambda o: _chave(structure.id, o)):
        por_vivos[o.players_left].append(o)
    escolhidas: list[HeroObservation] = []
    filas = [por_vivos[r] for r in sorted(por_vivos, reverse=True)]
    while len(escolhidas) < AMOSTRAS_POR_ESTRUTURA and any(filas):
        for fila in filas:
            if fila and len(escolhidas) < AMOSTRAS_POR_ESTRUTURA:
                escolhidas.append(fila.pop(0))
    saida = []
    for o in escolhidas:
        premios = [f * structure.reference_prize_pool for f in structure.payout_fractions[: o.players_left]]
        fichas = [float(s) for s in o.stacks]
        sb, bb, ante = structure.blind_levels[o.level]
        saida.append(
            {
                "nivel": o.level,
                "blinds": {"sb": sb, "bb": bb, "ante": ante},
                "stacks": list(o.stacks),
                "heroi": o.hero_index,
                "lugar_final": o.hero_place,
                "premios": premios,
                "icm_ev": calculate_malmuth_harville_icm(fichas, premios),
                "chip_ev": chip_ev_dollars(fichas, premios),
            }
        )
    return saida


def _estrutura(structure: CanonicalStructure, obs: Sequence[HeroObservation], n_boot: int, seed: int) -> dict[str, Any]:
    relatorio = run_benchmark(obs, structure, n_boot=n_boot, seed=seed)
    itm, vitoria, concavidade = [], [], []
    vivos: dict[int, list[Any]] = defaultdict(list)
    for o in obs:
        r = o.players_left
        pagos = min(len(structure.payout_fractions), r)
        p = place_probabilities(o.stacks, o.hero_index)
        fichas = [float(s) for s in o.stacks]
        premios = [f * structure.reference_prize_pool for f in structure.payout_fractions[:r]]
        fracao = fichas[o.hero_index] / sum(fichas)
        itm.append((sum(p[:pagos]), 1.0 if o.hero_place <= pagos else 0.0))
        vitoria.append((fracao, 1.0 if o.hero_place == 1 else 0.0))
        concavidade.append((fracao, calculate_malmuth_harville_icm(fichas, premios)[o.hero_index] / sum(premios)))
        vivos[r].append(score_observation(o, structure))
    return {
        "id": structure.id,
        "rotulo": structure_label(structure),
        "field": structure.field,
        "max_mesa": structure.table_max,
        "stack_inicial": structure.starting_stack,
        "canonicos": len(structure.canonical_tournaments),
        "fracoes_premio": [_r(f) for f in structure.payout_fractions],
        "prize_pool_referencia": structure.reference_prize_pool,
        "vencedor_leva_tudo": structure.winner_take_all,
        "estados": relatorio.observacoes,
        "torneios": relatorio.torneios,
        "metricas": {
            "brier_lugar": _metrica(relatorio.brier_lugar),
            "logloss_lugar": _metrica(relatorio.logloss_lugar),
            "brier_itm": _metrica(relatorio.brier_itm),
            "erro2_premio": _metrica(relatorio.erro2_premio),
        },
        "calibracao_itm": _faixas(itm),
        "calibracao_vitoria": _faixas(vitoria),
        "concavidade": _faixas(concavidade),
        "por_jogadores_vivos": [
            {
                "vivos": r,
                "n": len(notas),
                "brier_icm": _r(fmean(n.brier_icm for n in notas)),
                "brier_uniforme": _r(fmean(n.brier_uniforme for n in notas)),
                "erro2_premio_icm": _r(fmean(n.erro2_premio_icm for n in notas)),
                "erro2_premio_chip": _r(fmean(n.erro2_premio_chip for n in notas)),
            }
            for r, notas in sorted(vivos.items())
        ],
        "amostras": _amostras(structure, obs),
    }


def build_public_dataset(
    observations: Mapping[str, Sequence[HeroObservation]],
    structures: Mapping[str, CanonicalStructure],
    generated_at: str,
    n_boot: int = 2000,
    seed: int = 20260914,
    funnel: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Agregado publico e deterministico. Estrutura sem observacao fica fora, declarada.

    `funnel` e a contagem de quem le as maos (quantas lidas, quantas completas); este modulo
    nao ve maos e nao inventa o funil -- sem ele, o artefato declara `null`.
    """
    estruturas, sem_dados = [], []
    linhas_digest: list[str] = []
    for sid in sorted(structures):
        obs = list(observations.get(sid, ()))
        if not obs:
            sem_dados.append(sid)
            continue
        estruturas.append(_estrutura(structures[sid], obs, n_boot, seed))
        linhas_digest += [f"{_chave(sid, o)}|{o.hero_place}" for o in obs]
    if not estruturas:
        raise ValueError("nenhuma estrutura com observacao: artefato vazio nao se publica.")
    return {
        "schema": SCHEMA_VERSION,
        "gerado_em": generated_at,
        "metodo": {
            "estado": "inicio da mao com field completo medido: soma das fichas = field x stack inicial",
            "resultado": "lugar final do dono das maos, lido da propria hand history",
            "modelos": "ICM Malmuth-Harville exato; ChipEV linear; uniforme 1/r como referencia sem fichas",
            "intervalo": f"bootstrap por torneio, {n_boot} reamostragens, semente {seed}",
            "ajuste": "nenhum parametro ajustado; avaliacao fora da amostra por construcao",
        },
        "privacidade": "sem nome de jogador, id de torneio ou id de mao; amostras so com stacks, blinds e lugar",
        "digest_amostra": hashlib.sha256("\n".join(sorted(linhas_digest)).encode()).hexdigest(),
        "estados_total": sum(e["estados"] for e in estruturas),
        "funil": dict(funnel) if funnel is not None else None,
        "estruturas": estruturas,
        "estruturas_sem_dados": sem_dados,
    }
