'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ISotaMetricsContext, ISotaSpotContext, SotaEcosystemProvider } from '../simulator/SotaContext';
import { AxiomaTracker } from './AxiomaTracker';
import { MonopolyVectorPanel } from './MonopolyVectorPanel';
import { PmLensTooltipSota } from './PmLensTooltipSota';

// ============================================================================
// INVARIANTES DE ISOLAMENTO (CONTEXTOS SOTA)
// ============================================================================

export type SpotState = Readonly<{ heroInvested: number; pot: number; activePlayers: number; stacks: readonly number[]; position: string }>;
export type MetricsState = Readonly<{ monopolyVector: number; riskPremium: number; perspective: number }>;

// ============================================================================
// COMPONENTES DE FRONTEIRA E TOPOLOGIA FLUIDA
// ============================================================================

type UniversalLabShellProps = Readonly<{
    initialSpot?: SpotState;
}>;

export function UniversalLabShell ( { initialSpot }: UniversalLabShellProps ) {
    const quantumWorkerRef = useRef<Worker | null>( null );
    const insolvencyWorkerRef = useRef<Worker | null>( null );
    const [ wasmState, setWasmState ] = useState<{ worker: Worker | null }>( { worker: null } );

    // Estado particionado cirurgicamente para mitigar re-render cíclico
    const [ spot, setSpot ] = useState<SpotState>( initialSpot ?? { heroInvested: 0, pot: 0, activePlayers: 2, stacks: [ 100, 100 ], position: 'BTN' } );
    const [ metrics, setMetrics ] = useState<MetricsState>( { monopolyVector: 1, riskPremium: 0, perspective: 0 } );

    const spotContextValue: ISotaSpotContext = useMemo( () => ( {
        spotData: { pot: spot.pot, stacks: spot.stacks, heroRole: [ spot.position ] },
        actionMetrics: {},
        effectiveIpRp: 0,
        effectiveOopRp: 0,
        potOddsPct: 33,
        heroInvested: spot.heroInvested,
        activePlayers: spot.activePlayers,
    } ), [ spot ] );

    const metricsContextValue: ISotaMetricsContext = useMemo( () => ( {
        quantumPerspectiva: null,
        apiQuantumMetrics: {
            monopolyVector: metrics.monopolyVector,
            riskPremium: metrics.riskPremium,
            perspectiva: metrics.perspective
        }
    } ), [ metrics ] );

    // Ciclo de Vida Quântico SOTA (WASM & Web Workers)
    useEffect( () => {
        try
        {
            // 1. Motor Quântico O(1) (Avaliação Local do Painel)
            const quantumWorker = new Worker(
                new URL( '../simulator/workers/quantum_solver.worker.ts', import.meta.url ),
                { type: 'module' }
            );
            quantumWorkerRef.current = quantumWorker;

            // 2. Motor WASM Rust SOTA (Injetado para componentes filhos em background)
            const insolvencyWorker = new Worker(
                new URL( '../simulator/workers/insolvency.worker.ts', import.meta.url ),
                { type: 'module' }
            );
            insolvencyWorkerRef.current = insolvencyWorker;
            setWasmState( { worker: insolvencyWorker } );

            quantumWorker.onmessage = ( event: MessageEvent<unknown> ) => {
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

            quantumWorker.onerror = ( error: ErrorEvent ) => {
                console.error( '[ENTROPIA CRÍTICA] Falha na Thread Quântica:', error.message );
            };
        } catch ( err: unknown )
        {
            if ( err instanceof Error )
            {
                console.error( '[ENTROPIA] Erro ao forjar as pontes de Web Worker:', err.message );
            }
        }

        // Terminação Obrigatória (Fricção Zero e Proteção da Main Thread)
        return () => {
            if ( quantumWorkerRef.current )
            {
                quantumWorkerRef.current.terminate();
                quantumWorkerRef.current = null;
            }
            if ( insolvencyWorkerRef.current )
            {
                insolvencyWorkerRef.current.terminate();
                insolvencyWorkerRef.current = null;
            }
            setWasmState( { worker: null } );
            console.log( '[SOTA] Workers SOTA Expurgo (Terminated). Main Threads protegidas.' );
        };
    }, [] );

    return (
        <SotaEcosystemProvider
            spotContextValue={ spotContextValue }
            metricsContextValue={ metricsContextValue }
            wasmActionsValue={ {} }
            wasmStateValue={ {} }
        >

            {/* Topologia Fluida SOTA: Flexbox Stackável */ }
            <div className="flex flex-col sm:flex-row gap-6 w-full items-start">

                {/* Painel Esquerdo: Controle Físico e Operacional */ }
                <section className="flex-1 w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-emerald-400 mb-4 tracking-tight">Física da Mesa</h2>
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Controles posicionais, ranges e Vetor Monopólio serão ancorados aqui via sub-componentes imutáveis.
                        </p>

                        {/* Controles Físicos SOTA */ }
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-2">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="heroPosition" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                                    <span>Posição</span>
                                    <span className="text-[0.6rem] text-magenta-500">FGS</span>
                                </label>
                                <select
                                    id="heroPosition"
                                    className="bg-black/40 border border-zinc-800 rounded p-2.5 text-white font-mono text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                                    value={ spot.position || 'BTN' }
                                    onChange={ ( e ) => {
                                        const pos = e.target.value;
                                        let minInvested = 0;
                                        if ( pos === 'BB' ) minInvested = 1;
                                        else if ( pos === 'SB' ) minInvested = 0.5;

                                        setSpot( s => ( {
                                            ...s,
                                            position: pos,
                                            heroInvested: Math.max( s.heroInvested, minInvested )
                                        } ) );
                                    } }
                                >
                                    <option value="UTG">UTG (Inércia Máxima)</option>
                                    <option value="MP">MP</option>
                                    <option value="CO">CO</option>
                                    <option value="BTN">BTN (Privilégio IP)</option>
                                    <option value="SB">SB (0.5bb)</option>
                                    <option value="BB">BB (1.0bb)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="heroInvested" className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hero Invested (bb)</label>
                                <input
                                    id="heroInvested"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    className="bg-black/40 border border-zinc-800 rounded p-2.5 text-white font-mono text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                                    value={ spot.heroInvested }
                                    onChange={ ( e ) => setSpot( s => ( { ...s, heroInvested: Number.parseFloat( e.target.value ) || 0 } ) ) }
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="potTotal" className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pot Total (bb)</label>
                                <input
                                    id="potTotal"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    className="bg-black/40 border border-zinc-800 rounded p-2.5 text-white font-mono text-sm focus:outline-hidden focus:border-emerald-500 transition-colors"
                                    value={ spot.pot }
                                    onChange={ ( e ) => setSpot( s => ( { ...s, pot: Number.parseFloat( e.target.value ) || 0 } ) ) }
                                />
                            </div>
                        </div>

                        {/* Escala da Matriz Quântica: Controle de Stacks */ }
                        <div className="flex flex-col gap-3 mt-4 mb-6 border-t border-zinc-800/50 pt-4">
                            <div className="flex justify-between items-center">
                                <label htmlFor="activePlayersSelect" className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Distribuição da Mesa (bb)</label>
                                <select
                                    id="activePlayersSelect"
                                    className="bg-black/40 border border-zinc-800 rounded text-white font-mono text-xs p-1 focus:outline-hidden focus:border-emerald-500"
                                    value={ spot.activePlayers }
                                    onChange={ ( e ) => {
                                        const newCount = Number.parseInt( e.target.value ) || 2;
                                        setSpot( s => {
                                            const newStacks = [ ...s.stacks ];
                                            while ( newStacks.length < newCount ) newStacks.push( 100 );
                                            return { ...s, activePlayers: newCount, stacks: newStacks.slice( 0, newCount ) };
                                        } );
                                    } }
                                >
                                    { [ 2, 3, 4, 5, 6, 7, 8, 9 ].map( num => (
                                        <option key={ num } value={ num }>{ num } Jogadores</option>
                                    ) ) }
                                </select>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                { spot.stacks.map( ( stack, idx ) => (
                                    <div key={ `stack-${idx}` } className="flex flex-col gap-1"> {/* NOSONAR: A ordem dos assentos físicos é imutável */ }
                                        <label htmlFor={ `stack-input-${idx}` } className="text-[0.65rem] text-zinc-500 font-mono pl-1">{ idx === 0 ? 'Hero' : `Vilão ${idx}` }</label>
                                        <input
                                            id={ `stack-input-${idx}` }
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            className="bg-black/40 border border-zinc-800 rounded p-1.5 text-white font-mono text-sm focus:outline-hidden focus:border-emerald-500 transition-colors w-full"
                                            value={ stack }
                                            onChange={ ( e ) => {
                                                const val = Number.parseFloat( e.target.value ) || 0;
                                                setSpot( s => {
                                                    const newStacks = [ ...s.stacks ];
                                                    newStacks[ idx ] = val;
                                                    return { ...s, stacks: newStacks };
                                                } );
                                            } }
                                        />
                                    </div>
                                ) ) }
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 font-bold py-3 rounded uppercase tracking-widest text-xs transition-colors mb-4 cursor-pointer"
                            onClick={ () => {
                                if ( quantumWorkerRef.current )
                                {
                                    // SOTA: Despacho Fricção Zero via Typed Arrays
                                    const buffer = new Float32Array( [ spot.heroInvested, spot.pot, spot.activePlayers, ...spot.stacks ] );
                                    quantumWorkerRef.current.postMessage( { type: 'EVALUATE_MATRIX', payload: buffer } );
                                }
                            } }
                        >
                            <i className="fa-solid fa-microchip mr-2"></i> Processar Matriz Quântica
                        </button>

                        {/* Acoplamento do Axioma Tracker e Oráculo Híbrido */ }
                        <AxiomaTracker />
                        {/* Acoplamento do Painel Visual Fricção Zero */ }
                        <MonopolyVectorPanel />
                    </div>
                </section>

                {/* Painel Direito: Análise Visceral (Perspectiva Matemática) */ }
                <section className="w-full sm:w-100 flex flex-col gap-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-cyan-400 mb-4 tracking-tight">Perspectiva</h2>
                        <div className="flex flex-col gap-3 font-mono text-sm">
                            <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-400 flex items-center">
                                    Vetor Monopólio
                                    <PmLensTooltipSota
                                        title="Tensão de Monopólio"
                                        content="Avalia a assimetria gravitacional da stack. Valores ≥ 1 indicam poder de monopólio. Valores < 1 indicam déficit e entropia."
                                        metricType={ metrics.monopolyVector >= 1 ? 'symmetry' : 'entropy' }
                                    />
                                </span>
                                <span className={ metrics.monopolyVector >= 1 ? "text-emerald-400" : "text-red-400" }>{ metrics.monopolyVector.toFixed( 3 ) }</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-400 flex items-center">
                                    Risk Premium
                                    <PmLensTooltipSota
                                        title="Dor da Colisão"
                                        content="A inflação estrita da equidade necessária para o call. O teto do RP castiga severamente as decisões marginais."
                                        metricType="machine"
                                    />
                                </span>
                                <span className="text-red-400">{ metrics.riskPremium.toFixed( 1 ) }%</span>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </SotaEcosystemProvider>
    );
}
