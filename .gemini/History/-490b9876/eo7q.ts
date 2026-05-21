import init, { solve_insolvency_matrix } from '../../../../wasm-equity/pkg/vitoi_equity_engine.js';

let initialized = false;

globalThis.onmessage = async ( e: MessageEvent ) => {
    const { villainRange, board, rpFactor, heroInvested, currentPot, activePlayers } = e.data;

    try
    {
        if ( !initialized )
        {
            // Instanciação Lazy SOTA (não trava o startup do worker)
            // Cache Buster Termodinâmico para atualizar binários re-forjados.
            await init( { module_or_path: `/wasm/vitoi_equity_engine_bg.wasm?v=${Date.now()}` } );
            initialized = true;
        }

        // SOTA: 10.000 iterações garantem significância estatística profunda com latência reduzida.
        const iterations = 10000;
        const seed = Math.floor( Math.random() * 4294967296 );

        const cleanVillain = ( villainRange || "100%" ).replaceAll( /\s+/g, "" );
        const cleanBoard = ( board || "" ).replaceAll( /\s+/g, "" );

        const matrix = solve_insolvency_matrix( cleanVillain, cleanBoard, rpFactor, heroInvested, currentPot, activePlayers, iterations, seed );

        globalThis.postMessage( { matrix } );
    } catch ( error: unknown )
    {
        const errorMessage = error instanceof Error
            ? error.message
            : ( typeof error === 'object' && error !== null ? JSON.stringify( error ) : String( error ) );
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
        globalThis.postMessage( { error: errorMessage } );
    }
};
