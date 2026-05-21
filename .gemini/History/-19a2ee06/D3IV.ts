/**
 * IDENTITY: Motor de Perspectiva e Esperanca Matematica
 * PATH: src/lib/perspectiva.ts
 * ROLE: Calcular a matriz de probabilidades posicionais (Perspectiva) e o ganho
 *       esperado em equity de torneio de uma acao especifica (Esperanca).
 *       Estende o ICM EV puro ao capturar externalidades: como ganhar/perder um pot
 *       redistribui a equity de TODOS os jogadores, nao apenas do hero.
 * BINDING: [lib/icmEngine.ts, panels/PerspectivePanel.tsx]
 * THEORY: Framework original de Raphael Vitoi (2026).
 *         - Expectativa: referencial decisorio dentro do cenario
 *         - Perspectiva: distribuicao de probabilidade sobre outcomes (1o, 2o, ..., No)
 *         - Esperanca: ganho esperado em Perspectiva de uma acao especifica
 */

// === TIPOS ===

/** Resultado completo da Perspectiva: probabilidades posicionais + equities */
export interface PerspectiveResult {
  /** positionProbs[i][j] = P(jogador i terminar na posicao j) */
  positionProbs: number[][];
  /** Equity ICM de cada jogador (em unidades de premio, nao %) */
  equities: number[];
  /** Total de fichas na mesa */
  totalChips: number;
}

/** Classificacao de tier baseada em stack relativo a media */
export type StackTier = 'micro' | 'short' | 'mid' | 'big' | 'chipleader';

/** Resultado da analise de Esperanca para uma decisao especifica */
export interface EsperancaResult {
  // Estado atual
  currentEquity: number;
  currentEquityPct: number;
  currentPerspectiva: number[];
  currentTier: StackTier;

  // Se ganhar
  winEquity: number;
  winEquityPct: number;
  winPerspectiva: number[];
  winTier: StackTier;
  deltaWin: number;
  deltaWinPct: number;

  // Se perder
  loseEquity: number;
  loseEquityPct: number;
  losePerspectiva: number[];
  loseTier: StackTier;
  deltaLose: number;
  deltaLosePct: number;

  // Esperanca: P(win) x deltaWin + P(lose) x deltaLose
  esperanca: number;
  esperancaPct: number;

  // ICM EV simples do pot (para comparacao)
  potIcmEv: number;
  potIcmEvPct: number;

  // Externalidade: esperanca - potIcmEv
  externality: number;
  externalityPct: number;

  // Tier shift
  tierShift: boolean;
  tierDirection: 'up' | 'down' | 'none';

  // Contexto
  heroName: string;
  villainName: string;
}

// === PERSPECTIVA (Malmuth-Harville com matriz posicional) ===

/**
 * Calcula a matriz completa de probabilidades posicionais via Malmuth-Harville.
 * Retorna P(jogador i terminar na posicao j) para todos i, j.
 *
 * Complexidade: O(N! / (N-K)!) onde N = jogadores, K = premios.
 * Seguro ate ~8 jogadores. Acima disso, considerar aproximacao.
 */
export function calculatePerspectiva(
  stacks: number[],
  prizes: number[],
): PerspectiveResult {
  const n = stacks.length;
  const k = Math.min(prizes.length, n);
  const totalChips = stacks.reduce((s, v) => s + v, 0);

  // positionProbs[player][position] = probabilidade acumulada
  const positionProbs: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  const equities: number[] = new Array(n).fill(0);

  if (totalChips === 0) {
    return { positionProbs, equities, totalChips };
  }

  // Recursao M-H com rastreamento de posicao
  function recurse(
    currentStacks: number[],
    originalIndices: number[],
    posIndex: number,
    probSoFar: number,
  ) {
    if (posIndex >= k || currentStacks.length === 0) return;

    const currentTotal = currentStacks.reduce((s, v) => s + v, 0);
    if (currentTotal === 0) return;

    for (let i = 0; i < currentStacks.length; i++) {
      const stack = currentStacks[i];
      if (stack === 0) continue;

      const prob = probSoFar * (stack / currentTotal);
      const origIdx = originalIndices[i];

      // Registrar probabilidade posicional
      positionProbs[origIdx][posIndex] += prob;
      equities[origIdx] += prob * prizes[posIndex];

      // Subarvore: remover jogador e continuar
      const nextStacks = currentStacks.filter((_, idx) => idx !== i);
      const nextIndices = originalIndices.filter((_, idx) => idx !== i);
      recurse(nextStacks, nextIndices, posIndex + 1, prob);
    }
  }

  recurse(stacks, stacks.map((_, i) => i), 0, 1);

  return { positionProbs, equities, totalChips };
}

