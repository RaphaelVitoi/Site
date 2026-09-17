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
			if (isPair) {
				activeCombos += 6;
			} else if (isSuited) {
				activeCombos += 4;
			} else {
				activeCombos += 12;
			}
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

export type BoardTexture = 'aula1_2' | 'dry' | 'wet' | 'paired' | 'monotone';
export type SolverContext = 'icm' | 'chipev';

const RANK_VAL: Record<string, number> = {
	A: 14,
	K: 13,
	Q: 12,
	J: 11,
	T: 10,
	'9': 9,
	'8': 8,
	'7': 7,
	'6': 6,
	'5': 5,
	'4': 4,
	'3': 3,
	'2': 2,
};

export interface HandClassification {
	hand: string;
	r1: string;
	r2: string;
	v1: number;
	v2: number;
	isPair: boolean;
	isHighPair: boolean;
	isSuited: boolean;
	isOffsuit: boolean;
	hasAce: boolean;
	hasKing: boolean;
	hasQueen: boolean;
	hasJack: boolean;
	hasTen: boolean;
	hasNine: boolean;
	hasEight: boolean;
	hasSeven: boolean;
	hasCard: (r: string) => boolean;
}

export function classifyHand(hand: string): HandClassification {
	const r1 = hand.charAt(0);
	const r2 = hand.charAt(1);
	const isSuited = hand.endsWith('s');
	const isOffsuit = hand.endsWith('o');
	const isPair = hand.length === 2 && r1 === r2;
	const v1 = RANK_VAL[r1] ?? 0;
	const v2 = RANK_VAL[r2] ?? 0;

	return {
		hand,
		r1,
		r2,
		v1,
		v2,
		isPair,
		isHighPair: isPair && ['AA', 'KK', 'QQ', 'JJ', 'TT'].includes(hand),
		isSuited,
		isOffsuit,
		hasAce: r1 === 'A' || r2 === 'A',
		hasKing: r1 === 'K' || r2 === 'K',
		hasQueen: r1 === 'Q' || r2 === 'Q',
		hasJack: r1 === 'J' || r2 === 'J',
		hasTen: r1 === 'T' || r2 === 'T',
		hasNine: r1 === '9' || r2 === '9',
		hasEight: r1 === '8' || r2 === '8',
		hasSeven: r1 === '7' || r2 === '7',
		hasCard: (r: string) => r1 === r,
	};
}

function computeCbetLikelihood(
	h: HandClassification,
	texture: BoardTexture,
	solverContext: SolverContext = 'icm',
): number {
	// AULA 1.2: SPOT CANÔNICO FT 9-MAX (Kd Jc Ts)
	if (texture === 'aula1_2') {
		if (solverContext === 'chipev') {
			// ChipEV (GTO Wizard): C-Bet de 97.7% quase puro, sem penalidade de ICM
			if (['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44'].includes(h.hand)) return 0.97;
			if (h.hasAce || h.hasKing || h.hasQueen || h.hasJack || h.hasTen) return 0.98;
			if (h.isSuited) return 0.95;
			return 0.85;
		}

		// ICMev (HRC Pós-Flop - Aula 1.2): Sizing pequeno de 20% (1.13bb) vira dominante (67.5%)
		// Pares médios (TT, 99, 88, 77, 66) checam 100% para evitar check-raise sob RP de 21.4%!
		if (['TT', '99', '88', '77', '66'].includes(h.hand)) return 0.01; // 100% CHECK no ICM!
		if (h.hand === '55') return 0.95; // 100% bet small (blefe puro com blockers)
		if (h.hand === '44') return 0.60; // 60% bet small, 40% check
		if (['AA', 'KK', 'QQ', 'JJ'].includes(h.hand)) return 0.90; // Sets / Overpairs c-betam alto
		if (['AKs', 'AQs', 'AJs', 'ATs'].includes(h.hand)) return 0.98; // Nut draws e topo
		if (['KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs'].includes(h.hand)) return 0.98;
		if (h.hasAce && h.isSuited) return 0.95; // A9s-A2s bet small
		if (h.hasKing && h.isSuited) return 0.95; // K9s-K3s bet small, K2s 60%
		if (h.hasQueen && h.isSuited) return 0.95; // Q9s-Q5s bet small
		if (h.hasJack && h.isSuited) return 0.95; // J9s-J7s bet small
		if (h.hasTen && h.isSuited) return 0.95; // T9s-T7s bet small
		if (['98s', '87s', '76s', '65s'].includes(h.hand)) return 0.80;
		if (['AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A5o'].includes(h.hand)) return 0.96;
		if (['KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'].includes(h.hand)) return 0.96;
		if (h.hand === 'A7o') return 0.90;
		if (['A6o', 'A4o', 'K9o', 'Q9o', 'T9o'].includes(h.hand)) return 0.55;
		if (h.hand === 'J9o') return 0.40;
		if (h.hand === 'K8o') return 0.20;
		if (h.hand === 'A3o') return 0.05;
		return 0.02;
	}

	if (texture === 'dry') {
		// Bordo Seco: Ah Kd 2c (BTN c-bets ~80% do range)
		if (h.hand === 'AA') return 0.98;
		if (h.hand === 'KK') return 0.96;
		if (h.hand === '22') return 0.92;
		if (h.hand === 'AKs' || h.hand === 'AKo') return 0.97;
		if (h.hasAce && (h.r2 === '2' || h.r1 === '2')) return 0.94; // A2s, A2o
		if (h.hasKing && (h.r2 === '2' || h.r1 === '2')) return 0.90; // K2s, K2o
		if (h.hasAce) return h.isSuited ? 0.93 : 0.89; // Todos os Ax c-betam alto
		if (h.hasKing) return h.isSuited ? 0.88 : 0.84; // Todos os Kx (second pair)
		if (h.isPair) return 0.82; // QQ-33 c-betam por proteção e negação de equidade
		// Blefes com equidade: Broadways com gutshot (QJ, QT, JT) e draws wheel (54s, 43s, 53s)
		if (['QJs', 'QJo', 'QTs', 'QTo', 'JTs', 'JTo'].includes(h.hand)) return 0.89;
		if (['54s', '43s', '53s', 'A5s', 'A4s', 'A3s'].includes(h.hand)) return 0.85;
		if (h.isSuited && h.v1 >= 9 && h.v2 >= 7) return 0.72; // Conectores com backdoor
		return 0.20; // Lixo offsuit desconectado
	}

	if (texture === 'wet') {
		// Bordo Molhado: Jh Th 9d (BTN c-bets ~45%, range seletivo e polarizado)
		if (h.hand.startsWith('KQ')) return 0.95; // Nut straight
		if (h.hand.startsWith('87')) return 0.92; // Straight
		if (h.hand.startsWith('Q8')) return 0.88; // Straight
		if (['JJ', 'TT', '99'].includes(h.hand)) return 0.94; // Sets
		if (['JT', 'JTs', 'JTo', 'T9', 'T9s', 'T9o', 'J9', 'J9s', 'J9o'].includes(h.hand)) return 0.88; // Two pairs
		if (['AA', 'KK', 'QQ'].includes(h.hand)) return 0.82; // Overpairs
		// Monster draws (OESD + flush draws)
		if (['QJs', 'QTs', 'Q9s', 'T8s', '98s', '87s', 'AhKh', 'AhQh', 'KhQh', 'Ah8h'].includes(h.hand)) return 0.88;
		if (h.isSuited && (h.hasAce || h.hasKing || h.hasQueen)) return 0.65;
		if (h.hasJack || h.hasTen || h.hasNine) return 0.32; // Top pairs marginais dão check para controle
		return 0.05; // Air puro dá check no bordo molhado
	}

	if (texture === 'paired') {
		// Bordo Dobrado: Qc Qd 4s (BTN c-bets ~75%, alta frequência)
		if (h.hand === 'QQ') return 0.98; // Quads
		if (h.hand === '44') return 0.94; // Full house
		if (h.hasQueen) return 0.95; // Trips (todos os Qx)
		if (['AA', 'KK'].includes(h.hand)) return 0.92; // Overpairs
		if (h.isPair) return 0.82; // Pares médios protegem contra floats
		if (h.hasAce && (h.hasKing || h.hasJack || h.hasTen)) return 0.86; // AK, AJ, AT
		if (['65s', '53s', 'A5s', 'A3s', 'A2s'].includes(h.hand)) return 0.78; // Backdoors
		return 0.22;
	}

	// Bordo Monotone: Kh 8h 3h (BTN c-bets ~40%, polarização em Flush e Blocker de Ás)
	if (h.isSuited) return 0.90; // Em modelo agregado, suited combos representam o flush floppado
	if (['KK', '88', '33'].includes(h.hand)) return 0.88; // Sets
	if (h.hand.startsWith('K8')) return 0.84; // Two pair
	if (h.hasAce) return 0.82; // Ás sem flush tem 25% chance de ser o Ah (nut flush blocker bluff)
	if (h.hasKing && (h.hasQueen || h.hasJack)) return 0.68; // Top pair forte
	return 0.08; // Pares sem copas e lixo puro dão check
}

