import { act, render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { GtoCfrSimulator } from '@/components/simulator/GtoCfrSimulator';
import { SotaSpotContext } from '@/components/simulator/SotaContext';

const sincronia = { isHydrated: true };
jest.mock('@/components/simulator/hooks/useSotaSync', () => ({
	useSotaSync: () => ({ physics: { pot: 10, heroStack: 40 }, isHydrated: sincronia.isHydrated }),
}));
jest.mock('@/components/simulator/ui/CfrCanvas', () => ({
	CfrCanvas: forwardRef(function CfrCanvasFalso() {
		return null;
	}),
}));
jest.mock('recharts', () => {
	const real = jest.requireActual('recharts');
	return {
		...real,
		ResponsiveContainer: ({ children }: { children: React.ReactElement }) => (
			<div style={{ width: 400, height: 300 }}>{children}</div>
		),
	};
});

class WorkerFalso {
	static instancias: WorkerFalso[] = [];
	enviados: unknown[] = [];
	onmessage: ((e: MessageEvent) => void) | null = null;
	onerror: (() => void) | null = null;
	constructor() {
		WorkerFalso.instancias.push(this);
	}
	postMessage(m: unknown) {
		this.enviados.push(m);
	}
	terminate() {}
}

const spotCom = (fold: number, call: number, raise: number) =>
	({
		actionMetrics: {
			fold: { perspectiva: fold },
			call: { perspectiva: call },
			raise: { perspectiva: raise },
		},
	}) as never;

describe('GtoCfrSimulator sem dado fabricado e sem laço sem fim (SIM-01, SIM-06)', () => {
	const workerOriginal = (globalThis as { Worker?: unknown }).Worker;

	beforeEach(() => {
		jest.useFakeTimers();
		WorkerFalso.instancias = [];
		(globalThis as { Worker?: unknown }).Worker = WorkerFalso;
		Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
	});

	afterEach(() => {
		jest.useRealTimers();
		(globalThis as { Worker?: unknown }).Worker = workerOriginal;
	});

	it('sem spot ativo, declara a ausencia em vez de exibir FOLD 100%', () => {
		render(<GtoCfrSimulator />);
		expect(screen.getByRole('status').textContent).toMatch(/Nenhum spot ativo/);
		expect(screen.queryByText('100.0%')).toBeNull();
	});

	it('com spot, a estrategia vai para a acao de maior EV', () => {
		render(
			<SotaSpotContext value={spotCom(-1, 2, 0.5)}>
				<GtoCfrSimulator />
			</SotaSpotContext>,
		);
		const cartaoCall = screen.getByText('CALL').parentElement;
		expect(Number.parseFloat(cartaoCall?.textContent?.replace('CALL', '') ?? '0')).toBeGreaterThan(98);
		expect(screen.queryByRole('status')).toBeNull();
	});

	it('pausa com o painel fora da tela mesmo quando o painel so monta depois da hidratacao', () => {
		// Ordem real: placeholder de hidratação primeiro, painel depois. A primeira versão do hook observava no efeito
		// de montagem, com o ref ainda nulo, e no Chrome o laço seguiu com o painel fora da tela.
		const observados: Element[] = [];
		let avisar: ((entradas: Array<{ isIntersecting: boolean }>) => void) | undefined;
		const ioOriginal = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
		(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = class {
			constructor(cb: typeof avisar) {
				avisar = cb;
			}
			observe(el: Element) {
				observados.push(el);
			}
			disconnect() {}
		};
		try {
			sincronia.isHydrated = false;
			const { rerender } = render(<GtoCfrSimulator />);
			sincronia.isHydrated = true;
			rerender(<GtoCfrSimulator />);
			expect(observados).toHaveLength(1);

			const worker = WorkerFalso.instancias.at(-1)!;
			act(() => avisar?.([{ isIntersecting: false }]));
			const antes = worker.enviados.length;
			act(() => {
				worker.onmessage?.({ data: { matrix: new Float32Array(169) } } as MessageEvent);
				jest.advanceTimersByTime(33 * 10);
			});
			expect(worker.enviados).toHaveLength(antes);

			act(() => avisar?.([{ isIntersecting: true }]));
			act(() => jest.advanceTimersByTime(33));
			expect(worker.enviados).toHaveLength(antes + 1);
		} finally {
			sincronia.isHydrated = true;
			(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = ioOriginal;
		}
	});

	it('declara que o perfil de vilao do arquetipo e ilustrativo, nao medido', () => {
		render(<GtoCfrSimulator />);
		const aviso = screen.getByText(/Perfil ilustrativo/);
		expect(aviso.textContent).toMatch(/VPIP 25/);
		expect(aviso.textContent).toMatch(/PFR 20/);
		expect(aviso.textContent).toMatch(/AF 3/);
		expect(aviso.textContent).toMatch(/n[aã]o [eé] dado medido/);
	});

	it('um pedido por vez ao worker, e nenhum com a aba oculta', () => {
		render(<GtoCfrSimulator />);
		const worker = WorkerFalso.instancias.at(-1)!;
		act(() => jest.advanceTimersByTime(33 * 10));
		expect(worker.enviados).toHaveLength(1);

		act(() => worker.onmessage?.({ data: { matrix: new Float32Array(169) } } as MessageEvent));
		act(() => jest.advanceTimersByTime(33));
		expect(worker.enviados).toHaveLength(2);

		Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
		act(() => {
			document.dispatchEvent(new Event('visibilitychange'));
			worker.onmessage?.({ data: { matrix: new Float32Array(169) } } as MessageEvent);
			jest.advanceTimersByTime(33 * 10);
		});
		expect(worker.enviados).toHaveLength(2);
	});
});
