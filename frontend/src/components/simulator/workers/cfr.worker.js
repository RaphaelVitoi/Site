/**
 * IDENTITY: CFR Engine SOTA (Web Worker)
 * PATH: src/components/simulator/workers/cfr.worker.ts
 * ROLE: Implementar Regret Matching real off-thread para Matriz 13x13.
 */
/* eslint-disable no-console */
// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito para erradicar o bug de parsing de EOF do Turbopack.
// SonarLint S7787: export vazio não é permitido, exportamos um token const para forçar o module scope.
export const __CFR_WORKER__ = true;
const ACTIONS = 3; // 0: Fold, 1: Call, 2: Raise
let regretSum = null;
let strategySum = null;
let currentStrategy = null;
let lastScenarioHash = null;
function computeNodeCfr(i, config, localRegret, localStrategy, currentStrategy, renderMatrix) {
    const { nodes, pot, stack, kappa } = config;
    const row = Math.floor(i / nodes);
    const col = i % nodes;
    // Força da mão [0 a 1] (Heurística base para a malha)
    const rank1 = 1 - row / nodes;
    const rank2 = 1 - col / nodes;
    const isSuited = col > row;
    const handStrength = (rank1 + rank2) / 2 + (isSuited ? 0.05 : 0);
    // 1. Utilities (Cálculo de Expectativa)
    const evFold = 0;
    const evCall = handStrength * pot - (1 - handStrength) * (pot * 0.5);
    const evRaise = handStrength * (pot * 2) - (1 - handStrength) * stack;
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
        }
        else {
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
    for (let a = 0; a < ACTIONS; a++) {
        const regret = utilities[a] - nodeUtil;
        localRegret[offset + a] = (localRegret[offset + a] + regret) * kappa;
    }
    // Heurística de Exibição (Probabilidade agregada de agressão: Call/Raise)
    let maxAggression = 0;
    for (let a = 1; a < ACTIONS; a++) {
        maxAggression += currentStrategy[offset + a];
    }
    renderMatrix[i] = maxAggression;
}
globalThis.onmessage = (e) => {
    const { id, nodes, pot, stack, kappa } = e.data;
    if (!id || typeof nodes !== 'number' || typeof pot !== 'number') {
        console.warn('[SOTA CFR Worker] Invalid payload discarded.', e.data);
        return;
    }
    try {
        const totalNodes = nodes * nodes;
        const currentScenarioHash = `${nodes}-${pot}-${stack}-${kappa}`;
        // Alocação Contígua Estrita & Reset de Cenário
        if (regretSum?.length !== totalNodes * ACTIONS ||
            lastScenarioHash !== currentScenarioHash) {
            regretSum = new Float32Array(totalNodes * ACTIONS);
            strategySum = new Float32Array(totalNodes * ACTIONS);
            currentStrategy = new Float32Array(totalNodes * ACTIONS);
            lastScenarioHash = currentScenarioHash;
        }
        // SOTA: O renderMatrix DEVE ser instanciado novo a cada iteração, pois sua posse (ownership) será transferida ao host
        const renderMatrix = new Float32Array(totalNodes);
        if (regretSum && strategySum && currentStrategy) {
            // Iteração CFR Pura
            for (let i = 0; i < totalNodes; i++) {
                computeNodeCfr(i, { nodes, pot, stack, kappa }, regretSum, strategySum, currentStrategy, renderMatrix);
            }
        }
        // SOTA FIX: Transferência O(1) via Zero-Copy (Transferable Objects)
        globalThis.postMessage({ id, matrix: renderMatrix }, [
            renderMatrix.buffer,
        ]);
    }
    catch (error) {
        let errorMessage = 'Erro desconhecido no motor CFR puro.';
        if (error instanceof Error)
            errorMessage = error.message;
        else if (typeof error === 'string')
            errorMessage = error;
        console.error('[SOTA CFR Worker] Falha estrutural:', errorMessage);
        globalThis.postMessage({ id, error: errorMessage });
    }
};
