import * as wasmEngine from '../../../../wasm-equity/pkg/vitoi_equity_engine.js';
import { expandPokerRange, rangeToBitmask } from './rangeParser';

let initialized = false;

globalThis.onmessage = async ( e: MessageEvent ) => {
    const { villainRange, board, rpFactor, heroInvested, currentPot, activePlayers, id } = e.data;

    try
    {
        if ( !initialized )
        {
            // Instanciação Lazy SOTA (não trava o startup do worker)
            // SOTA: Cache Buster Termodinâmico apenas em dev (SOTA Deploy).
            const isDev = process.env.NODE_ENV === 'development';
            const cacheBuster = isDev ? `?v=${Date.now()}` : '';
            const initFn = ( wasmEngine as any ).default || ( wasmEngine as any ).init;
            if ( typeof initFn === 'function' )
            {
                await initFn( `/wasm/vitoi_equity_engine_bg.wasm${cacheBuster}` );
            }
            initialized = true;
        }

        // SOTA: 10.000 iterações garantem significância estatística profunda com latência reduzida.
        const iterations = 10000;
        const seed = Math.floor( Math.random() * 4294967296 );

        const cleanVillainStr = expandPokerRange( villainRange || "100%" ).replaceAll( /\s+/g, "" );
        const cleanBoard = ( board || "" ).replaceAll( /\s+/g, "" );

        // SOTA: Ponte de Fricção Zero para o Rust
        const villainMask = rangeToBitmask( cleanVillainStr );

        const matrix = wasmEngine.solve_insolvency_matrix_binary( villainMask, cleanBoard, rpFactor, heroInvested, currentPot, activePlayers, iterations, seed );

        globalThis.postMessage( { matrix, id } );
    } catch ( error: unknown )
    {
        let errorMessage: string;
        if ( error instanceof Error )
        {
            errorMessage = error.message;
        } else if ( typeof error === 'string' )
        {
            errorMessage = error;
        } else
        {
            errorMessage = JSON.stringify( error );
        }

        console.warn( "[SOTA Worker] Falha silenciada na inferência WASM (Insolvência):", errorMessage );
        globalThis.postMessage( { error: errorMessage, id } );
    }
};
