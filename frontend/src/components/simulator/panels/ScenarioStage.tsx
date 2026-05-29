'use client';

/**
 * IDENTITY: Palco do Cenário SOTA Quantum v7.0 GOLD
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibir a narrativa tática e os medidores de risco com refinamento estético extremo.
 * BINDING: [engine/types.ts, engine/utils.ts, ui/RiskGauge]
 */

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { calcBF } from '@/components/simulator/engine/utils';
import type { Scenario } from '../engine/types';
import RiskGauge from '../ui/RiskGauge';

interface ScenarioStageProps {
	scenario: Scenario;
	effectiveIpRp?: number;
	effectiveOopRp?: number;
	/** SOTA: Horizonte dinâmico vindo do motor quântico */
	dynamicDeathZone?: number;
}

export default function ScenarioStage({
	scenario,
	effectiveIpRp = scenario.ipRp,
	effectiveOopRp = scenario.oopRp,
	dynamicDeathZone,
}: Readonly<ScenarioStageProps>) {
	const ipMorph = scenario.ipMorph ?? '--';
	const oopMorph = scenario.oopMorph ?? '--';
	const isNodelockB20 =
		scenario.name?.includes('B20') || scenario.narrativeTitle?.includes('B20');

	return (
		<div className="glass-panel animate-sota-in relative transition-all duration-700 hover:border-white/20 group/stage">
			{/* Depth Layers Gold */}
			<div className="absolute inset-0 overflow-hidden rounded-4xl pointer-events-none">
				<div className="absolute -top-32 -right-32 w-80 h-84 bg-accent-indigo/10 blur-[140px] rounded-full pointer-events-none group-hover/stage:bg-accent-indigo/20 transition-all duration-1000" />
				<div className="absolute -bottom-32 -left-32 w-80 h-84 bg-accent-emerald/5 blur-[140px] rounded-full pointer-events-none" />
			</div>

			{/* Header Refinado com Hierarquia Clara */}
			<div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-white/5 pb-12 relative z-10">
				<div className="space-y-6">
					<div className="flex items-center gap-5">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-indigo shadow-[0_0_20px_var(--accent-indigo)] animate-pulse" />
						<h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none m-0">
							{isNodelockB20 ? 'Ancoragem: Block Bet (20%)' : scenario.narrativeTitle}
						</h2>
					</div>
					<div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-4">
						<i className="fa-solid fa-layer-group text-accent-indigo text-[0.8rem]" />
						<span className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-text-muted">
							{scenario.narrativeSubtitle}
						</span>
					</div>
				</div>

				<div className="flex flex-col items-end gap-4">
					<span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.5em]">
						Diagnóstico SOTA GOLD
					</span>
					<div className="px-8 py-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/20 text-[0.75rem] font-black text-accent-rose-light uppercase tracking-[0.3em] shadow-2xl flex items-center gap-4 active:scale-95 transition-transform">
						<div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse shadow-[0_0_12px_var(--accent-rose)]" />
						{scenario.verdict}
					</div>
				</div>
			</div>

			{/* Box de Teoria com Estética High-End */}
			<div className="my-14 relative group/theory">
				<div className="absolute -inset-1 bg-linear-to-r from-accent-indigo/20 via-transparent to-accent-rose/20 rounded-[2.5rem] opacity-0 group-hover/theory:opacity-100 transition-opacity duration-1000 blur-md" />
				<div
					className={`relative p-12 rounded-[2rem] border transition-all duration-700 shadow-inner ${isNodelockB20 ? 'bg-accent-indigo/10 border-accent-indigo/30 shadow-accent-indigo/5' : 'bg-slate-950/50 border-white/5 hover:bg-slate-950/70 hover:border-white/10'} text-[1.05rem] leading-relaxed`}
				>
					{isNodelockB20 ? (
						<p className="text-indigo-100/90 font-medium italic m-0">
							&quot;A dinâmica foi travada via Nodelock. Agressor forçado a apostar
							pequeno para absorver fold equity sem inflar as RIOs.&quot;
						</p>
					) : (
						<div className="text-indigo-100/90 font-medium italic italic-sota-markdown">
							<SotaMarkdown content={scenario.theory} />
						</div>
					)}
					<div className="absolute bottom-6 right-8 flex items-center gap-3 opacity-30 group-hover/theory:opacity-60 transition-opacity">
						<i className="fa-solid fa-quote-right text-accent-indigo text-2xl" />
					</div>
				</div>
			</div>

			{/* Grid de Medidores - Simetria SOTA */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-20 pt-8 relative z-10">
				<div className="flex flex-col items-center gap-12 group/ip transition-all duration-500">
					<RiskGauge
						value={effectiveIpRp}
						label="Agressor (IP)"
						pos={scenario.ipPos}
						stack={ipMorph}
						opponentValue={effectiveOopRp}
						{...(dynamicDeathZone === undefined ? {} : { dynamicDeathZone })}
					/>
					<div className="bg-slate-900/60 px-12 py-6 rounded-3xl border border-white/5 text-center group-hover/ip:border-accent-indigo/40 group-hover/ip:bg-slate-900/80 transition-all shadow-2xl relative overflow-hidden">
						<div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/10 to-transparent opacity-0 group-hover/ip:opacity-100 transition-opacity" />
						<span className="text-[0.65rem] font-black text-text-darker uppercase tracking-[0.5em] block mb-4 group-hover/ip:text-accent-indigo-light transition-colors relative z-10">
							Impacto Posicional
						</span>
						<div className="flex items-center justify-center gap-6 relative z-10">
							<span className="text-[1.1rem] font-mono font-black text-white tracking-tighter">
								{effectiveIpRp.toFixed(1)}%{' '}
								<span className="text-text-darker text-[0.7rem] ml-1">RP</span>
							</span>
							<div className="w-px h-8 bg-white/10" />
							<span className="text-[1.1rem] font-mono font-black text-white tracking-tighter">
								{calcBF(effectiveIpRp).toFixed(2)}x{' '}
								<span className="text-text-darker text-[0.7rem] ml-1">BF</span>
							</span>
						</div>
					</div>
				</div>

				<div className="flex flex-col items-center gap-12 group/oop transition-all duration-500">
					<RiskGauge
						value={effectiveOopRp}
						label="Defensor (OOP)"
						pos={scenario.oopPos}
						stack={oopMorph}
						opponentValue={effectiveIpRp}
					/>
					<div className="bg-slate-900/60 px-12 py-6 rounded-3xl border border-white/5 text-center group-hover/oop:border-accent-rose/40 group-hover/oop:bg-slate-900/80 transition-all shadow-2xl relative overflow-hidden">
						<div className="absolute inset-0 bg-radial-[at_center_center] from-accent-rose/10 to-transparent opacity-0 group-hover/oop:opacity-100 transition-opacity" />
						<span className="text-[0.65rem] font-black text-text-darker uppercase tracking-[0.5em] block mb-4 group-hover/oop:text-accent-rose-light transition-colors relative z-10">
							Vulnerabilidade
						</span>
						<div className="flex items-center justify-center gap-6 relative z-10">
							<span className="text-[1.1rem] font-mono font-black text-white tracking-tighter">
								{effectiveOopRp.toFixed(1)}%{' '}
								<span className="text-text-darker text-[0.7rem] ml-1">RP</span>
							</span>
							<div className="w-px h-8 bg-white/10" />
							<span className="text-[1.1rem] font-mono font-black text-white tracking-tighter">
								{calcBF(effectiveOopRp).toFixed(2)}x{' '}
								<span className="text-text-darker text-[0.7rem] ml-1">BF</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
