/** @jest-environment node */
import { POST } from './route';

describe('API SOTA Laya Solve: modulação de solvers via System-1', () => {
	it('retorna 400 se state e prediction estiverem ausentes', async () => {
		const request = new Request('http://localhost/api/sota/laya/solve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ solver_name: 'cfr-plus' }),
		});

		const response = await POST(request);
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json.status).toBe('ERROR');
		expect(json.error).toContain('obrigatório');
	});

	it('modula solver CFR+ com base em state simulado determinístico', async () => {
		const request = new Request('http://localhost/api/sota/laya/solve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				solver_name: 'cfr-plus',
				state: 'flop_pot_100_bet_50',
				base_parameters: { iterations: 1000 },
			}),
		});

		const response = await POST(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.status).toBe('SUCCESS');
		expect(json.bridge_result).toBeDefined();
		expect(json.bridge_result.target_solver).toBe('cfr-plus');
		expect(json.bridge_result.adapted_parameters.iterations).toBeDefined();
		expect(json.bridge_result.provenia.intended_model).toBe('multilingual');
	});

	it('modula Monte Carlo respeitando prediction injetada', async () => {
		const request = new Request('http://localhost/api/sota/laya/solve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				solver_name: 'monte-carlo',
				prediction: {
					answers: {},
					model_used: 'multilingual',
					device: 'cpu',
					n_tokens: 5,
					latency_ms: 2.0,
					noul: 0.1, // Alta complexidade
					choice: 'complex',
					score: 0.9,
					confidence: 0.85,
					provenia: {
						engine_id: 'test',
						implementation_level: 'test',
						runtime_used: 'test',
						model_used: 'test',
						intended_model: 'test',
						weights_loaded: true,
						fallback_used: false,
						assumptions: [],
						limitations: [],
						units: [],
					},
				},
				base_parameters: { simulations_count: 5000 },
			}),
		});

		const response = await POST(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.status).toBe('SUCCESS');
		expect(json.bridge_result.target_solver).toBe('monte-carlo');
		// noul <= 0.3 expande 1.5x: 5000 * 1.5 = 7500
		expect(json.bridge_result.adapted_parameters.simulations_count).toBe(7500);
		expect(json.bridge_result.framework_signals.monte_carlo_sample_expansion).toBe(true);
	});
});
