/**
 * @file laya.test.ts
 * @path frontend/src/lib/laya.test.ts
 * @role Testes unitarios de paridade TS <-> Python para o Laya S1 (ruin_priority).
 *
 * Garante que frontend e backend convergem na mesma conversao de sinal System-1
 * em prior de ruína (Teorema 2).
 */

import { ruinPriorityFromIntencao } from './laya';

describe('Laya S1 Frontend Parity Tests', () => {
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
});
