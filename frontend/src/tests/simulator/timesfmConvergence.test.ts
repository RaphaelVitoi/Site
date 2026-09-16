/**
 * IDENTITY: Testes Unitarios de Convergencia CFR via TimesFM
 * PATH: src/tests/simulator/timesfmConvergence.test.ts
 */

import {
	calculateClientCfrConvergence,
	forecastCfrConvergence,
	GATEWAY_ESPERA_APOS_FALHA_MS,
	GATEWAY_INTERVALO_MINIMO_MS,
	reiniciarLimitadorTimesFM,
} from '../../lib/timesfm-client';

beforeEach(() => reiniciarLimitadorTimesFM());

describe('limitador do gateway TimesFM', () => {
	const historico = [0.08, 0.06, 0.05, 0.04];
	const originalFetch = globalThis.fetch;
	afterEach(() => {
		jest.useRealTimers();
		Object.defineProperty(globalThis, 'fetch', { configurable: true, value: originalFetch });
	});

	test('rajada de amostras dispara uma chamada remota, nao uma por amostra', async () => {
		const fetchMock = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
		Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });

		const resultados = [];
		for (let i = 0; i < 200; i++) resultados.push(await forecastCfrConvergence(historico, 3, 0.001));

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(resultados.every((r) => r.fallback_used)).toBe(true);
	});

	test('falha abre espera longa; sucesso so respeita o intervalo minimo', async () => {
		jest.useFakeTimers({ now: 1_000_000 });
		const fetchMock = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
		Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });

		await forecastCfrConvergence(historico, 3, 0.001);
		jest.setSystemTime(1_000_000 + GATEWAY_INTERVALO_MINIMO_MS + 1);
		await forecastCfrConvergence(historico, 3, 0.001);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		jest.setSystemTime(1_000_000 + GATEWAY_ESPERA_APOS_FALHA_MS + 1);
		await forecastCfrConvergence(historico, 3, 0.001);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});

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

	test('gateway preserva a proveniencia devolvida pelo backend', async () => {
		const originalFetch = globalThis.fetch;
		const fetchMock = jest.fn().mockResolvedValueOnce({
			ok: true,
			json: async () => ({
					status: 'SUCCESS',
					forecast_type: 'univariate',
					results: {
						cfr_mean_positive_regret: {
							target_name: 'cfr_mean_positive_regret',
							history_length: 4,
							forecast_horizon: 3,
							mean_prediction: [0.03, 0.02, 0.01],
							quantile_10: [0.02, 0.01, 0.005],
							quantile_90: [0.04, 0.03, 0.02],
							model_used: 'google/timesfm-test',
							license_tier: 'Apache 2.0',
							intended_model: 'google/timesfm-test',
							weights_loaded: true,
						},
					},
					model_used: 'google/timesfm-test',
					license_tier: 'Apache 2.0',
					intended_model: 'google/timesfm-test',
					weights_loaded: true,
				}),
		});
		Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });

		const result = await forecastCfrConvergence([0.08, 0.06, 0.05, 0.04], 3, 0.001);

		expect(result.model_used).toBe('google/timesfm-test');
		expect(result.weights_loaded).toBe(true);
		expect(result.fallback_used).toBe(false);
		expect(result.source_metric).toBe('mean-positive-regret-proxy');
		Object.defineProperty(globalThis, 'fetch', { configurable: true, value: originalFetch });
	});
});
