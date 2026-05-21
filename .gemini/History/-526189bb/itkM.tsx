'use client';

/**
 * IDENTITY: Regressão Bayesiana (Amortização de Edge & Taxa de Maluquice)
 * PATH: src/components/simulator/panels/BayesianRegressionPanel.tsx
 * ROLE: Quantificar a diluição da habilidade e o impacto do erro humano no range do oponente.
 * BINDING: [SotaContext.tsx, engine/quantumMetrics.ts]
 */

import { MetricTooltip } from '@/components/laboratorio/MetricTooltip';
import { useContext, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Label, Tooltip as RechartsTooltip, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SotaMetricsContext, SotaSpotContext } from '../SotaContext';

export default function BayesianRegressionPanel () {
    const spotContext = useContext( SotaSpotContext );
    const metricsContext = useContext( SotaMetricsContext );

    // SOTA v4.2: Consumo de métricas quânticas reais
    const edgeMultiplier = metricsContext?.apiQuantumMetrics?.amortizedEdgeMultiplier ?? 1;
    const effStack = useMemo( () => {
        const heroStack = spotContext?.spotData?.heroStack ?? 40;
        const villainStack = spotContext?.spotData?.villainStack ?? 40;
    }, [ spotContext ] );

    // Controles de Regressão Bayesiana (Incerteza do Oponente)
    const [ madnessRatePct, setMadnessRatePct ] = useState( 15 ); // Taxa de Maluquice (Axioma Lipe Piv)

    const chartData = useMemo( () => {
        const data = [];
        for ( let s = 5; s <= 100; s += 5 )
        {
            // Decaimento de Edge logarítmico calibrado
            const theoreticalEdge = Math.max( 0.15, Math.min( 1, Math.log10( s ) / 2 ) );

            // A "Taxa de Maluquice" atua como um ruído que infla a edge realizável em stacks curtos (Exploit)
            // mas aumenta a variância (incerteza bayesiana)
            const realizeableEdge = theoreticalEdge * edgeMultiplier * ( 1 + madnessRatePct / 100 );
            const uncertainty = ( 1 - theoreticalEdge ) * 0.2;

            data.push( {
                stack: s,
                "Edge Realizada": ( realizeableEdge * 100 ),
                "Incerteza": ( realizeableEdge + uncertainty ) * 100,
                "Piso": Math.max( 0, ( realizeableEdge - uncertainty ) * 100 )
            } );
        }
        return data;
    }, [ edgeMultiplier, madnessRatePct ] );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/20 flex gap-4 items-start shadow-inner">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                    <i className="fa-solid fa-brain text-pink-400"></i>
                </div>
                <div className="space-y-2">
                    <h4 className="text-[0.85rem] font-black text-pink-300 uppercase tracking-widest">Incerteza & Taxa de Maluquice</h4>
                    <p className="m-0 text-[0.75rem] leading-relaxed text-pink-200/70">
                        A Regressão Bayesiana integra a <span className="text-pink-400 font-bold">Amortização da Edge</span> com o <span className="text-emerald-400 font-bold">Axioma Lipe Piv</span>. Em stacks curtos, onde o GTO torna-se rígido, o erro humano irracional (maluquice) torna-se a sua maior fonte de lucro, transmutando decisões marginais em calls obrigatórios.
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 shadow-inner">
                <MetricTooltip title="Taxa de Maluquice (Axioma Lipe Piv)" desc="Frequência estimada de erro emocional ou blefe irracional do oponente. Em ambientes de baixa qualidade técnica, este fator domina a regressão de edge." align="left">
                    <div className="flex flex-col gap-3">
                        <label className="text-[0.75rem] font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Maluquice Estimada</span>
                            <span className="text-pink-400 font-mono font-bold">{ madnessRatePct }%</span>
                        </label>
                        <input type="range" min="0" max="50" step="1" value={ madnessRatePct } onChange={ e => setMadnessRatePct( Number( e.target.value ) ) } className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-pink-500 cursor-pointer" />
                    </div>
                </MetricTooltip>
            </div>

            <div className="w-full h-80 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <h4 className="text-[0.85rem] font-black text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></div>
                    Regressão de Habilidade vs Stack (Bayes)
                </h4>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ chartData } margin={ { top: 5, right: 20, left: -20, bottom: 5 } }>
                        <defs>
                            <linearGradient id="colorEdge" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={ 0.3 } />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={ 0 } />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={ false } />
                        <XAxis dataKey="stack" stroke="#475569" fontSize={ 10 } tickLine={ false } axisLine={ false } />
                        <YAxis stroke="#475569" fontSize={ 10 } tickLine={ false } axisLine={ false } />
                        <RechartsTooltip
                            contentStyle={ { backgroundColor: '#0f172a', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '8px', fontSize: '11px' } }
                        />

                        <ReferenceLine x={ effStack } stroke="#ec4899" strokeWidth={ 2 } strokeDasharray="5 5">
                            <Label value="SPOT ATUAL" position="top" fill="#ec4899" fontSize={ 9 } fontWeight={ 900 } />
                        </ReferenceLine>

                        <Area type="monotone" dataKey="Edge Realizada" stroke="#ec4899" strokeWidth={ 3 } fill="url(#colorEdge)" />
                        <Area type="monotone" dataKey="Incerteza" stroke="#475569" strokeWidth={ 1 } fill="transparent" strokeDasharray="3 3" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Inércia GTO</span>
                    <span className="text-lg font-black text-white font-mono">{ ( ( 1 - madnessRatePct / 100 ) * 100 ).toFixed( 0 ) }%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Exploit Real</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">{ ( edgeMultiplier * 100 ).toFixed( 1 ) }%</span>
                </div>
            </div>
        </div>
    );
}
