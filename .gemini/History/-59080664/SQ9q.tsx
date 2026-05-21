'use client';

import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { MonopolyVectorPanel } from './MonopolyVectorPanel';

// ============================================================================
// INVARIANTES DE ISOLAMENTO (CONTEXTOS SOTA)
// ============================================================================

export type SpotState = Readonly<{ heroInvested: number; pot: number; activePlayers: number }>;
export type MetricsState = Readonly<{ monopolyVector: number; riskPremium: number; perspective: number }>;

export const SotaSpotContext = createContext<SpotState | null>( null );
export const SotaWasmContext = createContext<{ worker: Worker | null }>( { worker: null } );
export const SotaMetricsContext = createContext<MetricsState | null>( null );

// ============================================================================
// COMPONENTES DE FRONTEIRA E TOPOLOGIA FLUIDA
// ============================================================================

type UniversalLabShellProps = Readonly<{
    initialSpot?: SpotState;
}>;

export function UniversalLabShell ( { initialSpot }: UniversalLabShellProps ) {
    const workerRef = useRef<Worker | null>( null );
    const [ wasmState, setWasmState ] = useState<{ worker: Worker | null }>( { worker: null } );

    // Estado particionado cirurgicamente para mitigar re-render cíclico
    const [ spot ] = useState<SpotState>( initialSpot ?? { heroInvested: 0, pot: 0, activePlayers: 0 } );
    const [ metrics, setMetrics ] = useState<MetricsState>( { monopolyVector: 1.0, riskPremium: 0, perspective: 0 } );

    const wasmContextValue = useMemo( () => wasmState, [ wasmState ] );

    // Ciclo de Vida Quântico SOTA (WASM & Web Workers)
    useEffect( () => {
        try
        {
            // Instanciação Singular SOTA com cache buster dinâmico via import.meta.url
            const worker = new Worker(
                new URL( '@/workers/quantum_solver.worker.ts', import.meta.url ),
                { type: 'module' }
            );
            workerRef.current = worker;
            setWasmState( { worker } );

            worker.onmessage = ( event: MessageEvent<unknown> ) => {
                // Pattern matching estrito. Erradicação da tipagem 'any'
                const data = event.data;
                if ( typeof data === 'object' && data !== null && 'type' in data )
                {
                    const payload = data as { type: string; payload: unknown };
                    if ( payload.type === 'QUANTUM_SYNC' )
                    {
                        console.log( '[SOTA] Sincronia Quântica Atingida', payload );
                        // Reativação da Árvore: O Worker alimentou os dados calculados O(1)
                        setMetrics( payload.payload as MetricsState );
                    }
                }
            };

            worker.onerror = ( error: ErrorEvent ) => {
                console.error( '[ENTROPIA CRÍTICA] Falha na Thread Quântica WASM:', error.message );
            };
        } catch ( err: unknown )
        {
            if ( err instanceof Error )
            {
                console.error( '[ENTROPIA] Erro ao forjar a ponte Web Worker:', err.message );
            }
        }

        // Terminação Obrigatória (Fricção Zero e Proteção da Main Thread)
        return () => {
            if ( workerRef.current )
            {
                workerRef.current.terminate();
                workerRef.current = null;
                setWasmState( { worker: null } );
                console.log( '[SOTA] Worker Quântico Expurgo (Terminated). Main Thread protegida.' );
            }
        };
    }, [] );

    return (
        <SotaWasmContext.Provider value={ wasmContextValue }>
            <SotaSpotContext.Provider value={ spot }>
                <SotaMetricsContext.Provider value={ metrics }>

                    {/* Topologia Fluida SOTA: Flexbox Stackável */ }
                    <div className="flex flex-col sm:flex-row gap-6 w-full items-start">

                        {/* Painel Esquerdo: Controle Físico e Operacional */ }
                        <section className="flex-1 w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-emerald-400 mb-4 tracking-tight">Física da Mesa</h2>
                            <div className="space-y-4">
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Controles posicionais, ranges e Vetor Monopólio serão ancorados aqui via sub-componentes imutáveis.
                                </p>
                                {/* Barreira elástica nativa contra overflow mobile */ }
                                <div className="relative w-full max-w-[min(100%,85vw)] overflow-hidden bg-black/40 rounded border border-zinc-800 p-4">
                                    <span className="text-xs font-mono text-zinc-500">Status do Motor Quântico: Operacional</span>
                                </div>
                                {/* Acoplamento do Painel Visual Fricção Zero */ }
                                <MonopolyVectorPanel />
                            </div>
                        </section>

                        {/* Painel Direito: Análise Visceral (Perspectiva Matemática) */ }
                        <section className="w-full sm:w-100 flex flex-col gap-6">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-cyan-400 mb-4 tracking-tight">Perspectiva</h2>
                                <div className="flex flex-col gap-3 font-mono text-sm">
                                    <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2"><span className="text-zinc-400">Vetor Monopólio</span><span className="text-emerald-400">{ metrics.monopolyVector.toFixed( 2 ) }</span></div>
                                    <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2"><span className="text-zinc-400">Risk Premium</span><span className="text-red-400">{ metrics.riskPremium.toFixed( 1 ) }%</span></div>
                                </div>
                            </div>
                        </section>

                    </div>
                </SotaMetricsContext.Provider>
            </SotaSpotContext.Provider>
        </SotaWasmContext.Provider>
    );
}
