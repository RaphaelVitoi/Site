'use client';

/**
 * IDENTITY: Simulador de Downward Drift SOTA Quantum
 * PATH: src/components/simulator/DownwardDriftSimulator.tsx
 * ROLE: Analisar a erosão de stack e o aprisionamento no pote (Pot Entrapment).
 * PRINCIPLE: Fricção Zero & Estética Sofisticada.
 */

import { useMounted } from '@/hooks/useMounted';
import { calculateRioTension, calculateUtilityEV } from '@/lib/perspectiva';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	CartesianGrid,
	Label,
	Line,
	LineChart,
	Tooltip as RechartsTooltip,
	ReferenceLine,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from 'recharts';
import { useSotaSync } from './hooks/useSotaSync';
import type { MultiwayRioRequest, SimulatorWorkerResponse } from './workers/insolvencyProtocol';

interface DriftPreset {
	label: string;
	stack: number;
	invested: number;
	pot: number;
	players: number;
}

const DRIFT_PRESETS: DriftPreset[] = [
	{ label: 'Flop C-Bet (Leve)', stack: 40, invested: 6, pot: 12, players: 2 },
	{ label: 'Turn Barrel (Forte)', stack: 35, invested: 16, pot: 26, players: 2 },
	{ label: 'Multiway 4-Way (N²)', stack: 30, invested: 10, pot: 32, players: 4 },
	{ label: 'River Jam (Commitment)', stack: 25, invested: 22, pot: 48, players: 2 },
];

