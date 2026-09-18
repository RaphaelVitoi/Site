'use client';

/**
 * IDENTITY: Painel de Crença Bayesiana & Public Belief State (ReBeL + Claudico)
 * PATH: src/components/simulator/panels/BayesianBeliefPanel.tsx
 * ROLE: Visualizar a densidade de probabilidade (Belief), Entropia de Shannon (PBS) e colapso de range.
 * PRINCIPLE: O range não é binário; é uma distribuição contínua sob incerteza termodinâmica.
 */

import React from 'react';
import { useBayesianRange } from '../hooks/useBayesianRange';
import { normalizarLarguras, type TacticalActionType } from '@/lib/bayesianRangeEngine';
import { BayesianPokerTable } from '../ui/BayesianPokerTable';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

/** Street de um no, deduzida do id da acao. Extraida de ternario aninhado (S3358) sem mudar a decisao. */
function streetDaAcao(actionId: string): 'Flop' | 'Turn' | 'River' {
	if (actionId.includes('cbet') || actionId.includes('check_raise')) return 'Flop';
	return actionId.includes('barrel') ? 'Turn' : 'River';
}

interface BayesianBeliefPanelProps {
	initialRange?: string;
	label?: string;
}

export default function BayesianBeliefPanel({
	label: _label = 'BTN RFI',
}: Readonly<BayesianBeliefPanelProps>) {
	const {
		maxBelief,
		publicBeliefState,
		boardTexture,
		setBoardTexture,
		solverContext,
		setSolverContext,
		activeAction,
		selectTacticalAction,
		undoAction,
		resetBelief,
		actionHistory,
		streetStep,
		heroPosition,
		villainPosition,
		setHeroPosition,
		setVillainPosition,
		pot,
		tacticalExplanation,
		solverNodeData,
	} = useBayesianRange();

	const tacticalActions: {
		id: TacticalActionType;
		name: string;
		desc: string;
		badge: string;
		badgeColor: string;
		icon: string;
		accentBorder: string;
		activeClass: string;
	}[] = [
		{
			id: 'cbet_small',
			name: 'Flop C-Bet (33% Pot)',
			desc: 'Agressão ampla e mergida; preserva conectores e broadcards.',
			badge: 'Range Mergido',
			badgeColor: 'text-accent-indigo border-accent-indigo/30 bg-accent-indigo/10',
			icon: 'fa-solid fa-crosshairs text-accent-indigo',
			accentBorder: 'hover:border-accent-indigo/50 hover:bg-accent-indigo/10',
			activeClass:
				'border-accent-indigo bg-accent-indigo/20 ring-1 ring-accent-indigo/60 shadow-[0_0_15px_rgba(99,102,241,0.35)]',
		},
		{
			id: 'check_raise',
			name: 'Check-Raise Flop',
			desc: 'Polarização forte: monstros e draws pesados, sem pares médios.',
			badge: 'Polarizado',
			badgeColor: 'text-accent-rose border-accent-rose/30 bg-accent-rose/10',
			icon: 'fa-solid fa-bolt text-accent-rose',
			accentBorder: 'hover:border-accent-rose/50 hover:bg-accent-rose/10',
			activeClass:
				'border-accent-rose bg-accent-rose/20 ring-1 ring-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
		},
		{
			id: 'barrel_heavy',
			name: 'Turn Barrel (66% Pot)',
			desc: 'Pressão concentrada em topo de range e equidade dominante.',
			badge: 'Alta Densidade',
			badgeColor: 'text-accent-amber border-accent-amber/30 bg-accent-amber/10',
			icon: 'fa-solid fa-fire-flame-curved text-accent-amber',
			accentBorder: 'hover:border-accent-amber/50 hover:bg-accent-amber/10',
			activeClass:
				'border-accent-amber bg-accent-amber/20 ring-1 ring-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
		},
		{
			id: 'bluff_polar',
			name: 'River Shove Polarizado',
			desc: 'Colapso binário: topo absoluto (nuts) ou blefe com blockers.',
			badge: 'Nuts / Air',
			badgeColor: 'text-accent-danger border-accent-danger/30 bg-accent-danger/10',
			icon: 'fa-solid fa-skull-crossbones text-accent-danger',
			accentBorder: 'hover:border-accent-danger/50 hover:bg-accent-danger/10',
			activeClass:
				'border-accent-danger bg-accent-danger/20 ring-1 ring-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
		},
		{
			id: 'call_condensed',
			name: 'Call (Bluff Catcher)',
			desc: 'Range condensado: elimina mãos de topo e lixo puro.',
			badge: 'Condensado',
			badgeColor: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10',
			icon: 'fa-solid fa-shield-halved text-accent-emerald',
			accentBorder: 'hover:border-accent-emerald/50 hover:bg-accent-emerald/10',
			activeClass:
				'border-accent-emerald bg-accent-emerald/20 ring-1 ring-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
		},
	];

	const NOMES_DE_STREET = ['Flop', 'Turn', 'River'] as const;
	const streetName = NOMES_DE_STREET[streetStep] ?? 'River';

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
							{streetName} Ativo
						</span>
					</div>
					<p className="m-0 mt-2 text-[0.65rem] text-text-dim font-medium uppercase tracking-wider">
						Rastreamento de Range Contínuo &middot; {_label} &middot; Informação Imperfeita
					</p>
				</div>

				<div className="flex items-center gap-3 flex-wrap">
					{actionHistory.length > 1 && (
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

			{/* MESA DE POKER DIDÁTICA & SELETOR DE BOARDS */}
			<div className="w-full">
				<BayesianPokerTable
					boardTexture={boardTexture}
					onSelectBoardTexture={setBoardTexture}
					streetStep={streetStep}
					heroPosition={heroPosition}
					villainPosition={villainPosition}
					onSelectHeroPosition={setHeroPosition}
					onSelectVillainPosition={setVillainPosition}
					currentPot={pot}
				/>
			</div>

			{/* SELETOR DE MODELO DOUTRINÁRIO: ICMev vs ChipEV */}
			<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-black/50 border border-white/10 shadow-xl">
				<div className="flex flex-col gap-1 max-w-xl">
					<div className="flex items-center gap-2">
						<i className="fa-solid fa-scale-unbalanced text-accent-indigo text-xs" />
						<span className="text-[0.7rem] font-black text-white uppercase tracking-wider">
							Ambiente de Decisão &middot; Aula 1.2
						</span>
						<span className="text-[0.5rem] font-mono px-2 py-0.5 rounded-md bg-white/5 text-text-dim border border-white/10 uppercase">
							Árvores Idênticas
						</span>
					</div>
					<p className="text-[0.58rem] text-text-dim m-0 leading-relaxed font-medium">
						&ldquo;ChipEV e ICM são iguais e foram construídos sob os mesmos critérios; a única diferença é que ChipEV não tem Risk Premium e nem premiação.&rdquo;
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0 flex-wrap">
					<button
						type="button"
						onClick={() => setSolverContext('icm')}
						className={`px-3.5 py-2 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
							solverContext === 'icm'
								? 'bg-accent-emerald/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50'
								: 'bg-white/5 border-white/5 text-text-dim hover:bg-white/10 hover:text-white'
						}`}
					>
						<div className="flex items-center gap-1.5">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
							<span className="text-[0.65rem] font-black uppercase font-mono tracking-wider">
								ICMev (HRC &middot; Aula 1.2)
							</span>
						</div>
						<span className="text-[0.48rem] font-mono text-emerald-300/80">
							BU RP 21.4% vs BB 12.9% &middot; TT-66 Check 100%
						</span>
					</button>

					<button
						type="button"
						onClick={() => setSolverContext('chipev')}
						className={`px-3.5 py-2 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
							solverContext === 'chipev'
								? 'bg-accent-indigo/20 border-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-accent-indigo/50'
								: 'bg-white/5 border-white/5 text-text-dim hover:bg-white/10 hover:text-white'
						}`}
					>
						<div className="flex items-center gap-1.5">
							<span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
							<span className="text-[0.65rem] font-black uppercase font-mono tracking-wider">
								ChipEV (GTO Wizard)
							</span>
						</div>
						<span className="text-[0.48rem] font-mono text-accent-indigo-light/80">
							Sem RP &middot; C-Bet 97.7% (50% Pot)
						</span>
					</button>
				</div>
			</div>

			{/* SEÇÃO INFERIOR: MENU DE EVIDÊNCIA TÁTICA (ESQUERDA) E GRID 13x13 (DIREITA) */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* COLUNA ESQUERDA (LG:COL-SPAN-5): MENU DE EVIDÊNCIA TÁTICA DO VILÃO */}
				<div className="lg:col-span-5 flex flex-col gap-5">
					<div className="bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner flex flex-col gap-4">
						<div className="flex items-center justify-between pb-3 border-b border-white/5">
							<div>
								<h5 className="text-[0.68rem] font-black text-white uppercase tracking-[0.2em] m-0 flex items-center gap-2">
									<i className="fa-solid fa-brain text-accent-indigo" />
									{' '}
									Evidência Tática do Vilão
								</h5>
								<p className="text-[0.55rem] text-text-dim mt-1 m-0">
									Injeção de Ações &middot; Colapso Bayesiano de Range
								</p>
							</div>
							<span className="text-[0.5rem] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-indigo/15 text-accent-indigo-light border border-accent-indigo/30 uppercase">
								{streetName} Ativo
							</span>
						</div>

						{/* LISTA DE BOTÕES TÁTICOS REFINADOS */}
						<div className="flex flex-col gap-2.5">
							{tacticalActions.map((action) => {
								const isActive = activeAction === action.id;
								return (
									<button
										type="button"
										key={action.id}
										onClick={() => selectTacticalAction(action.id)}
										className={`w-full text-left p-3.5 rounded-2xl border transition-all group cursor-pointer active:scale-[0.98] ${
											isActive
												? action.activeClass
												: `bg-white/5 border-white/5 ${action.accentBorder}`
										}`}
									>
										<div className="flex items-center justify-between mb-1.5">
											<div className="flex items-center gap-2.5">
												<div
													className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
														isActive
															? 'bg-white/15 border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)] scale-105'
															: 'bg-white/5 border-white/10'
													}`}
												>
													<i className={`${action.icon} text-xs`} />
												</div>
												<div className="flex items-center gap-1.5 flex-wrap">
													<span className="text-[0.68rem] font-black text-white uppercase tracking-wider group-hover:text-accent-indigo-light transition-colors">
														{action.name}
													</span>
													<span className="text-[0.45rem] font-mono text-text-dim px-1.5 py-0.2 rounded bg-black/40 border border-white/5 uppercase font-bold">
														{streetDaAcao(action.id)}
													</span>
												</div>
											</div>
											{isActive ? (
												<span className="flex items-center gap-1.5 text-[0.48rem] font-mono font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/40 shadow-sm">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
													{' '}
													ATIVO
												</span>
											) : (
												<span
													className={`text-[0.48rem] font-mono font-bold px-2 py-0.5 rounded-full border ${action.badgeColor}`}
												>
													{action.badge}
												</span>
											)}
										</div>
										<div className="text-[0.58rem] text-text-muted leading-relaxed font-medium pl-8.5">
											{action.desc}
										</div>
									</button>
								);
							})}
						</div>

						{/* CONTROLES DE HISTÓRICO RÁPIDO */}
						<div className="flex items-center gap-2 pt-2 border-t border-white/5">
							{actionHistory.length > 1 && (
								<button
									type="button"
									onClick={undoAction}
									className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[0.6rem] font-mono font-bold text-white uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<i className="fa-solid fa-rotate-left text-xs text-accent-indigo" />
									{' '}
									Desfazer
								</button>
							)}
							<button
								type="button"
								onClick={resetBelief}
								className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-[0.6rem] font-mono font-bold text-rose-300 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
							>
								<i className="fa-solid fa-trash-can text-xs text-rose-400" />
								{' '}
								Resetar Range
							</button>
						</div>
					</div>

					{/* NOTA DOUTRINÁRIA */}
					<div className="p-4 bg-accent-indigo/5 border border-accent-indigo/10 rounded-2xl flex items-start gap-3">
						<i className="fa-solid fa-atom text-accent-indigo-light text-xs mt-0.5 shrink-0" />
						<p className="text-[0.6rem] text-text-muted leading-relaxed m-0 font-medium">
							Cada ação tomada pelo vilão atua como uma evidência que colapsa a entropia do range
							via Teorema de Bayes, isolando os vetores de polarização na matriz ao lado.
						</p>
					</div>
				</div>

				{/* COLUNA DIREITA (LG:COL-SPAN-7): GRID 13x13 ALINHADO À DIREITA */}
				<div className="lg:col-span-7 flex flex-col items-center lg:items-end w-full">
					<div className="@container/grade w-full max-w-xl">
						{/* CABEÇALHO DO GRID COM CONTEXTO DINÂMICO DA ESTRATÉGIA */}
						<div className="flex flex-col gap-2.5 mb-3 px-1">
							<div className="flex items-center justify-between flex-wrap gap-2">
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)] animate-pulse" />
									<span className="text-[0.66rem] font-mono font-black text-white uppercase tracking-wider">
										{tacticalExplanation.title} &middot; {tacticalExplanation.boardName}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-[0.52rem] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-indigo/15 text-accent-indigo-light border border-accent-indigo/30 uppercase">
										Freq: {tacticalExplanation.frequencyEstimate}
									</span>
									<span className="text-[0.52rem] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
										Pico: {(maxBelief * 100).toFixed(2)}%
									</span>
								</div>
							</div>

							{/* BARRA GLOBAL DE AÇÕES DO SOLVER (ESTILO HRC / GTO WIZARD) */}
							<div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
								<div className="flex items-center justify-between flex-wrap gap-2 text-[0.6rem] font-mono">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="font-black text-white px-2 py-0.5 rounded-md bg-white/10 uppercase tracking-wider border border-white/10">
											{solverNodeData.actor}:
										</span>
										<div className="flex items-center gap-2.5 flex-wrap">
											{solverNodeData.globalBar.map((act) => (
												<span key={act.name} className="flex items-center gap-1.5 text-white/90 font-bold">
													<span
														className="w-2 h-2 rounded-xs shrink-0 shadow-xs"
														style={{ backgroundColor: act.color }}
													/>
													<span className="text-text-dim">{act.label}</span>
													<span className="text-white font-mono">({act.pct.toFixed(1)}%)</span>
												</span>
											))}
										</div>
									</div>
									<div className="flex items-center gap-1.5 text-[0.55rem] text-text-dim">
										<span>Combos Ativos:</span>
										<span className="font-bold text-accent-emerald-light font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
											~{solverNodeData.activeCombosCount}
										</span>
									</div>
								</div>

								{/* Barra Contínua do Range Completo.
								    A largura vem da evidencia canonica quando o no esta ligado a ela (`act.largura`, derivada dos
								    combos lidos da captura) e so cai para a normalizacao local nos nos que ainda so tem porcentagem.
								    O rotulo nunca muda: continua sendo o digito da captura, inclusive quando a soma da 100.1. */}
								<div className="w-full h-2.5 rounded-full overflow-hidden flex bg-white/5 border border-white/10 shadow-inner">
									{normalizarLarguras(solverNodeData.globalBar).map((larguraLocal, i) => {
										const act = solverNodeData.globalBar[i];
										if (!act) return null;
										const largura = act.largura ?? larguraLocal;
										const procedencia =
											act.combos !== undefined
												? `${act.label}: ${act.pct.toFixed(1)}% · ${act.combos} combos lidos da captura`
												: `${act.label}: ${act.pct.toFixed(1)}%`;
										return (
											<div
												key={`bar-${act.name}`}
												style={{ width: `${largura}%`, backgroundColor: act.color }}
												className="h-full transition-all duration-300"
												title={procedencia}
											/>
										);
									})}
								</div>
							</div>
						</div>

						{/* GRID 13x13 COM INDIFERENÇA DE NASH E FILTRAGEM CUMULATIVA */}
						<div className="grid grid-cols-13 gap-px p-px rounded-2xl overflow-hidden border border-white/10 shadow-3xl bg-slate-950/90 backdrop-blur-md">
							{RANKS.map((r1, i) => (
								<React.Fragment key={`row-${r1}`}>
									{RANKS.map((r2, j) => {
										const isPair = i === j;
										const isSuited = j > i;

										let hand = `${r1}${r2}`;
										if (!isPair) {
											hand = isSuited ? `${r1}${r2}s` : `${r2}${r1}o`;
										}

										const comboState = solverNodeData.combos[hand];
										const arrived = comboState?.arrived ?? false;
										const isIndifferent = comboState?.isIndifferent ?? false;
										const localFreq = comboState?.localFreq ?? 0;
										const gradientStyle = comboState?.gradientStyle;
										const actions = comboState?.actions ?? [];

										// Se não chegou ao nó (filtrado cumulativamente nas ruas anteriores)
										if (!comboState || !arrived) {
											return (
												<div
													key={hand}
													className="aspect-square flex flex-col items-center justify-center text-[clamp(0.38rem,1.8cqw,0.68rem)] leading-none font-bold font-mono transition-all duration-300 border border-white/5 bg-slate-950/70 text-slate-700/50 select-none opacity-25"
													title={`${hand} - Filtrado: 0% de chegada neste nó (${streetName})`}
												>
													<span>{hand}</span>
												</div>
											);
										}

										// Se chegou ao nó: renderizar split bands (Indiferença de Nash) ou ação pura
										return (
											<div
												key={hand}
												style={{ background: gradientStyle }}
												className={`aspect-square flex flex-col items-center justify-center text-[clamp(0.42rem,2.1cqw,0.78rem)] leading-none font-black font-mono transition-all duration-300 border border-black/40 text-white shadow-sm relative overflow-hidden select-none group cursor-pointer hover:scale-105 hover:z-20 hover:ring-2 hover:ring-white/80 ${
													isIndifferent ? 'ring-1 ring-white/30' : ''
												}`}
												title={
													comboState.notes ??
													`${hand} - Frequência Local: ${localFreq}% | Chegada: ${(comboState.arrivalWeight * 100).toFixed(0)}%`
												}
											>
												<span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] z-10">
													{hand}
												</span>
												{/* Os dois ramos sao excludentes por construcao (localFreq > 0 contra <= 0), entao ficam como
												    condicoes independentes em vez de ternario aninhado (S3358). A decisao exibida e a mesma. */}
												{localFreq > 0 && (
													<span className="text-[clamp(0.32rem,1.4cqw,0.52rem)] leading-none font-black text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] mt-0.5 z-10">
														{localFreq}%
													</span>
												)}
												{localFreq <= 0 && actions[0]?.name === 'Check' && (
													<span className="text-[clamp(0.28rem,1.2cqw,0.48rem)] leading-none font-bold text-emerald-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] mt-0.5 z-10">
														CHK
													</span>
												)}

												{/* Tag indicadora de Indiferença de Nash no canto */}
												{isIndifferent && (
													<div
														className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white shadow-xs z-10"
														title="Indiferença de Nash (Ações Mistas com EV Empatado)"
													/>
												)}
											</div>
										);
									})}
								</React.Fragment>
							))}
						</div>

						{/* LEITURA DIDÁTICA E EXPLICAÇÃO TÁTICA DO RANGE */}
						<div className="mt-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2.5">
							<div className="flex items-center justify-between flex-wrap gap-2 text-[0.55rem] font-mono text-text-dim">
								<span className="font-bold text-white uppercase flex items-center gap-1.5">
									<i className="fa-solid fa-crosshairs text-accent-indigo" />
									{' '}
									Leitura Teórica do Range:
								</span>
								<span className="text-text-muted">
									Combos-Chave:{' '}
									<span className="text-accent-indigo-light font-bold">
										{tacticalExplanation.keyCombos.join(', ')}
									</span>
								</span>
							</div>
							<p className="text-[0.6rem] text-text-muted leading-relaxed m-0 font-medium">
								{tacticalExplanation.tacticalSummary}
							</p>

							{/* DOUTRINA: PRINCÍPIO DA INDIFERENÇA DE NASH */}
							<div className="pt-2 border-t border-white/5 flex items-start gap-2 text-[0.55rem] font-mono text-amber-300/80">
								<i className="fa-solid fa-scale-unbalanced text-amber-400 text-xs mt-0.5 shrink-0" />
								<span>
									<strong>Princípio da Indiferença de Nash:</strong> Quadrados bicolores/multicolores
									simbolizam que o EV das ações empata rigorosamente [EV(A₁) = EV(A₂)].
									A porcentagem fracionária existe exclusivamente por arquitetura de balanceamento para
									tornar o vilão indiferente ou por ruído de convergência CFR (dEV ≤ ε).
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

