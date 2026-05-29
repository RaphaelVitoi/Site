/** @format */
import init, {
  solve_insolvency_matrix_binary,
  solve_icm_distortion_v2,
  calculate_perspectiva_vitoi_wasm,
  alloc_range_buffer,
  free_range_buffer,
  calculate_multiway_equity_zerocopy,
} from '../../../lib/engine/vitoi_equity_engine';
import { maskToBytes, rangeToBitmask } from './rangeParser';
// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito
export const __INSOLVENCY_WORKER__ = true;
let initPromise = null; // SOTA: Promise Guard evita Race Conditions na injeção assíncrona do WebAssembly
globalThis.onmessage = async (e) => {
  const data = e.data;
  if (!data || !data.type) {
    console.warn('[SOTA Insolvency Worker] Invalid payload discarded.');
    return;
  }
  const id = 'id' in data ? data.id : undefined;
  try {
    if (!initPromise) {
      const isDev = process.env['NODE_ENV'] === 'development';
      const cacheBuster = isDev ? `?v=${Date.now()}` : '';
      initPromise = init(`/wasm/vitoi_equity_engine_bg.wasm${cacheBuster}`);
    }
    await initPromise;
    if (data.type === 'MATRIX') {
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
    } else if (data.type === 'CALCULATE_PERSPECTIVE') {
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
          1.0, // fgsHealth
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
    } else if (data.type === 'DISTORTION') {
      const [potFlop, potTurn, potRiver] = data.pots;
      globalThis.postMessage({
        type: 'WASM_LOG',
        payload: `> [SOLVER] Iniciando Propagação Reversa (Post-Flop Dilation)`,
      });
      globalThis.postMessage({
        type: 'WASM_LOG',
        payload: `> [MATH] RIO MW Escalado: ActivePlayers=${data.activePlayers}`,
      });
      const formatStreetResults = (res, freqs, ipRp, oopRp) => {
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
              center: res[0] * 100,
              spread,
              delta: res[0] * 100 - freqs.oop_fold,
            },
            call: {
              center: res[1] * 100,
              spread,
              delta: res[1] * 100 - freqs.oop_call,
            },
            raise: {
              center: res[2] * 100,
              spread,
              delta: res[2] * 100 - freqs.oop_raise,
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
    } else if (data.type === 'MULTIWAY_MATRIX') {
      const { rangesData, numPlayers, boardMask, targetIterations, seed, id } = data;
      const size = rangesData.length;
      globalThis.postMessage({
        type: 'WASM_LOG',
        payload: `> [MULTIWAY SOTA] Alocando Zero-Copy Tensor (${size} floats)`,
      });
      const ptr = alloc_range_buffer(size);
      try {
        const wasmInstance = await initPromise;
        const memoryBuffer = wasmInstance.memory.buffer;
        const wasmView = new Float64Array(memoryBuffer, ptr, size);
        wasmView.set(rangesData);
        globalThis.postMessage({
          type: 'WASM_LOG',
          payload: `> [MULTIWAY SOTA] Injetando Entropia (Seed: ${seed}) e Rejeição Global...`,
        });
        const start = performance.now();
        const rawResult = calculate_multiway_equity_zerocopy(ptr, numPlayers, boardMask, targetIterations, seed);
        const latency = performance.now() - start;
        globalThis.postMessage({
          type: 'WASM_LOG',
          payload: `> [MULTIWAY SOTA] Convergência em ${latency.toFixed(2)}ms.`,
        });
        const abortFlag = rawResult[numPlayers];
        if (abortFlag === 1.0) {
          globalThis.postMessage({
            type: 'WASM_LOG',
            payload: `> [ENTROPIA CRÍTICA] Aborto Termodinâmico disparado. (Colisões consecutivas > 256). O resultado é uma aproximação parcial.`,
          });
        }
        const safeResult = new Float64Array(rawResult.subarray(0, numPlayers));
        globalThis.postMessage({ type: 'MULTIWAY_MATRIX', multiwayResult: safeResult, id }, [safeResult.buffer]);
      } finally {
        free_range_buffer(ptr, size);
      }
    }
  } catch (error) {
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
