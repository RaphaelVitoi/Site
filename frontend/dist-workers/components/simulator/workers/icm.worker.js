/**
 * IDENTITY: Web Worker de ICM (SOTA)
 * PATH: src/components/simulator/workers/icm.worker.ts
 * ROLE: Desacoplar o cálculo recursivo O(2^N) e Monte Carlo da Main Thread (UI).
 * PRINCIPLE: Fricção Zero & Non-Blocking UI.
 */
import { calculateMalmuthHarville } from '../../../lib/icmEngine';
// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito
export const __ICM_WORKER__ = true;
globalThis.onmessage = (e) => {
    const { players, prizes, totalPool, id } = e.data;
    if (id === undefined || !players || !prizes) {
        console.warn('[SOTA ICM Worker] Invalid payload discarded.');
        return;
    }
    try {
        // Executa o motor SOTA (Malmuth-Harville ou MCMC dependendo de N)
        const icmResults = calculateMalmuthHarville(players, prizes, totalPool);
        // SOTA: Fricção Zero (Zero-Copy O(1) Memory Transfer)
        // Empacotando as 3 métricas matemáticas contínuas (equity, equityPercent, winProb)
        const buffer = typeof SharedArrayBuffer === 'undefined'
            ? new ArrayBuffer(icmResults.length * 3 * 8)
            : new SharedArrayBuffer(icmResults.length * 3 * 8);
        const f64Results = new Float64Array(buffer);
        for (let i = 0; i < icmResults.length; i++) {
            const res = icmResults[i];
            if (res) {
                f64Results[i * 3 + 0] = res.equity;
                f64Results[i * 3 + 1] = res.equityPercent;
                f64Results[i * 3 + 2] = res.winProb;
            }
        }
        if (buffer instanceof SharedArrayBuffer) {
            globalThis.postMessage({
                id,
                type: 'ICM_RESULT',
                payload: f64Results,
            });
        }
        else {
            globalThis.postMessage({ id, type: 'ICM_RESULT', payload: f64Results }, [buffer]);
        }
    }
    catch (error) {
        let errorMessage = 'Erro desconhecido no motor ICM.';
        if (typeof error === 'string') {
            errorMessage = error;
        }
        else if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.warn('[SOTA ICM Worker] Falha matemática:', errorMessage);
        globalThis.postMessage({ error: errorMessage, id });
    }
};
