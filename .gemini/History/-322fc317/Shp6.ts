/**
 * IDENTITY: Derivador de Risk Premium via Bubble Factor (Perspectiva)
 * PATH: src/lib/rpDeriver.ts
 * ROLE: Conectar o motor ICM (Perspectiva/M-H) ao motor pos-flop (nashSolver).
 */

import { calculateMapaICM } from './perspectiva';

const RP_MIN = 0;
const RP_MAX = 60;
export const BF_THRESHOLD = 1.01;
export const RP_CEILING_THRESHOLD = 24;

export interface RpDerivationResult {
  ipRp: number;
  oopRp: number;
  deltaRp: number;
  allRps: number[];
  allBfs: number[];
  isCeilingReached: boolean;
  recommendedSizing: 'small' | 'medium' | 'large' | 'check';
  riskAdvantage: number;
  adjustedIpRp: number;
  adjustedOopRp: number;
}

function applyMdaAdjustment ( theoreticalRp: number, cred: number, gap: number ): number {
  const adjustment = theoreticalRp * ( gap * cred );
  return Math.max( 0, theoreticalRp - adjustment );
}

function deriveRecommendedSizing ( riskAdvantage: number, spr: number ): 'small' | 'medium' | 'large' | 'check' {
  if ( riskAdvantage > 8 ) return 'small';
  if ( spr < 2 ) return 'medium';
  if ( riskAdvantage < -5 ) return 'check';
  return 'medium';
}

function bfToRp ( bf: number ): number {
  if ( bf <= 1 ) return RP_MIN;
  const rp = 100 * ( bf - 1 ) / bf;
  return Math.max( RP_MIN, Math.min( RP_MAX, rp ) );
}

export function deriveRps (
  stacks: number[],
  prizes: number[],
  ipIndex: number,
  oopIndex: number,
  bountyValue = 0,
): RpDerivationResult | null {
  if ( stacks.length < 2 ) throw new Error( 'deriveRps: necessario ao menos 2 jogadores.' );

  const ipIdx = ipIndex;
  const oopIdx = oopIndex;
  const effStack = Math.min( stacks[ ipIdx ], stacks[ oopIdx ] );

  if ( effStack <= 0 )
  {
    return {
      ipRp: 0, oopRp: 0, deltaRp: 0,
      allRps: stacks.map( () => 0 ),
      allBfs: stacks.map( () => 1 ),
      isCeilingReached: false,
      riskAdvantage: 0,
      recommendedSizing: 'medium',
      adjustedIpRp: 0,
      adjustedOopRp: 0
    };
  }

  const EPS = 0.001;
  const totalPrizes = prizes.reduce( ( s, v ) => s + v, 0 );
  const baseline = calculateMapaICM( stacks, prizes );

  const stacksIpWin = stacks.map( ( s, i ) => {
    if ( i === ipIdx ) return s + effStack;
    if ( i === oopIdx ) return Math.max( EPS, s - effStack );
    return s;
  } );

  const stacksOopWin = stacks.map( ( s, i ) => {
    if ( i === oopIdx ) return s + effStack;
    if ( i === ipIdx ) return Math.max( EPS, s - effStack );
    return s;
  } );

  const perspIpWin = calculateMapaICM( stacksIpWin, prizes );
  const perspOopWin = calculateMapaICM( stacksOopWin, prizes );

  const allBfs: number[] = stacks.map( ( _, i ) => {
    if ( i === ipIdx )
    {
      // Diferença financeira real (ICM)
      const gain = ( perspIpWin.equities[ i ] - baseline.equities[ i ] ) + ( bountyValue * totalPrizes / 100 );
      const loss = baseline.equities[ i ] - perspOopWin.equities[ i ];
      // BF = Custo da Derrota / Benefício da Vitória
      return gain > 0 ? loss / gain : 1;
    }
    if ( i === oopIdx )
    {
      const gain = ( perspOopWin.equities[ i ] - baseline.equities[ i ] ) + ( bountyValue * totalPrizes / 100 );
      const loss = baseline.equities[ i ] - perspIpWin.equities[ i ];
      return gain > 0 ? loss / gain : 1;
    }
    return 1;
  } );

  const allRps = allBfs.map( bf => bfToRp( bf ) );
  const ipRp = allRps[ ipIdx ];
  const oopRp = allRps[ oopIdx ];
  const deltaRp = ipRp - oopRp;
  const isCeilingReached = ipRp >= RP_CEILING_THRESHOLD || oopRp >= RP_CEILING_THRESHOLD;
  const riskAdvantage = oopRp - ipRp;
  const sprProxy = stacks[ ipIdx ] / ( effStack * 2 || 1 );
  const recommendedSizing = deriveRecommendedSizing( riskAdvantage, sprProxy );

  return {
    ipRp,
    oopRp,
    deltaRp,
    allRps,
    allBfs,
    isCeilingReached,
    recommendedSizing,
    riskAdvantage,
    adjustedIpRp: ipRp,
    adjustedOopRp: oopRp
  };
}

