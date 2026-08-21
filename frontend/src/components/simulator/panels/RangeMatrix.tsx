'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid) v7.0 GOLD
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar a física de defesa e push/fold de todas as 169 mãos Texas Hold'em
 *       com cálculo exato de Equidade Requerida e Margem de Lucro baseadas no Bubble Factor.
 * BINDING: [src/lib/holdemEquities.ts, src/components/simulator/BubbleFactorMatrix.tsx]
 */

import React, { useMemo, useState } from 'react';
import {
	computeRangeMatrixSummary,
	evaluateHandDetail,
	RANKS,
	SHOVE_PROFILES,
	type HandEquityDetail,
	type HandVerdict,
	type ShoveProfile,
} from '@/lib/holdemEquities';

import { calculateReverseRequiredFoldEquity } from '@/lib/dynamicFoldEquityEngine';

interface RangeMatrixProps {
	ipRp: number;
	oopRp: number;
	scenarioId?: string;
}

type Perspective = 'ip' | 'oop';
type CellDisplayMode = 'MARGIN' | 'EQUITY' | 'STATUS' | 'FE_REQ';

function getPerspectiveButtonClass(isActive: boolean, p: Perspective): string {
	if (!isActive) return 'text-text-muted hover:text-white';
	if (p === 'ip') return 'bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40 shadow-lg shadow-indigo-500/10';
	return 'bg-accent-rose/20 text-accent-rose border border-accent-rose/40 shadow-lg shadow-rose-500/10';
}

function getCellDisplayModeLabel(mode: CellDisplayMode): string {
	switch (mode) {
		case 'MARGIN':
			return 'Margem \u0394';
		case 'EQUITY':
			return 'Equidade %';
		case 'STATUS':
			return 'Veredito';
		case 'FE_REQ':
			return 'Fold Req %';
	}
}

function getHandTypeDescription(isPair: boolean, isSuited: boolean): string {
	if (isPair) return 'Par na Mão';
	if (isSuited) return 'Naipadas (Suited)';
	return 'Desconectadas (Offsuit)';
}

