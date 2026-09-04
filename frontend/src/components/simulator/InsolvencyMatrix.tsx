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

interface StreetMetric {
	name: string;
	PM: number;
	threshEq: number;
	loading: boolean;
}

interface InsolvencyMatrixProps {
	streetMetrics?: StreetMetric[] | null;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		name: string;
		value: number;
		color: string;
	}>;
	label?: string;
}

const mockData = [
	{ street: 'Pre-Flop', pm: 85, threshold: 30 },
	{ street: 'Flop', pm: 65, threshold: 45 },
	{ street: 'Turn', pm: 40, threshold: 55 },
	{ street: 'River', pm: 15, threshold: 75 }, // Insolvência! (pm < threshold)
];

const InsolvencyTooltip = ({ active, payload, label }: CustomTooltipProps) => {
	if (!active || !payload || payload.length === 0) return null;

	return (
		<div className="rounded-xl border border-emerald-500/30 bg-slate-950/95 p-3 font-mono shadow-2xl backdrop-blur-md pointer-events-none min-w-[160px]">
			<div className="mb-2 flex items-center justify-between gap-3 border-b border-white/10 pb-1.5">
				<span className="text-[0.65rem] font-black uppercase tracking-wider text-white">{label}</span>
				<span className="text-[0.5rem] font-bold text-text-dim uppercase tracking-wider">Métricas Street</span>
			</div>
			<div className="flex flex-col gap-1.5">
				{payload.map((item) => (
					<div key={item.name} className="flex items-center justify-between gap-3 text-xs font-bold">
						<span className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-wider" style={{ color: item.color }}>
							<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
							{item.name}
						</span>
						<span className="font-mono text-[0.72rem] font-black text-white">
							{item.value.toFixed(1)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export function InsolvencyMatrix({ streetMetrics }: Readonly<InsolvencyMatrixProps>) {
	const chartData = streetMetrics && streetMetrics.length > 0 && !streetMetrics.some(s => s.loading)
		? streetMetrics.map((s) => ({
				street: s.name === 'PRE' ? 'Pre-Flop' : s.name,
				pm: Number(s.PM.toFixed(1)),
				threshold: Number(s.threshEq.toFixed(1)),
		  }))
		: mockData;

	return (
		<div className="w-full h-64">
			<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
				<AreaChart data={chartData} margin={{ top: 12, right: 36, left: -10, bottom: 4 }}>
					<defs>
						<linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
						</linearGradient>
						<linearGradient id="threshGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
							<stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="rgba(255,255,255,0.05)"
						vertical={false}
					/>
					<XAxis
						dataKey="street"
						stroke="#475569"
						tick={{
							fill: '#94a3b8',
							fontSize: 10,
							fontWeight: 800,
							fontFamily: 'var(--font-mono)',
						}}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						stroke="#475569"
						tick={{
							fill: '#94a3b8',
							fontSize: 10,
							fontWeight: 800,
							fontFamily: 'var(--font-mono)',
						}}
						axisLine={false}
						tickLine={false}
					/>
					<Tooltip
						isAnimationActive={false}
						wrapperStyle={{ zIndex: 1000 }}
						content={<InsolvencyTooltip />}
					/>
					{/* Renderiza o Teto RIO primeiro (Fundo) */}
					<Area
						type="monotone"
						dataKey="threshold"
						stroke="#ef4444"
						strokeWidth={2}
						fill="url(#threshGradient)"
						name="TETO RIO"
						isAnimationActive={false}
						activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 1.5 }}
					/>
					{/* Renderiza a PM (Equidade) na frente */}
					<Area
						type="monotone"
						dataKey="pm"
						stroke="#10b981"
						strokeWidth={3}
						fill="url(#pmGradient)"
						name="PERSPECTIVA (PM)"
						isAnimationActive={false}
						activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
