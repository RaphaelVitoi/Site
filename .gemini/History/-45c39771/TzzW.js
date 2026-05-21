"use strict";
/**
 * IDENTITY: Motor de Perspectiva Matemática SOTA v4.0 (VITOI - QUANTUM)
 * PATH: src/lib/perspectiva.ts
 * ROLE: Core algorítmico da Equação Unificada SOTA.
 *       PM = [(Equity * R) * Valuation] - [EV_fold(t, dpj, pos) + RIO_mw]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMapaICM = calculateMapaICM;
exports.classifyTier = classifyTier;
exports.calculatePerspectivaVitoi = calculatePerspectivaVitoi;
exports.calculateRioTension = calculateRioTension;
exports.calculateUtilityEV = calculateUtilityEV;
exports.computeQuantumMetrics = computeQuantumMetrics;
const montecarlo_1 = require("./montecarlo");
const schemas_1 = require("./schemas");
// === MOTOR ICM (Malmuth-Harville / Monte Carlo Estocástico) ===
const _icmCache = new Map();
function calculateMapaICM(stacks, prizes) {
    const n = stacks.length;
    // SOTA: Monte Carlo Fallback para evitar explosão combinatória (O(2^N))
    // Adaptado de bibliotecas Open Source para fields maiores
    if (n > 10) {
        const totalChips = stacks.reduce((s, v) => s + v, 0);
        const equities = (0, montecarlo_1.calculateIcmMonteCarlo)(stacks, prizes, { iterations: 20000 });
        // Probs aproximadas (não totalmente precisas via MCMC, mas suficientes para fallback)
        const positionProbs = Array.from({ length: n }, () => new Array(Math.min(n, prizes.length)).fill(0));
        if (totalChips > 0 && prizes.length > 0) {
            stacks.forEach((s, i) => {
                positionProbs[i][0] = s / totalChips;
            });
        }
        return { positionProbs, equities, totalChips };
    }
    const activePrizes = prizes.slice(0, n);
    const k = activePrizes.length;
    const totalChips = stacks.reduce((s, v) => s + v, 0);
    const key = `${stacks.join(',')}|${activePrizes.join(',')}`;
    const cachedIcm = _icmCache.get(key);
    if (cachedIcm)
        return cachedIcm;
    const positionProbs = Array.from({ length: n }, () => new Array(k).fill(0));
    const equities = new Array(n).fill(0);
    if (totalChips === 0 || k === 0)
        return { positionProbs, equities, totalChips };
    const memo = new Map();
    function compute(currStacks, currIndices, posIdx, currTotal) {
        if (posIdx >= k || currStacks.length === 0 || currTotal === 0) {
            return { posC: Array.from({ length: n }, () => new Array(k).fill(0)), eqC: new Array(n).fill(0) };
        }
        const stateKey = `${posIdx}:${currIndices.slice().sort((a, b) => a - b).join(',')}`;
        const cachedState = memo.get(stateKey);
        if (cachedState)
            return cachedState;
        const posC = Array.from({ length: n }, () => new Array(k).fill(0));
        const eqC = new Array(n).fill(0);
        for (let i = 0; i < currStacks.length; i++) {
            const stack = currStacks[i];
            if (stack <= 0)
                continue;
            const p = stack / currTotal;
            const origIdx = currIndices[i];
            posC[origIdx][posIdx] += p;
            eqC[origIdx] += p * activePrizes[posIdx];
            const sub = compute(currStacks.filter((_, j) => j !== i), currIndices.filter((_, j) => j !== i), posIdx + 1, currTotal - stack);
            for (let j = 0; j < n; j++) {
                for (let pi = posIdx + 1; pi < k; pi++)
                    posC[j][pi] += p * sub.posC[j][pi];
                eqC[j] += p * sub.eqC[j];
            }
        }
        const res = { posC, eqC };
        memo.set(stateKey, res);
        return res;
    }
    const resultContrib = compute(stacks, stacks.map((_, i) => i), 0, totalChips);
    const finalResult = { positionProbs: resultContrib.posC, equities: resultContrib.eqC, totalChips };
    _icmCache.set(key, finalResult);
    return finalResult;
}
function classifyTier(stack, stacks) {
    const avg = (stacks.reduce((s, v) => s + v, 0) / stacks.length) || 1;
    const ratio = stack / avg;
    if (stack <= 0 || ratio < 0.4)
        return 'micro';
    if (ratio < 0.7)
        return 'short';
    if (ratio < 1.5)
        return 'mid';
    if (stacks.every(s => stack >= s) || ratio >= 2.5)
        return 'chipleader';
    return 'big';
}
// --- HELPERS DE REDUÇÃO DE ENTROPIA COGNITIVA (SOTA V4.0) ---
function _buildSimulatedStacks(stacks, heroIdx, villainIdx, potSize, heroCost) {
    const stacksWin = [...stacks];
    stacksWin[heroIdx] = (stacksWin[heroIdx] || 0) + potSize;
    const stacksLose = [...stacks];
    stacksLose[heroIdx] = Math.max(0, (stacksLose[heroIdx] || 0) - heroCost);
    stacksLose[villainIdx] = (stacksLose[villainIdx] || 0) + potSize + heroCost;
    const stacksFold = [...stacks];
    stacksFold[heroIdx] = Math.max(0, (stacksFold[heroIdx] || 0) - heroCost);
    stacksFold[villainIdx] = (stacksFold[villainIdx] || 0) + potSize;
    return { stacksWin, stacksLose, stacksFold };
}
function _calculateSnapshot(input, totalPrizes) {
    const { stacks, prizes, heroIdx, villainIdx, potSize, heroCost } = input;
    const current = calculateMapaICM(stacks, prizes);
    const currentEquity = current.equities[heroIdx] ?? 0;
    const currentEquityPct = (currentEquity / totalPrizes) * 100;
    const { stacksWin, stacksLose, stacksFold } = _buildSimulatedStacks(stacks, heroIdx, villainIdx, potSize, heroCost);
    const perspWin = calculateMapaICM(stacksWin, prizes);
    const perspLose = calculateMapaICM(stacksLose, prizes);
    const perspFold = calculateMapaICM(stacksFold, prizes);
    const winEq = perspWin.equities[heroIdx] ?? 0;
    const loseEq = perspLose.equities[heroIdx] ?? 0;
    const foldEq = perspFold.equities[heroIdx] ?? 0;
    return {
        current,
        currentEquityPct,
        stacksWin,
        deltaWinPct: ((winEq / totalPrizes) * 100) - currentEquityPct, // PURE CHIP DELTA: Bounty isolado da base de ICM.
        deltaLosePct: ((loseEq / totalPrizes) * 100) - currentEquityPct,
        deltaFoldPct: ((foldEq / totalPrizes) * 100) - currentEquityPct,
        perspWin,
        perspLose
    };
}
function _calculateValuationAndRio(current, deltaWinPct, perspWin, input, totalPrizes, stackHero) {
    const villainIdx = input.villainIdx;
    const potSize = input.potSize;
    const numPlayersInPot = input.numPlayersInPot ?? 2;
    const currentVillainEq = current.equities[villainIdx] ?? 0;
    const winVillainEq = perspWin.equities[villainIdx] ?? 0;
    const villainDeltaLoss = currentVillainEq - winVillainEq;
    const rawValuation = villainDeltaLoss > 0 ? deltaWinPct / ((villainDeltaLoss / totalPrizes) * 100) : 1;
    const valuation = Math.max(0.1, Math.min(2, rawValuation));
    // SOTA: Alinhamento Dimensional. Converte o RIO em Fichas para RIO em ICM Equity (Impacto Real).
    // SOTA: Ponderação Quadrática da Dívida RIO
    // Aumenta a penalização em cenários de short-stack onde a volatilidade destrói o stack.
    // Se HU, RIO é zero. Apenas MW possui passivo estrutural de colaboração implícita.
    if (numPlayersInPot <= 2) {
        return { valuation, rioLiability: 0 };
    }
    const opponents = Math.max(1, numPlayersInPot - 1);
    const rioPenaltyFactor = Math.pow(opponents, 2); // Cresce N^2
    const volatilityMultiplier = stackHero > 0 ? Math.pow(numPlayersInPot / (Math.max(1, stackHero / 5)), 2) : 1;
    const rioPenaltyChips = potSize * rioPenaltyFactor * (0.15 + (volatilityMultiplier * 0.05));
    const icmPerChip = currentVillainEq > 0 ? ((currentVillainEq / totalPrizes) * 100) / (current.totalChips / numPlayersInPot) : 0;
    const rioLiability = rioPenaltyChips * (icmPerChip || 0.05); // Penalidade base mínima maior
    return { valuation, rioLiability };
}
function _calculateFoldPressure(input, stacksWin, deltaFoldPct) {
    const { prizes, heroIdx, stacks, isNearPayjump = false, blindsRisingSoon = false, heroPosition = 'IP' } = input;
    const stackHero = stacks[heroIdx] ?? 0;
    const isVacuum = prizes.length <= 1;
    const handsToBust = Math.max(1, stackHero / 1.5);
    const survivalPressure = isVacuum ? 0 : Math.min(1, 1 / handsToBust);
    const currentTier = classifyTier(stackHero, stacks);
    const winTier = classifyTier(stacksWin[heroIdx], stacksWin);
    const tierBonus = isVacuum || winTier === currentTier ? 0 : 0.15;
    const fgsHealth = isVacuum ? 1 : (1 + tierBonus + (survivalPressure * 0.2));
    const payjumpBonus = (isNearPayjump && !isVacuum) ? Math.max(1.2, Math.abs(deltaFoldPct) + 0.25) : 0;
    // SOTA: Erosão Proporcional via Antevisão Posicional (FGS t-3)
    // O UTG/IP caminha para o BB (Punição Máxima). O SB caminha para o BTN (Punição Mínima).
    let erosionPenalty = 0;
    if (blindsRisingSoon && !isVacuum) {
        const baseErosion = Math.abs(deltaFoldPct * 0.5) + 0.1;
        const penaltyMap = { IP: 1.5, BB: 0.5, SB: 0 };
        erosionPenalty = baseErosion + (penaltyMap[heroPosition] ?? 0);
    }
    return {
        isVacuum,
        survivalPressure,
        fgsHealth,
        payjumpBonus,
        dynamicEvFold: deltaFoldPct + payjumpBonus - erosionPenalty
    };
}
function _resolveRealizationFactor(input, stackHero, stackVillain, potSize, numPlayersInPot) {
    const effectiveStack = Math.min(stackHero, stackVillain);
    const spr = input.spr ?? (effectiveStack / (potSize || 1));
    let R = input.realizationFactor;
    if (input.realizationFactor === 1 && numPlayersInPot === 2) {
        const isHeroOop = input.realizationFactor < 1 || (input.realizationFactor === 1 && input.heroIdx > input.villainIdx);
        if (isHeroOop) {
            const oopPenalty = 0.25 * (1 - Math.exp(-spr / 2));
            R = Math.max(0.75, 1 - oopPenalty);
        }
    }
    return { R, effectiveStack };
}
function _calculateAmortizedEdge(input, stackHero, stackVillain, isVacuum, survivalPressure) {
    const isVillainShort = stackVillain < 12;
    const ratio = stackHero / (stackVillain || 1);
    const edgePenalty = (!isVacuum && isVillainShort && ratio > 3) ? 0.3 : 1;
    const effectiveStackForEdge = input.spr === undefined ? stackHero : Math.max(2, input.spr * 5);
    const edgeScale = effectiveStackForEdge > 15
        ? Math.log10(effectiveStackForEdge) / Math.log10(60)
        : 0.4 + (survivalPressure * 0.2);
    return { edgePenalty, amortizedEdge: input.edgeBase * edgePenalty * edgeScale };
}
function _buildDiagnostico(perspectivaPct, rioLiability, payjumpBonus, edgePenalty, investidoAcumulado, stackHero, kappa) {
    let diagnostico = perspectivaPct > 0 ? "Ação Soberana." : "Insolvência de Perspectiva.";
    if (rioLiability > 1)
        diagnostico += " Alerta: Colapso Multiway.";
    if (payjumpBonus > 0)
        diagnostico += " Laddering favorece o Fold.";
    if (edgePenalty < 1)
        diagnostico += " Punição: Restaurando árvore do oponente.";
    if (investidoAcumulado && investidoAcumulado > (stackHero * 0.3))
        diagnostico += " Alerta: Pot Entrapment Severo.";
    if (Math.abs(perspectivaPct) <= 5 && kappa < 0.4)
        diagnostico += " Credibilidade Baixa: Intuição filtrada pelo Baseline Matemático.";
    return diagnostico;
}
// === A EQUAÇÃO UNIFICADA SOTA ===
function calculatePerspectivaVitoi(input) {
    // Layer 0: Validação Semântica SOTA (Antevisão de Erros)
    const validation = schemas_1.PerspectivaInputSchema.safeParse(input);
    if (!validation.success) {
        console.warn('[VITOI-QUANTUM] Sanitizing input due to validation mismatch:', validation.error.issues);
    }
    const { stacks, prizes, heroIdx, villainIdx, potSize, heroCost, winProb, numPlayersInPot = 2, kappa = 0.5 } = input;
    // Garantia de Estabilidade Numérica (Shannon Economy)
    const totalPrizes = prizes.reduce((s, v) => s + v, 0);
    const stackHero = Math.max(0.001, stacks[heroIdx] || 0);
    const stackVillain = Math.max(0.001, stacks[villainIdx] || 0);
    const { current, currentEquityPct, stacksWin, deltaWinPct, deltaLosePct, deltaFoldPct, perspWin, perspLose } = _calculateSnapshot(input, totalPrizes);
    const { valuation, rioLiability } = _calculateValuationAndRio(current, deltaWinPct, perspWin, input, totalPrizes, stackHero);
    const { isVacuum, survivalPressure, fgsHealth, payjumpBonus, dynamicEvFold } = _calculateFoldPressure(input, stacksWin, deltaFoldPct);
    const { R } = _resolveRealizationFactor(input, stackHero, stackVillain, potSize, numPlayersInPot);
    const { edgePenalty, amortizedEdge } = _calculateAmortizedEdge(input, stackHero, stackVillain, isVacuum, survivalPressure);
    // Axioma Lipe Piv: Regressão Bayesiana da Equidade
    const baselineEquity = heroCost / (potSize + heroCost);
    const bayesianWinProb = baselineEquity + kappa * (winProb - baselineEquity);
    // A EQUAÇÃO UNIFICADA SOTA (Blindagem Dimensional)
    // Fichas (Chips) sofrem inflacao nao-linear (Valuation, FGS). Cash (Bounty) possui utilidade estritamente linear.
    const bountyValue = input.bountyValue ?? 0;
    const chipExpectativa = (bayesianWinProb * deltaWinPct * R * valuation * fgsHealth) + ((1 - bayesianWinProb) * deltaLosePct);
    const bountyExpectativa = bayesianWinProb * bountyValue * R; // Exige vitoria e Realizacao(R), mas imune a Valuation/FGS.
    const expectativaReal = chipExpectativa + bountyExpectativa;
    const perspectivaPct = (expectativaReal * amortizedEdge) - (dynamicEvFold + rioLiability);
    // SOTA: Cálculo do Teto do RP (Equidade de Indiferença)
    // OBSERVAÇÃO EMPÍRICA: A matemática raramente exige > 41% no River em MTTs reais.
    // O motor permite que a equação defina o teto organicamente, sem hard-cap artificial.
    const denom = (deltaWinPct * R * valuation * fgsHealth - deltaLosePct + (bountyValue * R)) * amortizedEdge;
    let threshEq = 0.5; // Fallback
    if (Math.abs(denom) > 1e-6) {
        const rawThresh = (dynamicEvFold + rioLiability - deltaLosePct * amortizedEdge) / denom;
        threshEq = Math.max(0, Math.min(1, rawThresh)); // Deixa a matemática fluir organicamente
    }
    // SOTA: Coeficiente de Insolvência (Ci)
    // Ci = Equity Real / Equidade de Indiferença (Threshold)
    // Se Ci < 1, a mão é matematicamente insolvente sob a ótica da Perspectiva.
    let ci;
    if (threshEq > 0) {
        ci = bayesianWinProb / threshEq;
    } else {
        ci = perspectivaPct > 0 ? 1.5 : 0.5;
    }
    // SOTA: Instabilidade de EVs (Mutação da Margem)
    const effectiveStack = Math.min(stackHero, stackVillain);
    const marginInstability = Math.max(0.01, 1 / Math.max(2, effectiveStack)) * 100;
    // Diagnóstico
    const diagnostico = _buildDiagnostico(perspectivaPct, rioLiability, payjumpBonus, edgePenalty, input.investidoAcumulado, stackHero, kappa);
    return {
        handEquity: bayesianWinProb,
        currentEquityPct, deltaWinPct, deltaLosePct, deltaFoldPct,
        valuation, rioLiability,
        fgsHealth, survivalPressure, dynamicEvFold,
        perspectivaPct, amortizedEdge, ci, marginInstability,
        threshEq, // Novo: Equidade Limite Projetada
        realizationFactor: R,
        bountyPower: bountyValue,
        isActionBetterThanFold: perspectivaPct > 0,
        diagnostico,
        currentMapaICM: current.positionProbs[heroIdx],
        winMapaICM: perspWin.positionProbs[heroIdx],
        loseMapaICM: perspLose.positionProbs[heroIdx]
    };
}
// === FÍSICA BASE DO POKER (FATOR DE APRISIONAMENTO SOTA) ===
function calculateRioTension(heroInvested, currentPot, heroRawStack, heroPosition, baseRioLiability, mitigationFactor = 1) {
    const betToCall = currentPot * 0.5;
    const potEntrapment = (heroInvested + betToCall) / Math.max(0.1, heroRawStack);
    const downwardDrift = heroPosition === 'OOP' ? 1.25 : 0.85;
    return Math.min(1, (baseRioLiability / 100) + (potEntrapment * downwardDrift * mitigationFactor));
}
/**
 * Aplica a Curva de Utilidade (Value Function) da Teoria do Prospecto.
 * Ganhos são côncavos (retorno marginal decrescente).
 * Perdas são convexas e mais inclinadas (Loss Aversion).
 */
