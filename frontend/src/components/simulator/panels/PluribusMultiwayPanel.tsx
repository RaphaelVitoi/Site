'use client';

/**
 * IDENTITY: Painel Pluribus Multiway Solver & PMev Synthesis (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/panels/PluribusMultiwayPanel.tsx
 * ROLE: Simular subjogos multiway de 3 a 6 jogadores com horizonte finito e compensação N^2 do PMev.
 */

import { useState, useMemo } from 'react';
import {
	solvePluribusMultiway,
	type PluribusAction,
	type TablePosition,
} from '@/lib/pluribusMultiwayEngine';

export default function PluribusMultiwayPanel() {
	const [numPlayers, setNumPlayers] = useState<number>(4);
	const [heroPosition, setHeroPosition] = useState<TablePosition>('BTN');
	const [pot, setPot] = useState<number>(100);
	const [nominalEquity, setNominalEquity] = useState<number>(65); // [0 - 100%]
	const [lambdaFactor, setLambdaFactor] = useState<number>(2.25);

	const solveResult = useMemo(() => {
		return solvePluribusMultiway({
			pot,
			numPlayers,
			heroPosition,
			nominalEquity: nominalEquity / 100,
			activeStacks: Array.from({ length: numPlayers }, () => 100),
			lambdaFactor,
			iterations: 80,
		});
	}, [pot, numPlayers, heroPosition, nominalEquity, lambdaFactor]);

	const actionColors: Record<PluribusAction, { bg: string; text: string; bar: string }> = {
		FOLD: {
			bg: 'bg-accent-danger/10 border-accent-danger/30',
			text: 'text-accent-danger',
			bar: 'bg-accent-danger',
		},
		CALL: {
			bg: 'bg-accent-indigo/10 border-accent-indigo/30',
			text: 'text-accent-indigo-light',
			bar: 'bg-accent-indigo',
		},
		RAISE: {
			bg: 'bg-accent-emerald/10 border-accent-emerald/30',
			text: 'text-accent-emerald',
			bar: 'bg-accent-emerald',
		},
	};

	const positions: TablePosition[] = ['BTN', 'CO', 'MP', 'UTG', 'SB', 'BB'];

	return (
		<div className="glass-panel flex flex-col gap-8 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="absolute -top-24 -left-24 w-52 h-52 bg-accent-emerald/5 blur-3xl rounded-full pointer-events-none" />

			{/* HEADER DO PAINEL */}
			<div className="flex justify-between items-center flex-wrap gap-6 pb-6 border-b border-white/5">
				<div>
					<div className="flex items-center gap-3">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_10px_var(--accent-emerald)] animate-pulse" />
						<h4 className="text-[0.75rem] font-black text-accent-emerald uppercase tracking-[0.2em] m-0">
							Multiway Depth-Limited CFR+ (Pluribus &middot; Science 2019)
						</h4>
						<span className="text-[0.55rem] font-mono px-2 py-0.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald-light uppercase">
							PMev Synthesis
						</span>
					</div>
					<p className="m-0 mt-2 text-[0.65rem] text-text-dim font-medium uppercase tracking-wider">
						Resolução de potes multiway (3 a 6-Max) &middot; Decomposição do Passivo de Colisão $O(k^2)$
					</p>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-[0.6rem] font-mono text-text-dim uppercase tracking-wider">
						Jogadores Ativos:
					</span>
					<div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
						{[2, 3, 4, 5, 6].map((n) => (
							<button
								type="button"
								key={n}
								onClick={() => setNumPlayers(n)}
								className={`px-2.5 py-1 text-[0.65rem] font-mono font-black rounded-lg transition-all ${
									numPlayers === n
										? 'bg-accent-emerald text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
										: 'text-text-dim hover:text-white'
								}`}
							>
								{n}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* MÉTRICAS CHAVE EM DESTAQUE */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-black/40 p-4 rounded-3xl border border-white/5">
					<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider mb-1">
						Passivo Multiway ($\Lambda$)
					</div>
					<div className="text-xl font-black font-mono text-accent-rose">
						{solveResult.structuralLiability.toFixed(1)}{' '}
						<span className="text-[0.65rem] text-text-muted font-normal">bb</span>
					</div>
					<div className="text-[0.5rem] font-mono text-text-darker mt-1">
						Penalidade: {((solveResult.structuralLiability / Math.max(1, pot)) * 100).toFixed(1)}% do pote
					</div>
				</div>

				<div className="bg-black/40 p-4 rounded-3xl border border-white/5">
					<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider mb-1">
						Equidade Efetiva
					</div>
					<div className="text-xl font-black font-mono text-white">
						{(solveResult.effectiveEquity * 100).toFixed(1)}%
					</div>
					<div className="text-[0.5rem] font-mono text-text-darker mt-1">
						Nominal: {nominalEquity}% &middot; Mult: {solveResult.posMultiplier.toFixed(2)}x
					</div>
				</div>

				<div className="bg-black/40 p-4 rounded-3xl border border-white/5">
					<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider mb-1">
						Ação Ótima Convergida
					</div>
					<div
						className={`text-xl font-black font-mono ${
							actionColors[solveResult.optimalAction].text
						}`}
					>
						{solveResult.optimalAction}
					</div>
					<div className="text-[0.5rem] font-mono text-text-darker mt-1">
						Freq: {(solveResult.strategy[solveResult.optimalAction] * 100).toFixed(1)}% (Nash)
					</div>
				</div>

				<div className="bg-black/40 p-4 rounded-3xl border border-white/5">
					<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider mb-1">
						Colisão de Stacks
					</div>
					<div className="text-xl font-black font-mono text-accent-indigo-light">
						{solveResult.kOpponents} oponentes
					</div>
					<div className="text-[0.5rem] font-mono text-text-darker mt-1">
						Fator $k^2 - 1$: {solveResult.kOpponents ** 2 - 1}x
					</div>
				</div>
			</div>

			{/* DISTRIBUIÇÃO DA ESTRATÉGIA CFR+ E BARRA HORIZONTAL */}
			<div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4">
				<div className="flex justify-between items-center text-[0.65rem] font-mono uppercase tracking-wider text-text-muted">
					<span>Distribuição da Estratégia Mestre (CFR+ Multiway)</span>
					<span>Iterações: {solveResult.iterations}</span>
				</div>

				{/* BARRA TRIFÁSICA */}
				<div className="w-full h-4 rounded-full bg-slate-900 border border-white/10 overflow-hidden flex shadow-inner">
					<div
						style={{ width: `${solveResult.strategy.FOLD * 100}%` }}
						className="h-full bg-accent-danger transition-all duration-500"
						title={`FOLD: ${(solveResult.strategy.FOLD * 100).toFixed(1)}%`}
					/>
					<div
						style={{ width: `${solveResult.strategy.CALL * 100}%` }}
						className="h-full bg-accent-indigo transition-all duration-500"
						title={`CALL: ${(solveResult.strategy.CALL * 100).toFixed(1)}%`}
					/>
					<div
						style={{ width: `${solveResult.strategy.RAISE * 100}%` }}
						className="h-full bg-accent-emerald transition-all duration-500"
						title={`RAISE: ${(solveResult.strategy.RAISE * 100).toFixed(1)}%`}
					/>
				</div>

				{/* CARDS DE CADA AÇÃO */}
				<div className="grid grid-cols-3 gap-4 pt-2">
					{(['FOLD', 'CALL', 'RAISE'] as PluribusAction[]).map((action) => {
						const freq = (solveResult.strategy[action] * 100).toFixed(1);
						const ev = solveResult.evs[action];
						const isOptimal = solveResult.optimalAction === action;

						return (
							<div
								key={action}
								className={`p-3 rounded-2xl border transition-all ${
									isOptimal
										? `${actionColors[action].bg} ring-1 ring-white/20 shadow-lg`
										: 'bg-white/5 border-white/5 opacity-70'
								}`}
							>
								<div className="flex items-center justify-between mb-1">
									<span
										className={`text-[0.65rem] font-black font-mono ${actionColors[action].text}`}
									>
										{action}
									</span>
									{isOptimal && (
										<span className="text-[0.45rem] font-mono uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-white">
											Ótima
										</span>
									)}
								</div>
								<div className="text-lg font-black font-mono text-white">{freq}%</div>
								<div className="text-[0.55rem] font-mono text-text-dim">
									EV: {ev > 0 ? `+${ev}` : ev} bb
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* CONTROLES INTERATIVOS DE SIMULAÇÃO */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-black/30 p-6 rounded-3xl border border-white/5">
				{/* LADO ESQUERDO: POSIÇÃO & POTE */}
				<div className="space-y-6">
					<div>
						<label className="text-[0.6rem] font-mono text-text-muted uppercase tracking-wider block mb-2">
							Posição do Hero
						</label>
						<div className="grid grid-cols-6 gap-2">
							{positions.map((pos) => (
								<button
									type="button"
									key={pos}
									onClick={() => setHeroPosition(pos)}
									className={`py-2 text-[0.65rem] font-mono font-black rounded-xl border transition-all ${
										heroPosition === pos
											? 'bg-accent-indigo/20 border-accent-indigo text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]'
											: 'bg-white/5 border-white/5 text-text-dim hover:text-white'
									}`}
								>
									{pos}
								</button>
							))}
						</div>
					</div>

					<div>
						<div className="flex justify-between text-[0.6rem] font-mono text-text-muted uppercase tracking-wider mb-2">
							<span>Tamanho do Pote</span>
							<span className="text-white font-bold">{pot} bb</span>
						</div>
						<input
							type="range"
							min="10"
							max="300"
							step="5"
							value={pot}
							onChange={(e) => setPot(Number(e.target.value))}
							className="w-full accent-accent-emerald cursor-pointer"
						/>
					</div>
				</div>

				{/* LADO DIREITO: EQUIDADE & FATOR LAMBDA */}
				<div className="space-y-6">
					<div>
						<div className="flex justify-between text-[0.6rem] font-mono text-text-muted uppercase tracking-wider mb-2">
							<span>Equidade Nominal do Hero</span>
							<span className="text-white font-bold">{nominalEquity}%</span>
						</div>
						<input
							type="range"
							min="10"
							max="95"
							step="1"
							value={nominalEquity}
							onChange={(e) => setNominalEquity(Number(e.target.value))}
							className="w-full accent-accent-emerald cursor-pointer"
						/>
					</div>

					<div>
						<div className="flex justify-between text-[0.6rem] font-mono text-text-muted uppercase tracking-wider mb-2">
							<span>Sensibilidade Multiway (&lambda;)</span>
							<span className="text-white font-bold">{lambdaFactor.toFixed(2)}x</span>
						</div>
						<input
							type="range"
							min="1.0"
							max="3.5"
							step="0.05"
							value={lambdaFactor}
							onChange={(e) => setLambdaFactor(Number(e.target.value))}
							className="w-full accent-accent-emerald cursor-pointer"
						/>
					</div>
				</div>
			</div>

			{/* NOTA TEÓRICA / DOUTRINÁRIA */}
			<div className="p-4 bg-accent-emerald/5 border border-accent-emerald/10 rounded-2xl flex items-start gap-3">
				<i className="fa-solid fa-microchip text-accent-emerald text-xs mt-1" />
				<div className="text-[0.6rem] text-text-muted leading-relaxed font-medium">
					<span className="text-white font-bold">Por que o Pluribus venceu os humanos em 6-max:</span> Em
					vez de resolver a árvore de ponta a ponta (o que exigiria supercomputadores proibitivos), ele
					trunca os ramos pós-flop em horizontes finitos (*depth-limited*). O PMev VITOI complementa essa
					busca subtraindo o passivo estocástico de múltiplos oponentes ($\Lambda \propto k^2$).
				</div>
			</div>
		</div>
	);
}
