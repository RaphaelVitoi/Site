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

	it('should preserve 100% of prize mass with zero-stack players according to terminal convention', () => {
		// Cenário da auditoria: [100, 100, 0] com prêmios [70, 20, 10]
		// Jogador 2 já sem fichas deve receber o prêmio terminal residual (10)
		// Jogadores 0 e 1 disputam os prêmios de topo [70, 20] -> ~45 cada
		const stacks = [100, 100, 0];
		const prizes = [70, 20, 10];
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 10000, seed: 42 });

		expect(result.equities).toHaveLength(3);
		// Conservação estrita de massa
		const sumEquities = result.equities.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(100, 2);

		// Jogador 2 recebe exatamente 10 (prêmio terminal dividido entre os 1 jogadores com stack zero)
		expect(result.equities[2]).toBe(10);
		expect(result.variancePerPlayer?.[2]).toBe(0);
		expect(result.stdErrorPerPlayer[2]).toBe(0);

		// Jogadores 0 e 1 disputam igualmente os prêmios 70 e 20 -> média 45
		expect(result.equities[0]).toBeCloseTo(45, 0);
		expect(result.equities[1]).toBeCloseTo(45, 0);
	});

	it('should calculate true sample variance and provide placementDistribution matrix', () => {
		const stacks = [5000, 3000, 2000];
		const prizes = [100, 60, 30];
		const result = calculateIcmMonteCarlo(stacks, prizes, { iterations: 5000, seed: 12345 });

		// Variância e erro padrão reais
		expect(result.variancePerPlayer).toBeDefined();
		expect(result.variancePerPlayer).toHaveLength(3);
		expect(result.stdErrorPerPlayer.every((se) => !Number.isNaN(se) && se > 0)).toBe(true);

		// Placement distribution matrix: 3 jogadores x 3 colocações
		expect(result.placementDistribution).toBeDefined();
		expect(result.placementDistribution).toHaveLength(3);

		// Cada linha deve somar 1.0 (probabilidade total do jogador terminar em alguma colocação)
		result.placementDistribution!.forEach((row) => {
			const sumRow = row.reduce((s, v) => s + v, 0);
			expect(sumRow).toBeCloseTo(1, 4);
		});

		// Cada coluna deve somar 1.0 (exatamente 1 jogador por colocação)
		for (let j = 0; j < prizes.length; j++) {
			const colSum = result.placementDistribution!.reduce((s, row) => s + (row[j] ?? 0), 0);
			expect(colSum).toBeCloseTo(1, 4);
		}

		// A equity esperada deve ser exatamente a soma de P_ij * prize_j
		result.equities.forEach((eq, i) => {
			const eqFromPlacements = result.placementDistribution![i]!.reduce(
				(sum, p, j) => sum + p * prizes[j]!,
				0,
			);
			expect(eq).toBeCloseTo(eqFromPlacements, 3);
		});
	});
});
