import rawDataset from '../../../../data/pmev_benchmark_icm_chipev.v1.json';
import { calculateMalmuthHarville } from '@/lib/icmMatrix';
import {
	PMEV_BENCHMARK,
	PMEV_BENCHMARK_SCHEMA,
	isResolved,
	parsePmevBenchmarkDataset,
	placeProbabilities,
} from '@/lib/pmevBenchmark';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

describe('Artefato público do benchmark ICM × ChipEV', () => {
	it('valida o contrato gerado pelo Python', () => {
		expect(PMEV_BENCHMARK.schema).toBe(PMEV_BENCHMARK_SCHEMA);
		expect(PMEV_BENCHMARK.estruturas.length).toBeGreaterThan(0);
		expect(PMEV_BENCHMARK.estados_total).toBe(PMEV_BENCHMARK.estruturas.reduce((s, e) => s + e.estados, 0));
	});

	it('o ICM publicado pelo Python confere com o kernel TypeScript em cada mesa amostrada', () => {
		for (const estrutura of PMEV_BENCHMARK.estruturas) {
			for (const amostra of estrutura.amostras) {
				const ts = calculateMalmuthHarville(amostra.stacks, amostra.premios);
				ts.forEach((v, i) => expect(v).toBeCloseTo(amostra.icm_ev[i] ?? Number.NaN, 9));
			}
		}
	});

	it('as probabilidades de lugar somam 1 e o primeiro lugar é a fração de fichas', () => {
		const amostra = PMEV_BENCHMARK.estruturas[0]?.amostras[0];
		expect(amostra).toBeDefined();
		if (!amostra) return;
		const p = placeProbabilities(amostra.stacks, amostra.heroi);
		const total = amostra.stacks.reduce((s, x) => s + x, 0);
		expect(p.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12);
		expect(p[0]).toBeCloseTo((amostra.stacks[amostra.heroi] ?? 0) / total, 12);
	});

	it('no formato vencedor-leva-tudo o ICM das amostras é o ChipEV', () => {
		for (const estrutura of PMEV_BENCHMARK.estruturas.filter((e) => e.vencedor_leva_tudo)) {
			expect(estrutura.metricas.erro2_premio.diferenca).toBeCloseTo(0, 9);
			for (const a of estrutura.amostras) a.icm_ev.forEach((v, i) => expect(v).toBeCloseTo(a.chip_ev[i] ?? Number.NaN, 9));
		}
	});

	it('recusa artefato adulterado em vez de desenhar número errado', () => {
		const semSchema = { ...clone(rawDataset), schema: 'outro/v9' };
		expect(() => parsePmevBenchmarkDataset(semSchema)).toThrow(/schema/);

		const icInvertido = clone(rawDataset) as { estruturas: { metricas: { brier_lugar: { ic95: number[] } } }[] };
		const alvo = icInvertido.estruturas[0];
		if (alvo) alvo.metricas.brier_lugar.ic95 = [1, -1];
		expect(() => parsePmevBenchmarkDataset(icInvertido)).toThrow(/ic95/);

		const heroiFora = clone(rawDataset) as { estruturas: { amostras: { heroi: number }[] }[] };
		const amostra = heroiFora.estruturas[0]?.amostras[0];
		if (amostra) amostra.heroi = 99;
		expect(() => parsePmevBenchmarkDataset(heroiFora)).toThrow(/heroi/);
	});

	it('não publica identificador de torneio, de mão nem nome de jogador', () => {
		const texto = JSON.stringify(rawDataset);
		expect(texto).not.toMatch(/tourney|Tournament #|Hand #|Seat \d+:|Dealt to/);
		for (const estrutura of PMEV_BENCHMARK.estruturas) {
			for (const amostra of estrutura.amostras) {
				expect(Object.keys(amostra).sort()).toEqual(
					['blinds', 'chip_ev', 'heroi', 'icm_ev', 'lugar_final', 'nivel', 'premios', 'stacks'].sort(),
				);
			}
		}
	});

	it('intervalo inteiro de um lado do zero é o único que conta como resolvido', () => {
		expect(isResolved({ modelo: 0, referencia: 0, diferenca: -1, ic95: [-2, -0.5] })).toBe(true);
		expect(isResolved({ modelo: 0, referencia: 0, diferenca: -1, ic95: [-2, 0.5] })).toBe(false);
	});
});
