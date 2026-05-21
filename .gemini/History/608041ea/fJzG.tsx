import { InsolvencyMatrix } from './InsolvencyMatrix';
// SOTA: Importando o Profiler FFI (ajuste o caminho se o componente foi movido)
import { NashMatrixProfiler } from './NashMatrixProfiler';
import { TelemetryCharts } from '../analytics/TelemetryCharts';

export default function DashboardSOTA ()
{
    // Mock SOTA para ancorar a Telemetria Avançada (Fase III).
    // Futuramente, a injeção será assíncrona via DAL (SQLite / Telemetry Client).
    const telemetryMock = [
        { evLoss: 1.2, isCorrect: false, createdAt: new Date( Date.now() - 7200000 ) },
        { evLoss: 0, isCorrect: true, createdAt: new Date() }
    ];

    return (
        <div className="min-h-screen bg-black p-8 font-mono">
            <header className="mb-10 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#00ffcc] to-[#ff3366] uppercase tracking-tighter">
                    Nexus Orchestrator (SOTA View)
                </h1>
                <p className="text-gray-500 mt-2">Distorção Quântica ICM & Motor Termodinâmico O(1)</p>
            </header>

            <main className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Lado Esquerdo: Motor Monte Carlo de Risco Constante */ }
                <InsolvencyMatrix />
                {/* Lado Direito: Profiler de Stress da FFI do Nash */ }
                <NashMatrixProfiler />
            </main>

            <section className="mt-12 border-t border-gray-800 pt-10">
                <h2 className="text-xl font-bold text-[#00ffcc] mb-6 tracking-tighter uppercase">Telemetria Avançada: CFR vs Cognição (Fase III)</h2>
                <TelemetryCharts data={ telemetryMock } />
            </section>
        </div>
    );
}
