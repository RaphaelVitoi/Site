import React from 'react';
import dynamic from 'next/dynamic';

// Força a renderização dinâmica da página, resolvendo conflitos de build
// entre a página estática e componentes com ssr:false.
export const dynamic = 'force-dynamic';

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
