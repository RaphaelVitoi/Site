/**
 * IDENTITY: Web Worker de Distorção Nash SOTA
 * PATH: src/components/simulator/workers/nashDistortion.worker.ts
 * ROLE: Processar distorções ICM pesadas em background via WASM/JIT.
 */

import { solveIcmDistortion } from '../engine/nashSolver';
import type { ChipEvFreqs } from '../engine/types';

interface DistortionJob {
    id: number;
    ipRp: number;
    oopRp: number;
    freqs: ChipEvFreqs;
    aggression: number;
    activePlayers: number;
}

globalThis.onmessage = (e: MessageEvent) => {
    const t0 = performance.now();
    const { id, ipRp, oopRp, freqs, aggression } = e.data as DistortionJob;

    try {
        const t1 = performance.now();

        // SOTA: O Motor de Distorção Nash aplica a Hierarquia Vitoi (PMev)
        // O activePlayers pode ser usado para escalar RIO MW se o solver suportar futuramente
        const result = solveIcmDistortion(ipRp, oopRp, freqs, aggression);

        const t2 = performance.now();

        (globalThis as unknown as Worker).postMessage({
            type: 'DISTORTION_RESULT',
            id,
            nashResults: result,
            t0, t1, t2
        });
    } catch (error) {
        (globalThis as unknown as Worker).postMessage({
            id,
            error: error instanceof Error ? error.message : String(error),
            t0
        });
    }
};
