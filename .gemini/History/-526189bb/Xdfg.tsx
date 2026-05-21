'use client';

/**
 * IDENTITY: Painel de Regressão Bayesiana (Axioma Lipe Piv)
 * PATH: src/components/simulator/panels/BayesianRegressionPanel.tsx
 * ROLE: Visualizar como a "Taxa de Maluquice" (Entropia Humana) absorve o déficit matemático do GTO.
 * BINDING: [SotaContext.tsx]
 */

import { MetricTooltip } from '@/components/laboratorio/MetricTooltip';
import { useContext, useMemo, useState } from 'react';
import { SotaSpotContext } from '../SotaContext';

export default function BayesianRegressionPanel () {
    const spotContext = useContext( SotaSpotContext );

    // Fallbacks SOTA
    const basePot = spotContext?.spotData?.pot ?? 10;
    const callCost = spotContext?.heroInvested ?? 5;

    const [ representedValuePct, setRepresentedValuePct ] = useState( 10 ); // Mãos de valor representadas (%)
    const [ madnessRatePct, setMadnessRatePct ] = useState( 25 ); // Frequência de erro emocional/tilt (%)

    const derivedMetrics = useMemo( () => {
        const totalRange = representedValuePct + madnessRatePct;
        const realEquity = totalRange > 0 ? ( madnessRatePct / totalRange ) * 100 : 0;
        const potOdds = ( callCost / ( basePot + callCost ) ) * 100;

        const isSolvent = realEquity >= potOdds;

        return { realEquity, potOdds, isSolvent, totalRange };
    }, [ representedValuePct, madnessRatePct, basePot, callCost ] );

    return (
        <div className="space-y-6">
            <div className="mb-2 p-4 rounded-lg bg-pink-950/20 border border-pink-500/20 flex gap-4 items-start shadow-inner">
                <i className="fa-solid fa-brain text-pink-400 mt-1"></i>
                <p className="m-0 text-xs leading-relaxed text-pink-200/80">
                    <strong className="text-pink-300">Axioma Lipe Piv (Regressão Bayesiana):</strong> A matemática pura (GTO) assume que oponente não comete erros catastróficos. A Perspectiva Matemática reconhece a <span className="text-pink-400 font-bold">Taxa de Maluquice</span>. Se a probabilidade do oponente ter os <em>nuts</em> é de 4%, mas a taxa populacional de <em>tilt</em> ou <em>blefe irracional</em> nesse spot é de 10%, a sua equidade real contra o range de shove dispara, transmutando um fold teórico em um call obrigatório.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/40 border border-white/5 rounded-xl p-5 shadow-inner">
                <MetricTooltip title="Valor Representado (GTO)" desc="A porcentagem do range do oponente composta por mãos de valor real (Nuts). Quanto menor este número, mais suscetível o range é à entropia emocional." align="left">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Combos de Valor</span>
                            <span className="text-indigo-400 font-mono font-bold">{ representedValuePct }%</span>
                        </label>
                        <input type="range" min="1" max="30" step="1" value={ representedValuePct } onChange={ e => setRepresentedValuePct( Number( e.target.value ) ) } className="w-full accent-indigo-500 cursor-pointer" />
                    </div>
                </MetricTooltip>

                <MetricTooltip title="Taxa de Maluquice (Entropia Humana)" desc="A frequência estimada de que o vilão sairá da linha teórica e fará uma jogada sem sentido (Tilt, Overplay, Blefe Irracional)." align="right">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex justify-between">
                            <span>Taxa de Maluquice (f_b)</span>
                            <span className="text-pink-400 font-mono font-bold">{ madnessRatePct }%</span>
                        </label>
                        <input type="range" min="0" max="50" step="1" value={ madnessRatePct } onChange={ e => setMadnessRatePct( Number( e.target.value ) ) } className="w-full accent-pink-500 cursor-pointer" />
                    </div>
                </MetricTooltip>
            </div>

            <div className="p-6 rounded-xl border border-white/5 bg-slate-900/80 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <i className="fa-solid fa-scale-balanced text-9xl"></i>
                </div>

                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Diagnóstico de Resolução Bayesiana</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Pot Odds (Custo)</span>
                        <span className="text-3xl font-black text-slate-300 font-mono">{ derivedMetrics.potOdds.toFixed( 1 ) }%</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-lg border border-white/5 relative">
                        <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-2">Equidade Real (Bayes)</span>
                        <span className={ `text-3xl font-black font-mono ${derivedMetrics.isSolvent ? 'text-emerald-400' : 'text-rose-400'}` }>
                            { derivedMetrics.realEquity.toFixed( 1 ) }%
                        </span>
                    </div>

                    <div className="flex flex-col justify-center gap-2 z-10">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Decisão (Perspectiva)</div>
                        { derivedMetrics.isSolvent ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[11px] leading-relaxed font-bold flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <i className="fa-solid fa-check-circle text-xl"></i>
                                Call Obrigatório: A entropia humana supera o déficit das Pot Odds.
                            </div>
                        ) : (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-[11px] leading-relaxed font-bold flex items-center gap-3 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                <i className="fa-solid fa-xmark-circle text-xl"></i>
                                Fold Matemático: A taxa de maluquice é insuficiente para cobrir o custo.
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}
