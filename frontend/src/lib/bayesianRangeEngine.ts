/**
 * IDENTITY: Bayesian Range Engine SOTA v7.0 GOLD
 * PATH: src/lib/bayesianRangeEngine.ts
 * ROLE: Motor matemÃ¡tico vetorial para inferÃªncia e atualizaÃ§Ã£o de crenÃ§a em ranges de Poker (Prior -> Posterior).
 */

export type BeliefVector = Record<string, number>;
export type ActionLikelihood = Record<string, number>;

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function generateUniformBelief(): BeliefVector {
	const belief: BeliefVector = {};
	const totalCombos = 1326;

	for (let i = 0; i < RANKS.length; i++) {
		for (let j = 0; j < RANKS.length; j++) {
			const r1 = RANKS[i];
			const r2 = RANKS[j];
			if (i === j) {
				belief[`${r1}${r2}`] = 6 / totalCombos;
			} else if (j > i) {
				belief[`${r1}${r2}s`] = 4 / totalCombos;
			} else {
				belief[`${r2}${r1}o`] = 12 / totalCombos;
			}
		}
	}
	return belief;
}

export function updateBelief(prior: BeliefVector, likelihood: ActionLikelihood): BeliefVector {
	const posterior: BeliefVector = {};
	let evidence = 0; // P(Action)

	for (const hand in prior) {
		const pHand = prior[hand] ?? 0;
		const pActionGivenHand = likelihood[hand] ?? 0;
		const product = pActionGivenHand * pHand;

		posterior[hand] = product;
		evidence += product;
	}

	if (evidence === 0) return { ...prior }; // Fallback anti-crash (evento impossÃ­vel)

	for (const hand in posterior) {
		posterior[hand] = (posterior[hand] ?? 0) / evidence;
	}

	return posterior;
}

export function getBeliefIntensity(belief: BeliefVector, hand: string, maxBelief?: number): number {
	const p = belief[hand] || 0;
	if (p === 0) return 0;

	const maxP = maxBelief ?? Math.max(...Object.values(belief));
	if (maxP === 0) return 0;

	return (p / maxP) * 100;
}

