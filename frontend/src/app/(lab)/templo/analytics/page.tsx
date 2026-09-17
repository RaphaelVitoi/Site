import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import DashboardSOTADynamic from '@/components/simulator/DashboardSOTADynamic';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Laboratório Quântico | Poker Racional',
	description: 'Distorção ICM e Telemetria de Perspectiva',
};

export default async function AnalyticsPage() {
	// FE-03 (auditoria 2026-09-17): a consulta filtrava `userId: 'anonymous'`, que nenhuma escrita
	// produz -- a gravação exige sessão e usa o id dela. A página sempre caía nos dados sintéticos do
	// componente. Agora a telemetria é a da sessão; sem sessão, não há histórico a exibir.
	const session = await auth();
	const userId = session?.user?.id;
	let events: Array<{ evLoss: number; isCorrect: boolean; createdAt: Date }> = [];
	if (userId) {
		try {
			events = await prisma.telemetryEvent.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				take: 1000,
			});
		} catch (error) {
			console.warn('[ANALYTICS] Telemetria indisponivel (banco offline ou sem migracao):', error);
		}
	}

	// Prepara os dados para o DashboardSOTA (initialData)
	const initialData = {
		telemetry: events.map((e) => ({
			evLoss: e.evLoss,
			isCorrect: e.isCorrect,
			createdAt: e.createdAt,
		})),
	};

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Laboratório Quântico"
				subtitle="Telemetria de Perspectiva & Distorção ICM Dinâmica"
				category="Ecossistema"
				icon="fa-flask-vial"
			/>

			<div className="sota-container mt-12">
				<DashboardSOTADynamic initialData={initialData} />
			</div>
		</div>
	);
}
