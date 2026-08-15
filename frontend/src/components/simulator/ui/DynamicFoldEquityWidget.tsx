'use client';

/**
 * IDENTITY: SOTA Dynamic Fold Equity & Bayesian Polarization Widget (v7.0 GOLD)
 * PATH: src/components/simulator/ui/DynamicFoldEquityWidget.tsx
 * ROLE: Painel de Equidade de Descarte Dinâmica, Fold Equity Reversa de Break-Even
 *       e Curva de Elasticidade de Bet Sizing sob Pressão ICM.
 */

import {
	type DynamicFoldEquityResult,
	calculateDynamicFoldEquity,
} from '@/lib/dynamicFoldEquityEngine';
import { useMemo, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';

export interface DynamicFoldEquityWidgetProps {
	initialPot?: number;
	initialBet?: number;
	initialEquity?: number;
	initialBubbleFactor?: number;
}

export function DynamicFoldEquityWidget({
	initialPot = 20,
	initialBet = 15,
	initialEquity = 35,
	initialBubbleFactor = 1.2,
}: Readonly<DynamicFoldEquityWidgetProps>) {
	const [potSize, setPotSize] = useState(initialPot);
	const [betSize, setBetSize] = useState(initialBet);
	const [showdownEquityPct, setShowdownEquityPct] = useState(initialEquity);
	const [baseFoldProbPct, setBaseFoldProbPct] = useState(40);
	const [bubbleFactor, setBubbleFactor] = useState(initialBubbleFactor);
	const [polarizationPct, setPolarizationPct] = useState(60);

	const foldEquityResult: DynamicFoldEquityResult = useMemo(() => {
		return calculateDynamicFoldEquity({
			potSize: Math.max(1, potSize),
			betSize: Math.max(1, betSize),
			showdownEquity: Math.min(1.0, Math.max(0.0, showdownEquityPct / 100)),
			baseOpponentFoldProb: Math.min(1.0, Math.max(0.0, baseFoldProbPct / 100)),
			icmBubbleFactor: Math.max(1.0, bubbleFactor),
			polarizationIndex: Math.min(1.0, Math.max(0.0, polarizationPct / 100)),
		});
	}, [potSize, betSize, showdownEquityPct, baseFoldProbPct, bubbleFactor, polarizationPct]);

	const getVerdictBadge = (verdict: DynamicFoldEquityResult['verdict']) => {
		switch (verdict) {
			case 'PURE_VALUE':
				return {
					text: 'VALOR PURO (+EV Direto)',
					color: 'bg-emerald-950/80 text-accent-emerald border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
				};
			case 'PROFITABLE_SEMI_BLUFF':
				return {
					text: 'SEMI-BLEFE LUCRATIVO (+EV Combinado)',
					color: 'bg-cyan-950/80 text-accent-cyan border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
				};
			case 'ICM_AIR_BLUFF':
				return {
					text: 'BLEFE DE PRESSÃO ICM (+EV por Bolha)',
					color: 'bg-indigo-950/80 text-accent-indigo-light border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
				};
			case 'NEGATIVE_EV_PUNT':
			default:
				return {
					text: 'JOGADA -EV (Fold Equity Insuficiente)',
					color: 'bg-rose-950/80 text-accent-danger border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
				};
		}
	};

	const verdictBadge = getVerdictBadge(foldEquityResult.verdict);

	return (
		<div className="bg-black/50 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
				<div>
					<h4 className="text-[0.7rem] font-black text-white uppercase tracking-[0.2em] m-0">
						Equidade de Descarte Dinâmica & Elasticidade Bayesiana
					</h4>
					<p className="m-0 mt-1 text-[0.55rem] text-text-dim font-medium uppercase tracking-wider">
						Break-Even Fold Equity ($FE_{'{req}'}$) • Distorção de Sobrevivência ICM • Bet Sizing
					</p>
				</div>
				<span className={`px-3 py-1 rounded-xl border text-[0.55rem] font-mono font-bold uppercase tracking-wider ${verdictBadge.color}`}>
					{verdictBadge.text}
				</span>
			</div>

			{/* Grid de Parâmetros de Entrada */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
				<div className="flex flex-col gap-1">
					<label htmlFor="fe-pot-input" className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Pote Atual (BB)
					</label>
					<input
						id="fe-pot-input"
						type="number"
						value={potSize}
						onChange={(e) => setPotSize(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[0.75rem] font-mono font-bold text-white focus:outline-none focus:border-accent-indigo"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="fe-bet-input" className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Aposta / Shove (BB)
					</label>
					<input
						id="fe-bet-input"
						type="number"
						value={betSize}
						onChange={(e) => setBetSize(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[0.75rem] font-mono font-bold text-white focus:outline-none focus:border-accent-indigo"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="fe-eq-input" className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Showdown Eq (%)
					</label>
					<input
						id="fe-eq-input"
						type="number"
						value={showdownEquityPct}
						onChange={(e) => setShowdownEquityPct(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[0.75rem] font-mono font-bold text-accent-emerald focus:outline-none focus:border-accent-emerald"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="fe-fold-input" className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Fold Base Vilão (%)
					</label>
					<input
						id="fe-fold-input"
						type="number"
						value={baseFoldProbPct}
						onChange={(e) => setBaseFoldProbPct(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[0.75rem] font-mono font-bold text-white focus:outline-none focus:border-accent-indigo"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="fe-bf-input" className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Bubble Factor (x)
					</label>
					<input
						id="fe-bf-input"
						type="number"
						step="0.05"
						value={bubbleFactor}
						onChange={(e) => setBubbleFactor(Number.parseFloat(e.target.value) || 1.0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[0.75rem] font-mono font-bold text-accent-amber focus:outline-none focus:border-accent-amber"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="fe-pol-input" className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Polarização (%)
					</label>
					<input
						id="fe-pol-input"
						type="number"
						value={polarizationPct}
						onChange={(e) => setPolarizationPct(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-[0.75rem] font-mono font-bold text-accent-indigo-light focus:outline-none focus:border-accent-indigo"
					/>
				</div>
			</div>

			{/* Cards de Métricas Principais */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
				<div className="flex flex-col gap-0.5">
					<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Fold Equity Requerida (Req)
					</span>
					<span className="text-xl font-black font-mono text-accent-amber tabular-nums">
						<AnimatedNumber value={foldEquityResult.requiredFoldEquityPct} decimals={1} />%
					</span>
					<span className="text-[0.5rem] text-text-muted font-mono">
						Break-Even Threshold
					</span>
				</div>

				<div className="flex flex-col gap-0.5">
					<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Fold Equity Efetiva (Bayes)
					</span>
					<span className="text-xl font-black font-mono text-accent-emerald tabular-nums">
						<AnimatedNumber value={foldEquityResult.effectiveFoldProbabilityPct} decimals={1} />%
					</span>
					<span className="text-[0.5rem] text-text-muted font-mono">
						MDF Alpha: {(foldEquityResult.mdfAlpha * 100).toFixed(0)}%
					</span>
				</div>

				<div className="flex flex-col gap-0.5">
					<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Valor Esperado Líquido
					</span>
					<span
						className={`text-xl font-black font-mono tabular-nums ${
							foldEquityResult.isPositiveEv ? 'text-accent-emerald' : 'text-accent-danger'
						}`}
					>
						{foldEquityResult.netEvDelta >= 0 ? '+' : ''}
						{foldEquityResult.netEvDelta.toFixed(2)} BB
					</span>
					<span className="text-[0.5rem] text-text-muted font-mono">
						EV Shove: {foldEquityResult.evShove >= 0 ? '+' : ''}{foldEquityResult.evShove.toFixed(2)} BB
					</span>
				</div>

				<div className="flex flex-col gap-0.5">
					<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
						Pot Odds Showdown
					</span>
					<span className="text-xl font-black font-mono text-white tabular-nums">
						{foldEquityResult.potOddsShowdownPct.toFixed(1)}%
					</span>
					<span className="text-[0.5rem] text-text-muted font-mono">
						Eq Direta Necessária
					</span>
				</div>
			</div>

			{/* Curva de Elasticidade de Bet Sizing */}
			<div className="space-y-3">
				<div className="flex justify-between items-center text-[0.55rem] font-mono">
					<span className="font-bold text-text-muted uppercase tracking-wider">
						Curva de Elasticidade de Bet Sizing (% do Pote vs EV)
					</span>
					<span className="text-text-darker">Tamanhos Analíticos</span>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
					{foldEquityResult.elasticityCurve.map((point) => (
						<div
							key={point.betRatio}
							className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center font-mono transition-all ${
								point.isProfitable
									? 'bg-emerald-950/30 border-emerald-500/20 text-accent-emerald hover:border-emerald-500/40'
									: 'bg-rose-950/30 border-rose-500/20 text-accent-danger hover:border-rose-500/40'
							}`}
						>
							<span className="text-[0.55rem] font-bold text-text-light">
								{(point.betRatio * 100).toFixed(0)}% Pote
							</span>
							<span className="text-[0.5rem] text-text-muted">
								{point.betAmount} BB
							</span>
							<span className="text-[0.7rem] font-black mt-1">
								{point.expectedValue >= 0 ? '+' : ''}{point.expectedValue} BB
							</span>
							<span className="text-[0.45rem] text-text-darker mt-0.5">
								Fold: {(point.foldProbability * 100).toFixed(0)}%
							</span>
						</div>
					))}
				</div>
			</div>

			<p className="text-[0.65rem] text-text-muted leading-relaxed font-sans m-0 bg-white/5 p-3 rounded-2xl border border-white/5">
				{foldEquityResult.verdictDescription}
			</p>
		</div>
	);
}
