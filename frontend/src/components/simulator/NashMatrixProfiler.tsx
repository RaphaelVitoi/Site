'use client';

/** @format */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	defaultNashSolver,
	HIGH_STAKES_PRESETS,
	type HighStakesPreset,
	type NashSolutionResult,
} from '../../lib/nashSolver';

interface MetricFrame {
	id: string;
	t0: number;
	t1: number;
	t2: number;
	t3: number;
	totalLatencyMs: number;
	workerFrictionMs: number;
	wasmExecutionMs: number;
}

export interface NashMatrixProfilerProps {
	injectedIpRp?: number;
	injectedOopRp?: number;
	matchupLabel?: string;
}

const PROFILER_LABELS = {
	ipRp: 'Agressor Risk Premium (IP RP):',
	oopRp: 'Defensor Risk Premium (OOP RP):',
	aggression: 'Fator de Agressão (κ):',
	asymmetry: 'Assimetria de Risco',
	telemetry: 'Telemetria de Baixa Latência (WebWorker):',
	chipEv: '0% (ChipEV)',
	ftMid: '40% (FT Média)',
	icmNuclear: '80% (ICM Nuclear)',
	passive: '0.2x (Passivo)',
	gto: '1.0x (GTO)',
	hyperAggro: '3.5x (Hiper-Agressivo)',
};

