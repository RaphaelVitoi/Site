'use client';

import React from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface PerspectiveChartProps {
    chartData: any[];
}

const INITIAL_CHART_DIMENSION = { width: 1, height: 1 };

export const PerspectiveChart = ({ chartData }: PerspectiveChartProps) => {
    return (
        <div className="h-50 bg-slate-950/60 rounded-2xl pt-6 pr-4 pb-2 border border-white/5 shadow-inner">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} initialDimension={INITIAL_CHART_DIMENSION}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" fontSize={8} tick={{ fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={8} tick={{ fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                    <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.6rem', borderRadius: '8px' }} />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="PM Quantum" stroke="#818cf8" strokeWidth={2.5} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