export function DownwardDriftSimulator() {
	const isMounted = useMounted();
	const { physics, updatePhysics, isHydrated } = useSotaSync();

	const workerRef = useRef<Worker | null>(null);
	const [multiwayRioMatrix, setMultiwayRioMatrix] = useState<Float32Array | null>(null);
	const [activePlayers, setActivePlayers] = useState<number>(3);
	const maxPlayers = 9;
	const sprLevels = 20;

	useEffect(() => {
		const worker = new Worker(new URL('./workers/insolvency.worker.ts', import.meta.url), {
			type: 'module',
		});

		workerRef.current = worker;
		worker.onmessage = (e: MessageEvent<SimulatorWorkerResponse | undefined>) => {
			if (e.data?.type === 'MULTIWAY_RIO_RESULT' && e.data.id === 'drift_rio' &&
				e.data.matrix instanceof Float32Array && e.data.matrix.length === maxPlayers * sprLevels &&
				e.data.matrix.every(Number.isFinite)) {
				setMultiwayRioMatrix(e.data.matrix);
			}
		};

		// Grade do modelo de trabalho existente, calculada fora da interface.
		worker.postMessage({
			type: 'MULTIWAY_RIO',
			maxPlayers,
			sprLevels,
			baseTension: 0.15,
			id: 'drift_rio',
		} satisfies MultiwayRioRequest);

		return () => { worker.terminate(); workerRef.current = null; };
	}, []);

	const [baseRioLiability] = useState(15);

	const isOop = physics.position === 'OOP';
	const activeTension = isOop
		? calculateRioTension(
				physics.heroInvested,
				physics.pot,
				physics.heroStack,
				'OOP',
				baseRioLiability,
			)
		: calculateRioTension(
				physics.heroInvested,
				physics.pot,
				physics.heroStack,
				'IP',
				baseRioLiability,
			);

	const { potEntrapment, chartData, crossoverPoint } = useMemo(() => {
		const betToCall = physics.pot * 0.5;
		const entrapment = (physics.heroInvested + betToCall) / Math.max(0.1, physics.heroStack);
		// SOTA v7.0 GOLD: Unificacao do Damping e Multiway N2
		const data = [];
		let firstCrossover = null;

		for (let invested = 0; invested <= physics.heroStack; invested += 2) {
			let simIpTension = calculateRioTension(
				invested,
				physics.pot,
				physics.heroStack,
				'IP',
				baseRioLiability,
			);
			let simOopTension = calculateRioTension(
				invested,
				physics.pot,
				physics.heroStack,
				'OOP',
				baseRioLiability,
			);

			// SOTA: Injeção O(1) do Multiway RIO Profiler da VRAM (WASM)
			if (multiwayRioMatrix) {
				const spr = Math.max(
					1,
					Math.min(
						sprLevels,
						Math.round(
							(physics.heroStack - invested) / Math.max(0.1, physics.pot + invested),
						),
					),
				);
				const rioIndex = (activePlayers - 1) * sprLevels + (spr - 1);
				const dynamicRio = multiwayRioMatrix[rioIndex] ?? 0;
				simIpTension += dynamicRio;
				simOopTension += dynamicRio;
			}

			const pctInvested = (invested / physics.heroStack) * 100;

			if (firstCrossover === null && simOopTension >= 1) firstCrossover = pctInvested;

			const fakeChipEv = 50 - invested * 1.5;
			const fakeUtilityEv = calculateUtilityEV(fakeChipEv, physics.referenceStatus);

			data.push({
				investedPct: Number(pctInvested.toFixed(0)),
				ipTension: Number((simIpTension * 100).toFixed(1)),
				oopTension: Number((simOopTension * 100).toFixed(1)),
				chipEv: Number(fakeChipEv.toFixed(1)),
				utilityEv: Number(fakeUtilityEv.toFixed(1)),
				threshold: Math.min(50, 20 + (invested / (physics.pot + invested)) * 30),
			});
		}

		return {
			potEntrapment: entrapment,
			chartData: data,
			crossoverPoint: firstCrossover,
		};
	}, [
		physics.heroInvested,
		physics.pot,
		physics.heroStack,
		baseRioLiability,
		physics.referenceStatus,
		multiwayRioMatrix,
		activePlayers,
	]);

	// SOTA Guard: Previne CLS (Cumulative Layout Shift) e blinda o Recharts (ResponsiveContainer)
	// e a FFI do WebWorker contra colapsos de assimetria DOM/Node.js durante o SSR.
	if (!isMounted || !isHydrated) {
		return (
			<div className="glass-panel p-8 flex flex-col items-center justify-center min-h-125 border-accent-indigo/10 max-w-5xl mx-auto bg-black/20 animate-pulse rounded-2xl">
				<i className="fa-solid fa-chart-line text-accent-indigo text-4xl mb-4 opacity-50" />
				<div className="text-text-muted text-xs font-black uppercase tracking-widest font-mono">
					Sincronizando Telemetria Drift...
				</div>
			</div>
		);
	}

	return (
		<div className="glass-panel p-8 sm:p-10 lg:p-12 space-y-8 animate-sota-in border-accent-indigo/10 max-w-5xl mx-auto relative overflow-hidden shadow-2xl">
			<div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/10 blur-[100px] rounded-full pointer-events-none" />
			<div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
				<div>
					<h2 className="text-xl font-black text-text-bright uppercase tracking-tighter flex items-center gap-3">
						<i className="fa-solid fa-chart-line text-accent-indigo" /> Downward Drift
						&amp; Entrapment
					</h2>
					<p className="text-[0.65rem] text-text-muted font-mono uppercase tracking-widest mt-1 opacity-60">
						Sincronia Quantum Ativa
					</p>
				</div>
				<div className="flex gap-4">
					<div className="bg-bg-deep border border-white/5 px-4 py-2 rounded-xl">
						<span className="text-label text-accent-emerald">
							Tensão Ativa: {(activeTension * 100).toFixed(1)}%
						</span>
					</div>
				</div>
			</div>

			{/* Presets Rápidos de Entrapment */}
			<div className="flex flex-col gap-2 relative z-10">
				<span className="text-[0.55rem] font-black text-text-muted uppercase tracking-wider">
					Cenários Táticos de Pós-Flop:
				</span>
				<div className="flex flex-wrap gap-2">
					{DRIFT_PRESETS.map((p) => (
						<button
							key={p.label}
							type="button"
							onClick={() => {
								updatePhysics({ heroStack: p.stack, heroInvested: p.invested, pot: p.pot });
								setActivePlayers(p.players);
							}}
							className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[0.6rem] font-bold text-text-muted hover:text-white transition-all active:scale-95 cursor-pointer"
						>
							{p.label}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
				<div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/5">
					<div className="space-y-2">
						<div className="flex justify-between items-end mb-1">
							<span className="text-label opacity-50">Stack do Hero</span>
							<span className="text-sm font-black font-mono text-text-bright">
								{physics.heroStack}bb
							</span>
						</div>
						<input
							aria-label="Stack do Hero"
							type="range"
							min="10"
							max="100"
							value={physics.heroStack}
							onChange={(e) => updatePhysics({ heroStack: Number(e.target.value) })}
							className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-indigo cursor-pointer"
						/>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between items-end mb-1">
							<span className="text-label opacity-50">Sunk Cost (Investido)</span>
							<span className="text-sm font-black font-mono text-accent-amber">
								{physics.heroInvested}bb
							</span>
						</div>
						<input
							aria-label="Sunk Cost (Investido)"
							type="range"
							min="0"
							max={physics.heroStack}
							value={physics.heroInvested}
							onChange={(e) =>
								updatePhysics({ heroInvested: Number(e.target.value) })
							}
							className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-amber cursor-pointer"
						/>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between items-end mb-1">
							<span className="text-label opacity-50">Jogadores (Multiway N²)</span>
							<span className="text-sm font-black font-mono text-accent-danger">
								{activePlayers}
							</span>
						</div>
						<input
							aria-label="Jogadores (Multiway N²)"
							type="range"
							min="2"
							max="9"
							value={activePlayers}
							onChange={(e) => setActivePlayers(Number(e.target.value))}
							className="w-full h-1 bg-white/10 rounded-full appearance-none accent-accent-danger cursor-pointer"
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="bg-bg-deep/40 p-6 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
						<span className="text-[0.5rem] text-text-darker font-black uppercase tracking-widest mb-2">
							Entrapment Ratio
						</span>
						<span className="text-3xl font-black text-accent-indigo font-heading tracking-tighter">
							{(potEntrapment * 100).toFixed(1)}%
						</span>
					</div>
					<div className="bg-bg-deep/40 p-6 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
						<span className="text-[0.5rem] text-text-darker font-black uppercase tracking-widest mb-2">
							Pot Size
						</span>
						<span className="text-3xl font-black text-text-bright font-heading tracking-tighter">
							{physics.pot}bb
						</span>
					</div>
				</div>
			</div>

			<div className="pt-8 border-t border-white/5 relative z-10">
				<h3 className="text-label text-center mb-8 opacity-40">
					Curva de Aprisionamento Fractal
				</h3>
				<div className="relative h-72 w-full min-h-72">
					<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
						<LineChart data={chartData}>
							<defs>
								<filter id="glowDrift" x="-20%" y="-20%" width="140%" height="140%">
									<feGaussianBlur stdDeviation="4" result="blur" />
									<feComposite in="SourceGraphic" in2="blur" operator="over" />
								</filter>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.02)"
								vertical={false}
							/>
							<XAxis dataKey="investedPct" hide />
							<YAxis domain={[0, 100]} hide />
							<RechartsTooltip
								isAnimationActive={false}
								allowEscapeViewBox={{ x: true, y: true }}
								wrapperStyle={{ zIndex: 1000 }}
								contentStyle={{
									backgroundColor: 'var(--bg-panel)',
									border: '1px solid rgba(255,255,255,0.05)',
									borderRadius: '12px',
								}}
							/>
							{crossoverPoint !== null && (
								<ReferenceLine
									x={crossoverPoint}
									stroke="var(--accent-danger)"
									strokeDasharray="4 4"
								>
									<Label
										value="COLAPSO OOP"
										position="insideTopLeft"
										fill="var(--accent-danger)"
										fontSize={9}
										fontWeight={900}
									/>
								</ReferenceLine>
							)}
							<Line
								type="monotone"
								name="Tensão IP"
								dataKey="ipTension"
								stroke="var(--accent-indigo)"
								strokeWidth={4}
								dot={false}
								filter="url(#glowDrift)"
								isAnimationActive={false}
							/>
							<Line
								type="monotone"
								name="Tensão OOP"
								dataKey="oopTension"
								stroke="var(--accent-danger)"
								strokeWidth={4}
								dot={false}
								filter="url(#glowDrift)"
								isAnimationActive={false}
							/>
							<Line
								type="monotone"
								name="Utilidade"
								dataKey="utilityEv"
								stroke="var(--accent-amber)"
								strokeWidth={2}
								strokeDasharray="5 5"
								dot={false}
								isAnimationActive={false}
							/>
							<Line
								type="monotone"
								name="Teto do RP"
								dataKey="threshold"
								stroke="var(--accent-sky)"
								strokeWidth={2}
								strokeDasharray="3 3"
								dot={false}
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>

				{/* Legenda Analítica das Curvas */}
				<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-[0.6rem] font-mono">
					<div className="flex items-center gap-2">
						<span className="w-3 h-0.5 bg-accent-indigo rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
						<span className="text-white font-bold">Tensão IP</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="w-3 h-0.5 bg-accent-danger rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
						<span className="text-white font-bold">Tensão OOP</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="w-3 h-0.5 border-t border-dashed border-accent-amber" />
						<span className="text-accent-amber font-bold">Utilidade Monetária</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="w-3 h-0.5 border-t border-dotted border-accent-sky" />
						<span className="text-accent-sky font-bold">Teto do RP</span>
					</div>
				</div>
			</div>
		</div>
	);
}
