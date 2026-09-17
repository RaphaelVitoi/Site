"""Equidade requerida exata e RP negativo, conforme os autos do projeto.

Teorema 6 do tratado canonico (docs/PERSPECTIVA_MATEMATICA_PMEV_MASTER.md):
`E* = B*BF / (P + B + B*BF)`, que com `a = B / (P + 2B)` e `BF*a / (BF*a + 1 - a)`.
Teorema 2: `E* < B / (P + 2B)` implica `RP_River < 0`, o que so ocorre com BF < 1.

Ate 2026-09-17 o motor Python recompunha a equidade a partir da grandeza inexata
`(bf-1)/bf` (LIMITE DECLARADO B06/F07) e fixava BF >= 1 e equidade >= pot odds.
"""

from __future__ import annotations

import pytest

from engine.vitoi_perspective_engine import BF_PISO_NUMERICO, ProspectRiskEngine, RiskContext


def _motor(
    delta_win: float, delta_lose: float, monkeypatch: pytest.MonkeyPatch, psi: float = 1.0
) -> ProspectRiskEngine:
    ctx = RiskContext(
        delta_win_dollars=delta_win,
        delta_lose_dollars=delta_lose,
        hero_edge=0.0,
        time_to_blind_increase=20,
        is_in_position=True,
    )
    motor = ProspectRiskEngine(ctx)
    monkeypatch.setattr(motor, "calculate_edge_time_modulator", lambda: psi)
    return motor


def _e_estrela_teorema_6(pote: float, aposta: float, bf: float) -> float:
    return (aposta * bf) / (pote + aposta + aposta * bf)


@pytest.mark.parametrize(("pote", "aposta"), [(10.0, 5.0), (36.0, 4.0), (7.5, 7.5), (20.0, 13.0)])
@pytest.mark.parametrize(("ganho", "perda"), [(200.0, 400.0), (100.0, 500.0), (300.0, 300.0)])
def test_com_psi_neutro_a_equidade_e_a_do_teorema_6(
    pote: float, aposta: float, ganho: float, perda: float, monkeypatch: pytest.MonkeyPatch
) -> None:
    motor = _motor(ganho, perda, monkeypatch)
    bf = motor.calculate_dynamic_bubble_factor()
    a = aposta / (pote + 2 * aposta)
    esperado = min(0.95, _e_estrela_teorema_6(pote, aposta, bf))
    assert motor.evaluate_required_equilibrium_equity(a) == pytest.approx(esperado, abs=1e-12)


def test_a_grandeza_b_antiga_subestimava_o_preco_em_bf_5(monkeypatch: pytest.MonkeyPatch) -> None:
    # Perda 5x maior que o ganho na utilidade de prospecto: BF alto, onde B06/F07 mediu o erro maximo.
    motor = _motor(100.0, 100.0 * 5 ** (1 / 0.88) / 2.25 ** (1 / 0.88), monkeypatch)
    bf = motor.calculate_dynamic_bubble_factor()
    assert bf == pytest.approx(5.0, rel=1e-9)
    a = 0.5
    rp_b = (bf - 1.0) / bf
    antiga = (a + rp_b) / (1.0 + rp_b)
    exata = motor.evaluate_required_equilibrium_equity(a)
    assert exata == pytest.approx(bf * a / (bf * a + 1 - a))
    assert (exata - antiga) * 100 == pytest.approx(11.11, abs=0.01)


def test_teorema_2_bf_menor_que_1_leva_equidade_abaixo_das_pot_odds(monkeypatch: pytest.MonkeyPatch) -> None:
    # Ganho muito maior que a perda: o pote concentra a vida do torneio.
    motor = _motor(400.0, 100.0, monkeypatch)
    bf = motor.calculate_dynamic_bubble_factor()
    assert BF_PISO_NUMERICO < bf < 1.0
    a = 4.0 / (36.0 + 2 * 4.0)
    requerida = motor.evaluate_required_equilibrium_equity(a)
    assert requerida < a
    assert requerida == pytest.approx(_e_estrela_teorema_6(36.0, 4.0, bf))


def test_o_piso_do_bf_e_numerico_e_declarado(monkeypatch: pytest.MonkeyPatch) -> None:
    motor = _motor(10_000.0, 1.0, monkeypatch)
    assert motor.calculate_dynamic_bubble_factor() == BF_PISO_NUMERICO
