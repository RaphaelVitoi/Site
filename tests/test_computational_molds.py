"""Contracts of the instrument, independent of PMev theoretical propositions."""
from itertools import permutations

import pytest
from pydantic import ValidationError

from core.perspective_schemas import PerspectiveTreeRequest
from engine.icm_matrix import calculate_malmuth_harville_icm, compute_bubble_factor_matrix


@pytest.mark.parametrize("stacks,payouts,expected", [
    ([100, 0], [70, 30], [70, 30]),
    ([0, 100], [70, 30], [30, 70]),
    ([100, 0, 0], [70, 20, 10], [70, 15, 15]),
    ([50, 50], [], [0, 0]),
])
def test_terminal_and_empty_prizes(stacks, payouts, expected):
    assert calculate_malmuth_harville_icm(stacks, payouts) == pytest.approx(expected)


def test_heads_up_guaranteed_payout_preserves_equal_gain_and_loss():
    matrix = compute_bubble_factor_matrix([50, 50], [70, 30])
    assert matrix["delta_win_matrix"][0][1] == 20
    assert matrix["delta_lose_matrix"][0][1] == 20
    assert matrix["bf_matrix"][0][1] == 1
    assert matrix["req_equity_matrix"][0][1] == 50


def test_aggregated_states_match_independent_finish_order_enumeration():
    stacks, payouts = [57, 29, 11, 3], [70, 20, 10]
    expected = [0.0] * len(stacks)
    for order in permutations(range(len(stacks))):
        probability, chips = 1.0, sum(stacks)
        for i in order:
            probability *= stacks[i] / chips
            chips -= stacks[i]
        for rank, i in enumerate(order):
            expected[i] += probability * (payouts[rank] if rank < len(payouts) else 0)
    assert calculate_malmuth_harville_icm(stacks, payouts) == pytest.approx(expected)


@pytest.mark.parametrize("field,value", [("fold_equity", 2), ("fold_equity", -0.1),
    ("valuation_stack", float("inf")), ("edge_base", float("nan"))])
def test_tree_rejects_nonfinite_numbers_and_invalid_probabilities(field, value):
    with pytest.raises(ValidationError):
        PerspectiveTreeRequest(**{"equity": 0.6, "pot_size": 10, "stack_eff": 20, field: value})


def test_provisional_tree_still_accepts_valid_scenario():
    assert PerspectiveTreeRequest(equity=0.6, pot_size=10, stack_eff=20).fold_equity == 0.3