// === TIER CLASSIFICATION ===

export function classifyTier(stack: number, stacks: number[]): StackTier {
  const avg = stacks.reduce((s, v) => s + v, 0) / stacks.length;
  if (avg === 0) return 'mid';

  const ratio = stack / avg;
  const isLargest = stacks.every(s => stack >= s);

  if (stack === 0) return 'micro';
  if (ratio < 0.4) return 'micro';
  if (ratio < 0.7) return 'short';
  if (ratio < 1.5) return 'mid';
  if (isLargest || ratio >= 2.5) return 'chipleader';
  return 'big';
}

export const TIER_LABELS: Record<StackTier, string> = {
  micro: 'Micro',
  short: 'Short',
  mid: 'Mid',
  big: 'Big',
  chipleader: 'Chip Leader',
};

export const TIER_COLORS: Record<StackTier, string> = {
  micro: '#ff0055',
  short: '#f43f5e',
  mid: '#f59e0b',
  big: '#10b981',
  chipleader: '#6366f1',
};

// === ESPERANCA ===

export interface EsperancaParams {
  stacks: number[];
  prizes: number[];
  names: string[];
  heroIdx: number;
  villainIdx: number;
  potSize: number;
  heroCost: number;
  winProb: number;
}

/**
 * Calcula a Esperanca Matematica de uma decisao (call/raise/fold).
 *
 * @param stacks      Stacks atuais de todos os jogadores
 * @param prizes      Estrutura de premios
 * @param names       Nomes dos jogadores
 * @param heroIdx     Indice do hero no array
 * @param villainIdx  Indice do villain no array
 * @param potSize     Tamanho do pot atual (total, incluindo contribuicao de ambos)
 * @param heroCost    Quanto o hero arrisca (custo do call/raise)
 * @param winProb     Probabilidade do hero ganhar (0-1)
 */
