/// <reference types="jest" />

import parityCorpus from '../../../../data/engine_parity_scenarios.json';
import {
	calculateChenIndifference,
	calculateJandaBluffValueRatios,
	calculateJandaGeometricSizing,
	calculateJandaMDF,
} from '../../lib/canonicalTheoryEngine';
import { computeMultiwayStructuralLiability, solvePluribusMultiway } from '../../lib/pluribusMultiwayEngine';

describe('shared Python and TypeScript engine parity corpus', () => {
	it('matches every shared canonical scenario within the declared tolerance', () => {
		const { scenarios, absolute_tolerance: tolerance } = parityCorpus;
		const digits = Math.max(0, Math.ceil(-Math.log10(tolerance)));

		for (const scenario of scenarios.pmev_multiway_liability) {
			const result = computeMultiwayStructuralLiability(
				scenario.input.pot,
				scenario.input.num_players,
				scenario.input.lambda_factor,
			);
			expect(result).toBeCloseTo(scenario.expected.structural_liability, digits);
		}

		for (const scenario of scenarios.pluribus_horizon_heuristic) {
			const result = solvePluribusMultiway({
				pot: scenario.input.pot,
				numPlayers: scenario.input.num_players,
				activeStacks: scenario.input.active_stacks,
				lambdaFactor: scenario.input.lambda_factor,
				nominalEquity: scenario.input.equity,
				heroPosition: scenario.input.hero_position,
				street: scenario.input.street,
				depthStreets: scenario.input.depth_streets,
				iterations: scenario.input.iterations,
			});
			expect(result.effectiveStack).toBeCloseTo(scenario.expected.effective_stack, digits);
			expect(result.stackToPotRatio).toBeCloseTo(scenario.expected.stack_to_pot_ratio, digits);
			expect(result.callCost).toBeCloseTo(scenario.expected.call_cost, digits);
			expect(result.raiseCost).toBeCloseTo(scenario.expected.raise_cost, digits);
			expect(result.futureStreets).toBe(scenario.expected.future_streets);
			expect(result.horizonLiability).toBeCloseTo(scenario.expected.horizon_liability, digits);
			expect(result.evs.CALL).toBeCloseTo(scenario.expected.call_ev, digits);
			expect(result.evs.RAISE).toBeCloseTo(scenario.expected.raise_ev, digits);
		}

		for (const scenario of scenarios.chen_indifference) {
			const result = calculateChenIndifference(scenario.input.pot, scenario.input.bet);
			expect(result.alpha).toBeCloseTo(scenario.expected.alpha, digits);
			expect(result.defenderCallFrequency).toBeCloseTo(
				scenario.expected.defense_frequency,
				digits,
			);
			expect(result.gameValueHero).toBeCloseTo(scenario.expected.game_value, digits);
		}

		for (const scenario of scenarios.janda_mdf) {
			const result = calculateJandaMDF(
				scenario.input.pot,
				scenario.input.bet,
				scenario.input.num_defenders,
			);
			expect(result.alpha).toBeCloseTo(scenario.expected.alpha, digits);
			expect(result.mdf).toBeCloseTo(scenario.expected.mdf, digits);
			expect(result.individualMdf).toBeCloseTo(scenario.expected.individual_mdf, digits);
		}

		for (const scenario of scenarios.janda_geometric_sizing) {
			const result = calculateJandaGeometricSizing(
				scenario.input.pot,
				scenario.input.effective_stack,
				scenario.input.num_streets,
			);
			expect(result.potFractionPercentage).toBeCloseTo(
				scenario.expected.pot_fraction_percentage,
				digits,
			);
			expect(result.steps.at(-1)?.remainingStackAfterBet).toBeCloseTo(
				scenario.expected.final_stack,
				digits,
			);
		}

		for (const scenario of scenarios.janda_bluff_ratios) {
			const result = calculateJandaBluffValueRatios(scenario.input.bet_fraction_of_pot);
			expect(result.riverBluffToValueRatio).toBeCloseTo(
				scenario.expected.river_bluff_to_value_ratio,
				digits,
			);
			expect(result.turnBluffToValueRatio).toBeCloseTo(
				scenario.expected.turn_bluff_to_value_ratio,
				digits,
			);
			expect(result.flopBluffToValueRatio).toBeCloseTo(
				scenario.expected.flop_bluff_to_value_ratio,
				digits,
			);
		}
	});
});
