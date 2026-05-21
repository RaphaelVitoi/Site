/**
 * IDENTITY: Derivador de Risk Premium via Bubble Factor (Perspectiva)
 * PATH: src/lib/rpDeriver.ts
 * ROLE: Conectar o motor ICM (Perspectiva/M-H) ao motor pos-flop (nashSolver).
 */

import { calculateMapaICM } from './perspectiva';

const RP_MIN = 0;
const RP_MAX = 60;
export const BF_THRESHOLD = 1.01;
export const RP_CEILING_THRESHOLD = 24.0;

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
  if ( riskAdvantage > 8.0 ) return 'small';
  if ( spr < 2.0 ) return 'medium';
  if ( riskAdvantage < -5.0 ) return 'check';
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
}

export interface PostFlopResult extends RpDerivationResult {
  evFoldStreet: number;
  sprRemanescente: number;
  rStreet: number;
  stackHeroRemanescente: number;
}

export function derivePostFlopRps (
  stacks: number[],
  prizes: number[],
  ipIndex: number,
  oopIndex: number,
  state: StreetState,
): PostFlopResult | null {
  const { street, potAcumuladoHero, heroIsIp, bountyValue = 0, futureRpInfluence = 0 } = state;
  const heroIdx = heroIsIp ? ipIndex : oopIndex;

  const stacksRemanescentes = stacks.map( ( s, i ) => {
    if ( i === ipIndex || i === oopIndex ) return Math.max( 0.1, s - potAcumuladoHero );
    return s;
  } );

  const rpResult = deriveRps( stacksRemanescentes, prizes, ipIndex, oopIndex, bountyValue );
  if ( !rpResult ) return null;

  const decayFactor = street === 'flop' ? 0.4 : 0.2;
  // SOTA: Barreira termodinâmica garantindo que a influência futura não crie RP negativo (Inversão de ICM).
  const effectiveIpRp = Math.max( RP_MIN, rpResult.ipRp + ( futureRpInfluence * decayFactor ) );
  const effectiveOopRp = Math.max( RP_MIN, rpResult.oopRp + ( futureRpInfluence * decayFactor ) );

  const sprRemanescente = stacks[ heroIdx ] / ( potAcumuladoHero * 2 || 1 );

  return {
    ...rpResult,
    ipRp: effectiveIpRp,
    oopRp: effectiveOopRp,
    evFoldStreet: -potAcumuladoHero,
    sprRemanescente,
    rStreet: heroIsIp ? 1 : 0.85,
    stackHeroRemanescente: stacksRemanescentes[ heroIdx ],
  };
}
