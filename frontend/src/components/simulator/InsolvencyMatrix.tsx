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

const mockData = [
	{ street: 'Pre-Flop', pm: 85, threshold: 30 },
	{ street: 'Flop', pm: 65, threshold: 45 },
	{ street: 'Turn', pm: 40, threshold: 55 },
	{ street: 'River', pm: 15, threshold: 75 }, // Insolvência! (pm < threshold)
];

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
				<AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
						contentStyle={{
							backgroundColor: '#020617',
							borderColor: 'rgba(16,185,129,0.3)',
							borderRadius: '12px',
							boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
						}}
						itemStyle={{
							fontWeight: 900,
							fontFamily: 'var(--font-mono)',
							fontSize: '12px',
							textTransform: 'uppercase',
						}}
						labelStyle={{ color: '#fff', fontWeight: 900, marginBottom: '8px' }}
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
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
