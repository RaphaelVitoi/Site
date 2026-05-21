/**
 * IDENTITY: CFR Engine SOTA (Web Worker)
 * PATH: src/components/simulator/workers/cfr.worker.ts
 * ROLE: Implementar Regret Matching real off-thread para Matriz 13x13.
 */

const ACTIONS = 3; // 0: Fold, 1: Call, 2: Raise
let regretSum: Float32Array | null = null;
let strategySum: Float32Array | null = null;

function computeNodeCfr(
    i: number, nodes: number, pot: number, stack: number, kappa: number,
    localRegret: Float32Array, localStrategy: Float32Array,
    currentStrategy: Float32Array, renderMatrix: Float32Array
) {
    const row = Math.floor(i / nodes);
    const col = i % nodes;

    // Força da mão [0 a 1] (Heurística base para a malha)
    const rank1 = 1 - (row / nodes);
    const rank2 = 1 - (col / nodes);
    const isSuited = col > row;
    const handStrength = ((rank1 + rank2) / 2) + (isSuited ? 0.05 : 0);

    // 1. Utilities (Cálculo de Expectativa)
    const evFold = 0;
    const evCall = (handStrength * pot) - ((1 - handStrength) * (pot * 0.5));
    const evRaise = (handStrength * (pot * 2)) - ((1 - handStrength) * stack);

    const utilities = [evFold, evCall, evRaise];

    // 2. Regret Matching -> Obter estratégia proporcional atual
    let normalizingSum = 0;
    const offset = i * ACTIONS;

    for (let a = 0; a < ACTIONS; a++) {
        currentStrategy[offset + a] = Math.max(localRegret[offset + a], 0);
        normalizingSum += currentStrategy[offset + a];
    }

    for (let a = 0; a < ACTIONS; a++) {
        if (normalizingSum > 0) {
            currentStrategy[offset + a] /= normalizingSum;
        } else {
            currentStrategy[offset + a] = 1 / ACTIONS; // Distribuição uniforme se arrependimento for negativo
        }
        localStrategy[offset + a] += currentStrategy[offset + a];
    }

    // 3. Node Utility (EV da estratégia mista)
    let nodeUtil = 0;
    for (let a = 0; a < ACTIONS; a++) {
        nodeUtil += currentStrategy[offset + a] * utilities[a];
    }

    // 4. Atualizar Arrependimentos (Regrets) com Fator de Diluição (Kappa)
    let maxStrategyProb = 0;
    for (let a = 0; a < ACTIONS; a++) {
        const regret = utilities[a] - nodeUtil;
        localRegret[offset + a] = (localRegret[offset + a] + regret) * kappa;

        // Heurística de Exibição (Probabilidade agregada de agressão: Call/Raise)
        if (a > 0) maxStrategyProb += currentStrategy[offset + a];
    }

    renderMatrix[i] = maxStrategyProb;
}

globalThis.onmessage = (e) => {
    const { id, nodes, pot, stack, kappa } = e.data;
    const totalNodes = nodes * nodes;

    // Alocação Contígua Estrita (Prevenção contra Memory Leaks)
    if (regretSum?.length !== totalNodes * ACTIONS) {
        regretSum = new Float32Array(totalNodes * ACTIONS);
        strategySum = new Float32Array(totalNodes * ACTIONS);
    }

    const currentStrategy = new Float32Array(totalNodes * ACTIONS);
    const renderMatrix = new Float32Array(totalNodes);

    if (regretSum && strategySum) {
        // Iteração CFR Pura
        for (let i = 0; i < totalNodes; i++) {
            computeNodeCfr(i, nodes, pot, stack, kappa, regretSum, strategySum, currentStrategy, renderMatrix);
        }
    }

    globalThis.postMessage({ id, matrix: renderMatrix });
};
