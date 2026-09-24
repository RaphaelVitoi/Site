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
		expect(ruinPriorityFromLayaPrediction(predIncerta)).toBe(1.30);
	});
});