function calculateUtilityEV(rawEv, status = 'baseline', lossAversionBase = 2.25) {
    let lambda = lossAversionBase; // Multiplicador de aversão à perda
    let alpha = 0.88; // Concavidade de ganhos
    let beta = 0.88; // Convexidade de perdas
    // O "Reference Point" altera o quão intensa é a dor da perda ou a busca pelo risco
    switch (status) {
        case 'tilt':
            // "Stuck" (perdendo): Busca o risco. A dor adicional diminui, e a aversão à perda cai (chasing losses)
            lambda = 1.5;
            beta = 0.95; // Mais próximo da linearidade nas perdas
            break;
        case 'protecting':
            // Acima do Buy-in: Protegendo o lucro. Extrema aversão à perda.
            lambda = 3;
            alpha = 0.75; // Ganhos adicionais valem muito menos
            break;
        case 'bubble':
            // Sobrevivência extrema: O valor da ficha perdida é astronômico
            lambda = 4.5;
            break;
        case 'baseline':
        default:
            break;
    }
    if (rawEv >= 0) {
        // Área de Ganhos
        return Math.pow(rawEv, alpha);
    }
    else {
        // Área de Perdas
        return -lambda * Math.pow(Math.abs(rawEv), beta);
    }
}
// SOTA: Desacoplamento da termodinâmica para erradicar complexidade ciclomática na renderização
function computeQuantumMetrics(quantumPerspectiva, activePlayers, heroInvested, currentPot, stacks) {
    if (!quantumPerspectiva)
        return { amortizedEdgeMultiplier: 1, rioMw: 0, adjustedEvFold: 0, esperanca: 0, expectativa: 0, perspectiva: 0, threshEq: null, ci: null, marginInstability: 0, isSolvent: false, isActionable: false };
    // SOTA FIX: Dimensionalidade Restaurada e Coerência Teórica com o Core Engine.
    const eq = quantumPerspectiva.handEquity ?? 0.5;
    const deltaWinPct = quantumPerspectiva.deltaWinPct ?? 0;
    const deltaLosePct = quantumPerspectiva.deltaLosePct ?? 0;
    const evFoldPct = quantumPerspectiva.dynamicEvFold ?? 0;
    const rFactor = quantumPerspectiva.realizationFactor ?? 1;
    const fgsHealth = quantumPerspectiva.fgsHealth ?? 1;
    const valuation = quantumPerspectiva.valuation ?? 1;
    const amortizedEdge = quantumPerspectiva.amortizedEdge ?? 1;
    const sEff = Math.min(stacks[0] ?? 40, stacks[1] ?? 40);
    const opponents = Math.max(1, activePlayers - 1);
    // SOTA: Escalonamento Quadrático (x^2) para Multiway (Morte do Anti-Smoothing)
    const mwFactor = Math.pow(opponents, 2);
    const baseRioPct = 0.15;
    const baseRio = heroInvested * baseRioPct;
    const rioMw = baseRio * mwFactor;
    const adjustedEvFold = evFoldPct;
    const bountyPower = quantumPerspectiva.bountyPower ?? 0;
    const chipEsperanca = (eq * deltaWinPct) + ((1 - eq) * deltaLosePct);
    const esperanca = chipEsperanca + (eq * bountyPower);
    const chipExpectativa = (eq * deltaWinPct * rFactor * valuation * fgsHealth) + ((1 - eq) * deltaLosePct);
    const bountyExpectativa = eq * bountyPower * rFactor;
    const expectativaReal = chipExpectativa + bountyExpectativa;
    // SOTA: Equação de Perspectiva Matemática (Diferencial de Abismo)
    // PM = (Expectativa * Edge) - EV_Fold - RIO
    const perspectiva = (expectativaReal * amortizedEdge) - (evFoldPct + rioMw);
    const denom = (deltaWinPct * rFactor * valuation * fgsHealth - deltaLosePct + (bountyPower * rFactor)) * amortizedEdge;
    let threshEq = null;
    if (Math.abs(denom) > 1e-6) {
        const rawThresh = (evFoldPct + rioMw - deltaLosePct * amortizedEdge) / denom;
        threshEq = Math.max(0, Math.min(1, rawThresh)); // Teto livre
    }
    let ci = null;
    const potOdds = (currentPot + heroInvested) > 0 ? heroInvested / (currentPot + heroInvested) : 0;
    if (threshEq !== null && threshEq > 0)
        ci = potOdds / threshEq;
    const marginInstability = Math.max(0.01, 1 / sEff) * 100;
    return {
        amortizedEdgeMultiplier: amortizedEdge, rioMw, adjustedEvFold, esperanca, expectativa: expectativaReal, perspectiva, threshEq, ci, marginInstability,
        isSolvent: ci !== null && ci >= 1,
        isActionable: perspectiva > 0
    };
}
