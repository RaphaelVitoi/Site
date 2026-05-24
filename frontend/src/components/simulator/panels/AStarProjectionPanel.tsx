'use client';

/**
 * IDENTITY: Painel de Projeção A* (Geometric Bet Sizing)
 * PATH: src/components/simulator/panels/AStarProjectionPanel.tsx
 * ROLE: Visualizar o caminho ótimo de crescimento do pote até o All-in.
 */

import { useMemo } from 'react';

interface AStarProjectionPanelProps {
	pot: number;
	stack: number;
	equity: number;
}

export default function AStarProjectionPanel({
	pot,
	stack,
	equity,
}: Readonly<AStarProjectionPanelProps>) {
	const streets = 3; // Flop, Turn, River

	const projection = useMemo(() => {
		const targetPot = pot + stack * 2;
		if (pot <= 0 || targetPot <= pot) return null;

		// f = ((targetPot/pot)^(1/n) - 1) / 2
		const growthFactor = targetPot / pot;
		const f = (Math.pow(growthFactor, 1 / streets) - 1) / 2;

		const steps = [];
		let currentPot = pot;
		let currentStack = stack;

		for (let i = 0; i < streets; i++) {
			const bet = currentPot * f;
			const streetName = i === 0 ? 'Flop' : i === 1 ? 'Turn' : 'River';

			// Simulação de Fold Equity baseada na agressão (tamanho da aposta) e equity do Hero
			// Quanto maior a aposta relativa ao pote, maior o FE inicial.
			// Quanto maior a equity do Hero (range forte), menor o FE necessário.
			const baseFE = (f * 1.5 + (1 - equity / 100) * 0.5) * 100;
			const foldEquity = Math.min(95, Math.max(10, baseFE - i * 5));

			steps.push({
				street: streetName,
				potBefore: currentPot,
				bet: bet,
				betPct: f * 100,
				potAfter: currentPot + bet * 2,
				remainingStack: currentStack - bet,
				fe: foldEquity,
			});
			currentPot += bet * 2;
			currentStack -= bet;
		}

		return { f, steps, targetPot };
	}, [pot, stack, equity]);

	if (!projection) return null;

	return (
		<div className="glass-panel p-8 rounded-4xl bg-bg-panel/60 backdrop-blur-xl border border-white/5 shadow-xl">
			<div className="flex items-center gap-4 mb-8">
				<div className="w-10 h-10 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center">
					<i className="fa-solid fa-route text-accent-indigo" />
				</div>
				<div>
					<h4 className="text-[0.7rem] font-black text-white uppercase tracking-widest m-0">
						A* Geometric Projection
					</h4>
					<p className="text-[0.55rem] text-text-darker uppercase font-bold tracking-tighter m-0">
						Caminho Ótimo para Polarização de Ranges
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{projection.steps.map((step, idx) => (
					<div
						key={step.street}
						className="relative p-6 rounded-3xl bg-black/40 border border-white/5 group hover:border-accent-indigo/30 transition-all"
					>
						<div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-bg-base border border-white/10 flex items-center justify-center text-[0.6rem] font-black text-accent-indigo">
							{idx + 1}
						</div>
						<div className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest mb-4">
							{step.street}
						</div>
						<div className="space-y-4">
							<div className="flex justify-between items-end">
								<span className="text-[0.5rem] text-text-dim uppercase font-bold">
									Aposta
								</span>
								<span className="text-[0.85rem] font-mono font-black text-white">
									{step.bet.toFixed(1)} <span className="text-[0.5rem]">bb</span>
								</span>
							</div>
							<div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
								<div
									className="h-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]"
									style={{ width: `${Math.min(100, step.betPct)}%` }}
								/>
							</div>

							{/* Fold Equity Mock Display */}
							<div className="flex justify-between items-center pt-2">
								<span className="text-[0.45rem] text-text-darker uppercase font-black">
									Req. Fold Equity
								</span>
								<span className="text-[0.6rem] font-mono font-bold text-accent-indigo-light">
									{step.fe.toFixed(1)}%
								</span>
							</div>

							<div className="flex justify-between text-[0.5rem] font-bold uppercase tracking-tighter border-t border-white/5 pt-2">
								<span className="text-accent-indigo-light">
									{step.betPct.toFixed(0)}% Pot
								</span>
								<span className="text-text-darker">
									Pot: {step.potAfter.toFixed(1)}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 p-4 bg-accent-indigo/5 border border-accent-indigo/10 rounded-2xl flex items-center justify-between">
				<div className="flex items-center gap-3">
					<i className="fa-solid fa-circle-info text-accent-indigo-light text-xs" />
					<span className="text-[0.6rem] text-indigo-100/70 font-medium">
						Projeção geométrica constante para maximizar a pressão de fold equity.
					</span>
				</div>
				<div className="text-[0.6rem] font-black text-white uppercase tracking-widest">
					f-factor: <span className="text-accent-indigo">{(projection.f * 100).toFixed(1)}%</span>
				</div>
			</div>
		</div>
	);
}
