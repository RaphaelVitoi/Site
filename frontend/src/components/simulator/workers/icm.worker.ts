/**
 * IDENTITY: SOTA Multi-Threaded ICM Monte Carlo Worker (v8.0 GOLD)
 * PATH: src/components/simulator/workers/icm.worker.ts
 * ROLE: Executa sub-lotes de simulação Monte Carlo ICM (Random Walk) em Web Worker.
 */

import { calculateIcmMonteCarlo } from '../../../lib/montecarlo';

export const __ICM_WORKER__ = true;

declare const self: DedicatedWorkerGlobalScope;

export interface IcmWorkerRequest {
	type?: 'CALCULATE' | 'PING';
	stacks: number[];
	prizes: number[];
	iterations?: number;
	seed?: number;
	simulationId: string | number;
	workerIndex?: number;
}

export interface IcmWorkerResponse {
	type: 'SUCCESS' | 'ERROR' | 'PONG';
	simulationId: string | number;
	equities?: number[];
	stdErrorPerPlayer?: number[];
	iterations?: number;
	workerIndex?: number;
	latencyMs?: number;
	error?: string;
}

self.onmessage = (e: MessageEvent<IcmWorkerRequest>) => {
	const data = e.data;
	const {
		stacks,
		prizes,
		iterations = 10000,
		seed,
		simulationId,
		workerIndex = 0,
	} = data;

	const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();

	try {
		if (data.type === 'PING') {
			self.postMessage({
				type: 'PONG',
				simulationId,
				workerIndex,
			} as IcmWorkerResponse);
			return;
		}

		if (!Array.isArray(stacks) || !Array.isArray(prizes) || stacks.length === 0) {
			throw new TypeError('Invalid ICM payload: stacks and prizes must be non-empty arrays.');
		}

		const result = calculateIcmMonteCarlo(stacks, prizes, {
			iterations,
			seed,
		});

		const latencyMs = Number(
			((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0).toFixed(2),
		);

		self.postMessage({
			type: 'SUCCESS',
			simulationId,
			equities: result.equities,
			stdErrorPerPlayer: result.stdErrorPerPlayer,
			iterations: result.iterations,
			workerIndex,
			latencyMs,
		} as IcmWorkerResponse);
	} catch (err: unknown) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		self.postMessage({
			type: 'ERROR',
			simulationId,
			error: errorMsg,
			workerIndex,
		} as IcmWorkerResponse);
	}
};
