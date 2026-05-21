'use client';

import dynamic from 'next/dynamic';

// Next.js 16+ exige que next/dynamic com ssr: false seja feito dentro de um Client Component.
const DownwardDriftSimulatorDynamic = dynamic(
    () => import( './DownwardDriftSimulator' ).then( mod => mod.DownwardDriftSimulator ),
    { ssr: false }
);

export default DownwardDriftSimulatorDynamic;
