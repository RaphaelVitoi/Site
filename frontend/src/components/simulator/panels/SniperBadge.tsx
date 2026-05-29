'use client';

/**
 * IDENTITY: Sniper Badge
 * ROLE: Componente visual para sinalizar solvência matemática via Protocolo Smart Sniper.
 * COMPLIANCE: React 19 (Server/Client Component safe, direct props passing).
 */

import { SotaTooltip } from '../ui/SotaTooltip';

interface SniperBadgeProps {
	pm: number;
	ci: number | null;
	stackEff: number;
}

export function SniperBadge({ pm, ci, stackEff }: Readonly<SniperBadgeProps>) {
	const isReady = pm > 0 && ci !== null && ci >= 1 && stackEff >= 20 && stackEff <= 50;

	if (!isReady) return null;

	return (
		<SotaTooltip
			title="Status: Sniper Ready"
			content="Ação validada pelo Protocolo Smart Sniper: Entrada tardia dentro da Zona de Domínio com solvência matemática confirmada."
			theme="indigo"
		>
			<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
				<i className="fa-solid fa-bullseye text-[0.65rem] text-accent-emerald" />
				<span className="text-[0.6rem] font-black text-accent-emerald uppercase tracking-widest">
					Sniper Ready
				</span>
			</div>
		</SotaTooltip>
	);
}
