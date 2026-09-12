'use client';

/**
 * IDENTITY: Orquestrador GTO/CFR SOTA
 * PATH: src/components/simulator/GtoCfrContent.tsx
 * ROLE: Unificar a interface laboratorial eliminando código esquizofrênico legado.
 */

import { Suspense, useState } from 'react';
import CfrRegretPanel from '@/components/simulator/panels/CfrRegretPanel';
import PluribusMultiwayPanel from '@/components/simulator/panels/PluribusMultiwayPanel';
import BayesianBeliefPanel from '@/components/simulator/panels/BayesianBeliefPanel';
import PredictiveProfilePanel from '@/components/simulator/panels/PredictiveProfilePanel';

export interface GtoCfrContentProps {
	initialPot?: number | undefined;
	initialStack?: number | undefined;
	initialEquity?: number | undefined;
}

function GtoCfrContentInner({
	initialPot = 2.5,
	initialStack = 40,
	initialEquity = 55,
}: Readonly<GtoCfrContentProps>) {
	const [solverMode, setSolverMode] = useState<'heads_up' | 'multiway'>('heads_up');

	return (
		<main className="sota-container mt-8 space-y-14 animate-sota-in pb-24">
			{/* SELETOR DE MODO DO SOLVER */}
			<div className="flex justify-center">
				<div className="inline-flex p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl gap-2">
					<button
						type="button"
						onClick={() => setSolverMode('heads_up')}
						className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[0.65rem] font-mono font-black uppercase tracking-wider transition-all ${
							solverMode === 'heads_up'
								? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]'
								: 'text-text-dim hover:text-white hover:bg-white/5'
						}`}
					>
						<i className="fa-solid fa-user-group text-xs" />
						Heads-Up CFR+ (2-Way)
					</button>

					<button
						type="button"
						onClick={() => setSolverMode('multiway')}
						className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[0.65rem] font-mono font-black uppercase tracking-wider transition-all ${
							solverMode === 'multiway'
								? 'bg-accent-emerald text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
								: 'text-text-dim hover:text-white hover:bg-white/5'
						}`}
					>
						<i className="fa-solid fa-users text-xs" />
						Multiway PMev (Pluribus 6-Max)
						<span className="text-[0.5rem] font-sans px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
							SOTA
						</span>
					</button>
				</div>
			</div>

			{/* SEÇÃO 1: MOTOR DE JOGO (HEADS-UP CFR+ OU PLURIBUS MULTIWAY) */}
			<div className="w-full">
				{solverMode === 'heads_up' ? (
					<CfrRegretPanel
						initialPot={initialPot}
						initialStack={initialStack}
						initialEquity={initialEquity}
					/>
				) : (
					<PluribusMultiwayPanel />
				)}
			</div>

			{/* SEÇÃO 2: PERFIL E BAYES */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
				<div className="lg:col-span-5 flex flex-col gap-10">
					<PredictiveProfilePanel />

					<div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-4xl relative overflow-hidden group/wisdom">
						<div className="absolute top-0 right-0 p-6 opacity-5">
							<i className="fa-solid fa-quote-left text-7xl text-white"></i>
						</div>
						<p className="text-[0.8rem] text-indigo-100/70 leading-loose m-0 font-medium italic relative z-10">
							&quot;A inteligência artificial não substitui a intuição humana; ela a
							calibra. O CFR minimiza o arrependimento teórico para que você possa
							focar no colapso psicológico do oponente.&quot;
						</p>
						<div className="mt-6 flex items-center gap-3 relative z-10">
							<div className="w-1 h-px bg-accent-indigo" />
							<span className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest">
								Doutrina SOTA v35
							</span>
						</div>
					</div>
				</div>

				<div className="lg:col-span-7">
					<BayesianBeliefPanel />
				</div>
			</div>
		</main>
	);
}

export function GtoCfrContent({
	initialPot,
	initialStack,
	initialEquity,
}: Readonly<GtoCfrContentProps>) {
	return (
		<Suspense
			fallback={
				<div className="sota-container mt-16 text-center text-accent-indigo font-mono text-[0.7rem] uppercase tracking-widest animate-pulse flex flex-col items-center gap-4">
					<i className="fa-solid fa-atom text-2xl animate-spin" /> Sincronizando
					Telemetria Quântica...
				</div>
			}
		>
			<GtoCfrContentInner
				initialPot={initialPot}
				initialStack={initialStack}
				initialEquity={initialEquity}
			/>
		</Suspense>
	);
}
