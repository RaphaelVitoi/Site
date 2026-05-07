﻿/**
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

        // SOTA: Fricção Zero (Zero-Copy O(1) Memory Transfer)
        // Empacotando as 3 métricas matemáticas contínuas (equity, equityPercent, winProb)
        const buffer = typeof SharedArrayBuffer === 'undefined'
            ? new ArrayBuffer( results.length * 3 * 8 )
            : new SharedArrayBuffer( results.length * 3 * 8 );

        const f64Results = new Float64Array( buffer );

        for ( let i = 0; i < results.length; i++ )
        {
            f64Results[ i * 3 + 0 ] = results[ i ].equity;
            f64Results[ i * 3 + 1 ] = results[ i ].equityPercent;
            f64Results[ i * 3 + 2 ] = results[ i ].winProb;
        }

        if ( buffer instanceof SharedArrayBuffer )
        {
            ( globalThis as unknown as Worker ).postMessage( { id, type: 'ICM_RESULT', payload: f64Results } );
        } else
        {
            ( globalThis as unknown as Worker ).postMessage( { id, type: 'ICM_RESULT', payload: f64Results }, [ buffer ] );
        }
    } catch ( error: unknown )
    {
        let errorMessage = "Erro desconhecido no motor ICM.";
        if ( typeof error === 'string' ) {
            errorMessage = error;
        } else if ( error instanceof Error ) {
            errorMessage = error.message;
        }

        console.warn( "[SOTA ICM Worker] Falha matemática:", errorMessage );
        ( globalThis as unknown as Worker ).postMessage( { error: errorMessage, id } );
    }
};
