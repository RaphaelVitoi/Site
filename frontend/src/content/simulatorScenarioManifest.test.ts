import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import { getSimulatorScenarioManifestEntry } from './simulatorScenarioManifest';

describe('simulator scenario manifest', () => {
	it('keeps regular fixtures as hypotheses and preserves verified Toy Games as reproducible experiments', () => {
		const verifiedToyGameIds = new Set(['sniper', 'bully']);
		const didacticScenarios = SCENARIOS.filter(
			(scenario) => scenario.id !== 'chipev' && scenario.id !== 'icmev-puro'
		);

		expect(didacticScenarios).not.toHaveLength(0);
		for (const scenario of didacticScenarios) {
			const entry = getSimulatorScenarioManifestEntry(scenario.id);
			expect(entry.evidenceLevel).toBe(
				verifiedToyGameIds.has(scenario.id) ? 'reproducible_experiment' : 'hypothesis'
			);
			expect(entry.inputStatus).toBe('didactic_fixture');
			expect(entry.sources.length).toBeGreaterThan(0);
			expect(entry.limitations.length).toBeGreaterThan(0);
		}
	});

	it('fails closed for a scenario that has not been entered in the manifest', () => {
		const entry = getSimulatorScenarioManifestEntry('not-registered');
		expect(entry.evidenceLevel).toBe('review_required');
		expect(entry.inputStatus).toBe('review_required');
	});

	it('keeps the mathematical baselines traceable to inputs and artifacts', () => {
		for (const scenarioId of ['chipev', 'icmev-puro']) {
			const entry = getSimulatorScenarioManifestEntry(scenarioId);
			expect(entry.inputStatus).toBe('derived_from_inputs');
			expect(entry.sources.length).toBeGreaterThan(0);
			expect(entry.limitations.length).toBeGreaterThan(0);
		}
	});
});
