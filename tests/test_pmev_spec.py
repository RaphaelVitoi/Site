"""Testes de contrato para o nucleo minimo PMev v0.1 e benchmark H9."""

import pytest

from engine.pmev_late_registration import LateRegistrationScenario, evaluate_late_registration
from engine.pmev_spec import PMevConfiguration, PMevTier, TournamentState


def test_baseline_configuration_recovers_icmev_only_without_extensions() -> None:
    baseline = PMevConfiguration(tier=PMevTier.BASELINE)
    dynamic = PMevConfiguration(tier=PMevTier.DYNAMIC, dynamic_rewards_enabled=True)

    assert baseline.recovers_icmev()
    assert not dynamic.recovers_icmev()


def test_tournament_state_rejects_invalid_mass() -> None:
    with pytest.raises(ValueError, match="soma dos stacks"):
        TournamentState(stacks=(0.0, 0.0), payouts=(100.0,))

    with pytest.raises(ValueError, match="payouts"):
        TournamentState(stacks=(100.0, 100.0), payouts=(0.0,))


@pytest.mark.parametrize("non_finite", (float("nan"), float("inf"), float("-inf")))
def test_tournament_state_rejects_non_finite_financial_inputs(non_finite: float) -> None:
    with pytest.raises(ValueError, match="finitos"):
        TournamentState(stacks=(non_finite, 100.0), payouts=(100.0,))

    with pytest.raises(ValueError, match="finitos"):
        TournamentState(stacks=(100.0, 100.0), payouts=(non_finite,))


def test_tournament_state_rejects_more_payouts_than_active_players() -> None:
    with pytest.raises(ValueError, match="payouts nao podem exceder"):
        TournamentState(stacks=(60.0, 40.0), payouts=(80.0, 10.0, 10.0))


def test_h9_conserves_value_in_exact_small_field_transition() -> None:
    before = TournamentState(stacks=(60.0, 25.0, 15.0), payouts=(70.0, 30.0))
    scenario = LateRegistrationScenario(
        before=before,
        entrant_stack=20.0,
        net_contribution=20.0,
        payouts_after=(84.0, 36.0),
    )

    result = evaluate_late_registration(scenario)

    assert result.conserved
    assert result.conservation_residual == pytest.approx(0.0, abs=1e-9)
    assert sum(result.incumbent_deltas) == pytest.approx(-result.entrant_bonus, abs=1e-9)


def test_h9_rejects_non_conservative_transition() -> None:
    before = TournamentState(stacks=(50.0, 50.0), payouts=(100.0,))

    with pytest.raises(ValueError, match="transicao conservativa"):
        LateRegistrationScenario(
            before=before,
            entrant_stack=25.0,
            net_contribution=20.0,
            payouts_after=(119.0,),
        )


def test_h9_rejects_redistributed_payouts_that_preserve_only_total_mass() -> None:
    before = TournamentState(stacks=(60.0, 25.0, 15.0), payouts=(70.0, 30.0))

    with pytest.raises(ValueError, match="proporcional"):
        LateRegistrationScenario(
            before=before,
            entrant_stack=20.0,
            net_contribution=20.0,
            payouts_after=(120.0, 0.0),
        )


def test_h9_rejects_a_changed_payout_cardinality() -> None:
    before = TournamentState(stacks=(50.0, 50.0), payouts=(100.0,))

    with pytest.raises(ValueError, match="quantidade de payouts"):
        LateRegistrationScenario(
            before=before,
            entrant_stack=25.0,
            net_contribution=20.0,
            payouts_after=(80.0, 20.0, 20.0),
        )


@pytest.mark.parametrize("non_finite", (float("nan"), float("inf"), float("-inf")))
def test_h9_rejects_non_finite_transition_inputs(non_finite: float) -> None:
    before = TournamentState(stacks=(50.0, 50.0), payouts=(100.0,))

    with pytest.raises(ValueError, match="finitos"):
        LateRegistrationScenario(
            before=before,
            entrant_stack=non_finite,
            net_contribution=20.0,
            payouts_after=(120.0,),
        )

    with pytest.raises(ValueError, match="finitos"):
        LateRegistrationScenario(
            before=before,
            entrant_stack=20.0,
            net_contribution=non_finite,
            payouts_after=(120.0,),
        )

    with pytest.raises(ValueError, match="finitos"):
        LateRegistrationScenario(
            before=before,
            entrant_stack=20.0,
            net_contribution=20.0,
            payouts_after=(non_finite,),
        )
