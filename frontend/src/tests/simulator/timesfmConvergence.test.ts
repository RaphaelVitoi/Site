/**
 * IDENTITY: Testes Unitarios de Convergencia CFR via TimesFM
 * PATH: src/tests/simulator/timesfmConvergence.test.ts
 */

import { calculateClientCfrConvergence } from '../../lib/timesfm-client';

describe('calculateClientCfrConvergence', () => {
	test('devolve INSUFFICIENT_HISTORY se houver menos de 4 pontos', () => {
		const res = calculateClientCfrConvergence([0.5, 0.4]);
		expect(res.status).toBe('INSUFFICIENT_HISTORY');
		expect(res.estimated_iterations_to_target).toBe(-1);
		expect(res.early_stopping_recommended).toBe(false);
	});

	test('devolve CONVERGED se o ultimo arrependimento ja for menor que a meta', () => {
		const res = calculateClientCfrConvergence([0.05, 0.02, 0.005, 0.0004], 8, 0.001);
		expect(res.status).toBe('CONVERGED');
		expect(res.estimated_iterations_to_target).toBe(0);
		expect(res.early_stopping_recommended).toBe(true);
		expect(res.license_tier).toContain('Apache 2.0');
	});

	test('projeta decaimento rumo a meta com early stopping', () => {
		const res = calculateClientCfrConvergence([0.1, 0.07, 0.04, 0.02], 8, 0.005);
		expect(res.status).toBe('CONVERGING');
		expect(res.estimated_iterations_to_target).toBeGreaterThan(0);
		expect(res.mean_trajectory).toHaveLength(8);
		expect(res.quantile_10).toHaveLength(8);
		expect(res.quantile_90).toHaveLength(8);
		expect(res.early_stopping_recommended).toBe(true);
	});

	test('identifica licenca de pesquisa ao selecionar modelo 3.0', () => {
		const res = calculateClientCfrConvergence(
			[0.1, 0.08, 0.06, 0.04],
			8,
			0.001,
			'timesfm-3.0-330m',
		);
		expect(res.license_tier).toContain('Non-Commercial');
	});
});
