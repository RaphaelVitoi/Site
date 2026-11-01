'use client';

/**
 * IDENTITY: SOTA Dynamic Fold Equity & Bayesian Polarization Widget (v8.0 GOLD)
 * PATH: src/components/simulator/ui/DynamicFoldEquityWidget.tsx
 * ROLE: Painel de Equidade de Descarte Dinâmica, Fold Equity Reversa de Break-Even,
 *       Gráfico Interativo de EV vs Fold Frequency com Curva de Elasticidade e Formulação Teórica.
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
	const [showMathFormula, setShowMathFormula] = useState(false);

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

	// Quick Spot Presets
	const applyPreset = (preset: 'value' | 'semi_bluff' | 'icm_pressure' | 'hero_shove') => {
		switch (preset) {
			case 'value':
				setPotSize(25);
				setBetSize(18);
				setShowdownEquityPct(68);
				setBaseFoldProbPct(35);
				setBubbleFactor(1.15);
				setPolarizationPct(40);
				break;
			case 'semi_bluff':
				setPotSize(20);
				setBetSize(14);
				setShowdownEquityPct(32);
				setBaseFoldProbPct(45);
				setBubbleFactor(1.25);
				setPolarizationPct(70);
				break;
			case 'icm_pressure':
				setPotSize(16);
				setBetSize(32);
				setShowdownEquityPct(15);
				setBaseFoldProbPct(65);
				setBubbleFactor(1.95);
				setPolarizationPct(85);
				break;
			case 'hero_shove':
				setPotSize(12);
				setBetSize(24);
				setShowdownEquityPct(48);
				setBaseFoldProbPct(50);
				setBubbleFactor(1.4);
				setPolarizationPct(60);
				break;
		}
	};

	// SVG Curve Generation: EV vs Fold Probability (0% to 100%)
	const svgGraphData = useMemo(() => {
		const points: { f: number; ev: number }[] = [];
		const pot = Math.max(1, potSize);
		const bet = Math.max(1, betSize);
		const eq = Math.min(1.0, Math.max(0.0, showdownEquityPct / 100));
		const bf = Math.max(1.0, bubbleFactor);

		// EV when called with ICM penalty:
		const evWhenCalled = eq * (pot + bet) - (1 - eq) * bet * bf;

		for (let f = 0; f <= 100; f += 2) {
			const foldProb = f / 100;
			const ev = foldProb * pot + (1 - foldProb) * evWhenCalled;
			points.push({ f, ev });
		}

		const evValues = points.map((p) => p.ev);
		const minEv = Math.min(-bet * bf, Math.min(...evValues));
		const maxEv = Math.max(pot, Math.max(...evValues));
		const span = Math.max(1, maxEv - minEv);

		const toSvgY = (ev: number) => {
			return 130 - ((ev - minEv) / span) * 110;
		};

		const toSvgX = (f: number) => {
			return 25 + (f / 100) * 350;
		};

		const pathD = points
			.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.f).toFixed(1)},${toSvgY(p.ev).toFixed(1)}`)
			.join(' ');

		const yZero = toSvgY(0);
		const currentF = foldEquityResult.effectiveFoldProbabilityPct;
		const currentEv = foldEquityResult.netEvDelta;
		const reqF = foldEquityResult.requiredFoldEquityPct;

		return {
			pathD,
			yZero: Math.max(15, Math.min(135, yZero)),
			currentPt: { x: toSvgX(currentF), y: toSvgY(currentEv) },
			reqPt: { x: toSvgX(reqF), y: toSvgY(0) },
			minEv,
			maxEv,
		};
	}, [potSize, betSize, showdownEquityPct, bubbleFactor, foldEquityResult]);

	return (
		<div className="bg-black/60 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-all duration-300">
			{/* HEADER */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-amber animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
						<h4 className="text-sm sm:text-base font-black text-white uppercase tracking-[0.15em] m-0">
							Equidade de Descarte Dinâmica & Elasticidade Bayesiana
						</h4>
					</div>
					<p className="m-0 mt-1 text-xs text-text-dim font-medium uppercase tracking-wider">
						{"Break-Even Fold Equity ($FE_{req}$) • Distorção de Sobrevivência ICM • Bet Sizing"}
					</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<button
						type="button"
						onClick={() => setShowMathFormula((prev) => !prev)}
						className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-text-dim hover:text-white uppercase transition-all"
					>
						<i className="fa-solid fa-square-root-variable mr-1.5 text-accent-indigo" />
						{showMathFormula ? 'Ocultar Teorema' : 'Teorema Formal'}
					</button>
					<span className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider ${verdictBadge.color}`}>
						{verdictBadge.text}
					</span>
				</div>
			</div>

			{/* PRESETS RÁPIDOS DE SPOT */}
			<div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
				<span className="text-[0.65rem] font-mono font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
					Presets de Spot:
				</span>
				<button
					type="button"
					onClick={() => applyPreset('value')}
					className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[0.65rem] font-mono font-bold text-text-main whitespace-nowrap transition-all"
				>
					Valor Puro (C-Bet)
				</button>
				<button
					type="button"
					onClick={() => applyPreset('semi_bluff')}
					className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[0.65rem] font-mono font-bold text-accent-cyan whitespace-nowrap transition-all"
				>
					Semi-Blefe Turn (Draw)
				</button>
				<button
					type="button"
					onClick={() => applyPreset('icm_pressure')}
					className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[0.65rem] font-mono font-bold text-accent-indigo-light whitespace-nowrap transition-all"
				>
					Pressão de Bolha (ICM Jam)
				</button>
				<button
					type="button"
					onClick={() => applyPreset('hero_shove')}
					className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[0.65rem] font-mono font-bold text-accent-amber whitespace-nowrap transition-all"
				>
					Push/Fold Neutro
				</button>
			</div>

			{/* FÓRMULA MATEMÁTICA FORMAL EXPANDÍVEL */}
			{showMathFormula && (
				<div className="p-4 rounded-2xl bg-slate-950/90 border border-accent-indigo/30 shadow-inner flex flex-col gap-2 animate-sota-in">
					<div className="flex items-center gap-2 text-accent-indigo-light font-mono text-xs font-bold uppercase">
						<i className="fa-solid fa-atom" />
						<span>Equação Canônica do Valor Esperado com Distorção ICM</span>
					</div>
					<div className="font-mono text-xs text-text-bright bg-black/60 p-3 rounded-xl border border-white/5 overflow-x-auto">
						{String.raw`$$EV(f) = f \cdot \text{Pote} + (1 - f) \cdot \Big[ \text{Eq} \cdot (\text{Pote} + \text{Aposta}) - (1 - \text{Eq}) \cdot \text{Aposta} \cdot \lambda_{\text{ICM}} \Big]$$`}
					</div>
					<p className="text-[0.65rem] text-text-dim leading-relaxed m-0 font-medium">
						{"Onde "}
						<strong className="text-white">{String.raw`$\lambda_{\text{ICM}}$`}</strong>
						{String.raw` é o Bubble Factor da colisão. Quando $\lambda > 1.0$, o custo de perder fichas suplanta o valor de ganhá-las, exigindo maior Fold Equity ($FE_{\text{req}}$) para que a jogada atinja equilíbrio de Nash neutro ($EV \ge 0$).`}
					</p>
				</div>
			)}

			{/* Grid de Parâmetros de Entrada */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="fe-pot-input" className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Pote Atual (BB)
					</label>
					<input
						id="fe-pot-input"
						type="number"
						value={potSize}
						onChange={(e) => setPotSize(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-accent-amber"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="fe-bet-input" className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Aposta / Shove (BB)
					</label>
					<input
						id="fe-bet-input"
						type="number"
						value={betSize}
						onChange={(e) => setBetSize(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-accent-amber"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="fe-eq-input" className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Showdown Eq (%)
					</label>
					<input
						id="fe-eq-input"
						type="number"
						value={showdownEquityPct}
						onChange={(e) => setShowdownEquityPct(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-accent-emerald focus:outline-none focus:border-accent-emerald"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="fe-fold-input" className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Fold Base Vilão (%)
					</label>
					<input
						id="fe-fold-input"
						type="number"
						value={baseFoldProbPct}
						onChange={(e) => setBaseFoldProbPct(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-accent-amber"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="fe-bf-input" className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Bubble Factor (x)
					</label>
					<input
						id="fe-bf-input"
						type="number"
						step="0.05"
						value={bubbleFactor}
						onChange={(e) => setBubbleFactor(Number.parseFloat(e.target.value) || 1.0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-accent-amber focus:outline-none focus:border-accent-amber"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="fe-pol-input" className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Polarização (%)
					</label>
					<input
						id="fe-pol-input"
						type="number"
						value={polarizationPct}
						onChange={(e) => setPolarizationPct(Number.parseFloat(e.target.value) || 0)}
						className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-accent-indigo-light focus:outline-none focus:border-accent-indigo"
					/>
				</div>
			</div>

			{/* Cards de Métricas Principais */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
				<div className="flex flex-col gap-1">
					<span className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Fold Equity Requerida (Req)
					</span>
					<span className="text-2xl font-black font-mono text-accent-amber tabular-nums">
						<AnimatedNumber value={foldEquityResult.requiredFoldEquityPct} decimals={1} />%
					</span>
					<span className="text-xs text-text-dim font-mono">
						Break-Even Threshold
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<span className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Fold Equity Efetiva (Bayes)
					</span>
					<span className="text-2xl font-black font-mono text-accent-emerald tabular-nums">
						<AnimatedNumber value={foldEquityResult.effectiveFoldProbabilityPct} decimals={1} />%
					</span>
					<span className="text-xs text-text-dim font-mono">
						MDF Alpha: {(foldEquityResult.mdfAlpha * 100).toFixed(0)}%
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<span className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Valor Esperado Líquido
					</span>
					<span
						className={`text-2xl font-black font-mono tabular-nums ${
							foldEquityResult.isPositiveEv ? 'text-accent-emerald' : 'text-accent-danger'
						}`}
					>
						{foldEquityResult.netEvDelta >= 0 ? '+' : ''}
						{foldEquityResult.netEvDelta.toFixed(2)} BB
					</span>
					<span className="text-xs text-text-dim font-mono">
						EV Shove: {foldEquityResult.evShove >= 0 ? '+' : ''}{foldEquityResult.evShove.toFixed(2)} BB
					</span>
				</div>

				<div className="flex flex-col gap-1">
					<span className="text-xs font-bold text-text-muted uppercase tracking-wider">
						Pot Odds Showdown
					</span>
					<span className="text-2xl font-black font-mono text-white tabular-nums">
						{foldEquityResult.potOddsShowdownPct.toFixed(1)}%
					</span>
					<span className="text-xs text-text-dim font-mono">
						Eq Direta Necessária
					</span>
				</div>
			</div>

			{/* GRÁFICO VETORIAL INTERATIVO DE EV VS FOLD FREQUENCY (ADITIVO SOTA) */}
			<div className="relative rounded-2xl bg-black/50 border border-white/5 p-4 sm:p-5 flex flex-col gap-3">
				<div className="flex items-center justify-between text-xs font-mono">
					<div className="flex items-center gap-2">
						<i className="fa-solid fa-chart-line text-accent-indigo" />
						<span className="font-bold text-white uppercase tracking-wider">
							Curva Dinâmica de Rentabilidade ($EV$ vs Probabilidade de Fold)
						</span>
					</div>
					<div className="flex items-center gap-3 text-[0.65rem] text-text-dim">
						<span className="flex items-center gap-1.5">
							<span className="w-2.5 h-0.5 bg-accent-amber" />
							<span>FE Requerida: {foldEquityResult.requiredFoldEquityPct.toFixed(1)}%</span>
						</span>
						<span className="flex items-center gap-1.5">
							<span className="w-2 h-2 rounded-full bg-emerald-400" />
							<span>Spot Efetivo ({foldEquityResult.effectiveFoldProbabilityPct.toFixed(1)}%)</span>
						</span>
					</div>
				</div>

				<div className="relative w-full h-36 bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden p-2">
					<svg
						viewBox="0 0 400 150"
						className="w-full h-full block"
						aria-label="Gráfico de EV vs Frequência de Fold"
						role="img"
					>
						<defs>
							<linearGradient id="feAreaGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
								<stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
							</linearGradient>
						</defs>

						{/* Linhas de Grade Verticais (0%, 25%, 50%, 75%, 100%) */}
						{[0, 25, 50, 75, 100].map((pct) => {
							const x = 25 + (pct / 100) * 350;
							return (
								<g key={`grid-f-${pct}`}>
									<line x1={x} y1="15" x2={x} y2="135" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
									<text x={x} y="145" fill="#64748b" fontSize="7" fontFamily="var(--font-mono)" textAnchor="middle">
										{pct}%
									</text>
								</g>
							);
						})}

						{/* Eixo Zero EV (Break-even neutro) */}
						<line
							x1="25"
							y1={svgGraphData.yZero}
							x2="375"
							y2={svgGraphData.yZero}
							stroke="#64748b"
							strokeWidth="1"
							strokeDasharray="4 4"
						/>
						<text x="380" y={svgGraphData.yZero + 3} fill="#64748b" fontSize="6.5" fontFamily="var(--font-mono)">
							0 EV
						</text>

						{/* Linha Vertical da Fold Equity Requerida */}
						<line
							x1={svgGraphData.reqPt.x}
							y1="15"
							x2={svgGraphData.reqPt.x}
							y2="135"
							stroke="#f59e0b"
							strokeWidth="1.2"
							strokeDasharray="3 3"
						/>

						{/* Curva de EV */}
						<path
							d={svgGraphData.pathD}
							fill="none"
							stroke={foldEquityResult.isPositiveEv ? '#10b981' : '#f43f5e'}
							strokeWidth="2.5"
						/>

						{/* Ponto Atual Efetivo com Pulso */}
						<circle
							cx={svgGraphData.currentPt.x}
							cy={svgGraphData.currentPt.y}
							r="5"
							fill={foldEquityResult.isPositiveEv ? '#10b981' : '#f43f5e'}
							className="animate-pulse"
						/>
						<circle
							cx={svgGraphData.currentPt.x}
							cy={svgGraphData.currentPt.y}
							r="2.5"
							fill="#ffffff"
						/>
					</svg>
				</div>
			</div>

			{/* Curva de Elasticidade de Bet Sizing */}
			<div className="space-y-3">
				<div className="flex justify-between items-center text-xs font-mono">
					<span className="font-bold text-text-muted uppercase tracking-wider">
						Curva de Elasticidade de Bet Sizing (% do Pote vs EV)
					</span>
					<span className="text-text-darker">Tamanhos Analíticos</span>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
					{foldEquityResult.elasticityCurve.map((point) => (
						<button
							key={point.betRatio}
							type="button"
							onClick={() => setBetSize(point.betAmount)}
							className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center font-mono transition-all cursor-pointer ${
								point.isProfitable
									? 'bg-emerald-950/30 border-emerald-500/20 text-accent-emerald hover:border-emerald-500/40 hover:bg-emerald-950/50'
									: 'bg-rose-950/30 border-rose-500/20 text-accent-danger hover:border-rose-500/40 hover:bg-rose-950/50'
							}`}
							title={`Aplicar aposta de ${point.betAmount} BB`}
						>
							<span className="text-xs font-bold text-text-main">
								{(point.betRatio * 100).toFixed(0)}% Pote
							</span>
							<span className="text-xs text-text-muted mt-0.5">
								{point.betAmount} BB
							</span>
							<span className="text-sm font-black mt-1">
								{point.expectedValue >= 0 ? '+' : ''}{point.expectedValue} BB
							</span>
							<span className="text-[0.65rem] text-text-darker mt-0.5">
								Fold: {(point.foldProbability * 100).toFixed(0)}%
							</span>
						</button>
					))}
				</div>
			</div>

			<p className="text-xs text-text-muted leading-relaxed font-sans m-0 bg-white/5 p-4 rounded-2xl border border-white/5">
				{foldEquityResult.verdictDescription}
			</p>
		</div>
	);
}
