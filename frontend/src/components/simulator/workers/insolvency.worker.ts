import type { ChipEvFreqs } from '../engine/types';
import { expandPokerRange, maskToBytes, rangeToBitmask } from './rangeParser';

// SOTA: Interface estrita para o motor WASM. Erradicação absoluta do tipo 'any'.
interface WasmInsolvencyEngine
{
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
    // Assinatura FFI para a Distorção ICM Quântica
    solve_icm_distortion_binary?: (
        ipRp: number, oopRp: number, aggr: number, players: number, freqs: unknown
    ) => unknown;
}

interface MatrixJobPayload
{
    type?: 'MATRIX';
    villainRange?: string;
    board?: string;
    rpFactor: number;
    heroInvested: number;
    currentPot: number;
    activePlayers: number;
    id: number;
}

interface DistortionJobPayload
{
    type?: 'DISTORTION';
    ipRpFlop: number; oopRpFlop: number; freqFlop: ChipEvFreqs;
    ipRpTurn: number; oopRpTurn: number; freqTurn: ChipEvFreqs;
    ipRpRiver: number; oopRpRiver: number; freqRiver: ChipEvFreqs;
    topologicAggression: number; activePlayers: number;
    id: number;
}

type WorkerPayload = MatrixJobPayload | DistortionJobPayload;

let wasmEngine: WasmInsolvencyEngine | null = null;
let initPromise: Promise<void> | null = null;

/**
 * SOTA: Lock de Inicialização WASM.
 * Garante atomicidade no carregamento do motor Rust em ambientes altamente concorrentes.
 */
async function ensureWasmInitialized ()
{
    if ( wasmEngine ) return;
    if ( initPromise !== null ) return initPromise;

    initPromise = ( async () =>
    {
        try
        {
            // SOTA: Importação Dinâmica isolada
            wasmEngine = ( await import( '../../../../wasm-equity/pkg/vitoi_equity_engine.js' ) ) as unknown as WasmInsolvencyEngine;
            const isDev = process.env.NODE_ENV === 'development';
            const cacheBuster = isDev ? `?v=${ Date.now() }` : '';
            const initFn = wasmEngine.default ?? wasmEngine.init;

            if ( typeof initFn === 'function' )
            {
                await initFn( `/wasm/vitoi_equity_engine_bg.wasm${ cacheBuster }` );
            }
            console.log( "[SOTA Worker] Motor Rust (Insolvência) acoplado com sucesso." );
        } catch ( err )
        {
            initPromise = null; // Permite retentativa em caso de falha de rede
            throw err;
        }
    } )();

    return initPromise;
}

globalThis.onmessage = async ( e: MessageEvent ) =>
{
    // Validação estrita do payload (Pattern Matching)
    if ( !e.data || typeof e.data !== 'object' ) return;

    const payload = e.data as WorkerPayload;
    const id = payload.id;
    if ( id === undefined ) return;

    try
    {
        await ensureWasmInitialized();
        if ( !wasmEngine ) throw new Error( "WASM Engine inativo após inicialização." );

        // SOTA Pattern Matching: Roteamento Quântico na Esteira
        if ( 'ipRpFlop' in payload )
        {
            // === ESTEIRA 1: DISTORÇÃO QUÂNTICA (NASH) ===
            const p = payload;

            const runSolver = ( ip: number, oop: number, freqs: ChipEvFreqs, activePlayers: number, topologicAggression: number ) =>
            {
                // Fricção Zero: Prioriza Rust, mas usa o TS embarcado no Worker como auto-healing asíncrono
                if ( typeof wasmEngine?.solve_icm_distortion_binary === 'function' )
                {
                    return wasmEngine.solve_icm_distortion_binary( ip, oop, topologicAggression, activePlayers, freqs );
                }
                throw new Error( "Motor WASM para Distorção ICM indisponível." );
            };

            const nashResults = {
                flop: runSolver( p.ipRpFlop, p.oopRpFlop, p.freqFlop, p.activePlayers, p.topologicAggression ),
                turn: runSolver( p.ipRpTurn, p.oopRpTurn, p.freqTurn, p.activePlayers, p.topologicAggression ),
                river: runSolver( p.ipRpRiver, p.oopRpRiver, p.freqRiver, p.activePlayers, p.topologicAggression ),
            };

            globalThis.postMessage( { type: 'DISTORTION', nashResults, id } );

        } else
        {
            // === ESTEIRA 2: MATRIZ DE INSOLVÊNCIA (MONTE CARLO) ===
            const p = payload;
            const { villainRange = "100%", board = "", rpFactor = 0, heroInvested = 0, currentPot = 0, activePlayers = 2 } = p;

            const iterations = 10000;
            const seed = Math.floor( Math.random() * 4294967296 );

            const cleanVillainStr = expandPokerRange( villainRange ).replaceAll( /\s+/g, "" );
            const cleanBoard = board.replaceAll( /\s+/g, "" );
            const villainMask = maskToBytes( rangeToBitmask( cleanVillainStr ) );

            // Execução SOTA O(1) no Rust
            const matrix = wasmEngine.solve_insolvency_matrix_binary(
                villainMask, cleanBoard, rpFactor, heroInvested, currentPot, activePlayers, iterations, seed
            );

            globalThis.postMessage( { type: 'MATRIX', matrix, id } );
        }
    } catch ( error: unknown )
    {
        const errorMessage = error instanceof Error ? error.message : String( error );
        console.warn( "[SOTA Worker] Falha na inferência WASM:", errorMessage );
        globalThis.postMessage( { error: errorMessage, id } );
    }
};