export const NashMatrixProfiler: React.FC<NashMatrixProfilerProps> = ({
	injectedIpRp,
	injectedOopRp,
	matchupLabel,
}) => {
	const workerRef = useRef<Worker | null>(null);
	const [metrics, setMetrics] = useState<MetricFrame[]>([]);
	const [renderPhase, setRenderPhase] = useState<string>('idle');
	const [ipRp, setIpRp] = useState<number>(injectedIpRp ?? 35.0);
	const [oopRp, setOopRp] = useState<number>(injectedOopRp ?? 65.0);
	const [aggression, setAggression] = useState<number>(1.25);
	const [activePreset, setActivePreset] = useState<string>('ft-3way-highstakes');
	const [solution, setSolution] = useState<NashSolutionResult>(() =>
		defaultNashSolver.solve(injectedIpRp ?? 35.0, injectedOopRp ?? 65.0, 1.25)
	);

	useEffect(() => {
		try {
			workerRef.current = new Worker(
				new URL('./workers/nashDistortion.worker.ts', import.meta.url),
				{ type: 'module' }
			);

			workerRef.current.onmessage = (e: MessageEvent) => {
				const { id, t0, t1, t2, solution: workerSol } = e.data;
				const t3 = performance.now();

				if (workerSol) {
					setSolution(workerSol);
				}

				setMetrics((prev) => [
					...prev.slice(-9),
					{
						id,
						t0,
						t1,
						t2,
						t3,
						totalLatencyMs: Number.parseFloat((t3 - t0).toFixed(2)),
						workerFrictionMs: Number.parseFloat((t1 - t0).toFixed(2)),
						wasmExecutionMs: Number.parseFloat((t2 - t1).toFixed(2)),
					},
				]);
			};
		} catch {
			// Fallback síncrono gracioso
		}

		return () => workerRef.current?.terminate();
	}, []);

	const recompute = useCallback(
		(newIp: number, newOop: number, newAgg: number) => {
			setIpRp(newIp);
			setOopRp(newOop);
			setAggression(newAgg);

			if (workerRef.current) {
				const id =
					typeof crypto !== 'undefined' && crypto.randomUUID
						? crypto.randomUUID()
						: Date.now().toString(36);
				const t0 = performance.now();
				const buffer = new ArrayBuffer(8 * 8);
				const f64Array = new Float64Array(buffer);
				f64Array[0] = newIp / 100;
				f64Array[1] = newOop / 100;
				f64Array[2] = newAgg;

				workerRef.current.postMessage(
					{ id, type: 'NASH_PROFILER', payload: f64Array, t0 },
					[buffer]
				);
			} else {
				setSolution(defaultNashSolver.solve(newIp, newOop, newAgg));
			}
			setRenderPhase('Calculado');
		},
		[]
	);

	const lastInjectedRef = useRef<{ ip?: number; oop?: number }>({});

	// Efeito de injeção externa com guarda estrita via Ref contra loops de re-render
	useEffect(() => {
		if (injectedIpRp !== undefined && injectedOopRp !== undefined) {
			if (
				lastInjectedRef.current.ip !== injectedIpRp ||
				lastInjectedRef.current.oop !== injectedOopRp
			) {
				lastInjectedRef.current = { ip: injectedIpRp, oop: injectedOopRp };
				setActivePreset('');
				recompute(injectedIpRp, injectedOopRp, aggression);
			}
		}
	}, [injectedIpRp, injectedOopRp, aggression, recompute]);

	const applyPreset = (preset: HighStakesPreset) => {
		setActivePreset(preset.id);
		recompute(preset.ipRp, preset.oopRp, preset.aggression);
	};

	const getZoneBadgeColor = (zone: NashSolutionResult['zoneCategory']) => {
		switch (zone) {
			case 'EXTREME_PARALYSIS':
				return 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse';
			case 'HIGH_STAKES_FT':
				return 'bg-amber-950 text-amber-300 border-amber-500/40';
			case 'ELEVATED':
				return 'bg-cyan-950 text-cyan-300 border-cyan-500/30';
			default:
				return 'bg-slate-900 text-slate-300 border-slate-700';
		}
	};

	return (
		<div className="p-6 font-mono text-white bg-[#0f172a] rounded-xl border border-cyan-500/30 shadow-2xl space-y-6">
			{/* Cabeçalho de Status & Veredito */}
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
				<div>
					<div className="flex items-center gap-3">
						<h2 className="text-cyan-400 text-xl font-bold tracking-tight">
							SOTA High-Stakes Nash &amp; Risk Distortion Matrix
						</h2>
						<span
							className={`px-2.5 py-0.5 text-xs font-bold border rounded-full ${getZoneBadgeColor(
								solution.zoneCategory
							)}`}
						>
							{solution.zoneCategory}
						</span>
						{matchupLabel && (
							<span className="px-2 py-0.5 text-[11px] font-bold border rounded bg-indigo-950 text-indigo-300 border-indigo-500/50">
								⚡ Injetado da Matriz: {matchupLabel}
							</span>
						)}
					</div>
					<p className="text-xs text-slate-400 mt-1">
						Calibrado para MTT High Stakes, Mesas Finais e Assimetrias Nucleares de ICM (0% a 80% RP)
					</p>
				</div>
				<div className="px-3.5 py-1.5 bg-slate-900 text-cyan-300 text-xs border border-cyan-500/40 rounded-lg shadow-inner">
					{solution.verdict}
				</div>
			</div>

			{/* Presets Rápidos */}
			<div className="flex flex-wrap gap-2">
				{HIGH_STAKES_PRESETS.map((p) => (
					<button
						key={p.id}
						type="button"
						onClick={() => applyPreset(p)}
						className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
							activePreset === p.id
								? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
								: 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
						}`}
					>
						{p.label}
					</button>
				))}
			</div>

			{/* Controles Dinâmicos de Parâmetros com Range 0% a 80% */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-2">
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">{PROFILER_LABELS.ipRp}</span>
						<span className="text-cyan-400 font-bold text-sm">{ipRp.toFixed(1)}%</span>
					</div>
					<input
						type="range"
						min="0"
						max="80"
						step="0.25"
						value={ipRp}
						onChange={(e) => {
							setActivePreset('');
							recompute(Number.parseFloat(e.target.value), oopRp, aggression);
						}}
						className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
					/>
					<div className="flex justify-between text-[10px] text-slate-500 font-mono">
						<span>{PROFILER_LABELS.chipEv}</span>
						<span>{PROFILER_LABELS.ftMid}</span>
						<span>{PROFILER_LABELS.icmNuclear}</span>
					</div>
				</div>

				<div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-2">
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">{PROFILER_LABELS.oopRp}</span>
						<span className="text-rose-400 font-bold text-sm">{oopRp.toFixed(1)}%</span>
					</div>
					<input
						type="range"
						min="0"
						max="80"
						step="0.25"
						value={oopRp}
						onChange={(e) => {
							setActivePreset('');
							recompute(ipRp, Number.parseFloat(e.target.value), aggression);
						}}
						className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
					/>
					<div className="flex justify-between text-[10px] text-slate-500 font-mono">
						<span>{PROFILER_LABELS.chipEv}</span>
						<span>{PROFILER_LABELS.ftMid}</span>
						<span>{PROFILER_LABELS.icmNuclear}</span>
					</div>
				</div>

				<div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800 space-y-2">
					<div className="flex justify-between items-center text-xs">
						<span className="text-slate-400">{PROFILER_LABELS.aggression}</span>
						<span className="text-amber-400 font-bold text-sm">{aggression.toFixed(2)}x</span>
					</div>
					<input
						type="range"
						min="0.2"
						max="3.5"
						step="0.05"
						value={aggression}
						onChange={(e) => {
							setActivePreset('');
							recompute(ipRp, oopRp, Number.parseFloat(e.target.value));
						}}
						className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
					/>
					<div className="flex justify-between text-[10px] text-slate-500 font-mono">
						<span>{PROFILER_LABELS.passive}</span>
						<span>{PROFILER_LABELS.gto}</span>
						<span>{PROFILER_LABELS.hyperAggro}</span>
					</div>
				</div>
			</div>

			{/* Métricas e Resultados do Equilíbrio Distorcido */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
				<div className="bg-linear-to-br from-slate-900 to-cyan-950/40 p-4 rounded-lg border border-cyan-500/30 text-center">
					<div className="text-xs text-slate-400">{solution.defense.label}</div>
					<div className="text-2xl font-black text-cyan-300 mt-1">
						{solution.defense.value}%
					</div>
					<div className="text-xs text-cyan-500/90 mt-1 font-mono">
						&Delta; {solution.defense.delta > 0 ? `+${solution.defense.delta}` : solution.defense.delta}%
					</div>
				</div>

				<div className="bg-linear-to-br from-slate-900 to-amber-950/40 p-4 rounded-lg border border-amber-500/30 text-center">
					<div className="text-xs text-slate-400">{solution.bluff.label}</div>
					<div className="text-2xl font-black text-amber-300 mt-1">
						{solution.bluff.value}%
					</div>
					<div className="text-xs text-amber-500/90 mt-1 font-mono">
						&Delta; {solution.bluff.delta > 0 ? `+${solution.bluff.delta}` : solution.bluff.delta}%
					</div>
				</div>

				<div className="bg-linear-to-br from-slate-900 to-emerald-950/40 p-4 rounded-lg border border-emerald-500/30 text-center">
					<div className="text-xs text-slate-400">{solution.evDiff.label}</div>
					<div className="text-2xl font-black text-emerald-300 mt-1">
						{solution.evDiff.totalRequired}%
					</div>
					<div className="text-xs text-emerald-500/90 mt-1 font-mono">
						Shift: +{solution.evDiff.value}%
					</div>
				</div>

				<div className="bg-linear-to-br from-slate-900 to-purple-950/40 p-4 rounded-lg border border-purple-500/30 text-center">
					<div className="text-xs text-slate-400">{PROFILER_LABELS.asymmetry}</div>
					<div className="text-2xl font-black text-purple-300 mt-1">
						{solution.asymmetryScore > 0 ? `+${solution.asymmetryScore}` : solution.asymmetryScore}%
					</div>
					<div className="text-xs text-purple-400/90 mt-1 font-mono">
						OOP RP - IP RP
					</div>
				</div>
			</div>

			{/* Telemetria de Baixa Latência (WebWorker) */}
			<div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
				<div className="flex justify-between items-center mb-2">
					<span className="text-slate-400">{PROFILER_LABELS.telemetry}</span>
					<span className="text-slate-500">{renderPhase}</span>
				</div>
				<pre className="text-slate-300 overflow-x-auto">
					{JSON.stringify(metrics.slice(-3), null, 2)}
				</pre>
			</div>
		</div>
	);
};

export default NashMatrixProfiler;
