/**
 * IDENTITY: Motor de Distorcao ICM pos-flop
 * PATH: src/components/simulator/engine/nashSolver.ts
 * ROLE: Aplicar distorcao ICM sobre frequencias ChipEV via equacao concava.
 *       NAO calcula equilibrio de Nash — e uma heuristica de distorcao calibrada empiricamente.
 *       Export principal: solveIcmDistortion. solveNash = alias deprecated para retrocompatibilidade.
 *
 * EQUAÇÃO CENTRAL:
 *   freq_ICM(A) = freq_ChipEV(A) + k_A × |ΔRP|^b × sign(ΔRP)
 *
 * Onde:
 *   ΔRP = RP_ip − RP_oop  (Risk Advantage: positivo = IP sob maior pressão ICM)
 *   b   = 1 / (1 + avgRp / 40)  →  côncavo; diminui conforme pressão ICM cresce
 *   k_A = coeficiente por ação (positivo = ação cresce com |ΔRP|, negativo = cai)
 *
 * ÂNCORA EMPÍRICA (único ponto calibrado com dados reais):
 *   Spot: BTN 39bb (RP 21.4%) vs BB 54bb (RP 12.9%), ΔRP = +8.5pp
 *   Fonte: 93 nodes HRC vs GTO Wizard, Aula 1.2 (board KJT-2-3)
 *   Distorções observadas:
 *     ip_check:     +40pp  →  resíduo (100 - betSmall - betLarge); sem k próprio
 *     oop_call:     +23pp  →  k calibrado
 *     oop_fold:     −15pp  →  k calibrado (resíduo de call + raise)
 *     ip_bet_large: ~some  →  k estimado (qualitativo)
 *     ip_bet_small: migra  →  k estimado (qualitativo)
 *     oop_raise:    ~zereia →  k estimado (qualitativo)
 *
 * AGRESSION FACTOR:
 *   Modula frequências de aposta do IP e raise do OOP para refletir que o
 *   oponente real pode desviar do equilíbrio ICM teórico. O RP precifica o
 *   risco de colisão — não assume que ela ocorre, mas que o jogador está
 *   exposto a ela. Na prática, jogadores são mais passivos ou mais agressivos
 *   do que o equilíbrio prevê. Check/fold recalculados como resíduo.
 *
 * LIMITAÇÕES HONESTAS:
 *   - Um único ponto de calibração empírica (ΔRP = +8.5pp)
 *   - RP por street não é quantificável sem variáveis adicionais
 *   - Output são distribuições, não certezas
 *   - Spread cresce para configurações além da âncora
 *
 * [SOTA VITOI PARADIGM]:
 *   - Integrada a "Perspectiva Matemática" e "EV_fold Dinâmico".
 *   - RIO (Reverse Implied Odds) atua como buraco negro de valuation.
 *   - Penalização quadrática de RIO aplicada em cenários Multiway.
 */

import type { ChipEvFreqs, FreqResult, IcmDistortionResult } from './types';

// === ÂNCORA EMPÍRICA ===
const ANCHOR_DELTA_RP = 8.5;

// === COEFICIENTES k_A ===
// Positivo: ação cresce quando IP tem mais RP (ΔRP > 0)
// Negativo: ação cai quando IP tem mais RP (ΔRP > 0)
// Calibrados (c) = derivados dos 93 nodes na âncora
// Estimados  (e) = derivados qualitativamente da teoria
const K = {
  ip_bet_small: -3.5,   // (e) sizing migra, não desaparece
  ip_bet_large: -12,    // (e) some quase completamente
  oop_call: 7.3,   // (c) +23pp @ âncora
  oop_fold: -4.7,   // (c) −15pp @ âncora
  oop_raise: -9,     // (e) quase zereia — aplicado sobre |ΔRP| (sem sign)
} as const;

// === INCERTEZA ===
const BASE_SPREAD = 3;   // pp de incerteza mínima (mesmo na âncora)
const SPREAD_RATE = 0.6; // pp de spread por pp de desvio da âncora

/**
 * Expoente b da curva côncava.
 * b → 1 quando avgRp → 0 (ChipEV puro, sem distorção).
 * b → 0 conforme pressão ICM média cresce (curva mais côncava).
 */
function calcB ( ipRp: number, oopRp: number ): number {
  return 1 / ( 1 + ( ipRp + oopRp ) / 2 / 40 );
}

/**
 * Spread de incerteza proporcional ao desvio da âncora empírica.
 */
function calcSpread ( deltaRp: number ): number {
  return BASE_SPREAD + SPREAD_RATE * Math.abs( deltaRp - ANCHOR_DELTA_RP );
}

/**
 * Aplica distorção ICM sobre uma frequência ChipEV, respeitando sign(ΔRP).
 */
function applyDistortion (
  chipEvFreq: number,
  k: number,
  deltaRp: number,
  b: number,
  spread: number,
): FreqResult {
  const distortion = k * Math.pow( Math.abs( deltaRp ), b ) * Math.sign( deltaRp || 1 );
  const center = Math.max( 0, Math.min( 100, chipEvFreq + distortion ) );
  return { center, spread, delta: center - chipEvFreq };
}

/**
 * Aplica distorção ICM sobre |ΔRP| sem considerar o sinal.
 * Usado para ações que se comprimem independente de qual lado tem mais RP.
 */