export type Street = 'flop' | 'turn' | 'river';

export interface StreetState {
  street: Street;
  potAcumuladoHero: number;
  potTotal: number;
  heroIsIp: boolean;
  bountyValue?: number;
  futureRpInfluence?: number;
  numPlayers?: number; // D6: jogadores no pot (HU=2, MW=3+)
}

export interface PostFlopResult extends RpDerivationResult {
  evFoldStreet: number;
  sprRemanescente: number;
  rStreet: number;
  stackHeroRemanescente: number;
  // D6: Componentes PM por street
  rioMwStreet: number;        // RIO multiway por street (O(N²) × pot_acumulado)
  valuationStreet: number;    // ICM valuation dinâmica (gain/loss ratio)
  pmStreet: number;           // Perspectiva Matemática por street
  ciStreet: number;           // Coeficiente de Insolvência por street
  potEntrapmentRatio: number; // Razão EV_fold / stack_hero (severidade do aprisionamento)
}

/**
 * D6: Fator de Realização por street.
 * River = binário (showdown). Flop/Turn = f(posição).
 * IP tem vantagem de realização em todas as streets.
 */
function computeRStreet ( street: Street, heroIsIp: boolean, spr: number ): number {
  if ( street === 'river' ) return 1; // Showdown: R binário (1 ou 0), modelado como 1 para cálculo de PM esperado
  // SPR baixo colapsa árvore — R converge para 1 (menos decisões = menos perda de realização)
  const sprFactor = Math.min( 1, 0.7 + ( 0.3 * Math.min( spr, 10 ) / 10 ) );
  const posBonus = heroIsIp ? 1 : 0.85;
  // Flop tem mais incerteza que turn
  const streetDiscount = street === 'flop' ? 0.92 : 0.96;
  return Math.min( 1, posBonus * streetDiscount * sprFactor );
}

/**
 * D6 + D2: RIO multiway em Fichas Absolutas.
 * p_d estimado em 0.15 (frequência de domínio por oponente — D2).
 */
function computeRioMwStreetChips ( numPlayers: number, potTotal: number ): number {
  if ( numPlayers <= 2 ) return 0; // HU: sem RIO multiway massivo
  const p_d = 0.15; // Frequência de domínio por oponente (D2)
  const N = numPlayers - 1; // Oponentes (excluindo hero)

  return N * N * p_d * potTotal;
}

