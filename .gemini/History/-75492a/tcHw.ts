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
export function calculatePerspectiva (
  stacks: number[],
  prizes: number[],
): PerspectiveResult {
  const n = stacks.length;
  const k = Math.min( prizes.length, n );
  const totalChips = stacks.reduce( ( s, v ) => s + v, 0 );

  // positionProbs[player][position] = probabilidade acumulada
  const positionProbs: number[][] = Array.from( { length: n }, () => new Array( k ).fill( 0 ) );
  const equities: number[] = new Array( n ).fill( 0 );

  if ( totalChips === 0 )
  {
    return { positionProbs, equities, totalChips };
  }

  // Recursao M-H com rastreamento de posicao
  function recurse (
    currentStacks: number[],
    originalIndices: number[],
    posIndex: number,
    probSoFar: number,
  ) {
    if ( posIndex >= k || currentStacks.length === 0 ) return;

    const currentTotal = currentStacks.reduce( ( s, v ) => s + v, 0 );
    if ( currentTotal === 0 ) return;

    for ( let i = 0; i < currentStacks.length; i++ )
    {
      const stack = currentStacks[ i ];
      if ( stack === 0 ) continue;

      const prob = probSoFar * ( stack / currentTotal );
      const origIdx = originalIndices[ i ];

      // Registrar probabilidade posicional
      positionProbs[ origIdx ][ posIndex ] += prob;
      equities[ origIdx ] += prob * prizes[ posIndex ];

      // Subarvore: remover jogador e continuar
      const nextStacks = currentStacks.filter( ( _, idx ) => idx !== i );
      const nextIndices = originalIndices.filter( ( _, idx ) => idx !== i );
      recurse( nextStacks, nextIndices, posIndex + 1, prob );
    }
  }

  recurse( stacks, stacks.map( ( _, i ) => i ), 0, 1 );

  return { positionProbs, equities, totalChips };
}

// === TIER CLASSIFICATION ===

