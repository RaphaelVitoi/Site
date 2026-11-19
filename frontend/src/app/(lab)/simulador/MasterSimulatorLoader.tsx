'use client';

import dynamic from 'next/dynamic';

const MasterSimulatorDynamic = dynamic(() => import('@/components/simulator/MasterSimulator'), {
  ssr: false,
  loading: () => <SimulatorSkeleton />,
});

function SimulatorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-6 sm:px-6">
      <div className="mb-5 h-11 w-full rounded-2xl border border-white/8 bg-slate-950/50" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-6">
          <div className="aspect-16/10 w-full rounded-2xl border border-white/8 bg-slate-950/60" />
          <div className="h-40 w-full rounded-2xl border border-white/8 bg-slate-950/50" />
          <div className="h-14 w-full rounded-2xl border border-white/8 bg-slate-950/40" />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-6">
          <div className="h-64 w-full rounded-2xl border border-white/8 bg-slate-950/50" />
          <div className="h-48 w-full rounded-2xl border border-white/8 bg-slate-950/40" />
        </div>
      </div>
    </div>
  );
}

export default function MasterSimulatorLoader() {
  return <MasterSimulatorDynamic />;
}
