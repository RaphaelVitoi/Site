/**
 * IDENTITY: Navegação de Ferramentas SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/SimulatorNavigation.tsx
 * ROLE: Orquestrador de visualização para as ferramentas do laboratório.
 */

import { motion } from 'framer-motion';
import type { ActiveTool } from '../MasterSimulator';

interface SimulatorNavigationProps {
	readonly activeTool: ActiveTool;
	readonly onSelectTool: (tool: ActiveTool) => void;
}

export default function SimulatorNavigation({
	activeTool,
	onSelectTool,
}: Readonly<SimulatorNavigationProps>) {
	const tools: {
		id: ActiveTool;
		label: string;
		icon: string;
		color: string;
	}[] = [
		{
			id: 'scenario',
			label: 'Cenário Ativo',
			icon: 'fa-chess-board',
			color: 'indigo',
		},
		{
			id: 'perspectiva',
			label: 'Quantum PM',
			icon: 'fa-atom',
			color: 'emerald',
		},
		{
			id: 'calculator',
			label: 'Calculadora',
			icon: 'fa-calculator',
			color: 'sky',
		},
		{
			id: 'matchup',
			label: 'Matchups',
			icon: 'fa-people-arrows',
			color: 'violet',
		},
		{
			id: 'comparar',
			label: 'Radar Topologia',
			icon: 'fa-bullseye',
			color: 'indigo',
		},
		{ id: 'posflop', label: 'Pós-Flop', icon: 'fa-layer-group', color: 'rose' },
		{ id: 'cfr', label: 'CFR & IA', icon: 'fa-network-wired', color: 'rose' },
	];

	return (
		<nav className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner relative overflow-hidden group/nav w-full max-w-full justify-between">
			<div className="absolute inset-0 bg-radial-[at_top_left] from-accent-indigo/5 to-transparent pointer-events-none min-w-full" />

			{tools.map((t) => {
				const isActive = activeTool === t.id;

				return (
					<button
						key={t.id}
						onClick={() => onSelectTool(t.id)}
						aria-current={isActive ? 'page' : undefined}
						aria-selected={isActive}
						role="tab"
						className={`relative px-5 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-[0.35em] transition-all duration-500 flex items-center gap-3 whitespace-nowrap active:scale-95 group/btn shrink-0 ${
							isActive
								? 'text-white'
								: 'text-text-darker hover:text-text-muted hover:bg-white/2'
						}`}
					>
						{isActive && (
							<motion.div
								layoutId="active-tool-bg"
								className="absolute inset-0 bg-accent-indigo/15 border border-accent-indigo/30 rounded-xl shadow-2xl shadow-indigo-500/10"
								transition={{ type: 'spring', bounce: 0.1, duration: 0.7 }}
							/>
						)}

						<div
							className={`relative z-10 flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-40 group-hover/btn:opacity-80'}`}
						>
							<i
								className={`fa-solid ${t.icon} ${isActive ? 'text-accent-indigo text-glow-indigo' : ''}`}
							/>
						</div>

						<span className="relative z-10">{t.label}</span>
					</button>
				);
			})}
		</nav>
	);
}
