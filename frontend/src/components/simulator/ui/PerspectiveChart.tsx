'use client';

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

interface PerspectivePoint {
	name: string;
	'PM Quantum': number;
}

interface PerspectiveChartProps {
	chartData: PerspectivePoint[];
}

const INITIAL_CHART_DIMENSION = { width: 100, height: 100 };

export const PerspectiveChart = ({ chartData }: Readonly<PerspectiveChartProps>) => {
	return (
		<div className="w-full h-full min-h-0 bg-slate-950/60 rounded-2xl pt-6 pr-4 pb-2 border border-white/5 shadow-inner">
			<ResponsiveContainer
				width="100%"
				height="100%"
				minWidth={0}
				minHeight={0}
				initialDimension={INITIAL_CHART_DIMENSION}
			>
				<LineChart data={chartData}>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="rgba(255,255,255,0.05)"
						vertical={false}
					/>
					<XAxis
						dataKey="name"
						fontSize={8}
						tick={{ fill: '#475569' }}
						axisLine={false}
						tickLine={false}
					/>
					<YAxis
						fontSize={8}
						tick={{ fill: '#475569' }}
						axisLine={false}
						tickLine={false}
						tickFormatter={(v) => `${v.toFixed(0)}%`}
					/>
					<Tooltip
						isAnimationActive={false}
						allowEscapeViewBox={{ x: true, y: true }}
						wrapperStyle={{ zIndex: 1000 }}
						contentStyle={{
							background: 'var(--bg-panel)',
							border: '1px solid rgba(255,255,255,0.1)',
							fontSize: '0.6rem',
							borderRadius: '8px',
						}}
					/>
					<ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
					<Line
						type="monotone"
						dataKey="PM Quantum"
						stroke="#818cf8"
						strokeWidth={2.5}
						dot={false}
						isAnimationActive={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};
