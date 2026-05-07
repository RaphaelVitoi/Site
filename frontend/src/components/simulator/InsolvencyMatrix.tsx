'use client';

import React, { useContext, useDeferredValue, useMemo } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { SotaWasmContext } from './SotaContext';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        const data = payload[0];
        return (
            <div className="p-2 bg-bg-deep/80 border border-white/10 rounded-lg shadow-lg text-xs">
                <p className="text-text-dim">{`${data.payload.subject}`}</p>
                <p className="text-white font-bold">{`${(data.value * 100).toFixed(1)}%`}</p>
            </div>
        );
    }
    return null;
};

export function InsolvencyMatrix() {
    const wasmCtx = useContext(SotaWasmContext);
    const isCalculating = wasmCtx?.isCalculatingInsolvency ?? false;
    const data = wasmCtx?.insolvencyMatrixData;

    const deferredData = useDeferredValue(data);

    const chartData = useMemo(() => {
        const d = deferredData || { winRate: 0, loseRate: 0, tieRate: 0, trueInsolvencyEv: 0, riskIndex: 0 };
        return [
            { subject: 'Win Rate', value: d.winRate, fullMark: 1 },
            { subject: 'True EV', value: Math.max(0, d.trueInsolvencyEv), fullMark: 1 },
            { subject: 'Tie Rate', value: d.tieRate, fullMark: 1 },
            { subject: 'Lose Rate', value: d.loseRate, fullMark: 1 },
            { subject: 'Risk Index', value: d.riskIndex, fullMark: 1 },
        ];
    }, [deferredData]);

    return (
        <div className="w-full h-80 relative group">
            <AnimatePresence>
                {isCalculating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-10 rounded-3xl border border-white/5">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
                            <p className="text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest">Resolvendo Equações (WASM)</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', textAnchor: 'middle' }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                    <Radar 
                        name="Insolvency" 
                        dataKey="value" 
                        stroke="#818cf8" 
                        fill="#818cf8" 
                        fillOpacity={0.3} 
                        strokeWidth={2}
                        animationDuration={1500}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
