import IcmLab from '@/app/simulador/IcmLab';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const dynamic = 'force-dynamic';
export const metadata = {
    title: 'Laboratório ICM | Poker Racional',
    description: 'Motor de Perspectiva Matemática V2 e Distorções de Risco'
};

export default function IcmLaboratoryPage () {
    return (
        <div style={ { minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' } }>
            <div style={ { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' } }>
                <ErrorBoundary>
                    <IcmLab />
                </ErrorBoundary>
            </div>
        </div>
    );
}
