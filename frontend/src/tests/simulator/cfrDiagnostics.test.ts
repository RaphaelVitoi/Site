/// <reference types="jest" />

import { appendCfrRegretSample } from '../../lib/cfrDiagnostics';

describe('CFR worker diagnostics', () => {
	it('samples only measured worker iterations and preserves their metric identity', () => {
		let history = appendCfrRegretSample([], {
			iteration: 1,
			metric: 'mean-positive-regret-proxy',
			value: 0.8,
		});
		history = appendCfrRegretSample(history, {
			iteration: 29,
			metric: 'mean-positive-regret-proxy',
			value: 0.5,
		}, 30);
		history = appendCfrRegretSample(history, {
			iteration: 30,
			metric: 'mean-positive-regret-proxy',
			value: 0.4,
		}, 30);

		expect(history).toEqual([
			{ iteration: 1, metric: 'mean-positive-regret-proxy', value: 0.8 },
			{ iteration: 30, metric: 'mean-positive-regret-proxy', value: 0.4 },
		]);
	});

	it('resets history when the worker starts a new scenario', () => {
		const previous = [
			{ iteration: 120, metric: 'mean-positive-regret-proxy' as const, value: 0.2 },
		];

		const history = appendCfrRegretSample(previous, {
			iteration: 1,
			metric: 'mean-positive-regret-proxy',
			value: 0.9,
		});

		expect(history).toEqual([
			{ iteration: 1, metric: 'mean-positive-regret-proxy', value: 0.9 },
		]);
	});
});
