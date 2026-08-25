/**
 * IDENTITY: SOTA Combinatorial Dead Card & Blocker Engine (v7.0 GOLD)
 * PATH: src/lib/deadCardFilter.ts
 * ROLE: Resolvedor O(1) de Blockers e Remoção Estocástica de Cartas Mortas
 *       sobre o espaço amostral completo de 1.326 combos de Texas Hold'em.
 */

export const RANKS = '23456789TJQKA' as const;
export const SUITS = ['s', 'h', 'd', 'c'] as const;

export interface CardObject {
	rankChar: string;
	suitChar: string;
	rankIdx: number;
	suitIdx: number;
	cardIdx: number; // 0..51
	bitmask: bigint; // 1n << cardIdx
}

export interface BlockerSummary {
	deadCards: CardObject[];
	deadMask: bigint;
	totalLiveCombos: number; // Max 1326
	totalBlockedCombos: number;
	blockagePercentage: number; // [0, 100]
	handClassDetails: Record<string, { total: number; live: number; liveCombos: string[] }>;
}

/**
 * Converte string de carta (ex: "Ah", "Kd", "2s") em CardObject normalizado
 */
export function parseCard(token: string): CardObject | null {
	const clean = token.trim();
	if (clean.length !== 2) return null;

	const rChar = clean[0]?.toUpperCase() ?? '';
	const sChar = clean[1]?.toLowerCase() ?? '';

	const rankIdx = RANKS.indexOf(rChar as (typeof RANKS)[number]);
	const suitIdx = SUITS.indexOf(sChar as (typeof SUITS)[number]);

	if (rankIdx === -1 || suitIdx === -1) return null;

	const cardIdx = (rankIdx << 2) | suitIdx;
	const bitmask = BigInt(1) << BigInt(cardIdx);

	return {
		rankChar: rChar,
		suitChar: sChar,
		rankIdx,
		suitIdx,
		cardIdx,
		bitmask,
	};
}

/**
 * Converte string do board (ex: "Ah Kd 2s", "AhKd2s", "Ah,Kd,2s") em bitmask O(1) de 64 bits
 */
export function parseBoardToMask(boardStr: string): { cards: CardObject[]; mask: bigint } {
	if (!boardStr || typeof boardStr !== 'string') {
		return { cards: [], mask: BigInt(0) };
	}

	// Normaliza separadores e chunks de 2 caracteres
	const cleaned = boardStr.replaceAll(/[^2-9tjqkahdcs]/gi, '');
	const cards: CardObject[] = [];
	let mask = BigInt(0);

	for (let i = 0; i < cleaned.length - 1; i += 2) {
		const token = cleaned.slice(i, i + 2);
		const card = parseCard(token);
		if (card && (mask & card.bitmask) === BigInt(0)) {
			cards.push(card);
			mask |= card.bitmask;
		}
	}

	return { cards, mask };
}

function determineHandClass(card1: CardObject, card2: CardObject): string {
	if (card1.rankIdx === card2.rankIdx) {
		return `${card1.rankChar}${card2.rankChar}`;
	}
	const [high, low] = card1.rankIdx > card2.rankIdx ? [card1, card2] : [card2, card1];
	const suited = card1.suitIdx === card2.suitIdx;
	return `${high.rankChar}${low.rankChar}${suited ? 's' : 'o'}`;
}

function buildAllCards(): CardObject[] {
	const allCards: CardObject[] = [];
	for (const rChar of RANKS) {
		for (const sChar of SUITS) {
			const card = parseCard(`${rChar}${sChar}`);
			if (card) allCards.push(card);
		}
	}
	return allCards;
}

/**
 * Gera todos os 1.326 combos iniciais mapeados para seus pares de CardObject
 */
export function generateAll1326Combos(): Array<{ handClass: string; c1: CardObject; c2: CardObject; comboStr: string }> {
	const allCards = buildAllCards();
	const combos: Array<{ handClass: string; c1: CardObject; c2: CardObject; comboStr: string }> = [];

	for (let i = 1; i < allCards.length; i++) {
		const card1 = allCards[i];
		if (!card1) continue;

		for (let j = 0; j < i; j++) {
			const card2 = allCards[j];
			if (!card2) continue;

			combos.push({
				handClass: determineHandClass(card1, card2),
				c1: card1,
				c2: card2,
				comboStr: `${card1.rankChar}${card1.suitChar}${card2.rankChar}${card2.suitChar}`,
			});
		}
	}

	return combos;
}

const ALL_1326_COMBOS = generateAll1326Combos();

/**
 * Calcula em O(1) bitwise a redução combinatória de todas as 169 classes contra o board
 */
export function computeBlockerSummary(boardStr: string): BlockerSummary {
	const { cards: deadCards, mask: deadMask } = parseBoardToMask(boardStr);

	let totalLiveCombos = 0;
	let totalBlockedCombos = 0;
	const handClassDetails: Record<string, { total: number; live: number; liveCombos: string[] }> = {};

	for (const combo of ALL_1326_COMBOS) {
		const isBlocked = (deadMask & combo.c1.bitmask) !== BigInt(0) || (deadMask & combo.c2.bitmask) !== BigInt(0);

		handClassDetails[combo.handClass] ??= {
			total: 0,
			live: 0,
			liveCombos: [],
		};

		const detail = handClassDetails[combo.handClass];
		if (detail) {
			detail.total += 1;
			if (!isBlocked) {
				detail.live += 1;
				detail.liveCombos.push(combo.comboStr);
				totalLiveCombos += 1;
			} else {
				totalBlockedCombos += 1;
			}
		}
	}

	const blockagePercentage = Number(((totalBlockedCombos / 1326) * 100).toFixed(1));

	return {
		deadCards,
		deadMask,
		totalLiveCombos,
		totalBlockedCombos,
		blockagePercentage,
		handClassDetails,
	};
}

/**
 * Retorna os combos vivos e a proporção de remoção de uma mão específica
 */
export function getLiveCombosForHand(handClass: string, boardStr: string): { total: number; live: number; ratio: number } {
	const summary = computeBlockerSummary(boardStr);
	const detail = summary.handClassDetails[handClass];
	if (!detail || detail.total === 0) {
		return { total: 0, live: 0, ratio: 0 };
	}
	return {
		total: detail.total,
		live: detail.live,
		ratio: Number((detail.live / detail.total).toFixed(2)),
	};
}
