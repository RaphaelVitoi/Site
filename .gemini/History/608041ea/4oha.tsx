import { InsolvencyMatrix } from './InsolvencyMatrix';
// SOTA: Importando o Profiler FFI (ajuste o caminho se o componente foi movido)
import { NashMatrixProfiler } from './NashMatrixProfiler';
import { TelemetryCharts } from '../analytics/TelemetryCharts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardSOTA ()
{
    // Rota SOTA Edge para buscar a Random Forest do Kernel Python
    const { data: predictiveData } = useSWR('/api/predictive-profile', fetcher, { refreshInterval: 10000 });
    const profile = predictiveData?.profile || {};

    const radarData = Object.keys(profile).map(key => ({
        subject: key,
        Deficiencia: Number((profile[key] * 100).toFixed(1)),
    }));

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-1 p-6 border border-white/10 bg-black/40 rounded-2xl flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-accent-indigo mb-4 uppercase tracking-widest">Matriz Preditiva de Vulnerabilidade</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#818cf8', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Vulnerabilidade %" dataKey="Deficiencia" stroke="#00ffcc" fill="#00ffcc" fillOpacity={0.4} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0a0f1c', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '8px' }} itemStyle={{ color: '#00ffcc', fontWeight: 'bold' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <TelemetryCharts data={ telemetryMock } />
                    </div>
                </div>
            </section>
        </div>
    );
}
