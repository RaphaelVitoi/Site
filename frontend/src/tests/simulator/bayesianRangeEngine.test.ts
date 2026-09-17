/// <reference types="jest" />

import {
	generateUniformBelief,
	updateBelief,
	getBeliefIntensity,
	calculateShannonEntropy,
	computePublicBeliefState,
	generateTextureAwareLikelihood,
	getSolverNodeData,
	computeSplitGradient,
} from '../../lib/bayesianRangeEngine';

describe('bayesianRangeEngine', () => {
	describe('generateUniformBelief', () => {
		it('should generate a uniform belief vector summing to exactly 1.0', () => {
			const belief = generateUniformBelief();

			// Verifica chaves importantes
			expect(Reflect.get(belief, 'AA')).toBe(6 / 1326);
			expect(Reflect.get(belief, 'AKs')).toBe(4 / 1326);
			expect(Reflect.get(belief, 'AKo')).toBe(12 / 1326);

			// Soma de todos os pesos de probabilidade
			const totalSum = Object.values(belief).reduce((s, v) => s + v, 0);
			expect(totalSum).toBeCloseTo(1.0, 5);
		});
	});

	describe('updateBelief', () => {
		it('should correctly calculate the posterior belief based on prior and likelihood', () => {
			const prior = generateUniformBelief();
			const likelihood: Record<string, number> = {};

			// Definir que apenas AA e KK fazem a ação com probabilidade 1, outros com 0
			for (const hand of Object.keys(prior)) {
				Reflect.set(likelihood, hand, hand === 'AA' || hand === 'KK' ? 1.0 : 0.0);
			}

			const posterior = updateBelief(prior, likelihood);

			// Como AA e KK têm as mesmas probabilidades iniciais e probabilidades condicionais,
			// cada um deve ter 0.5 de probabilidade a posteriori.
			expect(Reflect.get(posterior, 'AA')).toBeCloseTo(0.5, 5);
			expect(Reflect.get(posterior, 'KK')).toBeCloseTo(0.5, 5);
			expect(Reflect.get(posterior, 'AKs')).toBe(0);
		});

		it('should return prior (anti-crash) if the action is impossible (evidence === 0)', () => {
			const prior = generateUniformBelief();
			const likelihood: Record<string, number> = {};

			// Probabilidade da ação dada qualquer mão é 0
			for (const hand of Object.keys(prior)) {
				Reflect.set(likelihood, hand, 0.0);
			}

			const posterior = updateBelief(prior, likelihood);
			expect(posterior).toEqual(prior);
		});
	});

	describe('getBeliefIntensity', () => {
		it('should calculate relative belief intensity correctly', () => {
			const belief = {
				AA: 0.1,
				KK: 0.05,
				QQ: 0.0,
			};

			// Sem maxBelief customizado, o máximo deve ser AA (0.1)
			expect(getBeliefIntensity(belief, 'AA')).toBe(100);
			expect(getBeliefIntensity(belief, 'KK')).toBe(50);
			expect(getBeliefIntensity(belief, 'QQ')).toBe(0);

			// Com maxBelief customizado
			expect(getBeliefIntensity(belief, 'KK', 0.2)).toBe(25);
		});

		it('should handle zero cases safely', () => {
			expect(getBeliefIntensity({}, 'AA')).toBe(0);
			expect(getBeliefIntensity({ AA: 0 }, 'AA')).toBe(0);
		});
	});

	describe('calculateShannonEntropy', () => {
		it('should calculate max entropy for uniform distribution', () => {
			const uniform = generateUniformBelief();
			const entropy = calculateShannonEntropy(uniform);

			// Para 169 classes no formato do poker, a entropia fica próxima de log2(169) ~ 7.4 bits
			expect(entropy).toBeGreaterThan(7.0);
			expect(entropy).toBeLessThanOrEqual(Math.log2(169) + 0.1);
		});

		it('should calculate zero entropy for a single deterministic hand', () => {
			const singleHand = { AA: 1.0, KK: 0.0, QQ: 0.0 };
			const entropy = calculateShannonEntropy(singleHand);
			expect(entropy).toBeCloseTo(0.0, 5);
		});

		it('should calculate 1.0 bit for 50/50 two-hand distribution', () => {
			const twoHands = { AA: 0.5, KK: 0.5 };
			const entropy = calculateShannonEntropy(twoHands);
			expect(entropy).toBeCloseTo(1.0, 5);
		});
	});

	describe('computePublicBeliefState', () => {
		it('should generate valid PBS with polarization index and active combos', () => {
			const hero = generateUniformBelief();
			const villain = generateUniformBelief();
			const pbs = computePublicBeliefState(['Ah', 'Kd', '2c'], 15.0, hero, villain);

			expect(pbs.pot).toBe(15.0);
			expect(pbs.board).toEqual(['Ah', 'Kd', '2c']);
			expect(pbs.heroEntropy).toBeGreaterThan(7.0);
			expect(pbs.villainEntropy).toBeGreaterThan(7.0);
			expect(pbs.polarizationScore).toBeLessThan(10.0); // Próximo de zero em uniforme
			expect(pbs.combosLeft).toBeGreaterThan(1000);
		});
	});

	describe('generateTextureAwareLikelihood', () => {
		it('should generate higher Ace/Broadcard probability for small cbet on dry board', () => {
			const likelihood = generateTextureAwareLikelihood('dry', 'cbet_small');
			expect(likelihood['AA']).toBeGreaterThan(likelihood['22']);
			expect(likelihood['AKo']).toBeGreaterThan(0.8);
		});

		it('should generate highly polarized distribution for check-raise', () => {
			const likelihood = generateTextureAwareLikelihood('wet', 'check_raise');
			expect(likelihood['AA']).toBeGreaterThan(0.9);
			expect(likelihood['88']).toBeLessThan(0.2); // Pares médios sem draw não dão check-raise
		});
	});

	describe('computeSplitGradient', () => {
		it('should generate solid color for a single action', () => {
			const gradient = computeSplitGradient([{ name: 'Check', label: 'Check', pct: 100, color: '#4ade80' }]);
			expect(gradient).toBe('#4ade80');
		});

		it('should generate linear-gradient with sharp stops for Nash mixed strategies', () => {
			const gradient = computeSplitGradient([
				{ name: 'Raise', label: 'Raise', pct: 35, color: '#fb7185' },
				{ name: 'Call', label: 'Call', pct: 65, color: '#4ade80' },
			]);
			expect(gradient).toBe('linear-gradient(to right, #fb7185 0.0%, #fb7185 35.0%, #4ade80 35.0%, #4ade80 100.0%)');
		});
	});

	describe('getSolverNodeData (Aula 1.2 Canônica)', () => {
		it('should reflect 100% check for TT-66 on ICMev Flop C-Bet and high bet on ChipEV', () => {
			const icmData = getSolverNodeData('aula1_2', 'cbet_small', 'icm');
			expect(icmData.actor).toBe('BTN');
			expect(icmData.combos['TT'].localFreq).toBe(0);
			expect(icmData.combos['99'].localFreq).toBe(0);
			expect(icmData.combos['55'].localFreq).toBe(100);
			expect(icmData.combos['72o'].arrived).toBe(false); // Não abriu pré-flop

			const chipevData = getSolverNodeData('aula1_2', 'cbet_small', 'chipev');
			expect(chipevData.combos['TT'].localFreq).toBeGreaterThan(90);
			expect(chipevData.combos['99'].localFreq).toBeGreaterThan(90);
		});

		it('should reflect Nash Indifference for AQs in BB Check-Raise node', () => {
			const xrData = getSolverNodeData('aula1_2', 'check_raise', 'icm');
			expect(xrData.actor).toBe('BB');
			expect(xrData.combos['AQs'].isIndifferent).toBe(true);
			expect(xrData.combos['AQs'].actions.length).toBe(2);
			expect(xrData.combos['AQs'].localFreq).toBe(35); // 35% raise
			expect(xrData.combos['99'].arrived).toBe(false); // 99 foldou ou não deu XR
		});

		it('should filter out >80% of the range on Turn 2d barrel node', () => {
			const turnData = getSolverNodeData('aula1_2', 'barrel_heavy', 'icm');
			expect(turnData.actor).toBe('BB');
			expect(turnData.streetName).toBe('Turn');
			expect(turnData.activeCombosCount).toBeLessThan(55);
			expect(turnData.combos['AQs'].arrived).toBe(true);
			expect(turnData.combos['Q4s'].localFreq).toBe(80); // 73% bet50 + 7% shove
			expect(turnData.combos['72o'].arrived).toBe(false);
			expect(turnData.combos['AKo'].arrived).toBe(false);
		});

		it('should severely shrink the range on River 3h Call Bluff Catcher node to ~15 combos', () => {
			const callData = getSolverNodeData('aula1_2', 'call_condensed', 'icm');
			expect(callData.actor).toBe('BTN');
			expect(callData.streetName).toBe('River');
			expect(callData.activeCombosCount).toBe(15);
			expect(callData.combos['AQs'].localFreq).toBe(100); // 100% call
			expect(callData.combos['TT'].localFreq).toBe(93); // 93% call
			expect(callData.combos['TT'].isIndifferent).toBe(true);
			expect(callData.combos['JJ'].localFreq).toBe(82); // 82% call
			expect(callData.combos['AKo'].arrived).toBe(false); // Filtrado
		});
	});
});


