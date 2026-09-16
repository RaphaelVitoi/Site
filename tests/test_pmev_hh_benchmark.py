"""Benchmark ICM x ChipEV sobre hand history: resultado lido da HH, metricas e bootstrap por torneio.

Maos sinteticas, nomes inventados.
"""

from __future__ import annotations

import pytest

from engine.pmev_hh_benchmark import (
    HeroObservation,
    hero_observations,
    place_probabilities,
    run_benchmark,
    score_observation,
)
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
    blind_levels={1: (10, 20, 0)},
)


def _mao(hand_id: int, tid: str, assentos: list[tuple[str, int]], heroi: str, finais: list[str]) -> str:
    linhas = [
        f"PokerStars Hand #{hand_id}: Tournament #{tid}, $1+$0.10 USD Hold'em No Limit - Level I (10/20) - 2024/03/07 19:53:29 ET",
        f"Table '{tid} 1' 3-max Seat #1 is the button",
    ]
    linhas += [f"Seat {i + 1}: {n} ({s} in chips)" for i, (n, s) in enumerate(assentos)]
    linhas += ["*** HOLE CARDS ***", f"Dealt to {heroi} [Ah Kd]", *finais, ""]
    return "\n".join(linhas)


def _torneio(tid: str, heroi_vence: bool) -> str:
    return "\n".join(
        [
            _mao(1 + int(tid) * 10, tid, [("ana", 1000), ("bia", 1000), ("cid", 1000)], "ana", []),
            _mao(
                2 + int(tid) * 10,
                tid,
                [("ana", 1800), ("bia", 700), ("cid", 500)],
                "ana",
                ["cid finished the tournament in 3rd place"],
            ),
            _mao(
                3 + int(tid) * 10,
                tid,
                [("ana", 2000), ("bia", 1000)],
                "ana",
                ["ana wins the tournament and receives $1.95 - congratulations!"]
                if heroi_vence
                else ["ana finished the tournament in 2nd place and received $1.05."],
            ),
        ]
    )


def test_lugar_do_heroi_vem_da_propria_hand_history_e_vale_para_todas_as_maos():
    obs = list(hero_observations(_torneio("7", heroi_vence=True), STT3))
    assert [o.hero_place for o in obs] == [1, 1, 1]
    assert [o.players_left for o in obs] == [3, 3, 2]
    assert all(o.hero_index == 0 for o in obs)


def test_mao_sem_field_completo_ou_sem_lugar_fica_de_fora():
    parcial = _mao(90, "8", [("ana", 1000), ("bia", 1000)], "ana", ["ana wins the tournament"])  # 2000 != 3000
    sem_final = _mao(91, "9", [("ana", 1000), ("bia", 1000), ("cid", 1000)], "ana", [])
    assert list(hero_observations(parcial + "\n" + sem_final, STT3)) == []


def test_probabilidades_de_lugar_somam_um_e_o_primeiro_e_a_fracao_de_fichas():
    p = place_probabilities((500, 300, 200), 1)
    assert sum(p) == pytest.approx(1.0)
    assert p[0] == pytest.approx(0.3)


def test_pontuacao_de_uma_observacao():
    obs = HeroObservation(tournament_id="1", hand_id=1, level=1, stacks=(2000, 1000), hero_index=0, hero_place=1)
    s = score_observation(obs, STT3)
    p1 = 2000 / 3000
    assert s.brier_icm == pytest.approx((p1 - 1) ** 2 + (1 - p1) ** 2)
    assert s.brier_uniforme == pytest.approx(0.5)
    assert s.logloss_icm == pytest.approx(-__import__("math").log(p1))
    assert s.brier_itm_icm == pytest.approx(0.0)  # com 2 vivos e 2 pagos, ITM e certo
    # ICM do heroi: 0.65*3*p1 + 0.35*3*(1-p1); ChipEV: p1 * 3; realizado 1.95
    assert s.erro2_premio_icm == pytest.approx((1.95 * p1 + 1.05 * (1 - p1) - 1.95) ** 2)
    assert s.erro2_premio_chip == pytest.approx((3.0 * p1 - 1.95) ** 2)


def test_benchmark_agrega_com_bootstrap_por_torneio_e_recusa_vazio():
    texto = "\n".join(_torneio(str(t), heroi_vence=t % 2 == 0) for t in range(1, 7))
    rel = run_benchmark(hero_observations(texto, STT3), STT3, n_boot=200, seed=1)
    assert (rel.observacoes, rel.torneios) == (18, 6)
    for m in (rel.brier_lugar, rel.logloss_lugar, rel.brier_itm, rel.erro2_premio):
        assert m.diferenca == pytest.approx(m.modelo - m.referencia)
        assert m.ic95[0] <= m.ic95[1]
    with pytest.raises(ValueError, match="benchmark sem observacoes"):
        run_benchmark([], STT3)
