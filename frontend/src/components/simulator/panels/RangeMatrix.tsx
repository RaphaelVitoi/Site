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
		<div className="glass-panel flex flex-col gap-6 p-5 sm:p-7 rounded-3xl bg-slate-950/60 backdrop-blur-2xl border border-white/8 shadow-2xl relative overflow-hidden transition-all duration-300 group/matrix">
			<div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-emerald/5 blur-[120px] rounded-full pointer-events-none" />
			<div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/5 blur-[120px] rounded-full pointer-events-none" />

			{/* ═══ CABEÇALHO PRINCIPAL E CONTROLES ═══ */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/8">
				<div className="space-y-1">
					<div className="flex items-center gap-2.5">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_12px_var(--color-accent-emerald)] animate-pulse" />
						<h3 className="text-sm font-black text-white uppercase tracking-[0.2em] m-0">
							Matriz de Defesa 13&times;13 (169 Mãos Hold&apos;em)
						</h3>
					</div>
					<p className="m-0 text-[0.62rem] text-text-dim font-mono uppercase tracking-wider">
						ReqEq = <span className="text-accent-amber font-bold">{summary.requiredEquity}%</span> &middot; Bubble Factor = <span className="text-accent-indigo font-bold">{summary.bubbleFactor}&times;</span> &middot; Risk Premium = <span className="text-white font-bold">{activeRp.toFixed(1)}%</span>
					</p>
				</div>

				{/* Alternadores de Perspectiva e Modo de Exibição */}
				<div className="flex flex-wrap items-center gap-3">
					{/* Perspectiva IP / OOP */}
					<div className="flex rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 p-1 shadow-inner">
						{(['ip', 'oop'] as Perspective[]).map((p) => {
							const isActive = perspective === p;
							const val = p === 'ip' ? ipRp : oopRp;
							return (
								<button
									key={p}
									type="button"
									onClick={() => setPerspective(p)}
									className={`px-3 py-1.5 text-[0.58rem] font-mono font-black uppercase tracking-wider cursor-pointer transition-all duration-300 rounded-lg ${getPerspectiveButtonClass(
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
					<div className="flex rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 p-1 shadow-inner">
						{(['MARGIN', 'EQUITY', 'STATUS', 'FE_REQ'] as CellDisplayMode[]).map((mode) => {
							const isActive = displayMode === mode;
							return (
								<button
									key={mode}
									type="button"
									onClick={() => setDisplayMode(mode)}
									className={`px-2.5 py-1.5 text-[0.56rem] font-black uppercase tracking-wider cursor-pointer transition-all rounded-lg ${
										isActive
											? 'bg-white/10 text-white border border-white/20 shadow-sm'
											: 'text-text-dim hover:text-text-muted'
									}`}
								>
									{getCellDisplayModeLabel(mode)}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* ═══ BARRA DE PERFIL DE SHOVE DO VILÃO ═══ */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5">
				<span className="text-[0.6rem] font-mono font-black uppercase tracking-wider text-text-dim flex items-center gap-2">
					<i className="fa-solid fa-crosshairs text-accent-amber" /> Range de Shove do Vilão:
				</span>
				<div className="flex flex-wrap gap-1.5">
					{Object.entries(SHOVE_PROFILES).map(([key, prof]) => {
						const isActive = shoveProfile === key;
						return (
							<button
								key={key}
								type="button"
								onClick={() => setShoveProfile(key as ShoveProfile)}
								className={`px-2.5 py-1 rounded-lg text-[0.58rem] font-bold uppercase tracking-wider transition-all cursor-pointer ${
									isActive
										? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
										: 'bg-white/5 text-text-dim hover:text-white border border-transparent'
								}`}
							>
								{prof.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* ═══ ESTATÍSTICAS SUMÁRIAS DE DEFESA (4 CARDS) ═══ */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div className="bg-emerald-950/25 border border-emerald-500/20 p-3.5 rounded-2xl flex flex-col">
					<span className="text-[0.52rem] font-mono font-black uppercase tracking-wider text-emerald-400 mb-0.5">
						Defesa Total (Call)
					</span>
					<div className="flex items-baseline gap-1.5">
						<span className="font-mono text-lg font-black text-white">
							{summary.callCombos}
						</span>
						<span className="text-[0.68rem] font-mono font-bold text-emerald-400">
							({summary.callPercentage}%)
						</span>
					</div>
					<span className="text-[0.48rem] text-slate-400 mt-0.5 font-mono">
						{summary.coreCallCombos} core + {summary.marginalCallCombos} marginais
					</span>
				</div>

				<div className="bg-rose-950/25 border border-rose-500/20 p-3.5 rounded-2xl flex flex-col">
					<span className="text-[0.52rem] font-mono font-black uppercase tracking-wider text-rose-400 mb-0.5">
						Descarte (Fold)
					</span>
					<div className="flex items-baseline gap-1.5">
						<span className="font-mono text-lg font-black text-white">
							{summary.foldCombos}
						</span>
						<span className="text-[0.68rem] font-mono font-bold text-rose-400">
							({summary.foldPercentage}%)
						</span>
					</div>
					<span className="text-[0.48rem] text-slate-400 mt-0.5 font-mono">
						{summary.deathFoldCombos} death + {summary.riskyFoldCombos} risco ICM
					</span>
				</div>

				<div className="bg-slate-900/40 border border-white/5 p-3.5 rounded-2xl flex flex-col">
					<span className="text-[0.52rem] font-mono font-black uppercase tracking-wider text-text-dim mb-0.5">
						Equidade Requerida
					</span>
					<span className="font-mono text-lg font-black text-accent-amber">
						{summary.requiredEquity}%
					</span>
					<span className="text-[0.48rem] text-text-dim mt-0.5 font-mono">
						Threshold de Break-Even
					</span>
				</div>

				<div className="bg-slate-900/40 border border-white/5 p-3.5 rounded-2xl flex flex-col">
					<span className="text-[0.52rem] font-mono font-black uppercase tracking-wider text-text-dim mb-0.5">
						Bubble Factor
					</span>
					<span className="font-mono text-lg font-black text-accent-indigo">
						{summary.bubbleFactor}&times;
					</span>
					<span className="text-[0.48rem] text-text-dim mt-0.5 font-mono">
						Assimetria Ganho / Perda
					</span>
				</div>
			</div>

			{/* ═══ GRADE 13x13 COMPLETA, ANCORADA E 100% ESTÁVEL ═══ */}
			<div
				className="w-full bg-slate-950/80 p-2.5 sm:p-4 rounded-3xl border border-white/8 shadow-2xl backdrop-blur-3xl overflow-hidden select-none"
				onMouseLeave={() => setHoveredHand(null)}
			>
				<div className="w-full grid grid-cols-13 gap-0.5 sm:gap-1">
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
								const isPinned = selectedHand === hand;
								const isHovered = hoveredHand === hand;
								const cellStyle = getCellColorAndBorder(detail);
								const feReqCell = calculateReverseRequiredFoldEquity(15, 20, detail.equity / 100, 15);

								return (
									<button
										type="button"
										key={hand}
										onClick={() => setSelectedHand(hand)}
										onMouseEnter={() => setHoveredHand(hand)}
										className={`relative aspect-square flex flex-col items-center justify-center font-mono font-black transition-colors duration-150 cursor-pointer rounded-md sm:rounded-lg border ${cellStyle} ${
											isPinned
												? 'ring-2 ring-accent-amber border-amber-300 brightness-125 z-20 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
												: isHovered
													? 'ring-1.5 ring-white border-white brightness-125 z-10 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
													: 'hover:border-white/50 hover:brightness-110'
										}`}
										title={`${hand}: Eq ${detail.equity}% | Req ${detail.requiredEquity}% | FE_req ${(feReqCell * 100).toFixed(0)}%`}
									>
										<span className="text-[0.52rem] sm:text-[0.68rem] md:text-[0.74rem] leading-none">{hand}</span>
										{displayMode === 'MARGIN' && (
											<span
												className={`text-[0.38rem] sm:text-[0.48rem] md:text-[0.52rem] font-bold mt-0.5 leading-none ${
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
											<span className="text-[0.38rem] sm:text-[0.48rem] md:text-[0.52rem] font-bold mt-0.5 leading-none text-slate-300">
												{detail.equity.toFixed(0)}%
											</span>
										)}
										{displayMode === 'STATUS' && (
											<span className="text-[0.34rem] sm:text-[0.44rem] md:text-[0.48rem] font-bold mt-0.5 leading-none opacity-80">
												{detail.margin >= 0 ? 'CALL' : 'FOLD'}
											</span>
										)}
										{displayMode === 'FE_REQ' && (
											<span
												className={`text-[0.34rem] sm:text-[0.44rem] md:text-[0.48rem] font-mono font-bold mt-0.5 leading-none ${
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

			{/* ═══ PAINEL INSPETOR DETALHADO DA MÃO SELECIONADA (INFERIOR COM ALTURA ESTÁVEL) ═══ */}
			<div className="bg-slate-950/60 border border-white/8 p-5 sm:p-6 rounded-3xl flex flex-col gap-4 shadow-inner">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
					<div className="flex items-center gap-3">
						<div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-lg text-white shadow-inner">
							{inspectedDetail.hand}
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-[0.58rem] font-mono font-black uppercase tracking-wider text-text-dim block">
									{getHandTypeDescription(inspectedDetail.isPair, inspectedDetail.isSuited)}
								</span>
								{hoveredHand && hoveredHand !== selectedHand && (
									<span className="text-[0.48rem] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/10">
										Preview
									</span>
								)}
							</div>
							<span className="text-xs font-mono font-bold text-slate-300">
								{inspectedDetail.combos} combinações
							</span>
						</div>
					</div>

					{/* Badge do Veredito */}
					<div
						className={`px-4 py-2 rounded-xl border text-center font-mono text-[0.65rem] font-black tracking-wider shadow-sm transition-colors ${
							getVerdictBadge(inspectedDetail.verdict).color
						}`}
					>
						{getVerdictBadge(inspectedDetail.verdict).text}
					</div>
				</div>

				{/* Grade de 4 Métricas Chave */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
					<div className="flex flex-col bg-black/40 p-3 rounded-xl border border-white/5">
						<span className="text-[0.5rem] text-text-dim uppercase tracking-wider mb-0.5">
							Equidade vs Shove
						</span>
						<span className="text-sm font-black text-white">
							{inspectedDetail.equity}%
						</span>
					</div>

					<div className="flex flex-col bg-black/40 p-3 rounded-xl border border-white/5">
						<span className="text-[0.5rem] text-text-dim uppercase tracking-wider mb-0.5">
							Equidade Requerida
						</span>
						<span className="text-sm font-black text-accent-amber">
							{inspectedDetail.requiredEquity}%
						</span>
					</div>

					<div className="flex flex-col bg-black/40 p-3 rounded-xl border border-white/5">
						<span className="text-[0.5rem] text-text-dim uppercase tracking-wider mb-0.5">
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

					<div className="flex flex-col bg-black/40 p-3 rounded-xl border border-white/5">
						<span className="text-[0.5rem] text-text-dim uppercase tracking-wider mb-0.5">
							Fold Equity Reversa ($FE_{'{req}'}$)
						</span>
						<span className="text-sm font-black text-accent-sky">
							{calculateReverseRequiredFoldEquity(15, 20, inspectedDetail.equity / 100, 15) === 0
								? '0.0% (Valor Puro)'
								: `${(calculateReverseRequiredFoldEquity(15, 20, inspectedDetail.equity / 100, 15) * 100).toFixed(1)}%`}
						</span>
					</div>
				</div>

				{/* Barra de Progresso Visual de Equidade vs Limiar */}
				<div className="space-y-1.5 pt-1">
					<div className="flex justify-between text-[0.52rem] font-mono font-bold uppercase text-text-dim">
						<span>0% (Fold)</span>
						<span className="text-accent-amber">
							Threshold Requerido: {inspectedDetail.requiredEquity}%
						</span>
						<span>100% (Pure Value)</span>
					</div>
					<div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
						{/* Indicador de Required Equity */}
						<div
							className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_6px_#fbbf24]"
							style={{ left: `${inspectedDetail.requiredEquity}%` }}
						/>
						{/* Barra de Equidade da Mão */}
						<div
							className={`h-full transition-all duration-300 ${
								inspectedDetail.margin >= 0 ? 'bg-linear-to-r from-emerald-600 to-emerald-400' : 'bg-linear-to-r from-rose-600 to-rose-400'
							}`}
							style={{ width: `${inspectedDetail.equity}%` }}
						/>
					</div>
				</div>

				<div className="min-h-[58px] flex items-center bg-black/20 p-3 rounded-xl border border-white/5">
					<p className="text-[0.65rem] text-text-muted leading-relaxed font-sans m-0 italic">
						{inspectedDetail.margin >= 0
							? `A equidade de ${inspectedDetail.hand} (${inspectedDetail.equity}%) supera o limiar de sobrevivência ICM (${inspectedDetail.requiredEquity}%), gerando call de expectativa positiva.`
							: `A equidade de ${inspectedDetail.hand} (${inspectedDetail.equity}%) é inferior à barreira de risco ICM (${inspectedDetail.requiredEquity}%). Dar call resulta em perda massiva de EV em dinheiro real.`}
					</p>
				</div>
			</div>
		</div>
	);
}