function computeCheckRaiseLikelihood(
	h: HandClassification,
	texture: BoardTexture,
	solverContext: SolverContext = 'icm',
): number {
	// AULA 1.2: SPOT CANÔNICO FT 9-MAX (Kd Jc Ts)
	if (texture === 'aula1_2') {
		if (solverContext === 'chipev') {
			// ChipEV: BB check-raise mais amplo (~14.5%) sem penalidade de eliminação
			if (['AQs', 'AQo'].includes(h.hand)) return 0.96; // Nut straight
			if (['JJ', 'TT'].includes(h.hand)) return 0.90; // Sets
			if (['KTs', 'KJs', 'QJs', 'JTs'].includes(h.hand)) return 0.88; // Two pairs
			if (['Q9s', '98s', '87s', 'Q8s', 'T8s'].includes(h.hand)) return 0.82; // OESD / Gutshots
			if (h.isSuited && (h.hasKing || h.hasQueen || h.hasJack)) return 0.50;
			if (h.hasKing || h.hasJack || h.hasTen) return 0.15; // Calls dominam mãos médias
			return 0.02;
		}

		// ICMev (HRC Pós-Flop - Aula 1.2): Check-Raise cirúrgico de 9.3% contra BTN c-bet 20%
		// Valor: AQs nut straight, KTs, JTs two pairs
		// Semi-blefes com backdoors: Q9s, Q8s, 97s, T8s, K2s, Q2s, J2s (aproveitando o RP de 21.4% do BTN)
		if (['AQs', 'AQo'].includes(h.hand)) return 0.96; // Nut straight
		if (['KTs', 'JTs'].includes(h.hand)) return 0.90; // Two pair
		if (['Q9s', 'Q8s'].includes(h.hand)) return 0.85; // Gutshots / draws fortes
		if (['97s', 'T8s'].includes(h.hand)) return 0.75;
		if (['K2s', 'Q2s', 'J2s'].includes(h.hand)) return 0.70; // Backdoor de ouros
		if (['JJ', 'TT'].includes(h.hand)) return 0.50; // Sets (mixam XR e call para proteger range)
		if (h.hasKing || h.hasJack || h.hasTen) return 0.08; // Mãos médias dão call (48.1%)
		return 0.01;
	}

	if (texture === 'dry') {
		// BB check-raise no bordo Ah Kd 2c: polarização em valor monstro e blefes selecionados
		if (h.hand === '22') return 0.95;
		if (['A2s', 'K2s', 'AKs', 'AKo'].includes(h.hand)) return 0.90;
		if (['QJs', 'QTs', 'JTs'].includes(h.hand)) return 0.78; // Gutshots broadway
		if (['54s', '43s', '53s', 'A5s', 'A4s'].includes(h.hand)) return 0.82; // Wheel draws
		if (['AA', 'KK'].includes(h.hand)) return 0.50; // Slowplay ou cap
		if (h.hasAce || h.hasKing || (h.isPair && h.v1 >= 8)) return 0.08; // Mãos de call
		return 0.01;
	}

	if (texture === 'wet') {
		// BB check-raise no bordo Jh Th 9d: alta agressividade em sequências e combos pesados
		if (h.hand.startsWith('KQ')) return 0.96;
		if (h.hand.startsWith('87')) return 0.94;
		if (['JJ', 'TT', '99'].includes(h.hand)) return 0.95;
		if (['JT', 'JTs', 'T9s', 'J9s'].includes(h.hand)) return 0.90;
		if (h.hand === 'AA') return 0.92; // Overpair de controle
		if (['Q8s', 'T8s', '98s', 'AhQh', 'KhQh', 'Ah8h', '8h7h'].includes(h.hand)) return 0.86;
		if (h.isPair && h.v1 <= 8) return 0.06; // Pares pequenos sem draw apenas dão fold/call
		if (h.hasJack || h.hasTen || h.hasNine) return 0.08; // Pares médios apenas dão call
		return 0.01;
	}

	if (texture === 'paired') {
		if (h.hasQueen && (h.hasAce || h.hasKing || h.hasJack)) return 0.96;
		if (h.hand === '44') return 0.95;
		if (['A5s', 'A3s', '65s', '53s'].includes(h.hand)) return 0.84;
		return 0.05;
	}

	// Monotone Kh 8h 3h
	if (h.isSuited && (h.hasAce || h.hasQueen || h.hasJack)) return 0.96; // Flushes
	if (['88', '33'].includes(h.hand)) return 0.88; // Sets
	if (h.hasAce && !h.isSuited) return 0.80; // Blocker blefe
	return 0.04;
}

function computeBarrelHeavyLikelihood(
	h: HandClassification,
	texture: BoardTexture,
	solverContext: SolverContext = 'icm',
): number {
	// AULA 1.2: SPOT CANÔNICO FT 9-MAX (Kd Jc Ts 2d)
	if (texture === 'aula1_2') {
		if (solverContext === 'chipev') {
			// ChipEV: Turn 2d barrel contínuo pesado (~58%)
			if (['AQs', 'AQo', 'JJ', 'TT', 'KJs', 'KTs'].includes(h.hand)) return 0.95;
			if (['Q9s', 'Q8s', 'AKs', 'AKo', 'KQo', 'QJs'].includes(h.hand)) return 0.85;
			if (h.isPair) return 0.35;
			return 0.05;
		}

		// ICMev (HRC Pós-Flop - Aula 1.2): BB dispara 50% pot (7.88bb) em 42.8% no Turn 2d
		// Valor sólido: AQs nut straight, JJ set, KJs two pair
		// Blefes com blocker: Q9s, Q8s, Q2s (Queen blocker / gutshot)
		if (['AQs', 'AQo'].includes(h.hand)) return 0.98; // Nut straight
		if (['JJ', 'TT', '22'].includes(h.hand)) return 0.94; // Sets
		if (['KJs', 'KTs'].includes(h.hand)) return 0.90; // Two pairs
		if (['Q9s', 'Q8s', 'Q2s'].includes(h.hand)) return 0.82; // Blefes de barrel com blocker de Q
		if (['AKs', 'AKo'].includes(h.hand)) return 0.40; // Top pairs mixam check
		if (h.isPair && ['99', '88', '77', '66'].includes(h.hand)) return 0.05; // Showdown checks
		return 0.02;
	}

	if (texture === 'dry') {
		// Turn 7s: Ah Kd 2c 7s (Pote cresce, range concentra em topo dominante e draws restantes)
		if (['AA', 'KK', '22', '77'].includes(h.hand)) return 0.96;
		if (['AKs', 'AKo', 'A7s', 'K7s'].includes(h.hand)) return 0.92;
		if (['AQs', 'AQo', 'AJs', 'AJo', 'ATs'].includes(h.hand)) return 0.86;
		if (['QJs', 'QTs', 'JTs'].includes(h.hand)) return 0.72; // Continuação de blefe com blockers
		if (['98s', '87s', '65s'].includes(h.hand)) return 0.65;
		if (h.isPair) return 0.12;
		return 0.02;
	}

	if (texture === 'wet') {
		// Turn 8c: Jh Th 9d 8c (Bordo com 4 cartas conectadas)
		if (h.hand.startsWith('KQ')) return 0.96;
		if (h.hand.startsWith('Q7') || h.hand.startsWith('87') || h.hand.startsWith('76')) return 0.92;
		if (['JJ', 'TT', '99', '88'].includes(h.hand)) return 0.88;
		if (h.isSuited && (h.hasAce || h.hasKing)) return 0.75;
		return 0.05;
	}

	if (texture === 'paired') {
		// Turn 9h: Qc Qd 4s 9h
		if (h.hasQueen) return 0.95;
		if (['AA', 'KK', '44', '99'].includes(h.hand)) return 0.93;
		if (['AKs', 'AKo', 'AJs'].includes(h.hand)) return 0.75;
		return 0.08;
	}

	// Monotone: Turn Jh: Kh 8h 3h Jh (4 de copas no bordo)
	if (h.isSuited) return 0.92;
	if (h.hasAce) return 0.90; // Ah nut flush blocker
	return 0.03;
}

