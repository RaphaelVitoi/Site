# tests/test_icm_matrix.py
"""Testes de integridade matemática para o motor ICM e Bubble Factor Matrix SOTA v7.0 GOLD."""

import pytest
from engine.icm_matrix import calculate_malmuth_harville_icm, compute_bubble_factor_matrix


def test_malmuth_harville_equal_stacks():
    """Em stacks iguais com payouts, todos os jogadores devem ter exatamente o mesmo $EV."""
    stacks = [1000.0, 1000.0, 1000.0]
    payouts = [50.0, 30.0, 20.0]
    ev = calculate_malmuth_harville_icm(stacks, payouts)
    assert len(ev) == 3
    for val in ev:
        assert pytest.approx(val, rel=1e-4) == 100.0 / 3.0


def test_malmuth_harville_winner_take_all():
    """Em formato Winner-Take-All (1º lugar leva tudo), o $EV é puramente proporcional aos stacks (ChipEV)."""
    stacks = [5000.0, 3000.0, 2000.0]
    payouts = [100.0]
    ev = calculate_malmuth_harville_icm(stacks, payouts)
    assert pytest.approx(ev[0], rel=1e-4) == 50.0
    assert pytest.approx(ev[1], rel=1e-4) == 30.0
    assert pytest.approx(ev[2], rel=1e-4) == 20.0


def test_bubble_factor_matrix_properties():
    """Valida propriedades fundamentais da matriz de Bubble Factor."""
    stacks = [6000.0, 3000.0, 1000.0]
    payouts = [500.0, 300.0, 200.0]
    result = compute_bubble_factor_matrix(stacks, payouts)

    bf = result["bf_matrix"]
    rp = result["rp_matrix"]
    req_eq = result["req_equity_matrix"]

    # 1. Diagonal principal deve ser 1.0 (neutro)
    for i in range(3):
        assert bf[i][i] == 1.0
        assert rp[i][i] == 0.0
        assert req_eq[i][i] == 50.0

    # 2. Em torneios com ICM, todo confronto com risco tem BF >= 1.0
    for i in range(3):
        for j in range(3):
            if i != j:
                assert bf[i][j] >= 1.0
                assert rp[i][j] >= 0.0
                assert req_eq[i][j] >= 50.0

    # 3. Short stack (P3) contra o Chip Leader (P1):
    # Se o Short Stack dobra, ele ganha muito $EV.
    # Já o Mid Stack (P2) contra o Chip Leader (P1) sofre alto Risk Premium de eliminação.
    assert rp[1][0] > 0.0


def test_bubble_factor_matrix_empty_and_zero_stacks():
    """Valida resiliência contra listas vazias ou stacks zerados."""
    res_empty = compute_bubble_factor_matrix([], [])
    assert res_empty["n_players"] == 0

    stacks_with_zero = [1000.0, 0.0, 2000.0]
    payouts = [100.0, 50.0]
    res_zero = compute_bubble_factor_matrix(stacks_with_zero, payouts)
    assert res_zero["bf_matrix"][1][0] == 1.0
