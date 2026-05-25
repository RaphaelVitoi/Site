/**
 * IDENTITY: Motor de Perspectiva Matemática SOTA v6.2.1 GOLD (VITOI - GOLD)
 * PATH: src/lib/perspectiva.ts
 * ROLE: Core algorítmico da Equação Unificada SOTA (Purificada).
 *       PM = [(Equity * R) * Valuation] - [EV_fold(t, dpj, pos) + RIO_mw]
 *
 * @format
 */

import { calculateIcmMonteCarlo } from './montecarlo';
import { PerspectivaInputSchema, PerspectivaResultSchema } from './schemas';

// === TIPOS E INTERFACES ===

export interface MapaICMResult {
  positionProbs: number[][];
  equities: number[];
  totalChips: number;
}

export type StackTier = 'micro' | 'short' | 'mid' | 'big' | 'chipleader';

export interface PerspectivaResult {
  // Layer 1: ICMev (Snapshot)
  handEquity: number;
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
  marginInstability: number; // Incerteza % baseada no stack efetivo
  threshEq: number; // Novo: Equidade Limite Projetada
  realizationFactor: number; // SOTA: Exportar o R calculado dinamicamente

  // Metadados
  isActionBetterThanFold: boolean;
  diagnostico: string;
  bountyPower: number;

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

  // Parâmetros Quantum (v6.2.1)
  numPlayersInPot?: number; // Para RIO_mw
  humanNoiseFactor?: number; // SOTA: Table Draw Noise
  isNearPayjump?: boolean; // Para EV_fold positivo
  blindsRisingSoon?: boolean; // Para Erosão de stack
  currentEquityPct?: number; // Para Delta Fold Pct
  heroPosition?: string; // SOTA: Antevisão Posicional

  // Parametros Opcionais de Teoremas
  spr?: number;
  investidoAcumulado?: number;
  blindCost?: number;
}

// === MOTOR ICM (Malmuth-Harville / Monte Carlo Estocástico) ===
const _icmCache = new Map<string, MapaICMResult>();

export function calculateMapaICM(stacks: number[], prizes: number[]): MapaICMResult {
  const n = stacks.length;

  // SOTA: Monte Carlo Fallback para evitar explosão combinatória (O(2^N))
  // Adaptado de bibliotecas Open Source para fields maiores
  if (n > 10) {
    const totalChips = stacks.reduce((s, v) => s + v, 0);
    const equities = calculateIcmMonteCarlo(stacks, prizes, {
      iterations: 20000,
    });

    // Probs aproximadas (não totalmente precisas via MCMC, mas suficientes para fallback)
    const positionProbs = Array.from({ length: n }, () => new Array(Math.min(n, prizes.length)).fill(0));

    if (totalChips > 0 && prizes.length > 0) {
      stacks.forEach((s, i) => {
        const row = positionProbs[i];
        if (row) row[0] = s / totalChips;
      });
    }
    return { positionProbs, equities, totalChips };
  }

  const activePrizes = prizes.slice(0, n);
  const k = activePrizes.length;
  const totalChips = stacks.reduce((s, v) => s + v, 0);
  const key = `${stacks.join(',')}|${activePrizes.join(',')}`;

  const cachedIcm = _icmCache.get(key);
  if (cachedIcm) return cachedIcm;

  const positionProbs: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  const equities: number[] = new Array(n).fill(0);

  if (totalChips === 0 || k === 0) return { positionProbs, equities, totalChips };

  const memo = new Map<string, { posC: number[][]; eqC: number[] }>();

  function _applySubComputation(
    p: number,
    posIdx: number,
    sub: { posC: number[][]; eqC: number[] },
    posC: number[][],
    eqC: number[],
  ) {
    for (let j = 0; j < n; j++) {
      const posRow = posC[j];
      if (!posRow) continue;
      for (let pi = posIdx + 1; pi < k; pi++) {
        posRow[pi] = (posRow[pi] ?? 0) + p * (sub.posC[j]?.[pi] ?? 0);
      }
      eqC[j] = (eqC[j] ?? 0) + p * (sub.eqC[j] ?? 0);
    }
  }

  function compute(
    currStacks: number[],
    currIndices: number[],
    posIdx: number,
    currTotal: number,
  ): { posC: number[][]; eqC: number[] } {
    if (posIdx >= k || currStacks.length === 0 || currTotal === 0) {
      return {
        posC: Array.from({ length: n }, () => new Array(k).fill(0)),
        eqC: new Array(n).fill(0),
      };
    }

    const stateKey = `${posIdx}:${currIndices
      .slice()
      .sort((a, b) => a - b)
      .join(',')}`;
    const cachedState = memo.get(stateKey);
    if (cachedState) return cachedState;

    const posC: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
    const eqC: number[] = new Array(n).fill(0);

    for (let i = 0; i < currStacks.length; i++) {
      const stack = currStacks[i] ?? 0;
      if (stack <= 0) continue;
      const p = stack / currTotal;
      const origIdx = currIndices[i];
      if (origIdx === undefined) continue;
      const heroPosRow = posC[origIdx];

      if (!heroPosRow) continue;
      heroPosRow[posIdx] = (heroPosRow[posIdx] ?? 0) + p;
      eqC[origIdx] = (eqC[origIdx] ?? 0) + p * (activePrizes[posIdx] ?? 0);

      const sub = compute(
        currStacks.filter((_, j) => j !== i),
        currIndices.filter((_, j) => j !== i),
        posIdx + 1,
        currTotal - stack,
      );
      _applySubComputation(p, posIdx, sub, posC, eqC);
    }
    const res = { posC, eqC };
    memo.set(stateKey, res);
    return res;
  }

  const resultContrib = compute(
    stacks,
    stacks.map((_, i) => i),
    0,
    totalChips,
  );
  const finalResult = {
    positionProbs: resultContrib.posC,
    equities: resultContrib.eqC,
    totalChips,
  };
  if (_icmCache.size >= 1000) {
    const firstKey = _icmCache.keys().next().value;
    if (firstKey !== undefined) _icmCache.delete(firstKey);
  }
  _icmCache.set(key, finalResult);
  return finalResult;
}

