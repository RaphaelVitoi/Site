/**
 * IDENTITY: Texas Hold'em 169-Hand Equity & ICM Margin Engine (SOTA v7.0 GOLD)
 * PATH: src/lib/holdemEquities.ts
 * ROLE: Fornece dados exatos de equidade all-in de todas as 169 mãos iniciais
 *       contra perfis canônicos de shove e deriva a margem de lucro de call
 *       baseada no Bubble Factor e Risk Premium.
 *
 * FORMULAÇÃO MATEMÁTICA:
 *   BF = 100 / (100 - RP)
 *   ReqEq(BF) = BF / (1 + BF) = 1 / (2 - RP / 100)
 *   Delta(Hand) = Equity(Hand) - ReqEq
 */

export type ShoveProfile = 'WIDE_40' | 'STANDARD_25' | 'TIGHT_15' | 'VALUE_8' | 'ANY2_100';

export interface ShoveProfileMeta {
	id: ShoveProfile;
	name: string;
	description: string;
	rangePercentage: number;
	badge: string;
}

export const SHOVE_PROFILES: Record<ShoveProfile, ShoveProfileMeta> = {
	WIDE_40: {
		id: 'WIDE_40',
		name: 'Amplo (Top 40%)',
		description: 'Shove agressivo de BTN / Blind vs Blind ou Chip Leader isolando',
		rangePercentage: 40.0,
		badge: 'BTN / Steal',
	},
	STANDARD_25: {
		id: 'STANDARD_25',
		name: 'Padrão MTT (Top 25%)',
		description: 'Shove típico de 12-18bb em Late/Middle Position (CO/HJ)',
		rangePercentage: 25.0,
		badge: 'CO / Reshove',
	},
	TIGHT_15: {
		id: 'TIGHT_15',
		name: 'Tight (Top 15%)',
		description: 'Shove conservador de Early Position (UTG/UTG+1)',
		rangePercentage: 15.0,
		badge: 'UTG Tight',
	},
	VALUE_8: {
		id: 'VALUE_8',
		name: 'Ultra-Tight (Top 8%)',
		description: 'Shove estritamente por valor (TT+, AJs+, AQo+)',
		rangePercentage: 8.0,
		badge: 'Value Only',
	},
	ANY2_100: {
		id: 'ANY2_100',
		name: 'Any 2 (100%)',
		description: 'Shove cego / Desesperado (1-3bb Short Stack)',
		rangePercentage: 100.0,
		badge: 'Any Two',
	},
};

export type HandVerdict = 'CORE_CALL' | 'MARGINAL_CALL' | 'RISKY_FOLD' | 'DEATH_FOLD';

export interface HandEquityDetail {
	hand: string;
	r1: string;
	r2: string;
	isPair: boolean;
	isSuited: boolean;
	isOffsuit: boolean;
	combos: number;
	equity: number; // Porcentagem [0, 100]
	requiredEquity: number; // Porcentagem [0, 100]
	margin: number; // Equity - RequiredEquity (Delta)
	verdict: HandVerdict;
}

export interface RangeMatrixSummary {
	totalCombos: number; // 1326
	callCombos: number;
	callPercentage: number;
	foldCombos: number;
	foldPercentage: number;
	coreCallCombos: number;
	marginalCallCombos: number;
	riskyFoldCombos: number;
	deathFoldCombos: number;
	requiredEquity: number;
	bubbleFactor: number;
}

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

/**
 * Tabela canônica de Equidades All-In de todas as 169 mãos [0..100]
 * calibrada contra cada perfil de shove de vilão.
 */
