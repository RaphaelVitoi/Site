/// <reference lib="webworker" />

self.onmessage = ( event: MessageEvent ) =>
{
    const { id, payload, t0 } = event.data;
    const t1 = performance.now();
    performance.mark( `worker_start_${ id }` );

    // Acoplamento para o Motor FFI (WASM)
    // const { ip_rp, oop_rp, kappa } = payload;
    // const result = wasm.solve_icm_distortion_binary(ip_rp, oop_rp, topologic_aggression, active_players, freqs);

    // Mocking estrutural da latência O(1) p/ simular stress
    let ops = 0;
    for ( let i = 0; i < 10000; i++ ) ops += i;

    const t2 = performance.now();
    performance.mark( `worker_end_${ id }` );
    performance.measure( `wasm_latency_${ id }`, `worker_start_${ id }`, `worker_end_${ id }` );

    self.postMessage( {
        id,
        result: { fold: 0.1, call: 0.6, raise: 0.3, _ops: ops },
        t0,
        t1,
        t2
    } );
};
