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
 * @param players Array de jogadores com seus respectivos stacks
 * @param prizes Array de prêmios (do 1º lugar ao N-ésimo)
 * @returns Array de resultados com as equidades calculadas
 */
export function calculateMalmuthHarville(players: ICMPlayer[], prizes: number[]): ICMResult[] {
  const numPlayers = players.length;
  const numPrizes = Math.min(prizes.length, numPlayers);
  const totalChips = players.reduce((sum, p) => sum + p.stack, 0);
  const totalPrizePool = prizes.reduce((sum, p) => sum + p, 0);

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
    originalIndices: number[]
  ) {
    if (prizeIndex >= numPrizes || currentStacks.length === 0) return;

    const currentTotalChips = currentStacks.reduce((sum, s) => sum + s, 0);
    if (currentTotalChips === 0) return;

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

      calculatePositionalProbabilities(nextStacks, prizeIndex + 1, pathProbability, nextIndices);
    }
  }

  // Inicia a árvore recursiva (buscando o 1º prêmio, probabilidade inicial de 100%)
  calculatePositionalProbabilities(
    players.map(p => p.stack),
    0,
    1,
    players.map((_, i) => i)
  );

  // Formata o resultado de saída
  return players.map((p, i) => ({
    id: p.id,
    name: p.name,
    equity: equities[i],
    equityPercent: (equities[i] / totalPrizePool) * 100
  }));
}