function applyDistortionAbsolute (
  chipEvFreq: number,
  k: number,
  deltaRp: number,
  b: number,
  spread: number,
): FreqResult {
  const distortion = k * Math.pow( Math.abs( deltaRp ), b );
  const center = Math.max( 0, Math.min( 100, chipEvFreq + distortion ) );
  return { center, spread, delta: center - chipEvFreq };
}

/**
 * Aplica distorcao ICM sobre frequencias ChipEV para calcular frequencias pos-flop ajustadas.
 * NAO e um solver de Nash — e uma heuristica de distorcao baseada em Risk Premium (RP).
 *
 * @param ipRp           - Risk Premium do IP (0–100), via Malmuth-Harville
 * @param oopRp          - Risk Premium do OOP (0–100), via Malmuth-Harville
 * @param chipEvFreqs    - Frequencias ChipEV do spot (GTO Wizard ou equivalente)
 * @param aggressionFactor - Desvio comportamental real do oponente vs equilibrio ICM
 *                           (0.5 = passivo · 1.0 = equilibrio · 1.5 = agressivo)
 * @param isMultiway       - Aplica o multiplicador exponencial de Reverse Implied Odds (RIO)
 */
export function solveIcmDistortion (
  ipRp: number,
  oopRp: number,
  chipEvFreqs: ChipEvFreqs,
  aggressionFactor = 1,
  isMultiway = false,
): IcmDistortionResult {
  const safeIp = Math.max( 0, Math.min( 100, Number( ipRp ) || 0 ) );
  const safeOop = Math.max( 0, Math.min( 100, Number( oopRp ) || 0 ) );
  const safeFactor = Math.max( 0.1, Math.min( 3, Number( aggressionFactor ) || 1 ) );

  const deltaRp = safeIp - safeOop;
  const b = calcB( safeIp, safeOop );
  const spread = calcSpread( deltaRp );

  // Frequências de aposta moduladas pelo aggressionFactor (comportamento real)
  const rawBetSmall = applyDistortion( chipEvFreqs.ip_bet_small, K.ip_bet_small, deltaRp, b, spread );
  const rawBetLarge = applyDistortion( chipEvFreqs.ip_bet_large, K.ip_bet_large, deltaRp, b, spread );

  // Apostas moduladas pelo aggressionFactor; normalização garante soma = 100
  const rawSmallModulated = Math.max( 0, rawBetSmall.center * safeFactor );
  const rawLargeModulated = Math.max( 0, rawBetLarge.center * safeFactor );
  const rawCheckModulated = Math.max( 0, 100 - rawSmallModulated - rawLargeModulated );
  const ipSum = rawSmallModulated + rawLargeModulated + rawCheckModulated;
  const betSmallCenter = ipSum > 0 ? ( rawSmallModulated / ipSum ) * 100 : 0;
  const betLargeCenter = ipSum > 0 ? ( rawLargeModulated / ipSum ) * 100 : 0;

  // Check do IP = resíduo das apostas normalizadas (consistência interna garantida)
  const checkCenter = Math.max( 0, 100 - betSmallCenter - betLargeCenter );

  const ipCheck: FreqResult = {
    center: checkCenter,
    spread,
    delta: checkCenter - chipEvFreqs.ip_check,
  };
  const ipBetSmall: FreqResult = { ...rawBetSmall, center: betSmallCenter };
  const ipBetLarge: FreqResult = { ...rawBetLarge, center: betLargeCenter };

  // OOP raise modulado pelo aggressionFactor (ação de pressão)
  const rawRaise = applyDistortionAbsolute( chipEvFreqs.oop_raise, K.oop_raise, deltaRp, b, spread );
  const rawCall = applyDistortion( chipEvFreqs.oop_call, K.oop_call, deltaRp, b, spread );

  // SOTA VITOI: Penalização Quadrática de RIO em Multiway
  // Em multiway, as RIO crescem x^2. O call perde utilidade, EV_fold torna-se o refúgio estrutural.
  const rioPenalty = isMultiway ? Math.pow( Math.max( safeIp, safeOop ) / 10, 2 ) : 0;
  const callAfterRio = Math.max( 0, rawCall.center - rioPenalty );

  // Normalização OOP: raise modulado, call ICM puro, fold como resíduo — soma = 100
  const rawRaiseModulated = Math.max( 0, rawRaise.center * safeFactor );
  const rawCallClamped = Math.max( 0, callAfterRio );
  const rawFoldModulated = Math.max( 0, 100 - rawCallClamped - rawRaiseModulated );
  const oopSum = rawRaiseModulated + rawCallClamped + rawFoldModulated;
  const raiseCenter = oopSum > 0 ? ( rawRaiseModulated / oopSum ) * 100 : 0;
  const callCenter = oopSum > 0 ? ( rawCallClamped / oopSum ) * 100 : 0;

  // Fold do OOP = resíduo normalizado (consistência interna garantida)
  const foldCenter = Math.max( 0, 100 - callCenter - raiseCenter );

  const oopCall: FreqResult = { ...rawCall, center: callCenter };
  const oopFold: FreqResult = {
    center: foldCenter,
    spread,
    delta: foldCenter - chipEvFreqs.oop_fold,
  };
  const oopRaise: FreqResult = { ...rawRaise, center: raiseCenter };

  return {
    ip: { check: ipCheck, bet_small: ipBetSmall, bet_large: ipBetLarge },
    oop: { call: oopCall, fold: oopFold, raise: oopRaise },
    deltaRp,
    bExponent: b,
    rawData: { ipRp: safeIp, oopRp: safeOop, chipEvFreqs },
  };
}
