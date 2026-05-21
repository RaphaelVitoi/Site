/// <reference types="jest" />

import { calculateIcmMonteCarlo } from '../../lib/montecarlo';

describe('calculateIcmMonteCarlo', () => {
	it('should calculate ICM equities correctly for 3 players', () => {
		const stacks = [1000, 2000, 3000];
		const prizes = [100, 50, 25];
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 5000 });

		expect(result).toHaveLength(3);
		expect(result.every((eq) => eq >= 0)).toBe(true);

		// A soma das equities deve ser igual à soma dos prêmios ativos
		const sumPrizes = prizes.reduce((s, v) => s + v, 0);
		const sumEquities = result.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizes, 1);

		// O jogador com mais fichas deve ter maior equity
		expect(result[2]).toBeGreaterThan(result[1]);
		expect(result[1]).toBeGreaterThan(result[0]);
	});

	it('should handle zero stacks or empty prizes gracefully', () => {
		expect(calculateIcmMonteCarlo([0, 0, 0], [100, 50])).toEqual([0, 0, 0]);
		expect(calculateIcmMonteCarlo([1000, 1000], [])).toEqual([0, 0]);
	});

	it('should truncate prizes if there are more prizes than players', () => {
		const stacks = [1000, 1000];
		const prizes = [100, 50, 25, 10]; // 4 prêmios para 2 jogadores
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 1000 });

		expect(result).toHaveLength(2);
		const sumPrizesActive = 100 + 50; // Apenas os 2 primeiros prêmios devem ser considerados
		const sumEquities = result.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizesActive, 1);
	});

	it('should trigger isBusted boolean array path when there are more than 30 players', () => {
		// Criar 32 jogadores, ativando o bitmask/isBusted fallback
		const stacks = Array.from({ length: 32 }, () => 1000);
		const prizes = [1000, 500, 250, 100, 50];
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 100 });

		expect(result).toHaveLength(32);
		expect(result.every((eq) => eq >= 0)).toBe(true);

		const sumPrizesActive = prizes.reduce((s, v) => s + v, 0);
		const sumEquities = result.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizesActive, 1);
	});
});
