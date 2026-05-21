'use client';

/**
 * IDENTITY: Painel de Crença Bayesiana (Recursive Range Reading)
 * PATH: src/components/simulator/panels/BayesianBeliefPanel.tsx
 * ROLE: Visualizar a densidade de probabilidade (Belief) do range do oponente.
 * PRINCIPLE: O range não é binário; é uma distribuição de probabilidade.
 */

import React from 'react';
import { useBayesianRange } from '../hooks/useBayesianRange';
import { getBeliefIntensity } from '@/lib/bayesianRangeEngine';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

interface BayesianBeliefPanelProps {
	initialRange?: string;
	label?: string;
}

export default function BayesianBeliefPanel({
	label: _label = 'BTN RFI',
}: Readonly<BayesianBeliefPanelProps>) {
	const { currentBelief, maxBelief, applyAction, undoAction, resetBelief, history } =
		useBayesianRange();

	const heatmapColors = (intensity: number) => {
		if (intensity === 0) return 'bg-slate-900/40 text-text-darker border-white/5';

		// SOTA: Escala de calor (Azul -> Verde -> Amarelo -> Vermelho)
		// Aqui usaremos Indigo -> Emerald para simplificar a estética SOTA
		if (intensity > 80)
			return 'bg-accent-emerald text-slate-900 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
		if (intensity > 50) return 'bg-accent-emerald/60 text-white border-emerald-500/50';
		if (intensity > 20) return 'bg-accent-indigo/40 text-text-bright border-indigo-500/30';
		return 'bg-accent-indigo/10 text-text-dim border-white/10';
	};

	// Mocks de Ações para pesquisa
	const mockActions = [
		{ name: 'Flop Cbet (Small)', likelihood: 'polarized' },
		{ name: 'Check-Raise', likelihood: 'aggressive' },
		{ name: 'Call to Cbet', likelihood: 'condensed' },
	];

	const handleApplyMock = (type: string) => {
		const likelihoods: Record<string, number> = {};
		// Mocking likelihoods for demonstration
		for (const hand in currentBelief) {
			const isPair = hand.length === 2;
			const isBroadcard = hand.includes('A') || hand.includes('K') || hand.includes('Q');

			if (type === 'polarized') {
				likelihoods[hand] = isPair || isBroadcard ? 0.8 : 0.2;
			} else if (type === 'condensed') {
				likelihoods[hand] = !isPair && isBroadcard ? 0.9 : 0.1;
			} else {
				likelihoods[hand] = Math.random();
			}
		}
		applyAction(likelihoods);
	};

	return (
		<div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

			<div className="flex justify-between items-center flex-wrap gap-8 pb-8 border-b border-white/5">
				<div>
					<h4 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0 flex items-center gap-3">
						<div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)] animate-pulse" />
						Recursive Range Belief
					</h4>
					<p className="m-0 mt-2 text-[0.65rem] text-text-dim font-medium uppercase tracking-wider">
						Mente Preditiva &middot; {_label} &middot; Street {history.length + 1}
					</p>
				</div>

				<div className="flex gap-4">
					{history.length > 0 && (
						<button
							onClick={undoAction}
							className="btn-secondary px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
						>
							<i className="fa-solid fa-rotate-left mr-2" /> Desfazer
						</button>
					)}
					<button
						onClick={resetBelief}
						className="btn-secondary px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 text-accent-danger border-accent-danger/20"
					>
						<i className="fa-solid fa-trash-can mr-2" /> Reset
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
				<div className="w-full flex justify-center py-4 overflow-x-auto scrollbar-hide">
					<div className="min-w-140 max-w-2xl w-full grid grid-cols-13 gap-px bg-white/5 p-px rounded-3xl overflow-hidden border border-white/10 shadow-3xl">
						{RANKS.map((r1, i) => (
							<React.Fragment key={`row-${r1}`}>
								{RANKS.map((r2, j) => {
									const isPair = i === j;
									const isSuited = j > i;

									let hand = `${r1}${r2}`;
									if (!isPair) {
										hand = isSuited ? `${r1}${r2}s` : `${r2}${r1}o`;
									}

									const intensity = getBeliefIntensity(
										currentBelief,
										hand,
										maxBelief,
									);
									const bgClass = heatmapColors(intensity);

									return (
										<div
											key={hand}
											className={`aspect-square flex flex-col items-center justify-center text-[0.55rem] font-black font-mono transition-all duration-500 border ${bgClass}`}
											title={`${hand} - Belief: ${((currentBelief[hand] || 0) * 100).toFixed(4)}%`}
										>
											<span
												className={
													intensity === 0 ? 'opacity-10' : 'opacity-100'
												}
											>
												{hand}
											</span>
											{intensity > 5 && (
												<span className="text-[0.4rem] opacity-60 mt-0.5">
													{Math.round(intensity)}%
												</span>
											)}
										</div>
									);
								})}
							</React.Fragment>
						))}
					</div>
				</div>

				<div className="space-y-8">
					<div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
						<h5 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mb-6">
							Filtros de Ação (Evidência)
						</h5>
						<div className="flex flex-col gap-4">
							{mockActions.map((action) => (
								<button
									key={action.name}
									onClick={() => handleApplyMock(action.likelihood)}
									className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-indigo/40 hover:bg-accent-indigo/5 transition-all group"
								>
									<div className="text-[0.65rem] font-black text-white uppercase tracking-widest mb-1 group-hover:text-accent-indigo-light">
										{action.name}
									</div>
									<div className="text-[0.55rem] text-text-darker uppercase font-bold tracking-tighter">
										Likelihood: {action.likelihood}
									</div>
								</button>
							))}
						</div>
					</div>

					<div className="p-6 bg-accent-indigo/5 border border-accent-indigo/10 rounded-3xl">
						<div className="flex items-start gap-4">
							<i className="fa-solid fa-brain text-accent-indigo-light text-lg mt-1" />
							<div className="space-y-2">
								<h6 className="text-[0.6rem] font-black text-white uppercase tracking-widest m-0">
									Invariante Bayesiana
								</h6>
								<p className="text-[0.65rem] text-text-muted leading-relaxed m-0 font-medium">
									À medida que o oponente toma ações, a probabilidade de certas
									mãos colapsa. O mapa visualiza a &quot;Crença Posterior&quot; do
									motor de IA.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
