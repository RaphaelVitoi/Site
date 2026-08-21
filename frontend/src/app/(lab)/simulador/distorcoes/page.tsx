import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { IcmDistortionsContent } from '@/components/simulator/IcmDistortionsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Motor de Distorções ICM | Poker Racional',
	description:
		'Laboratório Quântico de Distorções ICM: Matriz N-Dimensional de Bubble Factor, Nash Distortion Profiler e Downward Drift em tempo real.',
};

export default function IcmDistortionsPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Motor de Distorções ICM"
				subtitle="O epicentro da física de risco do Poker Racional. Simule e visualize a convexidade do Bubble Factor, o colapso da MDF e a assimetria do Risk Premium em qualquer configuração de mesa final."
				category="Laboratório Quântico"
				icon="fa-atom"
			/>

			<IcmDistortionsContent />
		</div>
	);
}
