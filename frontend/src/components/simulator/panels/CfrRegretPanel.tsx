/** @format */

'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization & IA Game Theory)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA e Teoria dos Jogos.
 *       Exibe o Heatmap de Regret Matching 13x13 e o Dimensionamento Geométrico Canônico Janda.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { CfrCanvas, type CfrCanvasRef } from '../ui/CfrCanvas';
import { useLoopVisibility } from '../hooks/useLoopVisibility';
import { calculateJandaGeometricSizing, calculateJandaMDF } from '@/lib/canonicalTheoryEngine';
import {
	appendCfrRegretSample,
	type CfrRegretDiagnostic,
} from '@/lib/cfrDiagnostics';
import { getEngineCapability } from '@/lib/engineCapabilities';
import {
	calculateClientCfrConvergence,
	forecastCfrConvergence,
	type CfrConvergenceForecastPayload,
} from '@/lib/timesfm-client';

const TIMESFM_CAPABILITY = getEngineCapability('timesfm-forecast');
export const HRC_CONVERGENCE_TARGET_CI = 0.003; // ~0.3% CI (métrica do HRC: distância em relação ao Nash / e-nash)

const WORKER_STATUS_LABEL: Record<string, string> = {
	starting: 'Iniciando',
	active: 'Ativo',
	converged: 'Convergido (0.3% CI)',
	error: 'Indisponível',
};

interface CfrWorkerMessage {
	matrix?: Float32Array;
	diagnostic?: CfrRegretDiagnostic;
	error?: string;
}

export interface CfrRegretPanelProps {
	initialPot?: number;
	initialStack?: number;
	initialEquity?: number;
}

const LABELS = {
	title: 'Laboratório CFR & IA',
	cfrEngine: 'Motor de Decisão Regret Matching+',
} as const;

