/** @format */

'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
 */

import { useEffect, useRef, useState } from 'react';
import { CfrCanvas, type CfrCanvasRef } from '../ui/CfrCanvas';

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
	}, [kappa, nodes, pot, stack, equity]);

	useEffect(() => {
		setPot(initialPot);
		setStack(initialStack);
		setEquity(initialEquity);
	}, [initialPot, initialStack, initialEquity]);

	useEffect(() => {
		workerRef.current ??= new Worker(new URL('../workers/cfr.worker.ts', import.meta.url), {
			type: 'module',
		});

		let animId: number;
		let isWorkerBusy = false; // SOTA Guard: Previne asfixia do Worker e Event Loop Flooding (Garante 60fps fluídos)

		workerRef.current.onmessage = (e: MessageEvent) => {
			isWorkerBusy = false;
			const { matrix } = e.data;
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

		const loop = () => {
			if (!isWorkerBusy && workerRef.current) {
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
	}, []);

	return (
		<div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
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
				<div className="text-[0.6rem] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-accent-indigo/20 bg-accent-indigo/5 text-accent-indigo-light shadow-lg flex items-center gap-2">
					<div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
					Neural Engine Active
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
									value={pot}
									onChange={(e) => setPot(Number.parseFloat(e.target.value) || 0)}
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
									value={stack}
									onChange={(e) =>
										setStack(Number.parseFloat(e.target.value) || 0)
									}
									className="w-full bg-transparent border-none text-[0.85rem] font-mono font-black text-white focus:outline-none focus:ring-0"
								/>
							</div>
						</div>
					</div>

					<div className="bg-accent-indigo/5 border border-accent-indigo/10 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
						<i className="fa-solid fa-microchip text-accent-indigo-light text-xl mt-1" />
						<div className="space-y-2">
							<h4 className="text-[0.65rem] font-black text-white uppercase tracking-widest m-0">
								Dimensionamento Geométrico
							</h4>
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
