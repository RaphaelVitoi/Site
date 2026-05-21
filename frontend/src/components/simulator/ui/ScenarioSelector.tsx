'use client';

/**
 * IDENTITY: Seletor de Cenários Agrupado SOTA v4.6 GOLD
 * PATH: src/components/simulator/ui/ScenarioSelector.tsx
 * ROLE: Lista interativa de cenários com transições Framer Motion.
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Scenario } from '../engine/types';

interface ScenarioSelectorProps {
	scenarios: Scenario[];
	activeId: string;
	onSelect: (id: string) => void;
}

export default function ScenarioSelector({
	scenarios,
	activeId,
	onSelect,
}: Readonly<ScenarioSelectorProps>) {
	const grouped = useMemo(() => {
		const groups: Record<string, Scenario[]> = {};
		scenarios.forEach((s) => {
			const cat = s.category || 'Outros';
			if (!groups[cat]) groups[cat] = [];
			groups[cat].push(s);
		});
		return groups;
	}, [scenarios]);

	return (
		<div className="flex flex-col gap-6 animate-sota-in">
			<div className="px-2">
				<h3 className="text-[0.65rem] font-black text-white uppercase tracking-[0.4em] mb-1 flex items-center gap-3">
					<div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
					Atlas de Cenários
				</h3>
				<p className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest">
					Selecione a topologia de conflito
				</p>
			</div>

			<div className="space-y-4">
				{Object.entries(grouped).map(([cat, items]) => (
					<div key={cat} className="space-y-2">
						<div className="flex items-center gap-4 px-2 opacity-60">
							<span className="text-[0.5rem] font-black text-text-muted uppercase tracking-[0.3em] whitespace-nowrap">
								{cat}
							</span>
							<div className="h-px w-full bg-white/5" />
						</div>

						<div className="grid grid-cols-1 gap-2">
							{items.map((s) => {
								const isActive = s.id === activeId;
								return (
									<motion.button
										key={s.id}
										whileHover={{ x: 4 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => onSelect(s.id)}
										className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-500 overflow-hidden ${
											isActive
												? 'bg-accent-indigo/20 border-accent-indigo/40 shadow-2xl shadow-indigo-500/10'
												: 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="active-scenario-bg"
												className="absolute inset-0 bg-linear-to-r from-accent-indigo/10 to-transparent pointer-events-none"
											/>
										)}

										<div className="flex justify-between items-center relative z-10 min-w-0">
											<div className="flex flex-col gap-0.5 min-w-0 pr-4">
												<span
													className={`text-[0.7rem] font-black uppercase tracking-wider transition-colors truncate ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}
												>
													{s.name}
												</span>
												<span className="text-[0.45rem] font-bold text-text-darker uppercase tracking-widest truncate">
													{s.narrativeSubtitle}
												</span>
											</div>

											<div
												className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-accent-indigo text-white scale-110 rotate-90 shadow-lg shadow-indigo-500/40' : 'bg-white/5 text-text-darker group-hover:bg-white/10'}`}
											>
												<i className="fa-solid fa-chevron-right text-[0.5rem]" />
											</div>
										</div>
									</motion.button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
