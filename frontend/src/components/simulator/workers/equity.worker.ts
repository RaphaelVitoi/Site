/** @format */

import init, { calculate_equity_monte_carlo_binary } from '../../../lib/engine/vitoi_equity_engine';
import { expandPokerRange, maskToBytes, rangeToBitmask } from './rangeParser';

// SOTA: Injeção de tipagem para o bundler (Next.js) em contexto de WebWorker
declare const self: DedicatedWorkerGlobalScope;

let wasmInitialized = false;

self.onmessage = async (e: MessageEvent) => {
	const { heroRange, villainRange, board, deadCards, iterations, simulationId } = e.data;

	try {
		if (!wasmInitialized) {
			await init();
			wasmInitialized = true;
		}

		// SOTA: Vetorização de bitmasks para transmissão zero-copy para o Rust
		const heroMask = rangeToBitmask(heroRange);
		const villainMask = rangeToBitmask(villainRange);

		const result = calculate_equity_monte_carlo_binary(
			heroMask,
			villainMask,
			board || '',
			deadCards || '',
			iterations || 100000
		);

		self.postMessage({
			type: 'SUCCESS',
			simulationId,
			result
		});
	} catch (err: any) {
		self.postMessage({
			type: 'ERROR',
			simulationId,
			error: err?.message || String(err)
		});
	}
};
