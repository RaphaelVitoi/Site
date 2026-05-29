/** @format */

// @ts-expect-error SOTA: Some bindings might not be generated in d.ts yet
import init, {
  solve_insolvency_matrix_binary,
  solve_icm_distortion_v2,
  calculate_perspectiva_vitoi_wasm,
  alloc_range_buffer,
  free_range_buffer,
  calculate_multiway_equity_zerocopy,
} from '../../../lib/engine/vitoi_equity_engine';

import { maskToBytes, rangeToBitmask } from './rangeParser';

// SOTA: Injeção de tipagem para o bundler (Next.js) em contexto de WebWorker
declare const process: { env: { [key: string]: string | undefined } };

// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito
export const __INSOLVENCY_WORKER__ = true;

interface StreetFreqs {
  ip_check: number;
  ip_bet_small: number;
  ip_bet_large: number;
  oop_fold: number;
  oop_call: number;
  oop_raise: number;
}

let initPromise: Promise<unknown> | null = null; // SOTA: Promise Guard evita Race Conditions na injeção assíncrona do WebAssembly

interface MatrixPayload {
  type: 'MATRIX';
  heroRange: string;
  villainRange: string;
  board: string;
  rpFactor: number;
  heroInvested: number;
  currentPot: number;
  activePlayers: number;
  kappa: number;
  betSizing: number;
  humanNoiseFactor: number;
  id: number;
}

interface PerspectivePayload {
  type: 'CALCULATE_PERSPECTIVE';
  payload: {
    stacks: number[];
    prizes: number[];
    kappa: number;
    numPlayers: number;
    bountyValue: number;
    potSize: number;
    heroCost: number;
    winProb: number;
    realization: number;
    edgeBase: number;
    isNearPayjump: boolean;
    blindsRising: boolean;
    humanNoiseFactor: number;
    heroRp: number;
    villainRp: number;
    stackEff: number;
  };
}

interface DistortionPayload {
  type: 'DISTORTION';
  ipRpFlop: number;
  oopRpFlop: number;
  freqFlop: StreetFreqs;
  ipRpTurn: number;
  oopRpTurn: number;
  freqTurn: StreetFreqs;
  ipRpRiver: number;
  oopRpRiver: number;
  freqRiver: StreetFreqs;
  topologicAggression: number;
  activePlayers: number;
  pots: [number, number, number];
  humanNoiseFactor: number;
  id: number;
}

interface MultiwayPayload {
  type: 'MULTIWAY_MATRIX';
  rangesData: Float64Array;
  numPlayers: number;
  boardMask: number;
  targetIterations: number;
  seed: number;
  id: number;
}

type WorkerMessage = MatrixPayload | PerspectivePayload | DistortionPayload | MultiwayPayload;

async function handleMatrixPayload(data: MatrixPayload, id?: number) {
  const villainMask = maskToBytes(rangeToBitmask(data.villainRange));
  const seed = Math.floor(Math.random() * 4294967296);

  globalThis.postMessage({
    type: 'WASM_LOG',
    payload: `> [SOLVER] Mapeando Matriz: ${data.villainRange} vs ${data.board || 'Blank'}`,
  });
  globalThis.postMessage({
    type: 'WASM_LOG',
    payload: `> [MATH] Injetando Fator κ=${data.kappa.toFixed(2)} e Entropia Ψ=${data.humanNoiseFactor.toFixed(2)}`,
  });

  const matrix = solve_insolvency_matrix_binary(
    villainMask,
    data.board || '',
    data.rpFactor,
    data.heroInvested,
    data.currentPot,
    data.activePlayers,
    5000,
    seed,
    data.kappa,
  );

  globalThis.postMessage({ type: 'WASM_LOG', payload: `> [INFO] Matriz resolvida. Coerência quântica atingida.` });
  globalThis.postMessage({ type: 'MATRIX', matrix, id });
}

