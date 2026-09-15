/**
 * Diferença (ICM − referência) com intervalo de 95% por formato de torneio, uma métrica por
 * gráfico: as unidades não se comparam entre métricas, então cada uma tem a própria escala.
 * À esquerda do zero, o ICM erra menos. Intervalo inteiro de um lado do zero ganha a cor do ICM.
 */

import { isResolved, type MetricSummary } from '@/lib/pmevBenchmark';
import styles from './benchmark.module.css';

export interface ForestRow {
	label: string;
	metric: MetricSummary;
	states: number;
}

interface ForestPlotProps {
	title: string;
	explanation: string;
	reference: string;
	rows: ForestRow[];
	digits?: number;
}

const W = 560;
const ROW = 40;
const LABEL = 230;
const RIGHT = 16;

export function ForestPlot({ title, explanation, reference, rows, digits = 3 }: Readonly<ForestPlotProps>) {
	const extent = Math.max(...rows.flatMap((r) => [Math.abs(r.metric.ic95[0]), Math.abs(r.metric.ic95[1])]), 1e-9) * 1.1;
	const x = (v: number) => LABEL + ((v + extent) / (2 * extent)) * (W - LABEL - RIGHT);
	const H = rows.length * ROW + 8;
	const titleId = `${title.replaceAll(/\W+/g, '-').toLowerCase()}-floresta`;

	return (
		<figure className={styles['forest']}>
			<figcaption className={styles['caption']}>
				<strong>{title}</strong>
				<span>{explanation}</span>
			</figcaption>
			<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={titleId} className={styles['svg']}>
				<title id={titleId}>{`${title}: ICM menos ${reference}, com intervalo de 95%`}</title>
				<line x1={x(0)} x2={x(0)} y1={4} y2={H - 4} className={styles['zero']} />
				{rows.map((r, i) => {
					const cy = 22 + i * ROW;
					return (
						<g key={r.label} className={isResolved(r.metric) ? styles['resolved'] : undefined}>
							<text x={0} y={cy + 4} className={styles['forestLabel']}>
								{r.label}
							</text>
							<line x1={x(r.metric.ic95[0])} x2={x(r.metric.ic95[1])} y1={cy} y2={cy} className={styles['ci']} />
							<circle cx={x(r.metric.diferenca)} cy={cy} r={6} className={styles['point']} />
						</g>
					);
				})}
			</svg>
			{/* Fora do SVG: texto HTML quebra linha no celular em vez de se sobrepor. */}
			<div className={styles['sides']} aria-hidden="true">
				<span>← ICM erra menos</span>
				<span>{reference} erra menos →</span>
			</div>
			<table className="sr-only">
				<caption>{title}</caption>
				<thead>
					<tr>
						<th scope="col">Formato</th>
						<th scope="col">Estados</th>
						<th scope="col">ICM</th>
						<th scope="col">{reference}</th>
						<th scope="col">Diferença e intervalo de 95%</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={r.label}>
							<td>{r.label}</td>
							<td>{r.states}</td>
							<td>{r.metric.modelo.toFixed(digits)}</td>
							<td>{r.metric.referencia.toFixed(digits)}</td>
							<td>
								{r.metric.diferenca.toFixed(digits)} [{r.metric.ic95[0].toFixed(digits)}; {r.metric.ic95[1].toFixed(digits)}]
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</figure>
	);
}
