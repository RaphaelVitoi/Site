"""Artefato publico do benchmark: deterministico, agregado e sem identificador de ninguem."""

from __future__ import annotations

import json

import pytest

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_benchmark_publico import AMOSTRAS_POR_ESTRUTURA, SCHEMA_VERSION, build_public_dataset
from engine.pmev_hh_benchmark import HeroObservation
from engine.pmev_hh_canon import CanonicalStructure

STT3 = CanonicalStructure(
    id="teste-stt-3",
    buyin="$1+$0.10",
    table_max=3,
    field=3,
    starting_stack=1000,
    payout_fractions=(0.65, 0.35),
    reference_prize_pool=3.0,
    winner_take_all=False,
    canonical_tournaments=("1",),
    blind_levels={1: (10, 20, 0), 2: (15, 30, 0)},
)
SPIN = CanonicalStructure(
    id="teste-spin",
    buyin="$0.46+$0.04",
    table_max=3,
    field=3,
    starting_stack=500,
    payout_fractions=(1.0,),
    reference_prize_pool=1.0,
    winner_take_all=True,
    canonical_tournaments=("2",),
    blind_levels={1: (10, 20, 0)},
)


def _obs(tid: str, hand: int, stacks: tuple[int, ...], place: int, level: int = 1) -> HeroObservation:
    return HeroObservation(
        tournament_id=f"SEGREDO{tid}",
        hand_id=987654321000 + hand,
        level=level,
        stacks=stacks,
        hero_index=0,
        hero_place=place,
    )


def _amostra():
    stt = [
        _obs(str(t), t * 10 + k, s, p, level=1 + k % 2)
        for t in range(8)
        for k, (s, p) in enumerate([((1500, 900, 600), 1 + t % 3), ((2100, 900), 1 + t % 2)])
    ]
    spin = [_obs(f"s{t}", 500 + t, (700, 500, 300), 1 + t % 3) for t in range(6)]
    return {"teste-stt-3": stt, "teste-spin": spin}, {"teste-stt-3": STT3, "teste-spin": SPIN, "sem-dados": STT3}


def test_artefato_e_deterministico():
    obs, est = _amostra()
    a = build_public_dataset(obs, est, generated_at="2026-09-14", n_boot=100)
    b = build_public_dataset(obs, est, generated_at="2026-09-14", n_boot=100)
    assert json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True)
    assert a["schema"] == SCHEMA_VERSION


def test_nao_vaza_id_de_torneio_nem_de_mao():
    obs, est = _amostra()
    texto = json.dumps(build_public_dataset(obs, est, generated_at="2026-09-14", n_boot=50))
    assert "SEGREDO" not in texto
    assert "987654321" not in texto


def test_agregados_contam_todas_as_observacoes_e_declaram_estrutura_sem_dados():
    obs, est = _amostra()
    d = build_public_dataset(obs, est, generated_at="2026-09-14", n_boot=50)
    assert d["estruturas_sem_dados"] == ["sem-dados"]
    assert d["estados_total"] == 22
    for e in d["estruturas"]:
        assert sum(f["n"] for f in e["calibracao_itm"]) == e["estados"]
        assert sum(f["n"] for f in e["calibracao_vitoria"]) == e["estados"]
        assert sum(v["n"] for v in e["por_jogadores_vivos"]) == e["estados"]
        m = e["metricas"]["brier_lugar"]
        assert m["ic95"][0] <= m["ic95"][1]


def test_amostras_sao_estratificadas_e_o_icm_publicado_confere_com_o_kernel():
    obs, est = _amostra()
    stt = next(
        e
        for e in build_public_dataset(obs, est, generated_at="2026-09-14", n_boot=50)["estruturas"]
        if e["id"] == "teste-stt-3"
    )
    assert len(stt["amostras"]) == min(AMOSTRAS_POR_ESTRUTURA, stt["estados"])
    assert {len(a["stacks"]) for a in stt["amostras"]} == {2, 3}
    for a in stt["amostras"]:
        assert a["icm_ev"] == pytest.approx(
            calculate_malmuth_harville_icm([float(s) for s in a["stacks"]], a["premios"])
        )
        assert set(a) == {"nivel", "blinds", "stacks", "heroi", "lugar_final", "premios", "icm_ev", "chip_ev"}


def test_spin_publica_icm_igual_a_chipev():
    obs, est = _amostra()
    spin = next(
        e
        for e in build_public_dataset(obs, est, generated_at="2026-09-14", n_boot=50)["estruturas"]
        if e["vencedor_leva_tudo"]
    )
    assert spin["metricas"]["erro2_premio"]["diferenca"] == pytest.approx(0.0)
    for a in spin["amostras"]:
        assert a["icm_ev"] == pytest.approx(a["chip_ev"])


def test_sem_nenhuma_observacao_recusa():
    with pytest.raises(ValueError, match="nenhuma estrutura com observacao"):
        build_public_dataset({}, {"x": STT3}, generated_at="2026-09-14")
