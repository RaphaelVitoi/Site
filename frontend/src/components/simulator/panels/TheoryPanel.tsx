'use client';

/**
 * IDENTITY: Painel de Fundamentação Teórica SOTA v8.0 GOLD
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: Síntese de doutrina analítica, física de assimetria, matriz SPR, frequências Nash, vetores de exploit e quiz didático.
 * AESTHETIC: SOTA Gold Standard (Proportional Containers, Glassmorphism, Zero-Overflow, Universal Scenario Adaptation).
 */

import type { Scenario, SprStage } from '@/components/simulator/solver/types';
import { calcBF, calculateRiskAdvantageDelta } from '@/components/simulator/solver/utils';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { useEffect, useMemo, useState } from 'react';

interface TheoryPanelProps {
	scenario: Scenario;
	effectiveSprData?: SprStage[];
	effectiveStacks?: number[];
	effectiveIpRp?: number;
	effectiveOopRp?: number;
}

type TheoryLens = 'doctrine' | 'spr' | 'exploit' | 'quiz' | 'all';

export default function TheoryPanel({
	scenario,
	effectiveSprData,
	effectiveStacks,
	effectiveIpRp = 0,
	effectiveOopRp = 0,
}: Readonly<TheoryPanelProps>) {
	const [activeLens, setActiveLens] = useState<TheoryLens>('doctrine');
	const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);

	// Reset do quiz ao trocar de cenário
	useEffect(() => {
		setSelectedOptionId(null);
		setShowFeedback(false);
	}, [scenario.id]);

	const ipRp = effectiveIpRp || scenario.ipRp || 0;
	const oopRp = effectiveOopRp || scenario.oopRp || 0;
	const ipBf = calcBF(ipRp);
	const oopBf = calcBF(oopRp);
	const riskAdvantageDelta = calculateRiskAdvantageDelta(ipRp, oopRp);

	const activeSprData = useMemo(
		() => effectiveSprData ?? scenario.sprData ?? [],
		[effectiveSprData, scenario.sprData],
	);

	const preflopPot = useMemo(
		() => activeSprData.find((s) => s.name === 'PRE' || s.name === 'FLOP')?.potSize || 2.5,
		[activeSprData],
	);

	const effStack = useMemo(
		() =>
			Math.min(
				effectiveStacks?.[0] || scenario.stacks[0] || 40,
				effectiveStacks?.[1] || scenario.stacks[1] || 40,
			),
		[effectiveStacks, scenario.stacks],
	);

	const categoryBadge = useMemo(() => {
		switch (scenario.category) {
			case 'baseline':
				return { label: 'Referencial Base', border: 'border-accent-sky/30', text: 'text-accent-sky-light', bg: 'bg-accent-sky/10' };
			case 'toyGame':
				return { label: 'Toy Game SOTA', border: 'border-accent-amber/30', text: 'text-accent-amber-light', bg: 'bg-accent-amber/10' };
			case 'clinical':
			default:
				return { label: 'Estudo Clínico', border: 'border-accent-indigo/30', text: 'text-accent-indigo-light', bg: 'bg-accent-indigo/10' };
		}
	}, [scenario.category]);

	const hasIpAdvantage = riskAdvantageDelta > 0;
	const hasOopAdvantage = riskAdvantageDelta < 0;

	let asymmetryBadgeStyle = 'bg-white/5 border-white/10 text-text-dim';
	let asymmetryIcon = 'fa-equals';
	let asymmetryText = 'Simetria Estrita de Pressão (0.0 p.p.)';

	if (hasIpAdvantage) {
		asymmetryBadgeStyle = 'bg-accent-emerald/15 border-accent-emerald/30 text-accent-emerald';
		asymmetryIcon = 'fa-bolt-lightning';
		asymmetryText = `IP com Vantagem de Risco (+${riskAdvantageDelta.toFixed(1)} p.p.)`;
	} else if (hasOopAdvantage) {
		asymmetryBadgeStyle = 'bg-accent-rose/15 border-accent-rose/30 text-accent-rose';
		asymmetryIcon = 'fa-scale-unbalanced';
		asymmetryText = `OOP com Vantagem de Risco (${riskAdvantageDelta.toFixed(1)} p.p.)`;
	}

	return (
		<div className="glass-panel w-full p-4 sm:p-6 lg:p-7 flex flex-col gap-6 animate-sota-in bg-bg-panel/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl relative overflow-hidden group/theory-root">
			{/* Ambient Lighting Orbs */}
			<div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none" />
			<div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-rose/10 blur-[120px] rounded-full pointer-events-none" />

			{/* ═══ 1. CENÁRIO HERO & IDENTIDADE ═══ */}
			<header className="relative z-10 flex flex-col gap-3 pb-4 border-b border-white/8">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<span className={`px-2.5 py-0.5 rounded-full text-[0.6rem] font-mono font-bold uppercase tracking-wider border ${categoryBadge.bg} ${categoryBadge.border} ${categoryBadge.text}`}>
							{categoryBadge.label}
						</span>
						<span className="px-2.5 py-0.5 rounded-full text-[0.6rem] font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-text-muted">
							Cenário {scenario.id.toUpperCase()}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="px-3 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-widest bg-accent-indigo/15 text-accent-indigo-light border border-accent-indigo/30 shadow-sm">
							{scenario.verdict}
						</span>
						<span className="hidden sm:inline-block text-[0.55rem] font-black text-text-darker uppercase tracking-[0.25em]">
							Protocolo SOTA v8.0
						</span>
					</div>
				</div>

				<div className="flex items-baseline justify-between gap-4 flex-wrap">
					<div>
						<h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider m-0 flex items-center gap-3">
							<i className={`fa-solid ${scenario.icon || 'fa-book-open'} text-accent-indigo text-lg`} />
							<span>{scenario.narrativeTitle}</span>
						</h3>
						<p className="text-xs sm:text-sm text-text-muted font-medium m-0 mt-0.5">
							{scenario.name} · <span className="text-text-dim italic">{scenario.narrativeSubtitle}</span>
						</p>
					</div>
				</div>
			</header>

			{/* ═══ 2. SELETOR DE LENTES TEÓRICAS (SEGMENTED CONTROL) ═══ */}
			<nav aria-label="Lentes teóricas do cenário" className="relative z-10 grid grid-cols-5 gap-1 sm:gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner">
				{[
					{ id: 'doctrine', label: 'Doutrina', icon: 'fa-book-open' },
					{ id: 'spr', label: 'SPR & Nash', icon: 'fa-water' },
					{ id: 'exploit', label: 'Exploit', icon: 'fa-crosshairs' },
					{ id: 'quiz', label: 'Quiz', icon: 'fa-graduation-cap' },
					{ id: 'all', label: 'Geral', icon: 'fa-layer-group' },
				].map((tab) => {
					const isActive = activeLens === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveLens(tab.id as TheoryLens)}
							className={`w-full py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-[0.62rem] sm:text-[0.7rem] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer border ${
								isActive
									? 'bg-accent-indigo text-white border-accent-indigo-light shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
									: 'bg-slate-900/60 hover:bg-slate-850 text-text-dim hover:text-white border-white/5 hover:border-white/15'
							}`}
						>
							<i className={`fa-solid ${tab.icon} text-[0.65rem] ${isActive ? 'text-white' : 'text-text-dim'}`} />
							<span>{tab.label}</span>
						</button>
					);
				})}
			</nav>

			{/* ═══ 3. CONTEÚDO DAS LENTES ═══ */}
			<div className="relative z-10 flex flex-col gap-6">

				{/* ─── LENTE 1: DOUTRINA & DINÂMICA DE CONFRONTO ─── */}
				{(activeLens === 'doctrine' || activeLens === 'all') && (
					<section className="flex flex-col gap-5 animate-sota-in">
						{/* Card Doutrina Analítica */}
						<div className="p-5 sm:p-6 bg-slate-950/50 border border-accent-indigo/20 rounded-2xl shadow-inner relative overflow-hidden group/doctrine transition-all hover:border-accent-indigo/40">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-8 h-8 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo-light">
									<i className="fa-solid fa-book-open-reader text-sm" />
								</div>
								<div>
									<h4 className="text-xs font-black text-white uppercase tracking-wider m-0">
										Doutrina Analítica
									</h4>
									<p className="text-[0.6rem] text-text-dim uppercase tracking-widest m-0 font-mono">
										Fundamentação Epistêmica do Spot
									</p>
								</div>
							</div>
							<div className="text-[0.82rem] sm:text-[0.88rem] text-indigo-50/85 leading-relaxed font-sans">
								<SotaMarkdown content={scenario.theory || 'Sem doutrina cadastrada.'} />
							</div>
						</div>

						{/* Morfologia Concreta das Posições (Dinâmica por Cenário) */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{/* Agressor (IP) */}
							<div className="p-4 sm:p-5 rounded-2xl bg-slate-950/40 border border-accent-indigo/25 flex flex-col justify-between gap-3 relative overflow-hidden transition-all hover:bg-slate-950/60">
								<div className="flex items-center justify-between">
									<span className="text-[0.6rem] font-mono font-bold uppercase tracking-widest text-accent-indigo-light flex items-center gap-1.5">
										<i className="fa-solid fa-chess-knight text-[0.65rem]" />
										Agressor ({scenario.ipPos})
									</span>
									<span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-accent-indigo/15 border border-accent-indigo/30 text-accent-indigo-light">
										{scenario.ipMorph || 'Agressor'}
									</span>
								</div>
								<div className="flex items-baseline justify-between border-y border-white/5 py-2.5">
									<div>
										<span className="text-2xl font-black text-white font-mono tabular-nums">
											{ipRp.toFixed(1)}%
										</span>
										<span className="text-[0.65rem] text-text-dim ml-1.5 font-bold uppercase tracking-widest">RP</span>
									</div>
									<div className="text-right">
										<span className="text-sm font-mono font-bold text-accent-indigo-light tabular-nums">
											{ipBf.toFixed(2)}x
										</span>
										<span className="text-[0.6rem] text-text-dim ml-1 font-bold uppercase tracking-widest">BF</span>
									</div>
								</div>
								<p className="text-[0.72rem] text-text-muted leading-relaxed m-0 font-medium">
									{ipRp < 15
										? 'Vantagem de alavancagem: custo marginal reduzido por ficha perdida permite pressionar sem risco existencial.'
										: 'Auto-restrição: RP elevado penaliza overbets e impõe potes controlados para evitar ruína.'}
								</p>
							</div>

							{/* Defensor (OOP) */}
							<div className="p-4 sm:p-5 rounded-2xl bg-slate-950/40 border border-accent-rose/25 flex flex-col justify-between gap-3 relative overflow-hidden transition-all hover:bg-slate-950/60">
								<div className="flex items-center justify-between">
									<span className="text-[0.6rem] font-mono font-bold uppercase tracking-widest text-accent-rose-light flex items-center gap-1.5">
										<i className="fa-solid fa-shield-halved text-[0.65rem]" />
										Defensor ({scenario.oopPos})
									</span>
									<span className="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-accent-rose/15 border border-accent-rose/30 text-accent-rose-light">
										{scenario.oopMorph || 'Defensor'}
									</span>
								</div>
								<div className="flex items-baseline justify-between border-y border-white/5 py-2.5">
									<div>
										<span className="text-2xl font-black text-white font-mono tabular-nums">
											{oopRp.toFixed(1)}%
										</span>
										<span className="text-[0.65rem] text-text-dim ml-1.5 font-bold uppercase tracking-widest">RP</span>
									</div>
									<div className="text-right">
										<span className="text-sm font-mono font-bold text-accent-rose-light tabular-nums">
											{oopBf.toFixed(2)}x
										</span>
										<span className="text-[0.6rem] text-text-dim ml-1 font-bold uppercase tracking-widest">BF</span>
									</div>
								</div>
								<p className="text-[0.72rem] text-text-muted leading-relaxed m-0 font-medium">
									{oopRp > 25
										? 'Paralisia estrutural: custo catastrófico da colisão all-in obriga o abandono do MDF tradicional em favor de overfold seletivo.'
										: 'Defesa resiliente: RP controlado permite defender ranges mais amplos sem comprometimento terminal.'}
								</p>
							</div>
						</div>

						{/* Diagnóstico de Assimetria Direcional */}
						<div className="p-4 rounded-2xl bg-slate-950/60 border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className={`w-9 h-9 rounded-xl flex items-center justify-center border text-sm ${asymmetryBadgeStyle}`}>
									<i className={`fa-solid ${asymmetryIcon}`} />
								</div>
								<div>
									<p className="text-[0.58rem] font-mono font-bold uppercase tracking-wider text-text-dim m-0">
										Vetor de Assimetria de Risco · ΔRP (IP → OOP)
									</p>
									<p className="text-xs sm:text-sm font-black text-white m-0">
										{asymmetryText}
									</p>
								</div>
							</div>
							<div className="text-left sm:text-right">
								<span className="text-[0.6rem] font-mono uppercase tracking-wider text-text-dim block">
									Veredito Estrutural
								</span>
								<span className="text-xs font-mono font-bold text-accent-indigo-light">
									{scenario.verdict}
								</span>
							</div>
						</div>
					</section>
				)}

				{/* ─── LENTE 2: DISSIPAÇÃO DE RISCO (SPR & FREQUÊNCIAS NASH) ─── */}
				{(activeLens === 'spr' || activeLens === 'all') && (
					<section className="flex flex-col gap-5 animate-sota-in">
						{/* Tabela de Diluição de SPR */}
						<div className="p-5 bg-slate-950/50 border border-white/8 rounded-2xl flex flex-col gap-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<i className="fa-solid fa-water text-accent-sky text-sm" />
									<h4 className="text-xs font-black text-white uppercase tracking-wider m-0">
										Matriz de Dissipação de Risco (SPR)
									</h4>
								</div>
								<span className="text-[0.58rem] font-mono text-text-dim uppercase tracking-widest">
									Amortecimento Termodinâmico
								</span>
							</div>

							<div className="overflow-x-auto no-scrollbar rounded-xl border border-white/5">
								<table className="w-full text-left text-xs font-mono tabular-nums">
									<thead className="bg-white/5 text-text-dim uppercase tracking-wider text-[0.6rem]">
										<tr>
											<th className="p-3 pl-4 font-bold">Street</th>
											<th className="p-3 font-bold">Pote (BB)</th>
											<th className="p-3 font-bold text-center">Stack Res.</th>
											<th className="p-3 font-bold text-center">Fator SPR</th>
											<th className="p-3 pr-4 font-bold text-right">RP Residual</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/5 text-text-muted">
										{activeSprData.map((stage) => {
											const investido = Math.max(0, (stage.potSize - preflopPot) / 2);
											const residual = Math.max(0, effStack - investido);
											const sprValue = stage.potSize > 0 ? residual / stage.potSize : Infinity;
											const sprText = sprValue === Infinity ? '∞' : sprValue.toFixed(1);
											let sprColor = 'text-accent-rose';
											if (sprValue >= 4) {
												sprColor = 'text-accent-emerald';
											} else if (sprValue >= 1.5) {
												sprColor = 'text-accent-amber';
											}

											return (
												<tr key={stage.name} className="hover:bg-white/5 transition-colors">
													<td className="p-3 pl-4 font-bold text-accent-sky uppercase tracking-wider">
														{stage.name}
													</td>
													<td className="p-3 font-black text-white">
														{stage.potSize.toFixed(1)}
													</td>
													<td className="p-3 text-center text-text-dim">
														{residual.toFixed(1)}
													</td>
													<td className={`p-3 text-center font-black ${sprColor}`}>
														{sprText}
													</td>
													<td className="p-3 pr-4 text-right font-black text-white">
														{stage.rpValue.toFixed(1)}%
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
							<p className="text-[0.68rem] text-text-dim leading-relaxed m-0 italic">
								O SPR amortece a gravidade do ICM à medida que o pote se agiganta em relação aos stacks remanescentes.
							</p>
						</div>

						{/* Blueprint de Frequências Nash por Street */}
						{scenario.defaultStreetFreqs && (
							<div className="p-5 bg-slate-950/50 border border-white/8 rounded-2xl flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2.5">
										<i className="fa-solid fa-chart-column text-accent-emerald text-sm" />
										<h4 className="text-xs font-black text-white uppercase tracking-wider m-0">
											Blueprint de Equilíbrio Nash (Ações por Street)
										</h4>
									</div>
									<span className="text-[0.58rem] font-mono text-text-dim uppercase tracking-widest">
										Frequências Canônicas
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									{(['flop', 'turn', 'river'] as const).map((streetKey) => {
										const freqs = scenario.defaultStreetFreqs[streetKey];
										if (!freqs) return null;

										return (
											<div key={streetKey} className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-2.5">
												<div className="flex items-center justify-between border-b border-white/5 pb-1.5">
													<span className="text-[0.65rem] font-black uppercase tracking-widest text-accent-emerald">
														{streetKey.toUpperCase()}
													</span>
													<span className="text-[0.55rem] font-mono text-text-darker uppercase">
														IP vs OOP
													</span>
												</div>

												{/* Agressor (IP) */}
												<div className="space-y-1">
													<div className="flex justify-between text-[0.58rem] font-mono text-text-dim">
														<span>IP Check: {freqs.ip_check}%</span>
														<span>B.Small: {freqs.ip_bet_small}%</span>
														<span>B.Large: {freqs.ip_bet_large}%</span>
													</div>
													<div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
														<div style={{ width: `${freqs.ip_check}%` }} className="bg-slate-500 transition-all" title={`Check ${freqs.ip_check}%`} />
														<div style={{ width: `${freqs.ip_bet_small}%` }} className="bg-accent-indigo transition-all" title={`Bet Small ${freqs.ip_bet_small}%`} />
														<div style={{ width: `${freqs.ip_bet_large}%` }} className="bg-accent-rose transition-all" title={`Bet Large ${freqs.ip_bet_large}%`} />
													</div>
												</div>

												{/* Defensor (OOP) */}
												<div className="space-y-1">
													<div className="flex justify-between text-[0.58rem] font-mono text-text-dim">
														<span>OOP Call: {freqs.oop_call}%</span>
														<span>Fold: {freqs.oop_fold}%</span>
														<span>Raise: {freqs.oop_raise}%</span>
													</div>
													<div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
														<div style={{ width: `${freqs.oop_call}%` }} className="bg-accent-emerald transition-all" title={`Call ${freqs.oop_call}%`} />
														<div style={{ width: `${freqs.oop_fold}%` }} className="bg-rose-950 transition-all" title={`Fold ${freqs.oop_fold}%`} />
														<div style={{ width: `${freqs.oop_raise}%` }} className="bg-accent-amber transition-all" title={`Raise ${freqs.oop_raise}%`} />
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</section>
				)}

				{/* ─── LENTE 3: VETORES DE EXPLOIT & DIRETRIZES ─── */}
				{(activeLens === 'exploit' || activeLens === 'all') && (
					<section className="flex flex-col gap-4 animate-sota-in">
						<div className="flex items-center justify-between pb-2 border-b border-white/5">
							<div className="flex items-center gap-2">
								<i className="fa-solid fa-crosshairs text-accent-amber text-sm" />
								<h4 className="text-xs font-black text-white uppercase tracking-wider m-0">
									Diretrizes Estratégicas & Vetores de Exploit
								</h4>
							</div>
							<span className="text-[0.58rem] font-mono text-text-dim uppercase tracking-widest">
								{scenario.exploit.length} Vetores Acionáveis
							</span>
						</div>

						<div className="grid grid-cols-1 gap-3">
							{scenario.exploit.map((rule, idx) => (
								<div
									key={rule.slice(0, 20)}
									className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-accent-amber/20 hover:border-accent-amber/40 transition-all flex items-start gap-4 relative overflow-hidden group"
								>
									<div className="w-8 h-8 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center shrink-0 text-accent-amber text-xs font-black font-mono">
										0{idx + 1}
									</div>
									<div className="flex-1">
										<span className="text-[0.6rem] font-mono font-bold uppercase tracking-widest text-accent-amber-light block mb-1">
											Vetor Tático 0{idx + 1}
										</span>
										<p className="text-xs sm:text-sm text-text-bright leading-relaxed m-0 font-medium">
											{rule}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="p-4 rounded-xl bg-black/30 border border-white/5 text-[0.72rem] text-text-muted leading-relaxed flex items-center gap-3">
							<i className="fa-solid fa-lightbulb text-accent-amber text-base shrink-0" />
							<span>
								<strong>Princípio PMev:</strong> No poker de torneios, a exploração não é adivinhação; é a punição matemática de oponentes que não ajustam seus ranges à assimetria gravitacional do ICM.
							</span>
						</div>
					</section>
				)}

				{/* ─── LENTE 4: CHECKPOINT DIDÁTICO (QUIZ INTERATIVO) ─── */}
				{(activeLens === 'quiz' || activeLens === 'all') && scenario.quiz && (
					<section className="flex flex-col gap-4 animate-sota-in">
						<div className="p-5 sm:p-6 bg-slate-950/60 border border-accent-indigo/30 rounded-2xl shadow-xl flex flex-col gap-5 relative overflow-hidden">
							<div className="flex items-center justify-between border-b border-white/8 pb-3">
								<div className="flex items-center gap-2.5">
									<i className="fa-solid fa-graduation-cap text-accent-indigo text-sm" />
									<h4 className="text-xs font-black text-white uppercase tracking-wider m-0">
										Laboratório de Retenção Teórica
									</h4>
								</div>
								<span className="text-[0.58rem] font-mono text-accent-indigo-light uppercase tracking-widest">
									Quiz Interativo
								</span>
							</div>

							{/* Pergunta */}
							<div>
								<span className="text-[0.6rem] font-mono font-bold uppercase tracking-wider text-text-dim block mb-1.5">
									Desafio Conceitual
								</span>
								<p className="text-sm sm:text-base font-bold text-white leading-snug m-0">
									{scenario.quiz.question}
								</p>
							</div>

							{/* Alternativas */}
							<div className="grid grid-cols-1 gap-2.5">
								{scenario.quiz.options.map((option, index) => {
									const optId = option.id || String.fromCodePoint(65 + index);
									const isSelected = selectedOptionId === optId;
									let buttonStyle = 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white';

									if (showFeedback) {
										if (option.isCorrect) {
											buttonStyle = 'bg-accent-emerald/20 border-accent-emerald text-accent-emerald font-bold';
										} else if (isSelected && !option.isCorrect) {
											buttonStyle = 'bg-accent-rose/20 border-accent-rose text-accent-rose font-bold';
										} else {
											buttonStyle = 'opacity-40 bg-white/5 border-white/5 text-text-dim';
										}
									} else if (isSelected) {
										buttonStyle = 'bg-accent-indigo/25 border-accent-indigo text-white font-bold';
									}

									return (
										<button
											key={optId}
											type="button"
											disabled={showFeedback}
											onClick={() => {
												setSelectedOptionId(optId);
												setShowFeedback(true);
											}}
											className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${buttonStyle}`}
										>
											<div className="flex items-center gap-3">
												<span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono font-black text-xs shrink-0">
													{optId}
												</span>
												<span className="leading-snug">{option.text}</span>
											</div>
											{showFeedback && option.isCorrect && (
												<i className="fa-solid fa-circle-check text-accent-emerald text-base shrink-0" />
											)}
											{showFeedback && isSelected && !option.isCorrect && (
												<i className="fa-solid fa-circle-xmark text-accent-rose text-base shrink-0" />
											)}
										</button>
									);
								})}
							</div>

							{/* Feedback Didático e Explicação */}
							{showFeedback && (
								<div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-3 animate-sota-in">
									<div className="flex items-center justify-between">
										<span className="text-[0.65rem] font-mono font-bold uppercase tracking-widest text-accent-indigo-light flex items-center gap-2">
											<i className="fa-solid fa-brain" />
											<span>Fundamentação Teórica</span>
										</span>
										<button
											type="button"
											onClick={() => {
												setSelectedOptionId(null);
												setShowFeedback(false);
											}}
											className="text-[0.62rem] font-mono font-bold text-text-dim hover:text-white underline cursor-pointer"
										>
											Tentar Novamente
										</button>
									</div>
									<p className="text-xs sm:text-[0.82rem] text-text-muted leading-relaxed m-0 font-medium">
										{scenario.quiz.explanation}
									</p>
								</div>
							)}
						</div>
					</section>
				)}

			</div>
		</div>
	);
}
