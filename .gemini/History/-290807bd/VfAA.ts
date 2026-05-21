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

import type { ChipEvFreqs, FreqResult, IcmDistortionResult } from "./types";

/**
 * Formula o Spread de Incerteza dinamico baseado na tensao do spot.
 */
function calcSpread(deltaRp: number): number {
  return Math.max(3, Math.abs(deltaRp) * 0.25);
}

/**
 * Calcula o expoente da curva baseada na média de RPs para garantir convexidade correta.
 * @param avgRp - A média das pressões de risco (RP) no board.
 */
function calcBExponent(avgRp: number): number {
  if (avgRp <= 0) return 1;
  return Math.max(0.1, 1 - avgRp / 100); // Exponencial decai com a pressão
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
 */
export function solveIcmDistortion(
  ipRp: number,
  oopRp: number,
  chipEvFreqs: ChipEvFreqs,
  aggressionFactor = 1,
  potSize = 7.5,
  streetIdx = 0,
): IcmDistortionResult {
  const safeIp = Math.max(0, Math.min(100, Number(ipRp) || 0));
  const safeOop = Math.max(0, Math.min(100, Number(oopRp) || 0));

  // SOTA v4.2: Gravidade do Pote (Inércia Estratégica)
  const gravity = Math.max(0, Math.log(Math.max(1, potSize / 7.5)));
  const damping = 1 / (1 + gravity * 0.12);
  const effectiveAggression = 1 + (aggressionFactor - 1) * damping;

  const deltaRp = safeIp - safeOop;
  const spread = calcSpread(deltaRp);
  const avgRp = (safeIp + safeOop) / 2;

  // Calculo real do bExponent (côncavo com maior pressão)
  const bExponent = calcBExponent(avgRp);

  // Moduladores Lineares Básicos
  const k_ip_bet_small = -3.5;
  const k_ip_bet_large = -12;

  const k_oop_call = 7.3;
  const k_oop_raise = -9;

  // --- APLICACAO: DEFENSOR (OOP) ---
  // SOTA: O OOP sempre retrai o range de Call/Raise sob qualquer assimetria ICM.
  const absDelta = Math.abs(deltaRp);
  const deltaCall = -Math.pow(absDelta / 10, bExponent) * k_oop_call;
  const rawCall = Math.max(0, chipEvFreqs.oop_call + deltaCall);

  const absRpRaise = Math.abs(deltaRp);
  const deltaRaise =
    -Math.pow(absRpRaise / 10, bExponent) * Math.abs(k_oop_raise);
  const rawRaise = Math.max(0, chipEvFreqs.oop_raise + deltaRaise);

  // SOTA v4.2: Downward Drift (Raise -> Call/Fold sob pressão e gravidade)
  const pressure = avgRp;
  const driftBase = 0.004 * (streetIdx + 1);
  const driftPenalty = rawRaise * (pressure * driftBase * (1 + gravity * 0.5));

  const rawRaiseModulated = Math.max(
    0,
    rawRaise * effectiveAggression - driftPenalty,
  );
  const rawCallClamped = rawCall;
  const rawFoldModulated = Math.max(
    0,
    100 - rawCallClamped - rawRaiseModulated,
  );

  const oopSum = rawRaiseModulated + rawCallClamped + rawFoldModulated;
  const raiseCenter = oopSum > 0 ? (rawRaiseModulated / oopSum) * 100 : 0;
  const callCenter = oopSum > 0 ? (rawCallClamped / oopSum) * 100 : 0;
  const foldCenter = Math.max(0, 100 - callCenter - raiseCenter);

  const oopCall: FreqResult = {
    center: callCenter,
    spread,
    delta: callCenter - chipEvFreqs.oop_call,
  };
  const oopFold: FreqResult = {
    center: foldCenter,
    spread,
    delta: foldCenter - chipEvFreqs.oop_fold,
  };
  const oopRaise: FreqResult = {
    center: raiseCenter,
    spread,
    delta: raiseCenter - chipEvFreqs.oop_raise,
  };

  // --- APLICACAO: AGRESSOR (IP) ---
  const signDelta = Math.sign(deltaRp) || 1;
  const deltaBetSmall =
    signDelta * Math.pow(absDelta / 10, bExponent) * k_ip_bet_small;
  const rawBetSmall = Math.max(0, chipEvFreqs.ip_bet_small + deltaBetSmall);

  const deltaBetLarge =
    signDelta * Math.pow(absDelta / 10, bExponent) * k_ip_bet_large;
  const rawBetLarge = Math.max(0, chipEvFreqs.ip_bet_large + deltaBetLarge);

  const rawSmallModulated = rawBetSmall * effectiveAggression;
  const rawLargeModulated = rawBetLarge * effectiveAggression;
  const rawCheckModulated = Math.max(
    0,
    100 - rawSmallModulated - rawLargeModulated,
  );

  const ipSum = rawSmallModulated + rawLargeModulated + rawCheckModulated;
  const betSmallCenter = ipSum > 0 ? (rawSmallModulated / ipSum) * 100 : 0;
  const betLargeCenter = ipSum > 0 ? (rawLargeModulated / ipSum) * 100 : 0;
  const checkCenter = Math.max(0, 100 - betSmallCenter - betLargeCenter);

  const ipCheck: FreqResult = {
    center: checkCenter,
    spread,
    delta: checkCenter - chipEvFreqs.ip_check,
  };
  const ipBetSmall: FreqResult = {
    center: betSmallCenter,
    spread,
    delta: betSmallCenter - chipEvFreqs.ip_bet_small,
  };
  const ipBetLarge: FreqResult = {
    center: betLargeCenter,
    spread,
    delta: betLargeCenter - chipEvFreqs.ip_bet_large,
  };

  return {
    ip: { check: ipCheck, bet_small: ipBetSmall, bet_large: ipBetLarge },
    oop: { call: oopCall, fold: oopFold, raise: oopRaise },
    deltaRp,
    bExponent,
    rawData: { ipRp: safeIp, oopRp: safeOop, chipEvFreqs },
  };
}
