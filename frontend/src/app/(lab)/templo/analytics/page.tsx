import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import DashboardSOTADynamic from '@/components/simulator/DashboardSOTADynamic';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
	title: 'Laboratório Quântico | Poker Racional',
	description: 'Distorção ICM e Telemetria de Perspectiva',
};

export default async function AnalyticsPage() {
	let events: Array<{ evLoss: number; isCorrect: boolean; createdAt: Date }> = [];
	try {
		const rawEvents = await prisma.telemetryEvent.findMany({
			where: { userId: 'anonymous' },
			orderBy: { createdAt: 'desc' },
			take: 1000,
		});
		events = rawEvents;
	} catch (error) {
		console.error('[PANOPTICO] Falha na telemetria:', error);
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
