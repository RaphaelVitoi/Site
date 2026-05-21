// Integração direta com a base empacotada gerada pelo wasm-pack
import init, * as wasm from '../../../../wasm-equity/pkg/vitoi_equity_engine.js';

let wasmReady = false;
const wasmInitPromise = init().then( () => { wasmReady = true; } );

globalThis.onmessage = async ( event: MessageEvent ) =>
{
    const { id, t0, payload } = event.data;
    const t1 = performance.now();
    performance.mark( `worker_start_${ id }` );

    // Garante que o motor FFI esteja alocado na memória antes da execução O(1)
    if ( !wasmReady ) await wasmInitPromise;

    // Desestruturação de matriz quântica e resolução direta WASM O(1)
    const { ip_rp, oop_rp, topologic_aggression, active_players, freqs } = payload;
    const result = ( wasm as any ).solve_icm_distortion_binary( ip_rp, oop_rp, topologic_aggression, active_players, freqs );

    const t2 = performance.now();
    performance.mark( `worker_end_${ id }` );
    performance.measure( `wasm_latency_${ id }`, `worker_start_${ id }`, `worker_end_${ id }` );

    globalThis.postMessage( {
        id,
        result,
        t0,
        t1,
        t2
    } );
};
