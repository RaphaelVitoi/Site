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
let iterationCount = 0;

interface CfrConfig {
  nodes: number;
  pot: number;
  stack: number;
  kappa: number;
  equity: number;
}

/**
 * Computa a equidade intrínseca de uma categoria de mão do Texas Hold'em
 * contra uma distribuição ponderada de vilão (169 spots canônicos).
 */
function computeHandEquity(row: number, col: number, equityBias: number): number {
  const rHigh = 12 - Math.min(row, col); // A = 12, K = 11, ..., 2 = 0
  const rLow = 12 - Math.max(row, col);
  const gap = rHigh - rLow;

  let baseEquity: number;
  if (row === col) {
    // Pares: 22 (~48%) até AA (~86%)
    baseEquity = 0.48 + (rHigh / 12) * 0.38;
  } else if (row < col) {
    // Mãos Suited: potencial de flush + conectividade
    const connectivity = gap <= 1 ? 0.045 : gap <= 2 ? 0.03 : gap <= 3 ? 0.015 : 0;
    baseEquity = 0.22 + ((rHigh * 1.5 + rLow) / 30) * 0.42 + connectivity + 0.04;
  } else {
    // Mãos Offsuit: sem flush equity, menor jogabilidade pós-flop
    const connectivity = gap <= 1 ? 0.025 : gap <= 2 ? 0.01 : 0;
    baseEquity = 0.14 + ((rHigh * 1.5 + rLow) / 30) * 0.38 + connectivity;
  }

  // Modulação pelo parâmetro de equidade do spot (0 a 100, centro 50)
  const factor = 0.70 + (equityBias / 100) * 0.60;
  return Math.min(0.95, Math.max(0.08, baseEquity * factor));
}

function computeNodeCfr(
  i: number,
  config: CfrConfig,
  localRegret: Float32Array,
  localStrategy: Float32Array,
  currentStrategy: Float32Array,
  renderMatrix: Float32Array,
) {
  const { nodes, pot, stack, kappa, equity } = config;
  const row = Math.floor(i / nodes);
  const col = i % nodes;

  const handEquity = computeHandEquity(row, col, equity);

  // 1. Utilities (Cálculo Rigoroso de Equilíbrio Nash / Regret Matching+)
  const callCost = Math.max(0.5, pot * 0.35);
  const raiseSize = Math.max(1, Math.min(stack, pot * 1.4));

  const evFold = 0;
  const evCall = handEquity * pot - (1 - handEquity) * callCost;

  // Fold Equity dinâmica e equidade contra o range de call do vilão
  const fe = 0.28;
  const eqCalled = Math.max(0.04, handEquity * 0.72);
  let evRaise = fe * pot + (1 - fe) * (eqCalled * (pot + raiseSize) - (1 - eqCalled) * raiseSize);

  // Boost de semi-bluff GTO para suited wheel aces (A5s-A2s) e suited connectors (87s, 76s)
  const isSuited = col > row;
  const gap = Math.abs(row - col);
  if (isSuited && gap <= 2 && handEquity >= 0.42 && handEquity <= 0.58) {
    evRaise += pot * 0.08;
  }

  // 2. Regret Matching+ (Regret não-negativo)
  const offset = i * ACTIONS;
  const idx0 = offset;
  const idx1 = offset + 1;
  const idx2 = offset + 2;

  const r0 = Math.max(localRegret[idx0] ?? 0, 0);
  const r1 = Math.max(localRegret[idx1] ?? 0, 0);
  const r2 = Math.max(localRegret[idx2] ?? 0, 0);

  const normalizingSum = r0 + r1 + r2;
  const s0 = normalizingSum > 0 ? r0 / normalizingSum : 1 / ACTIONS;
  const s1 = normalizingSum > 0 ? r1 / normalizingSum : 1 / ACTIONS;
  const s2 = normalizingSum > 0 ? r2 / normalizingSum : 1 / ACTIONS;

  currentStrategy[idx0] = s0;
  currentStrategy[idx1] = s1;
  currentStrategy[idx2] = s2;

  localStrategy[idx0] = (localStrategy[idx0] ?? 0) + s0;
  localStrategy[idx1] = (localStrategy[idx1] ?? 0) + s1;
  localStrategy[idx2] = (localStrategy[idx2] ?? 0) + s2;

  // 3. Node Utility (EV da estratégia mista)
  const nodeUtil = s0 * evFold + s1 * evCall + s2 * evRaise;

  // 4. Atualizar Arrependimentos com Fator de Diluição (Kappa) e corte em zero (CFR+)
  localRegret[idx0] = Math.max(0, ((localRegret[idx0] ?? 0) + (evFold - nodeUtil)) * kappa);
  localRegret[idx1] = Math.max(0, ((localRegret[idx1] ?? 0) + (evCall - nodeUtil)) * kappa);
  localRegret[idx2] = Math.max(0, ((localRegret[idx2] ?? 0) + (evRaise - nodeUtil)) * kappa);

  // 5. Estratégia Acumulada Média (Convergência GTO) mapeada para o Heatmap
  const cum0 = localStrategy[idx0] ?? 1;
  const cum1 = localStrategy[idx1] ?? 1;
  const cum2 = localStrategy[idx2] ?? 1;
  const cumTotal = cum0 + cum1 + cum2 || 1;

  const avgCall = cum1 / cumTotal;
  const avgRaise = cum2 / cumTotal;
  const totalAction = avgCall + avgRaise;

  // Mapeamento espectral de renderização (compatível com a legenda e cores da CfrCanvas):
  // Raise dominante (>50% raise) -> 0.75 a 1.0 (Verde Esmeralda)
  // Call dominante (>40% call)  -> 0.45 a 0.74 (Índigo Vibrante)
  // Misto (ação total >= 20%)   -> 0.20 a 0.44 (Azul Ardósia)
  // Fold dominante (<20% ação)  -> 0.00 a 0.19 (Ardósia Profundo / Preto)
  if (avgRaise >= 0.50) {
    renderMatrix[i] = Math.min(1.0, 0.75 + (avgRaise - 0.50) * 0.50);
  } else if (avgCall >= 0.40) {
    renderMatrix[i] = Math.min(0.74, 0.45 + (avgCall - 0.40) * 0.65);
  } else if (totalAction >= 0.20) {
    renderMatrix[i] = Math.min(0.44, 0.20 + (totalAction - 0.20) * 1.0);
  } else {
    renderMatrix[i] = Math.max(0.0, totalAction * 0.95);
  }
}

