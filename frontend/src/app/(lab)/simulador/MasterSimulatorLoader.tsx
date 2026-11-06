'use client';

import dynamic from 'next/dynamic';

const MasterSimulatorDynamic = dynamic(
  () => import('@/components/simulator/MasterSimulator'),
  { ssr: false, loading: () => <div className="p-16 text-center text-text-dim animate-pulse">Sincronizando...</div> },
);

export default function MasterSimulatorLoader() {
  return <MasterSimulatorDynamic />;
}
