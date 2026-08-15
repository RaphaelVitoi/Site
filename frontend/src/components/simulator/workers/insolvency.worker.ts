/** @format */

import init, {
  solve_insolvency_matrix_binary,
  solve_icm_distortion_v2,
  calculate_perspectiva_vitoi_wasm,
  alloc_range_buffer,
  free_range_buffer,
  calculate_multiway_equity_zerocopy,
} from '../../../lib/engine/vitoi_equity_engine';
import { maskToBytes, rangeToBitmask } from './rangeParser';

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
			result = solve_insolvency_matrix_binary(matrixData);
		} else if (icmData) {
			result = solve_icm_distortion_v2(icmData.stacks, icmData.prizes);
		}

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
