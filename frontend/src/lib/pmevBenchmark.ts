/**
 * Contrato do artefato público do benchmark ICM × ChipEV em hand histories reais.
 *
 * Fonte: data/pmev_benchmark_icm_chipev.v1.json, gerado por
 * scripts/validation/exportar_benchmark_icm_publico.py a partir de engine/pmev_benchmark_publico.py.
 * O frontend não recalcula métrica nenhuma: ele valida o contrato e desenha. O único cálculo
 * local é o ICM do laboratório, com o mesmo kernel exato que a paridade Python/TS cobre.
 */

import rawDataset from '../../../data/pmev_benchmark_icm_chipev.v1.json';
import { calculateMalmuthHarville } from '@/lib/icmMatrix';

export const PMEV_BENCHMARK_SCHEMA = 'pmev-benchmark-icm-chipev/v1';

export interface MetricSummary {
	modelo: number;
	referencia: number;
	diferenca: number;
	ic95: [number, number];
}

export interface CalibrationBin {
	de: number;
	ate: number;
	n: number;
	previsto: number;
	observado: number;
}

export interface PlayersLeftRow {
	vivos: number;
	n: number;
	brier_icm: number;
	brier_uniforme: number;
	erro2_premio_icm: number;
	erro2_premio_chip: number;
}

export interface RealTableSample {
	nivel: number;
	blinds: { sb: number; bb: number; ante: number };
	stacks: number[];
	heroi: number;
	lugar_final: number;
	premios: number[];
	icm_ev: number[];
	chip_ev: number[];
}

export type BenchmarkMetricId = 'brier_lugar' | 'logloss_lugar' | 'brier_itm' | 'erro2_premio';

export interface BenchmarkStructure {
	id: string;
	rotulo: string;
	field: number;
	max_mesa: number;
	stack_inicial: number;
	canonicos: number;
	fracoes_premio: number[];
	prize_pool_referencia: number;
	vencedor_leva_tudo: boolean;
	estados: number;
	torneios: number;
	metricas: Record<BenchmarkMetricId, MetricSummary>;
	calibracao_itm: CalibrationBin[];
	calibracao_vitoria: CalibrationBin[];
	concavidade: CalibrationBin[];
	por_jogadores_vivos: PlayersLeftRow[];
	amostras: RealTableSample[];
}

export interface FunnelByStructure {
	maos_da_familia: number;
	estados_field_completo: number;
	estados_com_resultado: number;
}

export interface PmevBenchmarkDataset {
	schema: typeof PMEV_BENCHMARK_SCHEMA;
	gerado_em: string;
	metodo: Record<string, string>;
	privacidade: string;
	digest_amostra: string;
	estados_total: number;
	funil: { maos_ps_lidas: number; por_estrutura: Record<string, FunnelByStructure> } | null;
	estruturas: BenchmarkStructure[];
	estruturas_sem_dados: string[];
}

const METRIC_IDS: readonly BenchmarkMetricId[] = ['brier_lugar', 'logloss_lugar', 'brier_itm', 'erro2_premio'];

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isNumberArray = (v: unknown): v is number[] => Array.isArray(v) && v.every(isFiniteNumber);

function fail(message: string): never {
	throw new Error(`Artefato do benchmark inválido: ${message}`);
}

function checkMetric(v: unknown, where: string): void {
	if (!isRecord(v)) fail(`${where} não é objeto`);
	for (const k of ['modelo', 'referencia', 'diferenca'] as const) {
		if (!isFiniteNumber(v[k])) fail(`${where}.${k} não é número`);
	}
	const ic = v['ic95'];
	if (!isNumberArray(ic) || ic.length !== 2 || (ic[0] ?? 0) > (ic[1] ?? 0)) fail(`${where}.ic95 fora de ordem`);
}

function checkBins(v: unknown, where: string): void {
	if (!Array.isArray(v)) fail(`${where} não é lista`);
	for (const bin of v) {
		if (!isRecord(bin) || !['de', 'ate', 'n', 'previsto', 'observado'].every((k) => isFiniteNumber(bin[k]))) {
			fail(`${where} tem faixa malformada`);
		}
	}
}

function checkSample(v: unknown, where: string): void {
	if (!isRecord(v)) fail(`${where} não é objeto`);
	const { stacks, premios, icm_ev, chip_ev, heroi, lugar_final } = v;
	if (!isNumberArray(stacks) || !isNumberArray(premios) || !isNumberArray(icm_ev) || !isNumberArray(chip_ev)) {
		fail(`${where} com vetor malformado`);
	}
	if (icm_ev.length !== stacks.length || chip_ev.length !== stacks.length || premios.length > stacks.length) {
		fail(`${where} com vetores de tamanhos incoerentes`);
	}
	if (!isFiniteNumber(heroi) || heroi < 0 || heroi >= stacks.length) fail(`${where}.heroi fora da mesa`);
	if (!isFiniteNumber(lugar_final) || lugar_final < 1 || lugar_final > stacks.length) fail(`${where}.lugar_final fora de 1..r`);
	const soma = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
	if (Math.abs(soma(icm_ev) - soma(premios)) > 1e-6) fail(`${where} com ICM que não soma o prêmio em disputa`);
}

export function parsePmevBenchmarkDataset(value: unknown): PmevBenchmarkDataset {
	if (!isRecord(value)) fail('raiz não é objeto');
	if (value['schema'] !== PMEV_BENCHMARK_SCHEMA) fail(`schema ${String(value['schema'])} não suportado`);
	if (typeof value['digest_amostra'] !== 'string' || !/^[0-9a-f]{64}$/.test(value['digest_amostra'])) {
		fail('digest_amostra não é sha256');
	}
	const estruturas = value['estruturas'];
	if (!Array.isArray(estruturas) || estruturas.length === 0) fail('sem estruturas');
	for (const e of estruturas) {
		if (!isRecord(e) || typeof e['id'] !== 'string') fail('estrutura sem id');
		const metricas = e['metricas'];
		if (!isRecord(metricas)) fail(`${e['id']} sem métricas`);
		for (const m of METRIC_IDS) checkMetric(metricas[m], `${e['id']}.${m}`);
		for (const b of ['calibracao_itm', 'calibracao_vitoria', 'concavidade'] as const) checkBins(e[b], `${e['id']}.${b}`);
		const amostras = e['amostras'];
		if (!Array.isArray(amostras)) fail(`${e['id']} sem amostras`);
		amostras.forEach((a, i) => checkSample(a, `${e['id']}.amostras[${i}]`));
	}
	return value as unknown as PmevBenchmarkDataset;
}

export const PMEV_BENCHMARK: PmevBenchmarkDataset = parsePmevBenchmarkDataset(rawDataset);

/** P(jogador termina em k), k = 1..r: o kernel exato com prêmio unitário na posição k. */
export function placeProbabilities(stacks: number[], player: number): number[] {
	return stacks.map((_, k) => {
		const unit = new Array<number>(k + 1).fill(0);
		unit[k] = 1;
		return calculateMalmuthHarville(stacks, unit)[player] ?? 0;
	});
}

export function structureById(id: string): BenchmarkStructure {
	const found = PMEV_BENCHMARK.estruturas.find((e) => e.id === id);
	if (!found) throw new Error(`Estrutura desconhecida no benchmark: ${id}`);
	return found;
}

/** Intervalo inteiro de um lado do zero: a diferença é distinguível do acaso na amostra. */
export function isResolved(metric: MetricSummary): boolean {
	return metric.ic95[1] < 0 || metric.ic95[0] > 0;
}
