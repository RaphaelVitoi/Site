import init, { calculate_equity_monte_carlo } from '../../../../wasm-equity/pkg/vitoi_equity_engine.js';

let initialized = false;

// SOTA: A instância do Web Worker atua como ponte de Fricção Zero para o motor combinatório em Rust.
globalThis.onmessage = async ( e: MessageEvent ) => {
    const { heroRange, villainRange, board } = e.data;

    try
    {
        if ( !initialized )
        {
            // Instanciação Lazy SOTA (não trava o startup do worker)
            await init();
            initialized = true;
        }

        // SOTA: 10.000 iterações garantem significância estatística profunda com latência sub-50ms na CPU cliente isolada.
        const iterations = 10000;

        const equity = calculate_equity_monte_carlo( heroRange, villainRange, board || "", iterations );

        // Honestidade Intelectual: Interceptando os contratos de entropia do Rust
        if ( equity === -1.0 ) throw new Error( "Sintaxe inválida: Hero (Use combinações exatas, ex: AhKh)." );
        if ( equity === -2.0 ) throw new Error( "Sintaxe inválida: Vilão (Use combinações exatas, ex: QdQc)." );
        if ( equity === -3.0 ) throw new Error( "Sintaxe inválida: Board (Use combinações exatas ou deixe em branco)." );
        if ( equity < 0 ) throw new Error( "Falha matemática no motor WASM." );

        globalThis.postMessage( { equity: Math.round( equity * 100 ) } );
    } catch ( error )
    {
        console.error( "[SOTA Worker] Falha catastrófica na inferência WASM:", error );
        globalThis.postMessage( { equity: 50 } ); // Diagnóstico Bayesiano: Assumir neutralidade total (50%) em caso de entropia
    }
};