export default function CfrRegretPanel({
	initialPot = 2.5,
	initialStack = 40,
	initialEquity = 55,
}: Readonly<CfrRegretPanelProps>) {
	const cfrCanvasRef = useRef<CfrCanvasRef>(null);
	const [kappa, setKappa] = useState<number>(0.85);
	const [nodes] = useState<number>(13);
	const [pot, setPot] = useState<number>(initialPot);
	const [stack, setStack] = useState<number>(initialStack);
	const [equity, setEquity] = useState<number>(initialEquity);
	const [hoveredHand, setHoveredHand] = useState<{ hand: string; value: number; type: 'pair' | 'suited' | 'offsuit' } | null>(null);

	const workerRef = useRef<Worker | null>(null);
	const [painelRef, lacoAtivo] = useLoopVisibility();
	const [workerStatus, setWorkerStatus] = useState<'starting' | 'active' | 'converged' | 'error'>('starting');
	const isConvergedRef = useRef(false);

	// Dimensionamento Geométrico Canônico Janda (100% Determinístico e Matemático)
	const canonicalSizing = useMemo(() => {
		return calculateJandaGeometricSizing(Math.max(0.1, pot), Math.max(0.1, stack), 3);
	}, [pot, stack]);

	const jandaMdf = useMemo(() => {
		const flopBet = canonicalSizing.steps[0]?.betSize ?? pot * 0.5;
		return calculateJandaMDF(Math.max(0.1, pot), Math.max(0.01, flopBet), 1);
	}, [pot, canonicalSizing]);

	const [preferredModel, setPreferredModel] = useState<
		'timesfm-2.5-200m' | 'timesfm-3.0-330m'
	>('timesfm-2.5-200m');
	const [regretSamples, setRegretSamples] = useState<CfrRegretDiagnostic[]>([]);
	const [cfrConvergence, setCfrConvergence] = useState<CfrConvergenceForecastPayload>(() =>
		calculateClientCfrConvergence([], 8, HRC_CONVERGENCE_TARGET_CI, preferredModel),
	);

	useEffect(() => {
		let cancelled = false;
		const measuredHistory = regretSamples.map(({ value }) => value);
		void forecastCfrConvergence(measuredHistory, 8, HRC_CONVERGENCE_TARGET_CI, preferredModel).then((forecast) => {
			if (!cancelled) setCfrConvergence(forecast);
		});
		return () => {
			cancelled = true;
		};
	}, [preferredModel, regretSamples]);

	const stepsToTarget = useMemo(() => {
		if (cfrConvergence.estimated_iterations_to_target > 0) {
			return `${cfrConvergence.estimated_iterations_to_target} iters`;
		}
		if (cfrConvergence.status === 'CONVERGED') {
			return 'Atingida';
		}
		if (cfrConvergence.status === 'CONVERGING') {
			return 'Convergindo';
		}
		return 'Calculando';
	}, [cfrConvergence.estimated_iterations_to_target, cfrConvergence.status]);

	const paramsRef = useRef({
		kappa: 0.85,
		nodes: 13,
		pot: initialPot,
		stack: initialStack,
		equity: initialEquity,
	});

	useEffect(() => {
		paramsRef.current = { kappa, nodes, pot, stack, equity };
		isConvergedRef.current = false;
		setWorkerStatus('active');
	}, [kappa, nodes, pot, stack, equity]);

	useEffect(() => {
		setPot(initialPot);
		setStack(initialStack);
		setEquity(initialEquity);
		isConvergedRef.current = false;
		setWorkerStatus('active');
	}, [initialPot, initialStack, initialEquity]);

	useEffect(() => {
		workerRef.current ??= new Worker(new URL('../workers/cfr.worker.ts', import.meta.url), {
			type: 'module',
		});

		let animId: number;
		let isWorkerBusy = false;

		workerRef.current.onmessage = (e: MessageEvent<CfrWorkerMessage>) => {
			isWorkerBusy = false;
			const { matrix, diagnostic } = e.data;
			if (diagnostic) {
				const isConverged =
					(diagnostic.iteration >= 40 && diagnostic.value <= HRC_CONVERGENCE_TARGET_CI) ||
					diagnostic.iteration >= 200;

				setRegretSamples((history) => {
					const next = appendCfrRegretSample(history, diagnostic, 10);
					if (isConverged && next.at(-1)?.iteration !== diagnostic.iteration) {
						return [...next, diagnostic].slice(-32);
					}
					return next;
				});

				if (isConverged) {
					isConvergedRef.current = true;
					setWorkerStatus('converged');
				} else if (!isConvergedRef.current) {
					setWorkerStatus('active');
				}
			} else if (!isConvergedRef.current) {
				setWorkerStatus('active');
			}
			if (!matrix) return;

			// Injeção gráfica na Matriz 13x13
			cfrCanvasRef.current?.updateMatrix(matrix);
		};

		workerRef.current.onerror = () => {
			isWorkerBusy = false;
			setWorkerStatus('error');
		};

		const loop = () => {
			if (!isWorkerBusy && workerRef.current && lacoAtivo.current && !isConvergedRef.current) {
				isWorkerBusy = true;
				workerRef.current.postMessage({
					id: 'cfr_tick',
					nodes: paramsRef.current.nodes,
					pot: paramsRef.current.pot,
					stack: paramsRef.current.stack,
					equity: paramsRef.current.equity,
					kappa: paramsRef.current.kappa,
				});
			}

			animId = requestAnimationFrame(loop);
		};

		loop();
		return () => {
			cancelAnimationFrame(animId);
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, [lacoAtivo]);

	return (
		<div
			ref={painelRef}
			className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10 rounded-3xl bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300"
		>
			<div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-indigo/10 blur-3xl rounded-full pointer-events-none" />

			{/* Cabeçalho do Painel */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/10 gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--color-accent-indigo,#6366f1)]" />
						<h3 className="text-sm font-black text-white uppercase tracking-wider m-0">
							{LABELS.title}
						</h3>
						<span className="text-xs text-text-muted font-medium">| {LABELS.cfrEngine}</span>
					</div>
					<p className="text-xs text-text-dim mt-1.5 m-0 max-w-xl font-normal leading-relaxed">
						Algoritmo de minimização de arrependimento contrafactual (CFR+) com convergência iterativa em direção ao Equilíbrio de Nash.
					</p>
				</div>
				<div
					className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border shadow-md flex items-center gap-2 transition-all shrink-0 ${
						workerStatus === 'converged'
							? 'border-accent-emerald/40 bg-accent-emerald-surface/20 text-accent-emerald'
							: 'border-accent-indigo/30 bg-accent-indigo-surface/20 text-accent-indigo-light'
					}`}
				>
					<div
						className={`w-2 h-2 rounded-full ${
							workerStatus === 'converged'
								? 'bg-accent-emerald shadow-[0_0_8px_var(--color-accent-emerald,#10b981)]'
								: 'bg-accent-indigo animate-pulse'
						}`}
					/>
					<span>
						CFR: {WORKER_STATUS_LABEL[workerStatus] ?? workerStatus} ·{' '}
						{cfrConvergence.fallback_used ? 'Previsão HRC' : 'TimesFM Ativo'}
					</span>
					{workerStatus === 'converged' && (
						<button
							type="button"
							onClick={() => {
								isConvergedRef.current = false;
								setWorkerStatus('active');
							}}
							className="ml-1 cursor-pointer rounded-md border border-accent-emerald/40 bg-accent-emerald-surface/30 px-2 py-0.5 text-[0.65rem] font-bold text-accent-emerald uppercase hover:bg-accent-emerald-surface/50 transition-colors"
						>
							Reiterar
						</button>
					)}
				</div>
			</div>

			{/* Layout de Duas Colunas */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* Coluna Esquerda: Parâmetros, Sizing e Convergência (7 colunas) */}
				<div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
					{/* Card 1: Ajuste de Parâmetros */}
					<div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg space-y-5">
						<div className="flex items-center justify-between">
							<h4 className="text-xs font-black text-text-bright uppercase tracking-wider m-0 flex items-center gap-2">
								<i className="fa-solid fa-sliders text-accent-indigo-light" />
								Ajuste de Parâmetros do Spot
							</h4>
							<span className="text-[0.65rem] font-mono text-text-dim">Entrada Dinâmica</span>
						</div>

						<div className="space-y-4">
							<div className="space-y-1.5">
								<div className="flex justify-between items-center text-xs">
									<label htmlFor="cfr-kappa" className="text-text-muted font-bold">
										Alpha κ (Taxa de Desconto / Regret)
									</label>
									<span className="font-mono font-black text-accent-indigo-light bg-black/50 px-2 py-0.5 rounded border border-white/10">
										{Math.round(kappa * 100)}%
									</span>
								</div>
								<input
									id="cfr-kappa"
									title="Alpha Kappa (Regret)"
									aria-label="Alpha Kappa (Regret)"
									type="range"
									min="0.1"
									max="1"
									step="0.05"
									value={kappa}
									onChange={(e) => setKappa(Number.parseFloat(e.target.value))}
									className="w-full h-1.5 accent-accent-indigo bg-white/10 rounded-full appearance-none cursor-pointer"
								/>
								<span className="text-[0.65rem] text-text-dim block">
									Fator de decaimento de arrependimentos negativos para aceleração CFR+.
								</span>
							</div>

							<div className="space-y-1.5">
								<div className="flex justify-between items-center text-xs">
									<label htmlFor="cfr-equity" className="text-text-muted font-bold">
										Equidade Estimada do Hero
									</label>
									<span className="font-mono font-black text-accent-emerald bg-black/50 px-2 py-0.5 rounded border border-white/10">
										{Math.round(equity)}%
									</span>
								</div>
								<input
									id="cfr-equity"
									title="Equity Hero"
									aria-label="Equity Hero"
									type="range"
									min="0"
									max="100"
									step="1"
									value={equity}
									onChange={(e) => setEquity(Number.parseFloat(e.target.value))}
									className="w-full h-1.5 accent-accent-emerald bg-white/10 rounded-full appearance-none cursor-pointer"
								/>
								<span className="text-[0.65rem] text-text-dim block">
									Probabilidade de vitória do range do Hero contra a distribuição do Vilão.
								</span>
							</div>

							<div className="grid grid-cols-2 gap-4 pt-1">
								<div className="bg-black/50 p-3.5 rounded-xl border border-white/10 focus-within:border-accent-indigo/60 transition-colors">
									<label
										htmlFor="cfr-pot-size"
										className="text-[0.65rem] text-text-dim uppercase font-bold tracking-wider block mb-1"
									>
										Tamanho do Pote (BB)
									</label>
									<div className="flex items-center gap-1.5">
										<input
											id="cfr-pot-size"
											aria-label="Pot Size (BB)"
											type="number"
											min="0.1"
											step="0.5"
											value={pot}
											onChange={(e) => {
												const nextPot = Number.parseFloat(e.target.value);
												if (Number.isFinite(nextPot) && nextPot > 0) setPot(nextPot);
											}}
											className="w-full bg-transparent border-none text-base font-mono font-black text-white focus:outline-none"
										/>
										<span className="text-xs font-mono font-bold text-accent-indigo-light">BB</span>
									</div>
								</div>
								<div className="bg-black/50 p-3.5 rounded-xl border border-white/10 focus-within:border-accent-indigo/60 transition-colors">
									<label
										htmlFor="cfr-eff-stack"
										className="text-[0.65rem] text-text-dim uppercase font-bold tracking-wider block mb-1"
									>
										Stack Efetivo (BB)
									</label>
									<div className="flex items-center gap-1.5">
										<input
											id="cfr-eff-stack"
											aria-label="Eff. Stack (BB)"
											type="number"
											min="0.1"
											step="0.5"
											value={stack}
											onChange={(e) => {
												const nextStack = Number.parseFloat(e.target.value);
												if (Number.isFinite(nextStack) && nextStack > 0) setStack(nextStack);
											}}
											className="w-full bg-transparent border-none text-base font-mono font-black text-white focus:outline-none"
										/>
										<span className="text-xs font-mono font-bold text-accent-emerald">BB</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Card 2: Dimensionamento Geométrico Canônico Janda */}
					<div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
						<div className="flex justify-between items-center flex-wrap gap-2">
							<h4 className="text-xs font-black text-text-bright uppercase tracking-wider m-0 flex items-center gap-2">
								<i className="fa-solid fa-calculator text-accent-emerald" />
								Dimensionamento Geométrico Multirua (Janda)
							</h4>
							<span className="text-xs font-mono font-bold text-accent-emerald bg-accent-emerald-surface/20 px-2.5 py-0.5 rounded-full border border-accent-emerald/25">
								{canonicalSizing.potFractionPercentage}% Pot / Rua
							</span>
						</div>

						<div className="grid grid-cols-3 gap-3">
							{canonicalSizing.steps.map((step) => {
								const isJam = step.remainingStackAfterBet <= 0.05 || step.streetIndex === 3;
								return (
									<div
										key={step.streetIndex}
										className="text-center bg-black/50 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between"
									>
										<div>
											<span className="text-[0.65rem] text-text-muted uppercase font-bold tracking-wider block mb-1">
												{step.streetName}
											</span>
											<div className={`text-base font-mono font-black ${isJam ? 'text-accent-amber' : 'text-white'}`}>
												{step.betSize.toFixed(1)} <span className="text-xs font-normal text-text-dim">bb</span>
											</div>
											<div className="text-[0.65rem] font-mono text-accent-indigo-light mt-0.5">
												{canonicalSizing.potFractionPercentage}% pot {isJam && <span className="text-accent-danger font-bold ml-0.5">(JAM)</span>}
											</div>
										</div>
										<div className="mt-2.5 pt-2 border-t border-white/5 text-[0.65rem] font-mono text-text-dim flex justify-between">
											<span>Pote: {step.startingPot.toFixed(1)}</span>
											<span>Resto: {step.remainingStackAfterBet.toFixed(1)}</span>
										</div>
									</div>
								);
							})}
						</div>

						<div className="pt-2 border-t border-white/5 flex flex-wrap justify-between items-center text-xs font-mono text-text-dim gap-2">
							<span>
								MDF Janda (Defesa): <strong className="text-accent-emerald">{jandaMdf.mdfPercentage}%</strong>
							</span>
							<span>
								Alpha Blefe Ideal: <strong className="text-accent-indigo-light">{jandaMdf.alphaPercentage}%</strong>
							</span>
						</div>
					</div>

					{/* Card 3: Projeção de Convergência CFR & TimesFM */}
					<div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg space-y-4">
						<div className="flex justify-between items-center flex-wrap gap-2">
							<h4 className="text-xs font-black text-text-bright uppercase tracking-wider m-0 flex items-center gap-2">
								<i className="fa-solid fa-chart-line text-accent-indigo-light" />
								Convergência & Exploitability (TimesFM)
							</h4>
							<div className="flex items-center gap-1.5">
								<button
									type="button"
									onClick={() => setPreferredModel('timesfm-2.5-200m')}
									className={`text-[0.65rem] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
										preferredModel === 'timesfm-2.5-200m'
											? 'bg-accent-emerald-surface/20 border-accent-emerald/40 text-accent-emerald font-bold'
											: 'bg-black/40 border-white/5 text-text-muted hover:text-white'
									}`}
									title="TimesFM 2.5 pretendido; a execução efetiva aparece abaixo"
								>
									TimesFM 2.5
								</button>
								<button
									type="button"
									onClick={() => setPreferredModel('timesfm-3.0-330m')}
									className={`text-[0.65rem] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
										preferredModel === 'timesfm-3.0-330m'
											? 'bg-accent-indigo-surface/20 border-accent-indigo/40 text-accent-indigo-light font-bold'
											: 'bg-black/40 border-white/5 text-text-muted hover:text-white'
									}`}
									title="TimesFM 3.0 pretendido; a execução efetiva aparece abaixo"
								>
									TimesFM 3.0
								</button>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-3">
							<div className="text-center bg-black/50 p-3 rounded-xl border border-white/5">
								<span className="text-[0.65rem] text-text-muted uppercase font-bold block mb-1">
									Regret Médio ε*
								</span>
								<div className="text-sm font-mono font-black text-accent-indigo-light">
									{cfrConvergence.current_exploitability.toFixed(4)}
								</div>
							</div>
							<div className="text-center bg-black/50 p-3 rounded-xl border border-white/5">
								<span className="text-[0.65rem] text-text-muted uppercase font-bold block mb-1">
									Horizonte p/ Meta
								</span>
								<div className="text-sm font-mono font-black text-accent-emerald">
									{stepsToTarget}
								</div>
							</div>
							<div className="text-center bg-black/50 p-3 rounded-xl border border-white/5">
								<span className="text-[0.65rem] text-text-muted uppercase font-bold block mb-1">
									Early Stop
								</span>
								<div
									className={`text-sm font-mono font-black ${
										cfrConvergence.early_stopping_recommended
											? 'text-accent-emerald'
											: 'text-text-muted'
									}`}
								>
									{cfrConvergence.early_stopping_recommended ? 'Ativo' : 'Pendente'}
								</div>
							</div>
						</div>

						<div className="pt-2 border-t border-white/5 flex justify-between items-center gap-2 text-[0.65rem] font-mono text-text-dim">
							<span>Status: <strong className="text-white">{cfrConvergence.status}</strong></span>
							<span className="text-right" title={cfrConvergence.license_tier}>
								{cfrConvergence.license_tier.split(' ')[0]}
							</span>
						</div>
						<p
							className="m-0 text-xs text-text-dim leading-relaxed"
							title={TIMESFM_CAPABILITY.limitations.join('; ')}
						>
							Extrapolação preditiva via regressão temporal calibrada para o limiar HRC ε ≤ 0.3%.
						</p>
					</div>
				</div>

				{/* Coluna Direita: Matriz 13x13 Heatmap (5 colunas) */}
				<div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4">
					<div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4">
						<div className="flex justify-between items-center">
							<h4 className="text-xs font-black text-text-bright uppercase tracking-wider m-0 flex items-center gap-2">
								<i className="fa-solid fa-table-cells text-accent-indigo-light" />
								Matriz de Regret Matching 13x13
							</h4>
							<span className="text-[0.65rem] font-mono text-accent-emerald font-bold">
								169 Spots de Mão
							</span>
						</div>

						{/* Container do Canvas Heatmap */}
						<div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-inner">
							<CfrCanvas ref={cfrCanvasRef} nodes={13} onHoverHand={setHoveredHand} />
						</div>

						{/* Painel de Mão Inspecionada (Hover / Status) */}
						<div className="bg-black/50 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
							{hoveredHand ? (
								<>
									<div className="flex items-center gap-2">
										<span className="font-bold text-white text-sm">{hoveredHand.hand}</span>
										<span className="text-text-dim text-[0.7rem]">
											{hoveredHand.type === 'pair' ? 'Par' : hoveredHand.type === 'suited' ? 'Suited' : 'Offsuit'}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<span>Agressão: <strong className="text-accent-emerald">{(hoveredHand.value * 100).toFixed(1)}%</strong></span>
										<span>Fold: <strong className="text-text-muted">{((1 - hoveredHand.value) * 100).toFixed(1)}%</strong></span>
									</div>
								</>
							) : (
								<div className="text-text-dim text-center w-full italic text-[0.7rem]">
									Passe o mouse sobre as células para inspecionar mãos específicas
								</div>
							)}
						</div>

						{/* Legenda de Cores do Heatmap */}
						<div className="grid grid-cols-4 gap-2 pt-1 text-[0.65rem] font-mono text-text-muted">
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-sm bg-accent-emerald shrink-0" />
								<span>Raise (&gt;75%)</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-sm bg-accent-indigo shrink-0" />
								<span>Call (45-75%)</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-sm bg-slate-700 shrink-0" />
								<span>Misto (20-45%)</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-white/10 shrink-0" />
								<span>Fold (&lt;20%)</span>
							</div>
						</div>

						<p className="text-[0.7rem] text-text-dim leading-relaxed text-center m-0 pt-1">
							O grid 13x13 mapeia todas as combinações de mãos do poker. Pares residem na diagonal, mãos suited no triângulo superior e offsuit no inferior.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
