'use client';

import dynamic from 'next/dynamic';

function SotaLoadingSkeleton() {
	return (
		<div className="flex flex-col items-center justify-center p-24 w-full h-[60vh] bg-black/20 animate-pulse rounded-2xl border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
			<i className="fa-solid fa-satellite-dish text-accent-indigo text-4xl mb-4 opacity-50" />
			<div className="text-text-muted text-xs font-black uppercase tracking-widest font-mono">
				Estabelecendo Handshake SOTA...
			</div>
		</div>
	);
}

const DashboardSOTADynamic = dynamic(() => import('./DashboardSOTA'), {
	ssr: false,
	loading: () => <SotaLoadingSkeleton />,
});

export default DashboardSOTADynamic;