export function classifyTier ( stack: number, stacks: number[] ): StackTier {
  const avg = stacks.reduce( ( s, v ) => s + v, 0 ) / stacks.length;
  if ( avg === 0 ) return 'mid';

  const ratio = stack / avg;
  const isLargest = stacks.every( s => stack >= s );

  if ( stack === 0 ) return 'micro';
  if ( ratio < 0.4 ) return 'micro';
  if ( ratio < 0.7 ) return 'short';
  if ( ratio < 1.5 ) return 'mid';
  if ( isLargest || ratio >= 2.5 ) return 'chipleader';
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

/** Parâmetros para o cálculo de Esperança */
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
 * @param params      Objeto contendo os parâmetros do cenário
 */
export function calculateEsperanca ( params: EsperancaParams ): EsperancaResult {
  const { stacks, prizes, names, heroIdx, villainIdx, potSize, heroCost, winProb } = params;
  const totalPrizes = prizes.reduce( ( s, v ) => s + v, 0 );

  // 1. Estado atual
  const current = calculatePerspectiva( stacks, prizes );
  const currentEquity = current.equities[ heroIdx ];
  const currentEquityPct = totalPrizes > 0 ? ( currentEquity / totalPrizes ) * 100 : 0;
  const currentTier = classifyTier( stacks[ heroIdx ], stacks );

  // 2. Cenario: hero ganha
  const stacksWin = [ ...stacks ];
  stacksWin[ heroIdx ] += potSize - heroCost; // hero ganha o pot (menos o que ja investiu se heroCost = contribuicao propria)
  stacksWin[ villainIdx ] = Math.max( 0, stacksWin[ villainIdx ] - ( potSize - heroCost ) );

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

  const stacksAfterWin = stacks.map( ( s, i ) => {
    if ( i === heroIdx ) return s + potSize; // hero wins pot
    return s;
  } );

  const stacksAfterLose = stacks.map( ( s, i ) => {
    if ( i === heroIdx ) return Math.max( 0, s - heroCost ); // hero loses call
    if ( i === villainIdx ) return s + potSize + heroCost; // villain wins pot + hero's call
    return s;
  } );

  const perspWin = calculatePerspectiva( stacksAfterWin, prizes );
  const perspLose = calculatePerspectiva( stacksAfterLose, prizes );

  const winEquity = perspWin.equities[ heroIdx ];
  const loseEquity = perspLose.equities[ heroIdx ];
  const winEquityPct = totalPrizes > 0 ? ( winEquity / totalPrizes ) * 100 : 0;
  const loseEquityPct = totalPrizes > 0 ? ( loseEquity / totalPrizes ) * 100 : 0;

  const deltaWin = winEquity - currentEquity;
  const deltaLose = loseEquity - currentEquity;
  const deltaWinPct = winEquityPct - currentEquityPct;
  const deltaLosePct = loseEquityPct - currentEquityPct;

  const esperanca = winProb * deltaWin + ( 1 - winProb ) * deltaLose;
  const esperancaPct = winProb * deltaWinPct + ( 1 - winProb ) * deltaLosePct;

  // ICM EV simples do pot: valor ICM dos chips ganhos/perdidos (sem externalidades)
  // = P(win) × ICM_value_of_chips_gained - P(lose) × ICM_value_of_chips_lost
  // Aproximacao: usar chip% como proxy do valor (linear)
  const chipValuePerUnit = totalPrizes / current.totalChips;
  const potIcmEv = winProb * potSize * chipValuePerUnit - ( 1 - winProb ) * heroCost * chipValuePerUnit;
  const potIcmEvPct = totalPrizes > 0 ? ( potIcmEv / totalPrizes ) * 100 : 0;

  const externality = esperanca - potIcmEv;
  const externalityPct = esperancaPct - potIcmEvPct;

  const winTier = classifyTier( stacksAfterWin[ heroIdx ], stacksAfterWin );
  const loseTier = classifyTier( stacksAfterLose[ heroIdx ], stacksAfterLose );

  const tierShift = winTier !== currentTier;
  const tierOrdinal: Record<StackTier, number> = { micro: 0, short: 1, mid: 2, big: 3, chipleader: 4 };

  let tierDirection: 'up' | 'down' | 'none';
  if ( tierOrdinal[ winTier ] > tierOrdinal[ currentTier ] )
  {
    tierDirection = 'up';
  } else if ( tierOrdinal[ winTier ] < tierOrdinal[ currentTier ] )
  {
    tierDirection = 'down';
  } else
  {
    tierDirection = 'none';
  }

  return {
    currentEquity,
    currentEquityPct,
    currentPerspectiva: current.positionProbs[ heroIdx ],
    currentTier,

    winEquity,
    winEquityPct,
    winPerspectiva: perspWin.positionProbs[ heroIdx ],
    winTier,
    deltaWin,
    deltaWinPct,

    loseEquity,
    loseEquityPct,
    losePerspectiva: perspLose.positionProbs[ heroIdx ],
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

    heroName: names[ heroIdx ] ?? `Jogador ${heroIdx + 1}`,
    villainName: names[ villainIdx ] ?? `Jogador ${villainIdx + 1}`,
  };
}

/**
 * Calcula Esperanca de FOLD (para comparacao com call).
 * No fold, hero mantem stack atual. Pot vai para villain.
 */
export function calculateEsperancaFold (
  stacks: number[],
  prizes: number[],
  names: string[],
  heroIdx: number,
  villainIdx: number,
  potSize: number,
): Pick<EsperancaResult, 'esperanca' | 'esperancaPct' | 'winEquity' | 'winEquityPct'> {
  const totalPrizes = prizes.reduce( ( s, v ) => s + v, 0 );

  // Fold: hero mantem stack, villain leva pot
  const stacksAfterFold = stacks.map( ( s, i ) => {
    if ( i === villainIdx ) return s + potSize;
    return s;
  } );

  const perspFold = calculatePerspectiva( stacksAfterFold, prizes );
  const foldEquity = perspFold.equities[ heroIdx ];
  const foldEquityPct = totalPrizes > 0 ? ( foldEquity / totalPrizes ) * 100 : 0;

  const current = calculatePerspectiva( stacks, prizes );
  const currentEquity = current.equities[ heroIdx ];
  const currentEquityPct = totalPrizes > 0 ? ( currentEquity / totalPrizes ) * 100 : 0;

  return {
    esperanca: foldEquity - currentEquity,
    esperancaPct: foldEquityPct - currentEquityPct,
    winEquity: foldEquity,
    winEquityPct: foldEquityPct,
  };
}