export function derivePostFlopRps (
  stacks: number[],
  prizes: number[],
  ipIndex: number,
  oopIndex: number,
  state: StreetState
): PostFlopResult | null {
  const { street, potAcumuladoHero, potTotal, heroIsIp, bountyValue = 0, futureRpInfluence = 0 } = state;
  const heroIdx = heroIsIp ? ipIndex : oopIndex;
  const villainIdx = heroIsIp ? oopIndex : ipIndex;
  const numPlayers = state.numPlayers ?? 2;

  // Stacks remanescentes após investimento nas streets anteriores
  const stacksRemanescentes = stacks.map( ( s, i ) => {
    if ( i === heroIdx ) return Math.max( 0, s - potAcumuladoHero );
    // Simplificação para V1: Assumir que o oponente pagou o restante do pote
    if ( i === villainIdx ) return Math.max( 0, s - ( potTotal - potAcumuladoHero ) );
    return s;
  } );

  // Derivar RP base para os stacks remanescentes
  const baseRp = deriveRps( stacksRemanescentes, prizes, ipIndex, oopIndex, bountyValue );
  if ( !baseRp ) return null;

  const sprRemanescente = stacksRemanescentes[ heroIdx ] / ( potTotal || 1 );

  // D6: EV_fold (Dor de perder o pote acumulado)
  const totalPrizes = prizes.reduce( ( s, v ) => s + v, 0 );
  const baseline = calculateMapaICM( stacks, prizes ); // Baseline pre-investimento
  const foldState = calculateMapaICM( stacksRemanescentes, prizes ); // Se foldar, fica com o remanescente

  const evFoldStreet = ( ( foldState.equities[ heroIdx ] - baseline.equities[ heroIdx ] ) / totalPrizes ) * 100;
  const potEntrapmentRatio = Math.abs( evFoldStreet ) / ( stacks[ heroIdx ] || 1 );

  // D6: R por street (dinâmico)
  const rStreet = computeRStreet( street, heroIsIp, sprRemanescente );

  // D6: Valuation por street — razão ICM gain/loss com stacks remanescentes
  const heroEquityBaseline = foldState.equities[ heroIdx ];

  // SOTA: Alinhamento Dimensional Estrito (Fichas -> % Prize Pool)
  const rioChips = computeRioMwStreetChips( numPlayers, potTotal );
  const icmPerChip = stacksRemanescentes[ heroIdx ] > 0 ? heroEquityBaseline / stacksRemanescentes[ heroIdx ] : 0;
  const rioMwStreet = totalPrizes > 0 ? ( ( rioChips * icmPerChip ) / totalPrizes ) * 100 : 0;

  const stacksWin = stacksRemanescentes.map( ( s, i ) => i === heroIdx ? s + potTotal : s );
  const stacksLose = stacksRemanescentes.map( ( s, i ) => i === villainIdx ? s + potTotal : s );

  const icmWin = calculateMapaICM( stacksWin, prizes );
  const icmLose = calculateMapaICM( stacksLose, prizes );

  const gainPct = ( ( icmWin.equities[ heroIdx ] - heroEquityBaseline ) / totalPrizes ) * 100;
  const lossPct = ( ( heroEquityBaseline - icmLose.equities[ heroIdx ] ) / totalPrizes ) * 100;
  // Valuation rastreado puramente para diagnostico/interface. Nao entra na PM para evitar dupla contagem da assimetria ICM.
  const valuationStreet = lossPct > 0 ? gainPct / lossPct : 1;

  // D6: PM por street = (Equity × R × gain) - ( (1 - Equity) × loss ) - RIO
  // Usando 50% equity como baseline (sem informação de mão específica)
  const equityProxy = 0.5;
  const pmStreet = ( equityProxy * rStreet * gainPct )
    - ( ( 1 - equityProxy ) * lossPct )
    - rioMwStreet;

  // D4: Coeficiente de Insolvência
  const potOddsPct = ( potTotal / ( potTotal + potAcumuladoHero ) ) * 100;
  const ciStreet = pmStreet / ( potOddsPct || 1 );

  return {
    ...baseRp,
    evFoldStreet,
    sprRemanescente,
    rStreet,
    stackHeroRemanescente: stacksRemanescentes[ heroIdx ],
    rioMwStreet,
    valuationStreet,
    pmStreet,
    ciStreet,
    potEntrapmentRatio,
    adjustedIpRp: baseRp.ipRp + futureRpInfluence,
    adjustedOopRp: baseRp.oopRp + futureRpInfluence,
  };
}