export function classifyTier(stack: number, stacks: number[]): StackTier {
  const avg = stacks.reduce((s, v) => s + v, 0) / stacks.length || 1;
  const ratio = stack / avg;
  if (stack <= 0 || ratio < 0.4) return 'micro';
  if (ratio < 0.7) return 'short';
  if (ratio < 1.5) return 'mid';
  if (stacks.every((s) => stack >= s) || ratio >= 2.5) return 'chipleader';
  return 'big';
}

// --- HELPERS DE REDUÇÃO DE ENTROPIA COGNITIVA (SOTA v6.2.1 GOLD) ---

function _buildSimulatedStacks(
  stacks: number[],
  heroIdx: number,
  villainIdx: number,
  potSize: number,
  heroCost: number,
  investidoAcumulado: number,
) {
  const stacksWin = [...stacks];
  stacksWin[heroIdx] = Math.max(0, (stacksWin[heroIdx] || 0) - heroCost + potSize);

  const stacksLose = [...stacks];
  stacksLose[heroIdx] = Math.max(0, (stacksLose[heroIdx] || 0) - heroCost);
  stacksLose[villainIdx] = (stacksLose[villainIdx] || 0) + potSize + heroCost;

  const stacksFold = [...stacks];
  stacksFold[heroIdx] = Math.max(0, (stacksFold[heroIdx] || 0) - investidoAcumulado);
  stacksFold[villainIdx] = (stacksFold[villainIdx] || 0) + potSize;

  return { stacksWin, stacksLose, stacksFold };
}

