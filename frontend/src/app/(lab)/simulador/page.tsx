'use client';

/**
 * IDENTITY: Simulador Mestre ICM SOTA v7.0 GOLD
 * PATH: src/app/(lab)/simulador/page.tsx
 * ROLE: Shell mínimo que monta o MasterSimulator como app full-height.
 * DESIGN: Zero overhead — o MasterSimulator já contém toda a navegação interna.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/analytics/ErrorBoundary';
import { ROUTES } from '@/constants/routes';

const MasterSimulatorDynamic = dynamic(
	() => import('@/components/simulator/MasterSimulator'),
	{ ssr: false }
);

export default function MotorPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
			{/* Barra compacta de navegação entre laboratórios */}
			<div className="bg-slate-950/60 border-b border-white/5 backdrop-blur-xl">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-xl bg-accent-indigo/20 border border-accent-indigo/30 flex items-center justify-center">
							<i className="fa-solid fa-calculator text-accent-indigo text-xs" />
						</div>
						<div>
							<h1 className="text-sm font-black tracking-[0.15em] text-white uppercase m-0">
								Simulador Mestre ICM
							</h1>
							<p className="text-[0.55rem] font-mono text-text-dim uppercase tracking-wider m-0">
								Poker Racional · SOTA v7.0 GOLD
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<LabPill
							label="Simulador Mestre"
							icon="fa-calculator"
							href={ROUTES.SIMULADOR}
							active
						/>
						<LabPill
							label="Motor de Distorções"
							icon="fa-atom"
							href={ROUTES.SIMULADOR_DISTORCOES}
						/>
						<LabPill
							label="Lab GTO / CFR"
							icon="fa-network-wired"
							href={ROUTES.SIMULADOR_GTO}
						/>
					</div>
				</div>
			</div>

			{/* O Simulador Mestre ICM Unificado (full-width) */}
			<ErrorBoundary>
				<MasterSimulatorDynamic />
			</ErrorBoundary>
		</div>
	);
}

function LabPill({
	label,
	icon,
	href,
	active = false,
}: Readonly<{
	label: string;
	icon: string;
	href: string;
	active?: boolean;
}>) {
	return (
		<Link
			href={href}
			className={`px-3 py-1.5 rounded-xl text-[0.58rem] font-black uppercase tracking-[0.12em] transition-all flex items-center gap-2 whitespace-nowrap ${
				active
					? 'bg-accent-indigo/20 text-white border border-accent-indigo/40 shadow-sm'
					: 'text-text-dim hover:text-text-muted hover:bg-white/5 border border-transparent'
			}`}
		>
			<i className={`fa-solid ${icon} ${active ? 'text-accent-indigo' : ''}`} />
			<span>{label}</span>
		</Link>
	);
}
