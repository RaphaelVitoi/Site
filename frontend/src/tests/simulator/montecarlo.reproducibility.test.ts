/// <reference types="jest" />

import {
	calculateIcmMonteCarlo,
	deriveSeed,
	seededRandom,
} from '../../lib/montecarlo';

const STACKS = [1000, 2000, 3000, 4000, 5000];
const PRIZES = [500, 300, 200];

describe('montecarlo — reprodutibilidade por semente', () => {
	it('duas execuções com a mesma semente dão resultado idêntico', () => {
		const a = calculateIcmMonteCarlo(STACKS, PRIZES, { iterations: 3000, seed: 42 });
		const b = calculateIcmMonteCarlo(STACKS, PRIZES, { iterations: 3000, seed: 42 });

		// Igualdade exata, não aproximada: reprodutibilidade que só vale com
		// tolerância não é reprodutibilidade.
		expect(b.equities).toEqual(a.equities);
		expect(b.stdErrorPerPlayer).toEqual(a.stdErrorPerPlayer);
		expect(b.seed).toBe(42);
	});

	it('sementes diferentes produzem trajetórias diferentes', () => {
		const a = calculateIcmMonteCarlo(STACKS, PRIZES, { iterations: 3000, seed: 42 });
		const b = calculateIcmMonteCarlo(STACKS, PRIZES, { iterations: 3000, seed: 43 });

		expect(b.equities).not.toEqual(a.equities);
		// ...mas convergindo para a mesma premiação total: são o mesmo estimador.
		const soma = (v: number[]) => v.reduce((s, x) => s + x, 0);
		expect(soma(b.equities)).toBeCloseTo(soma(a.equities), 6);
	});

	it('omitir a semente devolve a semente sorteada, e ela replica a corrida', () => {
		const espontanea = calculateIcmMonteCarlo(STACKS, PRIZES, { iterations: 2000 });

		// O contrato central: `seed` nunca é nulo, mesmo sem semente declarada.
		expect(typeof espontanea.seed).toBe('number');
		expect(Number.isSafeInteger(espontanea.seed)).toBe(true);
		expect(espontanea.seed).toBeGreaterThanOrEqual(0);
		expect(espontanea.seed).toBeLessThanOrEqual(0xffffffff);

		const replay = calculateIcmMonteCarlo(STACKS, PRIZES, {
			iterations: 2000,
			seed: espontanea.seed,
		});
		expect(replay.equities).toEqual(espontanea.equities);
		expect(replay.stdErrorPerPlayer).toEqual(espontanea.stdErrorPerPlayer);
	});

	it('o caminho isBusted (N > 30) também é reprodutível', () => {
		const stacks = Array.from({ length: 34 }, (_, i) => 1000 + i * 25);
		const prizes = [1000, 500, 250, 100, 50];

		const a = calculateIcmMonteCarlo(stacks, prizes, { iterations: 500, seed: 7 });
		const b = calculateIcmMonteCarlo(stacks, prizes, { iterations: 500, seed: 7 });

		expect(b.equities).toEqual(a.equities);
		expect(a.equities).toHaveLength(34);
	});

	it('o caminho degenerado (sem fichas) também declara a semente', () => {
		const semFichas = calculateIcmMonteCarlo([0, 0], [100], { seed: 99 });
		expect(semFichas.seed).toBe(99);
		expect(semFichas.iterations).toBe(0);

		const semSemente = calculateIcmMonteCarlo([0, 0], [100]);
		expect(typeof semSemente.seed).toBe('number');
	});

	it('recusa semente fora do intervalo de 32 bits sem sinal', () => {
		expect(() => calculateIcmMonteCarlo(STACKS, PRIZES, { seed: -1 })).toThrow(RangeError);
		expect(() => calculateIcmMonteCarlo(STACKS, PRIZES, { seed: 2 ** 32 })).toThrow(RangeError);
		expect(() => calculateIcmMonteCarlo(STACKS, PRIZES, { seed: 1.5 })).toThrow(RangeError);
	});
});

describe('seededRandom — vetor congelado', () => {
	/**
	 * Vetor conhecido de mulberry32 para a semente 1. Congelado de propósito: se
	 * alguém trocar o gerador, toda equity já publicada sob uma dada semente muda
	 * de valor, e essa troca tem que reprovar um teste em vez de passar calada.
	 */
	const VETOR_SEED_1 = [
		0.6270739405881613, 0.002735721180215478, 0.5274470399599522,
		0.9810509674716741, 0.9683778982143849,
	];

	it('reproduz o vetor conhecido para a semente 1', () => {
		const rng = seededRandom(1);
		const saida = Array.from({ length: VETOR_SEED_1.length }, () => rng());
		saida.forEach((v, i) => expect(v).toBeCloseTo(VETOR_SEED_1[i]!, 12));
	});

	it('produz valores em [0, 1) e é função pura da semente', () => {
		const a = Array.from({ length: 256 }, seededRandom(12345));
		const primeiro = seededRandom(12345);
		const b = Array.from({ length: 256 }, () => primeiro());
		expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
		expect(b).toEqual(Array.from({ length: 256 }, seededRandom(12345)));
	});
});

describe('deriveSeed', () => {
	it('devolve um uint32 válido', () => {
		for (let i = 0; i < 32; i++) {
			const s = deriveSeed();
			expect(Number.isSafeInteger(s)).toBe(true);
			expect(s).toBeGreaterThanOrEqual(0);
			expect(s).toBeLessThanOrEqual(0xffffffff);
		}
	});

	it('não é constante — é fonte de entropia, não valor fixo', () => {
		const amostras = new Set(Array.from({ length: 64 }, () => deriveSeed()));
		expect(amostras.size).toBeGreaterThan(1);
	});
});
