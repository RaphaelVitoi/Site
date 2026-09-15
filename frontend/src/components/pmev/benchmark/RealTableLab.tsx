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
		const players = sample.stacks.map((stack, seatIndex) => ({
			seatKey: `${structure.id}-s${sampleIndex}-seat-${seatIndex + 1}`,
			seatNumber: seatIndex + 1,
			isHero: seatIndex === sample.heroi,
			stack,
			chipEv: sample.chip_ev[seatIndex] ?? 0,
			icmEv: sample.icm_ev[seatIndex] ?? 0,
		}));
		const placeChances = probabilities.map((p, idx) => ({
			placeKey: `${structure.id}-s${sampleIndex}-place-${idx + 1}`,
			place: idx + 1,
			probability: p,
		}));
		return {
			probabilities,
			// A barra mais alta ocupa a altura toda: a comparação entre lugares é o que se lê.
			maxProbability: Math.max(...probabilities, 1e-9),
			total,
			biggest: Math.max(...sample.stacks),
			normalized,
			scale: normalized && pool > 0 ? 1 / pool : 1,
			players,
			placeChances,
		};
	}, [structure, sample, sampleIndex]);

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
	const prizeDetail = prize > 0 ? `, com ${money(prize * view.scale, view.normalized)}` : ', fora do dinheiro';
	const outcomeText = revealed
		? `Terminou em ${ordinal(sample.lugar_final)}${prizeDetail}. O ICM dava ${pct(heroProbability)} para esse lugar.`
		: 'O desfecho fica escondido até você pedir. Primeiro a previsão, depois a realidade.';

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
				{view.players.map((player) => (
					<div role="row" key={player.seatKey} className={cx(styles['row'], player.isHero && styles['rowHero'])}>
						<span role="cell" className={styles['who']}>
							{player.isHero ? 'Dono das mãos' : `Assento ${player.seatNumber}`}
						</span>
						<span role="cell" className={styles['stack']}>
							<span className={styles['track']} aria-hidden="true">
								<span className={styles['bar']} style={{ inlineSize: `${(player.stack / view.biggest) * 100}%` }} />
							</span>
							<span className={styles['stackLabel']}>
								{player.stack.toLocaleString('pt-BR')}{' '}
								<span className={styles['share']}>{pct(player.stack / view.total)}</span>
							</span>
						</span>
						<span role="cell" className={styles['moneyChip']}>
							{money(player.chipEv * view.scale, view.normalized)}
						</span>
						<span role="cell" className={styles['moneyIcm']}>
							{money(player.icmEv * view.scale, view.normalized)}
						</span>
					</div>
				))}
			</div>

			<figure className={styles['places']}>
				<figcaption>Chance de o dono das mãos terminar em cada lugar, segundo o ICM. Em verde, os lugares pagos.</figcaption>
				<ol className={styles['placeBars']}>
					{view.placeChances.map((item) => (
						<li
							key={item.placeKey}
							className={cx(
								styles['place'],
								item.place <= paid && styles['placePaid'],
								revealed && item.place === sample.lugar_final && styles['placeActual'],
							)}
							aria-label={`${ordinal(item.place)} lugar: ${pct(item.probability)}`}
						>
							<span className={styles['placePct']} aria-hidden="true">
								{pct(item.probability)}
							</span>
							<span
								className={styles['placeFill']}
								style={{ blockSize: `${Math.max((item.probability / view.maxProbability) * 100, 2)}%` }}
								aria-hidden="true"
							/>
							<span className={styles['placeLabel']} aria-hidden="true">
								{ordinal(item.place)}
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
				{outcomeText}
			</p>
		</section>
	);
}