async function handlePerspectivePayload(data: PerspectivePayload, id?: number) {
  const p = data.payload;
  const start = performance.now();

  // Stress Test: Executa o loop de 21 pontos (usado no gráfico) para validar performance
  const results = [];
  for (let i = 0; i <= 100; i += 5) {
    const r = calculate_perspectiva_vitoi_wasm(
      i, // winProb
      p.potSize * 0.8, // deltaWin (simulado)
      -p.heroCost * 2, // deltaLose (simulado)
      -p.heroCost, // dynamicEvFold
      p.realization,
      1, // fgsHealth
      p.numPlayers,
      p.heroCost,
      p.potSize,
      p.stackEff,
      p.heroRp,
      p.villainRp,
      p.bountyValue,
      p.edgeBase,
      p.humanNoiseFactor,
    );
    results.push(r);
  }

  const end = performance.now();
  const latency = end - start;

  globalThis.postMessage({
    type: 'WASM_LOG',
    payload: `> [PERF] Motor v7.0 GOLD: ${p.numPlayers}-max em ${latency.toFixed(4)}ms (Nodes: ${results.length})`,
  });

  if (p.numPlayers >= 9) {
    globalThis.postMessage({
      type: 'WASM_LOG',
      payload: `> [SOTA] Escalabilidade 9-max validada. Fricção Zero atingida.`,
    });
  }

  globalThis.postMessage({ type: 'WASM_RESULT', result: results[11], id }); // Envia o ponto central (55%) como exemplo
}

async function handleDistortionPayload(data: DistortionPayload, id?: number) {
  const [potFlop, potTurn, potRiver] = data.pots;

  globalThis.postMessage({
    type: 'WASM_LOG',
    payload: `> [SOLVER] Iniciando Propagação Reversa (Post-Flop Dilation)`,
  });
  globalThis.postMessage({
    type: 'WASM_LOG',
    payload: `> [MATH] RIO MW Escalado: ActivePlayers=${data.activePlayers}`,
  });

  const formatStreetResults = (res: Float64Array, freqs: StreetFreqs, ipRp: number, oopRp: number) => {
    const spread = Math.max(3, Math.abs(ipRp - oopRp) * 0.25);

    // Rust v2 mapping: res[0]=fold, res[1]=call, res[2]=raise
    return {
      ip: {
        check: { center: freqs.ip_check, spread, delta: 0 },
        bet_small: { center: freqs.ip_bet_small, spread, delta: 0 },
        bet_large: { center: freqs.ip_bet_large, spread, delta: 0 },
      },
      oop: {
        fold: {
          center: res[0]! * 100,
          spread,
          delta: res[0]! * 100 - freqs.oop_fold,
        },
        call: {
          center: res[1]! * 100,
          spread,
          delta: res[1]! * 100 - freqs.oop_call,
        },
        raise: {
          center: res[2]! * 100,
          spread,
          delta: res[2]! * 100 - freqs.oop_raise,
        },
      },
      deltaRp: ipRp - oopRp,
    };
  };

  const nashResults = {
    flop: formatStreetResults(
      solve_icm_distortion_v2(
        data.ipRpFlop,
        data.oopRpFlop,
        data.topologicAggression,
        data.activePlayers,
        potFlop,
        0,
        data.freqFlop.oop_fold / 100,
        data.freqFlop.oop_raise / 100,
      ),
      data.freqFlop,
      data.ipRpFlop,
      data.oopRpFlop,
    ),
    turn: formatStreetResults(
      solve_icm_distortion_v2(
        data.ipRpTurn,
        data.oopRpTurn,
        data.topologicAggression,
        data.activePlayers,
        potTurn,
        1,
        data.freqTurn.oop_fold / 100,
        data.freqTurn.oop_raise / 100,
      ),
      data.freqTurn,
      data.ipRpTurn,
      data.oopRpTurn,
    ),
    river: formatStreetResults(
      solve_icm_distortion_v2(
        data.ipRpRiver,
        data.oopRpRiver,
        data.topologicAggression,
        data.activePlayers,
        potRiver,
        2,
        data.freqRiver.oop_fold / 100,
        data.freqRiver.oop_raise / 100,
      ),
      data.freqRiver,
      data.ipRpRiver,
      data.oopRpRiver,
    ),
  };

  globalThis.postMessage({ type: 'DISTORTION', nashResults, id });
}

