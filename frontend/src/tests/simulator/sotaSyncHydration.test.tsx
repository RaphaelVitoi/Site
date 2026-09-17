/**
 * Prova da auditoria de frontend de 2026-09-17: o provider global de física restaura o que o
 * usuário salvou, e não sobrescreve o localStorage com o padrão na montagem.
 */
import { act, render } from '@testing-library/react';
import { SotaGlobalSyncProvider, useSotaSync } from '@/components/simulator/hooks/useSotaSync';

const CHAVE = 'sota-physics-v1';

function Sonda({ onValor }: { onValor: (heroStack: number, hidratado: boolean) => void }) {
	const { physics, isHydrated } = useSotaSync();
	onValor(physics.heroStack, isHydrated);
	return null;
}

describe('SotaGlobalSyncProvider — hidratação do localStorage', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		localStorage.clear();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('restaura o estado salvo e não o apaga com o padrão', async () => {
		const salvo = { heroStack: 77, pot: 3, heroInvested: 1, position: 'IP', referenceStatus: 'bubble', prizes: [1] };
		localStorage.setItem(CHAVE, JSON.stringify(salvo));

		const vistos: Array<[number, boolean]> = [];
		render(
			<SotaGlobalSyncProvider>
				<Sonda onValor={(h, hid) => vistos.push([h, hid])} />
			</SotaGlobalSyncProvider>,
		);
		await act(async () => {
			jest.advanceTimersByTime(1000);
		});

		const [ultimoStack, hidratado] = vistos.at(-1)!;
		expect(JSON.parse(localStorage.getItem(CHAVE)!).heroStack).toBe(77);
		expect(hidratado).toBe(true);
		expect(ultimoStack).toBe(77);
	});
});

describe('useDebouncedLocalStorage — robustez (FE-14)', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		localStorage.clear();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('recusa valor salvo com forma de outra versão e mantém o padrão', async () => {
		localStorage.setItem(CHAVE, JSON.stringify({ heroStack: 'quarenta', prizes: 'x' }));
		const vistos: number[] = [];
		render(
			<SotaGlobalSyncProvider>
				<Sonda onValor={(h) => vistos.push(h)} />
			</SotaGlobalSyncProvider>,
		);
		await act(async () => {
			jest.advanceTimersByTime(1000);
		});
		expect(vistos.at(-1)).toBe(40);
	});

	it('quota excedida não derruba a aplicação', async () => {
		jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('cheio', 'QuotaExceededError');
		});
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		render(
			<SotaGlobalSyncProvider>
				<Sonda onValor={() => {}} />
			</SotaGlobalSyncProvider>,
		);
		await expect(
			act(async () => {
				jest.advanceTimersByTime(1000);
			}),
		).resolves.not.toThrow();
	});

	it('grava a alteração pendente ao desmontar em vez de descartá-la', async () => {
		let atualizar: ((p: { heroStack: number }) => void) | null = null;
		function Editor() {
			const { updatePhysics } = useSotaSync();
			atualizar = updatePhysics;
			return null;
		}
		const { unmount } = render(
			<SotaGlobalSyncProvider>
				<Editor />
			</SotaGlobalSyncProvider>,
		);
		await act(async () => {
			jest.advanceTimersByTime(1000);
		});
		await act(async () => {
			atualizar!({ heroStack: 55 });
		});
		unmount();
		expect(JSON.parse(localStorage.getItem(CHAVE)!).heroStack).toBe(55);
	});
});
