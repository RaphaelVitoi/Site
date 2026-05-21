import React from 'react';
import dynamic from 'next/dynamic';

export const metadata = {
    title: 'Motor ICM | SOTA',
    description: 'Simulador Mestre de ICM e Distorções GTO',
};

// Desativa o SSR para o Simulador Mestre, garantindo Fricção Zero
const MasterSimulatorDynamic = dynamic(
    () => import( '@/components/simulator/MasterSimulator' ),
    { ssr: false }
);

export default function MotorPage ()
{
    return <MasterSimulatorDynamic />;
}
