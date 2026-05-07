"use client";

import { useContext } from 'react';
import { InsolvencyMatrix } from './InsolvencyMatrix';
import { TelemetryCharts } from '../analytics/TelemetryCharts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { SotaMetricsContext } from './SotaContext';

export default function DashboardSOTA ()
{
    const metricsContext = useContext(SotaMetricsContext);

    // SOTA: Dados didáticos de fallback para garantir que o painel nunca fique vazio
    // e sirva como ferramenta educacional do Paradigma Vitoi.
    const defaultProfile = {
        'Aversão ao Risco': 0.85,
        'Pot Entrapment': 0.65,
        'Miopia de Payjump': 0.90,
        'Excesso de Agressão': 0.30,
        'Passivo Estrutural (RIO)': 0.75,
        'Desvio de Nash': 0.45
    };

    const activeProfile = metricsContext?.predictiveProfile || defaultProfile;

    const radarData = Object.keys(activeProfile).map(key => ({
        subject: key,
        Deficiencia: Number((activeProfile[key as keyof typeof activeProfile] * 100).toFixed(1)),
    }));

    const telemetryMock = [
        { evLoss: 1.2, isCorrect: false, createdAt: new Date( Date.now() - 7200000 ) },
        { evLoss: 0, isCorrect: true, createdAt: new Date() }
    ];

    return (
        <div className="min-h-screen bg-black p-8 font-mono">
            <header className="mb-10 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-[#00ffcc] to-[#ff3366] uppercase tracking-tighter">
                    Telemetria SOTA
                </h1>
                <p className="text-gray-500 mt-2">Distorção Quântica ICM & Análise Comportamental</p>
            </header>

            <main className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <InsolvencyMatrix />
                
                {/* SOTA: Painel Didático substituindo o antigo Terminal/Profiler */}
                <div className="p-6 border border-white/10 bg-black/40 rounded-2xl shadow-inner h-72 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 blur-[50px] rounded-full pointer-events-none" />
                    <h3 className="text-lg font-bold text-accent-indigo-light mb-3 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-graduation-cap text-accent-indigo" />
                        Perspectiva Matemática
                    </h3>
                    <p className="text-[0.85rem] text-text-muted leading-relaxed mb-4">
                        A Matriz de Insolvência ao lado não é apenas um cálculo de equidade, mas uma <strong>projeção A* Pathfinding</strong>. Ela avalia o <strong className="text-accent-danger/80">Risco de Ruína</strong> contínuo.
                    </p>
                    <ul className="text-[0.75rem] text-text-dim space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-accent-emerald mt-0.5">▶</span>
                            <span><strong>Win Rate:</strong> Equidade natural bruta (ChipEV).</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent-amber mt-0.5">▶</span>
                            <span><strong>True EV:</strong> Expectativa ajustada pela sobrevivência.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent-rose mt-0.5">▶</span>
                            <span><strong>Risk Index:</strong> Inflação de risco gerada por <em>Reverse Implied Odds (RIO)</em>.</span>
                        </li>
                    </ul>
                </div>
            </main>

            <section className="mt-12 border-t border-gray-800 pt-10">
                <h2 className="text-xl font-bold text-[#00ffcc] mb-6 tracking-tighter uppercase">Assinatura Cognitiva do Jogador</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-1 p-6 border border-white/10 bg-black/40 rounded-2xl flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-accent-indigo mb-4 uppercase tracking-widest text-center">Vulnerabilidades</h3>
                        <div className="h-[350px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#818cf8', fontSize: 11, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Vulnerabilidade %" dataKey="Deficiencia" stroke="#00ffcc" strokeWidth={2} fill="#00ffcc" fillOpacity={0.3} />
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
