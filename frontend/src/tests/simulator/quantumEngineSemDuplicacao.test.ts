import { act, renderHook } from '@testing-library/react';
import { useQuantumEngine, type QuantumEngineParams } from '@/components/simulator/hooks/useQuantumEngine';
import { SCENARIOS } from '@/components/simulator/solver/scenarios';

class WorkerFalso {
	static instancias: WorkerFalso[] = [];
	enviados: Array<{ type: string; id: number }> = [];
	onmessage: ((e: MessageEvent) => void) | null = null;
	onerror: (() => void) | null = null;
	constructor() {
		WorkerFalso.instancias.push(this);
	}
	postMessage(m: { type: string; id: number }) {
		this.enviados.push(m);
	}
	terminate() {}
}

const freqs = { ip_check: 40, ip_bet_small: 35, ip_bet_large: 25, oop_call: 50, oop_fold: 40, oop_raise: 10 };
const params = (scenario = SCENARIOS[2]!): QuantumEngineParams => ({
	scenario,
	pkoValue: 0,
	isNearPayjump: false,
	blindsRisingSoon: false,
	streetFreqs: { flop: freqs, turn: freqs, river: freqs },
	aggressionFactor: 1.2,
	heroPosition: 'IP',
	heroIsIp: true,
});

describe('useQuantumEngine -- distorção calculada uma vez e matriz presa ao cenário (SIM-02, SIM-04)', () => {
	const workerOriginal = (globalThis as { Worker?: unknown }).Worker;

	beforeEach(() => {
		jest.useFakeTimers();
		WorkerFalso.instancias = [];
		(globalThis as { Worker?: unknown }).Worker = WorkerFalso;
	});

	afterEach(() => {
		jest.useRealTimers();
		(globalThis as { Worker?: unknown }).Worker = workerOriginal;
	});

	it('nao envia DISTORTION ao worker e entrega as tres streets na primeira renderizacao', () => {
		const { result, rerender } = renderHook((p: QuantumEngineParams) => useQuantumEngine(p), {
			initialProps: params(),
		});
		expect(result.current.nashResults.flop).toBe(result.current.nashFlop);
		expect(result.current.nashResults.river).toBe(result.current.nashRiver);

		rerender({ ...params(), aggressionFactor: 0.8 });
		act(() => jest.advanceTimersByTime(500));
		const worker = WorkerFalso.instancias.at(-1)!;
		expect(worker.enviados.filter((m) => m.type === 'DISTORTION')).toHaveLength(0);
	});

	it('trocar de cenario descarta a matriz anterior e invalida o pedido pendente', () => {
		const { result, rerender } = renderHook((p: QuantumEngineParams) => useQuantumEngine(p), {
			initialProps: params(),
		});
		const worker = WorkerFalso.instancias.at(-1)!;
		act(() => {
			result.current.dispatchInsolvencyMatrix({
				villainRange: 'KK',
				board: '',
				rpFactor: 0.2,
				heroInvested: 1,
				currentPot: 5,
				activePlayers: 2,
			});
			jest.advanceTimersByTime(200);
		});
		const pedido = worker.enviados.find((m) => m.type === 'MATRIX')!;

		rerender(params(SCENARIOS[3]!));
		act(() =>
			worker.onmessage?.({
				data: { type: 'MATRIX', id: pedido.id, outputKind: 'working-model', matrix: [0.7, 0.25, 0.05, 1, 0.1] },
			} as MessageEvent),
		);
		expect(result.current.insolvencyMatrixData).toBeNull();
		expect(result.current.isCalculatingInsolvency).toBe(false);
	});
});