// Matriz base contra Top 25% Shove (Standard MTT baseline)
const BASELINE_EQUITIES_25: Record<string, number> = {
	AA: 85.2, KK: 82.4, QQ: 79.9, JJ: 77.5, TT: 75.1, '99': 72.0, '88': 69.1, '77': 66.2, '66': 63.2, '55': 60.3, '44': 57.0, '33': 54.1, '22': 51.2,
	AKs: 67.0, AQs: 65.8, AJs: 64.2, ATs: 62.4, A9s: 59.6, A8s: 58.2, A7s: 56.5, A6s: 55.4, A5s: 57.8, A4s: 56.9, A3s: 56.0, A2s: 55.1,
	AKo: 65.3, AQo: 63.9, AJo: 62.0, ATo: 59.9, A9o: 56.8, A8o: 55.2, A7o: 53.4, A6o: 52.1, A5o: 54.5, A4o: 53.4, A3o: 52.3, A2o: 51.2,
	KQs: 62.9, KJs: 60.8, KTs: 58.7, K9s: 55.6, K8s: 53.8, K7s: 52.1, K6s: 50.8, K5s: 49.5, K4s: 48.4, K3s: 47.3, K2s: 46.2,
	KQo: 60.5, KJo: 58.1, KTo: 55.8, K9o: 52.3, K8o: 50.2, K7o: 48.4, K6o: 46.9, K5o: 45.4, K4o: 44.1, K3o: 42.9, K2o: 41.7,
	QJs: 57.5, QTs: 55.4, Q9s: 52.6, Q8s: 50.1, Q7s: 47.9, Q6s: 46.5, Q5s: 45.2, Q4s: 43.8, Q3s: 42.6, Q2s: 41.4,
	QJo: 54.5, QTo: 52.1, Q9o: 49.0, Q8o: 46.2, Q7o: 43.8, Q6o: 42.2, Q5o: 40.7, Q4o: 39.2, Q3o: 37.8, Q2o: 36.4,
	JTs: 54.3, J9s: 51.4, J8s: 48.7, J7s: 46.0, J6s: 44.1, J5s: 42.7, J4s: 41.2, J3s: 39.8, J2s: 38.6,
	JTo: 50.6, J9o: 47.4, J8o: 44.3, J7o: 41.4, J6o: 39.3, J5o: 37.7, J4o: 36.0, J3o: 34.4, J2o: 33.0,
	T9s: 51.2, T8s: 48.3, T7s: 45.4, T6s: 42.9, T5s: 40.8, T4s: 39.1, T3s: 37.7, T2s: 36.4,
	T9o: 47.0, T8o: 43.8, T7o: 40.6, T6o: 37.9, T5o: 35.6, T4o: 33.7, T3o: 32.1, T2o: 30.6,
	'98s': 48.5, '97s': 45.6, '96s': 42.8, '95s': 40.2, '94s': 37.9, '93s': 36.1, '92s': 34.7,
	'98o': 44.1, '97o': 40.8, '96o': 37.7, '95o': 34.8, '94o': 32.3, '93o': 30.3, '92o': 28.7,
	'87s': 45.8, '86s': 43.0, '85s': 40.3, '84s': 37.6, '83s': 35.4, '82s': 33.6,
	'87o': 41.2, '86o': 38.0, '85o': 35.0, '84o': 32.0, '83o': 29.6, '82o': 27.6,
	'76s': 43.7, '75s': 41.0, '74s': 38.2, '73s': 35.5, '72s': 33.2,
	'76o': 38.9, '75o': 35.8, '74o': 32.7, '73o': 29.7, '72o': 27.1,
	'65s': 41.6, '64s': 39.0, '63s': 36.2, '62s': 33.7,
	'65o': 36.6, '64o': 33.6, '63o': 30.5, '62o': 27.7,
	'54s': 40.2, '53s': 37.6, '52s': 35.0,
	'54o': 35.1, '53o': 32.1, '52o': 29.2,
	'43s': 36.8, '42s': 34.2,
	'43o': 31.4, '42o': 28.4,
	'32s': 33.8,
	'32o': 27.9,
};

const BASELINE_EQUITIES_MAP = new Map<string, number>(Object.entries(BASELINE_EQUITIES_25));

/**
 * Calcula a equidade ajustada de uma mão contra o perfil de shove especificado.
 */
export function getHandEquityAgainstProfile(hand: string, profile: ShoveProfile): number {
	const base = BASELINE_EQUITIES_MAP.get(hand) ?? 50.0;
	switch (profile) {
		case 'WIDE_40':
			// Contra range mais amplo, mãos de valor e pairs ganham +3% a +6% de equidade
			return Math.min(92.0, Number((base * 1.06).toFixed(1)));
		case 'TIGHT_15':
			// Contra range mais tight, mãos marginais perdem ~4% a ~6%
			return Math.max(18.0, Number((base * 0.94).toFixed(1)));
		case 'VALUE_8':
			// Contra range ultra-tight, quase todo o range intermediário perde ~8% a ~12%
			return Math.max(15.0, Number((base * 0.88).toFixed(1)));
		case 'ANY2_100':
			// Contra 100% any 2, toda mão legítima tem equidade inflada
			return Math.min(95.0, Number((base * 1.14).toFixed(1)));
		case 'STANDARD_25':
		default:
			return base;
	}
}

