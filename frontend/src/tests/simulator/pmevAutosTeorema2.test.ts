/**
 * @jest-environment node
 */
import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import { solveIcmDistortion } from '@/components/simulator/solver/nashSolver';
import { buildSimulatedStacks, calculateMapaICM, premioDeRiscoDoBf, RP_PISO_NUMERICO } from '@/lib/perspectiva';
import { derivePostFlopRps } from '@/lib/rpDeriver';

/**
 * Correções conforme os autos (docs/PERSPECTIVA_MATEMATICA_PMEV_MASTER.md), 2026-09-17.
 *
 * Teorema 2: E* < B/(P+2B) implica RP_River < 0. Teorema 6: E* = B·BF/(P+B+B·BF).
 */
const PREMIOS_FT = [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47];
const freqs = { ip_check: 40, ip_bet_small: 35, ip_bet_large: 25, oop_call: 50, oop_fold: 40, oop_raise: 10 };

describe('BF pós-flop de cada lado a partir da própria decisão', () => {
	const cenarios = SCENARIOS.filter((s) => s.category !== 'baseline' && s.prizes.length > 1);

	it.each(cenarios.map((s) => [s.id, s] as const))('%s: os dois BFs não dependem de quem é o herói', (_id, s) => {
		const estado = { street: 'river' as const, potAcumuladoHero: 20, potTotal: 40 };
		const comIp = derivePostFlopRps(s.stacks, s.prizes, 0, 1, { ...estado, heroIsIp: true })!;
		const comOop = derivePostFlopRps(s.stacks, s.prizes, 0, 1, { ...estado, heroIsIp: false })!;
		expect(comIp.allBfs[0]).toBeCloseTo(comOop.allBfs[0]!, 10);
		expect(comIp.allBfs[1]).toBeCloseTo(comOop.allBfs[1]!, 10);
		// Antes, o BF do não-herói saía entre 0,02 e 0,3 nesses cenários.
		expect(comIp.allBfs[1]).toBeGreaterThan(1);
	});

	it('para o herói, o BF é o da fórmula direta sobre os ramos da decisão dele', () => {
		const s = cenarios[0]!;
		const r = derivePostFlopRps(s.stacks, s.prizes, 0, 1, {
			street: 'river',
			potAcumuladoHero: 20,
			potTotal: 40,
			heroIsIp: true,
		})!;
		const { stacksWin, stacksLose } = buildSimulatedStacks(s.stacks, 0, 1, 20, 20, 20);
		const base = calculateMapaICM(s.stacks, s.prizes).equities[0]!;
		const bf =
			(base - calculateMapaICM(stacksLose, s.prizes).equities[0]!) /
			(calculateMapaICM(stacksWin, s.prizes).equities[0]! - base);
		expect(r.allBfs[0]).toBeCloseTo(bf, 12);
	});
});

describe('Teorema 2 -- RP negativo no river', () => {
	it('o caso canônico (residual 4 BB, pote 36 BB) produz RP negativo e E* abaixo das pot odds', () => {
		const stacks = [4, 40, 30, 25, 22, 18, 15, 12, 10];
		const r = derivePostFlopRps(stacks, PREMIOS_FT, 0, 1, {
			street: 'river',
			potAcumuladoHero: 32,
			potTotal: 36,
			heroIsIp: true,
		})!;
		const bf = r.allBfs[0]!;
		const a = 4 / 36;
		const eEstrela = (a * bf) / (1 - a + a * bf);
		expect(bf).toBeLessThan(1);
		expect(eEstrela).toBeLessThan(a);
		expect(r.ipRp).toBeLessThan(0);
		expect(r.ipRp).toBeCloseTo(premioDeRiscoDoBf(bf), 10);
	});

	it('a grandeza tem sinal e piso numérico declarado', () => {
		expect(premioDeRiscoDoBf(2)).toBe(50);
		expect(premioDeRiscoDoBf(1)).toBe(0);
		expect(premioDeRiscoDoBf(0.8)).toBeCloseTo(-25, 10);
		expect(premioDeRiscoDoBf(0.1)).toBe(RP_PISO_NUMERICO);
		expect(premioDeRiscoDoBf(0)).toBe(RP_PISO_NUMERICO);
	});

	it('o solver não muda para RP >= 0', () => {
		for (const [ip, oop, pote, rua] of [
			[0, 0, 7.5, 0],
			[12, 8, 22.5, 1],
			[35, 60, 40, 2],
			[100, 0, 75, 2],
		] as const) {
			const r = solveIcmDistortion(ip, oop, freqs, 1.2, pote, rua, 2);
			expect(r.rawData).toMatchObject({ ipRp: ip, oopRp: oop });
		}
	});

	it('com RP negativo o defensor folda menos que com RP zero, na direção do bluffcatcher obrigatório', () => {
		const zero = solveIcmDistortion(0, 0, freqs, 1, 40, 2, 2);
		const negativo = solveIcmDistortion(0, -23.2, freqs, 1, 40, 2, 2);
		expect(negativo.rawData.oopRp).toBeCloseTo(-23.2, 10);
		expect(negativo.oop.fold.center).toBeLessThan(zero.oop.fold.center);
		expect(negativo.oop.call.center).toBeGreaterThan(zero.oop.call.center);
		const soma = negativo.oop.call.center + negativo.oop.fold.center + negativo.oop.raise.center;
		expect(soma).toBeCloseTo(100, 10);
	});
});
