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
