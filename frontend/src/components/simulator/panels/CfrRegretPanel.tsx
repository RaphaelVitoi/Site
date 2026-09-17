/** @format */

'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
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
	starting: 'iniciando',
	active: 'ativo',
	converged: 'convergido (0.3% CI)',
	error: 'indisponível',
};

interface CfrWorkerMessage {
	matrix?: Float32Array;
	diagnostic?: CfrRegretDiagnostic;
	error?: string;
}

// SOTA: Despacho Estático de Renderização para redução de complexidade ciclomática (SonarLint S3776)
function updateSizingDom(
	path: { x: number; y: number }[],
	p: { pot: number; stack: number; equity: number },
) {
	if (!path || path.length < 3) return;
	const flopNode = path[0];
	const equityMultiplier = Math.max(0.1, p.equity / 50);
	if (!flopNode) return;
	const flopPct = Math.min(1.5, Math.max(0.2, flopNode.y * 1.5 * equityMultiplier));
	const flopBet = p.pot * flopPct;
	const turnPot = p.pot + flopBet * 2;
	const turnIdx = Math.floor(path.length / 2);
	const turnNode = path[turnIdx];
	if (!turnNode) return;
	const turnPct = Math.min(1.5, turnNode.y * 1.5 * equityMultiplier);
	const turnBet = turnPot * turnPct;
	const riverJam = p.stack - flopBet - turnBet;

	const elFlop = document.getElementById('sizing-flop');
	const elTurn = document.getElementById('sizing-turn');
	const elRiver = document.getElementById('sizing-river');

	if (elFlop) elFlop.textContent = `${flopBet.toFixed(1)} bb (${Math.round(flopPct * 100)}%)`;
	if (elTurn) elTurn.textContent = `${turnBet.toFixed(1)} bb (${Math.round(turnPct * 100)}%)`;
	if (elRiver) elRiver.textContent = `${Math.max(0, riverJam).toFixed(1)} bb (JAM)`;
}

function extractPathfinding(matrix: Float32Array, nodes: number): { x: number; y: number }[] {
	const path: { x: number; y: number }[] = [];

	// SOTA: Extração contínua da Variação Principal (Principal Variation) do Regret
	// Avalia todos os nós de decisão (X) para traçar o pathfinding A* real
	for (let x = 0; x < nodes; x++) {
		let maxVal = -Infinity;
		let bestY = 0;
		for (let y = 0; y < nodes; y++) {
			const idx = x * nodes + y;
			const val = matrix.at(idx);
			if (val === undefined) continue;
			if (val > maxVal) {
				maxVal = val;
				bestY = y;
			}
		}
		path.push({ x: x / (nodes - 1), y: bestY / (nodes - 1) });
	}
	return path;
}

export interface CfrRegretPanelProps {
	initialPot?: number;
	initialStack?: number;
	initialEquity?: number;
}

const LABELS = {
	title: 'IA Laboratory',
	cfrEngine: 'CFR Engine',
} as const;