function computeBluffPolarLikelihood(
	h: HandClassification,
	texture: BoardTexture,
	solverContext: SolverContext = 'icm',
): number {
	// AULA 1.2: SPOT CANÔNICO FT 9-MAX (Kd Jc Ts 2d 3h)
	if (texture === 'aula1_2') {
		if (solverContext === 'chipev') {
			// ChipEV: River 3h shove polarizado padrão
			if (['AQs', 'AQo', 'JJ', 'TT', '33', '22', 'KJs', 'KTs'].includes(h.hand)) return 0.98;
			if (['Q9s', 'Q8s', '98s', '87s', 'Q2s'].includes(h.hand)) return 0.85; // Blefe puro
			return 0.02;
		}

		// ICMev (Aula 1.2): BB Shove polarizado no River 3h
		// Nuts: AQs, AQo, JJ, TT, 33, 22, KJs
		// Blefes polarizados que bloqueiam o topo de call do BTN: Q9s, Q8s, Q2s, 97s
		if (['AQs', 'AQo'].includes(h.hand)) return 0.99; // Nut straight
		if (['JJ', 'TT', '33', '22'].includes(h.hand)) return 0.96; // Sets
		if (['KJs', 'KTs'].includes(h.hand)) return 0.92; // Two pairs fortes
		if (['Q9s', 'Q8s', 'Q2s', '97s'].includes(h.hand)) return 0.86; // Busted draws polarizados
		if (['AA', 'KK', 'QQ'].includes(h.hand)) return 0.15; // Slowplay check
		return 0.02;
	}

	if (texture === 'dry') {
		// River 2h: Ah Kd 2c 7s 2h (Polarização estrita Nuts vs Air com blockers)
		if (['AA', 'KK', '22', '77', 'AKs', 'AKo', 'A2s', 'K2s'].includes(h.hand)) return 0.98; // Nuts
		if (['QJo', 'QTo', 'JTo'].includes(h.hand)) return 0.86; // Blefe puro com blockers broadway
		if (['54s', '53s', '43s'].includes(h.hand)) return 0.78; // Blefes sem showdown
		if (['AQs', 'AQo', 'AJs', 'KQo', 'QQ', 'JJ', 'TT', '99'].includes(h.hand)) return 0.04; // Showdown value dá check
		return 0.02;
	}

	if (texture === 'wet') {
		// River 2s: Jh Th 9d 8c 2s
		if (h.hand.startsWith('KQ') || h.hand.startsWith('87') || ['JJ', 'TT', '99'].includes(h.hand)) return 0.98;
		if (h.hasAce && !h.isSuited && h.v2 <= 8) return 0.84; // Blefes com Ace blocker
		return 0.03;
	}

	if (texture === 'paired') {
		// River As: Qc Qd 4s 9h As
		if (h.hasQueen || ['AA', '44', '99'].includes(h.hand)) return 0.98;
		if (['JTs', 'KTs', '65s', '53s'].includes(h.hand)) return 0.80; // Blefe puro
		return 0.04;
	}

	// Monotone River 2c: Kh 8h 3h Jh 2c
	if (h.isSuited && h.hasAce) return 0.99; // Nut flush
	if (h.isSuited) return 0.90; // Flush
	if (h.hasAce && !h.isSuited) return 0.88; // Nut flush blocker shove blefe!
	return 0.02;
}

