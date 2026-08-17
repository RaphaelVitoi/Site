'use client';

/** @format */

import React, { useCallback, useMemo, useState } from 'react';
import {
	computeBubbleFactorMatrix,
	getPairwiseMatchupDetail,
	TOURNAMENT_PRESETS,
	type BubbleFactorMatrixResult,
	type ICMTournamentPreset,
	type PairwiseMatchupDetail,
} from '../../lib/icmMatrix';
import { UI_I18N } from '../../constants/translations';

type DisplayMode = 'RP' | 'BF' | 'REQ_EQ';

export interface BubbleFactorMatrixProps {
	onSelectMatchup?: (
		heroRp: number,
		villainRp: number,
		heroName: string,
		villainName: string
	) => void;
}

function requireItem<T>(items: readonly T[], index: number, context: string): T {
	const item = items.at(index);
	if (item === undefined) throw new RangeError(`Missing value: ${context}[${index}]`);
	return item;
}

function requireCell(matrix: readonly (readonly number[])[], row: number, column: number, context: string): number {
	return requireItem(requireItem(matrix, row, context), column, `${context}[${row}]`);
}

const DEFAULT_PRESET = requireItem(TOURNAMENT_PRESETS, 1, 'TOURNAMENT_PRESETS');

export const BubbleFactorMatrix: React.FC<BubbleFactorMatrixProps> = ({
	onSelectMatchup,
}) => {
	const [activePreset, setActivePreset] = useState<ICMTournamentPreset>(
		DEFAULT_PRESET
	); // Triton 6-max default
	const [displayMode, setDisplayMode] = useState<DisplayMode>('RP');
	const [selectedCell, setSelectedCell] = useState<{ hero: number; villain: number }>({
		hero: 0,
		villain: 1,
	});

	// Stacks e payouts reativos baseados no preset ativo
	const [stacks, setStacks] = useState<number[]>(() =>
		activePreset.defaultStacks.map((s) => s.chips)
	);
	const [payouts, setPayouts] = useState<number[]>(() => [...activePreset.payouts]);
	const [playerNames, setPlayerNames] = useState<string[]>(() =>
		activePreset.defaultStacks.map((s) => `${s.pos} (${s.name})`)
	);

	const matrixResult: BubbleFactorMatrixResult = useMemo(() => {
		return computeBubbleFactorMatrix(stacks, payouts, playerNames);
	}, [stacks, payouts, playerNames]);

	const matchupDetail: PairwiseMatchupDetail = useMemo(() => {
		const h = Math.min(selectedCell.hero, matrixResult.nPlayers - 1);
		const v = Math.min(selectedCell.villain, matrixResult.nPlayers - 1);
		return getPairwiseMatchupDetail(matrixResult, h, v);
	}, [matrixResult, selectedCell]);

	const handlePresetChange = useCallback(
		(preset: ICMTournamentPreset) => {
			setActivePreset(preset);
			const newStacks = preset.defaultStacks.map((s) => s.chips);
			const newPayouts = [...preset.payouts];
			const newNames = preset.defaultStacks.map((s) => `${s.pos} (${s.name})`);
			setStacks(newStacks);
			setPayouts(newPayouts);
			setPlayerNames(newNames);
			setSelectedCell({ hero: 0, villain: 1 });

			if (onSelectMatchup) {
				const freshMatrix = computeBubbleFactorMatrix(newStacks, newPayouts, newNames);
				const heroRp = requireCell(freshMatrix.rpMatrix, 0, 1, 'rpMatrix');
				const villainRp = requireCell(freshMatrix.rpMatrix, 1, 0, 'rpMatrix');
				onSelectMatchup(
					heroRp,
					villainRp,
					requireItem(newNames, 0, 'playerNames'),
					requireItem(newNames, 1, 'playerNames')
				);
			}
		},
		[onSelectMatchup]
	);

	const handleCellClick = useCallback(
		(i: number, j: number) => {
			if (i === j) return;
			setSelectedCell({ hero: i, villain: j });
			if (onSelectMatchup) {
				const heroRp = requireCell(matrixResult.rpMatrix, i, j, 'rpMatrix');
				const villainRp = requireCell(matrixResult.rpMatrix, j, i, 'rpMatrix');
				onSelectMatchup(
					heroRp,
					villainRp,
					requireItem(matrixResult.playerNames, i, 'playerNames'),
					requireItem(matrixResult.playerNames, j, 'playerNames')
				);
			}
		},
		[matrixResult, onSelectMatchup]
	);

	const handleInjectClick = useCallback(() => {
		if (onSelectMatchup && matchupDetail) {
			const heroRp = requireCell(matrixResult.rpMatrix, matchupDetail.heroIndex, matchupDetail.villainIndex, 'rpMatrix');
			const villainRp = requireCell(matrixResult.rpMatrix, matchupDetail.villainIndex, matchupDetail.heroIndex, 'rpMatrix');
			onSelectMatchup(heroRp, villainRp, matchupDetail.heroName, matchupDetail.villainName);
		}
	}, [matchupDetail, matrixResult, onSelectMatchup]);

	const getThresholds = (m: DisplayMode): readonly [number, number, number] => {
		switch (m) {
			case 'RP':
				return [35, 20, 10] as const;
			case 'BF':
				return [2.0, 1.5, 1.2] as const;
			case 'REQ_EQ':
				return [67, 60, 55] as const;
		}
	};

	const getCellColor = (val: number, mode: DisplayMode, isDiagonal: boolean) => {
		if (isDiagonal) return 'bg-slate-900/40 text-slate-600 border-slate-800';

		const [high, mid, low] = getThresholds(mode);
		if (val >= high) return 'bg-rose-950/70 text-rose-300 border-rose-600/60 font-bold';
		if (val >= mid) return 'bg-amber-950/60 text-amber-300 border-amber-600/50';
		if (val >= low) return 'bg-cyan-950/50 text-cyan-300 border-cyan-600/40';
		return 'bg-emerald-950/40 text-emerald-300 border-emerald-600/30';
	};

	const formatCellValue = (i: number, j: number) => {
		if (i === j) return '-';
		if (displayMode === 'RP') return `${requireCell(matrixResult.rpMatrix, i, j, 'rpMatrix')}%`;
		if (displayMode === 'BF') return `${requireCell(matrixResult.bfMatrix, i, j, 'bfMatrix')}x`;
		return `${requireCell(matrixResult.reqEquityMatrix, i, j, 'reqEquityMatrix')}%`;
	};

	return (
		<div className="p-6 font-mono text-white bg-[#0f172a] rounded-xl border border-indigo-500/30 shadow-2xl space-y-6">
			{/* Cabeçalho */}
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
				<div>
					<div className="flex items-center gap-3">
						<h2 className="text-indigo-400 text-xl font-bold tracking-tight">
							Matriz Dinâmica de Bubble Factor &amp; Risk Premium (BF i,j)
						</h2>
						<span className="px-2.5 py-0.5 text-xs font-bold border rounded-full bg-indigo-950 text-indigo-300 border-indigo-500/40">
							Malmuth-Harville SOTA
						</span>
					</div>
					<p className="text-xs text-slate-400 mt-1">
						Derivação exata de $EV, &Delta;$EV(Perda) / &Delta;$EV(Ganho) e acoplamento em tempo real com o Profiler de Nash
					</p>
				</div>

				{/* Seletor de Modo de Exibição */}
				<div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
					<button
						type="button"
						onClick={() => setDisplayMode('RP')}
						className={`px-3 py-1.5 rounded-md font-bold transition-all ${
							displayMode === 'RP'
								? 'bg-indigo-600 text-white shadow'
								: 'text-slate-400 hover:text-slate-200'
						}`}
					>
						Risk Premium (%)
					</button>
					<button
						type="button"
						onClick={() => setDisplayMode('BF')}
						className={`px-3 py-1.5 rounded-md font-bold transition-all ${
							displayMode === 'BF'
								? 'bg-indigo-600 text-white shadow'
								: 'text-slate-400 hover:text-slate-200'
						}`}
					>
						Bubble Factor (x)
					</button>
					<button
						type="button"
						onClick={() => setDisplayMode('REQ_EQ')}
						className={`px-3 py-1.5 rounded-md font-bold transition-all ${
							displayMode === 'REQ_EQ'
								? 'bg-indigo-600 text-white shadow'
								: 'text-slate-400 hover:text-slate-200'
						}`}
					>
						Equidade Requerida
					</button>
				</div>
			</div>

			{/* Presets de Torneios Reais do Circuito */}
			<div className="space-y-2">
				<div className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
					Estruturas Reais de Torneios &amp; Mesas Finais:
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
					{TOURNAMENT_PRESETS.map((p) => (
						<button
							key={p.id}
							type="button"
							onClick={() => handlePresetChange(p)}
							className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
								activePreset.id === p.id
									? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 shadow-md ring-1 ring-indigo-500/50'
									: 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
							}`}
						>
							<div className="font-bold">{p.name}</div>
							<div className="text-[10px] text-slate-400 truncate mt-0.5">{p.category}</div>
							<div className="text-[10px] text-indigo-400 mt-1">
								{p.defaultStacks.length} Jogadores | Total: $
								{p.payouts.reduce((a, b) => a + b, 0).toLocaleString()}
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Grid da Matriz Heatmap */}
			<div className="overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
				<div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
					<span>
						<strong className="text-indigo-400">{UI_I18N.matrix.rows}</strong> {UI_I18N.matrix.heroRole} &times;{' '}
						<strong className="text-indigo-400">{UI_I18N.matrix.cols}</strong> {UI_I18N.matrix.villainRole}
					</span>
					<span className="text-[11px] text-indigo-300 font-semibold">
						{UI_I18N.matrix.clickHint}
					</span>
				</div>

				<table className="w-full text-center text-xs border-collapse">
					<thead>
						<tr>
							<th className="p-2 text-left text-slate-400 font-bold bg-slate-900/80 border border-slate-800">
								{UI_I18N.matrix.heroVsVillain}
							</th>
							{matrixResult.playerNames.map((name, j) => (
								<th
									key={`head-col-${name}-${j}`}
									className="p-2 text-slate-300 font-bold bg-slate-900/80 border border-slate-800 min-w-[85px]"
								>
									{name.split(' ')[0]}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{matrixResult.playerNames.map((rowName, i) => (
							<tr key={`row-${rowName}-${i}`}>
								<td className="p-2 text-left font-bold text-slate-300 bg-slate-900/60 border border-slate-800 whitespace-nowrap">
									{rowName}
									<span className="block text-[10px] text-slate-500 font-normal">
										${requireItem(matrixResult.baseEv, i, 'baseEv').toLocaleString()} $EV
									</span>
								</td>
								{matrixResult.playerNames.map((colName, j) => {
									const isDiag = i === j;
									const isSelected = selectedCell.hero === i && selectedCell.villain === j;
									let cellVal: number;
									if (displayMode === 'RP') {
										cellVal = requireCell(matrixResult.rpMatrix, i, j, 'rpMatrix');
									} else if (displayMode === 'BF') {
										cellVal = requireCell(matrixResult.bfMatrix, i, j, 'bfMatrix');
									} else {
										cellVal = requireCell(matrixResult.reqEquityMatrix, i, j, 'reqEquityMatrix');
									}

									return (
										<td
											key={`cell-${i}-${colName}-${j}`}
											onClick={() => handleCellClick(i, j)}
											className={`p-2 border transition-all cursor-pointer select-none ${
												isSelected
													? 'ring-2 ring-indigo-400 scale-105 z-10'
													: 'hover:brightness-125'
											} ${getCellColor(cellVal, displayMode, isDiag)}`}
										>
											{formatCellValue(i, j)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Painel de Análise Tática do Matchup Selecionado */}
			<div className="bg-slate-900/90 p-5 rounded-xl border border-indigo-500/40 shadow-inner space-y-4">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
					<div className="flex items-center gap-2">
						<span className="px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 text-xs font-bold">
							{UI_I18N.matrix.matchupActive}
						</span>
						<h3 className="text-sm font-bold text-white">
							{matchupDetail.heroName} (Hero) vs {matchupDetail.villainName} (Villain)
						</h3>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-xs text-indigo-300 font-bold">
							{UI_I18N.matrix.effectiveChips} {matchupDetail.effectiveChips.toLocaleString()}
						</div>
						<button
							type="button"
							onClick={handleInjectClick}
							className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-bold transition-all shadow"
						>
							{UI_I18N.matrix.injectButton}
						</button>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
					<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
						<div className="text-[10px] text-slate-400">{UI_I18N.metrics.bubbleFactor}</div>
						<div className="text-lg font-black text-indigo-400 mt-0.5">
							{matchupDetail.bubbleFactor.toFixed(3)}x
						</div>
					</div>

					<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
						<div className="text-[10px] text-slate-400">{UI_I18N.metrics.heroRp}</div>
						<div className="text-lg font-black text-rose-400 mt-0.5">
							+{matchupDetail.riskPremium.toFixed(1)}%
						</div>
					</div>

					<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
						<div className="text-[10px] text-slate-400">{UI_I18N.metrics.villainRp}</div>
						<div className="text-lg font-black text-amber-400 mt-0.5">
							+
							{requireCell(
								matrixResult.rpMatrix,
								matchupDetail.villainIndex,
								matchupDetail.heroIndex,
								'rpMatrix'
							).toFixed(1)}
							%
						</div>
					</div>

					<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
						<div className="text-[10px] text-slate-400">{UI_I18N.metrics.gainDelta}</div>
						<div className="text-sm font-bold text-emerald-400 mt-1">
							+${matchupDetail.deltaWin.toLocaleString()}
						</div>
					</div>

					<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
						<div className="text-[10px] text-slate-400">{UI_I18N.metrics.lossDelta}</div>
						<div className="text-sm font-bold text-rose-400 mt-1">
							-${matchupDetail.deltaLose.toLocaleString()}
						</div>
					</div>

					<div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
						<div className="text-[10px] text-slate-400">{UI_I18N.metrics.riskAsymmetry}</div>
						<div className="text-sm font-bold text-purple-400 mt-1">
							{matchupDetail.riskAsymmetry > 0
								? `+${matchupDetail.riskAsymmetry}`
								: matchupDetail.riskAsymmetry}
							%
						</div>
					</div>
				</div>

				<div className="p-3 bg-slate-950/80 rounded-lg border border-indigo-500/20 text-xs text-slate-300 flex items-center justify-between">
					<div>
						<strong className="text-indigo-400">{UI_I18N.matrix.sotaGuideline}</strong>{' '}
						{matchupDetail.tacticalAdvice}
					</div>
					<span
						className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
							matchupDetail.coverageAdvantage
								? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
								: 'bg-rose-950 text-rose-300 border border-rose-500/40'
						}`}
					>
						{matchupDetail.coverageAdvantage ? UI_I18N.matrix.heroCovers : UI_I18N.matrix.villainCovers}
					</span>
				</div>
			</div>
		</div>
	);
};
