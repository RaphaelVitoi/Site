/// <reference types="jest" />

import { IcmWorkerPool } from '../../lib/icmWorkerPool';

describe('IcmWorkerPool', () => {
	it('should calculate ICM equities via single-thread fallback in node/jest environment', async () => {
		const pool = IcmWorkerPool.getInstance();
		const stacks = [1000, 2000, 3000];
		const prizes = [100, 50, 25];

		const result = await pool.calculateIcm({
			stacks,
			prizes,
			iterations: 5000,
			seed: 42,
		});

		expect(result.equities).toHaveLength(3);
		expect(result.stdErrorPerPlayer).toHaveLength(3);
		expect(result.iterations).toBe(5000);
		expect(result.seed).toBe(42);
		expect(result.mode).toBe('SINGLE_THREAD_FALLBACK');
		expect(result.simulationId).toMatch(/^icm_/);

		// Sum of equities equals sum of active prizes
		const sumPrizes = 100 + 50 + 25;
		const sumEquities = result.equities.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizes, 1);

		// Largest stack has largest equity
		expect(result.equities[2]).toBeGreaterThan(result.equities[1]!);
		expect(result.equities[1]).toBeGreaterThan(result.equities[0]!);
	});

	it('should produce deterministic results for identical seeds', async () => {
		const pool = IcmWorkerPool.getInstance();
		const stacks = [500, 1500, 3000];
		const prizes = [70, 30];

		const res1 = await pool.calculateIcm({ stacks, prizes, iterations: 2000, seed: 12345 });
		const res2 = await pool.calculateIcm({ stacks, prizes, iterations: 2000, seed: 12345 });

		expect(res1.equities).toEqual(res2.equities);
		expect(res1.stdErrorPerPlayer).toEqual(res2.stdErrorPerPlayer);
	});

	it('should never produce NaN in standard errors for large monetary prize pools', async () => {
		const pool = IcmWorkerPool.getInstance();
		// Sunday Million payouts reais: equities > 1.0 (onde a formula antiga causava NaN por p*(1-p) < 0)
		const stacks = [55000000, 42000000, 25000000, 8000000];
		const prizes = [110000, 78000, 55000, 39000];

		const result = await pool.calculateIcm({
			stacks,
			prizes,
			iterations: 5000,
			seed: 777,
		});

		expect(result.equities).toHaveLength(4);
		expect(result.stdErrorPerPlayer).toHaveLength(4);

		// Nenhuma equity nem erro padrão pode ser NaN ou negativo
		result.equities.forEach((eq) => {
			expect(Number.isFinite(eq)).toBe(true);
			expect(Number.isNaN(eq)).toBe(false);
			expect(eq).toBeGreaterThan(0);
		});

		result.stdErrorPerPlayer.forEach((se) => {
			expect(Number.isFinite(se)).toBe(true);
			expect(Number.isNaN(se)).toBe(false);
			expect(se).toBeGreaterThan(0);
		});

		// Conservação total de massa
		const sumPrizes = prizes.reduce((s, v) => s + v, 0);
		const sumEquities = result.equities.reduce((s, v) => s + v, 0);
		expect(sumEquities).toBeCloseTo(sumPrizes, 0);
	});
});
