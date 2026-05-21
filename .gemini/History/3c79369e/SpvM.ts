/**
 * IDENTITY: Motor de Perspectiva Matemática SOTA v4.0 (VITOI - QUANTUM)
 * PATH: src/lib/perspectiva.ts
 * ROLE: Core algorítmico da Equação Unificada SOTA.
 *       PM = [(Equity * R) * Valuation] - [EV_fold(t, dpj, pos) + RIO_mw]
 */

// === TIPOS E INTERFACES ===

export interface MapaICMResult {
  positionProbs: number[][];
  equities: number[];
  totalChips: number;
}

export type StackTier = 'micro' | 'short' | 'mid' | 'big' | 'chipleader';

export interface PerspectivaResult {
  // Layer 1: ICMev (Snapshot)
  currentEquityPct: number;
  deltaWinPct: number;
  deltaLosePct: number;
  deltaFoldPct: number;

  // Layer 2: Esperança (Lógica)
  valuation: number; // Coeficiente de explosão financeira das fichas
  rioLiability: number; // Dívida matemática por multiway/RIO

  // Layer 3: Expectativa (Preditiva)
  fgsHealth: number;
  survivalPressure: number;
  dynamicEvFold: number; // O piso real (pode ser positivo via laddering)

  // Layer 4: Perspectiva (A Síntese Final)
  perspectivaPct: number; // PM Final
  amortizedEdge: number;
  ci: number; // Coeficiente de Insolvência (PM / PotOdds)

  // Metadados
  isActionBetterThanFold: boolean;
  diagnostico: string;
  bountyPower?: number;

  // Detalhes posicionais (M-H)
  currentMapaICM: number[];
  winMapaICM: number[];
  loseMapaICM: number[];
}

export interface PerspectivaInput {
  stacks: number[];
  prizes: number[];
  heroIdx: number;
  villainIdx: number;
  potSize: number;
  heroCost: number;
  winProb: number;
  realizationFactor: number; // R
  edgeBase: number;
  bountyValue?: number; // PKO
  kappa?: number; // Axioma Lipe Piv (Credibilidade da Informacao)

  // Parâmetros Quantum (v4.0)
  numPlayersInPot?: number; // Para RIO_mw
  isNearPayjump?: boolean;  // Para EV_fold positivo
  blindsRisingSoon?: boolean; // Para Erosão de stack

  // Parametros Opcionais de Teoremas
  spr?: number;
  investidoAcumulado?: number;
  blindCost?: number;
}

// === MOTOR ICM (Malmuth-Harville) ===
const _icmCache = new Map<string, MapaICMResult>();

export function calculateMapaICM ( stacks: number[], prizes: number[] ): MapaICMResult {
  const n = stacks.length;

  // SOTA: Fail-Fast Termodinâmico. Aborta a explosão combinatória (O(2^N)) da memoização.
  if ( n > 10 )
  {
    const totalChips = stacks.reduce( ( s, v ) => s + v, 0 );
    const totalPrize = prizes.reduce( ( s, v ) => s + v, 0 );
    const equities = stacks.map( s => totalChips > 0 ? ( s / totalChips ) * totalPrize : 0 );
    const positionProbs = Array.from( { length: n }, () => new Array( Math.min( n, prizes.length ) ).fill( 0 ) );
    if ( totalChips > 0 && prizes.length > 0 ) stacks.forEach( ( s, i ) => positionProbs[ i ][ 0 ] = s / totalChips );
    return { positionProbs, equities, totalChips };
  }

  // SOTA: Normaliza o array de prêmios para o tamanho da mesa
  const activePrizes = prizes.slice( 0, n );
  const k = activePrizes.length;
  const totalChips = stacks.reduce( ( s, v ) => s + v, 0 );
  const key = `${stacks.join( ',' )}|${activePrizes.join( ',' )}`;

  const cachedIcm = _icmCache.get( key );
  if ( cachedIcm ) return cachedIcm;

  const positionProbs: number[][] = Array.from( { length: n }, () => new Array( k ).fill( 0 ) );
  const equities: number[] = new Array( n ).fill( 0 );

  if ( totalChips === 0 || k === 0 ) return { positionProbs, equities, totalChips };

  const memo = new Map<string, { posC: number[][]; eqC: number[] }>();

  function compute ( currStacks: number[], currIndices: number[], posIdx: number, currTotal: number ): { posC: number[][]; eqC: number[] } {
    if ( posIdx >= k || currStacks.length === 0 || currTotal === 0 )
    {
      return { posC: Array.from( { length: n }, () => new Array( k ).fill( 0 ) ), eqC: new Array( n ).fill( 0 ) };
    }

    const stateKey = `${posIdx}:${currIndices.slice().sort( ( a, b ) => a - b ).join( ',' )}`;
    const cachedState = memo.get( stateKey );
    if ( cachedState ) return cachedState;

    const posC: number[][] = Array.from( { length: n }, () => new Array( k ).fill( 0 ) );
    const eqC: number[] = new Array( n ).fill( 0 );

    for ( let i = 0; i < currStacks.length; i++ )
    {
      const stack = currStacks[ i ];
      if ( stack <= 0 ) continue;
      const p = stack / currTotal;
      const origIdx = currIndices[ i ];

      posC[ origIdx ][ posIdx ] += p;
      eqC[ origIdx ] += p * activePrizes[ posIdx ];

      const sub = compute( currStacks.filter( ( _, j ) => j !== i ), currIndices.filter( ( _, j ) => j !== i ), posIdx + 1, currTotal - stack );
      for ( let j = 0; j < n; j++ )
      {
        for ( let pi = posIdx + 1; pi < k; pi++ ) posC[ j ][ pi ] += p * sub.posC[ j ][ pi ];
        eqC[ j ] += p * sub.eqC[ j ];
      }
    }
    const res = { posC, eqC };
    memo.set( stateKey, res );
    return res;
  }

  const resultContrib = compute( stacks, stacks.map( ( _, i ) => i ), 0, totalChips );
  const finalResult = { positionProbs: resultContrib.posC, equities: resultContrib.eqC, totalChips };
  _icmCache.set( key, finalResult );
  return finalResult;
}

