/**
 * IDENTITY: Cabeçalho do Simulador SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/SimulatorHeader.tsx
 * ROLE: Orquestrador de status global e navegação persistente.
 */

import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';
import { signOut } from 'next-auth/react';

export interface SimulatorHeaderProps {
	readonly scenarioName?: string;
	readonly stacks?: number[];
	readonly effectiveIpRp?: number;
	readonly effectiveOopRp?: number;
	readonly rpSource?: string;
	readonly sidebarOpen?: boolean;
	readonly onToggleSidebar?: () => void;
}

export default function SimulatorHeader({
	scenarioName,
	effectiveIpRp,
	effectiveOopRp,
	onToggleSidebar,
}: Readonly<SimulatorHeaderProps>) {
	return (
		<header className="px-8 py-5 border-b border-white/10 flex justify-between items-center bg-black/60 backdrop-blur-3xl sticky top-0 z-9999 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
			<div className="flex items-center gap-8">
				<button
					onClick={onToggleSidebar}
					title="Alternar Menu de Cenários"
					aria-label="Alternar Menu de Cenários"
					className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-text-muted hover:text-white transition-all duration-500 group border border-white/10 cursor-pointer active:scale-95"
				>
					<i className="fa-solid fa-bars-staggered group-hover:scale-110 transition-transform" />
				</button>
				<div className="flex items-center gap-5 group/brand">
					<div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center relative overflow-hidden group-hover/brand:border-white/30 transition-all duration-700">
						<div className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-1000 group-hover/brand:opacity-100" />
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="relative z-10 text-white group-hover/brand:scale-110 transition-transform duration-700"
						>
							<path
								d="M12 2L2 7L12 12L22 7L12 2Z"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
							<path
								d="M2 17L12 22L22 17"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
							<path
								d="M2 7V17"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
							<path
								d="M22 7V17"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
							<path
								d="M12 12V22"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<div className="flex flex-col justify-center">
						<h1 className="text-[0.9rem] font-black text-white uppercase tracking-[0.4em] leading-none m-0 transition-all duration-500 group-hover/brand:tracking-[0.5em]">
							SOTA{' '}
							<span className="font-light text-white/60 tracking-widest ml-1">
								v7.0 GOLD
							</span>
						</h1>
						<h2 className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.3em] leading-none m-0 mt-2.5 opacity-90 transition-all duration-500 group-hover/brand:text-text-muted">
							{scenarioName || 'Laboratório Analítico'}
						</h2>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-6">
				<div className="hidden md:flex items-center gap-6 text-[0.7rem] font-mono font-black uppercase tracking-[0.2em] bg-slate-950/80 px-7 py-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
					<SotaTooltip
						title="IP Risk Premium"
						content="A taxa extra de equidade (além das Pot Odds) exigida pelo Agressor para compensar a gravidade do cenário e a morte no torneio."
						align="right"
						position="bottom"
						theme="indigo"
					>
						<div className="flex items-center gap-4 group/rp transition-all duration-500">
							<div className="relative flex items-center justify-center w-3 h-3">
								<span className="absolute w-full h-full rounded-full bg-accent-indigo opacity-40 animate-ping" />
								<span className="relative w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
							</div>
							<span className="text-text-muted group-hover/rp:text-white transition-colors">IP RP</span>
							<span className="text-white text-[1rem] tabular-nums group-hover/rp:text-glow-indigo transition-all">
								{effectiveIpRp?.toFixed(1)}%
							</span>
						</div>
					</SotaTooltip>

					<div className="w-px h-6 bg-white/10" />

					<SotaTooltip
						title="OOP Risk Premium"
						content="A vulnerabilidade sistêmica do Defensor. RPs altos forçam overfold estrutural porque cada call errado custa o fim do torneio."
						align="right"
						position="bottom"
						theme="rose"
					>
						<div className="flex items-center gap-4 group/rp-oop transition-all duration-500">
							<div className="relative flex items-center justify-center w-3 h-3">
								<span className="absolute w-full h-full rounded-full bg-accent-rose opacity-40 animate-ping [animation-delay:500ms]" />
								<span className="relative w-2 h-2 rounded-full bg-accent-rose shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
							</div>
							<span className="text-text-muted group-hover/rp-oop:text-white transition-colors">OOP RP</span>
							<span className="text-white text-[1rem] tabular-nums group-hover/rp-oop:text-glow-rose transition-all">
								{effectiveOopRp?.toFixed(1)}%
							</span>
						</div>
					</SotaTooltip>
				</div>

				<button
					onClick={() => signOut({ callbackUrl: '/login' })}
					className="flex items-center justify-center w-11 h-11 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-2xl hover:bg-accent-rose/20 hover:border-accent-rose/40 active:scale-90 transition-all shadow-xl cursor-pointer group"
					title="Fuga Quântica (Logout)"
				>
					<i className="fa-solid fa-power-off group-hover:scale-110 transition-transform duration-500" />
				</button>
			</div>
		</header>
	);
}
