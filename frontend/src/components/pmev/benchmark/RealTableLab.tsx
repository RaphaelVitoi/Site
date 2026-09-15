'use client';

/**
 * Laboratório de mesa real: um estado verdadeiro de hand history, o que o ICM e o ChipEV
 * dizem sobre ele, e — só quando o leitor pede — como aquele torneio terminou.
 *
 * O resultado fica escondido de propósito. Ver a previsão antes do desfecho é o que torna
 * a lição honesta: uma mesa sozinha quase nunca decide nada, e o leitor sente isso.
 */

import { useId, useMemo, useState } from 'react';
import { placeProbabilities, type BenchmarkStructure } from '@/lib/pmevBenchmark';
import styles from './benchmark.module.css';

interface RealTableLabProps {
	structures: BenchmarkStructure[];
}

const decimal = (v: number, digits: number) =>
	v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const pct = (v: number) => `${decimal(v * 100, 1)}%`;
const money = (v: number, normalized: boolean) => (normalized ? `${pct(v)} do prêmio` : `US$ ${decimal(v, 2)}`);
const ordinal = (n: number) => `${n}º`;
const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

export default function RealTableLab({ structures }: Readonly<RealTableLabProps>) {
	const [structureIndex, setStructureIndex] = useState(0);
	const [sampleIndex, setSampleIndex] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const baseId = useId();

	const structure = structures[structureIndex] ?? structures[0];
	const sample = structure?.amostras[sampleIndex % Math.max(structure.amostras.length, 1)];

	const view = useMemo(() => {
		if (!structure || !sample) return null;
		const total = sample.stacks.reduce((s, x) => s + x, 0);
		const pool = sample.premios.reduce((s, x) => s + x, 0);
		const normalized = structure.vencedor_leva_tudo;
		const probabilities = placeProbabilities(sample.stacks, sample.heroi);
		return {
			probabilities,
			// A barra mais alta ocupa a altura toda: a comparação entre lugares é o que se lê.
			maxProbability: Math.max(...probabilities, 1e-9),
			total,
			biggest: Math.max(...sample.stacks),
			normalized,
			scale: normalized && pool > 0 ? 1 / pool : 1,
		};
	}, [structure, sample]);

	if (!structure || !sample || !view) return null;

	const choose = (i: number) => {
		setStructureIndex(i);
		setSampleIndex(0);
		setRevealed(false);
	};
	const nextTable = () => {
		setSampleIndex((i) => (i + 1) % structure.amostras.length);
		setRevealed(false);
	};

	const heroProbability = view.probabilities[sample.lugar_final - 1] ?? 0;
	const paid = Math.min(structure.fracoes_premio.length, sample.stacks.length);
	const prize = sample.premios[sample.lugar_final - 1] ?? 0;
	const titleId = `${baseId}-titulo`;

	return (
		<section aria-labelledby={titleId} className={styles['lab']}>
			<div className={styles['labHead']}>
				<h2 id={titleId} className={styles['labTitle']}>
					Uma mesa de verdade
				</h2>
				<div role="radiogroup" aria-label="Formato do torneio" className={styles['formats']}>
					{structures.map((s, i) => (
						<button
							key={s.id}
							type="button"
							role="radio"
							aria-checked={i === structureIndex}
							onClick={() => choose(i)}
							className={styles['format']}
						>
							{s.rotulo}
						</button>
					))}
				</div>
			</div>

			<p className={styles['context']}>
				{sample.stacks.length} jogadores vivos no nível {sample.nivel}, blinds {sample.blinds.sb}/{sample.blinds.bb}
				{sample.blinds.ante > 0 ? ` com ante ${sample.blinds.ante}` : ''}. Todas as {view.total.toLocaleString('pt-BR')}{' '}
				fichas do torneio estão nesta mesa, então este é um estado completo.
			</p>

			<p className={styles['legend']} aria-hidden="true">
				<span className={styles['chip']}>Ouro: ChipEV</span> <span className={styles['icm']}>Verde: ICM</span>
			</p>
			<div className={styles['table']} role="table" aria-label="Fichas e valor de cada jogador">
				<div role="row" className={cx(styles['row'], styles['rowHead'])}>
					<span role="columnheader">Jogador</span>
					<span role="columnheader">Fichas</span>
					<span role="columnheader" className={styles['money']}>
						ChipEV
					</span>
					<span role="columnheader" className={styles['money']}>
						ICM
					</span>
				</div>
				{sample.stacks.map((stack, i) => {
					const isHero = i === sample.heroi;
					return (
						<div role="row" key={i} className={cx(styles['row'], isHero && styles['rowHero'])}>
							<span role="cell" className={styles['who']}>
								{isHero ? 'Dono das mãos' : `Assento ${i + 1}`}
							</span>
							<span role="cell" className={styles['stack']}>
								<span className={styles['track']} aria-hidden="true">
									<span className={styles['bar']} style={{ inlineSize: `${(stack / view.biggest) * 100}%` }} />
								</span>
								<span className={styles['stackLabel']}>
									{stack.toLocaleString('pt-BR')} <span className={styles['share']}>{pct(stack / view.total)}</span>
								</span>
							</span>
							<span role="cell" className={styles['moneyChip']}>
								{money((sample.chip_ev[i] ?? 0) * view.scale, view.normalized)}
							</span>
							<span role="cell" className={styles['moneyIcm']}>
								{money((sample.icm_ev[i] ?? 0) * view.scale, view.normalized)}
							</span>
						</div>
					);
				})}
			</div>

			<figure className={styles['places']}>
				<figcaption>Chance de o dono das mãos terminar em cada lugar, segundo o ICM. Em verde, os lugares pagos.</figcaption>
				<ol className={styles['placeBars']}>
					{view.probabilities.map((p, k) => (
						<li
							key={k}
							className={cx(
								styles['place'],
								k < paid && styles['placePaid'],
								revealed && k + 1 === sample.lugar_final && styles['placeActual'],
							)}
							aria-label={`${ordinal(k + 1)} lugar: ${pct(p)}`}
						>
							<span className={styles['placePct']} aria-hidden="true">
								{pct(p)}
							</span>
							<span
								className={styles['placeFill']}
								style={{ blockSize: `${Math.max((p / view.maxProbability) * 100, 2)}%` }}
								aria-hidden="true"
							/>
							<span className={styles['placeLabel']} aria-hidden="true">
								{ordinal(k + 1)}
							</span>
						</li>
					))}
				</ol>
			</figure>

			<div className={styles['actions']}>
				<button type="button" className={styles['reveal']} onClick={() => setRevealed(true)} disabled={revealed}>
					Mostrar como terminou
				</button>
				<button type="button" className={styles['next']} onClick={nextTable}>
					Ver outra mesa real
				</button>
			</div>

			<p aria-live="polite" className={styles['outcome']}>
				{revealed
					? `Terminou em ${ordinal(sample.lugar_final)}${prize > 0 ? `, com ${money(prize * view.scale, view.normalized)}` : ', fora do dinheiro'}. O ICM dava ${pct(heroProbability)} para esse lugar.`
					: 'O desfecho fica escondido até você pedir. Primeiro a previsão, depois a realidade.'}
			</p>
		</section>
	);
}
