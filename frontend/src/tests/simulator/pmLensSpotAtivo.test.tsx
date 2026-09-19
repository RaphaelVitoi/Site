import { render, screen } from '@testing-library/react';
import PmLensPanel from '@/components/simulator/panels/PmLensPanel';
import { SotaWasmContext } from '@/components/simulator/SotaContext';

const calculos = jest.fn((_params: Record<string, unknown>) => ({ streetMetrics: [] }));
jest.mock('@/components/simulator/hooks/usePmLensCalculations', () => ({
	usePmLensCalculations: (params: Record<string, unknown>) => calculos(params),
}));

const contexto = (equity: number, winRate: number) => ({
	nativeRangeMetric: { equity, isCalculating: false },
	insolvencyMatrixData: { winRate, loseRate: 1 - winRate, tieRate: 0, trueInsolvencyEv: 0, riskIndex: 0 },
	isCalculatingInsolvency: false,
	dispatchInsolvencyMatrix: jest.fn(),
	nashResults: null,
	setManualEquity: jest.fn(),
});

describe('Lente PM ligada ao spot ativo e vanilla (SIM-02, SIM-03)', () => {
	beforeEach(() => calculos.mockClear());

	it('o slider exibe a equity do estado, nao o winRate do ultimo calculo', () => {
		render(
			<SotaWasmContext value={contexto(30, 0.64)}>
				<PmLensPanel />
			</SotaWasmContext>,
		);
		expect((screen.getByLabelText('Equity Bruta') as HTMLInputElement).value).toBe('30');
		expect(calculos.mock.calls.at(-1)?.[0]).toMatchObject({ equity: 30 });
	});

	it('parte do spot ativo e calcula vanilla, sem peso de PKO', () => {
		render(
			<SotaWasmContext value={contexto(50, 0.5)}>
				<PmLensPanel
					initialStacks={[30, 20, 10]}
					initialPrizes={[50, 30, 20]}
					currentPot={7}
					heroInvested={2}
					heroPosition="SB"
					activePlayers={2}
				/>
			</SotaWasmContext>,
		);
		expect(calculos.mock.calls.at(-1)?.[0]).toMatchObject({
			initialStacks: [30, 20, 10],
			initialPrizes: [50, 30, 20],
			currentPot: 7,
			heroInvested: 2,
		});
		// PKO em desenvolvimento não entra na lente.
		expect(calculos.mock.calls.at(-1)?.[0]).not.toHaveProperty('pkoValue');
	});
});