export default function RangeMatrix({
	ipRp,
	oopRp,
	scenarioId: _scenarioId = 'mtt-final-table',
}: Readonly<RangeMatrixProps>) {
	const [perspective, setPerspective] = useState<Perspective>('ip');
	const [shoveProfile, setShoveProfile] = useState<ShoveProfile>('STANDARD_25');
	const [displayMode, setDisplayMode] = useState<CellDisplayMode>('MARGIN');
	const [selectedHand, setSelectedHand] = useState<string>('AKs');
	const [hoveredHand, setHoveredHand] = useState<string | null>(null);

	const activeRp = perspective === 'ip' ? ipRp : oopRp;

	const summary = useMemo(() => {
		return computeRangeMatrixSummary(shoveProfile, activeRp);
	}, [shoveProfile, activeRp]);

	const activeInspectorHand = hoveredHand || selectedHand;

	const inspectedDetail: HandEquityDetail = useMemo(() => {
		return evaluateHandDetail(activeInspectorHand, shoveProfile, activeRp);
	}, [activeInspectorHand, shoveProfile, activeRp]);

	const getCellColorAndBorder = (detail: HandEquityDetail, mode: CellDisplayMode = displayMode) => {
		if (mode === 'FE_REQ') {
			const feReq = calculateReverseRequiredFoldEquity(15, 20, detail.equity / 100, 15);
			if (feReq === 0) {
				return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-800/90 hover:border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
			}
			if (feReq <= 0.30) {
				return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-800/90 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
			}
			if (feReq <= 0.50) {
				return 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-800/90 hover:border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
			}
			return 'bg-slate-950/80 text-slate-500 border-white/5 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40';
		}

		switch (detail.verdict) {
			case 'CORE_CALL':
				return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-800/90 hover:border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
			case 'MARGINAL_CALL':
				return 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-800/90 hover:border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
			case 'RISKY_FOLD':
				return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/90 hover:border-indigo-300';
			case 'DEATH_FOLD':
			default:
				return 'bg-slate-950/80 text-slate-500 border-white/5 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40';
		}
	};

	const getVerdictBadge = (verdict: HandVerdict) => {
		switch (verdict) {
			case 'CORE_CALL':
				return {
					text: 'CALL LUCRATIVO (+EV)',
					color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
				};
			case 'MARGINAL_CALL':
				return {
					text: 'CALL MARGINAL (Break-Even)',
					color: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
				};
			case 'RISKY_FOLD':
				return {
					text: 'FOLD POR ICM (Dano Estrutural)',
					color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
				};
			case 'DEATH_FOLD':
				return {
					text: 'FOLD CRÍTICO (Death Zone)',
					color: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
				};
		}
	};

	return (
		<div className="glass-panel flex flex-col gap-8 p-6 sm:p-8 lg:p-10 rounded-4xl bg-bg-panel/90 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-emerald/5 blur-[120px] rounded-full pointer-events-none" />
			<div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/5 blur-[120px] rounded-full pointer-events-none" />

			{/* Cabeçalho Principal e Controles */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-white/5">
				<div>
					<div className="flex items-center gap-3">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_12px_var(--accent-emerald)] animate-pulse" />
						<h3 className="text-sm font-black text-white uppercase tracking-[0.25em] m-0">
							Matriz de Defesa 13&times;13 (169 Mãos Hold&apos;em)
						</h3>
					</div>
					<p className="m-0 mt-1 text-[0.7rem] text-text-muted font-mono uppercase tracking-wider">
						Equidade Requerida $\text&#123;ReqEq&#125; = {summary.requiredEquity}\%$ &middot; $BF = {summary.bubbleFactor}\times$ &middot; $RP = {activeRp.toFixed(1)}\%$
					</p>
				</div>

				{/* Alternadores de Perspectiva e Modo de Exibição */}
				<div className="flex flex-wrap items-center gap-4">
					{/* Perspectiva IP / OOP */}
					<div className="flex rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-1 shadow-inner">
						{(['ip', 'oop'] as Perspective[]).map((p) => {
							const isActive = perspective === p;
							const val = p === 'ip' ? ipRp : oopRp;
							return (
								<button
									key={p}
									type="button"
									onClick={() => setPerspective(p)}
									className={`px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 rounded-xl ${getPerspectiveButtonClass(
										isActive,
										p,
									)}`}
								>
									{p.toUpperCase()}: {val.toFixed(1)}%
								</button>
							);
						})}
					</div>

					{/* Modo de Exibição das Células */}
					<div className="flex rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-1 shadow-inner">
						{(['MARGIN', 'EQUITY', 'STATUS', 'FE_REQ'] as CellDisplayMode[]).map((mode) => {
							const isActive = displayMode === mode;
							return (
								<button
									key={mode}
									type="button"
									onClick={() => setDisplayMode(mode)}
									className={`px-3 py-2 text-[0.6rem] font-black uppercase tracking-wider cursor-pointer transition-all rounded-xl ${
										isActive
											? 'bg-white/10 text-white border border-white/20'
											: 'text-text-muted hover:text-white'
									}`}
								>
									{getCellDisplayModeLabel(mode)}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Barra de Perfil de Shove do Vilão */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/30 p-4 rounded-2xl border border-white/5">
				<span className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
					<i className="fa-solid fa-crosshairs text-accent-amber" /> Range de Shove do Vilão:
				</span>
				<div className="flex flex-wrap gap-2">
					{Object.entries(SHOVE_PROFILES).map(([key, prof]) => {
						const isActive = shoveProfile === key;
						return (
							<button
								key={key}
								type="button"
								onClick={() => setShoveProfile(key as ShoveProfile)}
								className={`px-3 py-1.5 rounded-xl text-[0.6rem] font-black uppercase tracking-wider transition-all cursor-pointer ${
									isActive
										? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
										: 'bg-white/5 text-text-muted hover:text-white border border-transparent'
								}`}
							>
								{prof.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* Estatísticas Sumárias de Defesa */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-2xl flex flex-col">
					<span className="text-[0.6rem] font-black uppercase tracking-widest text-emerald-400 mb-1">
						Defesa Total (Call)
					</span>
					<div className="flex items-baseline gap-2">
						<span className="font-mono text-xl font-black text-white">
							{summary.callCombos}
						</span>
						<span className="text-xs font-mono font-bold text-emerald-400">
							({summary.callPercentage}%)
						</span>
					</div>
					<span className="text-[0.55rem] text-slate-400 mt-1 font-mono">
						{summary.coreCallCombos} core + {summary.marginalCallCombos} marginais
					</span>
				</div>

				<div className="bg-rose-950/30 border border-rose-500/20 p-4 rounded-2xl flex flex-col">
					<span className="text-[0.6rem] font-black uppercase tracking-widest text-rose-400 mb-1">
						Descarte (Fold)
					</span>
					<div className="flex items-baseline gap-2">
						<span className="font-mono text-xl font-black text-white">
							{summary.foldCombos}
						</span>
						<span className="text-xs font-mono font-bold text-rose-400">
							({summary.foldPercentage}%)
						</span>
					</div>
					<span className="text-[0.55rem] text-slate-400 mt-1 font-mono">
						{summary.deathFoldCombos} death + {summary.riskyFoldCombos} risco ICM
					</span>
				</div>

				<div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col">
					<span className="text-[0.6rem] font-black uppercase tracking-widest text-text-muted mb-1">
						Equidade Requerida
					</span>
					<span className="font-mono text-xl font-black text-accent-amber">
						{summary.requiredEquity}%
					</span>
					<span className="text-[0.55rem] text-text-muted mt-1 font-mono">
						Threshold de Break-Even ICM
					</span>
				</div>

				<div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col">
					<span className="text-[0.6rem] font-black uppercase tracking-widest text-text-muted mb-1">
						Bubble Factor
					</span>
					<span className="font-mono text-xl font-black text-accent-indigo-light">
						{summary.bubbleFactor}&times;
					</span>
					<span className="text-[0.55rem] text-text-muted mt-1 font-mono">
						Assimetria Ganho / Perda
					</span>
				</div>
			</div>

			{/* Layout Central: Grade 13x13 e Painel Inspetor Lateral */}
			<div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 items-start">
				{/* Grade 13x13 */}
				<div className="flex justify-center overflow-x-auto pb-4">
					<div className="min-w-160 max-w-3xl w-full grid grid-cols-13 gap-1 bg-slate-950/90 p-3.5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl">
						{RANKS.map((r1, i) => (
							<React.Fragment key={`row-${r1}`}>
								{RANKS.map((r2, j) => {
									const isPair = i === j;
									const isSuited = j > i;
									let hand: string;
									if (isPair) {
										hand = `${r1}${r2}`;
									} else if (isSuited) {
										hand = `${r1}${r2}s`;
									} else {
										hand = `${r2}${r1}o`;
									}

									const detail = evaluateHandDetail(
										hand,
										shoveProfile,
										activeRp
									);
									const isSelected = selectedHand === hand;
									const cellStyle = getCellColorAndBorder(detail);
									const feReqCell = calculateReverseRequiredFoldEquity(15, 20, detail.equity / 100, 15);

									return (
										<button
											type="button"
											key={hand}
											onClick={() => setSelectedHand(hand)}
											onMouseEnter={() => setHoveredHand(hand)}
											onMouseLeave={() => setHoveredHand(null)}
											className={`relative aspect-square flex flex-col items-center justify-center text-[0.62rem] font-mono font-black transition-all duration-150 cursor-pointer rounded-lg border ${cellStyle} ${
												isSelected
													? 'ring-2 ring-white z-20 scale-110 shadow-[0_0_16px_rgba(255,255,255,0.4)]'
													: 'hover:scale-105 hover:z-10'
											}`}
											title={`${hand}: Eq ${detail.equity}% | Req ${detail.requiredEquity}% | FE_req ${(feReqCell * 100).toFixed(0)}%`}
										>
											<span className="leading-none">{hand}</span>
											{displayMode === 'MARGIN' && (
												<span
													className={`text-[0.45rem] font-bold mt-0.5 leading-none ${
														detail.margin >= 0
															? 'text-emerald-300'
															: 'text-rose-400/80'
													}`}
												>
													{detail.margin >= 0 ? '+' : ''}
													{detail.margin.toFixed(0)}%
												</span>
											)}
											{displayMode === 'EQUITY' && (
												<span className="text-[0.45rem] font-bold mt-0.5 leading-none text-slate-300">
													{detail.equity.toFixed(0)}%
												</span>
											)}
											{displayMode === 'STATUS' && (
												<span className="text-[0.42rem] font-bold mt-0.5 leading-none opacity-80">
													{detail.margin >= 0 ? 'CALL' : 'FOLD'}
												</span>
											)}
											{displayMode === 'FE_REQ' && (
												<span
													className={`text-[0.42rem] font-mono font-bold mt-0.5 leading-none ${
														feReqCell === 0
															? 'text-emerald-300'
															: 'text-cyan-300'
													}`}
												>
													{feReqCell === 0
														? '0%'
														: `${(feReqCell * 100).toFixed(0)}%`}
												</span>
											)}
										</button>
									);
								})}
							</React.Fragment>
						))}
					</div>
				</div>

				{/* Inspetor Detalhado da Mão Selecionada */}
				<div className="bg-slate-950/60 border border-white/10 p-6 rounded-3xl flex flex-col gap-6 shadow-inner">
					<div className="flex items-center justify-between border-b border-white/5 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-lg text-white">
								{inspectedDetail.hand}
							</div>
							<div>
								<span className="text-[0.6rem] font-black uppercase tracking-widest text-text-muted block">
									{getHandTypeDescription(inspectedDetail.isPair, inspectedDetail.isSuited)}
								</span>
								<span className="text-xs font-mono font-bold text-slate-300">
									{inspectedDetail.combos} combinações
								</span>
							</div>
						</div>
					</div>

					{/* Badge do Veredito */}
					<div
						className={`p-3 rounded-2xl border text-center font-mono text-[0.68rem] font-black tracking-widest ${
							getVerdictBadge(inspectedDetail.verdict).color
						}`}
					>
						{getVerdictBadge(inspectedDetail.verdict).text}
					</div>

					{/* Métricas de Equidade e Margem */}
					<div className="space-y-4 font-mono">
						<div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
							<span className="text-[0.62rem] text-text-muted uppercase tracking-wider">
								Equidade vs Shove
							</span>
							<span className="text-sm font-black text-white">
								{inspectedDetail.equity}%
							</span>
						</div>

						<div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
							<span className="text-[0.62rem] text-text-muted uppercase tracking-wider">
								Equidade Requerida
							</span>
							<span className="text-sm font-black text-accent-amber">
								{inspectedDetail.requiredEquity}%
							</span>
						</div>

						<div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
							<span className="text-[0.62rem] text-text-muted uppercase tracking-wider">
								Margem de Lucro (&Delta;)
							</span>
							<span
								className={`text-sm font-black ${
									inspectedDetail.margin >= 0
										? 'text-accent-emerald'
										: 'text-accent-rose'
								}`}
							>
								{inspectedDetail.margin >= 0 ? '+' : ''}
								{inspectedDetail.margin.toFixed(1)}%
							</span>
						</div>

						<div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
							<span className="text-[0.62rem] text-text-muted uppercase tracking-wider">
								Fold Equity Reversa ($FE_{'{req}'}$)
							</span>
							<span className="text-sm font-black text-accent-cyan">
								{calculateReverseRequiredFoldEquity(15, 20, inspectedDetail.equity / 100, 15) === 0
									? '0.0% (Valor Puro)'
									: `${(calculateReverseRequiredFoldEquity(15, 20, inspectedDetail.equity / 100, 15) * 100).toFixed(1)}%`}
							</span>
						</div>
					</div>

					{/* Barra de Progresso Visual de Equidade vs Limiar */}
					<div className="space-y-2">
						<div className="flex justify-between text-[0.55rem] font-mono font-bold uppercase text-text-muted">
							<span>0%</span>
							<span className="text-accent-amber">
								Req: {inspectedDetail.requiredEquity}%
							</span>
							<span>100%</span>
						</div>
						<div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
							{/* Indicador de Required Equity */}
							<div
								className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
								style={{ left: `${inspectedDetail.requiredEquity}%` }}
							/>
							{/* Barra de Equidade da Mão */}
							<div
								className={`h-full transition-all duration-300 ${
									inspectedDetail.margin >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
								}`}
								style={{ width: `${inspectedDetail.equity}%` }}
							/>
						</div>
					</div>

					<p className="text-[0.65rem] text-text-muted leading-relaxed font-sans mt-2">
						{inspectedDetail.margin >= 0
							? `A equidade de ${inspectedDetail.hand} (${inspectedDetail.equity}%) supera o limiar de sobrevivência ICM (${inspectedDetail.requiredEquity}%), gerando call de expectativa positiva.`
							: `A equidade de ${inspectedDetail.hand} (${inspectedDetail.equity}%) é inferior à barreira de risco ICM (${inspectedDetail.requiredEquity}%). Dar call resulta em perda massiva de EV em dinheiro real.`}
					</p>
				</div>
			</div>
		</div>
	);
}
