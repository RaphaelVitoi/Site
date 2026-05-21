/**
 * IDENTITY: Módulo de Avaliação Bruta (ChipEV Engine)
 * PATH: src/components/simulator/workers/equity.worker.ts
 * ROLE: Isolar o cálculo intensivo (Força Bruta/Monte Carlo) de ranges de poker.
 * STATUS: [FASE 2] Integração SOTA com Rust/WASM.
 */

// SOTA: Webpack 5 exige inicialização assíncrona para instâncias WebAssembly
import init, { calculate_equity_monte_carlo } from './frontend/wasm-equity/pkg/vitoi_equity_engine';

let wasmInitialized = false;

self.onmessage = async ( e: MessageEvent ) => {
    const { heroRange, villainRange, board } = e.data;

    try
    {
        if ( !wasmInitialized )
        {
            await init();
            wasmInitialized = true;
        }
        if ( heroRange && villainRange )
        {
            // Disparo da Força Bruta Nativa: 50.000 iterações na CPU do browser
            const equity = calculate_equity_monte_carlo( heroRange, villainRange, board || "", 50000 );
            self.postMessage( { equity: Number( ( equity * 100 ).toFixed( 2 ) ) } );
        }
    } catch ( error )
    {
        console.error( "[WASM ENGINE FATAL]", error );
        self.postMessage( { equity: 50 } ); // Fallback termodinâmico
    }
};

export { };
