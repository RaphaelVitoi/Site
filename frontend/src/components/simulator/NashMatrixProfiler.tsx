'use client';

/** @format */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defaultNashSolver, type NashSolutionResult } from '../../lib/nashSolver';

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

export const NashMatrixProfiler: React.FC = () => {
	const workerRef = useRef<Worker | null>(null);
	const [metrics, setMetrics] = useState<MetricFrame[]>([]);
	const [renderPhase, setRenderPhase] = useState<string>('idle');
	const [ipRp, setIpRp] = useState<number>(15.0);
	const [oopRp, setOopRp] = useState<number>(25.0);
	const [aggression, setAggression] = useState<number>(1.0);
	const [solution, setSolution] = useState<NashSolutionResult>(() =>
		defaultNashSolver.solve(15.0, 25.0, 1.0)
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

	return (
		<div className="p-6 font-mono text-white bg-[#0f172a] rounded-xl border border-cyan-500/20 shadow-2xl space-y-6">
			<div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
				<div>
					<h2 className="text-cyan-400 text-xl font-bold tracking-tight">
						SOTA Nash Risk Distortion Matrix
					</h2>
					<p className="text-xs text-slate-400">
						Motor Analítico de Equilíbrio de Nash & Distorção de Risk Premium
					</p>
				</div>
				<span className="px-3 py-1 bg-cyan-950 text-cyan-300 text-xs border border-cyan-500/30 rounded-full">
					{solution.verdict}
				</span>
			</div>

			{/* Controles Reativos de Parâmetros */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
					<label className="text-xs text-slate-400 block mb-2">
						Agressor Risk Premium (IP RP):{' '}
						<span className="text-cyan-400 font-bold">{ipRp.toFixed(1)}%</span>
					</label>
					<input
						type="range"
						min="0"
						max="60"
						step="0.5"
						value={ipRp}
						onChange={(e) => recompute(parseFloat(e.target.value), oopRp, aggression)}
						className="w-full accent-cyan-400 cursor-pointer"
					/>
				</div>

				<div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
					<label className="text-xs text-slate-400 block mb-2">
						Defensor Risk Premium (OOP RP):{' '}
						<span className="text-rose-400 font-bold">{oopRp.toFixed(1)}%</span>
					</label>
					<input
						type="range"
						min="0"
						max="60"
						step="0.5"
						value={oopRp}
						onChange={(e) => recompute(ipRp, parseFloat(e.target.value), aggression)}
						className="w-full accent-rose-400 cursor-pointer"
					/>
				</div>

				<div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
					<label className="text-xs text-slate-400 block mb-2">
						Fator de Agressão (&kappa;):{' '}
						<span className="text-amber-400 font-bold">{aggression.toFixed(2)}x</span>
					</label>
					<input
						type="range"
						min="0.5"
						max="2.5"
						step="0.05"
						value={aggression}
						onChange={(e) => recompute(ipRp, oopRp, parseFloat(e.target.value))}
						className="w-full accent-amber-400 cursor-pointer"
					/>
				</div>
			</div>

			{/* Resultados do Equilíbrio de Nash */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-gradient-to-br from-slate-900 to-cyan-950/30 p-4 rounded-lg border border-cyan-500/30 text-center">
					<div className="text-xs text-slate-400">{solution.defense.label}</div>
					<div className="text-2xl font-bold text-cyan-300 mt-1">
						{solution.defense.value}%
					</div>
					<div className="text-xs text-cyan-500/80 mt-1">
						&Delta; {solution.defense.delta > 0 ? `+${solution.defense.delta}` : solution.defense.delta}%
					</div>
				</div>

				<div className="bg-gradient-to-br from-slate-900 to-amber-950/30 p-4 rounded-lg border border-amber-500/30 text-center">
					<div className="text-xs text-slate-400">{solution.bluff.label}</div>
					<div className="text-2xl font-bold text-amber-300 mt-1">
						{solution.bluff.value}%
					</div>
					<div className="text-xs text-amber-500/80 mt-1">
						&Delta; {solution.bluff.delta > 0 ? `+${solution.bluff.delta}` : solution.bluff.delta}%
					</div>
				</div>

				<div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 p-4 rounded-lg border border-emerald-500/30 text-center">
					<div className="text-xs text-slate-400">{solution.evDiff.label}</div>
					<div className="text-2xl font-bold text-emerald-300 mt-1">
						{solution.evDiff.totalRequired}%
					</div>
					<div className="text-xs text-emerald-500/80 mt-1">
						Shift: +{solution.evDiff.value}%
					</div>
				</div>
			</div>

			{/* Telemetria e Latência de Worker */}
			<div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
				<div className="flex justify-between items-center mb-2">
					<span className="text-slate-400">Telemetria de Baixa Latência (WebWorker):</span>
					<span className="text-slate-500">{renderPhase}</span>
				</div>
				<pre className="text-slate-300 overflow-x-auto">
					{JSON.stringify(metrics.slice(-3), null, 2)}
				</pre>
			</div>
		</div>
	);
};
