import { ErrorBoundary } from '@/components/ErrorBoundary';
import MasterSimulatorDynamic from '@/components/simulator/MasterSimulatorDynamic';

export const dynamic = 'force-dynamic';
export const metadata = {
    title: 'Motor ICM | Poker Racional',
    description: 'Simulador Mestre de ICM e Distorções GTO'
};

export default function MotorPage () {
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden">
            <div className="w-full max-w-300 mx-auto px-6 py-6 pb-12">
                <ErrorBoundary>
                    {/* O Motor Original Restaurado */ }
                    <MasterSimulatorDynamic />
                </ErrorBoundary>
            </div>
        </div>
    );
}
