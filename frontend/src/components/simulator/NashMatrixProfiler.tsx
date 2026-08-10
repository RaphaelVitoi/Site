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

function useQuantizedDebounce<T extends ( ...args: never[] ) => void> ( callback: T, delayMs: number )
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
    }, [ delayMs ] ) as T;
}

interface DistortionPayload {
    ip_rp: number;
    oop_rp: number;
    kappa: number;
    topologic_aggression: number;
    active_players: number;
    freqs: {
        fold: number;
        call: number;
        raise: number;
    };
}

export const NashMatrixProfiler: React.FC = () =>
{
    const workerRef = useRef<Worker | null>( null );
    const [ metrics, setMetrics ] = useState<MetricFrame[]>( [] );
    const [ renderPhase, setRenderPhase ] = useState<string>( "idle" );

    useEffect( () =>
    {
        workerRef.current = new Worker( new URL( '../workers/nashDistortion.worker.ts', import.meta.url ), { type: 'module' } );

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

    const processDistortion = useCallback( ( payload: DistortionPayload ) =>
    {
        if ( !workerRef.current ) return;
        // SOTA: Degradação Graciosa para ambientes sem Crypto API (ex: HTTP local legado)
        const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
        const t0 = performance.now();
        performance.mark( `react_dispatch_${ id }` );

        // SOTA Zero-Copy: Vetorização Matemática para FFI Termodinâmica
        const buffer = typeof SharedArrayBuffer === 'undefined'
            ? new ArrayBuffer( 8 * 8 )
            : new SharedArrayBuffer( 8 * 8 );

        const f64Array = new Float64Array( buffer );
        f64Array[ 0 ] = payload.ip_rp;
        f64Array[ 1 ] = payload.oop_rp;
        f64Array[ 2 ] = payload.kappa;
        f64Array[ 3 ] = payload.topologic_aggression;
        f64Array[ 4 ] = payload.active_players;
        f64Array[ 5 ] = payload.freqs.fold;
        f64Array[ 6 ] = payload.freqs.call;
        f64Array[ 7 ] = payload.freqs.raise;

        if ( buffer instanceof SharedArrayBuffer )
        {
            workerRef.current.postMessage( { id, type: 'NASH_PROFILER', payload: f64Array, t0 } );
        } else
        {
            workerRef.current.postMessage( { id, type: 'NASH_PROFILER', payload: f64Array, t0 }, [ buffer ] );
        }
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

    const onProfilerRender = ( _id: string, phase: string, actualDuration: number ) =>
    {
        if ( phase === 'update' ) setRenderPhase( `DOM Commit [${ actualDuration.toFixed( 2 ) }ms]` );
    };

    return (
        <Profiler id="NashMatrix" onRender={ onProfilerRender }>
            <div className="p-5 font-mono text-white bg-[#121212]">
                <h2 className="text-[#00ffcc] text-xl font-bold mb-4">Nash Distortion Profiler (SOTA)</h2>
                <button onClick={ handleConcurrentStressTest } className="p-2.5 bg-[#333] text-[#00ffcc] border border-[#00ffcc] cursor-pointer hover:bg-[#444] transition-colors rounded">
                    Disparar Concorrência (50 Mutações / Stress Test)
                </button>
                <div className="mt-2.5 text-[#aaa] text-sm">Fase de Renderização Atual: { renderPhase }</div>

                <h3 className="mt-5 text-lg font-bold mb-2">Logs de Latência do Worker:</h3>
                <pre className="bg-black p-4 overflow-y-auto max-h-100 rounded border border-white/10 text-xs">
                    { JSON.stringify( metrics.slice( -10 ), null, 2 ) }
                </pre>
            </div>
        </Profiler>
    );
};
