/**
 * IDENTITY: CFR Engine SOTA (Web Worker)
 * PATH: src/components/simulator/workers/cfr.worker.ts
 * ROLE: Implementar Regret Matching real off-thread para Matriz 13x13.
 */

// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito para erradicar o bug de parsing de EOF do Turbopack.
// SonarLint S7787: export vazio não é permitido, exportamos um token const para forçar o module scope.
export const __CFR_WORKER__ = true;

const ACTIONS = 3; // 0: Fold, 1: Call, 2: Raise
let regretSum: Float32Array | null = null;
let strategySum: Float32Array | null = null;
let currentStrategy: Float32Array | null = null;
let lastScenarioHash: string | null = null;

interface CfrConfig {
  nodes: number;
  pot: number;
  stack: number;
  kappa: number;
}

function computeNodeCfr(
  i: number,
  config: CfrConfig,
  localRegret: Float32Array,
  localStrategy: Float32Array,
  currentStrategy: Float32Array,
  renderMatrix: Float32Array,
) {
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

  // 2. Regret Matching -> Obter estratégia proporcional atual
  const offset = i * ACTIONS;
  const idx0 = offset;
  const idx1 = offset + 1;
  const idx2 = offset + 2;

  const r0 = Math.max(localRegret.at(idx0) ?? 0, 0);
  const r1 = Math.max(localRegret.at(idx1) ?? 0, 0);
  const r2 = Math.max(localRegret.at(idx2) ?? 0, 0);

  const normalizingSum = r0 + r1 + r2;
  const s0 = normalizingSum > 0 ? r0 / normalizingSum : 1 / ACTIONS;
  const s1 = normalizingSum > 0 ? r1 / normalizingSum : 1 / ACTIONS;
  const s2 = normalizingSum > 0 ? r2 / normalizingSum : 1 / ACTIONS;

  currentStrategy.set([s0, s1, s2], offset);
  localStrategy.set(
    [
      (localStrategy.at(idx0) ?? 0) + s0,
      (localStrategy.at(idx1) ?? 0) + s1,
      (localStrategy.at(idx2) ?? 0) + s2,
    ],
    offset,
  );

  // 3. Node Utility (EV da estratégia mista)
  const nodeUtil = s0 * evFold + s1 * evCall + s2 * evRaise;

  // 4. Atualizar Arrependimentos (Regrets) com Fator de Diluição (Kappa)
  localRegret.set(
    [
      ((localRegret.at(idx0) ?? 0) + (evFold - nodeUtil)) * kappa,
      ((localRegret.at(idx1) ?? 0) + (evCall - nodeUtil)) * kappa,
      ((localRegret.at(idx2) ?? 0) + (evRaise - nodeUtil)) * kappa,
    ],
    offset,
  );

  // Heurística de Exibição (Probabilidade agregada de agressão: Call/Raise)
  renderMatrix.set([s1 + s2], i);
}

interface CfrMessageData {
  id: string | number;
  nodes: number;
  pot: number;
  stack: number;
  kappa: number;
}

globalThis.onmessage = (e: MessageEvent<CfrMessageData>) => {
  const { id, nodes, pot, stack, kappa } = e.data;

  if (!id || typeof nodes !== 'number' || typeof pot !== 'number') {
    console.warn('[SOTA CFR Worker] Invalid payload discarded.', e.data);
    return;
  }

  try {
    const totalNodes = nodes * nodes;
    const currentScenarioHash = `${nodes}-${pot}-${stack}-${kappa}`;

    // Alocação Contígua Estrita & Reset de Cenário
    if (regretSum?.length !== totalNodes * ACTIONS || lastScenarioHash !== currentScenarioHash) {
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
    (globalThis as unknown as Worker).postMessage({ id, matrix: renderMatrix }, [renderMatrix.buffer]);
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido no motor CFR puro.';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;

    console.error('[SOTA CFR Worker] Falha estrutural:', errorMessage);
    (globalThis as unknown as Worker).postMessage({ id, error: errorMessage });
  }
};
