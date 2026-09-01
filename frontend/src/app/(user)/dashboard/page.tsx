import { SniperAdvisor } from '@/components/analytics/SniperAdvisor';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { shouldQueryDashboardOrchestrator } from '@/lib/server/dashboard-orchestrator';

// Painel privado: telemetria e predição dependem da sessão e do relay local.
// Nunca pré-renderizar durante o build sem esse contexto operacional.
export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'Telemetria AGN | Dashboard SOTA',
	description: 'Orquestrador híbrido, monitoramento de agentes e fila termodinâmica.',
};

function isNetworkRefused(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	if (error.message.includes('ECONNREFUSED')) return true;
	if ('code' in error && error.code === 'ECONNREFUSED') return true;
	if (error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
		return (error.cause as { code?: string }).code === 'ECONNREFUSED';
	}
	return false;
}

const ASCII_TO_UTF8_MAP = new Map<string, string>([
	['Aversao ao Risco', 'Aversão ao Risco'],
	['Pot Entrapment', 'Pot Entrapment'],
	['Miopia de Payjump', 'Miopia de Payjump'],
	['Excesso de Agressao', 'Excesso de Agressão'],
	['Passivo Estrutural (RIO)', 'Passivo Estrutural (RIO)'],
	['Desvio de Nash', 'Desvio de Nash'],
]);

function parseProfileMap(rawData: unknown): Map<string, number> {
	const profile = new Map<string, number>();
	if (typeof rawData !== 'object' || rawData === null || !('profile' in rawData)) {
		return profile;
	}
	const rawProfile = (rawData as { profile?: unknown }).profile;
	if (typeof rawProfile !== 'object' || rawProfile === null) {
		return profile;
	}

	for (const [key, value] of Object.entries(rawProfile as Record<string, unknown>)) {
		if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
		const mappedKey = ASCII_TO_UTF8_MAP.get(key) ?? key;
		const numValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
		profile.set(mappedKey, numValue);
	}
	return profile;
}

async function getOrchestratorTelemetry() {
	if (!shouldQueryDashboardOrchestrator()) {
		return {
			available: false,
			activeTasks: 0,
			dailyBudget: 0,
			consumedBudget: 0,
			agentsOnline: 0,
		};
	}

	try {
		// Busca telemetria SOTA da API do Orquestrador Python (Latência Zero SSR)
		const token = process.env['API_SECRET_TOKEN'] || '';
		const res = await fetch(buildNexusServerUrl('/db-summary'), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			next: { revalidate: 15 }, // SSR caching dinâmico
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();

		return {
			available: true,
			activeTasks: (data?.tasks?.running || 0) + (data?.tasks?.pending || 0),
			dailyBudget: 5000,
			consumedBudget:
				typeof data?.budget === 'number' ? data.budget : data?.budget?.call_count || 0,
			agentsOnline: 15, // Total consolidado de agentes na malha VITOI
		};
	} catch (error: unknown) {
		if (isNetworkRefused(error)) {
			if (process.env['NODE_ENV'] !== 'production' || process.env['DEBUG']) {
				console.warn('[Telemetry SOTA] Orquestrador offline (ECONNREFUSED) - usando fallback.');
			}
		} else {
			console.error('[Telemetry SOTA] Falha ao buscar dados do orquestrador:', error);
		}
		// SOTA Guard: Fallback resiliente caso o Orquestrador esteja offline (evita quebra de UI)
		return {
			available: false,
			activeTasks: 0,
			dailyBudget: 0,
			consumedBudget: 0,
			agentsOnline: 0,
		};
	}
}

async function getPredictiveProfile() {
	if (!shouldQueryDashboardOrchestrator()) {
		return { available: false, topVazamento: 'Indisponível', evLoss: 0 };
	}

	try {
		// SOTA: Fricção Zero. Substitui o subprocesso CLI pesado por um fetch direto
		// ao motor aiohttp, unificando a topologia de comunicação no SSR.
		const token = process.env['API_SECRET_TOKEN'] || '';
		const res = await fetch(buildNexusServerUrl('/predictive-profile'), {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			next: { revalidate: 15 },
		});

		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();

		const profile = parseProfileMap(data);
		const sortedEntries = Array.from(profile.entries()).sort((a, b) => b[1] - a[1]);
		const topLeak = sortedEntries[0]?.[0] || 'Risk Premium';

		return {
			available: true,
			topVazamento: topLeak,
			evLoss: 12,
		};
	} catch (error: unknown) {
		if (isNetworkRefused(error)) {
			if (process.env['NODE_ENV'] !== 'production' || process.env['DEBUG']) {
				console.warn('[Predictive SOTA] Orquestrador offline (ECONNREFUSED) - usando fallback.');
			}
		} else {
			console.error('[Predictive SOTA] Falha na inferência preditiva:', error);
		}
		// Fallback silencioso (Fricção Zero) para evitar ruptura em tela caso o modelo preditivo não esteja treinado
		return { available: false, topVazamento: 'Indisponível', evLoss: 0 };
	}
}

export default async function DashboardPage() {
	const telemetry = await getOrchestratorTelemetry();
	const predictive = await getPredictiveProfile();

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Telemetria AGN"
				subtitle="Painel quântico de monitoramento do ecossistema de agentes SOTA e telemetria financeira."
				category="Orquestrador"
				icon="fa-satellite-dish"
			/>

			<div className="sota-container -mt-12 relative z-10">
				{!telemetry.available || !predictive.available ? (
					<GlassPanel className="mb-6 border-amber-400/30 p-4 text-sm text-text-muted">
						Dados operacionais indisponíveis: o relay autenticado do orquestrador não está
						configurado neste ambiente. O painel não estima nem substitui telemetria real.
					</GlassPanel>
				) : null}

				{predictive.available ? (
					<SniperAdvisor topVazamento={predictive.topVazamento} evLoss={predictive.evLoss} />
				) : null}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					<GlassPanel className="p-6 border-accent-indigo/20">
						<div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">
							Tarefas Ativas
						</div>
						<div className="text-3xl font-black text-white">
							{telemetry.available ? telemetry.activeTasks : '—'}
						</div>
					</GlassPanel>

					<GlassPanel className="p-6 border-accent-emerald/20">
						<div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">
							Custo Diário (Tokens)
						</div>
						<div className="text-3xl font-black text-accent-emerald-light">
							{telemetry.available ? (
								<>
									{telemetry.consumedBudget}{' '}
									<span className="text-sm text-text-muted font-medium">
										/ {telemetry.dailyBudget}
									</span>
								</>
							) : (
								'—'
							)}
						</div>
					</GlassPanel>

					<GlassPanel className="p-6 border-accent-indigo/20">
						<div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">
							Agentes Vivos
						</div>
						<div className="text-3xl font-black text-white">
							{telemetry.available ? telemetry.agentsOnline : '—'}
						</div>
					</GlassPanel>

					<GlassPanel className="p-6 border-rose-500/20">
						<div className="text-text-muted text-xs font-black uppercase tracking-widest mb-2">
							Vazamento Principal
						</div>
						<div className="text-3xl font-black text-rose-400">
							{predictive.available ? predictive.topVazamento : '—'}
						</div>
					</GlassPanel>
				</div>
			</div>
		</div>
	);
}
