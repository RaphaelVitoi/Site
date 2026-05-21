'use client';

import type { ReferencePointStatus } from '@/lib/perspectiva';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSotaSync } from './hooks/useSotaSync';

export function SotaHubNavbar() {
	const pathname = usePathname();
	const { physics, updatePhysics, isHydrated } = useSotaSync();

	if (!isHydrated) return null;

	const isActive = (path: string) => pathname === path;

	return (
		<div className="sticky top-24 z-40 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-4">
			<div className="sota-glass-pill px-5 py-3 flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
				{/* Navigation Links */}
				<nav className="flex items-center justify-center gap-2 flex-wrap w-full lg:w-auto">
					<Link
						href="/simulador"
						className={`px-4 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all ${isActive('/simulador') ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
					>
						<i className="fa-solid fa-microchip mr-2"></i> Motor Mestre
					</Link>
					<Link
						href="/simulador/gto-cfr"
						className={`px-4 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all ${isActive('/simulador/gto-cfr') ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
					>
						<i className="fa-solid fa-brain mr-2"></i> Laboratório CFR
					</Link>
				</nav>

				{/* Global Physics State Indicator */}
				<div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 bg-black/60 px-5 py-2 rounded-3xl border border-white/10 shadow-inner text-xs font-mono text-text-muted w-full lg:w-auto mt-2 lg:mt-0 backdrop-blur-md">
					<div className="flex items-center gap-2">
						<span className="text-accent-emerald font-black uppercase tracking-widest text-[0.65rem]">
							Hero:
						</span>{' '}
						<span className="font-mono text-white font-bold">
							{physics.heroStack}bb
						</span>
					</div>
					<div className="hidden sm:block w-px h-4 bg-white/20"></div>
					<div className="flex items-center gap-2">
						<span className="text-accent-indigo-light font-black uppercase tracking-widest text-[0.65rem]">
							Pote:
						</span>{' '}
						<span className="font-mono text-white font-bold">{physics.pot}bb</span>
					</div>
					<div className="hidden sm:block w-px h-4 bg-white/20"></div>
					<div className="flex items-center gap-2">
						<span
							className={
								physics.position === 'IP'
									? 'text-accent-emerald font-black uppercase tracking-widest text-[0.65rem]'
									: 'text-accent-danger font-black uppercase tracking-widest text-[0.65rem]'
							}
						>
							{physics.position}
						</span>
					</div>
					<div className="hidden sm:block w-px h-4 bg-white/20"></div>
					<div className="flex items-center gap-2">
						<select
							className="bg-transparent border-none text-[0.65rem] text-accent-amber font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:text-accent-gold transition-colors"
							title="Status de Referência"
							aria-label="Status de Referência"
							value={physics.referenceStatus}
							onChange={(e) =>
								updatePhysics({
									referenceStatus: e.target.value as ReferencePointStatus,
								})
							}
						>
							<option value="baseline" className="bg-bg-deep text-white">
								Baseline (EV)
							</option>
							<option value="tilt" className="bg-bg-deep text-white">
								Stuck / Tilt
							</option>
							<option value="protecting" className="bg-bg-deep text-white">
								Protecting Win
							</option>
							<option value="bubble" className="bg-bg-deep text-white">
								Bubble Survival
							</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
}
