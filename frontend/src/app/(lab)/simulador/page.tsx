'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/analytics/ErrorBoundary';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';

const BubbleFactorMatrix = dynamic(
	() => import('@/components/simulator/BubbleFactorMatrix').then((m) => m.BubbleFactorMatrix),
	{ ssr: false }
);

const NashMatrixProfiler = dynamic(
	() => import('@/components/simulator/NashMatrixProfiler').then((m) => m.NashMatrixProfiler),
	{ ssr: false }
);

const MasterSimulatorDynamic = dynamic(
	() => import('@/components/simulator/MasterSimulator'),
	{ ssr: false }
);

export default function MotorPage() {
	const [matchupSync, setMatchupSync] = useState<{
		ipRp?: number;
		oopRp?: number;
		label?: string;
	}>({
		ipRp: 13.5,
		oopRp: 31.8,
		label: 'BTN (Aggressive CL) vs CO (Second Stack)',
	});

	const handleMatchupSelect = (
		heroRp: number,
		villainRp: number,
		heroName: string,
		villainName: string
	) => {
		setMatchupSync({
			ipRp: heroRp,
			oopRp: villainRp,
			label: `${heroName} vs ${villainName}`,
		});
	};

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Motor ICM SOTA"
				subtitle="O laboratório quântico do Nexus. Simule equidade em tempo real, ajuste o Fator Vitoi (Risk Premium), analise a Matriz de Bubble Factor e visualize o Downward Drift em situações críticas de Field Size e Payouts."
				category="Ecossistema"
				icon="fa-flask-vial"
			/>
			<div className="sota-container mt-8 space-y-8">
				<ErrorBoundary>
					<BubbleFactorMatrix onSelectMatchup={handleMatchupSelect} />
				</ErrorBoundary>
				<ErrorBoundary>
					<NashMatrixProfiler
						injectedIpRp={matchupSync.ipRp}
						injectedOopRp={matchupSync.oopRp}
						matchupLabel={matchupSync.label}
					/>
				</ErrorBoundary>
				<ErrorBoundary>
					<MasterSimulatorDynamic />
				</ErrorBoundary>
			</div>
		</div>
	);
}
