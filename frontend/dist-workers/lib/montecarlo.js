/**
 * IDENTITY: Motor Monte Carlo ICM (Aproximação Estocástica O(N))
 * ROLE: Substitui a explosão combinatória O(2^N) do Malmuth-Harville
 *       para fields grandes (N > 10), permitindo simulações de MTT.
 * FONTE: Adaptado de algoritmos Open Source (poker-mtt-icm / poker-apprentice).
 */
function pickWinner(numPlayers, stacks, availablePlayers, isBusted, remainingTotalChips) {
    const r = Math.random() * remainingTotalChips;
    let cumulative = 0;
    for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
        const isActive = isBusted
            ? !isBusted[playerIdx]
            : (availablePlayers & (1 << playerIdx)) !== 0;
        if (isActive) {
            cumulative += stacks[playerIdx] || 0;
            if (r <= cumulative)
                return playerIdx;
        }
    }
    for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
        const isActive = isBusted
            ? !isBusted[playerIdx]
            : (availablePlayers & (1 << playerIdx)) !== 0;
        if (isActive)
            return playerIdx;
    }
    return -1;
}
function runSingleMonteCarloIteration(numPlayers, stacks, activePrizes, totalChips, totalEquity) {
    let remainingTotalChips = totalChips;
    let availablePlayers = (1 << numPlayers) - 1; // Bitmask (funciona rápido até 31 jogadores)
    // Se N > 30, usamos array de booleans (fallback de segurança)
    const isBusted = numPlayers > 30 ? new Array(numPlayers).fill(false) : null;
    for (const prize of activePrizes) {
        if (remainingTotalChips <= 0)
            break;
        const winnerIdx = pickWinner(numPlayers, stacks, availablePlayers, isBusted, remainingTotalChips);
        // Distribui o prêmio e remove o jogador da pool
        if (winnerIdx !== -1) {
            totalEquity[winnerIdx] = (totalEquity[winnerIdx] ?? 0) + (prize || 0);
            remainingTotalChips -= stacks[winnerIdx] || 0;
            if (numPlayers > 30 && isBusted) {
                isBusted[winnerIdx] = true;
            }
            else {
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
export function calculateIcmMonteCarlo(stacks, prizes, config = {}) {
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
    for (let i = 0; i < iterations; i++) {
        runSingleMonteCarloIteration(numPlayers, stacks, activePrizes, totalChips, totalEquity);
    }
    // Tira a média
    return totalEquity.map((e) => e / iterations);
}
