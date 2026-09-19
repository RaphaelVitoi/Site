import { readFileSync } from 'node:fs';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useQuantumEngine, type QuantumEngineParams } from '@/components/simulator/hooks/useQuantumEngine';
import { useMasterHandlers } from '@/components/simulator/hooks/useMasterHandlers';
import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import { PkoDevControl } from '@/components/simulator/ui/PkoDevControl';

class WorkerFalso {
	onmessage: unknown = null;
	onerror: unknown = null;
	postMessage() {}
	terminate() {}
}

const freqs = { ip_check: 40, ip_bet_small: 35, ip_bet_large: 25, oop_call: 50, oop_fold: 40, oop_raise: 10 };
const cenarioComPremios = SCENARIOS.find((s) => s.prizes.length > 1 && s.category !== 'baseline')!;

/**
 * O controle so entra na arvore com NEXT_PUBLIC_PKO_DEV=true. Os casos que exercitam o *conteudo* do controle
 * precisam liga-lo explicitamente; os que exercitam o *portao* manipulam a variavel por conta propria.
 */
const ambienteOriginal = process.env['NEXT_PUBLIC_PKO_DEV'];
function comPkoDevLigado() {
	process.env['NEXT_PUBLIC_PKO_DEV'] = 'true';
}
afterEach(() => {
	if (ambienteOriginal === undefined) delete process.env['NEXT_PUBLIC_PKO_DEV'];
	else process.env['NEXT_PUBLIC_PKO_DEV'] = ambienteOriginal;
});
const params = (pkoValue: number): QuantumEngineParams => ({
	scenario: cenarioComPremios,
	pkoValue,
	isNearPayjump: false,
	blindsRisingSoon: false,
	streetFreqs: { flop: freqs, turn: freqs, river: freqs },
	aggressionFactor: 1.2,
	heroPosition: 'IP',
	heroIsIp: true,
});

describe('PKO em desenvolvimento, isolado das saidas estabelecidas', () => {
	const workerOriginal = (globalThis as { Worker?: unknown }).Worker;
	beforeAll(() => {
		(globalThis as { Worker?: unknown }).Worker = WorkerFalso;
	});
	afterAll(() => {
		(globalThis as { Worker?: unknown }).Worker = workerOriginal;
	});

	it('ligar o PKO nao muda nenhuma saida vanilla do motor', () => {
		const semPko = renderHook(() => useQuantumEngine(params(0))).result.current;
		const comPko = renderHook(() => useQuantumEngine(params(0.4))).result.current;
		const vanilla = (r: typeof semPko) => ({
			effectiveIpRp: r.effectiveIpRp,
			effectiveOopRp: r.effectiveOopRp,
			streetRps: r.streetRps,
			nashFlop: r.nashFlop,
			nashTurn: r.nashTurn,
			nashRiver: r.nashRiver,
			effectiveSprData: r.effectiveSprData,
			quantumPerspectiva: r.quantumPerspectiva,
		});
		expect(vanilla(comPko)).toEqual(vanilla(semPko));
	});

	it('a leitura PKO so existe com PKO ligado e parte do RP vanilla', () => {
		const semPko = renderHook(() => useQuantumEngine(params(0))).result.current;
		const comPko = renderHook(() => useQuantumEngine(params(0.4))).result.current;
		expect(semPko.pkoPreview).toBeNull();
		expect(comPko.pkoPreview).not.toBeNull();
		expect(comPko.pkoPreview?.pkoValue).toBe(0.4);
		expect(Number.isFinite(comPko.pkoPreview?.comPko.ipRp)).toBe(true);
		expect(comPko.pkoPreview?.vanilla.ipRp).toBeGreaterThanOrEqual(0);
	});

	it('o controle se apresenta como em desenvolvimento e comeca desligado', () => {
		comPkoDevLigado();
		const mudar = jest.fn();
		const { rerender } = render(<PkoDevControl pkoValue={0} onPkoChange={mudar} preview={null} />);
		expect(screen.getByText('Em desenvolvimento')).toBeTruthy();
		expect(screen.queryByLabelText('Peso do bounty PKO')).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'Explorar PKO' }));
		expect(mudar).toHaveBeenCalledWith(0.25);

		rerender(
			<PkoDevControl
				pkoValue={0.25}
				onPkoChange={mudar}
				preview={{ pkoValue: 0.25, vanilla: { ipRp: 12, oopRp: 8 }, comPko: { ipRp: 9.5, oopRp: 6 } }}
			/>,
		);
		expect(screen.getByText('12.0% vanilla → 9.5% com PKO')).toBeTruthy();
		fireEvent.click(screen.getByRole('button', { name: 'Desligar PKO' }));
		expect(mudar).toHaveBeenLastCalledWith(0);
	});

	it('exportacao HRC funciona com PKO ligado: o peso exploratorio nao entra no arquivo', () => {
		const alerta = jest.spyOn(globalThis, 'alert').mockImplementation(() => {});
		const criarUrl = jest.fn(() => 'blob:x');
		Object.assign(URL, { createObjectURL: criarUrl, revokeObjectURL: jest.fn() });
		const clique = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		const { result } = renderHook(() =>
			useMasterHandlers({
				scenario: cenarioComPremios,
				scenarios: SCENARIOS,
				anteSize: 12.5,
				setScenario: jest.fn(),
				resetState: jest.fn(),
				updatePhysics: jest.fn(),
				startTransition: (fn: () => void) => fn(),
			} as never),
		);
		result.current.handleExportHRC();
		expect(alerta).not.toHaveBeenCalled();
		expect(criarUrl).toHaveBeenCalledTimes(1);
		alerta.mockRestore();
		clique.mockRestore();
	});
});

