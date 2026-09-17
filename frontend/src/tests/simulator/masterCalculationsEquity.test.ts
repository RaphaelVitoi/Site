import { act, renderHook } from '@testing-library/react';
import {
	ESPERA_BAYESIANA_MS,
	EQUITY_INICIAL,
	useMasterCalculations,
} from '@/components/simulator/hooks/useMasterCalculations';
import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import type { InsolvencyMetrics } from '@/components/simulator/workers/insolvencyProtocol';

type Props = Parameters<typeof useMasterCalculations>[0];

const matriz = (winRate: number): InsolvencyMetrics => ({
	winRate,
	loseRate: 1 - winRate,
	tieRate: 0,
	trueInsolvencyEv: 0,
	riskIndex: 0,
});

const base = (): Props => ({
	scenario: SCENARIOS[1]!,
	aggressionFactor: 1.2,
	safeHeroInvested: 1,
	safeCurrentPot: 5,
	quantumPerspectiva: null,
	insolvencyMatrixData: null,
});

describe('useMasterCalculations -- equity de entrada e consulta bayesiana (SIM-02, SIM-05, SIM-07)', () => {
	const fetchOriginal = global.fetch;
	const workerOriginal = (global as { Worker?: unknown }).Worker;
	let fetchMock: jest.Mock;
	let workerMock: jest.Mock;

	beforeEach(() => {
		jest.useFakeTimers();
		fetchMock = jest.fn(async () => ({ ok: true, json: async () => ({ posterior_win_prob: 0.5 }) }));
		global.fetch = fetchMock as unknown as typeof fetch;
		workerMock = jest.fn();
		(global as { Worker?: unknown }).Worker = workerMock;
	});

	afterEach(() => {
		jest.useRealTimers();
		global.fetch = fetchOriginal;
		(global as { Worker?: unknown }).Worker = workerOriginal;
	});

	it('nao sobe worker para calcular aleatoria contra aleatoria', () => {
		renderHook((p: Props) => useMasterCalculations(p), { initialProps: base() });
		expect(workerMock).not.toHaveBeenCalled();
	});

	it('o resultado do calculo entra na equity e o valor manual volta a mandar depois dele', () => {
		const { result, rerender } = renderHook((p: Props) => useMasterCalculations(p), { initialProps: base() });
		expect(result.current.nativeRangeMetric.equity).toBe(EQUITY_INICIAL);

		// Mesmo objeto nos dois rerenders: no app, a identidade do resultado só muda quando chega outro cálculo.
		const resultado = matriz(0.64);
		rerender({ ...base(), insolvencyMatrixData: resultado });
		expect(result.current.nativeRangeMetric.equity).toBe(64);

		// O slider grava pelo mesmo estado. Antes, os paineis liam winRate por cima e exibiam 64 para sempre.
		act(() => result.current.setNativeRangeMetric({ equity: 30, isCalculating: false }));
		rerender({ ...base(), insolvencyMatrixData: resultado });
		expect(result.current.nativeRangeMetric.equity).toBe(30);

		// Um cálculo novo volta a mandar.
		rerender({ ...base(), insolvencyMatrixData: matriz(0.41) });
		expect(result.current.nativeRangeMetric.equity).toBe(41);
	});

	it('taxa de vitoria 0 e resultado, nao ausencia', () => {
		const { result, rerender } = renderHook((p: Props) => useMasterCalculations(p), { initialProps: base() });
		rerender({ ...base(), insolvencyMatrixData: matriz(0) });
		expect(result.current.nativeRangeMetric.equity).toBe(0);
	});

	it('trocar de cenario recomeca da equity inicial', () => {
		const { result, rerender } = renderHook((p: Props) => useMasterCalculations(p), { initialProps: base() });
		act(() => result.current.setNativeRangeMetric({ equity: 72, isCalculating: false }));
		expect(result.current.nativeRangeMetric.equity).toBe(72);
		rerender({ ...base(), scenario: SCENARIOS[2]! });
		expect(result.current.nativeRangeMetric.equity).toBe(EQUITY_INICIAL);
	});

	it('oito mudancas seguidas geram um POST, e so depois da pausa', async () => {
		const { rerender } = renderHook((p: Props) => useMasterCalculations(p), { initialProps: base() });
		for (let pote = 6; pote <= 13; pote++) {
			rerender({ ...base(), safeCurrentPot: pote });
			act(() => jest.advanceTimersByTime(60));
		}
		expect(fetchMock).not.toHaveBeenCalled();
		await act(async () => {
			jest.advanceTimersByTime(ESPERA_BAYESIANA_MS);
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('resposta de um pedido superado nao sobrescreve o valor atual', async () => {
		const pendentes: Array<(v: unknown) => void> = [];
		fetchMock.mockImplementation(
			(_url: string, init: RequestInit) =>
				new Promise((resolve, reject) => {
					init.signal?.addEventListener('abort', () => reject(new DOMException('abortado', 'AbortError')));
					pendentes.push(resolve);
				}),
		);
		const { result, rerender } = renderHook((p: Props) => useMasterCalculations(p), { initialProps: base() });
		await act(async () => {
			jest.advanceTimersByTime(ESPERA_BAYESIANA_MS);
		});
		expect(pendentes).toHaveLength(1);

		rerender({ ...base(), safeCurrentPot: 9 });
		const local = result.current.bayesianWinProb;
		await act(async () => {
			pendentes[0]!({ ok: true, json: async () => ({ posterior_win_prob: 0.99 }) });
		});
		expect(result.current.bayesianWinProb).toBe(local);
	});
});
