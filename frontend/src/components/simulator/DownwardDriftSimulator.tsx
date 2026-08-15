'use client';

/**
 * IDENTITY: Simulador de Downward Drift SOTA Quantum
 * PATH: src/components/simulator/DownwardDriftSimulator.tsx
 * ROLE: Analisar a erosÃ£o de stack e o aprisionamento no pote (Pot Entrapment).
 * PRINCIPLE: FricÃ§Ã£o Zero & EstÃ©tica Sofisticada.
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

export function DownwardDriftSimulator() {
	const isMounted = useMounted();
	const { physics, updatePhysics, isHydrated } = useSotaSync();

	const workerRef = useRef<Worker | null>(null);
	const [multiwayRioMatrix, setMultiwayRioMatrix] = useState<Float32Array | null>(null);
	const [activePlayers, setActivePlayers] = useState<number>(3);
	const maxPlayers = 9;
	const sprLevels = 20;

	useEffect(() => {
		workerRef.current = new Worker(new URL('./workers/insolvency.worker.ts', import.meta.url), {
			type: 'module',
		});

		workerRef.current.onmessage = (e) => {
			if (e.data.type === 'MULTIWAY_RIO_RESULT') {
				setMultiwayRioMatrix(e.data.matrix);
			}
		};

		// IgniÃ§Ã£o do Profiler N^2 na VRAM
		workerRef.current.postMessage({
			type: 'MULTIWAY_RIO',
			maxPlayers,
			sprLevels,
			baseTension: 0.15,
			id: 'drift_rio',
		});

		return () => workerRef.current?.terminate();
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

			// SOTA: InjeÃ§Ã£o O(1) do Multiway RIO Profiler da VRAM (WASM)
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
							TensÃ£o Ativa: {(activeTension * 100).toFixed(1)}%
						</span>
					</div>
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
							<span className="text-label opacity-50">Jogadores (Multiway NÂ²)</span>
							<span className="text-sm font-black font-mono text-accent-danger">
								{activePlayers}
							</span>
						</div>
						<input
							aria-label="Jogadores (Multiway NÂ²)"
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
			</div>
		</div>
	);
}

