/**
 * IDENTITY: Motor Monte Carlo ICM (Aproximação Estocástica O(N))
 * ROLE: Substitui a explosão combinatória O(2^N) do Malmuth-Harville
 *       para fields grandes (N > 10), permitindo simulações de MTT.
 * FONTE: Adaptado de algoritmos Open Source (poker-mtt-icm / poker-apprentice).
 */

export interface MonteCarloConfig {
	iterations?: number;
}

function pickWinnerWithBusted(
	numPlayers: number,
	stacks: number[],
	isBusted: Uint8Array,
	r: number,
): number {
	let cumulative = 0;
	let lastActiveIdx = -1;
	for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
		if (isBusted[playerIdx] === 0) {
			lastActiveIdx = playerIdx;
			cumulative += stacks[playerIdx] || 0;
			if (r <= cumulative) return playerIdx;
		}
	}
	return lastActiveIdx;
}

function pickWinnerWithMask(
	numPlayers: number,
	stacks: number[],
	availablePlayers: number,
	r: number,
): number {
	let cumulative = 0;
	let lastActiveIdx = -1;
	for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
		if ((availablePlayers & (1 << playerIdx)) !== 0) {
			lastActiveIdx = playerIdx;
			cumulative += stacks[playerIdx] || 0;
			if (r <= cumulative) return playerIdx;
		}
	}
	return lastActiveIdx;
}

function pickWinner(
	numPlayers: number,
	stacks: number[],
	availablePlayers: number,
	isBusted: Uint8Array | null,
	remainingTotalChips: number,
): number {
	const r = Math.random() * remainingTotalChips;
	if (isBusted) {
		return pickWinnerWithBusted(numPlayers, stacks, isBusted, r);
	}
	return pickWinnerWithMask(numPlayers, stacks, availablePlayers, r);
}


function runSingleMonteCarloIteration(
	numPlayers: number,
	stacks: number[],
	activePrizes: number[],
	totalChips: number,
	totalEquity: number[],
	isBusted: Uint8Array | null,
) {
	let remainingTotalChips = totalChips;
	let availablePlayers = (1 << numPlayers) - 1; // Bitmask (funciona rápido até 31 jogadores)

	if (isBusted) {
		isBusted.fill(0);
	}

	for (const prize of activePrizes) {
		if (remainingTotalChips <= 0) break;

		const winnerIdx = pickWinner(
			numPlayers,
			stacks,
			availablePlayers,
			isBusted,
			remainingTotalChips,
		);

		// Distribui o prêmio e remove o jogador da pool
		if (winnerIdx !== -1) {
			totalEquity[winnerIdx] = (totalEquity[winnerIdx] ?? 0) + (prize || 0);
			remainingTotalChips -= stacks[winnerIdx] || 0;

			if (isBusted) {
				isBusted[winnerIdx] = 1;
			} else {
				availablePlayers &= ~(1 << winnerIdx); // Limpa o bit
			}
		}
	}
}

/**
 * Calcula o ICM usando o método de Monte Carlo (Random Walk).
 * Sorteia o 1º colocado baseado na proporção de fichas.
 * Remove o vencedor, recalcula as proporções, sorteia o 2º, e assim por diante.
 *
 * @param stacks Array com os stacks dos jogadores
 * @param prizes Array com a estrutura de premiação
 * @param config Configurações de iteração (default: 10000 para velocidade web)
 * @returns Array de Equities monetárias para cada jogador
 */
export function calculateIcmMonteCarlo(
	stacks: number[],
	prizes: number[],
	config: MonteCarloConfig = {},
): number[] {
	const iterations = config.iterations || 10000;
	const numPlayers = stacks.length;

	// Se há mais prêmios que jogadores, trunca os prêmios
	const activePrizes = prizes.slice(0, numPlayers);
	const totalEquity = new Array(numPlayers).fill(0);

	// Se todos os stacks são 0, ou não há prêmios
	const totalChips = stacks.reduce((a, b) => a + b, 0);
	if (totalChips <= 0 || activePrizes.length === 0) {
		return totalEquity;
	}

	// Aloca o buffer de segurança apenas uma vez se N > 30
	const isBusted = numPlayers > 30 ? new Uint8Array(numPlayers) : null;

	for (let i = 0; i < iterations; i++) {
		runSingleMonteCarloIteration(numPlayers, stacks, activePrizes, totalChips, totalEquity, isBusted);
	}

	// Tira a média
	return totalEquity.map((e) => e / iterations);
}
