import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Laboratório ICM | Poker Racional',
    description: 'Motor de Perspectiva Matemática V2 e Distorções de Risco'
};

export default function IcmLaboratoryPage () {
    redirect( '/simulador' );
}