describe('PKO em desenvolvimento -- leitura no piso numerico', () => {
	it('declara o piso e a falta de calibracao em vez de exibir -100% como medida', () => {
		comPkoDevLigado();
		render(
			<PkoDevControl
				pkoValue={0.05}
				onPkoChange={jest.fn()}
				preview={{ pkoValue: 0.05, vanilla: { ipRp: 20.9, oopRp: 14.7 }, comPko: { ipRp: -100, oopRp: -100 } }}
			/>,
		);
		expect(screen.getAllByText('20.9% vanilla → ≤ -100.0% com PKO (piso)')).toHaveLength(1);
		expect(screen.getByText(/satura no piso numérico/)).toBeTruthy();
	});
});

describe('PKO em desenvolvimento -- portao de exposicao', () => {
	it('sem NEXT_PUBLIC_PKO_DEV o controle nao existe na arvore', () => {
		delete process.env['NEXT_PUBLIC_PKO_DEV'];
		const { container } = render(<PkoDevControl pkoValue={0} onPkoChange={jest.fn()} preview={null} />);
		expect(container.firstChild).toBeNull();
		expect(screen.queryByLabelText('PKO em desenvolvimento')).toBeNull();
		expect(screen.queryByRole('button', { name: 'Explorar PKO' })).toBeNull();
	});

	it.each(['false', '', 'TRUE', '1', 'sim'])('o portao falha fechado para o valor %p', (valor) => {
		process.env['NEXT_PUBLIC_PKO_DEV'] = valor;
		const { container } = render(<PkoDevControl pkoValue={0} onPkoChange={jest.fn()} preview={null} />);
		expect(container.firstChild).toBeNull();
	});

	it('com a flag ligada o controle volta a aparecer', () => {
		process.env['NEXT_PUBLIC_PKO_DEV'] = 'true';
		render(<PkoDevControl pkoValue={0} onPkoChange={jest.fn()} preview={null} />);
		expect(screen.getByLabelText('PKO em desenvolvimento')).toBeTruthy();
	});

	it('o portao vive no componente, nao em quem o renderiza', () => {
		const fonte = readFileSync('src/components/simulator/ui/PkoDevControl.tsx', 'utf8');
		expect(fonte).toContain('pkoEmDesenvolvimentoHabilitado()');
		const painel = readFileSync('src/components/simulator/panels/NashPanel.tsx', 'utf8');
		expect(painel).not.toContain('pkoEmDesenvolvimentoHabilitado');
	});
});
