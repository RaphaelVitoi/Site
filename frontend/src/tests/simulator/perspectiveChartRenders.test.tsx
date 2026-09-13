/**
 * O NUMERO QUE A SS10.1 EXIGE, e que o React.memo do PerspectiveChart nao tinha.
 *
 * O memo foi aplicado em 812c1c2f com a justificativa "prevent layout
 * recalculations" -- uma hipotese, nao uma medicao. A SS10.1 e explicita:
 * alteracao de performance exige UM numero medido antes, e "medir e refutar e
 * ENTREGA".
 *
 * O QUE SE MEDE, e por que e o contrafactual certo. Nao da para contar renders
 * do componente memoizado -- o memo justamente os impede, e contar zero nao
 * prova ganho nenhum. Conta-se, por INSTANCIA do grafico:
 *
 *   R = renders do pai que chegariam ao grafico SEM o memo, depois da interacao
 *   E = quantos deles trazem um chartData REALMENTE novo
 *
 * `R - E` e o numero de renders que o memo evita. O mock substitui o
 * PerspectiveChart por um componente SEM memo de proposito: e assim que se
 * observa o mundo sem a otimizacao, que e o unico jeito de dizer quanto ela vale.
 *
 * ERRO DE INSTRUMENTO CORRIGIDO AQUI, e ele vale mais que o resultado. A primeira
 * versao zerava o contador ANTES da interacao e contava referencias distintas
 * apenas depois dela. Assim a linha de base sumia: mesmo quando o chartData
 * mudava de fato, a contagem via UMA referencia so e concluia "nao mudou". A
 * medicao precisa carregar o estado anterior, senao ela mede a propria janela.
 */

import { act, fireEvent, render } from '@testing-library/react';

const renders: unknown[] = [];

jest.mock('@/components/simulator/ui/PerspectiveChart', () => ({
	// Sem memo: cada render do pai chega aqui, que e o mundo sem a otimizacao.
	PerspectiveChart: ({ chartData }: { chartData: unknown }) => {
		renders.push(chartData);
		return null;
	},
}));

jest.mock('@/components/simulator/hooks/useSotaSync', () => ({
	useSotaSync: () => ({ physics: { referenceStatus: undefined } }),
}));

jest.mock('@/components/simulator/ui/GravitationalScannerPanel', () => ({
	GravitationalScannerPanel: () => null,
}));

jest.mock('./../../components/simulator/panels/WasmTelemetryWidget', () => ({
	WasmTelemetryWidget: () => null,
}));

// jsdom nao tem Worker. O painel posta e espera resposta; aqui a resposta e
// entregue sob demanda, para que o render que ELA provoca seja contado tambem.
let entregarResposta: (() => void) | null = null;

class WorkerFalso {
	onmessage: ((e: MessageEvent) => void) | null = null;
	postMessage(msg: { id: number }) {
		entregarResposta = () => {
			this.onmessage?.({ data: { id: msg.id, type: 'WASM_RESULT' } } as MessageEvent);
		};
	}
	terminate() {}
}

beforeAll(() => {
	(globalThis as unknown as { Worker: unknown }).Worker = WorkerFalso;
});

beforeEach(() => {
	renders.length = 0;
	entregarResposta = null;
});

/** Uma entrada por render do pai: o painel monta DUAS instancias do grafico. */
function porInstancia(): unknown[] {
	return renders.filter((_, i) => i % 2 === 0);
}

async function montar() {
	const { default: PerspectivePanel } = await import(
		'@/components/simulator/panels/PerspectivePanel'
	);
	return render(<PerspectivePanel initialStacks={[40, 40]} initialPrizes={[65, 35]} scenarioId="t" />);
}

/**
 * Interage e devolve a conta. A linha de base e a ultima referencia ANTES da
 * interacao -- sem ela a medicao nao consegue ver mudanca alguma.
 */
function medirInteracao(seletor: string, valor: string, container: HTMLElement) {
	const antes = porInstancia();
	const base = antes[antes.length - 1];
	const marca = antes.length;

	const controle = container.querySelector(seletor) as HTMLInputElement;
	fireEvent.change(controle, { target: { value: valor } });
	const antesDaResposta = porInstancia().length - marca;
	act(() => {
		entregarResposta?.();
	});

	const depois = porInstancia().slice(marca);
	const novos = new Set(depois.filter((r) => r !== base)).size;
	return {
		renders: depois.length,
		efetivos: novos,
		desperdicados: depois.length - novos,
		antesDaResposta,
	};
}

test('o painel monta DUAS instancias do grafico -- o efeito no DOM e o dobro da conta', async () => {
	await montar();
	expect(renders.length % 2).toBe(0);
	expect(renders.length).toBeGreaterThanOrEqual(2);
});

test('mexer na equity nao muda o grafico: TODO render dela e desperdicado', async () => {
	const { container } = await montar();
	const m = medirInteracao('#perspective-equity', '0.75', container);

	// winProb NAO esta entre as 13 dependencias do useMemo de chartData: ele
	// alimenta `result`, nunca a serie do grafico. A referencia nao muda.
	expect(m.efetivos).toBe(0);
	expect(m.desperdicados).toBe(m.renders);
	expect(m.renders).toBeGreaterThanOrEqual(2);
});

test('mexer no kappa muda o grafico UMA vez, e o resto continua desperdicado', async () => {
	const { container } = await montar();
	const m = medirInteracao('#perspective-kappa', '0.9', container);

	// kappa E dependencia. Um render legitimo; os demais, nao.
	expect(m.efetivos).toBe(1);
	expect(m.desperdicados).toBe(m.renders - 1);
	expect(m.desperdicados).toBeGreaterThan(0);
});

test('a resposta do worker acrescenta um render que nunca muda o grafico', async () => {
	const { container } = await montar();
	const m = medirInteracao('#perspective-equity', '0.60', container);

	// O efeito que posta ao worker chama setWasmLogs, e a resposta chama de novo.
	// Nenhum dos dois toca as dependencias do useMemo, entao os dois renders sao
	// estruturalmente incapazes de mudar o grafico.
	expect(m.renders).toBeGreaterThan(m.antesDaResposta);
});
