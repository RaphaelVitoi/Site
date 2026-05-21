'use client';

/**
 * IDENTITY: Simulador GTO/CFR SOTA Quantum
 * PATH: src/components/simulator/GtoCfrSimulator.tsx
 * ROLE: Motor de visualização compacta de Decisões, Bayes e CFR.
 * PRINCIPLE: Fricção Zero & Simetria (Sem scrollbars, máxima fluidez).
 */

import
    {
        calculateBayesianUpdate,
        classifyVillainRandomForest,
        generateGeometricPath,
        simulateCfrRegretMatching,
    } from '@/lib/ai-models';
import { useMemo, useState, useContext, useEffect, useRef } from 'react';
import
    {
        Cell, // NOSONAR
        Pie,
        PieChart,
        PolarAngleAxis,
        PolarGrid,
        PolarRadiusAxis,
        Radar,
        RadarChart,
        ResponsiveContainer,
        Tooltip
    } from 'recharts';
import { SectionHeader } from '../ui/SectionHeader';
import { useSotaSync } from './hooks/useSotaSync';
import { SotaSpotContext } from './SotaContext';
import { CfrCanvas, type CfrCanvasRef } from './ui/CfrCanvas';

export function GtoCfrSimulator ()
{
    const { physics, isHydrated } = useSotaSync();
    const spot = useContext( SotaSpotContext );
    const cfrCanvasRef = useRef<CfrCanvasRef>(null);
    const workerRef = useRef<Worker | null>(null);

    const villainStats = useMemo( () => ( { vpip: 25, pfr: 20, agg: 3 } ), [] );
    const [ actionProb, setActionProb ] = useState( { val: 0.7, blf: 0.3 } );
    const [ priorBelief, setPriorBelief ] = useState( 0.3 );
    const [ cfrStrategy, setCfrStrategy ] = useState<{action: string, strategy: number}[]>([
        { action: 'FOLD', strategy: 100 },
        { action: 'CALL', strategy: 0 },
        { action: 'RAISE', strategy: 0 }
    ]);

    // SOTA: Debouncing de inputs de range para evitar colapso de UI em threads intensivas
    const [ debouncedPrior, setDebouncedPrior ] = useState( 0.3 );
    const [ debouncedBlf, setDebouncedBlf ] = useState( 0.3 );

    useEffect( () =>
    {
        const handler = setTimeout( () =>
        {
            setDebouncedPrior( priorBelief );
            setDebouncedBlf( actionProb.blf );
        }, 150 );
        return () => clearTimeout( handler );
    }, [ priorBelief, actionProb.blf ] );

    const COLORS = [ 'var(--accent-indigo)', 'var(--accent-emerald)', 'var(--accent-amber)', 'var(--accent-danger)' ];

    // Cálculos otimizados para Economia de Shannon (Antevisão Matemática)
    const geometricPath = useMemo( () => generateGeometricPath( physics.pot, physics.heroStack, 3 ), [ physics.pot, physics.heroStack ] );
    const posteriorBelief = useMemo( () => calculateBayesianUpdate( debouncedPrior, actionProb.val, debouncedBlf ), [ debouncedPrior, actionProb.val, debouncedBlf ] );
    const cfrStrategy = useMemo( () =>
    {
        // SOTA: Sincronia com a Métrica Soberana (PM)
        const evs = {
            'FOLD': spot?.actionMetrics?.fold?.perspectiva ?? 0,
            'CALL': spot?.actionMetrics?.call?.perspectiva ?? 0,
            'RAISE (GTO)': spot?.actionMetrics?.raise?.perspectiva ?? 0
        };
        return simulateCfrRegretMatching( evs );
    }, [ spot?.actionMetrics ] );

    const archetype = useMemo( () => classifyVillainRandomForest( villainStats.vpip, villainStats.pfr, villainStats.agg, 'polarized' ), [ villainStats ] );

    // SOTA: Injeção Vetorial Zero-Copy (WebGPU) acoplada à Perspectiva
    useEffect(() => {
        if (!isHydrated) return;
        workerRef.current ??= new Worker(new URL('./workers/cfr.worker.ts', import.meta.url), { type: 'module' });

        let animId: number;
        workerRef.current.onmessage = (e: MessageEvent) => {
            cfrCanvasRef.current?.updateMatrix(e.data.matrix);
            if (e.data.type === 'cfr_strategy') {
                setCfrStrategy(e.data.strategy);
            } else if (e.data.matrix) {
                cfrCanvasRef.current?.updateMatrix(e.data.matrix);
            }
        };

        const loop = () => {
            workerRef.current?.postMessage({
                id: 'gto_cfr_tick',
                nodes: 13,
                pot: physics.pot,
                stack: physics.heroStack,
                equity: spot?.actionMetrics?.call?.perspectiva ?? 50,
                kappa: 0.85
            });
            animId = setTimeout(loop, 33) as unknown as number;
        };
        loop();

        return () => {
            clearTimeout(animId);
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, [isHydrated, physics.pot, physics.heroStack, spot]);

    // SOTA: Offloading da estratégia CFR pesada para o Web Worker
    useEffect(() => {
        if (!isHydrated || !workerRef.current) return;

        const evs = {
            'FOLD': spot?.actionMetrics?.fold?.perspectiva ?? 0,
            'CALL': spot?.actionMetrics?.call?.perspectiva ?? 0,
            'RAISE (GTO)': spot?.actionMetrics?.raise?.perspectiva ?? 0
        };

        workerRef.current.postMessage({
            id: 'simulate_cfr_strategy',
            evs
        });
    }, [spot?.actionMetrics, isHydrated]);

    if ( !isHydrated ) return (
        <div className="flex flex-col items-center justify-center p-24 w-full min-h-125 bg-black/20 animate-pulse rounded-4xl border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
            <i className="fa-solid fa-atom text-accent-indigo text-3xl mb-4 opacity-50 animate-spin" />
            <div className="text-text-muted text-[0.65rem] font-black uppercase tracking-widest font-mono">Hidratando Simetria Quântica...</div>
        </div>
    );

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
                <div className="glass-panel p-8 rounded-3xl border border-accent-indigo/20 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent-indigo/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <h3 className="text-[0.65rem] font-black text-text-bright uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                            <span>Radar de A* (Quantum)</span>
                        </h3>
                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-accent-indigo/50 bg-accent-indigo/5 px-2 py-1 rounded">Optimal Sizing</span>
                    </div>

                    <div className="relative h-64 w-full mt-2 z-10">
                        <ResponsiveContainer width="100%" height="100%" minWidth={ 10 } minHeight={ 10 }>
                            <RadarChart data={ geometricPath } cx="50%" cy="50%" outerRadius="70%">
                                <defs>
                                    <linearGradient id="colorAStar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-indigo)" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="var(--accent-indigo)" stopOpacity={0.05}/>
                                    </linearGradient>
                                    <filter id="glowAStar" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="street" tick={{ fill: '#818cf8', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
                                <PolarRadiusAxis angle={90} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} />
                                <Radar name="Bet Size" dataKey="betSize" stroke="var(--accent-indigo)" fill="url(#colorAStar)" fillOpacity={1} strokeWidth={3} filter="url(#glowAStar)" animationDuration={1500} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} itemStyle={{ color: 'var(--accent-indigo-light)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-3 relative z-10">
                        { geometricPath.map( ( node ) => (
                            <div key={ `path-${ node.street }` } className="bg-black/40 p-3 rounded-xl border border-white/5 text-center shadow-inner group-hover:border-accent-indigo/20 transition-colors duration-500">
                                <div className="text-[0.55rem] text-text-darker font-black uppercase tracking-[0.2em] mb-1">{ node.street }</div>
                                <div className="text-sm font-mono text-accent-indigo-light font-black">{ node.betSize.toFixed( 1 ) }<span className="text-[0.6rem] text-accent-indigo/50 ml-1">bb</span></div>
                            </div>
                        ) ) }
                    </div>
                </div>

                {/* BAYESIAN FILTER (Visual Symmetry) */ }
                <div className="glass-panel p-8 rounded-3xl border border-accent-emerald/20 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-accent-emerald/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <h3 className="text-[0.65rem] font-black text-text-bright uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]" />
                            <span>Bayes Update</span>
                        </h3>
                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-accent-emerald/50 bg-accent-emerald/5 px-2 py-1 rounded">{ archetype }</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-8 bg-black/40 rounded-2xl border border-white/5 shadow-inner group-hover:border-accent-emerald/20 transition-colors duration-500 relative z-10">
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-text-darker mb-2">Posterior P(Valor)</span>
                        <div className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            { ( posteriorBelief * 100 ).toFixed( 1 ) }%
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-auto relative z-10">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[0.55rem] font-black text-text-muted uppercase tracking-widest">
                                <span>Prior Belief</span>
                                <span className="font-mono text-accent-emerald-light">{ ( priorBelief * 100 ).toFixed( 0 ) }%</span>
                            </div>
                            <input title="Prior Belief" aria-label="Prior Belief" type="range" min="0" max="1" step="0.05" value={ priorBelief } onChange={ e => setPriorBelief( Number.parseFloat( e.target.value ) ) } className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-emerald" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[0.55rem] font-black text-text-muted uppercase tracking-widest">
                                <span>P(Bluff)</span>
                                <span className="font-mono text-accent-amber">{ ( actionProb.blf * 100 ).toFixed( 0 ) }%</span>
                            </div>
                            <input title="Probabilidade de Blefe" aria-label="Probabilidade de Blefe" type="range" min="0" max="1" step="0.05" value={ actionProb.blf } onChange={ e => setActionProb( { ...actionProb, blf: Number.parseFloat( e.target.value ) } ) } className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-amber" />
                        </div>
                    </div>
                </div>

                {/* CFR STRATEGY (Full Width but Shallow) */ }
                <div className="glass-panel p-8 md:col-span-2 border border-accent-amber/20 rounded-3xl overflow-hidden relative group shadow-2xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-amber/5 blur-[80px] rounded-full pointer-events-none" />

                    {/* SOTA: WebGPU Background Injection */}
                    <CfrCanvas ref={cfrCanvasRef} nodes={13} />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-[0.65rem] font-black text-text-bright uppercase tracking-[0.2em] flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-amber shadow-[0_0_8px_var(--accent-amber)]" />
                            <span>CFR Convergence</span>
                        </h3>
                        <div className="text-[0.55rem] font-mono text-accent-amber font-black tracking-widest bg-accent-amber/5 px-3 py-1 rounded border border-accent-amber/20 uppercase">
                            GTO Stable
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                        <div className="w-40 h-40 shrink-0 relative min-w-40 min-h-40">
                            <ResponsiveContainer width="100%" height="100%" minWidth={ 10 } minHeight={ 10 }>
                                <PieChart>
                                    <defs>
                                        <filter id="glowPie" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <Pie data={ cfrStrategy } innerRadius={ 45 } outerRadius={ 60 } paddingAngle={ 5 } dataKey="strategy" stroke="none" filter="url(#glowPie)">
                                        { cfrStrategy.map( ( item, index ) => <Cell key={ `cell-${ item.action }` } fill={ COLORS[ index % COLORS.length ] } /> ) }{/* NOSONAR */ }
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[0.5rem] font-black text-text-darker uppercase tracking-[0.3em] font-mono">Nash</span>
                                <span className="text-[0.7rem] font-black text-white uppercase tracking-widest font-mono">Eq</span>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                            { cfrStrategy.map( ( item, index ) => {
                                const barProps = { style: { transform: `translateX(-${ 100 - item.strategy }%)`, backgroundColor: COLORS[ index % COLORS.length ] } };
                                return (
                                    <div key={ `strat-${ item.action }` } className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner group-hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[0.65rem] font-black text-text-muted font-mono uppercase tracking-widest">{ item.action }</span>
                                            <span className="text-[0.8rem] font-black text-white font-mono">{ item.strategy.toFixed( 1 ) }%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                                            <div className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out origin-left shadow-[0_0_10px_rgba(255,255,255,0.5)]" {...barProps}></div>
                                        </div>
                                    </div>
                                );
                            } ) }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
