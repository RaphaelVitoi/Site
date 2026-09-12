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

const EPSILON = 1e-12;

/**
 * Calcula a Entropia de Shannon (em bits) de uma distribuicao de crenca de range.
 * H(R) = - \sum p_i \log_2(p_i).
 * Uma entropia alta indica grande incerteza (range uniforme/amplo).
 * Uma entropia baixa indica alta definicao ou polarizacao extrema do range.
 */
export function calculateShannonEntropy(belief: BeliefVector): number {
	const values = Object.values(belief);
	const total = values.reduce((acc, v) => acc + v, 0);
	if (total <= EPSILON) return 0;

	let entropy = 0;
	for (const v of values) {
		if (v > EPSILON) {
			const p = v / total;
			entropy -= p * Math.log2(p);
		}
	}
	return Math.max(0, entropy);
}

export interface PublicBeliefState {
	board: string[];
	pot: number;
	heroEntropy: number;
	villainEntropy: number;
	/** Indice de polarizacao/certeza relativa do vilao: [0% = uniforme, 100% = 1 mao isolada] */
	polarizationScore: number;
	combosLeft: number;
}

/**
 * Gera a representacao de Public Belief State (estilo ReBeL/Meta AI).
 */
export function computePublicBeliefState(
	board: string[],
	pot: number,
	heroRange: BeliefVector,
	villainRange: BeliefVector,
): PublicBeliefState {
	const heroEntropy = calculateShannonEntropy(heroRange);
	const villainEntropy = calculateShannonEntropy(villainRange);

	// A entropia maxima para 169 combinacoes discretas e log2(169) ~ 7.4009 bits
	const maxEntropy = Math.log2(169);
	const polarizationScore = Math.max(
		0,
		Math.min(100, (1 - villainEntropy / maxEntropy) * 100),
	);

	// Estimativa de combos ponderados com probabilidade significativa (> 5% do pico)
	const maxV = Math.max(...Object.values(villainRange), EPSILON);
	let activeCombos = 0;
	for (const [hand, prob] of Object.entries(villainRange)) {
		if (prob > maxV * 0.05) {
			const isPair = hand.length === 2;
			const isSuited = hand.endsWith('s');
			activeCombos += isPair ? 6 : isSuited ? 4 : 12;
		}
	}

	return {
		board: [...board],
		pot,
		heroEntropy: Number(heroEntropy.toFixed(3)),
		villainEntropy: Number(villainEntropy.toFixed(3)),
		polarizationScore: Number(polarizationScore.toFixed(1)),
		combosLeft: activeCombos,
	};
}

export type TacticalActionType =
	| 'cbet_small'
	| 'check_raise'
	| 'barrel_heavy'
	| 'bluff_polar'
	| 'call_condensed';

/**
 * Gera distribuicao de verossimilhanca P(Acao | Mao) sensivel a textura do bordo
 * inspirada no subsistema Claudico (Potential-Aware) e modelagem de ranges SOTA.
 */
export function generateTextureAwareLikelihood(
	texture: 'dry' | 'wet' | 'paired' | 'monotone',
	actionType: TacticalActionType,
): ActionLikelihood {
	const likelihood: ActionLikelihood = {};
	const uniform = generateUniformBelief();

	for (const hand of Object.keys(uniform)) {
		const isPair = hand.length === 2;
		const isHighPair = ['AA', 'KK', 'QQ', 'JJ', 'TT'].includes(hand);
		const hasAce = hand.includes('A');
		const hasKingOrQueen = hand.includes('K') || hand.includes('Q');
		const isSuited = hand.endsWith('s');

		let p = 0.5;

		switch (actionType) {
			case 'cbet_small':
				// Range amplo e mergido em bordo seco; mais seletivo em bordo molhado
				if (texture === 'dry') {
					p = hasAce || hasKingOrQueen || isHighPair ? 0.9 : isPair ? 0.75 : 0.55;
				} else if (texture === 'wet' || texture === 'monotone') {
					p = isHighPair || (isSuited && (hasAce || hasKingOrQueen)) ? 0.85 : 0.35;
				} else {
					p = isPair ? 0.8 : 0.45;
				}
				break;

			case 'check_raise':
				// Polarizado: monstros + semi-blefes fortes, sem pares medios
				if (isHighPair || hand === 'AKs' || hand === 'A5s' || hand === 'A4s') {
					p = 0.95;
				} else if (['77', '88', '99', 'KTs', 'QTs'].includes(hand)) {
					p = 0.05; // Pares medios dao check-call, raramente check-raise
				} else if (texture === 'wet' && isSuited && (hasAce || hasKingOrQueen)) {
					p = 0.8; // Combo draws / flush draws
				} else {
					p = 0.15;
				}
				break;

			case 'barrel_heavy':
				// Continuacao agressiva de valor concentrado e draws de alta equidade
				if (isHighPair || hand === 'AKs' || hand === 'AQs') {
					p = 0.92;
				} else if (texture === 'monotone' && isSuited) {
					p = 0.85;
				} else if (isPair) {
					p = 0.4;
				} else {
					p = 0.1;
				}
				break;

			case 'bluff_polar':
				// Polarizacao maxima: topo absoluto ou ar puro com blockers
				if (isHighPair || hand === 'AKs') {
					p = 0.98;
				} else if (hasAce && hand.endsWith('o') && !hasKingOrQueen) {
					p = 0.75; // Blocker de As puro
				} else {
					p = 0.08;
				}
				break;

			case 'call_condensed':
				// Range concentrado em forca media (bluff catchers)
				if (['JJ', 'TT', '99', '88', 'AQo', 'AJo', 'KQo', 'QJs', 'JTs'].includes(hand)) {
					p = 0.95;
				} else if (isHighPair) {
					p = 0.25; // Pares de topo preferem re-raise/all-in
				} else {
					p = 0.2;
				}
				break;
		}

		Reflect.set(likelihood, hand, Math.max(0.01, Math.min(0.99, p)));
	}

	return likelihood;
}