export function classifyTier ( stack: number, stacks: number[] ): StackTier {
  const avg = ( stacks.reduce( ( s, v ) => s + v, 0 ) / stacks.length ) || 1;
  const ratio = stack / avg;
  if ( stack <= 0 || ratio < 0.4 ) return 'micro';
  if ( ratio < 0.7 ) return 'short';
  if ( ratio < 1.5 ) return 'mid';
  if ( stacks.every( s => stack >= s ) || ratio >= 2.5 ) return 'chipleader';
  return 'big';
}

// --- HELPERS DE REDUÇÃO DE ENTROPIA COGNITIVA (SOTA V4.0) ---

function _buildSimulatedStacks ( stacks: number[], heroIdx: number, villainIdx: number, potSize: number, heroCost: number ) {
  const stacksWin = stacks.map( ( s, i ) => ( i === heroIdx ? s + potSize : s ) );
  const stacksLose = stacks.map( ( s, i ) => {
    if ( i === heroIdx ) return Math.max( 0, s - heroCost );
    if ( i === villainIdx ) return s + potSize + heroCost;
    return s;
  } );
  const stacksFold = stacks.map( ( s, i ) => {
    if ( i === heroIdx ) return Math.max( 0, s - heroCost );
    if ( i === villainIdx ) return s + potSize;
    return s;
  } );
  return { stacksWin, stacksLose, stacksFold };
}

function _buildDiagnostico ( perspectivaPct: number, rioLiability: number, payjumpBonus: number, edgePenalty: number, investidoAcumulado: number | undefined, stackHero: number, kappa: number ): string {
  let diagnostico = perspectivaPct > 0 ? "Ação Soberana." : "Insolvência de Perspectiva.";
  if ( rioLiability > 1 ) diagnostico += " Alerta: Colapso Multiway.";
  if ( payjumpBonus > 0 ) diagnostico += " Laddering favorece o Fold.";
  if ( edgePenalty < 1 ) diagnostico += " Punição: Restaurando árvore do oponente.";
  if ( investidoAcumulado && investidoAcumulado > ( stackHero * 0.3 ) ) diagnostico += " Alerta: Pot Entrapment Severo.";
  if ( Math.abs( perspectivaPct ) <= 5 && kappa < 0.4 ) diagnostico += " Credibilidade Baixa: Intuição filtrada pelo Baseline Matemático.";
  return diagnostico;
}

// === A EQUAÇÃO UNIFICADA SOTA ===

