'use client';

/**
 * IDENTITY: Simulador de Risco da RessurreiÃ§Ã£o SOTA Quantum
 * PATH: src/components/simulator/ResurrectionRiskSimulator.tsx
 * ROLE: Analisar o custo estratÃ©gico de dar call em short stacks na bolha.
 * PRINCIPLE: AntevisÃ£o & FricÃ§Ã£o Zero.
 */

import { useState, useMemo, use } from 'react';
import { calculateMapaICM, calculateAmortizedEdge } from '../../lib/perspectiva';
import { useSotaSync } from './hooks/useSotaSync';
import { SotaMetricsContext } from './SotaContext';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
	Label,
} from 'recharts';

// VITOI: Real ICM valuation via Malmuth-Harville engine
const getIcmEquity = (
	myStack: number,
	otherStack1: number,
	otherStack2: number,
	prizes: number[],
): number => {
	const stacks = [Math.max(0, myStack), Math.max(0, otherStack1), Math.max(0, otherStack2)];
	const mapa = calculateMapaICM(stacks, prizes);
	const totalPrizes = prizes.reduce((a, b) => a + b, 0);
	return totalPrizes > 0 ? (mapa.equities[0] ?? 0) / totalPrizes : 0;
};

export default function ResurrectionRiskSimulator() {
	const { physics, updatePhysics, isHydrated } = useSotaSync();
	const metricsContext = use(SotaMetricsContext);
	const [equity, setEquity] = useState(58);
	const [applyBubbleAxiom, setApplyBubbleAxiom] = useState(true);

	// SOTA v4.5: ExtraÃ§Ã£o de Entropia (Fator Î¨)
	const psiFactor = metricsContext?.predictiveProfile?.['Desvio de Nash'] ?? 0.45;

	const COLORS = {
		call: 'var(--accent-emerald)',
		fold: 'var(--accent-danger)',
		grid: 'rgba(255,255,255,0.02)',
		text: 'var(--text-muted)',
	};

	const results = useMemo(() => {
		if (!isHydrated) return null;

		const bb = 1;
		const prizes = [0.5, 0.3, 0.2];
		const clStack = physics.heroStack;
		const ssStack = physics.villain1Stack ?? 30;
		const msStack = physics.villain2Stack ?? 30;
		const edgeFactor = physics.edgeFactor ?? 1.2;

		const costToCall = ssStack - bb;
		const potToWin = ssStack + bb;

		// Future State Stacks
		const clStackWin = clStack + ssStack;
		const clStackLoss = Math.max(0.1, clStack - ssStack);
		const ssStackWin = ssStack * 2;

		// SOTA VITOI: Amortized Edge Unificado (v4.5)
		// A penalidade psicolÃ³gica agora Ã© proporcional Ã  Entropia (Psi) detectada
		const psychologicalPenalty = applyBubbleAxiom ? Math.max(0.6, 1 - psiFactor * 0.5) : 1;

		const { amortizedEdge: clEdgeWin } = calculateAmortizedEdge(
			edgeFactor,
			clStackWin,
			msStack,
		);
		const { amortizedEdge: clEdgeLossRaw } = calculateAmortizedEdge(
			edgeFactor,
			clStackLoss,
			ssStackWin,
		);
		const clEdgeLoss = clEdgeLossRaw * psychologicalPenalty;
		const { amortizedEdge: clEdgeFold } = calculateAmortizedEdge(
			edgeFactor,
			clStack - bb,
			msStack,
		);

		const futureEvWinVal = getIcmEquity(clStackWin, msStack, 0, prizes) * clEdgeWin;
		const futureEvLossVal = getIcmEquity(clStackLoss, ssStackWin, msStack, prizes) * clEdgeLoss;

		const msEliminatesSsProb = 0.35;
		const foldEvIfMsWins = getIcmEquity(clStack - bb, 0, msStack + ssStack + bb, prizes);
		const foldEvIfMsFolds = getIcmEquity(
			clStack - bb,
			ssStack + 1.5 * bb,
			msStack - 0.5 * bb,
			prizes,
		);

		const foldFutureEv =
			(msEliminatesSsProb * foldEvIfMsWins + (1 - msEliminatesSsProb) * foldEvIfMsFolds) *
			clEdgeFold;
		const netFutureEv =
			(equity / 100) * futureEvWinVal + ((100 - equity) / 100) * futureEvLossVal;

		// Chart Data
		const chartData = [];
		let breakEvenEquity: number | null = null;

		for (let i = 40; i <= 80; i++) {
			const currentNetEv = (i / 100) * futureEvWinVal + ((100 - i) / 100) * futureEvLossVal;
			if (breakEvenEquity === null && currentNetEv > foldFutureEv) {
				breakEvenEquity = i;
			}
			chartData.push({
				equity: i,
				callEv: Number(currentNetEv.toFixed(4)),
				foldEv: Number(foldFutureEv.toFixed(4)),
			});
		}

		return {
			netFutureEv,
			foldFutureEv,
			decision: netFutureEv > foldFutureEv,
			chartData,
			breakEvenEquity,
			costToCall,
			potToWin,
			clStackWin,
			clStackLoss,
			ssStackWin,
		};
	}, [physics, equity, isHydrated, applyBubbleAxiom, psiFactor]);

	if (!isHydrated || !results) return null;

	return (
		<div className="glass-panel p-8 space-y-10 animate-sota-in border-accent-indigo/10 max-w-6xl mx-auto">
			<div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
				<div className="space-y-2">
					<h2 className="text-2xl font-black text-text-bright tracking-tighter uppercase">
						Risco da RessurreiÃ§Ã£o
					</h2>
					<p className="text-xs text-text-muted leading-relaxed max-w-2xl font-medium">
						O call marginal Ã© um colapso em{' '}
						<span className="text-accent-indigo font-bold">EV Futuro</span>. Ressuscitar
						um oponente destrÃ³i a <strong className="text-white">Fear Equity</strong>{' '}
						da mesa. Sob o Axioma PsicolÃ³gico, a sua Edge Relativa despenca se vocÃª
						sangrar o status de predador absoluto.
					</p>
				</div>
				<div
					className={`px-8 py-4 rounded-3xl border flex flex-col items-center shadow-2xl transition-colors duration-500 ${results.decision ? 'bg-accent-emerald/10 border-accent-emerald/30' : 'bg-accent-danger/10 border-accent-danger/30'}`}
				>
					<span className="text-[0.6rem] font-black uppercase tracking-widest opacity-60 mb-1">
						Veredito do Axioma
					</span>
					<span
						className={`text-xl font-black uppercase ${results.decision ? 'text-accent-emerald' : 'text-accent-danger'}`}
					>
						{results.decision ? 'CALL' : 'FOLD'}
					</span>
				</div>
			</div>

			{/* CONTROLES SIMÃ‰TRICOS */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-3xl border border-white/5">
					<div className="space-y-4">
						<div className="space-y-1">
							<div className="flex justify-between text-label opacity-50">
								<span>Chip Leader (CL)</span>
								<span>{physics.heroStack}bb</span>
							</div>
							<input
								title="Chip Leader Stack"
								aria-label="Chip Leader Stack"
								type="range"
								min="50"
								max="200"
								value={physics.heroStack}
								onChange={(e) =>
									updatePhysics({ heroStack: Number(e.target.value) })
								}
								className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-indigo cursor-pointer"
							/>
						</div>
						<div className="space-y-1">
							<div className="flex justify-between text-label opacity-50">
								<span>Short Stack (SS)</span>
								<span>{physics.villain1Stack}bb</span>
							</div>
							<input
								title="Short Stack"
								aria-label="Short Stack"
								type="range"
								min="5"
								max="30"
								value={physics.villain1Stack}
								onChange={(e) =>
									updatePhysics({ villain1Stack: Number(e.target.value) })
								}
								className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-danger cursor-pointer"
							/>
						</div>
					</div>
					<div className="space-y-4">
						<div className="space-y-1">
							<div className="flex justify-between text-label opacity-50">
								<span>Equidade vs Range</span>
								<span>{equity}%</span>
							</div>
							<input
								title="Equidade vs Range"
								aria-label="Equidade vs Range"
								type="range"
								min="40"
								max="80"
								value={equity}
								onChange={(e) => setEquity(Number(e.target.value))}
								className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-emerald cursor-pointer"
							/>
						</div>
						<div className="space-y-1">
							<div className="flex justify-between text-label opacity-50">
								<span>Edge Factor</span>
								<span>{(physics.edgeFactor ?? 1.2).toFixed(2)}x</span>
							</div>
							<input
								title="Edge Factor"
								aria-label="Edge Factor"
								type="range"
								min="0.9"
								max="1.5"
								step="0.05"
								value={physics.edgeFactor ?? 1.2}
								onChange={(e) =>
									updatePhysics({ edgeFactor: Number(e.target.value) })
								}
								className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-amber cursor-pointer"
							/>
						</div>

						<button
							onClick={() => setApplyBubbleAxiom(!applyBubbleAxiom)}
							className={`flex items-center justify-between w-full mt-2 p-3 rounded-xl border transition-all duration-300 ${applyBubbleAxiom ? 'bg-accent-indigo/10 border-accent-indigo/30' : 'bg-black/40 border-white/5'}`}
						>
							<div className="flex flex-col items-start">
								<span
									className={`text-[0.65rem] font-black uppercase tracking-widest ${applyBubbleAxiom ? 'text-accent-indigo-light' : 'text-text-muted'}`}
								>
									Axioma PsicolÃ³gico
								</span>
								<span className="text-[0.55rem] font-bold text-text-darker uppercase tracking-widest mt-0.5">
									Penalidade de RIO (20%)
								</span>
							</div>
							<div
								className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${applyBubbleAxiom ? 'bg-accent-indigo' : 'bg-white/10'}`}
							>
								<div
									className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${applyBubbleAxiom ? 'translate-x-4' : 'translate-x-0'}`}
								/>
							</div>
						</button>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="bg-bg-deep border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
						<span className="text-[0.55rem] text-text-darker font-black uppercase tracking-widest mb-1">
							Break-Even SOTA
						</span>
						<span className="text-3xl font-black text-accent-amber font-heading">
							{results.breakEvenEquity?.toFixed(1)}%
						</span>
						<p className="text-[0.5rem] text-text-muted mt-2 uppercase">
							Equidade necessÃ¡ria para call
						</p>
					</div>
				</div>
			</div>

			{/* GRÃFICO DE INFLEXÃƒO */}
			<div className="pt-8">
				<h3 className="text-label text-center mb-8 opacity-40">
					Ponto de InflexÃ£o da Perspectiva
				</h3>
				<div className="relative h-80 w-full min-h-80">
					<ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
						<LineChart data={results.chartData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke={COLORS.grid}
								vertical={false}
							/>
							<XAxis
								dataKey="equity"
								unit="%"
								tick={{ fontSize: 10, fill: COLORS.text }}
								axisLine={false}
							/>
							<YAxis domain={['auto', 'auto']} hide />
							<RechartsTooltip
								contentStyle={{
									backgroundColor: 'var(--bg-panel)',
									border: '1px solid rgba(255,255,255,0.05)',
									borderRadius: '12px',
								}}
							/>
							<Legend
								verticalAlign="top"
								height={36}
								wrapperStyle={{
									fontSize: '10px',
									fontWeight: 800,
									textTransform: 'uppercase',
								}}
							/>
							{results.breakEvenEquity !== null && (
								<ReferenceLine
									x={results.breakEvenEquity}
									stroke="var(--accent-amber)"
									strokeDasharray="4 4"
								>
									<Label
										value="THRESHOLD"
										position="insideTop"
										fill="var(--accent-amber)"
										fontSize={9}
										fontWeight={900}
									/>
								</ReferenceLine>
							)}
							<Line
								type="monotone"
								name="EV Call (Quantum)"
								dataKey="callEv"
								stroke={COLORS.call}
								strokeWidth={3}
								dot={false}
								activeDot={{ r: 6 }}
								isAnimationActive={false}
							/>
							<Line
								type="monotone"
								name="EV Fold (Baseline)"
								dataKey="foldEv"
								stroke={COLORS.fold}
								strokeWidth={2}
								strokeDasharray="5 5"
								dot={false}
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
