'use client';

/**
 * IDENTITY: Topologia Multiway (O Abismo do RIO Quadrático)
 * PATH: src/components/simulator/panels/MultiwayTensionVisualizer.tsx
 * ROLE: Visualizar a catástrofe silenciosa das Reverse Implied Odds (RIO) escalando em O(N^2).
 */

import { MetricTooltip } from '@/components/laboratorio/MetricTooltip';
import { useContext, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SotaSpotContext } from '../SotaContext';

const INITIAL_CHART_DIMENSION = { width: 1, height: 1 };

export default function MultiwayTensionVisualizer () {
    const spotContext = useContext( SotaSpotContext );

    // Estado local para permitir simulações sem mutar a raiz do MasterSimulator (Fricção Zero)
    const basePot = spotContext?.spotData?.pot ?? 2.5;
    const baseInvested = spotContext?.heroInvested ?? 1;

    const [ simulatedPot, setSimulatedPot ] = useState( basePot );
    const [ simulatedInvested, setSimulatedInvested ] = useState( baseInvested );

    const chartData = useMemo( () => {
        const data = [];
        for ( let players = 2; players <= 9; players++ )
        {
            const opponents = players - 1;
            // Axioma Vitoi: RIO escala O(N^2). p_d aproximado de 0.15 (dominância).
            const rioChips = Math.pow( opponents, 2 ) * 0.15 * simulatedPot;

            const potOddsPct = ( simulatedInvested / ( simulatedPot + simulatedInvested ) ) * 100;
            // Mapeia o RIO em "equivalente de equidade necessária" para absorver a dívida sistêmica
            const rioPenaltyPct = ( rioChips / ( simulatedPot + simulatedInvested ) ) * 100;

            data.push( {
                players,
                name: `${players}-Way`,
                "Pot Odds (Piso)": potOddsPct,
                "Passivo RIO": rioPenaltyPct,
                "Carga Total": potOddsPct + rioPenaltyPct
            } );
        }
        return data;
    }, [ simulatedPot, simulatedInvested ] );

    const renderTooltip = ( props: any ) => {
        const { active, payload, label } = props;
        if ( active && payload?.length )
        {
            const potOdds = payload.find( ( p: any ) => p.dataKey === 'Pot Odds (Piso)' )?.value || 0;
            const rio = payload.find( ( p: any ) => p.dataKey === 'Passivo RIO' )?.value || 0;

            return (
                <div className="bg-slate-900/95 border border-indigo-500/30 p-4 rounded-lg shadow-2xl font-mono">
                    <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2 border-b border-white/5 pb-1">{ label }</p>
                    <div className="flex justify-between gap-4 text-xs mb-1">
                        <span className="text-emerald-400">Pot Odds (Ilusão):</span>
                        <span className="font-bold text-white">{ potOdds.toFixed( 1 ) }%</span>
                    </div>
                    <div className="flex justify-between gap-4 text-xs mb-1">
                        <span className="text-rose-500">Passivo RIO (O(N²)):</span>
                        <span className="font-bold text-white">+{ rio.toFixed( 1 ) }%</span>
                    </div>
                    <div className="flex justify-between gap-4 text-xs mt-2 pt-1 border-t border-white/10">
                        <span className="text-amber-400 font-bold">Equidade de Break-even:</span>
                        <span className="font-bold text-amber-400">{ ( potOdds + rio ).toFixed( 1 ) }%</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="mb-2 p-4 rounded-lg bg-rose-950/20 border border-rose-500/20 flex gap-4 items-start shadow-inner">
                <i className="fa-solid fa-users-rays text-rose-400 mt-1"></i>
                <p className="m-0 text-xs leading-relaxed text-rose-200/80">
                    <strong className="text-rose-300">A Catástrofe Silenciosa do Multiway:</strong> Na Perspectiva Matemática, a atratividade do pote inflado é uma armadilha cognitiva. As <em>Pot Odds</em> (o preço aparente) crescem linearmente, mas as <em>Reverse Implied Odds</em> (o custo de domínio e aprisionamento) escalam quadraticamente <code className="text-rose-300 bg-rose-950/50 px-1 rounded font-bold">O(N²)</code>. Observe a <span className="text-rose-400 font-bold">Zona de Insolvência</span> devorar a sua equidade de realização.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/40 border border-white/5 rounded-xl p-5 shadow-inner">
                <MetricTooltip title="Simulador de Dead Money" desc="Aumentar o pote diminui as Pot Odds (falsa segurança ilusória), mas multiplica o peso absoluto do RIO, tornando a recuperação matemática impossível em Multiway." align="left">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Pote (Dead Money)</span>
                            <span className="text-indigo-400 font-mono font-bold">{ simulatedPot.toFixed( 1 ) } bb</span>
                        </label>
                        <input type="range" min="1" max="50" step="0.5" value={ simulatedPot } onChange={ e => setSimulatedPot( Number( e.target.value ) ) } className="w-full accent-indigo-500 cursor-pointer" />
                    </div>
                </MetricTooltip>

                <MetricTooltip title="Sunk Cost (O Abismo)" desc="Seu investimento dita o Piso (EV_Fold). Em Multiway, justificar um investimento alto requer uma equidade titânica para suplantar o Passivo Estrutural." align="right">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Investido (Hero)</span>
                            <span className="text-rose-400 font-mono font-bold">{ simulatedInvested.toFixed( 1 ) } bb</span>
                        </label>
                        <input type="range" min="0.5" max="25" step="0.5" value={ simulatedInvested } onChange={ e => setSimulatedInvested( Number( e.target.value ) ) } className="w-full accent-rose-500 cursor-pointer" />
                    </div>
                </MetricTooltip>
            </div>

            <div className="w-full h-72 sm:h-96 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-center overflow-hidden relative shadow-2xl">
                <h4 className="text-[0.65rem] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 text-center">
                    Carga de Equidade: Pot Odds vs Passivo Sistêmico
                </h4>
                <ResponsiveContainer width="100%" height="100%" minWidth={ 1 } minHeight={ 1 } initialDimension={ INITIAL_CHART_DIMENSION }>
                    <AreaChart data={ chartData } margin={ { top: 10, right: 10, left: -20, bottom: 0 } }>
                        <defs>
                            <linearGradient id="colorPotOdds" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={ 0.3 } />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={ 0 } />
                            </linearGradient>
                            <linearGradient id="colorRio" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#e11d48" stopOpacity={ 0.5 } />
                                <stop offset="95%" stopColor="#e11d48" stopOpacity={ 0.1 } />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                        <XAxis dataKey="name" stroke="#475569" fontSize={ 10 } tickLine={ false } axisLine={ false } />
                        <YAxis stroke="#475569" fontSize={ 10 } tickLine={ false } axisLine={ false } tickFormatter={ v => `${v}%` } />
                        <RechartsTooltip content={ renderTooltip } cursor={ { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' } } />

                        <Area type="monotone" dataKey="Pot Odds (Piso)" stackId="1" stroke="#10b981" strokeWidth={ 2 } fill="url(#colorPotOdds)" />
                        <Area type="monotone" dataKey="Passivo RIO" stackId="1" stroke="#e11d48" strokeWidth={ 2 } fill="url(#colorRio)" />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="absolute top-10 right-6 z-10">
                    <div className="flex flex-col gap-2 bg-black/60 border border-white/5 p-3 rounded-lg backdrop-blur-sm shadow-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500" />
                            <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest font-bold">Pot Odds (Base)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-rose-500/50 border border-rose-500" />
                            <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest font-bold">Zona de Insolvência</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
