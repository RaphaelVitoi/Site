import React from 'react';
import MasterSimulatorDynamic from '@/components/simulator/MasterSimulatorDynamic';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Motor ICM | SOTA',
    description: 'Simulador Mestre de ICM e Distorções GTO',
};

export default function MotorPage ()
{
    return (
        <MasterSimulatorDynamic />
    );
}
