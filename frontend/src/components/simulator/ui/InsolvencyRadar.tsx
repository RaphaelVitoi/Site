/**
 * IDENTITY: Gráfico de Radar de Insolvência (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/ui/InsolvencyRadar.tsx
 * ROLE: Visualização vetorial de tensões e colapso de equidade.
 *       Componentizado para permitir carregamento dinâmico e otimização de bundle.
 */

import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from 'recharts';

interface InsolvencyRadarProps {
	data: {
		subject: string;
		Ameaça: number;
	}[];
}

export function InsolvencyRadar({ data }: Readonly<InsolvencyRadarProps>) {
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-text-darker text-[0.7rem] font-black uppercase tracking-[0.5em] animate-pulse">
				Processando Assinatura Bayesiana...
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
			<RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
				<defs>
					<linearGradient id="gradInsolvency" x1="0" y1="0" x2="1" y2="1">
						<stop offset="5%" stopColor="var(--color-accent-rose)" stopOpacity={0.7} />
						<stop offset="95%" stopColor="var(--color-accent-rose)" stopOpacity={0.1} />
					</linearGradient>
				</defs>
				<PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
				<PolarAngleAxis
					dataKey="subject"
					tick={{
						fill: '#94a3b8',
						fontSize: 10,
						fontWeight: 900,
						fontFamily: 'var(--font-mono)',
						letterSpacing: '0.15em',
					}}
				/>
				<PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
				<Radar
					name="Ameaça (%)"
					dataKey="Ameaça"
					stroke="var(--color-accent-rose)"
					strokeWidth={4}
					fill="url(#gradInsolvency)"
					fillOpacity={0.5}
					animationDuration={2500}
				/>
				<RechartsTooltip
					contentStyle={{
						backgroundColor: '#020617',
						border: '1px solid rgba(244,63,94,0.4)',
						borderRadius: '20px',
						boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
						padding: '16px',
					}}
					itemStyle={{
						color: '#fb7185',
						fontWeight: '900',
						textTransform: 'uppercase',
						fontSize: '11px',
						letterSpacing: '0.1em'
					}}
				/>
				<Legend
					verticalAlign="bottom"
					wrapperStyle={{
						paddingTop: '50px',
						fontSize: '0.7rem',
						fontWeight: '900',
						textTransform: 'uppercase',
						letterSpacing: '0.3em',
						color: 'var(--color-text-muted)'
					}}
				/>
			</RadarChart>
		</ResponsiveContainer>
	);
}

export default InsolvencyRadar;
