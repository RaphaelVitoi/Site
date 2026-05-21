import React from 'react';
import MasterSimulator from '@/components/simulator/MasterSimulator';

export const metadata = {
    title: 'Motor ICM | SOTA',
    description: 'Simulador Mestre de ICM e Distorções GTO',
};

export default function MotorIcmPage ()
{
    return <MasterSimulator />;
}
