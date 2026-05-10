
/**
 * IDENTITY: Matriz de Insolvência SOTA v4.2 Gold
 * PATH: src/components/simulator/InsolvencyMatrix.tsx
 * ROLE: Visualização vetorial de riscos extremos e colapso de EV.
 * AESTHETIC: SOTA Gold Standard (Glows, Precision Radar, Glassmorphism).
 */

import { useContext, useDeferredValue, useMemo } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { SotaWasmContext } from './SotaContext';

const CustomTooltip = ({ active, payload }: { active?: boolean, payload?: any[] }) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0];
        const payloadData = data.payload as { subject: string; value: number };
        return (
            <div className="px-5 py-4 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/10 to-transparent pointer-events-none" />
                <p className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.2em] mb-1 relative z-10">{payloadData.subject}</p>
                <p className="text-lg font-black text-white font-mono tabular-nums relative z-10">{(payloadData.value * 100).toFixed(1)}%</p>
            </div>
        );
    }
    return null;
};

export function InsolvencyMatrix() {
    const wasmCtx = useContext(SotaWasmContext);
    const isCalculating = wasmCtx?.isCalculatingInsolvency ?? false;
    const data = wasmCtx?.insolvencyMatrixData;

    // Extracao SOTA do Erro 400 (Bad Request) propagado
    const apiError = (wasmCtx as any)?.error;

    const deferredData = useDeferredValue(data);

    const chartData = useMemo(() => {
        const d = deferredData || { winRate: 0, loseRate: 0, tieRate: 0, trueInsolvencyEv: 0, riskIndex: 0 };
        return [
            { subject: 'Win Rate', value: d.winRate, safeLimit: 0.35 },
            { subject: 'True EV', value: Math.max(0, d.trueInsolvencyEv), safeLimit: 0.25 },
            { subject: 'Tie Rate', value: d.tieRate, safeLimit: 0.1 },
            { subject: 'Lose Rate', value: d.loseRate, safeLimit: 0.45 },
            { subject: 'Risk Index', value: d.riskIndex, safeLimit: 0.3 },
        ];
    }, [deferredData]);

    if (apiError) {
        return (
            <div className="w-full h-96 lg:h-112 relative flex items-center justify-center bg-red-950/20 rounded-2xl border border-red-500/30 overflow-hidden">
                <div className="text-center p-6 bg-red-900/20 backdrop-blur-md rounded-xl border border-red-500/20 shadow-2xl">
                    <h3 className="text-red-400 font-black tracking-[0.3em] uppercase mb-2">Entropia Detectada</h3>
                    <p className="text-red-200/80 font-mono text-xs">{apiError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-96 lg:h-112 relative group/insolvency">
            <AnimatePresence>
                {isCalculating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-bg-deep/60 backdrop-blur-md z-30 rounded-4xl border border-accent-indigo/20 shadow-inner"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-accent-indigo/20 rounded-full" />
                                <div className="absolute top-0 left-0 w-16 h-16 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-[0.7rem] font-black text-white uppercase tracking-[0.4em] m-0 animate-pulse">Resolvendo Equações</p>
                                <p className="text-[0.55rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0">Offloading WASM Active</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    <defs>
                        <linearGradient id="insolvencyGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="5%" stopColor="var(--color-accent-indigo)" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="var(--color-accent-indigo)" stopOpacity={0.1}/>
                        </linearGradient>
                        <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    <PolarGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="5 5" radialLines={true} />

                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.15em' }}
                    />

                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />

                    <Radar
                        name="Threshold Seguro"
                        dataKey="safeLimit"
                        stroke="rgba(16,185,129,0.3)"
                        fill="rgba(16,185,129,0.05)"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        animationDuration={1500}
                    />

                    <Radar
                        name="Assinatura de Insolvência"
                        dataKey="value"
                        stroke="var(--color-accent-indigo)"
                        fill="url(#insolvencyGradient)"
                        strokeWidth={4}
                        filter="url(#radarGlow)"
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                    />

                    <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
