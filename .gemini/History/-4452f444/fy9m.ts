/**
* IDENTITY: Web Worker de ICM (SOTA)
* PATH: src/components/simulator/workers/icm.worker.ts
* ROLE: Desacoplar o cálculo recursivo O(2^N) e Monte Carlo da Main Thread (UI).
* PRINCIPLE: Fricção Zero & Non-Blocking UI.
*/

import type { ICMPlayer } from '../../../lib/icmEngine';
import { calculateMalmuthHarville } from '../../../lib/icmEngine';

globalThis.onmessage = ( e: MessageEvent ) =>
{
    const { players, prizes, totalPool, id } = e.data;

    try
    {
        // Executa o motor SOTA (Malmuth-Harville ou MCMC dependendo de N)
        const results = calculateMalmuthHarville( players as ICMPlayer[], prizes as number[], totalPool as number | undefined );
        globalThis.postMessage( { results, id } );
    } catch ( error: unknown )
    {
        const errorMessage = error instanceof Error ? error.message : String( error );
        console.warn( "[SOTA ICM Worker] Falha matemática:", errorMessage );
        globalThis.postMessage( { error: errorMessage, id } );
    }
};