function _calculateValuationAndRio(
  current: MapaICMResult,
  deltaWinPct: number,
  perspWin: MapaICMResult,
  perspLose: MapaICMResult,
  input: PerspectivaInput,
  totalPrizes: number,
  stackHero: number,
) {
  const villainIdx = input.villainIdx;
  const heroIdx = input.heroIdx;
  const potSize = input.potSize;
  const numPlayersInPot = input.numPlayersInPot ?? 2;
  const humanNoiseFactor = input.humanNoiseFactor ?? 0;
  const bountyValue = input.bountyValue ?? 0;

  const currentVillainEq = current.equities[villainIdx] ?? 0;
  const winVillainEq = perspWin.equities[villainIdx] ?? 0;
  const currentHeroEq = current.equities[heroIdx] ?? 0;
  const loseHeroEq = perspLose.equities[heroIdx] ?? 0;

  const villainDeltaLoss = currentVillainEq - winVillainEq;
  const rawValuation = villainDeltaLoss > 0 ? deltaWinPct / ((villainDeltaLoss / totalPrizes) * 100) : 1;
  const valuation = Math.max(0.1, Math.min(2, rawValuation));

  // SOTA v7.0: Calculo de Risk Premium (RP) real para Risk Advantage
  // RP = (Eq_atual - Eq_perda) / Eq_atual
  const heroRp = currentHeroEq > 0 ? (currentHeroEq - loseHeroEq) / currentHeroEq : 0.15;
  const villainRp = currentVillainEq > 0 ? (currentVillainEq - winVillainEq) / currentVillainEq : 0.15;

  // SOTA: Bounty Offset (PKO) - O bounty "paga" parte do risco.
  const bountyRpOffset = (bountyValue / Math.max(1, potSize)) * 10;
  const effectiveHeroRp = Math.max(0.01, heroRp - bountyRpOffset);

  const riskAdvantage = villainRp - effectiveHeroRp;

  // Se HU, RIO é zero. Apenas MW possui passivo estrutural.
  if (numPlayersInPot <= 2) {
    return { valuation, rioLiability: 0, riskAdvantage };
  }

  const opponents = Math.max(1, numPlayersInPot - 1);
  const rioPenaltyFactor = Math.pow(opponents, 2);
  const volatilityMultiplier = stackHero > 0 ? Math.pow(2 / Math.max(1, stackHero / 5), 2) : 1;

  // SOTA v7.0: Penalidade RIO escalada pelo Effective Hero RP
  const damping = 0.15 + humanNoiseFactor * 0.05;
  const rioPenaltyChips = potSize * rioPenaltyFactor * (damping + volatilityMultiplier * 0.05) * (effectiveHeroRp / 0.15);
  const icmPerChip = currentVillainEq > 0 ? ((currentVillainEq / totalPrizes) * 100) / (current.totalChips / 2) : 0.05;
  const rioLiability = rioPenaltyChips * icmPerChip;

  return { valuation, rioLiability, riskAdvantage };
}

function _calculateFoldPressure(input: PerspectivaInput, stacksWin: number[], deltaFoldPct: number) {
  const { prizes, heroIdx, stacks, isNearPayjump = false, blindsRisingSoon = false, heroPosition = 'IP' } = input;
  const stackHero = stacks[heroIdx] ?? 0;
  const isVacuum = prizes.length <= 1;
  const handsToBust = Math.max(1, stackHero / 1.5);
  const survivalPressure = isVacuum ? 0 : Math.min(1, 1 / handsToBust);
  const currentTier = classifyTier(stackHero, stacks);
  const winTier = classifyTier(stacksWin[heroIdx] ?? stackHero, stacksWin);
  const tierBonus = isVacuum || winTier === currentTier ? 0 : 0.15;
  const fgsHealth = isVacuum ? 1 : 1 + tierBonus + survivalPressure * 0.2;
  const payjumpBonus = isNearPayjump && !isVacuum ? Math.max(1.2, Math.abs(deltaFoldPct) + 0.25) : 0;

  // SOTA FIX: Falácia Orbital Corrigida (FGS t-3)
  // A distância real até o BB dita a erosão. BTN é 'IP' mas tem a órbita inteira viva. UTG morre amanhã.
  let erosionPenalty = 0;
  if (blindsRisingSoon && !isVacuum) {
    const baseErosion = Math.abs(deltaFoldPct * 0.5) + 0.1;
    const penaltyMap: Record<string, number> = {
      UTG: 1.5,
      EP: 1.5,
      MP: 1.2,
      HJ: 0.8,
      CO: 0.4,
      BTN: 0.1,
      SB: 0,
      BB: 0.5,
      OOP: 1,
      IP: 0.5,
    };
    erosionPenalty = baseErosion + (penaltyMap[heroPosition] ?? 0.5);
  }

  return {
    isVacuum,
    survivalPressure,
    fgsHealth,
    payjumpBonus,
    dynamicEvFold: deltaFoldPct + payjumpBonus - erosionPenalty,
  };
}

