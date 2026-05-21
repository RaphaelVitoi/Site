import { getSotaScenarios } from '@/app/actions/simulatorActions';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import MasterSimulatorDynamic from '@/components/simulator/MasterSimulatorDynamic';

export const dynamic = 'force-dynamic';
export const metadata = {
    title: 'Motor ICM | Poker Racional',
    description: 'Simulador Mestre de ICM e Distorções GTO'
};

export default async function MotorPage () {
    const scenarios = await getSotaScenarios();

    if ( !scenarios || scenarios.length === 0 )
    {
        return (
            <div style={ { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-bright)' } }>
                <p style={ { padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' } }>[SISTEMA SOTA] Nenhuma anomalia crítica, mas o banco de dados está vazio. Execute o script <code>seed.ts</code> para repovoar o ambiente local.</p>
            </div>
        );
    }

    return (
        <div style={ { minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-bright)', overflowX: 'hidden' } }>
            <div style={ { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' } }>
                <ErrorBoundary>
                    {/* O Motor Original Restaurado */ }
                    <MasterSimulatorDynamic initialScenarios={ scenarios } />
                </ErrorBoundary>
            </div>
        </div>
    );
}
