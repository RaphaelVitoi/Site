'use client';

import dynamic from 'next/dynamic';

const MasterSimulator = dynamic(() => import('@/components/simulator/MasterSimulator'), {
	ssr: false,
	loading: () => <div className="p-16 text-center text-text-muted">Carregando Motor ICM...</div>,
});

export default function SimuladorLazy() {
	return <MasterSimulator />;
}