function _resolveRealizationFactor(
  input: PerspectivaInput,
  stackHero: number,
  stackVillain: number,
  potSize: number,
  numPlayersInPot: number,
) {
  const effectiveStack = Math.min(stackHero, stackVillain);
  const spr = input.spr ?? effectiveStack / (potSize || 1);
  let R = input.realizationFactor;

  // SOTA v6.2.1: Damping de Realizacao Baseado em Agressao (Fisica Unificada)
  // SOTA FIX: O humanNoiseFactor é uma taxa (0 a 1). Ativação a partir de 0.15 (15% de entropia).
  if (input.humanNoiseFactor !== undefined && input.humanNoiseFactor > 0.15) {
    const aggPenalty = 1 - input.humanNoiseFactor * 0.5;
    R *= Math.max(0.1, aggPenalty);
  }

  if (input.realizationFactor === 1 && numPlayersInPot === 2) {
    const isHeroOop =
      input.realizationFactor < 1 || (input.realizationFactor === 1 && input.heroIdx > input.villainIdx);
    if (isHeroOop) {
      const oopPenalty = 0.25 * (1 - Math.exp(-spr / 2));
      R = Math.max(0.75, 1 - oopPenalty);
    }
  }

  return { R, effectiveStack };
}

export function calculateAmortizedEdge(
  edgeBase: number,
  stackHero: number,
  stackVillain: number,
  spr?: number,
  isVacuum: boolean = false,
) {
  const isVillainShort = stackVillain < 12;
  const ratio = stackHero / (stackVillain || 1);
  const edgePenalty = !isVacuum && isVillainShort && ratio > 3 ? 0.3 : 1;
  const effectiveStackForEdge = spr === undefined ? stackHero : Math.max(2, spr * 5);

  // SOTA: Amortização da Edge (Colapso Mecânico)
  // A árvore de decisão é podada em S=10bb. Er(S) é proporcional a log(S).
  const safeStackEdge = Math.max(2.718, effectiveStackForEdge);
  const edgeScale = Math.log(safeStackEdge) / Math.log(60);

  return { edgePenalty, amortizedEdge: edgeBase * edgePenalty * edgeScale };
}

function _buildDiagnostico(params: {
  perspectivaPct: number;
  rioLiability: number;
  payjumpBonus: number;
  edgePenalty: number;
  investidoAcumulado: number | undefined;
  stackHero: number;
  kappa: number;
  humanNoiseFactor: number;
}): string {
  const {
    perspectivaPct,
    rioLiability,
    payjumpBonus,
    edgePenalty,
    investidoAcumulado,
    stackHero,
    kappa,
    humanNoiseFactor,
  } = params;
  let diagnostico = perspectivaPct > 0 ? 'Ação Soberana.' : 'Insolvência de Perspectiva.';
  if (rioLiability > 1) diagnostico += ' Alerta: Colapso Multiway.';
  if (payjumpBonus > 0) diagnostico += ' Laddering favorece o Fold.';
  if (edgePenalty < 1) diagnostico += ' Punição: Restaurando árvore do oponente.';
  if (investidoAcumulado && investidoAcumulado > stackHero * 0.3) diagnostico += ' Alerta: Pot Entrapment Severo.';
  if (Math.abs(perspectivaPct) <= 5 && kappa < 0.4)
    diagnostico += ' Credibilidade Baixa: Intuição filtrada pelo Baseline Matemático.';

  // SOTA v4.5: Fator PSI (Maluquice Humana)
  if (humanNoiseFactor > 0.3)
    diagnostico += ` Fator Ψ Elevado (${(humanNoiseFactor * 100).toFixed(0)}%): Entropia do oponente detectada.`;
  if (perspectivaPct > 15 && stackHero > 40) diagnostico += ' Predador Ativo: Exploração Forçada.';

  return diagnostico;
}

// === A EQUAÇÃO UNIFICADA SOTA ===

/**
 * SOTA v6: Bayesian Range Reading.
 * Atualiza a equidade base (prior) com a força da ação observada (likelihood).
 */
export function calculateBayesianWinProb(
  priorEquity: number,
  actionStrength: number,
  rangeDensity: number = 0.5,
  potOddPressure: number = 0,
): number {
  // Likelihood: Probabilidade daquela ação ser tomada dada a força da mão
  const likelihood = Math.pow(actionStrength, Math.max(0.05, rangeDensity));

  // Teorema de Bayes: Posterior = (Likelihood * Prior) / Normalizador
  const numerator = likelihood * priorEquity;
  const denominator = likelihood * priorEquity + (1 - actionStrength) * (1 - priorEquity);

  const posterior = numerator / Math.max(0.0001, denominator);

  // Pressão de Pot Odds atua como um 'Prior Shift'
  const posteriorWithPressure = posterior * (1 + potOddPressure * 0.05);

  return Math.min(0.99, Math.max(0.01, posteriorWithPressure));
}