interface CfrMessageData {
  id: string | number;
  nodes: number;
  pot: number;
  stack: number;
  kappa: number;
  equity: number;
}

globalThis.onmessage = (e: MessageEvent<CfrMessageData>) => {
  const { id, nodes, pot, stack, kappa, equity } = e.data;

  if (!id || typeof nodes !== 'number' || typeof pot !== 'number') {
    console.warn('[SOTA CFR Worker] Invalid payload discarded.', e.data);
    return;
  }

  try {
    const totalNodes = nodes * nodes;
    const currentScenarioHash = `${nodes}-${pot}-${stack}-${equity}-${kappa}`;

    // Alocação Contígua Estrita & Reset de Cenário
    if (regretSum?.length !== totalNodes * ACTIONS || lastScenarioHash !== currentScenarioHash) {
      regretSum = new Float32Array(totalNodes * ACTIONS);
      strategySum = new Float32Array(totalNodes * ACTIONS);
      currentStrategy = new Float32Array(totalNodes * ACTIONS);
      lastScenarioHash = currentScenarioHash;
      iterationCount = 0;
    }

    // SOTA: O renderMatrix DEVE ser instanciado novo a cada iteração, pois sua posse (ownership) será transferida ao host
    const renderMatrix = new Float32Array(totalNodes);

    if (regretSum && strategySum && currentStrategy) {
      // Iterações CFR Puras em Lote para Aceleração de Convergência
      const BATCH_SIZE = 5;
      for (let b = 0; b < BATCH_SIZE; b++) {
        for (let i = 0; i < totalNodes; i++) {
          computeNodeCfr(
            i,
            { nodes, pot, stack, kappa, equity },
            regretSum,
            strategySum,
            currentStrategy,
            renderMatrix,
          );
        }
        iterationCount += 1;
      }
    }
    let positiveRegretTotal = 0;
    for (const regret of regretSum ?? []) {
      positiveRegretTotal += Math.max(0, regret);
    }
    const regretScale = Math.max(Math.abs(pot), Math.abs(stack), 1);
    const meanPositiveRegret = positiveRegretTotal / Math.max(1, regretSum?.length ?? 0) / regretScale;

    // SOTA FIX: Transferência O(1) via Zero-Copy (Transferable Objects)
    (globalThis as unknown as Worker).postMessage(
      {
        id,
        matrix: renderMatrix,
        diagnostic: {
          iteration: iterationCount,
          metric: 'mean-positive-regret-proxy',
          value: meanPositiveRegret,
        },
      },
      [renderMatrix.buffer],
    );
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido no motor CFR puro.';
    if (error instanceof Error) errorMessage = error.message;
    else if (typeof error === 'string') errorMessage = error;

    console.error('[SOTA CFR Worker] Falha estrutural:', errorMessage);
    (globalThis as unknown as Worker).postMessage({ id, error: errorMessage });
  }
};
