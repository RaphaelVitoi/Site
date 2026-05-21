/**
 * IDENTITY: Motor Algorítmico ICM
 * PATH: src/lib/icmEngine.ts
 * ROLE: Executar o algoritmo clássico de Malmuth-Harville para cálculo de Equidade em Torneios (ICM).
 *       Isolado de React/UI para permitir testes matemáticos puros e máxima performance.
 * BINDING: [src/components/ICMCalculator.tsx] (Alimenta o estado da Interface Visual)
 * TELEOLOGY: Evoluir como motor base para suportar simulações FGS (Future Game Simulation) e cálculos de colisão de ranges baseados em dados massivos (MDA).
 */

export interface ICMPlayer {
  id: string;
  name: string;
  stack: number;
}

export interface ICMResult {
  id: string;
  name: string;
  equity: number;       // Valor financeiro absoluto ($)
  equityPercent: number; // Porcentagem do Prize Pool total (%)
}

/**
 * Calcula a equidade exata (ICM) baseada no Algoritmo de Malmuth-Harville.
 *
 * @param players    Array de jogadores com seus respectivos stacks
 * @param prizes     Array de prêmios distribuídos (do 1º lugar ao N-ésimo)
 * @param totalPool  Prize pool total do torneio (buy-ins líquidos de rake).
 *                   Quando fornecido, equityPercent é calculado sobre o pool
 *                   inteiro — denominador correto para classificação de
 *                   estrutura (TOP-HEAVY / FLAT / HÍBRIDA).
 *                   Quando omitido, usa a soma de prizes (denominador menor,
 *                   adequado apenas para comparação entre jogadores ITM).
 *                   LIMITAÇÃO: omitir totalPool infla equityPercent artificialmente
 *                   porque ignora o valor já perdido por bustouts sem prêmio.
 */
export function calculateMalmuthHarville(
  players: ICMPlayer[],
  prizes: number[],
  totalPool?: number,
): ICMResult[] {
  const numPlayers = players.length;
  const numPrizes = Math.min(prizes.length, numPlayers);
  const totalChips = players.reduce((sum, p) => sum + p.stack, 0);
  const totalPrizePool = prizes.reduce((sum, p) => sum + p, 0);
  const denominatorForPercent = totalPool != null && totalPool > 0 ? totalPool : totalPrizePool;

  const equities = new Array(numPlayers).fill(0);

  // Edge case: Sem fichas na mesa ou sem prêmios
  if (totalChips === 0 || totalPrizePool === 0) {
    return players.map(p => ({
      id: p.id,
      name: p.name,
      equity: 0,
      equityPercent: 0
    }));
  }

  // Função Recursiva Interna para percorrer a árvore de probabilidades
  function calculatePositionalProbabilities(
    currentStacks: number[],
    prizeIndex: number,
    probabilitySoFar: number,
    originalIndices: number[],
    currentTotalChips: number
  ) {
    if (prizeIndex >= numPrizes || currentStacks.length === 0 || currentTotalChips <= 0) return;

    for (let i = 0; i < currentStacks.length; i++) {
      const stack = currentStacks[i];
      if (stack === 0) continue; // Stack zerada não tem chance de ganhar o prêmio atual

      const probWinThisPrize = stack / currentTotalChips;
      const pathProbability = probabilitySoFar * probWinThisPrize;
      const originalIndex = originalIndices[i];

      // Adiciona o valor financeiro ponderado pela probabilidade
      equities[originalIndex] += pathProbability * prizes[prizeIndex];

      // Sub-árvore: Remove este jogador e calcula para o próximo prêmio
      const nextStacks = currentStacks.filter((_, idx) => idx !== i);
      const nextIndices = originalIndices.filter((_, idx) => idx !== i);

      calculatePositionalProbabilities(nextStacks, prizeIndex + 1, pathProbability, nextIndices, currentTotalChips - stack);
    }
  }

  // Inicia a árvore recursiva (buscando o 1º prêmio, probabilidade inicial de 100%)
  calculatePositionalProbabilities(
    players.map(p => p.stack),
    0,
    1,
    players.map((_, i) => i),
    totalChips
  );

  // Formata o resultado de saída
  return players.map((p, i) => ({
    id: p.id,
    name: p.name,
    equity: equities[i],
    equityPercent: (equities[i] / denominatorForPercent) * 100
  }));
}