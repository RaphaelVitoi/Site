import init, {
  alloc_range_buffer, free_range_buffer,
  calculate_equity_monte_carlo_binary, calculate_multiway_equity_zerocopy,
} from '../../../lib/engine/generated/vitoi_equity_engine';
import { dispatchSimulatorMessage } from './insolvencyProcessor';

declare const self: DedicatedWorkerGlobalScope;

// Concurrent messages share initialization; a failed load can be retried.
let initialization: ReturnType<typeof init> | undefined;
self.onmessage = async ({ data }: MessageEvent<unknown>) => {
  const response = await dispatchSimulatorMessage(data, async () => {
    initialization ??= init().catch((error: unknown) => {
      initialization = undefined;
      throw error;
    });
    const wasm = await initialization;
    return {
      equity: calculate_equity_monte_carlo_binary,
      multiway: (request) => {
        const size = request.rangesData.length;
        const ptr = alloc_range_buffer(size);
        try {
          new Float64Array(wasm.memory.buffer, ptr, size).set(request.rangesData);
          return calculate_multiway_equity_zerocopy(ptr, request.numPlayers,
            BigInt(request.boardMask), request.targetIterations, request.seed ?? 1);
        } finally {
          free_range_buffer(ptr, size);
        }
      },
    };
  });
  self.postMessage(response);
};
