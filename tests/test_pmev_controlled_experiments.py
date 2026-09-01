"""Gates anti-confusao para H3, H4 e H8."""

import pytest

from engine.pmev_controlled_experiments import ControlledExperimentSpec, ExperimentHypothesis


def h3_arm(time_to_blind_jump_minutes: int) -> dict[str, object]:
    """Estado minimo para o par de bracos H3."""

    return {
        "stacks": [40, 35, 25],
        "payouts": [70, 30],
        "positions": ["BTN", "SB", "BB"],
        "blinds": [1, 2],
        "ranges": "ranges-v1",
        "betting_tree": "tree-v1",
        "time_to_blind_jump_minutes": time_to_blind_jump_minutes,
    }


def h8_arm(*, payouts: list[int], utility_model: str) -> dict[str, object]:
    """Estado minimo para verificar a disciplina de uma intervencao em H8."""

    return {
        "stacks": [50, 30, 20],
        "payouts": payouts,
        "positions": ["BTN", "SB", "BB"],
        "board": "AsKd7h2c",
        "ranges": "river-ranges-v1",
        "betting_tree": "river-tree-v1",
        "utility_model": utility_model,
    }


def test_h3_accepts_only_a_clock_intervention() -> None:
    spec = ControlledExperimentSpec(
        hypothesis=ExperimentHypothesis.H3_TEMPORAL_EROSION,
        control=h3_arm(15),
        treatment=h3_arm(2),
        primary_metric="delta_q_open",
        falsification_rule="A abertura nao aumenta de modo pre-especificado.",
    )

    assert spec.intervention_fields == ("time_to_blind_jump_minutes",)


def test_h3_rejects_a_confounded_stack_change() -> None:
    treatment = h3_arm(2)
    treatment["stacks"] = [45, 30, 25]

    with pytest.raises(ValueError, match="variaveis de confusao"):
        ControlledExperimentSpec(
            hypothesis=ExperimentHypothesis.H3_TEMPORAL_EROSION,
            control=h3_arm(15),
            treatment=treatment,
            primary_metric="delta_q_open",
            falsification_rule="A abertura nao aumenta.",
        )


def test_h4_accepts_full_river_state_in_both_arms() -> None:
    control = {
        "stacks": [50, 30, 20],
        "payouts": [70, 30],
        "positions": ["BTN", "SB", "BB"],
        "board": "AsKd7h2c",
        "ranges": "river-ranges-v1",
        "pot": 100,
        "bet": 100,
        "betting_tree": "river-tree-v1",
        "equity_baseline": "ICMev/Malmuth-Harville",
    }
    treatment = {**control, "payouts": [90, 10]}

    spec = ControlledExperimentSpec(
        hypothesis=ExperimentHypothesis.H4_RIVER_DEFENSE,
        control=control,
        treatment=treatment,
        primary_metric="defense_frequency",
        falsification_rule="A defesa nao diverge da referencia ICMev/Malmuth-Harville.",
    )

    assert spec.intervention_fields == ("payouts",)


def test_h4_rejects_a_chipev_baseline() -> None:
    control = {
        "stacks": [50, 30, 20],
        "payouts": [70, 30],
        "positions": ["BTN", "SB", "BB"],
        "board": "AsKd7h2c",
        "ranges": "river-ranges-v1",
        "pot": 100,
        "bet": 100,
        "betting_tree": "river-tree-v1",
        "equity_baseline": "ChipEV",
    }
    treatment = {**control, "payouts": [90, 10]}

    with pytest.raises(ValueError, match="baseline ICMev"):
        ControlledExperimentSpec(
            hypothesis=ExperimentHypothesis.H4_RIVER_DEFENSE,
            control=control,
            treatment=treatment,
            primary_metric="defense_frequency",
            falsification_rule="A defesa nao diverge da referencia.",
        )


def test_h4_rejects_missing_river_state() -> None:
    control = {
        "stacks": [50, 30, 20],
        "payouts": [70, 30],
        "positions": ["BTN", "SB", "BB"],
        "board": "AsKd7h2c",
        "ranges": "river-ranges-v1",
        "pot": 100,
        "bet": 100,
        "betting_tree": "river-tree-v1",
        "equity_baseline": "ICMev/Malmuth-Harville",
    }
    treatment = {key: value for key, value in control.items() if key != "board"}
    treatment["payouts"] = [90, 10]

    with pytest.raises(ValueError, match="tratamento ausente"):
        ControlledExperimentSpec(
            hypothesis=ExperimentHypothesis.H4_RIVER_DEFENSE,
            control=control,
            treatment=treatment,
            primary_metric="defense_frequency",
            falsification_rule="A defesa nao diverge da referencia ICMev/Malmuth-Harville.",
        )


def test_h8_accepts_one_allowed_intervention() -> None:
    spec = ControlledExperimentSpec(
        hypothesis=ExperimentHypothesis.H8_DOWNWARD_DRIFT,
        control=h8_arm(payouts=[70, 30], utility_model="icmev"),
        treatment=h8_arm(payouts=[70, 30], utility_model="pmev-d"),
        primary_metric="aggression_delta",
        falsification_rule="O efeito nao aparece com a mesma direcao no output do solver.",
    )

    assert spec.intervention_fields == ("utility_model",)


def test_h8_rejects_two_allowed_interventions_in_the_same_comparison() -> None:
    with pytest.raises(ValueError, match="exatamente uma intervencao"):
        ControlledExperimentSpec(
            hypothesis=ExperimentHypothesis.H8_DOWNWARD_DRIFT,
            control=h8_arm(payouts=[70, 30], utility_model="icmev"),
            treatment=h8_arm(payouts=[90, 10], utility_model="pmev-d"),
            primary_metric="aggression_delta",
            falsification_rule="O efeito nao aparece com a mesma direcao no output do solver.",
        )


def test_controlled_experiment_distinguishes_missing_keys_from_none() -> None:
    control = h8_arm(payouts=[70, 30], utility_model="icmev")
    control["optional_context"] = None
    treatment = h8_arm(payouts=[70, 30], utility_model="pmev-d")

    with pytest.raises(ValueError, match="variaveis de confusao"):
        ControlledExperimentSpec(
            hypothesis=ExperimentHypothesis.H8_DOWNWARD_DRIFT,
            control=control,
            treatment=treatment,
            primary_metric="aggression_delta",
            falsification_rule="O efeito nao aparece com a mesma direcao no output do solver.",
        )


def test_controlled_experiment_freezes_validated_arm_data() -> None:
    control = h3_arm(15)
    treatment = h3_arm(2)
    spec = ControlledExperimentSpec(
        hypothesis=ExperimentHypothesis.H3_TEMPORAL_EROSION,
        control=control,
        treatment=treatment,
        primary_metric="delta_q_open",
        falsification_rule="A abertura nao aumenta de modo pre-especificado.",
    )

    control["stacks"][0] = 999
    control["new_confusor"] = "alterado apos validacao"

    assert spec.control["stacks"] == (40, 35, 25)
    assert "new_confusor" not in spec.control
    assert spec.intervention_fields == ("time_to_blind_jump_minutes",)
