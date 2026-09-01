import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EDITORIAL_CONTENT_REGISTRY } from '@/content/editorialRegistry';

const FRONTEND_ROOT = resolve(__dirname, '../../..');

function sourceText(id: string): string {
	const item = EDITORIAL_CONTENT_REGISTRY.find((entry) => entry.id === id);
	if (!item) throw new Error(`Entrada editorial ausente: ${id}`);
	return readFileSync(resolve(FRONTEND_ROOT, item.sourcePath), 'utf8');
}

describe('Fronteiras editoriais da teoria PMev', () => {
	it('mantém a direção de Vantagem de Risco e recusa conversão linear em Toy Games', () => {
		const theory = sourceText('toy-games-theory-markdown');

		expect(theory).toContain('RP_{defensor} - RP_{agressor}');
		expect(theory).toContain('menor RP');
		expect(theory).toContain('não é um conversor linear');
		expect(theory).not.toContain('quase a proporção exata');
		expect(theory).not.toContain('75% de fold contra o CL não é um erro - é a frequência GTO');
	});

	it('declara calibração como hipótese reprodutível, não como validação genérica', () => {
		const calibration = sourceText('calibration-nodes-aula-1-2');

		expect(calibration).toContain('reprodução');
		expect(calibration).toContain('BB possui a Vantagem de Risco');
		expect(calibration).not.toContain('Dados validados via `nashSolver.test.ts`');
	});

	it('separa a proposta autoral de PMev de uma certificação irrefutável', () => {
		for (const id of [
			'teoria-perspectiva-matematica-vitoi',
			'vitoi-perspective-paradigm-raw',
		]) {
			const theory = sourceText(id);
			expect(theory).toContain('proposta autoral');
			expect(theory).not.toContain('rigor irrefutável');
		}
	});

	it('alinha PRD, SPEC e rascunhos de pesquisa aos contratos e limites reais do motor', () => {
		const prd = sourceText('prd-icm-toy');
		const spec = sourceText('spec-icm-toy');
		const evFold = sourceText('pt1-ev-fold-fgs');
		const potOdds = sourceText('pt2-pot-odds-edge');
		const structures = sourceText('estruturas-de-torneio-raw');

		expect(prd).toContain('dados insuficientes para frequência');
		expect(prd).toContain('ΔRP(A→D) = RP_defensor − RP_agressor');
		expect(spec).toContain('heurística quadrática');
		expect(spec).toContain('C_i` é derivado de probabilidade de vitória');
		expect(evFold).toContain('não deve aparecer como constante');
		expect(potOdds).toContain('condição necessária');
		expect(potOdds).not.toContain('Edge Infinita');
		expect(structures).toContain('taxonomia didática interna');
	});

	it('remove ajustes de frequência fabricados do explorador de ranges', () => {
		const viewer = readFileSync(
			resolve(FRONTEND_ROOT, 'src/components/simulator/PmevRangeViewer.tsx'),
			'utf8',
		);

		expect(viewer).not.toContain('adjustedFreq: Math.min(1.0, baseFreq + 0.25)');
		expect(viewer).not.toContain('adjustedFreq: Math.max(0.0, baseFreq - 0.35)');
		expect(viewer).not.toContain('adjustedFreq: Math.max(0.0, baseFreq - 0.4)');
		expect(viewer).not.toContain('adjustedFreq: Math.min(1.0, baseFreq + 0.35)');
		expect(viewer).not.toContain('adjustedFreq: 0.65');
		expect(viewer).toContain('não produz, por si só, um deslocamento numérico de frequência');
	});

	it('não deixa a rota pública reintroduzir alegações que a curadoria acabou de retirar', () => {
		const whitepaper = readFileSync(
			resolve(FRONTEND_ROOT, 'src/app/(public)/aulas/leitura-icm/page.tsx'),
			'utf8',
		);
		const lesson = readFileSync(
			resolve(FRONTEND_ROOT, 'src/app/(public)/biblioteca/heuristica-icm-pos-flop-aula/page.tsx'),
			'utf8',
		);
		const calibration = readFileSync(
			resolve(FRONTEND_ROOT, 'src/app/(public)/biblioteca/nos-de-calibragem/page.tsx'),
			'utf8',
		);
		const payoutStructures = readFileSync(
			resolve(FRONTEND_ROOT, 'src/app/(public)/biblioteca/estruturas-de-torneio/page.tsx'),
			'utf8',
		);

		expect(whitepaper).toContain('Esse diferencial não dita linearmente');
		expect(lesson).toContain('ΔRP(BTN→BB):** 12.9% − 21.4% = **-8.5 p.p.');
		expect(lesson).not.toContain('autorização matemática');
		expect(calibration).toContain('Estado de evidência');
		expect(calibration).not.toContain('ponto de verdade absoluta');
		expect(payoutStructures).toContain('templates abaixo são didáticos');
		expect(payoutStructures).not.toContain('Jogo se aproxima muito de ChipEV');
	});
});
