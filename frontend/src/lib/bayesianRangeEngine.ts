/**
 * IDENTITY: Bayesian Range Engine SOTA v7.0 GOLD
 * PATH: src/lib/bayesianRangeEngine.ts
 * ROLE: Motor matemático vetorial para inferência e atualização de crença em ranges de Poker (Prior -> Posterior).
 */

export type BeliefVector = Record<string, number>;
export type ActionLikelihood = Record<string, number>;

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function generateUniformBelief(): BeliefVector {
	const belief: BeliefVector = {};
	const totalCombos = 1326;

	RANKS.forEach((r1, i) => {
		RANKS.forEach((r2, j) => {
			if (i === j) {
				Reflect.set(belief, `${r1}${r2}`, 6 / totalCombos);
			} else if (j > i) {
				Reflect.set(belief, `${r1}${r2}s`, 4 / totalCombos);
			} else {
				Reflect.set(belief, `${r2}${r1}o`, 12 / totalCombos);
			}
		});
	});
	return belief;
}

export function updateBelief(prior: BeliefVector, likelihood: ActionLikelihood): BeliefVector {
	const posterior: BeliefVector = {};
	let evidence = 0; // P(Action)

	for (const [hand, pHand] of Object.entries(prior)) {
		const pActionGivenHand = Object.hasOwn(likelihood, hand)
			? ((Reflect.get(likelihood, hand) as number | undefined) ?? 0)
			: 0;
		const product = pActionGivenHand * pHand;

		Reflect.set(posterior, hand, product);
		evidence += product;
	}

	if (evidence === 0) return { ...prior }; // Fallback anti-crash (evento impossível)

	for (const [hand, value] of Object.entries(posterior)) {
		Reflect.set(posterior, hand, value / evidence);
	}

	return posterior;
}

export function getBeliefIntensity(belief: BeliefVector, hand: string, maxBelief?: number): number {
	const p = Object.hasOwn(belief, hand)
		? ((Reflect.get(belief, hand) as number | undefined) ?? 0)
		: 0;
	if (p === 0) return 0;

	const maxP = maxBelief ?? Math.max(...Object.values(belief));
	if (maxP === 0) return 0;

	return (p / maxP) * 100;
}

