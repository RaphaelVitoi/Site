import { render } from '@testing-library/react';
import DashboardSOTA from '@/components/simulator/DashboardSOTA';
import { SotaSpotContext, SotaWasmContext } from '@/components/simulator/SotaContext';

const calculos = jest.fn((_params: Record<string, unknown>) => ({ streetMetrics: [] }));
jest.mock('@/components/simulator/hooks/usePmLensCalculations', () => ({
	usePmLensCalculations: (params: Record<string, unknown>) => calculos(params),
}));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null, status: 'unauthenticated' }) }));

// O jsdom não tem layout: o ResponsiveContainer mediria 0 × 0. Um tamanho fixo basta, porque o teste é sobre o cálculo.
jest.mock('recharts', () => {
	const real = jest.requireActual('recharts');
	return {
		...real,
		ResponsiveContainer: ({ children }: { children: React.ReactElement }) => (
			<div style={{ width: 400, height: 300 }}>{children}</div>
		),
	};
});

describe('Dashboard vanilla com a equity do spot ativo (SIM-03, SIM-07)', () => {
	it('ignora o PKO em desenvolvimento do contexto e trata equity 0 sem cair para 50', () => {
		const spot = { pkoValue: 0.4, initialStacks: [30, 20], initialPrizes: [60, 40] };
		const wasm = {
			nativeRangeMetric: { equity: 0, isCalculating: false },
			insolvencyMatrixData: { winRate: 0, loseRate: 1, tieRate: 0, trueInsolvencyEv: 0, riskIndex: 0 },
			isCalculatingInsolvency: false,
		};
		render(
			<SotaSpotContext value={spot as never}>
				<SotaWasmContext value={wasm as never}>
					<DashboardSOTA />
				</SotaWasmContext>
			</SotaSpotContext>,
		);
		expect(calculos).toHaveBeenCalled();
		expect(calculos.mock.calls.at(-1)?.[0]).toMatchObject({ equity: 0 });
		expect(calculos.mock.calls.at(-1)?.[0]).not.toHaveProperty('pkoValue');
	});
});