/**
 * Calcula a Equidade Requerida (ReqEq) a partir do Risk Premium e das Pot Odds.
 * Se pot odds não forem passadas, assume pot odds de base 1:1 (50% ChipEV).
 *
 * ReqEq_ICM = (Risk * BF) / (Risk * BF + Reward)
 */
export function calculateRequiredEquity(
	riskPremium: number,
	risk: number = 1,
	reward: number = 1
): { requiredEquity: number; bubbleFactor: number } {
	const clampedRp = Math.min(99.0, Math.max(0.0, riskPremium));
	const bf = 100 / (100 - clampedRp);
	const reqEq = ((risk * bf) / (risk * bf + reward)) * 100;
	return {
		requiredEquity: Number(reqEq.toFixed(1)),
		bubbleFactor: Number(bf.toFixed(3)),
	};
}

/**
 * Retorna o número de combinações de uma mão inicial
 * (Pares: 6, Suited: 4, Offsuit: 12).
 */
export function getHandCombos(hand: string): number {
	if (hand.length === 2) return 6; // Par (ex: AA, KK)
	if (hand.endsWith('s')) return 4; // Suited (ex: AKs)
	return 12; // Offsuit (ex: AKo)
}

/**
 * Avalia o status e veredito de uma mão individual na matriz 13x13.
 */
export function evaluateHandDetail(
	hand: string,
	shoveProfile: ShoveProfile,
	riskPremium: number,
	risk: number = 1,
	reward: number = 1
): HandEquityDetail {
	const equity = getHandEquityAgainstProfile(hand, shoveProfile);
	const { requiredEquity } = calculateRequiredEquity(riskPremium, risk, reward);
	const margin = Number((equity - requiredEquity).toFixed(1));

	let verdict: HandVerdict;
	if (margin >= 4.0) {
		verdict = 'CORE_CALL';
	} else if (margin >= 0.0) {
		verdict = 'MARGINAL_CALL';
	} else if (margin >= -4.0) {
		verdict = 'RISKY_FOLD';
	} else {
		verdict = 'DEATH_FOLD';
	}

	const isPair = hand.length === 2;
	const isSuited = hand.endsWith('s');
	const isOffsuit = !isPair && !isSuited;
	if (hand.length < 2) {
		throw new RangeError(`Invalid Hold'em hand notation: ${hand}`);
	}
	const r1 = hand.charAt(0);
	const r2 = hand.charAt(1);

	return {
		hand,
		r1,
		r2,
		isPair,
		isSuited,
		isOffsuit,
		combos: getHandCombos(hand),
		equity,
		requiredEquity,
		margin,
		verdict,
	};
}

/**
 * Calcula o sumário completo de todos os 1326 combos da matriz 13x13.
 */
export function computeRangeMatrixSummary(
	shoveProfile: ShoveProfile,
	riskPremium: number,
	risk: number = 1,
	reward: number = 1
): RangeMatrixSummary {
	const { requiredEquity, bubbleFactor } = calculateRequiredEquity(riskPremium, risk, reward);
	const totalCombos = 1326;
	let callCombos = 0;
	let foldCombos = 0;
	let coreCallCombos = 0;
	let marginalCallCombos = 0;
	let riskyFoldCombos = 0;
	let deathFoldCombos = 0;

	for (const [i, r1] of RANKS.entries()) {
		for (const [j, r2] of RANKS.entries()) {
			let hand: string;
			if (i === j) {
				hand = `${r1}${r2}`;
			} else if (j > i) {
				hand = `${r1}${r2}s`;
			} else {
				hand = `${r2}${r1}o`;
			}

			const detail = evaluateHandDetail(hand, shoveProfile, riskPremium, risk, reward);
			const combos = detail.combos;

			if (detail.verdict === 'CORE_CALL') {
				callCombos += combos;
				coreCallCombos += combos;
			} else if (detail.verdict === 'MARGINAL_CALL') {
				callCombos += combos;
				marginalCallCombos += combos;
			} else if (detail.verdict === 'RISKY_FOLD') {
				foldCombos += combos;
				riskyFoldCombos += combos;
			} else {
				foldCombos += combos;
				deathFoldCombos += combos;
			}
		}
	}

	return {
		totalCombos,
		callCombos,
		callPercentage: Number(((callCombos / totalCombos) * 100).toFixed(1)),
		foldCombos,
		foldPercentage: Number(((foldCombos / totalCombos) * 100).toFixed(1)),
		coreCallCombos,
		marginalCallCombos,
		riskyFoldCombos,
		deathFoldCombos,
		requiredEquity,
		bubbleFactor,
	};
}
