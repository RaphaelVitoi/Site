"use client";

/**
 * IDENTITY: Dashboard SOTA v4.2 Gold
 * PATH: src/components/simulator/DashboardSOTA.tsx
 * ROLE: Orquestrador de Telemetria e Assinatura Cognitiva.
 * AESTHETIC: SOTA Gold Standard (Visual Symmetry, Glassmorphism, Tabular Nums).
 */

import { useContext } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image'; // SOTA: Importação estrita obrigatória para evitar colisão com o DOM
import { InsolvencyMatrix } from './InsolvencyMatrix';
import { TelemetryCharts } from '../analytics/TelemetryCharts';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { SotaMetricsContext } from './SotaContext';
import { motion } from 'framer-motion';

interface HistorianData {
    profile?: Record<string, number>;
    telemetry?: Array<{ evLoss: number; isCorrect: boolean; createdAt: string | Date }>;
}

interface DashboardSOTAProps {
    initialData?: HistorianData | null;
}

export default function DashboardSOTA ({ initialData }: Readonly<DashboardSOTAProps> = {}) {
    const metricsContext = useContext(SotaMetricsContext);

    const { data: session } = useSession();
    const userName = session?.user?.name || "Operador Autônomo";

    const defaultProfile = {
        'Aversão ao Risco': 0.85,
        'Pot Entrapment': 0.65,
        'Miopia de Payjump': 0.9,
        'Excesso de Agressão': 0.3,
        'Passivo Estrutural (RIO)': 0.75,
        'Desvio de Nash': 0.45
    };

    const activeProfile = initialData?.profile || metricsContext?.predictiveProfile || defaultProfile;

    const radarData = Object.keys(activeProfile).map(key => ({
        subject: key,
        Deficiencia: Number((activeProfile[key as keyof typeof activeProfile] * 100).toFixed(1)),
    }));

    const topLeaks = Object.entries(activeProfile).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const telemetryMock = initialData?.telemetry?.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt)
    })) || [
        { evLoss: 1.2, isCorrect: false, createdAt: new Date(Date.now() - 7200000) },
        { evLoss: 0, isCorrect: true, createdAt: new Date() }
    ];

    return (
        <div className="flex flex-col gap-20 animate-sota-in">

            {/* Camada Superior: Diagnóstico de Risco de Ruína */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-12 items-stretch">
                <div className="glass-panel p-10 lg:p-14 rounded-4xl bg-bg-panel/40 border border-white/10 shadow-sota-glass relative transition-all duration-700 hover:border-white/20 group/insolvency-wrap overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/10 blur-[120px] rounded-full group-hover/insolvency-wrap:bg-accent-indigo/20 transition-colors duration-1000" />
                        <div className="absolute inset-0 bg-radial-[at_top_left] from-accent-indigo/5 to-transparent" />
                    </div>
                    <div className="flex items-center justify-between mb-14 border-b border-white/5 pb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-accent-indigo animate-pulse shadow-[0_0_15px_var(--color-accent-indigo)]" />
                            <h3 className="text-[0.8rem] font-black text-white uppercase tracking-[0.4em] m-0">Matriz de Insolvência SOTA</h3>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
                            <span className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.3em]">Quantum Feed Live</span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <InsolvencyMatrix />
                    </div>
                </div>

                <div className="glass-panel p-10 lg:p-14 rounded-4xl bg-bg-panel/40 border border-white/10 shadow-sota-glass flex flex-col justify-between relative transition-all duration-700 hover:border-white/20 group/pm-guide overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-indigo/5 blur-3xl rounded-full" />
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo-light relative overflow-hidden shadow-2xl">
                            {/* SOTA: Blindagem JSX contra injeção de texto/comentários e tipagem estrita do componente Image */}
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={userName}
                                    width={56}
                                    height={56}
                                    className="object-cover"
                                />
                            ) : (
                                <i className="fa-solid fa-user-gear text-2xl" />
                            )}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.25em] m-0 leading-none mb-2">Perspectiva Matemática</h3>
                                <p className="text-[0.65rem] text-text-darker font-black uppercase tracking-widest m-0">Operador: <span className="text-accent-indigo-light">{userName}</span></p>
                            </div>
                        </div>
                        <p className="text-[0.9rem] text-text-muted leading-relaxed font-medium italic border-l-2 border-accent-indigo/30 pl-8 py-4 bg-white/2 rounded-r-2xl">
                            &quot;A Matriz de Insolvência ao lado não é apenas um cálculo de equidade, mas uma projeção A* Pathfinding de sobrevivência financeira.&quot;
                        </p>
                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <GuideItem color="emerald" label="Win Rate" desc="Equidade natural bruta (ChipEV)." />
                            <GuideItem color="amber" label="True EV" desc="Expectativa real ajustada pela sobrevivência." />
                            <GuideItem color="rose" label="Risk Index" desc="Inflação de risco gerada por RIO multiway." />
                        </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-white/5 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em]">Status da Mente</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse" />
                                    <span className="text-accent-indigo-light text-[0.65rem] font-black uppercase tracking-widest">Sincronizada (SOTA Gold)</span>
                                </div>
                            </div>
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[0.5rem] font-bold text-slate-500">U{i}</div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Camada Inferior: Assinatura Cognitiva & Telemetria */}
            <section className="space-y-10 relative">
                <div className="flex items-center gap-8 mb-4">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase m-0 flex items-center gap-5">
                        <i className="fa-solid fa-brain text-accent-emerald shadow-[0_0_15px_var(--color-accent-emerald)]" />{' '}
                        Assinatura Cognitiva
                    </h2>
                    <div className="h-px grow bg-linear-to-r from-white/10 to-transparent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
                    <div className="glass-panel p-10 rounded-4xl bg-bg-panel/40 border border-white/5 shadow-2xl flex flex-col items-center justify-between group/vulnerabilities">
                        <div className="text-center space-y-2 mb-8">
                            <h3 className="text-[0.7rem] font-black text-accent-indigo uppercase tracking-[0.3em] m-0">Vulnerabilidades</h3>
                            <p className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest">Mapeamento de Leaks Pre-Ffg</p>
                        </div>

                        <div className="h-80 w-full relative">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                    <defs>
                                        <linearGradient id="leakGradient" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="5%" stopColor="var(--color-accent-emerald)" stopOpacity={0.6}/>
                                            <stop offset="95%" stopColor="var(--color-accent-emerald)" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="5 5" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Deficiência (%)" dataKey="Deficiencia" stroke="var(--color-accent-emerald)" strokeWidth={3} fill="url(#leakGradient)" fillOpacity={0.4} animationDuration={2000} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', padding: '12px' }} itemStyle={{ color: '#10b981', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="w-full mt-10 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <i className="fa-solid fa-microchip text-accent-indigo text-xs" /><h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">Top Leaks (IA Preditiva)</h4>
                            </div>
                            <div className="space-y-4">
                                {topLeaks.map(([name, value], idx) => (
                                    <div key={name} className="flex flex-col gap-2 group/leak">
                                        <div className="flex justify-between items-center px-1">
                                            <span className={`text-[0.65rem] font-black uppercase tracking-widest transition-colors ${idx === 0 ? 'text-accent-rose' : 'text-text-muted group-hover/leak:text-white'}`}>{name}</span>
                                            <span className="font-mono text-[0.7rem] font-black text-white tabular-nums">{(value * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${value * 100}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.2 }}
                                                className={`h-full rounded-full ${idx === 0 ? 'bg-accent-rose shadow-[0_0_8px_var(--accent-rose)]' : 'bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-10 rounded-4xl bg-bg-panel/40 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden group/telemetry">
                        <div className="absolute inset-0 bg-radial-[at_bottom_right] from-accent-emerald/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_10px_var(--accent-emerald)]" />
                                <h3 className="text-[0.75rem] font-black text-white uppercase tracking-[0.4em] m-0">Curva de Performance Temporal</h3>
                            </div>
                            <i className="fa-solid fa-chart-line text-text-darker text-sm" />
                        </div>
                        <div className="relative z-10 grow flex flex-col justify-center">
                            <TelemetryCharts data={ telemetryMock } />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function GuideItem({ color, label, desc }: Readonly<{ color: string, label: string, desc: string }>) {
    const colorClasses = {
        emerald: 'bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]',
        amber: 'bg-accent-amber shadow-[0_0_8px_var(--accent-amber)]',
        rose: 'bg-accent-rose shadow-[0_0_8px_var(--accent-rose)]'
    }[color as 'emerald' | 'amber' | 'rose'];

    return (
        <div className="flex items-start gap-5 p-4 rounded-2xl bg-white/3 border border-white/5 group/item hover:bg-white/5 transition-all">
            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colorClasses} group-hover/item:scale-125 transition-transform`} />
            <div className="space-y-1">
                <span className="text-[0.65rem] font-black text-white uppercase tracking-widest">{label}</span>
                <p className="text-[0.75rem] text-text-darker leading-relaxed m-0 group-hover/item:text-text-muted transition-colors font-medium">{desc}</p>
            </div>
        </div>
    );
}
