/**
 * IDENTITY: SOTA AI Math Engine (VITOI - QUANTUM)
 * PATH: src/lib/ai-models.ts
 * ROLE: Core algorítmico para GTO, CFR, A* e Teoria dos Sistemas.
 *       Integra a perfeição cibernética com o ecossistema dinâmico.
 */

// --- 1. A* PATHFINDING & GEOMETRIC BET SIZING ---

export interface GeometricPathNode {
	street: 'Flop' | 'Turn' | 'River';
	potSize: number;
	betSize: number;
	betPct: number;
	remainingStack: number;
}

/**
 * Calcula o caminho geométrico ideal (A*) para comprometer o stack até o River.
 * f = ((P + 2S) / P)^(1/n) - 1
 *
 * @param currentPot Pote atual
 * @param effectiveStack Stack efetivo
 * @param streetsRemaining Número de streets (n)
 */
export function calculateGeometricSizing(
	currentPot: number,
	effectiveStack: number,
	streetsRemaining: number,
): number {
	if (currentPot <= 0 || streetsRemaining <= 0) return 0;

	// Fórmula Geometria do Pote: f = ((P + 2S)/P)^(1/n) - 1
	// Onde f é a fração do pote a ser apostada em cada street para chegar ao all-in exato no river.
	const base = (currentPot + 2 * effectiveStack) / currentPot;
	const f = Math.pow(base, 1 / streetsRemaining) - 1;

	return f;
}

export function generateGeometricPath(
	pot: number,
	stack: number,
	streets: number,
): GeometricPathNode[] {
	const f = calculateGeometricSizing(pot, stack, streets);
	const path: GeometricPathNode[] = [];
	let currentPot = pot;
	let currentStack = stack;

	let streetNames: ('Flop' | 'Turn' | 'River')[];
	if (streets >= 3) {
		streetNames = ['Flop', 'Turn', 'River'];
	} else if (streets === 2) {
		streetNames = ['Turn', 'River'];
	} else {
		streetNames = ['River'];
	}

	for (let i = 0; i < streets; i++) {
		const bet = currentPot * f;
		const actualBet = Math.min(bet, currentStack);
		const streetName = streetNames[i] ?? 'River';

		path.push({
			street: streetName,
			potSize: currentPot,
			betSize: actualBet,
			betPct: f * 100,
			remainingStack: currentStack - actualBet,
		});

		currentPot += 2 * actualBet;
		currentStack -= actualBet;
	}

	return path;
}

// --- 2. COUNTERFACTUAL REGRET MINIMIZATION (CFR) ---

export interface CfrAction {
	action: string;
	regret: number;
	strategy: number; // Porcentagem convergente
}

/**
 * Mock iterativo de Regret Matching para simular convergência GTO.
 * Em um cenário real, isso rodaria milhões de vezes.
 * Aqui, simulamos a "dor" de cada decisão para gerar a Mixed Strategy.
 */
export function simulateCfrRegretMatching(evs: Record<string, number>): CfrAction[] {
	const actions = Object.keys(evs);
	const regrets: Record<string, number> = {};
	actions.forEach((a) => (regrets[a] = 0));

	// Algoritmo simplificado: Regret Matching
	// O arrependimento de uma ação é (EV da ação - EV médio da estratégia atual)
	// Aqui usamos um modelo de convergência estocástica
	const totalRegret = actions.reduce((sum, a) => sum + Math.max(0, evs[a] ?? 0), 0);

	return actions.map((a) => {
		const ev = evs[a] ?? 0;
		const strategy = totalRegret > 0 ? Math.max(0, ev) / totalRegret : 1 / actions.length;
		return {
			action: a,
			regret: Math.max(0, ev * 1.5), // Escala do "Arrependimento"
			strategy: strategy * 100,
		};
	});
}

// --- 3. RECURSIVE BAYESIAN UPDATING ---

/**
 * Atualiza a crença sobre o range do oponente (Posterior) com base na ação tomada.
 * P(Value|Bet) = P(Bet|Value) * P(Value) / P(Bet)
 */
export function calculateBayesianUpdate(
	priorValueProb: number, // Crença inicial de que ele tem Valor (ex: 0.3)
	actionLikelihoodValue: number, // P(Ação|Valor) - Quão provável ele faz isso com valor
	actionLikelihoodBluff: number, // P(Ação|Blefe) - Quão provável ele faz isso com blefe
): number {
	const priorBluffProb = 1 - priorValueProb;

	// Probabilidade total da ação: P(Ação) = P(Ação|Valor)P(Valor) + P(Ação|Blefe)P(Blefe)
	const totalActionProb =
		actionLikelihoodValue * priorValueProb + actionLikelihoodBluff * priorBluffProb;

	if (totalActionProb === 0) return priorValueProb;

	// Teorema de Bayes
	const posteriorValueProb = (actionLikelihoodValue * priorValueProb) / totalActionProb;

	return posteriorValueProb;
}

// --- 4. RANDOM FOREST ARCHETYPES (HEURÍSTICO) ---

export type VillainArchetype = 'Nit' | 'Tag' | 'Lag' | 'Whale' | 'GTO-Bot';

/**
 * Classifica o oponente em um arquétipo usando lógica de árvore de decisão.
 */
export function classifyVillainRandomForest(
	vpip: number,
	pfr: number,
	agg: number,
	sizingTrend: 'small' | 'polarized' | 'linear',
): VillainArchetype {
	// Árvore 1: Frequência
	if (vpip < 15) return 'Nit';
	if (vpip > 40) return 'Whale';

	// Árvore 2: Agressividade
	if (pfr / vpip < 0.5) return 'Whale'; // Passivo

	// Árvore 3: Sizing
	if (sizingTrend === 'polarized' && agg > 3) return 'GTO-Bot';
	if (vpip > 25 && agg > 2.5) return 'Lag';

	return 'Tag';
}
