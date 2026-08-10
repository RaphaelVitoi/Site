import { ErrorBoundary } from '@/components/analytics/ErrorBoundary';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import MasterSimulatorDynamic from '@/components/simulator/MasterSimulatorDynamic';

export const dynamic = 'force-dynamic';
export const metadata = {
	title: 'Motor ICM SOTA v7.0 GOLD | Nexus',
	description: 'Simulador Quântico: ICM Pós-Flop, Risk Premium e Distorções GTO.',
};

export default function MotorPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Motor ICM SOTA"
				subtitle="O laboratório quântico do Nexus. Simule equidade em tempo real, ajuste o Fator Vitoi (Risk Premium) e visualize o Downward Drift em situações críticas de Field Size e Payouts."
				category="Ecossistema"
				icon="fa-flask-vial"
			/>
			<div className="sota-container mt-8">
				<ErrorBoundary>
					<MasterSimulatorDynamic />
				</ErrorBoundary>
			</div>
		</div>
	);
}
