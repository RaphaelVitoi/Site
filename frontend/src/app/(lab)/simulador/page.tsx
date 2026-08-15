'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/analytics/ErrorBoundary';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';

const NashMatrixProfiler = dynamic(
	() => import('@/components/simulator/NashMatrixProfiler').then((m) => m.NashMatrixProfiler),
	{ ssr: false }
);

const MasterSimulatorDynamic = dynamic(
	() => import('@/components/simulator/MasterSimulator'),
	{ ssr: false }
);

export default function MotorPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Motor ICM SOTA"
				subtitle="O laboratório quântico do Nexus. Simule equidade em tempo real, ajuste o Fator Vitoi (Risk Premium) e visualize o Downward Drift em situações críticas de Field Size e Payouts."
				category="Ecossistema"
				icon="fa-flask-vial"
			/>
			<div className="sota-container mt-8 space-y-8">
				<ErrorBoundary>
					<NashMatrixProfiler />
				</ErrorBoundary>
				<ErrorBoundary>
					<MasterSimulatorDynamic />
				</ErrorBoundary>
			</div>
		</div>
	);
}
