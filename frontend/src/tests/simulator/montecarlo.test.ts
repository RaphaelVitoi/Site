/// <reference types="jest" />

import { calculateIcmMonteCarlo } from '../../lib/montecarlo';

describe('calculateIcmMonteCarlo', () => {
	it('should calculate ICM equities correctly for 3 players', () => {
		const stacks = [1000, 2000, 3000];
		const prizes = [100, 50, 25];
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 5000 });

		expect(result.equities).toHaveLength(3);
		expect(result.stdErrorPerPlayer).toHaveLength(3);
		expect(result.iterations).toBe(5000);
		expect(result.equities.every((eq) => eq >= 0)).toBe(true);
		expect(result.stdErrorPerPlayer.every((se) => !Number.isNaN(se) && se >= 0)).toBe(true);

		// A soma das equities deve ser igual à soma dos prêmios ativos
		const sumPrizes = prizes.reduce((s, v) => s + v, 0);
		const sumEquities = result.equities.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizes, 1);

		// O jogador com mais fichas deve ter maior equity
		expect(result.equities[2]).toBeGreaterThan(result.equities[1]!);
		expect(result.equities[1]).toBeGreaterThan(result.equities[0]!);
	});

	it('should handle zero stacks or empty prizes gracefully', () => {
		expect(calculateIcmMonteCarlo([0, 0, 0], [100, 50]).equities).toEqual([0, 0, 0]);
		expect(calculateIcmMonteCarlo([1000, 1000], []).equities).toEqual([0, 0]);
		expect(calculateIcmMonteCarlo([0, 0, 0], [100, 50]).stdErrorPerPlayer).toEqual([0, 0, 0]);
	});

	it('should truncate prizes if there are more prizes than players', () => {
		const stacks = [1000, 1000];
		const prizes = [100, 50, 25, 10]; // 4 prêmios para 2 jogadores
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 1000 });

		expect(result.equities).toHaveLength(2);
		const sumPrizesActive = 100 + 50; // Apenas os 2 primeiros prêmios devem ser considerados
		const sumEquities = result.equities.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizesActive, 1);
	});

	it('should trigger isBusted boolean array path when there are more than 30 players', () => {
		// Criar 32 jogadores, ativando o bitmask/isBusted fallback
		const stacks = Array.from({ length: 32 }, () => 1000);
		const prizes = [1000, 500, 250, 100, 50];
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 100 });

		expect(result.equities).toHaveLength(32);
		expect(result.equities.every((eq) => eq >= 0)).toBe(true);

		const sumPrizesActive = prizes.reduce((s, v) => s + v, 0);
		const sumEquities = result.equities.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizesActive, 1);
	});
});
