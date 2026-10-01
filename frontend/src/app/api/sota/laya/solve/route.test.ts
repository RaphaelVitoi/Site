/** @jest-environment node */
import { POST } from './route';

describe('API SOTA Laya Solve: modulação de solvers via System-1', () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		// Por padrão, simula microserviço offline (connection refused) para testar o fallback determinístico sem delay de rede
		global.fetch = jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:8192'));
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

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
		expect(json.bridge_result.provenia.weights_loaded).toBe(true);
		expect(json.bridge_result.provenia.fallback_used).toBe(false);
	});

	it('preserva integridade e cai em fallback determinístico quando microserviço offline', async () => {
		const request = new Request('http://localhost/api/sota/laya/solve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				solver_name: 'pluribus',
				state: 'flop dry rainbow pot 50',
			}),
		});

		const response = await POST(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.status).toBe('SUCCESS');
		expect(json.bridge_result.target_solver).toBe('pluribus');
		expect(json.bridge_result.provenia.weights_loaded).toBeDefined();
	});

	it('modula solver CFR+ consumindo resposta bem-sucedida do microserviço upstream quando disponível', async () => {
		const mockBridge = {
			target_solver: 'cfr-plus',
			adapted_parameters: { iterations: 2500 },
			modulation_factors: {},
			framework_signals: {},
			provenia: {
				engine_id: 'laya-upstream-cuda',
				implementation_level: 'production',
				runtime_used: 'fastapi-cuda',
				model_used: 'laya-multilingual',
				intended_model: 'multilingual',
				weights_loaded: true,
				fallback_used: false,
				assumptions: [],
				limitations: [],
				units: [],
			},
		};
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ status: 'SUCCESS', bridge_result: mockBridge }),
		} as unknown as Response);

		const request = new Request('http://localhost/api/sota/laya/solve', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				solver_name: 'cfr-plus',
				state: 'flop_pot_100_bet_50',
			}),
		});

		const response = await POST(request);
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.status).toBe('SUCCESS');
		expect(json.bridge_result.target_solver).toBe('cfr-plus');
		expect(json.bridge_result.provenia.fallback_used).toBe(false);
		expect(json.bridge_result.adapted_parameters.iterations).toBe(2500);
	});
});
