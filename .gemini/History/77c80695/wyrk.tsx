'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { SotaMetricsContext, SotaSpotContext } from './UniversalLabShell';

export function AxiomaTracker () {
    // Consumo estrito via Contexto: Não estrangula a renderização da Shell superior
    const metrics = useContext( SotaMetricsContext );
    const spot = useContext( SotaSpotContext );

    // Estado Particionado para o RAG Híbrido
    const [ oracleStream, setOracleStream ] = useState<string>( '' );
    const [ isStreaming, setIsStreaming ] = useState<boolean>( false );
    const streamReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>( null );

    // Lógica Bayesiana: Derivação do Arquétipo FGS Baseado na Tensão de Monopólio
    const mv = metrics?.monopolyVector ?? 1;
    let archetype = '';
    let archetextColor = '';

    if ( mv >= 1.5 )
    {
        archetype = 'Arquétipo I: Dominância Absoluta (God Mode)';
        archetextColor = 'text-emerald-400';
    } else if ( mv >= 1 )
    {
        archetype = 'Arquétipo II: Tensão de Liderança';
        archetextColor = 'text-cyan-400';
    } else if ( mv >= 0.5 )
    {
        archetype = 'Arquétipo III: Resistência Ativa';
        archetextColor = 'text-yellow-400';
    } else
    {
        archetype = 'Arquétipo IV: Insolvência Iminente (Entropia Máxima)';
        archetextColor = 'text-red-500';
    }

    // Proteção de Ciclo de Vida (Regra de Ouro contra Memory Leaks de I/O)
    useEffect( () => {
        return () => {
            if ( streamReaderRef.current )
            {
                streamReaderRef.current.cancel( 'SOTA: Painel fechado. Estancando thread I/O preventivamente.' ).catch( () => { } );
                streamReaderRef.current = null;
            }
        };
    }, [] );

    const invokeOracle = async () => {
        if ( isStreaming ) return;
        setIsStreaming( true );
        setOracleStream( '' );

        try
        {
            const res = await fetch( '/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { metrics, spot } )
            } );

            if ( !res.body ) throw new Error( 'ReadableStream inativo na rota do Oráculo.' );

            const reader = res.body.getReader();
            streamReaderRef.current = reader;
            const decoder = new TextDecoder();

            while ( true )
            {
                const { done, value } = await reader.read();
                if ( done ) break;

                const chunk = decoder.decode( value, { stream: true } );
                setOracleStream( prev => prev + chunk );
            }
        } catch ( error: unknown )
        {
            if ( error instanceof Error && error.name !== 'AbortError' )
            {
                setOracleStream( prev => prev + `\n\n[ENTROPIA] Ruptura no Oráculo: ${error.message}` );
            }
        } finally
        {
            setIsStreaming( false );
            streamReaderRef.current = null;
        }
    };

    return (
        <div className="mt-2 mb-4 flex flex-col gap-4 bg-black/50 border border-zinc-800/80 rounded p-4 relative overflow-hidden shadow-inner">
            {/* Topologia Fluida (Header) */ }
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-eye text-magenta-500"></i> Axioma Tracker
                </h3>
                <span className={ `text-[0.65rem] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-zinc-950 border border-zinc-800 ${archetextColor}` }>
                    { archetype }
                </span>
            </div>

            {/* Action Bar (Ponte Híbrida) */ }
            <button
                type="button"
                disabled={ isStreaming }
                onClick={ invokeOracle }
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
                { isStreaming ? <><i className="fa-solid fa-circle-notch fa-spin text-magenta-500"></i> Canalizando Oráculo...</> : <><i className="fa-solid fa-bolt text-magenta-400"></i> Invocar Oráculo Híbrido</> }
            </button>

            {/* Visor de Streaming SOTA */ }
            { oracleStream && (
                <div className="p-3 bg-black/80 border border-zinc-800 rounded text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                    { oracleStream }
                </div>
            ) }
        </div>
    );
}
