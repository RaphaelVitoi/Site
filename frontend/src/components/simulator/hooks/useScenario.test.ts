import { resolveScenarioId } from './useScenario';

describe('resolveScenarioId', () => {
	it('uses a valid scenario requested by the route', () => {
		expect(resolveScenarioId('icmev-puro')).toBe('icmev-puro');
	});

	it('falls back to the canonical first scenario for an unknown route parameter', () => {
		expect(resolveScenarioId('not-a-real-scenario')).toBe('chipev');
	});
});