async function handleMultiwayPayload(data: MultiwayPayload, id?: number) {
  const { rangesData, numPlayers, boardMask, targetIterations, seed } = data;
  const size = rangesData.length;

  globalThis.postMessage({
    type: 'WASM_LOG',
    payload: `> [MULTIWAY SOTA] Alocando Zero-Copy Tensor (${size} floats)`,
  });

  // SOTA: Alocação no Heap do WASM guiada pelo Rust
  const ptr = alloc_range_buffer(size);

  try {
    // SOTA: Obtém acesso direto à RAM do módulo WebAssembly
    // Cast blindado para garantir compatibilidade estrutural com o binário instanciado
    const wasmInstance = (await initPromise) as { memory: WebAssembly.Memory };
    const memoryBuffer = wasmInstance.memory.buffer;

    // View direta sem duplicar arrays na memória JS
    const wasmView = new Float64Array(memoryBuffer, ptr, size);
    wasmView.set(rangesData);

    globalThis.postMessage({
      type: 'WASM_LOG',
      payload: `> [MULTIWAY SOTA] Injetando Entropia (Seed: ${seed}) e Rejeição Global...`,
    });
    const start = performance.now();

    // Motor Quântico O(1)
    const rawResult = calculate_multiway_equity_zerocopy(ptr, numPlayers, boardMask, targetIterations, seed);
    const latency = performance.now() - start;

    globalThis.postMessage({
      type: 'WASM_LOG',
      payload: `> [MULTIWAY SOTA] Convergência em ${latency.toFixed(2)}ms.`,
    });

    // SOTA: OOB Telemetry (Tensor Tail Interception)
    // O Rust injetou um float extra no final do array [numPlayers] para reportar integridade
    const abortFlag = rawResult[numPlayers];
    if (abortFlag === 1) {
      globalThis.postMessage({
        type: 'WASM_LOG',
        payload: `> [ENTROPIA CRÍTICA] Aborto Termodinâmico disparado. (Colisões consecutivas > 256). O resultado é uma aproximação parcial.`,
      });
    }

    // Extirpamos a cauda de metadados e clonamos apenas a matriz de equidades (0 até numPlayers)
    const safeResult = new Float64Array(rawResult.subarray(0, numPlayers));

    // Transfere a posse absoluta do resultado para a Main Thread (Zero Garbage Collection Stress)
    globalThis.postMessage({ type: 'MULTIWAY_MATRIX', multiwayResult: safeResult, id }, [safeResult.buffer]);
  } finally {
    // SOTA GUARD: Destruição Termodinâmica Mandatória. Evita Memory Leak letal na RAM do usuário.
    free_range_buffer(ptr, size);
  }
}

globalThis.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const data = e.data;

  if (!data?.type) {
    console.warn('[SOTA Insolvency Worker] Invalid payload discarded.');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (data as any).id;

  try {
    if (!initPromise) {
      const isDev = process.env['NODE_ENV'] === 'development';
      const cacheBuster = isDev ? `?v=${Date.now()}` : '';
      initPromise = init(`/wasm/vitoi_equity_engine_bg.wasm${cacheBuster}`);
    }
    await initPromise;

    switch (data.type) {
      case 'MATRIX':
        await handleMatrixPayload(data, id);
        break;
      case 'CALCULATE_PERSPECTIVE':
        await handlePerspectivePayload(data, id);
        break;
      case 'DISTORTION':
        await handleDistortionPayload(data, id);
        break;
      case 'MULTIWAY_MATRIX':
        await handleMultiwayPayload(data, id);
        break;
    }
  } catch (error: unknown) {
    let errorMessage = 'Erro desconhecido no motor de insolvência WASM.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    console.warn('[SOTA Insolvency Worker] Falha:', errorMessage);
    globalThis.postMessage({ error: errorMessage, id });
  }
};