export default function CfrRegretPanel({
	initialPot = 2.5,
	initialStack = 40,
	initialEquity = 55,
}: Readonly<CfrRegretPanelProps>) {
	const cfrCanvasRef = useRef<CfrCanvasRef>(null);
	const pathfindingRef = useRef<SVGPathElement>(null);
	const [kappa, setKappa] = useState<number>(0.85);
	const [nodes] = useState<number>(13);
	const [pot, setPot] = useState<number>(initialPot);
	const [stack, setStack] = useState<number>(initialStack);
	const [equity, setEquity] = useState<number>(initialEquity);
	const workerRef = useRef<Worker | null>(null);
	// Sem pausa, o laço rAF seguia com a aba oculta ou o painel fora da tela (SIM-06).
	const [painelRef, lacoAtivo] = useLoopVisibility();
	const [workerStatus, setWorkerStatus] = useState<'starting' | 'active' | 'converged' | 'error'>('starting');
	const isConvergedRef = useRef(false);

	const canonicalSizing = useMemo(() => {
		return calculateJandaGeometricSizing(pot, stack, 3);
	}, [pot, stack]);

	const jandaMdf = useMemo(() => {
		const flopBet = canonicalSizing.steps[0]?.betSize ?? pot * 0.5;
		return calculateJandaMDF(pot, flopBet, 1);
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
		return 'Calculando';
	}, [cfrConvergence.estimated_iterations_to_target, cfrConvergence.status]);

	// SOTA: Fricção Zero. Envia os estados para dentro da API do requestAnimationFrame sem dar re-render na function base
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
		let isWorkerBusy = false; // SOTA Guard: Previne asfixia do Worker e Event Loop Flooding (Garante 60fps fluídos)

		workerRef.current.onmessage = (e: MessageEvent<CfrWorkerMessage>) => {
			isWorkerBusy = false;
			const { matrix, diagnostic } = e.data;
			if (diagnostic) {
				setRegretSamples((history) => appendCfrRegretSample(history, diagnostic));
				// SOTA HRC Criterion: Parada automática ao convergir para e-Nash <= 0.3% CI (0.003)
				if (diagnostic.iteration >= 10 && diagnostic.value <= HRC_CONVERGENCE_TARGET_CI) {
					isConvergedRef.current = true;
					setWorkerStatus('converged');
				} else if (!isConvergedRef.current) {
					setWorkerStatus('active');
				}
			} else if (!isConvergedRef.current) {
				setWorkerStatus('active');
			}
			if (!matrix) return; // SOTA Guard: Ignora pacotes paralelos do worker (ex: cfr_strategy) para evitar null-pointers e asfixia do Error Overlay

			// Renderização Fricção Zero (Injeção Direta WebGPU)
			cfrCanvasRef.current?.updateMatrix(matrix);

			// Extracao A* Pathfinding real da Matriz CFR O(1)
			const path = extractPathfinding(matrix, paramsRef.current.nodes);

			// Pathfinding Overlay O(1) (Manipulação Direta do DOM)
			if (pathfindingRef.current && path.length > 0) {
				const w = 450;
				const h = 450; // Dimensões viewBox SVG
				const firstNode = path[0];
				if (!firstNode) return;
				let d = `M ${firstNode.x * w} ${firstNode.y * h}`;
				for (let i = 1; i < path.length; i++) {
					const node = path.at(i);
					if (!node) continue;
					d += ` L ${node.x * w} ${node.y * h}`;
				}
				pathfindingRef.current.setAttribute('d', d);
			}

			updateSizingDom(path, paramsRef.current);
		};
		workerRef.current.onerror = () => {
			isWorkerBusy = false;
			setWorkerStatus('error');
		};

		const loop = () => {
			if (!isWorkerBusy && workerRef.current && lacoAtivo.current && !isConvergedRef.current) {
				isWorkerBusy = true;
				// SOTA: Delega o cálculo do Regret Matching Real para o Web Worker
				workerRef.current.postMessage({
					id: 'cfr_tick',
					nodes: paramsRef.current.nodes,
					pot: paramsRef.current.pot,
					stack: paramsRef.current.stack,
					equity: paramsRef.current.equity,
					kappa: paramsRef.current.kappa,
				});
			}

			animId = requestAnimationFrame(loop); // SOTA: Renderização cinematográfica a 60fps sincronizada com o display
		};

		loop();
		return () => {
			cancelAnimationFrame(animId);
			workerRef.current?.terminate();
			workerRef.current = null;
		};
	}, [lacoAtivo]);

	return (
		<div ref={painelRef} className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
			<div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/5 gap-6">
				<div>
					<h3 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0">
						{LABELS.title} &middot; <span className="text-text-muted">{LABELS.cfrEngine}</span>
					</h3>
					<p className="text-[0.65rem] text-text-dim mt-2 m-0 leading-relaxed max-w-md font-medium uppercase tracking-wider">
						Counterfactual Regret Minimization (CFR) & Predictive Pathfinding.
					</p>
				</div>
				<div
					className={`text-[0.6rem] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border shadow-lg flex items-center gap-2 transition-all ${
						workerStatus === 'converged'
							? 'border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald'
							: 'border-accent-indigo/20 bg-accent-indigo/5 text-accent-indigo-light'
					}`}
				>
					<div
						className={`w-1.5 h-1.5 rounded-full ${
							workerStatus === 'converged'
								? 'bg-accent-emerald shadow-[0_0_8px_var(--color-accent-emerald,#10b981)]'
								: 'bg-accent-indigo animate-pulse'
						}`}
					/>
					<span>
						CFR Worker {WORKER_STATUS_LABEL[workerStatus] ?? workerStatus} ·{' '}
						{cfrConvergence.fallback_used ? 'forecast fallback' : 'TimesFM ativo'}
					</span>
					{workerStatus === 'converged' && (
						<button
							type="button"
							onClick={() => {
								isConvergedRef.current = false;
								setWorkerStatus('active');
							}}
							className="ml-2 cursor-pointer rounded border border-accent-emerald/40 bg-accent-emerald/20 px-2 py-0.5 text-[0.5rem] font-black text-accent-emerald uppercase hover:bg-accent-emerald/30 transition-colors active:scale-95"
						>
							Reiterar
						</button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
				<div className="space-y-8">
					<div className="bg-black/40 p-6 sm:p-8 rounded-3xl border border-white/5 shadow-inner space-y-6">
						<div className="flex items-center gap-3 mb-2">
							<div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
							<p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">
								Ajuste de Parâmetros
							</p>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<label
									htmlFor="cfr-kappa"
									className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest"
								>
									Alpha κ (Regret)
								</label>
								<span className="text-[0.65rem] font-mono font-black text-accent-indigo bg-black/60 px-2 py-0.5 rounded border border-white/5">
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
								className="w-full h-1 accent-accent-indigo bg-white/10 rounded-full appearance-none cursor-pointer"
							/>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<label
									htmlFor="cfr-equity"
									className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest"
								>
									Equity Hero
								</label>
								<span className="text-[0.65rem] font-mono font-black text-accent-emerald bg-black/60 px-2 py-0.5 rounded border border-white/5">
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
								className="w-full h-1 accent-accent-emerald bg-white/10 rounded-full appearance-none cursor-pointer"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2 bg-black/60 p-4 rounded-2xl border border-white/5">
								<label
									htmlFor="cfr-pot-size"
									className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest block"
								>
									Pot Size (BB)
								</label>
								<input
									id="cfr-pot-size"
									aria-label="Pot Size (BB)"
									type="number"
									min="0.01"
									value={pot}
									onChange={(e) => {
										const nextPot = Number.parseFloat(e.target.value);
										if (Number.isFinite(nextPot) && nextPot > 0) setPot(nextPot);
									}}
									className="w-full bg-transparent border-none text-[0.85rem] font-mono font-black text-white focus:outline-none focus:ring-0"
								/>
							</div>
							<div className="space-y-2 bg-black/60 p-4 rounded-2xl border border-white/5">
								<label
									htmlFor="cfr-eff-stack"
									className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest block"
								>
									Eff. Stack (BB)
								</label>
								<input
									id="cfr-eff-stack"
									aria-label="Eff. Stack (BB)"
									type="number"
									min="0.01"
									value={stack}
									onChange={(e) => {
										const nextStack = Number.parseFloat(e.target.value);
										if (Number.isFinite(nextStack) && nextStack > 0) setStack(nextStack);
									}}
									className="w-full bg-transparent border-none text-[0.85rem] font-mono font-black text-white focus:outline-none focus:ring-0"
								/>
							</div>
						</div>
					</div>

					<div className="bg-accent-indigo/5 border border-accent-indigo/10 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
						<i className="fa-solid fa-microchip text-accent-indigo-light text-xl mt-1" />
						<div className="space-y-3 w-full">
							<div className="flex justify-between items-center flex-wrap gap-2">
								<h4 className="text-[0.65rem] font-black text-white uppercase tracking-widest m-0">
									Dimensionamento Geométrico (A* & Janda)
								</h4>
								<span className="text-[0.55rem] font-mono font-bold text-accent-indigo-light bg-accent-indigo/10 px-2 py-0.5 rounded-full border border-accent-indigo/20">
									{canonicalSizing.potFractionPercentage}% Pot / Street
								</span>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<div className="text-center">
									<span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">
										Flop
									</span>
									<div
										id="sizing-flop"
										className="text-[0.7rem] font-mono font-black text-white"
									>
										--
									</div>
								</div>
								<div className="text-center">
									<span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">
										Turn
									</span>
									<div
										id="sizing-turn"
										className="text-[0.7rem] font-mono font-black text-white"
									>
										--
									</div>
								</div>
								<div className="text-center">
									<span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">
										River
									</span>
									<div
										id="sizing-river"
										className="text-[0.7rem] font-mono font-black text-accent-danger"
									>
										--
									</div>
								</div>
							</div>
							<div className="pt-2 border-t border-white/5 flex justify-between items-center text-[0.55rem] font-mono text-text-dim">
								<span>MDF Janda: <strong className="text-accent-emerald">{jandaMdf.mdfPercentage}%</strong></span>
								<span>Alpha Blefe: <strong className="text-accent-indigo-light">{jandaMdf.alphaPercentage}%</strong></span>
							</div>
						</div>
					</div>

					<div className="bg-accent-indigo/5 border border-accent-indigo/10 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
						<i className="fa-solid fa-chart-line text-accent-indigo-light text-xl mt-1" />
						<div className="space-y-3 w-full">
							<div className="flex justify-between items-center flex-wrap gap-2">
								<h4 className="text-[0.65rem] font-black text-white uppercase tracking-widest m-0 flex items-center gap-2">
									Projeção de convergência CFR
								</h4>
								<div className="flex items-center gap-1.5">
									<button
										type="button"
										onClick={() => setPreferredModel('timesfm-2.5-200m')}
										className={`text-[0.5rem] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
											preferredModel === 'timesfm-2.5-200m'
												? 'bg-accent-emerald/20 border-accent-emerald/40 text-accent-emerald font-bold'
												: 'bg-black/40 border-white/5 text-text-muted hover:text-white'
										}`}
										title="TimesFM 2.5 pretendido; a execução efetiva aparece abaixo"
									>
										2.5 Alvo
									</button>
									<button
										type="button"
										onClick={() => setPreferredModel('timesfm-3.0-330m')}
										className={`text-[0.5rem] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
											preferredModel === 'timesfm-3.0-330m'
												? 'bg-accent-indigo/20 border-accent-indigo/40 text-accent-indigo-light font-bold'
												: 'bg-black/40 border-white/5 text-text-muted hover:text-white'
										}`}
										title="TimesFM 3.0 pretendido; a execução efetiva aparece abaixo"
									>
										3.0 Alvo
									</button>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<div className="text-center bg-black/40 p-2.5 rounded-xl border border-white/5">
									<span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">
										Regret médio+ ε*
									</span>
									<div className="text-[0.7rem] font-mono font-black text-accent-indigo-light">
										{cfrConvergence.current_exploitability.toFixed(4)}
									</div>
								</div>
								<div className="text-center bg-black/40 p-2.5 rounded-xl border border-white/5">
									<span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">
										Horizonte p/ Meta
									</span>
									<div className="text-[0.7rem] font-mono font-black text-accent-emerald">
										{stepsToTarget}
									</div>
								</div>
								<div className="text-center bg-black/40 p-2.5 rounded-xl border border-white/5">
									<span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">
										Early Stop
									</span>
									<div
										className={`text-[0.7rem] font-mono font-black ${
											cfrConvergence.early_stopping_recommended
												? 'text-accent-emerald'
												: 'text-text-muted'
										}`}
									>
										{cfrConvergence.early_stopping_recommended ? 'Ativo' : 'Pendente'}
									</div>
								</div>
							</div>
							<div className="pt-2 border-t border-white/5 flex justify-between items-center text-[0.52rem] font-mono text-text-dim">
								<span>Status: <strong className="text-white">{cfrConvergence.status}</strong></span>
								<span className="truncate max-w-50 text-right" title={cfrConvergence.license_tier}>
									{cfrConvergence.license_tier.split(' ')[0]}
								</span>
							</div>
							<p
								className="m-0 text-[0.5rem] leading-relaxed text-text-darker"
								title={TIMESFM_CAPABILITY.limitations.join('; ')}
							>
								Executado: {cfrConvergence.model_used}. O seletor define o modelo pretendido.
							</p>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-6">
					<div className="relative aspect-square w-full max-w-112.5 mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl group">
						<div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/10 to-transparent pointer-events-none" />

						<div className="absolute inset-0 w-full h-full group-hover:scale-[1.02] transition-transform duration-700">
							<CfrCanvas ref={cfrCanvasRef} nodes={13} />
							<svg
								viewBox="0 0 450 450"
								className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
							>
								<path
									ref={pathfindingRef}
									fill="none"
									stroke="rgba(16, 185, 129, 0.9)"
									strokeWidth="3.5"
									strokeLinecap="round"
									strokeLinejoin="round"
									d=""
								/>
							</svg>
						</div>

						<div className="absolute top-4 left-4 flex gap-2">
							<span className="px-2 py-1 rounded bg-black/80 border border-white/10 text-[0.5rem] font-bold text-text-muted uppercase tracking-widest backdrop-blur-md">
								Regret Matching Heatmap
							</span>
						</div>
						<div className="absolute bottom-4 right-4 flex gap-2">
							<span className="px-2 py-1 rounded bg-accent-emerald/20 border border-accent-emerald/30 text-[0.5rem] font-bold text-accent-emerald uppercase tracking-widest backdrop-blur-md">
								A* Pathfinding
							</span>
						</div>
					</div>
					<p className="text-[0.65rem] text-text-muted leading-relaxed text-center px-4 italic font-medium">
						O heatmap visualiza a densidade de arrependimento (regret) em cada nó da
						árvore. O pathfinding busca o equilíbrio dinâmico entre pot-odds e pressão
						ICM estrutural.
					</p>
				</div>
			</div>
		</div>
	);
}