export function calculatePerspectivaVitoi(input: PerspectivaInput): PerspectivaResult {
  // Layer 0: Validação Semântica SOTA (Antevisão de Erros)
  const validation = PerspectivaInputSchema.safeParse(input);
  if (!validation.success) {
    if (process.env['NODE_ENV'] !== 'production') {
      console.warn('[VITOI-QUANTUM] Sanitizing input due to validation mismatch:', validation.error.issues);
    }
  }

  const {
    stacks,
    prizes,
    heroIdx,
    villainIdx,
    potSize,
    winProb,
    heroCost,
    bountyValue = 0,
    numPlayersInPot = 2,
    kappa = 0.5,
    humanNoiseFactor = 0,
  } = input;

  // Garantia de Estabilidade Numérica (Shannon Economy)
  const totalPrizes = prizes.reduce((s, v) => s + v, 0);
  const stackHero = Math.max(0.001, stacks[heroIdx] || 0);
  const stackVillain = Math.max(0.001, stacks[villainIdx] || 0);

  const { R } = _resolveRealizationFactor(input, stackHero, stackVillain, potSize, numPlayersInPot);

  // SOTA: Snapshot de Equidade e ICM
  const current = calculateMapaICM(stacks, prizes);
  const currentEquity = current.equities[heroIdx] ?? 0;
  const currentEquityPct = (currentEquity / totalPrizes) * 100;
  const { stacksWin, stacksLose, stacksFold } = _buildSimulatedStacks(
    stacks,
    heroIdx,
    villainIdx,
    potSize,
    heroCost,
    input.investidoAcumulado ?? 0,
  );
  const perspWin = calculateMapaICM(stacksWin, prizes);
  const perspLose = calculateMapaICM(stacksLose, prizes);
  const perspFold = calculateMapaICM(stacksFold, prizes);

  const winEq = perspWin.equities[heroIdx] ?? 0;
  const loseEq = perspLose.equities[heroIdx] ?? 0;
  const foldEq = perspFold.equities[heroIdx] ?? 0;

  const deltaWinPct = (winEq / totalPrizes) * 100 - currentEquityPct;
  const deltaLosePct = (loseEq / totalPrizes) * 100 - currentEquityPct;
  const deltaFoldPct = (foldEq / totalPrizes) * 100 - currentEquityPct;

  const { valuation, rioLiability, riskAdvantage } = _calculateValuationAndRio(
    current,
    deltaWinPct,
    perspWin,
    perspLose,
    input,
    totalPrizes,
    stackHero,
  );

  const { isVacuum, survivalPressure, fgsHealth, payjumpBonus, dynamicEvFold } = _calculateFoldPressure(
    input,
    stacksWin,
    deltaFoldPct,
  );
  // SOTA v7.0 GOLD: Amortização da Edge escalada pelo Risk Advantage
  // A EdgeBase é potencializada se o Hero tiver vantagem de risco (Risk Advantage > 0).
  const advantageMultiplier = 1 + riskAdvantage;
  const { edgePenalty, amortizedEdge: baseAmortizedEdge } = calculateAmortizedEdge(
    input.edgeBase,
    stackHero,
    stackVillain,
    input.spr,
    isVacuum,
  );
  const amortizedEdge = baseAmortizedEdge * advantageMultiplier;

  // Axioma Lipe Piv: Regressão Bayesiana da Equidade
  // SOTA v6: Bayesian Range Reading (Non-linear upgrade)
  const bayesianWinProb = calculateBayesianWinProb(winProb, 0.5, kappa);

  // SOTA: O passivo da derrota sofre dilatação no ICM e aversão dinâmica via Teoria do Prospecto.
  const effectiveStack = Math.min(stackHero, stackVillain);
  const baseDeltaLose = deltaLosePct * (1 / Math.max(0.1, fgsHealth));
  const prospectDeltaLose = calculateUtilityEV(baseDeltaLose, 'baseline', 2.25, effectiveStack);

  // A EQUAÇÃO UNIFICADA SOTA (Blindagem Dimensional)
  // Fichas (Chips) sofrem inflacao nao-linear (Valuation, FGS). Cash (Bounty) possui utilidade estritamente linear.
  // SOTA v7.0: O bounty Expectativa exige vitória E Realização (R).
  const bountyExpectativa = bayesianWinProb * bountyValue * R;

  // SOTA: Amortização da Edge aplicada cirurgicamente ao vetor de ganho.
  const chipWinExpectativa = bayesianWinProb * deltaWinPct * R * valuation * fgsHealth * amortizedEdge;
  const chipLoseExpectativa = (1 - bayesianWinProb) * prospectDeltaLose; // Perda é física.

  const expectativaReal = chipWinExpectativa + chipLoseExpectativa + bountyExpectativa;
  const perspectivaPct = expectativaReal - (dynamicEvFold + rioLiability);

  // SOTA: Cálculo do Teto do RP (Equidade de Indiferença)
  // O motor permite que a equação defina o teto organicamente, sem hard-cap artificial.
  const denom = deltaWinPct * R * valuation * fgsHealth * amortizedEdge - prospectDeltaLose + bountyValue * R;
  let threshEq = 0.5; // Fallback
  if (Math.abs(denom) > 1e-6) {
    const rawThresh = (dynamicEvFold + rioLiability - prospectDeltaLose) / denom;
    threshEq = Math.max(0, Math.min(0.99, rawThresh)); // Deixa a matemática fluir organicamente
  }

  // SOTA: Coeficiente de Insolvência (Ci)
  // Correção Dimensional: Ci é a razão entre dois multiplicadores adimensionais
  // Ci = (Equidade Real Realizável) / (Equidade de Indiferença Exigida pela Perspectiva)
  // Se Ci < 1, a mão é matematicamente insolvente (armadilha de pot odds).
  let ci = 0.5;
  if (threshEq > 0) {
    ci = bayesianWinProb / threshEq;
  } else if (perspectivaPct > 0) {
    ci = 1.5;
  }

  // SOTA: Instabilidade de EVs (Mutação da Margem)
  const marginInstability = Math.max(0.01, 1 / Math.max(2, effectiveStack)) * 100;

  // Diagnóstico
  const diagnostico = _buildDiagnostico({
    perspectivaPct,
    rioLiability,
    payjumpBonus,
    edgePenalty,
    investidoAcumulado: input.investidoAcumulado,
    stackHero,
    kappa,
    humanNoiseFactor,
  });

  const result = {
    handEquity: bayesianWinProb,
    currentEquityPct,
    deltaWinPct,
    deltaLosePct,
    deltaFoldPct,
    valuation,
    rioLiability,
    fgsHealth,
    survivalPressure,
    dynamicEvFold,
    perspectivaPct,
    amortizedEdge,
    ci,
    marginInstability,
    threshEq, // Novo: Equidade Limite Projetada
    realizationFactor: R,
    bountyPower: bountyValue,
    isActionBetterThanFold: perspectivaPct > 0,
    diagnostico,
    currentMapaICM: current.positionProbs[heroIdx] ?? [],
    winMapaICM: perspWin.positionProbs[heroIdx] ?? [],
    loseMapaICM: perspLose.positionProbs[heroIdx] ?? [],
  };

  if (process.env['NODE_ENV'] !== 'production') {
    PerspectivaResultSchema.parse(result);
  }

  return result;
}

