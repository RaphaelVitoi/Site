import { calculateMapaICM } from './perspectiva';

/**
 * IDENTITY: Motor AlgorÃ­tmico ICM
 * PATH: src/lib/icmEngine.ts
 * ROLE: Executar o algoritmo clÃ¡ssico de Malmuth-Harville para cÃ¡lculo de Equidade em Torneios (ICM).
 *       Isolado de React/UI para permitir testes matemÃ¡ticos puros e mÃ¡xima performance.
 * BINDING: [src/components/ICMCalculator.tsx] (Alimenta o estado da Interface Visual)
 * TELEOLOGY: Evoluir como motor base para suportar simulaÃ§Ãµes FGS (Future Game Simulation) e cÃ¡lculos de colisÃ£o de ranges baseados em dados massivos (MDA).
 */

export interface ICMPlayer {
	id: string;
	name: string;
	stack: number;
}

export interface ICMResult {
	id: string;
	name: string;
	equity: number; // Valor financeiro absoluto ($)
	equityPercent: number; // Porcentagem do Prize Pool total (%)
	winProb: number; // Probabilidade de 1Âº lugar (0-1)
}

/**
 * Calcula a equidade exata (ICM) baseada no Algoritmo de Malmuth-Harville.
 * [SOTA v7.0 GOLD]: Delegado para o motor ultra-otimizado O(2^N) do `perspectiva.ts`
 * para garantir Economia de Shannon e evitar a explosao combinatoria O(N!).
 */
export function calculateMalmuthHarville(
	players: ICMPlayer[],
	prizes: number[],
	totalPool?: number,
): ICMResult[] {
	const totalPrizePool = prizes.reduce((sum, p) => sum + p, 0);
	const denominatorForPercent = totalPool != null && totalPool > 0 ? totalPool : totalPrizePool;

	// Edge case: Sem fichas ou sem premios
	if (players.length === 0 || totalPrizePool === 0) {
		return players.map((p) => ({
			id: p.id,
			name: p.name,
			equity: 0,
			equityPercent: 0,
			winProb: 0,
		}));
	}

	// SOTA: Barreira TermodinÃ¢mica (Fail-Fast) contra Starvation de CPU e OOM.
	// Para N > 10, o motor reverte graciosamente para ChipEV, garantindo FricÃ§Ã£o Zero na UI.
	if (players.length > 10) {
		// Nota: O valor de N (players.length) deve representar o nÃºmero de jogadores na mesa.
		// Se N for inesperadamente alto (ex: 3013 como visto em logs), isso pode indicar um problema
		// na fonte de dados que popula o array 'players' ou um uso indevido da funÃ§Ã£o para cenÃ¡rios
		// que nÃ£o sejam de mesa final de torneio. A funÃ§Ã£o deliberadamente reverte para ChipEV neste caso.
		console.warn(
			`[ICM Engine] N=${players.length} excede o limite termodinÃ¢mico seguro. Revertendo para ChipEV.`,
		);
		const totalChips = players.reduce((sum, p) => sum + p.stack, 0);
		return players.map((p) => {
			const chipPct = totalChips > 0 ? p.stack / totalChips : 0;
			const eq = chipPct * totalPrizePool;
			return {
				id: p.id,
				name: p.name,
				equity: eq,
				equityPercent: denominatorForPercent > 0 ? (eq / denominatorForPercent) * 100 : 0,
				winProb: chipPct, // Em ChipEV, a probabilidade de cravada Ã© estritamente proporcional ao stack
			};
		});
	}

	// SOTA: Extrai os stacks e repassa para a engine ultra-rapida c/ memoizacao
	const stacks = players.map((p) => p.stack);
	const mapaResult = calculateMapaICM(stacks, prizes);

	// Formata o resultado de saida com as equities calculadas via memoizacao
	return players.map((p, i) => {
		const eq = mapaResult.equities[i] || 0;
		const winP = mapaResult.positionProbs[i]?.[0] ?? 0;
		return {
			id: p.id,
			name: p.name,
			equity: eq,
			equityPercent: denominatorForPercent > 0 ? (eq / denominatorForPercent) * 100 : 0,
			winProb: winP,
		};
	});
}

