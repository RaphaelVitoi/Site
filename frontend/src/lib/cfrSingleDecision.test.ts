/**
 * @jest-environment node
 */
import { estrategiaPorRegretMatching } from './cfrSingleDecision';

const soma = (xs: { strategy: number }[]) => xs.reduce((a, x) => a + x.strategy, 0);

describe('estrategiaPorRegretMatching', () => {
	it('converge para a acao de maior EV e soma 100%', () => {
		const r = estrategiaPorRegretMatching({ FOLD: -1, CALL: 2.5, RAISE: 1 });
		expect(r).not.toBeNull();
		const porAcao = Object.fromEntries((r ?? []).map((x) => [x.action, x.strategy]));
		expect(porAcao['CALL']).toBeGreaterThan(98);
		expect(soma(r ?? [])).toBeCloseTo(100, 6);
	});

	it('nao favorece FOLD quando FOLD nao e a melhor acao -- o defeito do estado fixo', () => {
		const r = estrategiaPorRegretMatching({ FOLD: 0, CALL: 0.4, RAISE: 3 }) ?? [];
		expect(r.find((x) => x.action === 'FOLD')?.strategy).toBeLessThan(2);
		expect(r.find((x) => x.action === 'RAISE')?.strategy).toBeGreaterThan(97);
	});

	it('acoes empatadas no maximo dividem a massa', () => {
		const r = estrategiaPorRegretMatching({ FOLD: -2, CALL: 1, RAISE: 1 }) ?? [];
		expect(r.find((x) => x.action === 'CALL')?.strategy).toBeCloseTo(50, 0);
		expect(r.find((x) => x.action === 'RAISE')?.strategy).toBeCloseTo(50, 0);
	});

	it('sem EV valida nao inventa estrategia', () => {
		expect(estrategiaPorRegretMatching({})).toBeNull();
		expect(estrategiaPorRegretMatching({ FOLD: 0, CALL: Number.NaN })).toBeNull();
	});
});
