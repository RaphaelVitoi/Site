/**
 * @file laya.test.ts
 * @path frontend/src/lib/laya.test.ts
 * @role Testes unitarios de paridade TS <-> Python para o Laya S1 (ruin_priority).
 *
 * Garante que frontend e backend convergem na mesma conversao de sinal System-1
 * em prior de ruína (Teorema 2).
 */

import {
	CANONICAL_LAYA_MODEL,
	CANONICAL_LAYA_REPO,
	adaptForSolverClient,
	ruinPriorityFromIntencao,
	ruinPriorityFromLayaPrediction,
	type LayaPredictionPayload,
} from './laya';

describe('Laya S1 Frontend Parity Tests', () => {
	it('deve ter CANONICAL_LAYA_MODEL configurado para multilingual', () => {
		expect(CANONICAL_LAYA_MODEL).toBe('multilingual');
		expect(CANONICAL_LAYA_REPO).toBe('convaiinnovations/laya-multilingual');
	});

	it('deve retornar 1.0 para null, undefined ou objeto vazio', () => {
		expect(ruinPriorityFromIntencao(null)).toBe(1.0);
		expect(ruinPriorityFromIntencao(undefined)).toBe(1.0);
		expect(ruinPriorityFromIntencao({})).toBe(1.0);
	});

	it('deve retornar 1.0 para script latino sem fracao non-latin', () => {
		const latim = { idioma: 'portugues', script: 'latin', nao_latin_fraction_pct: 0.0 };
		expect(ruinPriorityFromIntencao(latim)).toBe(1.0);
	});

	it('deve calcular corretamente a prior para fracao mista (50%)', () => {
		const misto = { script: 'latin', nao_latin_fraction_pct: 50.0 };
		expect(ruinPriorityFromIntencao(misto)).toBeCloseTo(1.15, 5);
	});

	it('deve aplicar o teto conservador (1.30) para fracao de 100% (devanagari/han)', () => {
		const naoLatim = { script: 'devanagari', nao_latin_fraction_pct: 100.0 };
		expect(ruinPriorityFromIntencao(naoLatim)).toBe(1.3);

		const exagerado = { script: 'han', nao_latin_fraction_pct: 100.0 };
		expect(ruinPriorityFromIntencao(exagerado)).toBe(1.3);
	});

	it('deve calcular ruinPriorityFromLayaPrediction com base em noul ou confidence', () => {
		expect(ruinPriorityFromLayaPrediction(null)).toBe(1.0);
		expect(ruinPriorityFromLayaPrediction(undefined)).toBe(1.0);

		const predCerta: LayaPredictionPayload = {
			answers: {},
			model_used: CANONICAL_LAYA_MODEL,
			device: 'cpu',
			n_tokens: 15,
			latency_ms: 32.5,
			noul: 1.0,
			choice: 'value_pure',
			score: 0.95,
			confidence: 1.0,
			provenia: {
				engine_id: 'laya-s1-trained',
				implementation_level: 'trained-model',
				runtime_used: 'torch',
				model_used: CANONICAL_LAYA_MODEL,
				intended_model: CANONICAL_LAYA_MODEL,
				weights_loaded: true,
				fallback_used: false,
				assumptions: [],
				limitations: [],
				units: [],
			},
		};
		// noul = 1.0 -> prior = 1.0 + (1 - 1)*0.3 = 1.0
		expect(ruinPriorityFromLayaPrediction(predCerta)).toBe(1.0);

		const predIncerta: LayaPredictionPayload = {
			...predCerta,
			noul: 0.0, // risco maximo / probabilidade nula
			confidence: 0.2,
		};
		// noul = 0.0 -> prior = 1.0 + (1 - 0)*0.3 = 1.30
		expect(ruinPriorityFromLayaPrediction(predIncerta)).toBe(1.3);
	});

	it('deve modular parâmetros de CFR+ com base em noul', () => {
		const pred: LayaPredictionPayload = {
			answers: {},
			model_used: CANONICAL_LAYA_MODEL,
			device: 'cpu',
			n_tokens: 10,
			latency_ms: 1.0,
			noul: 0.5,
			choice: 'moderate',
			score: 0.5,
			confidence: 0.5,
			provenia: {
				engine_id: 'test',
				implementation_level: 'test',
				runtime_used: 'test',
				model_used: 'test',
				intended_model: 'test',
				weights_loaded: false,
				fallback_used: true,
				assumptions: [],
				limitations: [],
				units: [],
			},
		};
		const res = adaptForSolverClient('cfr-plus', pred);
		expect(res.target_solver).toBe('cfr-plus');
		// discount_alpha = 0.6 + 0.3 * (1 - 0.5) = 0.75
		expect(res.adapted_parameters.discount_alpha).toBe(0.75);
		expect(res.framework_signals.cfr_regret_matching_plus).toBe(true);
	});

	it('deve modular amostragem e prior de ruína para Monte Carlo', () => {
		const predComplex: LayaPredictionPayload = {
			answers: {},
			model_used: CANONICAL_LAYA_MODEL,
			device: 'cpu',
			n_tokens: 10,
			latency_ms: 1.0,
			noul: 0.2, // incerteza alta
			choice: 'complex',
			score: 0.2,
			confidence: 0.2,
			provenia: {
				engine_id: 'test',
				implementation_level: 'test',
				runtime_used: 'test',
				model_used: 'test',
				intended_model: 'test',
				weights_loaded: false,
				fallback_used: true,
				assumptions: [],
				limitations: [],
				units: [],
			},
		};
		const res = adaptForSolverClient('monte-carlo', predComplex, { simulations_count: 10000 });
		expect(res.target_solver).toBe('monte-carlo');
		expect(res.adapted_parameters.simulations_count).toBe(15000);
		expect(Number(res.adapted_parameters.ruin_prior)).toBeGreaterThan(1.2);
		expect(res.framework_signals.monte_carlo_sample_expansion).toBe(true);
	});

	it('deve modular horizonte e foco quantílico para TimesFM e poda para Dream-RSI', () => {
		const pred: LayaPredictionPayload = {
			answers: {},
			model_used: CANONICAL_LAYA_MODEL,
			device: 'cpu',
			n_tokens: 10,
			latency_ms: 1.0,
			noul: 0.8,
			choice: 'moderate',
			score: 0.8,
			confidence: 0.8,
			provenia: {
				engine_id: 'test',
				implementation_level: 'test',
				runtime_used: 'test',
				model_used: 'test',
				intended_model: 'test',
				weights_loaded: false,
				fallback_used: true,
				assumptions: [],
				limitations: [],
				units: [],
			},
		};
		const timesfmRes = adaptForSolverClient('timesfm', pred, { horizon: 10 });
		expect(timesfmRes.target_solver).toBe('timesfm');
		expect(Number(timesfmRes.adapted_parameters.horizon)).toBe(14); // 10 * (1 + 0.8*0.5) = 14

		const dreamRes = adaptForSolverClient('dream-rsi', pred, { pruning_margin: 0.02 });
		expect(dreamRes.target_solver).toBe('dream-rsi');
		expect(dreamRes.framework_signals.s1_pre_filtering_enabled).toBe(true);
	});
});