/**
 * Calcula a Gravidade Estratégica (G) baseada no tamanho do pote.
 * G = ln(pot / 7.5). 7.5bb é o baseline de SRP.
 */
export function calculateGravity(potSize: number): number {
  return Math.max(0, Math.log(Math.max(1, potSize / 7.5)));
}

// === FÍSICA BASE DO POKER (FATOR DE APRISIONAMENTO SOTA) ===

export function calculateRioTension( // NOSONAR
  heroInvested: number,
  currentPot: number,
  heroRawStack: number,
  heroPosition: 'IP' | 'OOP',
  baseRioLiability: number,
  activePlayers: number = 2,
  humanNoiseFactor: number = 0,
  mitigationFactor: number = 1,
): number {
  const gravity = calculateGravity(currentPot);
  const betToCall = currentPot * 0.5;
  // SOTA v4.6: O aprisionamento escala com o custo relativo do call e a gravidade acumulada (G)
  const potEntrapment = ((heroInvested + betToCall) / Math.max(0.1, heroRawStack)) * (1 + gravity * 0.1);
  const downwardDrift = heroPosition === 'OOP' ? 1.25 : 0.85;

  const opponents = Math.max(1, activePlayers - 1);
  const mwNoiseMultiplier = Math.pow(opponents, 1 + humanNoiseFactor);

  return Math.min(1, (baseRioLiability * mwNoiseMultiplier) / 100 + potEntrapment * downwardDrift * mitigationFactor);
}

