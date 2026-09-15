/**
 * Curva por faixas contra a diagonal. Serve a dois gráficos com leituras diferentes:
 * calibração (previsto x observado; a diagonal é a previsão perfeita) e concavidade
 * (fração de fichas x fração do prêmio; a diagonal é o ChipEV).
 * SVG puro, renderizado no servidor, com tabela equivalente para leitor de tela.
 */

import type { CalibrationBin } from '@/lib/pmevBenchmark';
import styles from './benchmark.module.css';

interface BinnedCurveChartProps {
	bins: CalibrationBin[];
	title: string;
	description: string;
	xLabel: string;
	yLabel: string;
	tone: 'icm' | 'reality';
}

const W = 340;
const H = 330;
const PAD = 40;
// Margem esquerda maior: rótulos de 100% e o título do eixo vertical não podem se sobrepor.
const PAD_ESQ = 60;
const px = (v: number) => PAD_ESQ + v * (W - PAD_ESQ - PAD / 2);
const py = (v: number) => H - PAD - v * (H - 1.5 * PAD);

/** Faixa com menos estados que isto oscila por acaso e desenharia ruído como se fosse sinal. */
export const MIN_ESTADOS_POR_FAIXA = 30;

export function BinnedCurveChart({ bins: todas, title, description, xLabel, yLabel, tone }: Readonly<BinnedCurveChartProps>) {
	const bins = todas.filter((b) => b.n >= MIN_ESTADOS_POR_FAIXA);
	const omitidos = todas.filter((b) => b.n < MIN_ESTADOS_POR_FAIXA).reduce((s, b) => s + b.n, 0);
	const maxN = Math.max(...bins.map((b) => b.n), 1);
	const path = bins.map((b, i) => `${i === 0 ? 'M' : 'L'}${px(b.previsto).toFixed(1)},${py(b.observado).toFixed(1)}`).join(' ');
	const titleId = `${title.replaceAll(/\W+/g, '-').toLowerCase()}-curva`;

	return (
		<figure className={`${styles['curve']} ${tone === 'reality' ? styles['reality'] : ''}`}>
			<figcaption className={styles['caption']}>
				<strong>{title}</strong>
				<span>
					{description}
					{omitidos > 0
						? ` Faixas com menos de ${MIN_ESTADOS_POR_FAIXA} estados ficam fora do desenho (${omitidos} estados).`
						: ''}
				</span>
			</figcaption>
			<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={titleId} className={styles['svg']}>
				<title id={titleId}>{title}</title>
				{[0, 0.25, 0.5, 0.75, 1].map((t) => (
					<g key={t} className={styles['grid']}>
						<line x1={px(t)} x2={px(t)} y1={py(0)} y2={py(1)} />
						<line x1={px(0)} x2={px(1)} y1={py(t)} y2={py(t)} />
						<text x={px(t)} y={H - PAD + 16} textAnchor="middle">
							{Math.round(t * 100)}%
						</text>
						<text x={PAD_ESQ - 8} y={py(t) + 4} textAnchor="end">
							{Math.round(t * 100)}%
						</text>
					</g>
				))}
				<text x={(px(0) + px(1)) / 2} y={H - 4} textAnchor="middle">
					{xLabel}
				</text>
				<text x={12} y={(py(0) + py(1)) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(py(0) + py(1)) / 2})`}>
					{yLabel}
				</text>
				<line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} className={styles['diagonal']} />
				<path d={path} className={styles['curveLine']} />
				{bins.map((b) => (
					<circle key={b.de} cx={px(b.previsto)} cy={py(b.observado)} r={3 + 7 * Math.sqrt(b.n / maxN)} className={styles['curveDot']} />
				))}
			</svg>
			<table className="sr-only">
				<caption>{title}</caption>
				<thead>
					<tr>
						<th scope="col">Faixa</th>
						<th scope="col">Estados</th>
						<th scope="col">{xLabel}</th>
						<th scope="col">{yLabel}</th>
					</tr>
				</thead>
				<tbody>
					{bins.map((b) => (
						<tr key={b.de}>
							<td>
								{Math.round(b.de * 100)} a {Math.round(b.ate * 100)}%
							</td>
							<td>{b.n}</td>
							<td>{(b.previsto * 100).toFixed(1)}%</td>
							<td>{(b.observado * 100).toFixed(1)}%</td>
						</tr>
					))}
				</tbody>
			</table>
		</figure>
	);
}
