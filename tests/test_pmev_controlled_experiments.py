"""Gates anti-confusão para H3, H4 e H8."""

import pytest

from engine.pmev_controlled_experiments import ControlledExperimentSpec, ExperimentHypothesis


def h3_arm(time_to_blind_jump_minutes: int) -> dict[str, object]:
    return {
        "stacks": [40, 35, 25],
        "payouts": [70, 30],
        "positions": ["BTN", "SB", "BB"],
        "blinds": [1, 2],
        "ranges": "ranges-v1",
        "betting_tree": "tree-v1",
        "time_to_blind_jump_minutes": time_to_blind_jump_minutes,
    }


def test_h3_accepts_only_a_clock_intervention():
    spec = ControlledExperimentSpec(
        hypothesis=ExperimentHypothesis.H3_TEMPORAL_EROSION,
        control=h3_arm(15),
        treatment=h3_arm(2),
        primary_metric="delta_q_open",
        falsification_rule="A abertura não aumenta de modo pré-especificado.",
    )

    assert spec.intervention_fields == ("time_to_blind_jump_minutes",)


def test_h3_rejects_a_confounded_stack_change():
    treatment = h3_arm(2)
    treatment["stacks"] = [45, 30, 25]

    with pytest.raises(ValueError, match="variáveis de confusão"):
        ControlledExperimentSpec(
            hypothesis=ExperimentHypothesis.H3_TEMPORAL_EROSION,
            control=h3_arm(15),
            treatment=treatment,
            primary_metric="delta_q_open",
            falsification_rule="Abertura não aumenta.",
        )


def test_h4_requires_full_river_state_in_both_arms():
    control = {
        "stacks": [50, 30, 20],
        "payouts": [70, 30],
        "positions": ["BTN", "SB", "BB"],
        "board": "AsKd7h2c",
        "ranges": "river-ranges-v1",
        "pot": 100,
        "bet": 100,
        "betting_tree": "river-tree-v1",
    }
    treatment = {**control, "payouts": [90, 10]}

    spec = ControlledExperimentSpec(
        hypothesis=ExperimentHypothesis.H4_RIVER_DEFENSE,
        control=control,
        treatment=treatment,
        primary_metric="defense_frequency",
        falsification_rule="A defesa não diverge da referência ChipEV.",
    )

    assert spec.intervention_fields == ("payouts",)