// === PROSPECT THEORY (KAHNEMAN & TVERSKY) ===

export type ReferencePointStatus = 'baseline' | 'tilt' | 'protecting' | 'bubble';

/**
 * Aplica a Curva de Utilidade (Value Function) da Teoria do Prospecto.
 * Ganhos são côncavos (retorno marginal decrescente).
 * Perdas são convexas e mais inclinadas (Loss Aversion).
 */
export function calculateUtilityEV(
  rawEv: number,
  status: ReferencePointStatus = 'baseline',
  lossAversionBase: number = 2.25,
  stackEff: number = 100,
  fgsHealth: number = 1,
): number {
  const safeStack = Math.max(2.718, stackEff);
  const stackModifier = Math.log(100) / Math.log(safeStack);

  // SOTA: Lambda agora é impulsionado inversamente pela saúde do FGS (Future Game Simulation)
  // Se fgsHealth < 1 (Risco de Bust alto), a aversão à perda cresce exponencialmente.
  const fgsModifier = 1 / Math.max(0.1, Math.pow(fgsHealth, 2));
  let lambda = lossAversionBase * stackModifier * fgsModifier;

  let alpha = 0.88; // Concavidade de ganhos
  let beta = 0.88; // Convexidade de perdas

  // O "Reference Point" altera o quão intensa é a dor da perda ou a busca pelo risco
  switch (status) {
    case 'tilt':
      // "Stuck" (perdendo): Busca o risco. A dor adicional diminui, e a aversão à perda cai (chasing losses)
      lambda = lambda * 0.66;
      beta = 0.95; // Mais próximo da linearidade nas perdas
      break;
    case 'protecting':
      // Acima do Buy-in: Protegendo o lucro. Extrema aversão à perda.
      lambda = lambda * 1.33;
      alpha = 0.75; // Ganhos adicionais valem muito menos
      break;
    case 'bubble':
      // Sobrevivência extrema: O valor da ficha perdida é astronômico
      lambda = lambda * 2;
      break;
    case 'baseline':
    default:
      break;
  }

  if (rawEv >= 0) {
    // Área de Ganhos
    return Math.pow(rawEv, alpha);
  } else {
    // Área de Perdas
    return -lambda * Math.pow(Math.abs(rawEv), beta);
  }
}

// SOTA: Seletor de Métricas Quantum (Erradicação de redundância matemática na UI)
export function computeQuantumMetrics(quantumPerspectiva: PerspectivaResult | null) {
  if (!quantumPerspectiva)
    return {
      amortizedEdgeMultiplier: 1,
      rioMw: 0,
      adjustedEvFold: 0,
      esperanca: 0,
      expectativa: 0,
      perspectiva: 0,
      threshEq: null,
      ci: null,
      marginInstability: 0,
      isSolvent: false,
      isActionable: false,
    };

  // SOTA: Extração direta do motor core (PerspectivaResult) para garantir consistência absoluta.
  return {
    amortizedEdgeMultiplier: quantumPerspectiva.amortizedEdge,
    rioMw: quantumPerspectiva.rioLiability,
    adjustedEvFold: quantumPerspectiva.dynamicEvFold,
    esperanca: quantumPerspectiva.perspectivaPct, // Alinhado: Esperança agora é o PM base
    expectativa: quantumPerspectiva.deltaWinPct,
    perspectiva: quantumPerspectiva.perspectivaPct,
    threshEq: quantumPerspectiva.threshEq,
    ci: quantumPerspectiva.ci,
    marginInstability: quantumPerspectiva.marginInstability,
    isSolvent: quantumPerspectiva.ci >= 1,
    isActionable: quantumPerspectiva.perspectivaPct > 0,
  };
}
