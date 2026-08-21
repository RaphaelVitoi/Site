/** @jest-environment node */
/// <reference types="jest" />

import { MonteCarloParallelPool, monteCarloPool } from '../../lib/monteCarloParallelPool';

describe('MonteCarloParallelPool (SOTA v7.0 GOLD)', () => {
	it('should return a singleton instance of MonteCarloParallelPool', () => {
		const pool1 = MonteCarloParallelPool.getInstance();
		const pool2 = MonteCarloParallelPool.getInstance();
		expect(pool1).toBe(pool2);
		expect(monteCarloPool).toBe(pool1);
	});

	it('should execute 50,000 iterations simulation and return robust convergence metrics', async () => {
		const result = await monteCarloPool.calculateEquity({
			heroRange: 'AA,KK,QQ',
			villainRange: 'AKs,AQs,KQs',
			board: '2h 7d Jc',
			iterations: 50000,
			kappa: 1.0,
		});

		expect(result).toBeDefined();
		expect(result.iterations).toBe(50000);
		expect(result.equity).toBeGreaterThanOrEqual(0.0);
		expect(result.equity).toBeLessThanOrEqual(1.0);
		expect(result.equityPercentage).toBeGreaterThanOrEqual(0.0);
		expect(result.equityPercentage).toBeLessThanOrEqual(100.0);
		expect(result.stdError).toBeGreaterThanOrEqual(0);
		expect(result.confidenceInterval95).toHaveLength(2);
		expect(result.confidenceInterval95[0]).toBeLessThanOrEqual(result.confidenceInterval95[1]);
		expect(result.simulationId).toMatch(/^sim_/);
		expect(['SHARED_ARRAY_BUFFER', 'TRANSFERABLE_WORKERS', 'SINGLE_THREAD_FALLBACK']).toContain(result.mode);
	});

	it('should gracefully handle empty ranges and return valid baseline equity', async () => {
		const result = await monteCarloPool.calculateEquity({
			heroRange: '',
			villainRange: '',
			iterations: 1000,
		});

		expect(result).toBeDefined();
		expect(result.equityPercentage).toBeGreaterThanOrEqual(0);
		expect(result.equityPercentage).toBeLessThanOrEqual(100);
	});

	it('should cleanup workers on destroy without throwing', () => {
		expect(() => {
			monteCarloPool.destroy();
		}).not.toThrow();
	});
});
