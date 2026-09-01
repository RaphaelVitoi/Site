import { SCENARIOS } from '@/components/simulator/solver/scenarios';
import { calculateRiskAdvantageDelta } from '@/components/simulator/solver/utils';

describe('Direção da Vantagem de Risco', () => {
	it('calcula ΔRP do agressor para o defensor', () => {
		expect(calculateRiskAdvantageDelta(21.4, 12.9)).toBeCloseTo(-8.5, 10);
		expect(calculateRiskAdvantageDelta(12.9, 21.4)).toBeCloseTo(8.5, 10);
		expect(calculateRiskAdvantageDelta(12.9, 12.9)).toBe(0);
	});

	it('preserva o cenário BTN→BB como contexto, não como frequência automática', () => {
		const paradox = SCENARIOS.find((scenario) => scenario.id === 'paradoxo');

		expect(paradox?.theory).toContain('ΔRP = 12.9 − 21.4 = -8.5 p.p.');
		expect(paradox?.theory).toContain('não determina sozinho uma frequência');
		expect(paradox?.quiz.explanation).toContain('não é uma regra linear');
	});
});
