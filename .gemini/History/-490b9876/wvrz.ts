import { expandPokerRange, maskToBytes, rangeToBitmask } from './rangeParser';

// SOTA: Interface estrita para o motor WASM. Erradicação do tipo 'any'.
interface WasmInsolvencyEngine {
    default?: unknown;
    init?: ( path: string ) => Promise<void>;
    solve_insolvency_matrix_binary: ( // NOSONAR
        villainMask: Uint8Array,
        board: string,
        rpFactor: number,
        heroInvested: number,
        currentPot: number,
        activePlayers: number,
        iterations: number,
        seed: number
    ) => unknown[];
}

interface InsolvencyJobPayload {
    villainRange?: string;
    board?: string;
    rpFactor: number;
    heroInvested: number;
    currentPot: number;
    activePlayers: number;
    id: number;
}

let wasmEngine: WasmInsolvencyEngine | null = null;
let initPromise: Promise<void> | null = null;

/**
 * SOTA: Lock de Inicialização WASM.
 * Garante atomicidade no carregamento do motor Rust em ambientes altamente concorrentes.
 */
async function ensureWasmInitialized() {
    if ( wasmEngine ) return;
    if ( initPromise !== null ) return initPromise;

    initPromise = ( async () => {
        try {
            // SOTA: Importação Dinâmica isolada
            wasmEngine = ( await import( '../../../../wasm-equity/pkg/vitoi_equity_engine.js' ) ) as unknown as WasmInsolvencyEngine;
            const isDev = process.env.NODE_ENV === 'development';
            const cacheBuster = isDev ? `?v=${Date.now()}` : '';
            const initFn = wasmEngine.default ?? wasmEngine.init;

            if ( typeof initFn === 'function' ) {
                await initFn( `/wasm/vitoi_equity_engine_bg.wasm${cacheBuster}` );
            }
            console.log( "[SOTA Worker] Motor Rust (Insolvência) acoplado com sucesso." );
        } catch ( err ) {
            initPromise = null; // Permite retentativa em caso de falha de rede
            throw err;
        }
    } )();

    return initPromise;
}

globalThis.onmessage = async ( e: MessageEvent ) => {
    // Validação estrita do payload (Pattern Matching)
    if ( !e.data || typeof e.data !== 'object' ) return;

    const payload = e.data as Partial<InsolvencyJobPayload>;
    const id = payload.id;
    if ( id === undefined ) return;

    const { villainRange = "100%", board = "", rpFactor = 0, heroInvested = 0, currentPot = 0, activePlayers = 2 } = payload;

    try {
        await ensureWasmInitialized();
        if ( !wasmEngine ) throw new Error( "WASM Engine inativo após inicialização." );

        // SOTA: 10.000 iterações para equilíbrio entre precisão e latência
        const iterations = 10000;
        const seed = Math.floor( Math.random() * 4294967296 );

        const cleanVillainStr = expandPokerRange( villainRange ).replaceAll( /\s+/g, "" );
        const cleanBoard = board.replaceAll( /\s+/g, "" );
        const villainMask = maskToBytes( rangeToBitmask( cleanVillainStr ) );

        // Execução SOTA O(1) no Rust
        const matrix = wasmEngine.solve_insolvency_matrix_binary(
            villainMask, cleanBoard, rpFactor, heroInvested, currentPot, activePlayers, iterations, seed
        );

        globalThis.postMessage( { matrix, id } );
    } catch ( error: unknown ) {
        const errorMessage = error instanceof Error ? error.message : ( typeof error === 'object' && error !== null ? JSON.stringify( error ) : String( error ) );
        console.warn( "[SOTA Worker] Falha na inferência WASM:", errorMessage );
        globalThis.postMessage( { error: errorMessage, id } );
    }
};
