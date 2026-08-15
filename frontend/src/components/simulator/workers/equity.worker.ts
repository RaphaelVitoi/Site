/**
 * IDENTITY: SOTA Multi-Threaded Monte Carlo Equity Worker (v7.0 GOLD)
 * PATH: src/components/simulator/workers/equity.worker.ts
 * ROLE: Executa sub-lotes de simulação Monte Carlo (10k-50k iterações) em WebAssembly.
 */

import init, { calculate_equity_monte_carlo_binary } from '../../../lib/engine/vitoi_equity_engine';
import { maskToBytes, rangeToBitmask } from './rangeParser';

declare const self: DedicatedWorkerGlobalScope;

let wasmInitialized = false;

export interface EquityWorkerRequest {
	type?: 'CALCULATE' | 'PING';
	heroRange: string;
	villainRange: string;
	board?: string;
	deadCards?: string;
	iterations?: number;
	simulationId: string | number;
	seed?: number;
	kappa?: number;
	sharedBuffer?: SharedArrayBuffer;
	workerIndex?: number;
}

export interface EquityWorkerResponse {
	type: 'SUCCESS' | 'ERROR' | 'PONG';
	simulationId: string | number;
	result?: number;
	iterations?: number;
	workerIndex?: number;
	latencyMs?: number;
	error?: string;
}

self.onmessage = async (e: MessageEvent<EquityWorkerRequest>) => {
	const data = e.data;
	const {
		heroRange,
		villainRange,
		board = '',
		iterations = 50000,
		simulationId,
		seed = Math.floor(Math.random() * 0xffffffff),
		kappa = 1.0,
		sharedBuffer,
		workerIndex = 0,
	} = data;

	const t0 = performance.now();

	try {
		if (!wasmInitialized) {
			await init();
			wasmInitialized = true;
		}

		if (data.type === 'PING') {
			self.postMessage({
				type: 'PONG',
				simulationId,
			} as EquityWorkerResponse);
			return;
		}

		// Vetorização bitwise estrita para Uint8Array (166 bytes) compatível com &[u8] do Rust
		const heroBigInt = typeof heroRange === 'string' ? rangeToBitmask(heroRange) : BigInt(0);
		const villainBigInt = typeof villainRange === 'string' ? rangeToBitmask(villainRange) : BigInt(0);

		const heroMask = maskToBytes(heroBigInt);
		const villainMask = maskToBytes(villainBigInt);

		const equity = calculate_equity_monte_carlo_binary(
			heroMask,
			villainMask,
			board,
			iterations,
			seed,
			kappa
		);

		const latencyMs = Number((performance.now() - t0).toFixed(2));

		// Se SharedArrayBuffer for fornecido, grava o resultado na posição indexada atômica
		if (sharedBuffer) {
			const floatView = new Float64Array(sharedBuffer);
			if (workerIndex < floatView.length) {
				floatView[workerIndex] = equity;
			}
		}

		self.postMessage({
			type: 'SUCCESS',
			simulationId,
			result: equity,
			iterations,
			workerIndex,
			latencyMs,
		} as EquityWorkerResponse);
	} catch (err: unknown) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		self.postMessage({
			type: 'ERROR',
			simulationId,
			error: errorMsg,
			workerIndex,
		} as EquityWorkerResponse);
	}
};
