'use client';

import { useCallback, useEffect, useState } from 'react';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';

interface ChrysalisHealth {
	status: 'ONLINE' | 'OFFLINE';
	apps_count: number;
	base_url: string;
	reason?: string;
	provenia: { fallback_used: boolean };
}

export function ChrysalisLiveEnginePanel() {
	const [health, setHealth] = useState<ChrysalisHealth | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchHealth = useCallback(async () => {
		try {
			const res = await fetch('/api/sota/chrysalis', { cache: 'no-store' });
			if (res.ok) {
				const json = (await res.json()) as ChrysalisHealth;
				setHealth(json);
			}
		} catch {
			// Fallback gracioso
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchHealth();
		const interval = setInterval(() => {
			if (document.visibilityState === 'visible') void fetchHealth();
		}, 30000);
		return () => clearInterval(interval);
	}, [fetchHealth]);

	const online = health?.status === 'ONLINE';
	let statusText = 'Offline';
	if (loading) {
		statusText = 'Verificando...';
	} else if (online) {
		statusText = `Online - ${health?.apps_count ?? 0} apps`;
	}
	const statusClass = online ? 'text-accent-emerald-light' : 'text-amber-400';

	return (
		<GlassPanel className="mb-6 p-4">
			<div className="flex items-center justify-between gap-4">
				<div>
					<div className="text-xs font-black uppercase tracking-widest text-text-muted mb-1">
						Chrysalis Live Engine (adapter)
					</div>
					<div className={`text-sm font-bold ${statusClass}`}>
						{statusText}
					</div>
					{health?.reason ? (
						<div className="text-xs text-text-muted mt-1">{health.reason}</div>
					) : null}
				</div>
				<button
					type="button"
					onClick={() => void fetchHealth()}
					className="text-xs font-bold text-text-muted hover:text-text-bright transition-colors"
				>
					Atualizar
				</button>
			</div>
		</GlassPanel>
	);
}
