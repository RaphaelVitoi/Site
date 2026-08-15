'use client';

/**
 * IDENTITY: SOTA Monte Carlo Parallel Convergence Widget (v7.0 GOLD)
 * PATH: src/components/simulator/ui/MonteCarloConvergenceWidget.tsx
 * ROLE: Renderiza o painel de convergência estocástica, desvio padrão e telemetria
 *       do pool WebAssembly em 50.000 iterações com SharedArrayBuffer.
 */

import {
	type MonteCarloSimulationResult,
	monteCarloPool,
} from '@/lib/monteCarloParallelPool';
import { useCallback, useEffect, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';

export interface MonteCarloConvergenceWidgetProps {
	heroRangeDefault?: string;
	villainRangeDefault?: string;
	boardDefault?: string;
	onEquityCalculated?: (result: MonteCarloSimulationResult) => void;
}

export function MonteCarloConvergenceWidget({
	heroRangeDefault = 'AA,KK,QQ,AKs',
	villainRangeDefault = 'TT+,AJs+,KQs,AQo+',
	boardDefault = '',
	onEquityCalculated,
}: Readonly<MonteCarloConvergenceWidgetProps>) {
	const [heroRange, setHeroRange] = useState(heroRangeDefault);
	const [villainRange, setVillainRange] = useState(villainRangeDefault);
	const [board, setBoard] = useState(boardDefault);
	const [iterations, setIterations] = useState<number>(50000);
	const [isSimulating, setIsSimulating] = useState(false);
	const [result, setResult] = useState<MonteCarloSimulationResult | null>(null);

	const executeSimulation = useCallback(async () => {
		setIsSimulating(true);
		try {
			const simResult = await monteCarloPool.calculateEquity({
				heroRange,
				villainRange,
				board,
				iterations,
			});
			setResult(simResult);
			onEquityCalculated?.(simResult);
		} catch (err) {
			console.error('[MonteCarloWidget] Falha na simulação:', err);
		} finally {
			setIsSimulating(false);
		}
	}, [heroRange, villainRange, board, iterations, onEquityCalculated]);

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			executeSimulation();
		}, 200);
		return () => clearTimeout(debounceTimer);
	}, [executeSimulation]);

	const modeLabel =
		result?.mode === 'SHARED_ARRAY_BUFFER'
			? 'SharedArrayBuffer Atômico'
			: result?.mode === 'TRANSFERABLE_WORKERS'
				? 'Transferable Workers Pool'
				: 'Single-Thread WASM Fallback';

	const mIps = result ? (result.throughputIps / 1000000).toFixed(2) : '0.00';

	return (
		<div className="bg-black/50 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
				<div>
					<h4 className="text-[0.7rem] font-black text-white uppercase tracking-[0.2em] m-0">
						Convergência Monte Carlo Paralela (WASM)
					</h4>
					<p className="m-0 mt-1 text-[0.55rem] text-text-dim font-medium uppercase tracking-wider">
						50.000 Iterações • Multi-Thread Pool • Intervalo de Confiança 95%
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-[0.55rem] font-mono font-bold uppercase tracking-wider">
						{result?.concurrency || 4} Threads • {modeLabel}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="mc-hero-range" className="text-[0.55rem] font-black text-text-darker uppercase tracking-wider">
						Hero Range
					</label>
					<input
						id="mc-hero-range"
						type="text"
						value={heroRange}
						onChange={(e) => setHeroRange(e.target.value)}
						placeholder="Ex: AA,KK,AKs"
						className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-[0.7rem] font-mono font-bold text-white focus:outline-none focus:border-accent-indigo transition-all shadow-inner"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="mc-villain-range" className="text-[0.55rem] font-black text-text-darker uppercase tracking-wider">
						Villain Range
					</label>
					<input
						id="mc-villain-range"
						type="text"
						value={villainRange}
						onChange={(e) => setVillainRange(e.target.value)}
						placeholder="Ex: 22+,A2s+,KTs+"
						className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-[0.7rem] font-mono font-bold text-white focus:outline-none focus:border-accent-indigo transition-all shadow-inner"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="mc-board-input" className="text-[0.55rem] font-black text-text-darker uppercase tracking-wider">
						Board (Opcional)
					</label>
					<div className="flex gap-2">
						<input
							id="mc-board-input"
							type="text"
							value={board}
							onChange={(e) => setBoard(e.target.value)}
							placeholder="Ex: Ah Kd 2s"
							className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-[0.7rem] font-mono font-bold text-white focus:outline-none focus:border-accent-indigo transition-all shadow-inner"
						/>
						<button
							onClick={executeSimulation}
							disabled={isSimulating}
							className="px-4 py-2 rounded-xl bg-accent-indigo text-white text-[0.6rem] font-black uppercase tracking-wider hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center gap-1.5"
						>
							{isSimulating ? (
								<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<i className="fa-solid fa-bolt text-xs" />
							)}
							<span>Calcular</span>
						</button>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-[0.55rem] font-black text-text-darker uppercase tracking-wider">
					Iterações:
				</span>
				{[10000, 25000, 50000].map((it) => (
					<button
						key={it}
						onClick={() => setIterations(it)}
						className={`px-3 py-1 rounded-lg text-[0.55rem] font-mono font-bold transition-all border ${
							iterations === it
								? 'bg-accent-indigo text-white border-accent-indigo shadow-md'
								: 'bg-black/40 text-text-muted border-white/5 hover:text-white'
						}`}
					>
						{it.toLocaleString('pt-BR')} it
					</button>
				))}
			</div>

			{result && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
					<div className="flex flex-col gap-0.5">
						<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
							Equidade Monte Carlo
						</span>
						<span className="text-xl font-black font-mono text-accent-emerald tabular-nums">
							<AnimatedNumber value={result.equityPercentage} decimals={2} />%
						</span>
					</div>

					<div className="flex flex-col gap-0.5">
						<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
							Erro Padrão (SE)
						</span>
						<span className="text-xl font-black font-mono text-white tabular-nums">
							±{(result.stdError * 100).toFixed(2)}%
						</span>
					</div>

					<div className="flex flex-col gap-0.5">
						<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
							Intervalo 95% CI
						</span>
						<span className="text-sm font-bold font-mono text-text-light tabular-nums mt-1">
							[{result.confidenceInterval95[0]}% — {result.confidenceInterval95[1]}%]
						</span>
					</div>

					<div className="flex flex-col gap-0.5">
						<span className="text-[0.5rem] font-black text-text-darker uppercase tracking-wider">
							Vazão & Latência
						</span>
						<span className="text-sm font-bold font-mono text-accent-cyan tabular-nums mt-1">
							{mIps} M-IPS • {result.latencyMs} ms
						</span>
					</div>
				</div>
			)}

			{result && (
				<div className="space-y-1.5">
					<div className="flex justify-between text-[0.55rem] font-mono text-text-dim">
						<span>Convergência Estocástica ({result.iterations.toLocaleString('pt-BR')} mãos simuladas)</span>
						<span className="text-accent-emerald font-bold">{result.equityPercentage.toFixed(2)}% Equidade</span>
					</div>
					<div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
						<div
							className="h-full bg-gradient-to-r from-accent-indigo to-accent-emerald rounded-full transition-all duration-300"
							style={{ width: `${Math.min(100, Math.max(0, result.equityPercentage))}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
