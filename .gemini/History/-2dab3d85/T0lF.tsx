'use client';

/**
 * IDENTITY: Degradação FGS (Erosão Temporal t-3 órbitas)
 * PATH: src/components/simulator/panels/FgsDegradationTimeline.tsx
 * ROLE: Visualizar o deslocamento do baseline do EV_fold devido à gravidade do Big Blind iminente e saltos de blind.
 * BINDING: [SotaContext.tsx]
 */

import { MetricTooltip } from '@/components/laboratorio/MetricTooltip';
import { useContext, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SotaSpotContext } from '../SotaContext';

const INITIAL_CHART_DIMENSION = { width: 1, height: 1 };

export default function FgsDegradationTimeline () {
    const spotContext = useContext( SotaSpotContext );

    // Fallbacks SOTA para fricção zero
    const baseInvested = spotContext?.heroInvested ?? 1.125; // Ante + Fold baseline

    const [ timeToJump, setTimeToJump ] = useState( 3 ); // Minutos para o salto
    const [ position, setPosition ] = useState<'UTG' | 'MP' | 'CO' | 'BTN' | 'SB'>( 'UTG' );

    // A erosão temporal acelera conforme o tempo para o salto de blinds zera.
    // E a posição define quantas mãos faltam para pagar o Big Blind.
    const positionDistance: Record<string, number> = {
        'UTG': 1,
        'MP': 4,
        'CO': 6,
        'BTN': 7,
        'SB': 8 // O SB já pagou parte, o BB é depois da órbita
    };

    const chartData = useMemo( () => {
        const data = [];
        const dist = positionDistance[ position ];

        for ( let t = 15; t >= 0; t-- )
        {
            // Fator de tempo: quanto menor o t, maior a gravidade do salto
            const timeFactor = t <= timeToJump ? ( 1 + ( timeToJump - t ) * 0.1 ) : 1;

            // Fator posicional: quanto mais perto do BB, mais grave (UTG sofre a guilhotina imediata)
            const posFactor = 1 + ( 1 / dist );

            // O Sunk Cost aparente do fold (baseline GTO)
            const baseEvFold = -baseInvested;

            // O custo real considerando a degradação preditiva FGS
            const degradedEvFold = baseEvFold * timeFactor * posFactor;

            data.push( {
                time: `${t}m`,
                "EV_Fold GTO": baseEvFold,
                "EV_Fold FGS (Erosão)": degradedEvFold
            } );
        }
        return data.reverse();
    }, [ timeToJump, position, baseInvested ] );

    const renderTooltip = ( props: any ) => {
        const { active, payload, label } = props;
        if ( active && payload?.length )
        {
            const gto = payload.find( ( p: any ) => p.dataKey === 'EV_Fold GTO' )?.value || 0;
            const fgs = payload.find( ( p: any ) => p.dataKey === 'EV_Fold FGS (Erosão)' )?.value || 0;

            return (
                <div className="bg-slate-900/95 border border-sky-500/30 p-4 rounded-lg shadow-2xl font-mono">
                    <p className="text-sky-400 font-bold uppercase tracking-widest text-[10px] mb-2 border-b border-white/5 pb-1">Tempo Restante: { label }</p>
                    <div className="flex justify-between gap-4 text-[11px] mb-1">
                        <span className="text-slate-400">EV_Fold Estático:</span>
                        <span className="font-bold text-white">{ gto.toFixed( 2 ) } bb</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px] mb-1">
                        <span className="text-rose-500">EV_Fold Preditivo (FGS):</span>
                        <span className="font-bold text-rose-400">{ fgs.toFixed( 2 ) } bb</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[10px] mt-2 pt-1 border-t border-white/10 text-sky-300/80 italic">
                        <span>Piso dinâmico afundou { ( gto - fgs ).toFixed( 2 ) } bb</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="mb-2 p-4 rounded-lg bg-sky-950/20 border border-sky-500/20 flex gap-4 items-start shadow-inner">
                <i className="fa-solid fa-clock-rotate-left text-sky-400 mt-1"></i>
                <p className="m-0 text-xs leading-relaxed text-sky-200/80">
                    <strong className="text-sky-300">Erosão Antecipada (FGS t-3):</strong> O GTO tradicional avalia o custo do fold de forma estática (ex: -1.125bb). A Perspectiva Matemática reconhece o fluxo do tempo: se você é o UTG e os blinds vão subir em 3 minutos, a sua stack atual perderá <em>valuation</em> quase imediatamente. O custo real de foldar afunda, forçando uma agressão (open-raise) muito mais permissiva para evitar morrer cego pelo salto dos blinds.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/40 border border-white/5 rounded-xl p-5 shadow-inner">
                <MetricTooltip title="Gravidade Posicional" desc="Estar no UTG significa que você será o Big Blind na próxima mão. A urgência de agir é extrema, pois o EV do fold embute o custo inevitável da próxima órbita." align="left">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Posição Atual</span>
                            <span className="text-sky-400 font-mono font-bold">{ position }</span>
                        </label>
                        <select
                            value={ position }
                            onChange={ e => setPosition( e.target.value as any ) }
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-2 text-sm text-sky-300 font-mono outline-none focus:border-sky-500"
                        >
                            <option value="UTG">UTG (Guilhotina)</option>
                            <option value="MP">MP (Alerta)</option>
                            <option value="CO">CO (Estratégico)</option>
                            <option value="BTN">BTN (Conforto)</option>
                            <option value="SB">SB (Transição)</option>
                        </select>
                    </div>
                </MetricTooltip>

                <MetricTooltip title="Salto de Blinds (Relógio)" desc="A proximidade temporal de um aumento de blinds funciona como um imposto inflacionário sobre as suas fichas ociosas." align="right">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Minutos p/ Salto</span>
                            <span className="text-rose-400 font-mono font-bold">{ timeToJump } min</span>
                        </label>
                        <input type="range" min="0" max="15" step="1" value={ timeToJump } onChange={ e => setTimeToJump( Number( e.target.value ) ) } className="w-full accent-rose-500 cursor-pointer" />
                    </div>
                </MetricTooltip>
            </div>

            <div className="w-full h-72 sm:h-80 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-center overflow-hidden relative shadow-2xl">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 text-center">
                    Trajetória de Erosão do EV_Fold (Piso Dinâmico)
                </h4>
                <ResponsiveContainer width="100%" height="100%" minWidth={ 1 } minHeight={ 1 } initialDimension={ INITIAL_CHART_DIMENSION }>
                    <AreaChart data={ chartData } margin={ { top: 10, right: 10, left: -20, bottom: 0 } }>
                        <defs>
                            <linearGradient id="colorFgs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#e11d48" stopOpacity={ 0.4 } />
                                <stop offset="95%" stopColor="#e11d48" stopOpacity={ 0 } />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                        <XAxis dataKey="time" stroke="#475569" fontSize={ 10 } tickLine={ false } axisLine={ false } />
                        <YAxis stroke="#475569" fontSize={ 10 } tickLine={ false } axisLine={ false } />
                        <RechartsTooltip content={ renderTooltip } cursor={ { stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' } } />

                        <ReferenceLine y={ -baseInvested } stroke="#38bdf8" strokeDasharray="3 3" label={ { position: 'top', value: 'EV_Fold Estático', fill: '#38bdf8', fontSize: 10, opacity: 0.8 } } />
                        <Area type="monotone" dataKey="EV_Fold FGS (Erosão)" stroke="#e11d48" strokeWidth={ 2 } fill="url(#colorFgs)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
