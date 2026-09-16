"""Estruturas canonicas + estados de hand history: parser, coerencia e gerador.

As maos abaixo sao SINTETICAS, com nomes inventados. Hand history real nao entra no
repositorio; o catalogo versionado so tem numeros medidos.
"""

from __future__ import annotations

import itertools
import json

import pytest

from engine.icm_matrix import calculate_malmuth_harville_icm
from engine.pmev_hh_canon import (
    STRUCTURES_PATH,
    CanonicalStructure,
    CoherentStateGenerator,
    coherence_violations,
    is_complete_field,
    load_structures,
    match_structure,
    parse_pokerstars_hands,
    remaining_payouts,
    to_scenario,
)
from engine.pmev_scenario import Read, Regime, Unreadable

STT9 = CanonicalStructure(
    id="teste-stt-9",
    buyin="$9.20+$0.80",
    table_max=9,
    field=9,
    starting_stack=1500,
    payout_fractions=(0.5, 0.3, 0.2),
    reference_prize_pool=82.8,
    winner_take_all=False,
    canonical_tournaments=("1",),
    blind_levels={1: (10, 20, 3), 5: (60, 120, 15)},
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


def _mao(
    hand_id: int, tid: str, buyin: str, nivel: str, sb: int, bb: int, max_: int, stacks: list[int], ante: int = 0
) -> str:
    linhas = [
        f"PokerStars Hand #{hand_id}: Tournament #{tid}, {buyin} USD Hold'em No Limit - Level {nivel} ({sb}/{bb}) - 2024/03/07 19:53:29 ET",
        f"Table '{tid} 1' {max_}-max Seat #1 is the button",
    ]
    linhas += [f"Seat {i + 1}: jogador{i + 1} ({s} in chips)" for i, s in enumerate(stacks)]
    if ante:
        linhas += [f"jogador{i + 1}: posts the ante {ante}" for i in range(len(stacks))]
    linhas += ["jogador1: posts small blind 10", "*** HOLE CARDS ***", "jogador1: folds", ""]
    return "\n".join(linhas)


def test_parser_le_numeros_e_ante_so_do_bloco_da_propria_mao():
    """A janela fixa de caracteres atribuia a um Spin o ante da mao seguinte."""
    texto = (
        _mao(1, "10", "$0.46+$0.04", "I", 10, 20, 3, [500, 500, 500])
        + "\n"
        + _mao(2, "11", "$9.20+$0.80", "V", 60, 120, 9, [1500] * 9, ante=15)
    )
    spin, stt = list(parse_pokerstars_hands(texto))
    assert (spin.level, spin.big_blind, spin.ante, spin.table_max) == (1, 20, 0, 3)
    assert (stt.level, stt.small_blind, stt.ante, stt.total_chips) == (5, 60, 15, 13500)
    assert all(isinstance(assento, int) for assento, _ in stt.stacks)


def test_numeral_romano_composto():
    (mao,) = list(parse_pokerstars_hands(_mao(3, "12", "$9.20+$0.80", "XIV", 800, 1600, 9, [1500] * 9)))
    assert mao.level == 14


def test_field_completo_e_medido_pela_soma_das_fichas():
    (completa,) = parse_pokerstars_hands(
        _mao(4, "13", "$9.20+$0.80", "I", 10, 20, 9, [3000, 2500, 2000, 2000, 1500, 1000, 1000, 500])
    )
    (parcial,) = parse_pokerstars_hands(_mao(5, "13", "$9.20+$0.80", "I", 10, 20, 9, [3000, 2500, 2000]))
    assert match_structure(completa, [SPIN, STT9]) is STT9
    assert is_complete_field(completa, STT9)
    assert not is_complete_field(parcial, STT9)


def test_premios_em_disputa_sao_os_melhores_lugares_restantes():
    assert remaining_payouts(STT9, 9, 82.8) == pytest.approx((41.4, 24.84, 16.56))
    assert remaining_payouts(STT9, 2, 82.8) == pytest.approx((41.4, 24.84))
    with pytest.raises(ValueError, match="jogadores vivos fora de"):
        remaining_payouts(STT9, 10, 82.8)


def test_coerencia_lista_todas_as_violacoes():
    violacoes = coherence_violations((0, 1000), 7, STT9)
    assert len(violacoes) == 3  # stack nao positivo, soma errada, nivel fora da escala
    assert coherence_violations((7000, 6500), 5, STT9) == []


def test_cenario_icm_declara_o_que_a_hand_history_nao_revela():
    cenario = to_scenario((6000, 4500, 3000), STT9)
    assert cenario.regime is Regime.ICM_EV
    assert isinstance(cenario.payouts, Read)
    assert cenario.payouts.value == pytest.approx((41.4, 24.84, 16.56))
    assert isinstance(cenario.ranges, Unreadable)
    assert isinstance(cenario.agent_policy, Unreadable)


def _estados_reais() -> list:
    texto = "\n".join(
        [
            _mao(10, "20", "$9.20+$0.80", "V", 60, 120, 9, [4000, 3000, 2500, 2000, 2000]),
            _mao(11, "20", "$9.20+$0.80", "V", 60, 120, 9, [9000, 4500]),
            _mao(12, "21", "$9.20+$0.80", "V", 60, 120, 9, [5000, 5000]),  # incompleta: fica de fora
            _mao(13, "22", "$0.46+$0.04", "I", 10, 20, 3, [800, 400, 300]),
        ]
    )
    return list(parse_pokerstars_hands(texto))


def test_gerador_so_ancora_em_estado_real_completo_e_coerente():
    assert CoherentStateGenerator(STT9, _estados_reais(), seed=1).anchors == 2
    with pytest.raises(ValueError, match="nenhum estado real completo"):
        CoherentStateGenerator(STT9, [], seed=1)


def test_gerador_preserva_invariantes_em_milhares_de_amostras():
    gerador = CoherentStateGenerator(STT9, _estados_reais(), seed=7, concentration=5.0)
    for estado in itertools.islice(gerador, 2000):
        assert coherence_violations(estado.stacks, estado.level, STT9) == []
        assert len(estado.stacks) in (2, 5)
        assert sum(estado.icm_ev) == pytest.approx(sum(STT9.payout_fractions[: len(estado.stacks)]) * 82.8)


def test_gerador_e_deterministico_por_semente_e_declara_a_origem():
    a = [s.stacks for s in itertools.islice(CoherentStateGenerator(STT9, _estados_reais(), seed=3), 50)]
    b = [s.stacks for s in itertools.islice(CoherentStateGenerator(STT9, _estados_reais(), seed=3), 50)]
    c = [s.stacks for s in itertools.islice(CoherentStateGenerator(STT9, _estados_reais(), seed=4), 50)]
    assert a == b
    assert a != c
    reais = {h.fingerprint for h in _estados_reais()}
    assert next(iter(CoherentStateGenerator(STT9, _estados_reais(), seed=3))).source_fingerprint in reais


def test_winner_take_all_reduz_icm_a_chip_ev():
    """Com premio unico, ICM e ChipEV sao a mesma coisa: o Spin e controle, nao pressao ICM."""
    for estado in itertools.islice(CoherentStateGenerator(SPIN, _estados_reais(), seed=9, concentration=2.0), 500):
        assert estado.icm_ev == pytest.approx(estado.chip_ev, abs=1e-12)


def test_stt_com_premio_escalonado_diverge_de_chip_ev():
    estado = next(iter(CoherentStateGenerator(STT9, _estados_reais(), seed=11)))
    assert estado.icm_ev != pytest.approx(estado.chip_ev, abs=1e-6)


def test_catalogo_versionado_e_coerente_e_so_tem_numeros():
    estruturas = load_structures()
    assert estruturas, "catalogo vazio"
    for e in estruturas.values():
        assert e.canonical_tournaments
        assert all(n >= 1 for n in e.blind_levels)
        premios = list(remaining_payouts(e, min(e.field, e.table_max), e.reference_prize_pool))
        icm = calculate_malmuth_harville_icm([float(e.starting_stack)] * min(e.field, e.table_max), premios)
        assert sum(icm) == pytest.approx(sum(premios))
    bruto = json.loads(STRUCTURES_PATH.read_text(encoding="utf-8"))
    assert "Player" not in json.dumps(bruto)
    assert "Seat " not in json.dumps(bruto)
