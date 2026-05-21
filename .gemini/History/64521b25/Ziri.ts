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
            // SOTA: Cache Buster Termodinâmico.
            // Força o navegador a destruir o cache antigo e buscar o binário re-forjado.
            await init( { module_or_path: `/wasm/vitoi_equity_engine_bg.wasm?v=${Date.now()}` } );
            initialized = true;
        }

        const cleanHero = heroRange.replaceAll( /\s+/g, "" );
        const cleanVillain = villainRange.replaceAll( /\s+/g, "" );
        const cleanBoard = ( board || "" ).replaceAll( /\s+/g, "" );

        // SOTA: 10.000 iterações garantem significância estatística profunda com latência sub-50ms na CPU cliente isolada.
        const iterations = 10000;
        const seed = Math.floor( Math.random() * 4294967296 ); // SOTA: Injeção de Semente Absoluta (Resolve o pânico de entropia)

        const equity = calculate_equity_monte_carlo( cleanHero, cleanVillain, cleanBoard, iterations, seed );

        // Honestidade Intelectual: Interceptando os contratos de entropia do Rust
        if ( equity === -1 ) throw new Error( "Sintaxe inválida: Hero (Exige exatamente 2 cartas. Ex: AhKh)." );
        if ( equity === -2 ) throw new Error( "Sintaxe inválida: Vilão (Exige exatamente 2 cartas. Ex: QdQc)." );
        if ( equity === -3 ) throw new Error( "Sintaxe inválida: Board (Use até 5 cartas exatas ou deixe em branco)." );
        if ( equity === -4 ) throw new Error( "Anomalia Quântica: Cartas duplicadas (colisão) detectadas na entrada." );
        if ( equity < 0 ) throw new Error( "Falha matemática no motor WASM." );

        globalThis.postMessage( { equity: Math.round( equity * 100 ) } );
    } catch ( error: any )
    {
        // SOTA: Bypass de Error Overlay do Next.js dentro do Worker
        console.warn( "[SOTA Worker] Falha silenciada na inferência WASM:", error.message || String( error ) );
        globalThis.postMessage( { equity: 50, error: error.message || String( error ) } ); // Diagnóstico Bayesiano com telemetria
    }
};