export function calculatePerspectivaVitoi ( input: PerspectivaInput ): PerspectivaResult {
  const {
    stacks, prizes, heroIdx, villainIdx, potSize, heroCost,
    winProb, realizationFactor, edgeBase,
    bountyValue = 0, numPlayersInPot = 2,
    isNearPayjump = false, blindsRisingSoon = false,
    kappa = 0.5
  } = input;

  const totalPrizes = prizes.reduce( ( s, v ) => s + v, 0 );
  const stackHero = stacks[ heroIdx ];
  const stackVillain = stacks[ villainIdx ];

  // --- 1. Snapshot (ICMev) ---
  const current = calculateMapaICM( stacks, prizes );
  const currentEquityPct = ( current.equities[ heroIdx ] / totalPrizes ) * 100;

  const { stacksWin, stacksLose, stacksFold } = _buildSimulatedStacks( stacks, heroIdx, villainIdx, potSize, heroCost );

  const perspWin = calculateMapaICM( stacksWin, prizes );
  const perspLose = calculateMapaICM( stacksLose, prizes );
  const perspFold = calculateMapaICM( stacksFold, prizes );

  // ΔWin inclui o prêmio do KO (se houver)
  const deltaWinPct = ( ( perspWin.equities[ heroIdx ] / totalPrizes ) * 100 + bountyValue ) - currentEquityPct;
  const deltaLosePct = ( ( perspLose.equities[ heroIdx ] / totalPrizes ) * 100 ) - currentEquityPct;
  const deltaFoldPct = ( ( perspFold.equities[ heroIdx ] / totalPrizes ) * 100 ) - currentEquityPct;

  // --- 2. Lógica (Valuation & RIO) ---
  // Valuation: Explosão financeira (cada ficha ganha vale mais que a perdida?)
  const villainDeltaLoss = current.equities[ villainIdx ] - perspWin.equities[ villainIdx ];
  const rawValuation = villainDeltaLoss > 0 ? deltaWinPct / ( ( villainDeltaLoss / totalPrizes ) * 100 ) : 1;
  const valuation = Math.max( 0.1, Math.min( 2.0, rawValuation ) );

  // RIO_mw: Penalidade exponencial por oponentes extras (Insolvência Multiway)
  // Escalonado pelo tamanho do pote relativo para manter consistência de unidades (% do prize pool)
  const potSizePct = current.totalChips > 0 ? ( potSize / current.totalChips ) * 100 : 0;
  const rioLiability = numPlayersInPot > 2 ? Math.pow( numPlayersInPot - 1, 2 ) * ( potSizePct / 10 ) : 0;

  // --- 3. Expectativa (FGS & Piso Dinâmico) ---
  // Blindagem do Referencial: Se prizes.length <= 1, estamos no vácuo (ChipEV).
  // No vácuo, não existe payjump, erosão ou salto de tier.
  const isVacuum = prizes.length <= 1;

  // Survival Pressure: Mãos até a insolvência (blinds)
  const handsToBust = Math.max( 1, stackHero / 1.5 );
  const survivalPressure = isVacuum ? 0 : Math.min( 1, 1 / handsToBust );

  // FGS Health: No vácuo, a saúde é sempre 1.0 (linear)
  const currentTier = classifyTier( stackHero, stacks );
  const winTier = classifyTier( stacksWin[ heroIdx ], stacksWin );

  const tierBonus = isVacuum || winTier === currentTier ? 0 : 0.15;

  const fgsHealth = isVacuum ? 1 : ( 1 + tierBonus + ( survivalPressure * 0.2 ) );

  // EV_fold(t, dpj, pos): O baseline dinâmico
  // No vácuo, o payjump é impossível e a erosão é ignorada para manter o referencial fixo.
  const payjumpBonus = ( isNearPayjump && !isVacuum ) ? 1.2 : 0;
  const erosionPenalty = ( blindsRisingSoon && !isVacuum ) ? 0.5 : 0;
  const dynamicEvFold = deltaFoldPct + payjumpBonus - erosionPenalty;

  // --- 4. Perspectiva (Síntese Final) ---
  // Amortização de Edge: No pós-flop, usa SPR como proxy de colapso de árvore (Teorema D4)
  const isVillainShort = stackVillain < 12;
  const ratio = stackHero / ( stackVillain || 1 );

  let edgePenalty = 1;
  if ( !isVacuum && isVillainShort && ratio > 3 ) edgePenalty = 0.3;

  const effectiveStackForEdge = input.spr === undefined ? stackHero : Math.max( 2, input.spr * 5 );
  const amortizedEdge = edgeBase * edgePenalty * ( effectiveStackForEdge > 15 ? Math.log10( effectiveStackForEdge ) / Math.log10( 60 ) : 0.4 + ( survivalPressure * 0.2 ) );

  // Axioma Lipe Piv: Regressão Bayesiana da Equidade
  const baselineEquity = heroCost / ( potSize + heroCost );
  const bayesianWinProb = baselineEquity + kappa * ( winProb - baselineEquity );

  // A EQUAÇÃO UNIFICADA: PM = [(Equity * R) * Valuation] - [EV_fold + RIO_mw]
  // Aqui adaptada para os Deltas calculados. Valuation atua apenas sobre o ganho (evitando dupla contagem):
  const expectativaReal = ( bayesianWinProb * deltaWinPct * realizationFactor * valuation * fgsHealth ) + ( ( 1 - bayesianWinProb ) * deltaLosePct );
  const perspectivaPct = ( expectativaReal * amortizedEdge ) - ( dynamicEvFold + rioLiability );

  const potOddsPct = ( potSize / ( potSize + heroCost ) ) * 100;
  const ci = perspectivaPct / ( potOddsPct || 1 );

  // Diagnóstico
  const diagnostico = _buildDiagnostico( perspectivaPct, rioLiability, payjumpBonus, edgePenalty, input.investidoAcumulado, stackHero, kappa );

  return {
    currentEquityPct, deltaWinPct, deltaLosePct, deltaFoldPct,
    valuation, rioLiability,
    fgsHealth, survivalPressure, dynamicEvFold,
    perspectivaPct, amortizedEdge, ci,
    isActionBetterThanFold: perspectivaPct > 0,
    diagnostico,
    currentMapaICM: current.positionProbs[ heroIdx ],
    winMapaICM: perspWin.positionProbs[ heroIdx ],
    loseMapaICM: perspLose.positionProbs[ heroIdx ]
  };
}
