/** @format */

import init, {
	solve_icm_distortion_v2,
	solve_insolvency_matrix_binary,
} from '../../../lib/engine/generated/vitoi_equity_engine';

declare const self: DedicatedWorkerGlobalScope;

let wasmInitialized = false;

self.onmessage = async (e: MessageEvent) => {
	const { matrixData, icmData, simulationId } = e.data;

	try {
		if (!wasmInitialized) {
			await init();
			wasmInitialized = true;
		}

		let result = null;
		if (matrixData) {
			result = solve_insolvency_matrix_binary(
				matrixData.villainMask,
				matrixData.board,
				matrixData.rpFactor,
				matrixData.heroInvested,
				matrixData.currentPot,
				matrixData.activePlayers,
				matrixData.iterations,
				matrixData.seed,
				matrixData.kappa
			);
		} else if (icmData) {
			result = solve_icm_distortion_v2(
				icmData.ipRp,
				icmData.oopRp,
				icmData.topologicAggression,
				icmData.activePlayers,
				icmData.potSize,
				icmData.streetIdx,
				icmData.fold,
				icmData.raise
			);
		}

		self.postMessage({
			type: 'SUCCESS',
			simulationId,
			result,
		});
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		self.postMessage({
			type: 'ERROR',
			simulationId,
			error: errorMessage,
		});
	}
};
