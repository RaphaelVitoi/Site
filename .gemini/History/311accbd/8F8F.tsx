'use client';

/**
 * IDENTITY: Simulador GTO/CFR SOTA Quantum
 * PATH: src/components/simulator/GtoCfrSimulator.tsx
 * ROLE: Motor de visualização compacta de Decisões, Bayes e CFR.
 * PRINCIPLE: Fricção Zero & Simetria (Sem scrollbars, máxima fluidez).
 */

import {
    calculateBayesianUpdate,
    classifyVillainRandomForest,
    generateGeometricPath,
    simulateCfrRegretMatching,
} from '@/lib/ai-models';
import { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell, // NOSONAR
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis, YAxis
} from 'recharts';
import { SectionHeader } from '../ui/SectionHeader';
import { useSotaSync } from './hooks/useSotaSync';

export function GtoCfrSimulator() {
    const { physics, isHydrated } = useSotaSync();

    const [villainStats] = useState( { vpip: 25, pfr: 20, agg: 3 } );
    const [actionProb, setActionProb] = useState( { val: 0.7, blf: 0.3 } );
    const [priorBelief, setPriorBelief] = useState( 0.3 );

    const COLORS = ['var(--accent-indigo)', 'var(--accent-emerald)', 'var(--accent-amber)', 'var(--accent-danger)'];

    // Cálculos otimizados para Economia de Shannon (Antevisão Matemática)
    const geometricPath = useMemo( () => generateGeometricPath( physics.pot, physics.heroStack, 3 ), [physics.pot, physics.heroStack] );
    const posteriorBelief = useMemo( () => calculateBayesianUpdate( priorBelief, actionProb.val, actionProb.blf ), [priorBelief, actionProb] );
    const cfrStrategy = useMemo( () => {
        const evs = {
            'FOLD': -physics.pot * 0.1,
            'CALL': ( physics.pot * 0.4 ) - ( physics.heroStack * 0.2 ),
            'RAISE (GTO)': ( physics.pot * 0.8 ) * ( physics.edgeFactor / 100 )
        };
        return simulateCfrRegretMatching( evs );
    }, [physics.pot, physics.heroStack, physics.edgeFactor] );

    const archetype = useMemo( () => classifyVillainRandomForest( villainStats.vpip, villainStats.pfr, villainStats.agg, 'polarized' ), [villainStats] );

    if ( !isHydrated ) return null;

    return (
        <div className="space-y-6 animate-sota-in">
            <SectionHeader
                step="IA"
                label="Inteligência Artificial"
                title="Decisão Quântica"
                description="Convergência CFR e Teoria da Perspectiva."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* A* PATHFINDING (Symmetrical & Compact) */ }
                <div className="glass-panel p-6 border-accent-indigo/10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-black text-text-bright uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-route text-accent-indigo text-xs" />
                            <span>A* Geometric</span>
                        </h3>
                        <span className="text-label text-accent-indigo/50">Optimal Sizing</span>
                    </div>

                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ geometricPath }>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={ false } />
                                <XAxis dataKey="street" hide />
                                <YAxis hide domain={ [0, 'dataMax + 10'] } />
                                <Bar dataKey="betSize" fill="var(--accent-indigo)" radius={ [4, 4, 0, 0] } />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        { geometricPath.map( ( node ) => (
                            <div key={ `path-${node.street}` } className="bg-white/2 p-2 rounded-lg border border-white/5 text-center">
                                <div className="text-[0.5rem] text-text-darker font-black uppercase tracking-tighter">{ node.street }</div>
                                <div className="text-xs font-mono text-accent-indigo font-bold">{ node.betSize.toFixed( 1 ) }bb</div>
                            </div>
                        ) ) }
                    </div>
                </div>

                {/* BAYESIAN FILTER (Visual Symmetry) */ }
                <div className="glass-panel p-6 border-accent-emerald/10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-black text-text-bright uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-filter text-accent-emerald text-xs" />
                            <span>Bayes Update</span>
                        </h3>
                        <span className="text-label text-accent-emerald">{ archetype }</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-4 bg-accent-emerald/[0.02] rounded-xl border border-accent-emerald/10">
                        <span className="text-label opacity-40 mb-1">Posterior P(Valor)</span>
                        <span className="text-4xl font-black text-white font-heading tracking-tighter">
                            { ( posteriorBelief * 100 ).toFixed( 1 ) }%
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[0.55rem] font-bold text-text-muted uppercase">
                                <span>P(Value)</span>
                                <span>{ ( priorBelief * 100 ).toFixed( 0 ) }%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.05" value={ priorBelief } onChange={ e => setPriorBelief( Number.parseFloat( e.target.value ) ) } className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-emerald" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[0.55rem] font-bold text-text-muted uppercase">
                                <span>P(Bluff)</span>
                                <span>{ ( actionProb.blf * 100 ).toFixed( 0 ) }%</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.05" value={ actionProb.blf } onChange={ e => setActionProb( { ...actionProb, blf: Number.parseFloat( e.target.value ) } ) } className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-orange" />
                        </div>
                    </div>
                </div>

                {/* CFR STRATEGY (Full Width but Shallow) */ }
                <div className="glass-panel p-6 md:col-span-2 border-accent-amber/10 overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-text-bright uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-rotate-left text-accent-amber text-xs" />
                            <span>CFR Convergence</span>
                        </h3>
                        <div className="text-xs font-mono text-accent-amber font-black tracking-widest bg-accent-amber/5 px-3 py-1 rounded-full uppercase scale-75">
                            GTO Stable
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-32 h-32 shrink-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={ cfrStrategy } innerRadius={ 35 } outerRadius={ 45 } paddingAngle={ 4 } dataKey="strategy" stroke="none">
                                        { cfrStrategy.map( ( item, index ) => <Cell key={ `cell-${item.action}` } fill={ COLORS[index % COLORS.length] } /> ) }{/* NOSONAR */ }
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[0.5rem] font-black text-white opacity-20 uppercase tracking-tighter font-mono">Nash</span>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            { cfrStrategy.map( ( item, index ) => (
                                <div key={ `strat-${item.action}` } className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[0.6rem] font-black text-text-muted font-mono uppercase tracking-tighter">{ item.action }</span>
                                        <span className="text-[0.7rem] font-black text-text-bright">{ item.strategy.toFixed( 1 ) }%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/3 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full rounded-full transition-all duration-1000" style={ { width: `${item.strategy}%`, backgroundColor: COLORS[index % COLORS.length] } }></div>
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