function computeCallCondensedLikelihood(
	h: HandClassification,
	texture: BoardTexture,
	solverContext: SolverContext = 'icm',
): number {
	// AULA 1.2: SPOT CANÔNICO FT 9-MAX (Kd Jc Ts 2d 3h)
	if (texture === 'aula1_2') {
		if (solverContext === 'chipev') {
			// ChipEV: Bluff catcher amplo (~58%) baseado em pot odds puras
			if (['AQs', 'AQo', 'JJ', 'TT', '33', '22', 'KJs', 'KTs', 'QJs', 'JTs', 'AKs', 'AKo'].includes(h.hand)) return 0.95;
			if (['KQs', 'KQo', 'AJo', 'ATo'].includes(h.hand)) return 0.70;
			if (h.isPair) return 0.40;
			return 0.03;
		}

		// ICMev (Aula 1.2): BTN Bluff Catching vs Shove no River 3h (Call 48.2%, Fold 51.8%)
		// Paga 100%: AQs, AQo (Nuts), 33 (100% set), 22 (100% set)
		// Paga quase puro: TT (93% set), JJ (82% set), KJs, KTs, K2s, JTs (dois pares)
		// Paga parcial: AKs, AKo (top pair top kicker com blocker)
		if (['AQs', 'AQo', '33', '22'].includes(h.hand)) return 0.99;
		if (h.hand === 'TT') return 0.93; // 93% call
		if (h.hand === 'JJ') return 0.82; // 82% call
		if (['KJs', 'KTs', 'K2s', 'JTs', 'QTs'].includes(h.hand)) return 0.88;
		if (['AKs', 'AKo'].includes(h.hand)) return 0.55;
		if (['KQo', 'KQs', 'AJs', 'ATs'].includes(h.hand)) return 0.20;
		return 0.02;
	}

	if (texture === 'dry') {
		// Bluff Catchers no bordo seco: Mãos que ganham de blefes (QJ, 54) e perdem para o topo
		if (['AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'A9s', 'KQo', 'KQs', 'KJs'].includes(h.hand)) return 0.94;
		if (['QQ', 'JJ', 'TT', '99', '88'].includes(h.hand)) return 0.90;
		if (['AA', 'KK', '22', 'AKs'].includes(h.hand)) return 0.15; // Mãos de raise/shove
		return 0.02;
	}

	if (texture === 'wet') {
		if (['AJs', 'AJo', 'KJs', 'QJs', 'JTs', 'T9s', 'J9s', 'AA', 'KK'].includes(h.hand)) return 0.90;
		if (h.hand.startsWith('KQ') || h.hand.startsWith('87')) return 0.15; // Raise
		return 0.03;
	}

	if (texture === 'paired') {
		if (['JJ', 'TT', '99', '88', '77', '66', '55', 'A4s', 'K4s'].includes(h.hand)) return 0.92;
		if (h.hasQueen && (h.r2 === '6' || h.r2 === '5' || h.r2 === '3' || h.r2 === '2')) return 0.88;
		return 0.04;
	}

	// Monotone
	if (['KQs', 'KJs', 'KTs', 'K8s', '88'].includes(h.hand)) return 0.88;
	if (h.isSuited && !h.hasAce) return 0.85; // Flushes médios que pagam
	return 0.03;
}

function evaluateTacticalProbability(
	h: HandClassification,
	texture: BoardTexture,
	actionType: TacticalActionType,
	solverContext: SolverContext = 'icm',
): number {
	switch (actionType) {
		case 'cbet_small': return computeCbetLikelihood(h, texture, solverContext);
		case 'check_raise': return computeCheckRaiseLikelihood(h, texture, solverContext);
		case 'barrel_heavy': return computeBarrelHeavyLikelihood(h, texture, solverContext);
		case 'bluff_polar': return computeBluffPolarLikelihood(h, texture, solverContext);
		case 'call_condensed': return computeCallCondensedLikelihood(h, texture, solverContext);
	}
}

/**
 * Gera distribuicao de verossimilhanca P(Acao | Mao, Bordo) rigorosa e sensivel a textura do bordo
 * inspirada no subsistema Claudico (Potential-Aware) e modelagem de ranges GTO SOTA.
 */
export function generateTextureAwareLikelihood(
	texture: BoardTexture,
	actionType: TacticalActionType,
	solverContext: SolverContext = 'icm',
): ActionLikelihood {
	const likelihood: ActionLikelihood = {};
	const uniform = generateUniformBelief();

	for (const hand of Object.keys(uniform)) {
		const classification = classifyHand(hand);
		const rawP = evaluateTacticalProbability(classification, texture, actionType, solverContext);
		Reflect.set(likelihood, hand, Math.max(0.01, Math.min(0.99, rawP)));
	}

	return likelihood;
}

export interface TacticalStrategyExplanation {
	title: string;
	boardName: string;
	actionName: string;
	frequencyEstimate: string;
	tacticalSummary: string;
	keyCombos: string[];
}

export function getTacticalStrategyExplanation(
	texture: BoardTexture,
	actionType: TacticalActionType,
	solverContext: SolverContext = 'icm',
): TacticalStrategyExplanation {
	const boardNames: Record<BoardTexture, string> = {
		aula1_2: 'Aula 1.2 · FT Kd Jc Ts 2d 3h',
		dry: 'Bordo Seco [Ah Kd 2c]',
		wet: 'Bordo Molhado [Jh Th 9d]',
		paired: 'Bordo Dobrado [Qc Qd 4s]',
		monotone: 'Bordo Monotone [Kh 8h 3h]',
	};

	const actionTitles: Record<TacticalActionType, string> = {
		cbet_small: 'Flop C-Bet (33% Pot)',
		check_raise: 'Check-Raise Flop',
		barrel_heavy: 'Turn Barrel (66% Pot)',
		bluff_polar: 'River Shove Polarizado',
		call_condensed: 'Call (Bluff Catcher)',
	};

	// AULA 1.2: EXPLICAÇÕES DOUTRINÁRIAS ESPECÍFICAS (RAPHAEL VITOI)
	if (texture === 'aula1_2') {
		if (solverContext === 'chipev') {
			const chipevSummaries: Record<
				TacticalActionType,
				{ freq: string; summary: string; combos: string[] }
			> = {
				cbet_small: {
					freq: 'Quase Puro (~97.7%) · 50% Pot Dominante (82.5%)',
					summary:
						'ChipEV (GTO Wizard Baseline): Sem Risk Premium e sem pressão de eliminação de FT, o BTN ataca implacavelmente com 97.7% de C-bet (checks quase nulos: 2.3%). O sizing pesado de 50% pot domina em 82.5%. Mãos como TT, 99, 88, 77 e 66 apostam praticamente 100% das vezes (95%+).',
					combos: ['Ax e Kx (98%)', 'TT-66 (95%+ Bet)', 'Broadways', 'Pocket Pairs'],
				},
				check_raise: {
					freq: 'Ampla (~14.5%) · Sem Desconto de ICM',
					summary:
						'Sem a penalidade de eliminação monetária, o BB pode contra-atacar agressivamente com mais semi-blefes, gutshots e dois pares sem restrições de sobrevivência.',
					combos: ['AQs', 'KTs', 'JTs', 'Q9s', '98s', '87s', 'T8s'],
				},
				barrel_heavy: {
					freq: 'Alta Pressão (~58.0%) · Continuidade',
					summary:
						'Turn 2♦: Continuação pesada no Turn. O range de ChipEV mantém pressão com valor dominante e blefes de alta equidade residual sem medo de bust.',
					combos: ['AQs', 'JJ', 'TT', 'KJs', 'Q9s', 'Q8s', 'AK'],
				},
				bluff_polar: {
					freq: 'All-In Frequente (~45.0%) · Maximizar ChipEV',
					summary:
						'River 3♥: Shove polarizado buscando maximização linear de fichas acumuladas, sem a assimetria côncava da função de utilidade de torneio.',
					combos: ['Straights', 'Sets', 'Two Pairs', 'Missed Draws'],
				},
				call_condensed: {
					freq: 'Amplo Call (~58.5%) · Pot Odds Puras',
					summary:
						'Em ChipEV, pagar um shove depende unicamente de Pot Odds lineares (necessita de ~33-35% de equidade). Calls mais soltos com top pairs fracos e pares médios.',
					combos: ['Top Pairs', 'Two Pairs', 'Sets', 'Pocket Pairs'],
				},
			};
			const item = chipevSummaries[actionType];
			return {
				title: actionTitles[actionType],
				boardName: boardNames[texture],
				actionName: actionTitles[actionType],
				frequencyEstimate: item.freq,
				tacticalSummary: item.summary,
				keyCombos: item.combos,
			};
		}

		// ICMev (HRC Pós-Flop - Aula 1.2)
		const icmSummaries: Record<
			TacticalActionType,
			{ freq: string; summary: string; combos: string[] }
		> = {
			cbet_small: {
				freq: 'Seletiva (~75.0%) · 20% Pot Dominante (67.5%)',
				summary:
					'ICMev (HRC Pós-Flop · Aula 1.2): Sob Risk Premium de 21.4% do BTN contra o stack de 53bb do BB (que cobre), a aposta de 50% pot desmorona de 82.5% para 7.5%, e a aposta de 20% (1.13bb) vira dominante (67.5%). TT, 99, 88, 77 e 66 dão 100% CHECK para proteger showdown value vulnerável contra check-raise!',
				combos: ['AKs', 'AQs', 'KJs', '55 (Blefe Pequeno)', 'TT-66 (100% CHECK no ICM!)'],
			},
			check_raise: {
				freq: 'Cirúrgica (~9.3%) · Pressão em RP',
				summary:
					'BB check-raisa 9.3% para 4.54bb explorando a desvantagem de RP do BTN. Mãos de valor: AQs (nut straight), KTs, JTs (two pair). Blefes cirúrgicos com backdoor de ouros: Q9s, Q8s, 97s, T8s, K2s, Q2s, J2s.',
				combos: ['AQs (Nuts)', 'KTs', 'JTs', 'Q9s', 'Q8s', 'K2s-J2s (Backdoor ♦)'],
			},
			barrel_heavy: {
				freq: 'Polarizada (~42.8%) · Turn 2♦ (7.88bb)',
				summary:
					'No Turn 2♦, o BB dispara 50% pot (7.88bb) em 42.8% e checa 42.0%. Dispara valor com AQs (nut straight), JJ (set), KJs (two pair) e blefes agressivos com blockers de Dama (Q9s, Q8s, Q2s).',
				combos: ['AQs (Nuts)', 'JJ (Set)', 'KJs (Two Pair)', 'Q9s', 'Q8s', 'Q2s'],
			},
			bluff_polar: {
				freq: 'Shove Polarizado (~35.0%) · River 3♥',
				summary:
					'River 3♥ despolariza a linha. O BB vai all-in polarizado com topo absoluto (AQs/AQo nut straight, sets de JJ, TT, 33, 22) balanceado com blefes puros de gutters perdidos (Q9s, Q8s, Q2s).',
				combos: ['AQs/AQo', 'JJ-22 (Sets)', 'KJs/KTs', 'Q9s/Q8s (Busted Blefes)'],
			},
			call_condensed: {
				freq: 'Bluff Catching (~48.2%) · BTN vs Shove',
				summary:
					'BTN paga com 48.2% do range e folda 51.8%. Calls obrigatórios: AQs/AQo (100% nuts), 33/22 (100% sets), TT (93%), JJ (82%), dois pares (KJs, KTs, K2s, JTs) e AKs/AKo como bluff catchers de topo.',
				combos: ['AQs/AQo (100%)', '33/22 (100%)', 'TT (93%)', 'JJ (82%)', 'KJs/KTs/JTs'],
			},
		};
		const item = icmSummaries[actionType];
		return {
			title: actionTitles[actionType],
			boardName: boardNames[texture],
			actionName: actionTitles[actionType],
			frequencyEstimate: item.freq,
			tacticalSummary: item.summary,
			keyCombos: item.combos,
		};
	}

	const summaries: Record<
		`${BoardTexture}_${TacticalActionType}`,
		{ freq: string; summary: string; combos: string[] }
	> = {
		aula1_2_cbet_small: {
			freq: 'Seletiva (~75%)',
			summary: 'Spot da Aula 1.2',
			combos: ['AKs', 'AQs', 'TT-66 (Check)'],
		},
		aula1_2_check_raise: {
			freq: 'Cirúrgica (~9.3%)',
			summary: 'Spot da Aula 1.2',
			combos: ['AQs', 'KTs', 'JTs'],
		},
		aula1_2_barrel_heavy: {
			freq: 'Polarizada (~42.8%)',
			summary: 'Spot da Aula 1.2',
			combos: ['AQs', 'JJ', 'KJs'],
		},
		aula1_2_bluff_polar: {
			freq: 'Shove (~35.0%)',
			summary: 'Spot da Aula 1.2',
			combos: ['AQs', 'JJ', 'TT'],
		},
		aula1_2_call_condensed: {
			freq: 'Bluff Catcher (~48.2%)',
			summary: 'Spot da Aula 1.2',
			combos: ['AQs', '33', '22', 'TT'],
		},
		dry_cbet_small: {
			freq: 'Alta (~82%)',
			summary:
				'Vantagem posicional e de nuts massiva do BTN. C-Bet amplo com todo o range de Ax e Kx por valor, pocket pairs (QQ-33) para negar equidade e broadways com gutshot (QJ, QT, JT) como blefes de alta equidade.',
			combos: ['AA', 'KK', 'AKs', 'AKo', 'AQo', 'QQ-33', 'QJ', 'JT'],
		},
		dry_check_raise: {
			freq: 'Polarizada (~9%)',
			summary:
				'Resposta agressiva do Vilão (BB). Polarização estrita entre valor monstro (22, A2s, K2s) e blefes com grande equity retention (gutshots QJ, QT, JT e wheel draws 54s, 43s).',
			combos: ['22', 'A2s', 'K2s', 'QJs', 'QTs', '54s', '43s'],
		},
		dry_barrel_heavy: {
			freq: 'Concentrada (~55%)',
			summary:
				'Turn 7s: Pressão concentrada em topo de range e equidade dominante. Sets (AA, KK, 22, 77), two pairs (AK, A7s) e blefes que sustentam draws.',
			combos: ['AA', 'KK', '77', 'AK', 'AQ', 'QJ', '98s'],
		},
		dry_bluff_polar: {
			freq: 'Polarizada (~38%)',
			summary:
				'River 2h: Colapso binário puro. Topo absoluto (full houses/quads) balanceado cirurgicamente com blefes contendo blockers da folding range do adversário (QJo, QTo).',
			combos: ['AA', 'KK', '22', 'AK', 'QJo', 'QTo', '54s'],
		},
		dry_call_condensed: {
			freq: 'Condensada (~62%)',
			summary:
				'Range de bluff catcher: Mãos médias com showdown value (AQ, AJ, AT, KQ, QQ-88) que batem blefes (QJ, 54) mas foldam ou perderiam para o topo absoluto.',
			combos: ['AQ', 'AJ', 'KQ', 'QQ', 'JJ', 'TT', '99'],
		},
		wet_cbet_small: {
			freq: 'Seletiva (~44%)',
			summary:
				'Bordo extremamente conectado que favorece o range de defesa do BB. C-Bet seletivo em sequências feitas (KQ, 87), trincas (JJ, TT, 99), dois pares e monstros draws (AhKh, QJs).',
			combos: ['KQ', '87', 'JJ', 'TT', '99', 'JT', 'QJs', 'AhKh'],
		},
		wet_check_raise: {
			freq: 'Alta Agressão (~16%)',
			summary:
				'Check-raise poderoso do BB capitalizando sobre sequências e monster draws que colocam máxima pressão no c-bet do BTN.',
			combos: ['KQ', '87s', 'JJ', 'TT', '99', 'Q8s', 'AhQh'],
		},
		wet_barrel_heavy: {
			freq: 'Alta Densidade (~42%)',
			summary:
				'Turn 8c: O bordo agora tem 4 cartas para sequência. Apenas sequências superiores (KQ), full houses e flushes retêm EV positivo para disparar.',
			combos: ['KQ', 'Q7s', '87', 'JJ', 'TT', '99', 'AhKh'],
		},
		wet_bluff_polar: {
			freq: 'Polarizada (~32%)',
			summary:
				'River 2s: Shove em valor com sequências e full houses, balanceado com blefes de Ace blocker que impedem o oponente de dar call com flush.',
			combos: ['KQ', '87', 'JJ', 'TT', 'Ah5s', 'Ah4s'],
		},
		wet_call_condensed: {
			freq: 'Condensada (~48%)',
			summary:
				'Top pairs e dois pares que pagam apostas moderadas tentando pegar blefes de sequências perdidas.',
			combos: ['AJ', 'KJ', 'QJ', 'JT', 'T9', 'AA', 'KK'],
		},
		paired_cbet_small: {
			freq: 'Ampla (~76%)',
			summary:
				'Bordo dobrado e estático Qc-Qd-4s. O defensor raramente acertou uma dama, permitindo c-bet de alta frequência com todos os Qx, overpairs e blefes com duas overcards.',
			combos: ['Qx', 'AA', 'KK', '44', 'JJ-55', 'AK', 'AJ'],
		},
		paired_check_raise: {
			freq: 'Seletiva (~10%)',
			summary:
				'Check-raise do Vilão com trincas fortes (AQ, KQ, QJ) e full house (44), balanceado com gutshots wheel (65s, 53s).',
			combos: ['AQ', 'KQ', 'QJ', '44', '65s', '53s'],
		},
		paired_barrel_heavy: {
			freq: 'Alta Densidade (~58%)',
			summary:
				'Turn 9h: Continuação de aposta pesada com trincas de dama+, full houses e overcards de alta equidade.',
			combos: ['Qx', 'AA', 'KK', '44', '99', 'AK', 'AJ'],
		},
		paired_bluff_polar: {
			freq: 'Polarizada (~36%)',
			summary:
				'River As: Shove polarizado com trincas e full houses vs blefes que bloqueiam o call com damas (KTs, JTs).',
			combos: ['Qx', 'AA', '44', '99', 'KTs', 'JTs'],
		},
		paired_call_condensed: {
			freq: 'Condensada (~60%)',
			summary:
				'Pares de mão médios (JJ-55) e pares de 4 atuando como bluff catchers eficientes.',
			combos: ['JJ', 'TT', '99', '88', '77', '66', '55', 'A4s'],
		},
		monotone_cbet_small: {
			freq: 'Cautelosa (~38%)',
			summary:
				'Bordo com 3 copas Kh-8h-3h. O c-bet é prudente: focado em flushes feitos e, crucialmente, no blefe com o Às de copas (Ah blocker) que retira o nut flush do oponente.',
			combos: ['Flushes (s)', 'KK', '88', '33', 'AhX (Blocker)', 'KQ'],
		},
		monotone_check_raise: {
			freq: 'Alta Pressão (~12%)',
			summary:
				'Check-raise do BB com flushes e sets, balanceado com blefes do Às de copas.',
			combos: ['AhXs', 'Qh8s', '88', '33', 'Ah5o', 'Ah4o'],
		},
		monotone_barrel_heavy: {
			freq: 'Alta Densidade (~35%)',
			summary:
				'Turn Jh: Quatro cartas de copas no bordo. Apenas o Nut Flush (Ah) e flushes muito altos podem apostar por valor.',
			combos: ['AhXs', 'QhXs', 'JhXs', 'Ah (Blocker)'],
		},
		monotone_bluff_polar: {
			freq: 'Polarizada (~28%)',
			summary:
				'River 2c: Shove em valor com o Nut Flush balanceado com o blefe supremo do Às de copas sem flush que simula o nuts.',
			combos: ['AhXs', 'Ah (Blocker Shove)'],
		},
		monotone_call_condensed: {
			freq: 'Condensada (~44%)',
			summary:
				'Kx fortes e flushes baixos/médios pagando no river para pegar o blefe do Às seco.',
			combos: ['KQ', 'KJ', 'K8', '88', 'Flushes Baixos'],
		},
	};

	const key = `${texture}_${actionType}` as keyof typeof summaries;
	const item = summaries[key] ?? summaries.dry_cbet_small;

	return {
		title: actionTitles[actionType],
		boardName: boardNames[texture],
		actionName: actionTitles[actionType],
		frequencyEstimate: item.freq,
		tacticalSummary: item.summary,
		keyCombos: item.combos,
	};
}

export interface NodeAction {
	name: string;
	label: string;
	pct: number;
	color: string;
	bgClass?: string;
}

export interface ComboNodeState {
	arrived: boolean;
	arrivalWeight: number; // 0.0 a 1.0 (peso residual de chegada ao nó)
	localFreq: number; // Percentual condicional local P(Ação | Chegou)
	actions: NodeAction[]; // Ações possíveis no nó -> Se length > 1: Indiferença de Nash!
	isIndifferent: boolean;
	gradientStyle?: string;
	notes?: string;
}

export interface SolverNodeData {
	nodeId: TacticalActionType;
	streetName: 'Flop' | 'Turn' | 'River';
	actor: 'BTN' | 'BB';
	potBB: number;
	activeCombosCount: number;
	globalBar: NodeAction[];
	combos: Record<string, ComboNodeState>;
}

export function computeSplitGradient(actions: NodeAction[]): string {
	if (!actions || actions.length === 0) return 'rgba(15, 23, 42, 0.4)';
	const firstAction = actions[0];
	if (actions.length === 1 && firstAction) return firstAction.color;

	let currentPct = 0;
	const stops: string[] = [];
	for (const act of actions) {
		const start = currentPct;
		const end = currentPct + act.pct;
		stops.push(`${act.color} ${start.toFixed(1)}%`);
		stops.push(`${act.color} ${end.toFixed(1)}%`);
		currentPct = end;
	}
	return `linear-gradient(to right, ${stops.join(', ')})`;
}

// Range de Abertura do BTN na Aula 1.2 (33.6% do baralho = ~445 combos)
const AULA1_2_BTN_OPEN: Record<string, number> = {
	AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, '99': 1.0, '88': 1.0, '77': 1.0, '66': 1.0, '55': 1.0, '44': 0.6,
	AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 1.0, A7s: 1.0, A6s: 1.0, A5s: 1.0, A4s: 1.0, A3s: 1.0, A2s: 1.0,
	KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 1.0, K8s: 1.0, K7s: 1.0, K6s: 1.0, K5s: 1.0, K4s: 1.0, K3s: 1.0, K2s: 0.6,
	QJs: 1.0, QTs: 1.0, Q9s: 1.0, Q8s: 1.0, Q7s: 1.0, Q6s: 1.0, Q5s: 1.0, Q4s: 0.5, Q3s: 0.1,
	JTs: 1.0, J9s: 1.0, J8s: 1.0, J7s: 1.0, J6s: 0.5, J5s: 0.3,
	T9s: 1.0, T8s: 1.0, T7s: 1.0, T6s: 0.3,
	'98s': 1.0, '97s': 0.8, '96s': 0.1,
	'87s': 1.0, '86s': 0.6,
	'76s': 0.7, '75s': 0.2,
	'65s': 0.5, '54s': 0.2,
	AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 1.0, A9o: 1.0, A8o: 1.0, A7o: 0.9, A6o: 0.5, A5o: 1.0, A4o: 0.5,
	KQo: 1.0, KJo: 1.0, KTo: 1.0, K9o: 0.6, K8o: 0.2,
	QJo: 1.0, QTo: 1.0, Q9o: 0.5,
	JTo: 1.0, J9o: 0.4,
	T9o: 0.5,
};

// Obter dados canônicos estruturados do nó de solver
export function getSolverNodeData(
	texture: BoardTexture,
	actionType: TacticalActionType,
	solverContext: SolverContext = 'icm',
): SolverNodeData {
	const allHands = Object.keys(generateUniformBelief());
	const combos: Record<string, ComboNodeState> = {};

	// ==========================================
	// 1. AULA 1.2: DADOS CANÔNICOS REAIS (HRC vs GTO WIZARD)
	// ==========================================
	if (texture === 'aula1_2') {
		if (actionType === 'cbet_small') {
			const isIcm = solverContext === 'icm';
			const globalBar: NodeAction[] = isIcm
				? [
						{ name: 'Check', label: 'Check', pct: 23.6, color: '#4ade80', bgClass: 'bg-emerald-400' },
						{ name: 'Bet 20%', label: 'Bet 1.13bb', pct: 67.5, color: '#fda4af', bgClass: 'bg-rose-300' },
						{ name: 'Bet 50%', label: 'Bet 2.81bb', pct: 7.5, color: '#fb923c', bgClass: 'bg-amber-500' },
						{ name: 'Bet 75%', label: 'Bet 4.22bb', pct: 1.4, color: '#ef4444', bgClass: 'bg-red-500' },
					]
				: [
						{ name: 'Check', label: 'Check', pct: 2.3, color: '#4ade80', bgClass: 'bg-emerald-400' },
						{ name: 'Bet 20%', label: 'Bet 1.1bb', pct: 8.7, color: '#fda4af', bgClass: 'bg-rose-300' },
						{ name: 'Bet 50%', label: 'Bet 2.8bb', pct: 82.5, color: '#fb923c', bgClass: 'bg-amber-500' },
						{ name: 'Bet 75%', label: 'Bet 4.2bb', pct: 6.6, color: '#ef4444', bgClass: 'bg-red-500' },
					];

			for (const hand of allHands) {
				const openWeight = AULA1_2_BTN_OPEN[hand] ?? 0;
				if (openWeight === 0) {
					combos[hand] = {
						arrived: false,
						arrivalWeight: 0,
						localFreq: 0,
						actions: [],
						isIndifferent: false,
						gradientStyle: 'rgba(15, 23, 42, 0.4)',
					};
					continue;
				}

				// Se chegou ao nó do flop
				let actions: NodeAction[] = [];
				let localFreq = 0;

				if (isIcm) {
					// ICMev: TT-66 dão 100% CHECK sob RP de 21.4%
					if (['TT', '99', '88', '77', '66'].includes(hand)) {
						actions = [{ name: 'Check', label: 'Check', pct: 100, color: '#4ade80' }];
						localFreq = 0; // Aposta é 0%
					} else if (hand === '55') {
						actions = [{ name: 'Bet 20%', label: 'Bet 1.13bb', pct: 100, color: '#fda4af' }];
						localFreq = 100;
					} else if (hand === '44') {
						actions = [
							{ name: 'Bet 20%', label: 'Bet 1.13bb', pct: 60, color: '#fda4af' },
							{ name: 'Check', label: 'Check', pct: 40, color: '#4ade80' },
						];
						localFreq = 60;
					} else if (['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'KTs'].includes(hand)) {
						actions = [
							{ name: 'Bet 20%', label: 'Bet 1.13bb', pct: 70, color: '#fda4af' },
							{ name: 'Bet 50%', label: 'Bet 2.81bb', pct: 25, color: '#fb923c' },
							{ name: 'Check', label: 'Check', pct: 5, color: '#4ade80' },
						];
						localFreq = 95;
					} else {
						// Demais combos abertos
						actions = [
							{ name: 'Bet 20%', label: 'Bet 1.13bb', pct: 85, color: '#fda4af' },
							{ name: 'Check', label: 'Check', pct: 15, color: '#4ade80' },
						];
						localFreq = 85;
					}
				} else {
					// ChipEV (GTO Wizard Baseline): Bet 50% dominante em 82.5%, TT-66 apostam 97%+
					actions = [
						{ name: 'Bet 50%', label: 'Bet 2.8bb', pct: 85, color: '#fb923c' },
						{ name: 'Bet 20%', label: 'Bet 1.1bb', pct: 12, color: '#fda4af' },
						{ name: 'Check', label: 'Check', pct: 3, color: '#4ade80' },
					];
					localFreq = 97;
				}

				combos[hand] = {
					arrived: true,
					arrivalWeight: openWeight,
					localFreq,
					actions,
					isIndifferent: actions.filter((a) => a.pct > 0).length > 1,
					gradientStyle: computeSplitGradient(actions),
				};
			}

			return {
				nodeId: 'cbet_small',
				streetName: 'Flop',
				actor: 'BTN',
				potBB: 6.76,
				activeCombosCount: 445,
				globalBar,
				combos,
			};
		}

		if (actionType === 'check_raise') {
			const isIcm = solverContext === 'icm';
			const globalBar: NodeAction[] = isIcm
				? [
						{ name: 'Fold', label: 'Fold', pct: 42.6, color: '#64748b', bgClass: 'bg-slate-500' },
						{ name: 'Call', label: 'Call', pct: 48.1, color: '#4ade80', bgClass: 'bg-emerald-400' },
						{ name: 'Raise 5.06bb', label: 'Raise 5.06bb', pct: 9.3, color: '#fb7185', bgClass: 'bg-rose-400' },
					]
				: [
						{ name: 'Fold', label: 'Fold', pct: 35.7, color: '#38bdf8', bgClass: 'bg-sky-400' },
						{ name: 'Call', label: 'Call', pct: 57.4, color: '#4ade80', bgClass: 'bg-emerald-400' },
						{ name: 'Raise 5bb', label: 'Raise 5bb', pct: 6.8, color: '#fb923c', bgClass: 'bg-amber-500' },
					];

			// Lista exata de combos que Check-Raisam no BB (Aula 1.2)
			const xrCombosMap: Record<string, number> = {
				AQs: 35, KTs: 30, Q9s: 15, Q8s: 25, '97s': 35, T8s: 15, K2s: 25, Q2s: 20, J2s: 15,
				JJ: 15, TT: 10, AQo: 15, KJs: 10, JTs: 15, Q7s: 15, Q6s: 15, Q5s: 15, Q4s: 20, Q3s: 20,
				J3s: 15, '98s': 15, A9s: 10, A6s: 10, A5s: 10, A4s: 10, A3s: 10, A2s: 10,
				A9o: 10, Q9o: 10, Q8o: 10, Q7o: 10, Q6o: 10, Q5o: 15, Q4o: 15, Q3o: 15, Q2o: 15,
				JTo: 10, '98o': 10, '97o': 10, K2o: 10,
			};

			const bbCallingCombos = [
				'AJs', 'ATs', 'A8s', 'A7s', 'KQs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s',
				'QQ', 'QJs', 'QTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'T9s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
				'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'J9o', 'J8o', 'J7o', 'J6o', 'T9o', 'T8o', 'T7o', 'T6o',
				'K9o', 'K8o', 'K7o', 'K6o', 'K5o', 'K4o', 'K3o',
			];

			for (const hand of allHands) {
				const raiseFreq = xrCombosMap[hand];
				const isPureCall = bbCallingCombos.includes(hand);

				if (raiseFreq !== undefined) {
					// Mão de Check-Raise (Indiferença de Nash: Raise vs Call)
					const callFreq = 100 - raiseFreq;
					const actions = [
						{ name: 'Raise 5.06bb', label: 'Raise', pct: raiseFreq, color: '#fb7185' },
						{ name: 'Call', label: 'Call', pct: callFreq, color: '#4ade80' },
					];
					combos[hand] = {
						arrived: true,
						arrivalWeight: 0.9,
						localFreq: raiseFreq,
						actions,
						isIndifferent: true,
						gradientStyle: computeSplitGradient(actions),
						notes: `${hand} · Indiferença de Nash: ${raiseFreq}% Raise / ${callFreq}% Call (EV Empatado)`,
					};
				} else if (isPureCall) {
					// Mão de Call
					const actions = [{ name: 'Call', label: 'Call', pct: 100, color: '#4ade80' }];
					combos[hand] = {
						arrived: true,
						arrivalWeight: 0.8,
						localFreq: 0,
						actions,
						isIndifferent: false,
						gradientStyle: '#4ade80',
					};
				} else {
					// Mão não chegou ou foldou (AA, KK, AKs 3-betaram pré-flop; 99-22 foldaram; lixo offsuit)
					combos[hand] = {
						arrived: false,
						arrivalWeight: 0,
						localFreq: 0,
						actions: [],
						isIndifferent: false,
						gradientStyle: 'rgba(15, 23, 42, 0.4)',
					};
				}
			}

			return {
				nodeId: 'check_raise',
				streetName: 'Flop',
				actor: 'BB',
				potBB: 11.3,
				activeCombosCount: 51,
				globalBar,
				combos,
			};
		}

		if (actionType === 'barrel_heavy') {
			// TURN 2d: APENAS COMBOS QUE DERAM CHECK-RAISE CHEGAM AQUI!
			const globalBar: NodeAction[] = [
				{ name: 'Check', label: 'Check', pct: 42.0, color: '#4ade80', bgClass: 'bg-emerald-400' },
				{ name: 'Bet 20%', label: 'Bet 3.15bb', pct: 11.0, color: '#fda4af', bgClass: 'bg-rose-300' },
				{ name: 'Bet 50%', label: 'Bet 7.88bb', pct: 42.8, color: '#f97316', bgClass: 'bg-amber-500' },
				{ name: 'Shove', label: 'All-in 32.8bb', pct: 4.2, color: '#ef4444', bgClass: 'bg-red-500' },
			];

			// Frequências locais do Turn 2d (Aula 1.2 - Imagem 40)
			const turnBetMap: Record<string, { bet50: number; check: number; shove: number }> = {
				AQs: { bet50: 43, check: 35, shove: 22 },
				AQo: { bet50: 46, check: 38, shove: 16 },
				JJ: { bet50: 45, check: 45, shove: 10 },
				TT: { bet50: 6, check: 94, shove: 0 },
				KJs: { bet50: 40, check: 50, shove: 10 },
				KTs: { bet50: 32, check: 60, shove: 8 },
				JTs: { bet50: 23, check: 70, shove: 7 },
				Q9s: { bet50: 50, check: 40, shove: 10 },
				Q8s: { bet50: 26, check: 65, shove: 9 },
				Q7s: { bet50: 43, check: 50, shove: 7 },
				Q6s: { bet50: 49, check: 45, shove: 6 },
				Q5s: { bet50: 28, check: 65, shove: 7 },
				Q4s: { bet50: 73, check: 20, shove: 7 },
				Q3s: { bet50: 55, check: 38, shove: 7 },
				Q2s: { bet50: 71, check: 15, shove: 14 },
				'97s': { bet50: 50, check: 45, shove: 5 },
				'98s': { bet50: 17, check: 83, shove: 0 },
				K2s: { bet50: 19, check: 81, shove: 0 },
				A9s: { bet50: 27, check: 73, shove: 0 },
				A8s: { bet50: 2, check: 98, shove: 0 },
				A6s: { bet50: 11, check: 89, shove: 0 },
				A5s: { bet50: 18, check: 82, shove: 0 },
				A4s: { bet50: 12, check: 88, shove: 0 },
				A3s: { bet50: 7, check: 93, shove: 0 },
				A2s: { bet50: 12, check: 88, shove: 0 },
				J3s: { bet50: 19, check: 81, shove: 0 },
				J2s: { bet50: 6, check: 94, shove: 0 },
				K5s: { bet50: 8, check: 92, shove: 0 },
				K4s: { bet50: 1, check: 99, shove: 0 },
				T3s: { bet50: 10, check: 90, shove: 0 },
				T2s: { bet50: 2, check: 98, shove: 0 },
				A9o: { bet50: 13, check: 87, shove: 0 },
				Q9o: { bet50: 20, check: 80, shove: 0 },
				Q8o: { bet50: 16, check: 84, shove: 0 },
				Q7o: { bet50: 11, check: 89, shove: 0 },
				Q6o: { bet50: 11, check: 89, shove: 0 },
				Q5o: { bet50: 38, check: 62, shove: 0 },
				Q4o: { bet50: 33, check: 67, shove: 0 },
				Q3o: { bet50: 36, check: 64, shove: 0 },
				Q2o: { bet50: 30, check: 70, shove: 0 },
				JTo: { bet50: 10, check: 90, shove: 0 },
				'98o': { bet50: 9, check: 91, shove: 0 },
				'97o': { bet50: 9, check: 91, shove: 0 },
				K6o: { bet50: 4, check: 96, shove: 0 },
				K5o: { bet50: 2, check: 98, shove: 0 },
				K4o: { bet50: 3, check: 97, shove: 0 },
				K3o: { bet50: 4, check: 96, shove: 0 },
				K2o: { bet50: 11, check: 89, shove: 0 },
			};

			for (const hand of allHands) {
				const plan = turnBetMap[hand];
				if (!plan) {
					// 90%+ do grid colapsa para cinza (não deram XR no flop)
					combos[hand] = {
						arrived: false,
						arrivalWeight: 0,
						localFreq: 0,
						actions: [],
						isIndifferent: false,
						gradientStyle: 'rgba(15, 23, 42, 0.4)',
					};
					continue;
				}

				const actions: NodeAction[] = [];
				if (plan.bet50 > 0) {
					actions.push({ name: 'Bet 50%', label: 'Bet 7.88bb', pct: plan.bet50, color: '#f97316' });
				}
				if (plan.shove > 0) {
					actions.push({ name: 'Shove', label: 'All-in', pct: plan.shove, color: '#ef4444' });
				}
				if (plan.check > 0) {
					actions.push({ name: 'Check', label: 'Check', pct: plan.check, color: '#4ade80' });
				}

				const localFreq = plan.bet50 + plan.shove;
				combos[hand] = {
					arrived: true,
					arrivalWeight: 0.35,
					localFreq,
					actions,
					isIndifferent: actions.length > 1,
					gradientStyle: computeSplitGradient(actions),
					notes: `${hand} · Indiferença de Nash no Turn: ${plan.bet50}% Bet 50% | ${plan.check}% Check`,
				};
			}

			return {
				nodeId: 'barrel_heavy',
				streetName: 'Turn',
				actor: 'BB',
				potBB: 27.06,
				activeCombosCount: 38,
				globalBar,
				combos,
			};
		}

		if (actionType === 'bluff_polar') {
			// RIVER 3h: BB SHOVE POLARIZADO (Imagem 42)
			const globalBar: NodeAction[] = [
				{ name: 'Check', label: 'Check', pct: 30.7, color: '#4ade80', bgClass: 'bg-emerald-400' },
				{ name: 'Bet 10%', label: 'Bet 6.30bb', pct: 1.1, color: '#fda4af', bgClass: 'bg-rose-300' },
				{ name: 'Bet 25%', label: 'Bet 15.75bb', pct: 22.5, color: '#f97316', bgClass: 'bg-amber-500' },
				{ name: 'Shove', label: 'All-in 24.94bb', pct: 45.8, color: '#ef4444', bgClass: 'bg-red-500' },
			];

			const riverShoveMap: Record<string, { shove: number; bet25: number; check: number }> = {
				AQs: { shove: 28, bet25: 50, check: 22 },
				AQo: { shove: 25, bet25: 50, check: 25 },
				JJ: { shove: 27, bet25: 55, check: 18 },
				TT: { shove: 2, bet25: 0, check: 98 },
				JTs: { shove: 10, bet25: 30, check: 60 },
				Q9s: { shove: 45, bet25: 35, check: 20 },
				Q8s: { shove: 11, bet25: 40, check: 49 },
				Q7s: { shove: 13, bet25: 45, check: 42 },
				Q6s: { shove: 8, bet25: 50, check: 42 },
				Q4s: { shove: 25, bet25: 55, check: 20 },
				Q3s: { shove: 28, bet25: 50, check: 22 },
				Q2s: { shove: 2, bet25: 25, check: 73 },
				A9s: { shove: 6, bet25: 0, check: 94 },
				A5s: { shove: 6, bet25: 0, check: 94 },
				A4s: { shove: 4, bet25: 0, check: 96 },
				A3s: { shove: 5, bet25: 0, check: 95 },
				Q9o: { shove: 16, bet25: 0, check: 84 },
				Q4o: { shove: 10, bet25: 0, check: 90 },
				Q3o: { shove: 17, bet25: 0, check: 83 },
			};

			for (const hand of allHands) {
				const plan = riverShoveMap[hand];
				if (!plan) {
					combos[hand] = {
						arrived: false,
						arrivalWeight: 0,
						localFreq: 0,
						actions: [],
						isIndifferent: false,
						gradientStyle: 'rgba(15, 23, 42, 0.4)',
					};
					continue;
				}

				const actions: NodeAction[] = [];
				if (plan.shove > 0) {
					actions.push({ name: 'Shove', label: 'All-in 24.94bb', pct: plan.shove, color: '#ef4444' });
				}
				if (plan.bet25 > 0) {
					actions.push({ name: 'Bet 25%', label: 'Bet 15.75bb', pct: plan.bet25, color: '#f97316' });
				}
				if (plan.check > 0) {
					actions.push({ name: 'Check', label: 'Check', pct: plan.check, color: '#4ade80' });
				}

				combos[hand] = {
					arrived: true,
					arrivalWeight: 0.18,
					localFreq: plan.shove,
					actions,
					isIndifferent: actions.length > 1,
					gradientStyle: computeSplitGradient(actions),
					notes: `${hand} · Shove Polarizado (River 3h): ${plan.shove}% Shove | ${plan.check}% Check`,
				};
			}

			return {
				nodeId: 'bluff_polar',
				streetName: 'River',
				actor: 'BB',
				potBB: 76.0,
				activeCombosCount: 22,
				globalBar,
				combos,
			};
		}

		if (actionType === 'call_condensed') {
			// RIVER 3h: BTN BLUFF CATCHER VS SHOVE (Imagem 44)
			const globalBar: NodeAction[] = [
				{ name: 'Fold', label: 'Fold', pct: 51.8, color: '#64748b', bgClass: 'bg-slate-500' },
				{ name: 'Call', label: 'Call', pct: 48.2, color: '#4ade80', bgClass: 'bg-emerald-400' },
			];

			const bluffCatchMap: Record<string, number> = {
				AQs: 100, AQo: 100, '33': 100, '22': 100,
				TT: 93, JJ: 82, K2s: 41, K3o: 41, K2o: 41,
				KJs: 28, KTs: 28, KJo: 28, KTo: 28,
				JTs: 9, JTo: 9,
			};

			for (const hand of allHands) {
				const callPct = bluffCatchMap[hand];
				if (callPct === undefined) {
					// 95%+ do grid colapsa para cinza
					combos[hand] = {
						arrived: false,
						arrivalWeight: 0,
						localFreq: 0,
						actions: [],
						isIndifferent: false,
						gradientStyle: 'rgba(15, 23, 42, 0.4)',
					};
					continue;
				}

				const foldPct = 100 - callPct;
				const actions: NodeAction[] = [
					{ name: 'Call', label: 'Call', pct: callPct, color: '#4ade80' },
				];
				if (foldPct > 0) {
					actions.push({ name: 'Fold', label: 'Fold', pct: foldPct, color: '#64748b' });
				}

				combos[hand] = {
					arrived: true,
					arrivalWeight: 0.12,
					localFreq: callPct,
					actions,
					isIndifferent: foldPct > 0,
					gradientStyle: computeSplitGradient(actions),
					notes: `${hand} · Bluff Catcher (Indiferença de Nash): ${callPct}% Call | ${foldPct}% Fold (EV Empatado)`,
				};
			}

			return {
				nodeId: 'call_condensed',
				streetName: 'River',
				actor: 'BTN',
				potBB: 76.0,
				activeCombosCount: 15,
				globalBar,
				combos,
			};
		}
	}

	// ==========================================
	// 2. TEXTURAS GENÉRICAS (DRY, WET, PAIRED, MONOTONE)
	// ==========================================
	const streetNames: Record<TacticalActionType, 'Flop' | 'Turn' | 'River'> = {
		cbet_small: 'Flop',
		check_raise: 'Flop',
		barrel_heavy: 'Turn',
		bluff_polar: 'River',
		call_condensed: 'River',
	};

	const actors: Record<TacticalActionType, 'BTN' | 'BB'> = {
		cbet_small: 'BTN',
		check_raise: 'BB',
		barrel_heavy: 'BB',
		bluff_polar: 'BB',
		call_condensed: 'BTN',
	};

	const pots: Record<TacticalActionType, number> = {
		cbet_small: 7.5,
		check_raise: 18.0,
		barrel_heavy: 28.5,
		bluff_polar: 65.0,
		call_condensed: 42.0,
	};

	let activeCount = 0;
	for (const hand of allHands) {
		const classification = classifyHand(hand);
		const rawP = evaluateTacticalProbability(classification, texture, actionType, solverContext);
		const localFreq = Math.round(rawP * 100);

		const isLikely = rawP > 0.15;
		if (isLikely) activeCount++;

		const primaryColor =
			actionType === 'cbet_small'
				? '#fda4af'
				: actionType === 'check_raise'
					? '#fb7185'
					: actionType === 'barrel_heavy'
						? '#f97316'
						: actionType === 'bluff_polar'
							? '#ef4444'
							: '#4ade80';

		const actions: NodeAction[] = isLikely
			? [
					{ name: 'Ação', label: 'Ação', pct: localFreq, color: primaryColor },
					{ name: 'Passivo', label: 'Passivo', pct: 100 - localFreq, color: '#4ade80' },
				]
			: [];

		combos[hand] = {
			arrived: isLikely,
			arrivalWeight: isLikely ? rawP : 0,
			localFreq: isLikely ? localFreq : 0,
			actions,
			isIndifferent: actions.length > 1,
			gradientStyle: isLikely ? computeSplitGradient(actions) : 'rgba(15, 23, 42, 0.4)',
		};
	}

	return {
		nodeId: actionType,
		streetName: streetNames[actionType],
		actor: actors[actionType],
		potBB: pots[actionType],
		activeCombosCount: activeCount,
		globalBar: [
			{ name: 'Ação', label: 'Ação Primária', pct: 55, color: '#f97316', bgClass: 'bg-amber-500' },
			{ name: 'Passivo', label: 'Check/Call', pct: 45, color: '#4ade80', bgClass: 'bg-emerald-400' },
		],
		combos,
	};
}
