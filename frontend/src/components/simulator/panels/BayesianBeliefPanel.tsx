'use client';

/**
 * IDENTITY: Painel de Crença Bayesiana & Public Belief State (ReBeL + Claudico)
 * PATH: src/components/simulator/panels/BayesianBeliefPanel.tsx
 * ROLE: Visualizar a densidade de probabilidade (Belief), Entropia de Shannon (PBS) e colapso de range.
 * PRINCIPLE: O range não é binário; é uma distribuição contínua sob incerteza termodinâmica.
 */

import React from 'react';
import { useBayesianRange } from '../hooks/useBayesianRange';
import { getBeliefIntensity, type TacticalActionType } from '@/lib/bayesianRangeEngine';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

interface BayesianBeliefPanelProps {
	initialRange?: string;
	label?: string;
}

export default function BayesianBeliefPanel({
	label: _label = 'BTN RFI',
}: Readonly<BayesianBeliefPanelProps>) {
	const {
		currentBelief,
		maxBelief,
		publicBeliefState,
		boardTexture,
		setBoardTexture,
		applyTacticalAction,
		undoAction,
		resetBelief,
		history,
	} = useBayesianRange();

	const heatmapColors = (intensity: number) => {
		if (intensity === 0) return 'bg-slate-900/40 text-text-darker border-white/5';

		if (intensity > 80)
			return 'bg-accent-emerald text-slate-900 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
		if (intensity > 50) return 'bg-accent-emerald/60 text-white border-emerald-500/50';
		if (intensity > 20) return 'bg-accent-indigo/40 text-text-bright border-indigo-500/30';
		return 'bg-accent-indigo/10 text-text-dim border-white/10';
	};

	const tacticalActions: {
		id: TacticalActionType;
		name: string;
		desc: string;
		badge: string;
		badgeColor: string;
	}[] = [
		{
			id: 'cbet_small',
			name: 'Flop C-Bet (33% Pot)',
			desc: 'Agressão ampla e mergida; preserva conectores e broadcards.',
			badge: 'Range Mergido',
			badgeColor: 'text-accent-indigo border-accent-indigo/30 bg-accent-indigo/10',
		},
		{
			id: 'check_raise',
			name: 'Check-Raise Flop',
			desc: 'Polarização forte: monstros e draws pesados, sem pares médios.',
			badge: 'Polarizado',
			badgeColor: 'text-accent-rose border-accent-rose/30 bg-accent-rose/10',
		},
		{
			id: 'barrel_heavy',
			name: 'Turn Barrel (66% Pot)',
			desc: 'Pressão concentrada em topo de range e equidade dominante.',
			badge: 'Alta Densidade',
			badgeColor: 'text-accent-amber border-accent-amber/30 bg-accent-amber/10',
		},
		{
			id: 'bluff_polar',
			name: 'River Shove Polarizado',
			desc: 'Colapso binário: topo absoluto (nuts) ou blefe com blockers.',
			badge: 'Nuts / Air',
			badgeColor: 'text-accent-danger border-accent-danger/30 bg-accent-danger/10',
		},
		{
			id: 'call_condensed',
			name: 'Call (Bluff Catcher)',
			desc: 'Range condensado: elimina mãos de topo e lixo puro.',
			badge: 'Condensado',
			badgeColor: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10',
		},
	];

	return (
		<div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

			{/* HEADER COM TELEMETRIA PBS (ReBeL) */}
			<div className="flex justify-between items-center flex-wrap gap-6 pb-8 border-b border-white/5">
				<div>
					<div className="flex items-center gap-3">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)] animate-pulse" />
						<h4 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0">
							Public Belief State (PBS &middot; ReBeL)
						</h4>
						<span className="text-[0.55rem] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-muted uppercase">
							Street {history.length + 1}
						</span>
					</div>
					<p className="m-0 mt-2 text-[0.65rem] text-text-dim font-medium uppercase tracking-wider">
						Rastreamento de Range Contínuo &middot; {_label} &middot; Informação Imperfeita
					</p>
				</div>

				<div className="flex items-center gap-3 flex-wrap">
					{history.length > 0 && (
						<button
							type="button"
							onClick={undoAction}
							className="btn-secondary px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
						>
							<i className="fa-solid fa-rotate-left mr-2" /> Desfazer
						</button>
					)}
					<button
						type="button"
						onClick={resetBelief}
						className="btn-secondary px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 text-accent-danger border-accent-danger/20"
					>
						<i className="fa-solid fa-trash-can mr-2" /> Reset
					</button>
				</div>
			</div>

			{/* TELEMETRIA DO PBS: ENTROPIA, POLARIZAÇÃO E COMBOS */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/40 p-4 sm:p-5 rounded-3xl border border-white/5">
				<div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5">
					<div className="w-8 h-8 rounded-xl bg-accent-indigo/20 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo text-xs">
						<i className="fa-solid fa-wave-square" />
					</div>
					<div>
						<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider">
							Entropia de Shannon
						</div>
						<div className="text-sm font-black font-mono text-white">
							{publicBeliefState.villainEntropy.toFixed(2)}{' '}
							<span className="text-[0.6rem] text-text-muted font-normal">bits</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5">
					<div className="w-8 h-8 rounded-xl bg-accent-rose/20 border border-accent-rose/30 flex items-center justify-center text-accent-rose text-xs">
						<i className="fa-solid fa-crosshairs" />
					</div>
					<div>
						<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider">
							Polarização do Range
						</div>
						<div className="text-sm font-black font-mono text-white">
							{publicBeliefState.polarizationScore.toFixed(1)}%
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5">
					<div className="w-8 h-8 rounded-xl bg-accent-emerald/20 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald text-xs">
						<i className="fa-solid fa-layer-group" />
					</div>
					<div>
						<div className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider">
							Combos Ativos
						</div>
						<div className="text-sm font-black font-mono text-white">
							~{publicBeliefState.combosLeft}{' '}
							<span className="text-[0.6rem] text-text-muted font-normal">/ 1326</span>
						</div>
					</div>
				</div>
			</div>

			{/* A sidebar de 300px so entra ao lado quando o PAINEL comporta as duas
			    colunas -- e quem decide isso e a largura dele, nunca a da janela. Medido
			    em 2026-09-12: a 1600px de viewport, `xl:` ja estava ativo e mesmo assim
			    sobravam 404px para a matriz, porque o painel inteiro tem ~744px dentro do
			    `lg:col-span-7`. Breakpoint de viewport respondia a pergunta errada.
			    Abaixo de 56rem de PAINEL a sidebar empilha, e o heatmap -- que e o
			    conteudo principal -- fica com a largura toda. */}
			<div className="@container/split grid grid-cols-1 @[56rem]/split:grid-cols-[minmax(0,1fr)_300px] gap-10">
				{/* GRID 13x13 DE HEATMAP BAYESIANO
				    MEDIDO EM 2026-09-12, a 1600px de viewport: coluna disponivel 384px,
				    grade 549px, transbordo 165px. A causa era `min-w-140` (35rem = 560px)
				    dentro de um contentor de 384px -- e o corte era INVISIVEL, porque o
				    pai somava `justify-center` a `overflow-x-auto scrollbar-hide`: a
				    grade era aparada dos dois lados e a barra que denunciaria isso ficava
				    escondida. AA e AKs sumiam sem nenhum sinal.
				    A largura minima saiu. A grade agora e fluida e o `@container` faz a
				    tipografia acompanhar a CELULA, nao a viewport -- que e a unidade que
				    de fato decide legibilidade aqui. */}
				<div className="@container/grade w-full py-2">
					<div className="mx-auto w-full max-w-2xl grid grid-cols-13 gap-px bg-white/5 p-px rounded-xl overflow-hidden border border-white/10 shadow-3xl">
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
									const handVal = (currentBelief[hand] ?? 0) as number;

									return (
										<div
											key={hand}
											// 13 colunas: cada celula ocupa ~7.7cqw. O rotulo em 2.1cqw
											// fica proporcional a ela em qualquer largura, com piso
											// legivel e teto que impede a fonte de inchar no XL.
											className={`aspect-square flex flex-col items-center justify-center text-[clamp(0.42rem,2.1cqw,0.78rem)] leading-none font-black font-mono transition-all duration-500 border ${bgClass}`}
											title={`${hand} - Crença: ${(handVal * 100).toFixed(4)}%`}
										>
											<span
												className={
													intensity === 0 ? 'opacity-10' : 'opacity-100'
												}
											>
												{hand}
											</span>
											{intensity > 5 && (
												<span className="text-[clamp(0.34rem,1.5cqw,0.55rem)] leading-none opacity-60 mt-0.5">
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

				{/* CONTROLES: TEXTURA DE BORDO & AÇÕES TÁTICAS */}
				<div className="space-y-6">
					{/* TEXTURA DO BORDO (Claudico Potential-Aware) */}
					<div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
						<div className="flex items-center justify-between mb-4">
							<h5 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">
								Textura do Bordo (Claudico)
							</h5>
							<span className="text-[0.5rem] font-mono text-accent-indigo-light uppercase">
								EHS² Mode
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{(
								[
									{ id: 'dry', label: 'Bordo Seco (Ah Kd 2c)' },
									{ id: 'wet', label: 'Bordo Molhado (Jh Th 9d)' },
									{ id: 'paired', label: 'Dobrado (Qc Qd 4s)' },
									{ id: 'monotone', label: 'Monotone (Kh 8h 3h)' },
								] as const
							).map((tex) => (
								<button
									type="button"
									key={tex.id}
									onClick={() => setBoardTexture(tex.id)}
									className={`p-2.5 rounded-xl text-[0.55rem] font-mono uppercase tracking-wider text-left border transition-all ${
										boardTexture === tex.id
											? 'bg-accent-indigo/20 border-accent-indigo text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]'
											: 'bg-white/5 border-white/5 text-text-dim hover:text-text-bright'
									}`}
								>
									{tex.label}
								</button>
							))}
						</div>
					</div>

					{/* FILTROS DE AÇÃO TÁTICA (Bayesian Update) */}
					<div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
						<h5 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mb-4">
							Evidência Tática do Vilão
						</h5>
						<div className="flex flex-col gap-2.5">
							{tacticalActions.map((action) => (
								<button
									type="button"
									key={action.id}
									onClick={() => applyTacticalAction(action.id)}
									className="w-full text-left p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-indigo/40 hover:bg-accent-indigo/5 transition-all group"
								>
									<div className="flex items-center justify-between mb-1">
										<div className="text-[0.65rem] font-black text-white uppercase tracking-wider group-hover:text-accent-indigo-light">
											{action.name}
										</div>
										<span
											className={`text-[0.45rem] font-mono px-2 py-0.5 rounded-full border ${action.badgeColor}`}
										>
											{action.badge}
										</span>
									</div>
									<div className="text-[0.55rem] text-text-darker leading-normal font-medium">
										{action.desc}
									</div>
								</button>
							))}
						</div>
					</div>

					{/* NOTA DOUTRINÁRIA */}
					<div className="p-4 bg-accent-indigo/5 border border-accent-indigo/10 rounded-2xl flex items-start gap-3">
						<i className="fa-solid fa-atom text-accent-indigo-light text-xs mt-0.5" />
						<p className="text-[0.6rem] text-text-muted leading-relaxed m-0 font-medium">
							Cada ação tomada pelo vilão atua como uma evidência que colapsa a entropia do range
							via Teorema de Bayes, isolando os vetores de polarização.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