export function calculateEsperanca(
  stacks: number[],
  prizes: number[],
  names: string[],
  heroIdx: number,
  villainIdx: number,
  potSize: number,
  heroCost: number,
  winProb: number,
): EsperancaResult {
export function calculateEsperanca(params: EsperancaParams): EsperancaResult {
  const { stacks, prizes, names, heroIdx, villainIdx, potSize, heroCost, winProb } = params;
  const totalPrizes = prizes.reduce((s, v) => s + v, 0);

  // 1. Estado atual
  const current = calculatePerspectiva(stacks, prizes);
  const currentEquity = current.equities[heroIdx];
  const currentEquityPct = totalPrizes > 0 ? (currentEquity / totalPrizes) * 100 : 0;
  const currentTier = classifyTier(stacks[heroIdx], stacks);

  // 2. Cenario: hero ganha
  const stacksWin = [...stacks];
  stacksWin[heroIdx] += potSize - heroCost; // hero ganha o pot (menos o que ja investiu se heroCost = contribuicao propria)
  stacksWin[villainIdx] = Math.max(0, stacksWin[villainIdx] - (potSize - heroCost));
  // Correcao: o pot ja contem fichas de ambos. O hero ganha 'potSize' total.
  // Mas heroCost e o que ele AINDA precisa colocar. Entao:
  // heroStack_new = heroStack - heroCost + potSize (ganhou tudo)
  // villainStack_new = villainStack (villain ja investiu, so perde o que ja colocou)
  // Simplificacao: assumir que 'heroCost' e o call pendente, pot ja tem as apostas anteriores
  const stacksWinClean = [...stacks];
  stacksWinClean[heroIdx] = stacks[heroIdx] - heroCost + potSize;
  stacksWinClean[villainIdx] = Math.max(0, stacks[villainIdx]); // villain perde o que ja investiu (ja esta no pot)

  // Na verdade, a modelagem mais limpa: stacks sao ANTES da decisao.
  // potSize = pot total formado. heroCost = quanto hero precisa pagar para continuar.
  // Se hero call e ganha: hero.stack = hero.stack - heroCost + potSize + heroCost = hero.stack + potSize
  // Wait no. Let me think again.
  // Before decision: hero has stacks[heroIdx], villain has stacks[villainIdx]
  // Pot already has potSize chips from prior streets.
  // Hero must pay heroCost to call.
  // If hero wins: hero gets potSize + heroCost back, net = hero.stack - heroCost + potSize + heroCost = hero.stack + potSize
  // Wait, pot already has contributions. Let me model it simply:
  // Hero's effective stack change if win: +(potSize - heroCost) [gains pot minus what he paid]
  // Hero's effective stack change if lose: -heroCost [loses his call]
  // Villain's change if hero wins: -(potSize - existing_villain_contribution). But we don't know villain's contribution separately.
  // SIMPLEST MODEL: potSize is the total pot INCLUDING heroCost.
  // If hero wins: hero gains (potSize - heroCost). hero_new = hero_old + (potSize - heroCost). Actually no...
  // OK let me just use the clean model:
  // heroCost = amount hero needs to call
  // potSize = pot BEFORE hero's call (what's already in the middle)
  // If hero calls and wins: hero gets potSize + heroCost back. Net gain = potSize. hero_new = hero_old - heroCost + potSize + heroCost = hero_old + potSize
  // If hero calls and loses: hero loses heroCost. hero_new = hero_old - heroCost.
  // Villain: when hero wins, villain doesn't lose more (already invested). villain_new = villain_old.
  // But wait - this doesn't account for WHERE the pot chips came from. They came from both players' stacks on prior streets.
  // Actually: the stacks array should represent CURRENT stacks (after prior bets were placed). The pot is separate money.
  // So: stacks[hero] = hero's remaining chips AFTER prior bets. stacks[villain] = villain's remaining.
  // potSize = chips in the middle from both.
  // heroCost = additional amount hero must pay (the call).
  // If hero calls and wins: hero_new = hero_old - heroCost + potSize + heroCost = hero_old + potSize
  // If hero calls and loses: hero_new = hero_old - heroCost
  // Villain stays the same in both cases (already committed).
  // Other players: unchanged.
  // PROBLEM: this means total chips on table changes? No - potSize came from hero+villain's original stacks.
  // The issue is that stacks[] might represent original stacks (before the hand). In that case we need to know how much each invested.
  // FOR SIMPLICITY in V1: stacks = remaining stacks after bets. potSize = total pot. heroCost = call amount.

  const winStacks = stacks.map((s, i) => {
    if (i === heroIdx) return s - heroCost + potSize + heroCost; // wins everything
    return s;
  });
  // Actually simpler: hero_win = hero - heroCost + (potSize + heroCost) = hero + potSize
  // No wait. potSize is what's already in the pot. heroCost is what hero adds. Total pot after call = potSize + heroCost. Hero wins it all.
  // hero_new = hero_old - heroCost + (potSize + heroCost) = hero_old + potSize

  const loseStacks = stacks.map((s, i) => {
    if (i === heroIdx) return Math.max(0, s - heroCost);
    if (i === villainIdx) return s + potSize + heroCost; // villain wins the whole pot including hero's call
    return s;
  });
  // Wait: if hero loses, villain gets potSize + heroCost.
  // villain_new = villain_old + potSize + heroCost? No - villain already has villain_old which is his remaining stack. The pot contains villain's prior bets too. When villain wins, he gets the pot back.
  // Actually: the pot contains contributions from both. If villain wins, villain gets the whole pot = potSize + heroCost.
  // villain_new = villain_old + potSize + heroCost? That double counts villain's own contributions.

  // OK, let me use the CLEANEST possible model:
  // stacks[i] = chips each player has RIGHT NOW (not counting what's in the pot)
  // potSize = total pot from all sources
  // heroCost = amount hero must add to continue
  //
  // If hero calls and wins:
  //   hero_new = stacks[hero] - heroCost + potSize + heroCost = stacks[hero] + potSize
  //   everyone else unchanged
  //
  // If hero calls and loses:
  //   hero_new = stacks[hero] - heroCost
  //   villain_new = stacks[villain] + potSize + heroCost (villain wins everything in pot + hero's call)
  //   everyone else unchanged

  const stacksAfterWin = stacks.map((s, i) => {
    if (i === heroIdx) return s + potSize; // hero wins pot
    return s;
  });

  const stacksAfterLose = stacks.map((s, i) => {
    if (i === heroIdx) return Math.max(0, s - heroCost); // hero loses call
    if (i === villainIdx) return s + potSize + heroCost; // villain wins pot + hero's call
    return s;
  });

  const perspWin = calculatePerspectiva(stacksAfterWin, prizes);
  const perspLose = calculatePerspectiva(stacksAfterLose, prizes);

  const winEquity = perspWin.equities[heroIdx];
  const loseEquity = perspLose.equities[heroIdx];
  const winEquityPct = totalPrizes > 0 ? (winEquity / totalPrizes) * 100 : 0;
  const loseEquityPct = totalPrizes > 0 ? (loseEquity / totalPrizes) * 100 : 0;

  const deltaWin = winEquity - currentEquity;
  const deltaLose = loseEquity - currentEquity;
  const deltaWinPct = winEquityPct - currentEquityPct;
  const deltaLosePct = loseEquityPct - currentEquityPct;

  const esperanca = winProb * deltaWin + (1 - winProb) * deltaLose;
  const esperancaPct = winProb * deltaWinPct + (1 - winProb) * deltaLosePct;

  // ICM EV simples do pot: valor ICM dos chips ganhos/perdidos (sem externalidades)
  // = P(win) × ICM_value_of_chips_gained - P(lose) × ICM_value_of_chips_lost
  // Aproximacao: usar chip% como proxy do valor (linear)
  const chipValuePerUnit = totalPrizes / current.totalChips;
  const potIcmEv = winProb * potSize * chipValuePerUnit - (1 - winProb) * heroCost * chipValuePerUnit;
  const potIcmEvPct = totalPrizes > 0 ? (potIcmEv / totalPrizes) * 100 : 0;

  const externality = esperanca - potIcmEv;
  const externalityPct = esperancaPct - potIcmEvPct;

  const winTier = classifyTier(stacksAfterWin[heroIdx], stacksAfterWin);
  const loseTier = classifyTier(stacksAfterLose[heroIdx], stacksAfterLose);

  const tierShift = winTier !== currentTier;
  const tierOrdinal: Record<StackTier, number> = { micro: 0, short: 1, mid: 2, big: 3, chipleader: 4 };
  const tierDirection: 'up' | 'down' | 'none' =
    tierOrdinal[winTier] > tierOrdinal[currentTier] ? 'up'
    : tierOrdinal[winTier] < tierOrdinal[currentTier] ? 'down'
    : 'none';
  let tierDirection: 'up' | 'down' | 'none' = 'none';
  if (tierOrdinal[winTier] > tierOrdinal[currentTier]) {
    tierDirection = 'up';
  } else if (tierOrdinal[winTier] < tierOrdinal[currentTier]) {
    tierDirection = 'down';
  }

  return {
    currentEquity,
    currentEquityPct,
    currentPerspectiva: current.positionProbs[heroIdx],
    currentTier,

    winEquity,
    winEquityPct,
    winPerspectiva: perspWin.positionProbs[heroIdx],
    winTier,
    deltaWin,
    deltaWinPct,

    loseEquity,
    loseEquityPct,
    losePerspectiva: perspLose.positionProbs[heroIdx],
    loseTier,
    deltaLose,
    deltaLosePct,

    esperanca,
    esperancaPct,

    potIcmEv,
    potIcmEvPct,

    externality,
    externalityPct,

    tierShift,
    tierDirection,

    heroName: names[heroIdx] ?? `Jogador ${heroIdx + 1}`,
    villainName: names[villainIdx] ?? `Jogador ${villainIdx + 1}`,
  };
}

/**
 * Calcula Esperanca de FOLD (para comparacao com call).
 * No fold, hero mantem stack atual. Pot vai para villain.
 */
export function calculateEsperancaFold(
  stacks: number[],
  prizes: number[],
  names: string[],
  heroIdx: number,
  villainIdx: number,
  potSize: number,
): Pick<EsperancaResult, 'esperanca' | 'esperancaPct' | 'winEquity' | 'winEquityPct'> {
  const totalPrizes = prizes.reduce((s, v) => s + v, 0);

  // Fold: hero mantem stack, villain leva pot
  const stacksAfterFold = stacks.map((s, i) => {
    if (i === villainIdx) return s + potSize;
    return s;
  });

  const perspFold = calculatePerspectiva(stacksAfterFold, prizes);
  const foldEquity = perspFold.equities[heroIdx];
  const foldEquityPct = totalPrizes > 0 ? (foldEquity / totalPrizes) * 100 : 0;

  const current = calculatePerspectiva(stacks, prizes);
  const currentEquity = current.equities[heroIdx];
  const currentEquityPct = totalPrizes > 0 ? (currentEquity / totalPrizes) * 100 : 0;

  return {
    esperanca: foldEquity - currentEquity,
    esperancaPct: foldEquityPct - currentEquityPct,
    winEquity: foldEquity,
    winEquityPct: foldEquityPct,
  };
}
