/**
 * IDENTITY: SOTA Multi-Threaded & Table ICM Worker (v8.0 GOLD)
 * PATH: src/components/simulator/workers/icm.worker.ts
 * ROLE: Desacopla o cálculo de ICM de mesa e sub-lotes Monte Carlo da Main Thread (UI).
 */

import { calculateIcmMonteCarlo } from '../../../lib/montecarlo';
import { processTableIcmRequest, type IcmTableResponse } from './icmTableProcessor';

export const __ICM_WORKER__ = true;

declare const self: DedicatedWorkerGlobalScope;

export interface IcmWorkerRequest {
	type?: 'CALCULATE' | 'PING';
	stacks?: number[];
	prizes?: number[];
	iterations?: number;
	seed?: number;
	simulationId?: string | number;
	workerIndex?: number;
}

export interface IcmWorkerResponse {
	type: 'SUCCESS' | 'ERROR' | 'PONG';
	simulationId?: string | number;
	equities?: number[] | undefined;
	stdErrorPerPlayer?: number[] | undefined;
	variancePerPlayer?: number[] | undefined;
	placementDistribution?: number[][] | undefined;
	iterations?: number | undefined;
	workerIndex?: number | undefined;
	latencyMs?: number | undefined;
	error?: string | undefined;
}

self.onmessage = (e: MessageEvent<unknown>) => {
	const data = e.data;
	if (typeof data !== 'object' || data === null) return;

	// Ramo 1: IcmTableRequest da UI (useIcmCalculations / EquityCalculator)
	if ('players' in data && 'selection' in data) {
		try {
			const response: IcmTableResponse = processTableIcmRequest(data);
			(self as unknown as Worker).postMessage(response, [response.payload.buffer]);
		} catch (error: unknown) {
			const id = 'id' in data && typeof data.id === 'string' ? data.id : undefined;
			(self as unknown as Worker).postMessage({
				id,
				error: error instanceof Error ? error.message : 'Falha no cálculo ICM.',
			});
		}
		return;
	}

	// Ramo 2: IcmWorkerRequest do IcmWorkerPool (Monte Carlo paralelo)
	const workerReq = data as IcmWorkerRequest;
	const {
		stacks,
		prizes,
		iterations = 10000,
		seed,
		simulationId,
		workerIndex = 0,
	} = workerReq;

	const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();

	try {
		if (workerReq.type === 'PING') {
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
			variancePerPlayer: result.variancePerPlayer,
			placementDistribution: result.placementDistribution,
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
