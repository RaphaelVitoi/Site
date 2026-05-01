'use client';

import dynamic from 'next/dynamic';

// Next.js 16+ exige que next/dynamic com ssr: false seja feito dentro de um Client Component.
const MasterSimulatorDynamic = dynamic(
    () => import( './MasterSimulator' ),
    { ssr: false }
);

export default MasterSimulatorDynamic;
