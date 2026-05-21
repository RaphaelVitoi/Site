import React, { useEffect, useRef, useState, Profiler, useCallback } from 'react';

interface MetricFrame
{
    id: string;
    t0: number; // Dispatch React
    t1: number; // Chegada no Worker (Friccao I/O)
    t2: number; // Fim do FFI WASM
    t3: number; // Atualização React Completa
    totalLatencyMs: number;
    workerFrictionMs: number;
    wasmExecutionMs: number;
}

function useQuantizedDebounce<T extends ( ...args: any[] ) => void> ( callback: T, delayMs: number )
{
    const timer = useRef<ReturnType<typeof setTimeout> | null>( null );
    const callbackRef = useRef<T>( callback );

    // SOTA: Preserva a closure mais recente sem invalidar a alocação de memória do debouncer.
    useEffect( () => { callbackRef.current = callback; }, [ callback ] );

    useEffect( () =>
    {
        return () => { if ( timer.current ) clearTimeout( timer.current ); };
    }, [] );

    return useCallback( ( ...args: Parameters<T> ) =>
    {
        if ( timer.current ) clearTimeout( timer.current );
        timer.current = setTimeout( () => callbackRef.current( ...args ), delayMs );
    }, [ delayMs ] );
}

export const NashMatrixProfiler: React.FC = () =>
{
    const workerRef = useRef<Worker | null>( null );
    const [ metrics, setMetrics ] = useState<MetricFrame[]>( [] );
    const [ renderPhase, setRenderPhase ] = useState<string>( "idle" );

    useEffect( () =>
    {
        workerRef.current = new Worker( new URL( './workers/insolvency.worker.ts', import.meta.url ), { type: 'module' } );

        workerRef.current.onmessage = ( e: MessageEvent ) =>
        {
            const { id, t0, t1, t2 } = e.data;
            const t3 = performance.now();

            setMetrics( prev => [ ...prev, {
                id,
                t0, t1, t2, t3,
                totalLatencyMs: Number.parseFloat( ( t3 - t0 ).toFixed( 2 ) ),
                workerFrictionMs: Number.parseFloat( ( t1 - t0 ).toFixed( 2 ) ),
                wasmExecutionMs: Number.parseFloat( ( t2 - t1 ).toFixed( 2 ) )
            } ] );

            performance.mark( `react_render_end_${ id }` );
            performance.measure( `full_cycle_${ id }`, `react_dispatch_${ id }`, `react_render_end_${ id }` );
        };

        return () => workerRef.current?.terminate();
    }, [] );

    const processDistortion = useCallback( ( payload: any ) =>
    {
        if ( !workerRef.current ) return;
        const id = crypto.randomUUID();
        const t0 = performance.now();
        performance.mark( `react_dispatch_${ id }` );
        workerRef.current.postMessage( { id, type: 'NASH_PROFILER', ...payload, t0 } );
    }, [] );

    // Debouncer SOTA: Blindagem contra engarrafamento de UI (Intervalo de Quantum ~ 60fps)
    const dispatchQuantized = useQuantizedDebounce( processDistortion, 16.67 );

    const handleConcurrentStressTest = () =>
    {
        for ( let i = 0; i < 50; i++ )
        {
            dispatchQuantized( {
                ip_rp: Math.random(),
                oop_rp: Math.random(),
                kappa: 0.8,
                topologic_aggression: 1.2,
                active_players: 3,
                freqs: { fold: 0.2, call: 0.4, raise: 0.4 }
            } );
        }
    };

    const onProfilerRender = ( id: string, phase: string, actualDuration: number ) =>
    {
        if ( phase === 'update' ) setRenderPhase( `DOM Commit [${ actualDuration.toFixed( 2 ) }ms]` );
    };

    return (
        <Profiler id="NashMatrix" onRender={ onProfilerRender }>
            <div style={ { padding: '20px', fontFamily: 'monospace', color: '#fff', background: '#121212' } }>
                <h2 style={ { color: '#00ffcc' } }>Nash Distortion Profiler (SOTA)</h2>
                <button onClick={ handleConcurrentStressTest } style={ { padding: '10px', background: '#333', color: '#00ffcc', border: '1px solid #00ffcc', cursor: 'pointer' } }>
                    Disparar Concorrência (50 Mutações / Stress Test)
                </button>
                <div style={ { marginTop: '10px', color: '#aaa' } }>Fase de Renderização Atual: { renderPhase }</div>

                <h3 style={ { marginTop: '20px' } }>Logs de Latência do Worker:</h3>
                <pre style={ { background: '#000', padding: '15px', overflowY: 'auto', maxHeight: '400px' } }>
                    { JSON.stringify( metrics.slice( -10 ), null, 2 ) }
                </pre>
            </div>
        </Profiler>
    );
};
