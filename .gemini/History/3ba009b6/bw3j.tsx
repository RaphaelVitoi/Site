'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface GeometricProjectionChartProps {
    pot: number;
    target: number;
    streets: number;
    f: number;
}

export const GeometricProjectionChart = ({ pot, streets, f }: Readonly<GeometricProjectionChartProps>) => {
    const data = [];
    let currentPot = pot;

    // Initial state (Pre-action)
    data.push({
        street: 'Atual',
        pot: Math.round(currentPot),
        sizing: 0
    });

    for (let i = 1; i <= streets; i++) {
        const bet = currentPot * f;
        const totalPotAfterAction = currentPot + (bet * 2);

        data.push({
            street: i === streets ? 'River' : `Street ${i}`,
            pot: Math.round(totalPotAfterAction),
            sizing: Math.round(bet)
        });

        currentPot = totalPotAfterAction;
    }

    return (
        <div className="h-64 w-full bg-slate-950/40 rounded-3xl p-6 border border-white/5 shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-radial-[at_top_right] from-accent-emerald/5 to-transparent pointer-events-none" />

            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPot" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis
                        dataKey="street"
                        fontSize={9}
                        tick={{ fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        fontSize={9}
                        tick={{ fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            fontSize: '0.7rem',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: 'var(--accent-emerald)', fontWeight: 'bold', marginBottom: '4px' }}
                        formatter={(value: any) => [`${value} bb`, 'Pote']}
                    />
                    <Area
                        type="monotone"
                        dataKey="pot"
                        stroke="var(--accent-emerald)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPot)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="absolute top-4 right-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]" />
                <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest">Projeção A* Path</span>
            </div>
        </div>
    );
};
