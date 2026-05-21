'use client';

/**
 * IDENTITY: Orquestrador GTO/CFR SOTA
 * PATH: src/components/simulator/GtoCfrContent.tsx
 * ROLE: Unificar a interface laboratorial eliminando código esquizofrênico legado.
 */

import { Suspense } from 'react';
import CfrRegretPanel from '@/components/simulator/panels/CfrRegretPanel';
import BayesianBeliefPanel from '@/components/simulator/panels/BayesianBeliefPanel';
import PredictiveProfilePanel from '@/components/simulator/panels/PredictiveProfilePanel';

export interface GtoCfrContentProps {
	initialPot?: number;
	initialStack?: number;
	initialEquity?: number;
}

function GtoCfrContentInner({
	initialPot = 2.5,
	initialStack = 40,
	initialEquity = 55,
}: Readonly<GtoCfrContentProps>) {
	return (
		<main className="sota-container mt-12 space-y-16 animate-sota-in pb-24">
			{/* SEÇÃO 1: CFR REGRET MATCHING (WASM SOTA) */}
			<div className="w-full">
				<CfrRegretPanel
					initialPot={initialPot}
					initialStack={initialStack}
					initialEquity={initialEquity}
				/>
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

export function GtoCfrContent(props: Readonly<GtoCfrContentProps>) {
	return (
		<Suspense
			fallback={
				<div className="sota-container mt-16 text-center text-accent-indigo font-mono text-[0.7rem] uppercase tracking-widest animate-pulse flex flex-col items-center gap-4">
					<i className="fa-solid fa-atom text-2xl animate-spin" /> Sincronizando
					Telemetria Quântica...
				</div>
			}
		>
			<GtoCfrContentInner {...props} />
		</Suspense>
	);
}
