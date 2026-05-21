/**
 * IDENTITY: Motor de Distorcao ICM pos-flop
 * PATH: src/components/simulator/engine/nashSolver.ts
 * ROLE: Aplicar distorcao ICM sobre frequencias ChipEV via equacao concava.
 *       Sintetiza a distorcao baseado estritamente na Hierarquia da Perspectiva Matematica (PMev).
 *       Export principal: solveIcmDistortion. solveNash = alias deprecated para retrocompatibilidade.
 *
 * HIERARQUIA VITOI (PMev):
 *   1. ICMev (RP): O imposto estrutural bruto de sobrevivencia.
 *   2. Esperanca Matematica: O RP eleva o sarrafo de Pot Odds linearmente.
 *   3. Expectativa Matematica: Reverse Implied Odds (RIO) aplicam penalizacao quadratica (RP/10)^2 ao OOP.
 *   4. Perspectiva Matematica: A soma (Esperanca + Expectativa) oblitera o Call marginal. O Fold absorve o deficit.
 *
 */

import type { ChipEvFreqs, FreqResult, IcmDistortionResult } from './types';

/**
 * Formula o Spread de Incerteza dinamico baseado na tensao do spot.
 */
function calcSpread ( deltaRp: number ): number {
  return Math.max( 3, Math.abs( deltaRp ) * 0.25 );
}

/**
 * Aplica distorcao ICM sobre frequencias ChipEV para calcular frequencias pos-flop ajustadas.
 * Motor guiado estritamente pela Hierarquia SOTA (PMev).
 *
 * @param ipRp           - Risk Premium do IP (0–100), via Malmuth-Harville
 * @param oopRp          - Risk Premium do OOP (0–100), via Malmuth-Harville
 * @param chipEvFreqs    - Frequencias ChipEV do spot (GTO Wizard ou equivalente)
 * @param aggressionFactor - Desvio comportamental real do oponente vs equilibrio ICM
 *                           (0.5 = passivo · 1.0 = equilibrio)
 * @param activePlayers    - Quantidade de jogadores na mão. Multiplica RIO exponencialmente em pots MW.
 */
export function solveIcmDistortion (
  ipRp: number,
  oopRp: number,
  chipEvFreqs: ChipEvFreqs,
  aggressionFactor = 1,
  activePlayers = 2,
): IcmDistortionResult {
  const safeIp = Math.max( 0, Math.min( 100, Number( ipRp ) || 0 ) );
  const safeOop = Math.max( 0, Math.min( 100, Number( oopRp ) || 0 ) );
  const safeFactor = Math.max( 0.1, Math.min( 3, Number( aggressionFactor ) || 1 ) );

  const deltaRp = safeIp - safeOop;
  const spread = calcSpread( deltaRp );

  // === 1. ESPERANCA MATEMATICA (Custo Direto) ===
  // O RP age como um imposto linear sobre a equidade.
  const esperancaPenaltyOop = safeOop;
  const esperancaPenaltyIp = safeIp;

  // === 2. EXPECTATIVA MATEMATICA (FGS + RIO) ===
  // OOP joga no escuro. As RIO o punem quadraticamente. O passivo estrutural cresce (N-1)^2.
  const opponents = Math.max( 1, activePlayers - 1 );
  const multiwayMultiplier = Math.pow( opponents, 2 );
  const rioPenaltyOop = Math.pow( safeOop / 10, 2 ) * multiwayMultiplier;
  // IP tem controle de pote, RIO e amortecido (escala linear).
  const rioPenaltyIp = ( safeIp / 10 ) * multiwayMultiplier;

  // === 3. PERSPECTIVA MATEMATICA (Distorcao Total) ===
  const pmEvPenaltyOop = esperancaPenaltyOop + rioPenaltyOop;
  const pmEvPenaltyIp = esperancaPenaltyIp + rioPenaltyIp;

  // --- APLICACAO: DEFENSOR (OOP) ---
  // O Call absorve o impacto frontal da Perspectiva.
  const rawCall = Math.max( 0, chipEvFreqs.oop_call - pmEvPenaltyOop );

  // O Raise sofre pressao estrutural, mas ganha sobrevida se o IP estiver mais pressionado (Risk Advantage).
  const raiseDefense = deltaRp > 0 ? ( deltaRp * 0.4 ) : 0;
  const rawRaise = Math.max( 0, chipEvFreqs.oop_raise - pmEvPenaltyOop + raiseDefense );

  const rawRaiseModulated = rawRaise * safeFactor;
  const rawCallClamped = rawCall; // Call nao reage a aggressionFactor (e passivo)
  const rawFoldModulated = Math.max( 0, 100 - rawCallClamped - rawRaiseModulated );

  const oopSum = rawRaiseModulated + rawCallClamped + rawFoldModulated;
  const raiseCenter = oopSum > 0 ? ( rawRaiseModulated / oopSum ) * 100 : 0;
  const callCenter = oopSum > 0 ? ( rawCallClamped / oopSum ) * 100 : 0;
  const foldCenter = Math.max( 0, 100 - callCenter - raiseCenter );

  const oopCall: FreqResult = { center: callCenter, spread, delta: callCenter - chipEvFreqs.oop_call };
  const oopFold: FreqResult = { center: foldCenter, spread, delta: foldCenter - chipEvFreqs.oop_fold };
  const oopRaise: FreqResult = { center: raiseCenter, spread, delta: raiseCenter - chipEvFreqs.oop_raise };

  // --- APLICACAO: AGRESSOR (IP) ---
  // Bet Large infla o pote e aciona a penalizacao RIO de forma agressiva (1.5x).
  const rawBetLarge = Math.max( 0, chipEvFreqs.ip_bet_large - ( pmEvPenaltyIp * 1.5 ) );
  // Bet Small retem o controle SPR, sofrendo menos atrito (0.5x).
  const rawBetSmall = Math.max( 0, chipEvFreqs.ip_bet_small - ( pmEvPenaltyIp * 0.5 ) );

  const rawSmallModulated = rawBetSmall * safeFactor;
  const rawLargeModulated = rawBetLarge * safeFactor;
  const rawCheckModulated = Math.max( 0, 100 - rawSmallModulated - rawLargeModulated );

  const ipSum = rawSmallModulated + rawLargeModulated + rawCheckModulated;
  const betSmallCenter = ipSum > 0 ? ( rawSmallModulated / ipSum ) * 100 : 0;
  const betLargeCenter = ipSum > 0 ? ( rawLargeModulated / ipSum ) * 100 : 0;
  const checkCenter = Math.max( 0, 100 - betSmallCenter - betLargeCenter );

  const ipCheck: FreqResult = { center: checkCenter, spread, delta: checkCenter - chipEvFreqs.ip_check };
  const ipBetSmall: FreqResult = { center: betSmallCenter, spread, delta: betSmallCenter - chipEvFreqs.ip_bet_small };
  const ipBetLarge: FreqResult = { center: betLargeCenter, spread, delta: betLargeCenter - chipEvFreqs.ip_bet_large };

  return {
    ip: { check: ipCheck, bet_small: ipBetSmall, bet_large: ipBetLarge },
    oop: { call: oopCall, fold: oopFold, raise: oopRaise },
    deltaRp,
    bExponent: 1, // Desativado. Mantido fixo para nao quebrar contratos de UI na aba Teoria.
    rawData: { ipRp: safeIp, oopRp: safeOop, chipEvFreqs },
  };
}
