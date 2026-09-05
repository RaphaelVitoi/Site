import { solveIcmDistortion } from '../solver/nashSolver';
import type { SimulatorWorkerRequest, SimulatorWorkerResponse, MultiwayPayload } from './insolvencyProtocol';
import { calculatePerspectivaVitoi, calculateRioTension } from '../../../lib/perspectiva';
import { maskToBytes, rangeToBitmask } from './rangeParser';

interface InsolvencyKernels {
  equity: (hero: Uint8Array, villain: Uint8Array, board: string, iterations: number, seed: number, kappa: number) => number;
  multiway: (request: MultiwayPayload) => Float64Array;
}

/** Adapter for provisional models, without claiming fidelity to the author's theory. */
export function processInsolvencyRequest(
  request: SimulatorWorkerRequest, kernels: InsolvencyKernels,
): SimulatorWorkerResponse {
  if (!request || typeof request !== 'object' || typeof request.type !== 'string') {
    return { type: 'ERROR', error: 'Invalid worker message', outputKind: 'working-model' };
  }
  const base = { outputKind: 'working-model' as const };
  switch (request.type) {
    case 'MATRIX': {
      const equity = kernels.equity(
        maskToBytes(rangeToBitmask(request.heroRange ?? 'AhKd')),
        maskToBytes(rangeToBitmask(request.villainRange)), request.board,
        request.iterations ?? 10000, request.seed ?? 1, request.kappa,
      );
      if (!Number.isFinite(equity) || equity < 0 || equity > 1) throw new RangeError('Invalid equity output');
      // The kernel returns equity, not a tie count. Preserve the existing 5% tie
      // assumption, bounded at extreme equities to keep the working model valid.
      const tieRate = Math.min(0.05, 2 * equity, 2 * (1 - equity));
      const winRate = equity - tieRate / 2;
      const loseRate = 1 - winRate - tieRate;
      const penalty = loseRate * request.rpFactor * request.currentPot * (request.activePlayers * 0.3);
      const ev = winRate * request.currentPot - loseRate * request.heroInvested - penalty;
      const risk = penalty / (request.currentPot + 0.01) * (1 + (1 - request.kappa));
      return { ...base, type: request.type, id: request.id, matrix: [winRate, loseRate, tieRate, ev, risk] };
    }
    case 'DISTORTION':
      return { ...base, type: request.type, id: request.id, nashResults: {
        flop: solveIcmDistortion(request.ipRpFlop, request.oopRpFlop, request.freqFlop,
          request.topologicAggression, request.pots[0], 0, request.activePlayers),
        turn: solveIcmDistortion(request.ipRpTurn, request.oopRpTurn, request.freqTurn,
          request.topologicAggression, request.pots[1], 1, request.activePlayers),
        river: solveIcmDistortion(request.ipRpRiver, request.oopRpRiver, request.freqRiver,
          request.topologicAggression, request.pots[2], 2, request.activePlayers),
      } };
    case 'MULTIWAY_MATRIX':
      if (!Number.isInteger(request.numPlayers) || request.numPlayers < 2 || request.numPlayers > 9 ||
        request.rangesData.length !== request.numPlayers * 1326 ||
        !Number.isSafeInteger(request.boardMask) || request.boardMask < 0 || request.boardMask >= 2 ** 52 ||
        !Number.isInteger(request.targetIterations) || request.targetIterations < 1 ||
        request.rangesData.some((weight) => !Number.isFinite(weight) || weight < 0)) {
        throw new RangeError('Invalid multiway range tensor');
      }
      return { ...base, type: request.type, id: request.id, outputKind: 'scaffold', multiwayResult: kernels.multiway(request) };
    case 'MULTIWAY_RIO': {
      const { maxPlayers, sprLevels, baseTension } = request;
      if (!Number.isInteger(maxPlayers) || maxPlayers < 1 || maxPlayers > 9 ||
        !Number.isInteger(sprLevels) || sprLevels < 1 || sprLevels > 1000 ||
        !Number.isFinite(baseTension) || baseTension < 0 || baseTension > 1) {
        throw new RangeError('Invalid RIO grid dimensions or tension');
      }
      const matrix = new Float32Array(maxPlayers * sprLevels);
      // Additional tension above HU from the existing working model; row-major
      // [players - 1][SPR - 1]. No new N² law is introduced by this adapter.
      for (let players = 1; players <= maxPlayers; players++) {
        for (let spr = 1; spr <= sprLevels; spr++) {
          const headsUp = calculateRioTension(0, 1, spr, 'OOP', baseTension * 100, 2);
          const multiway = calculateRioTension(0, 1, spr, 'OOP', baseTension * 100, players);
          matrix[(players - 1) * sprLevels + spr - 1] = multiway - headsUp;
        }
      }
      return { type: 'MULTIWAY_RIO_RESULT', id: request.id, matrix, outputKind: 'working-model' };
    }
    case 'CALCULATE_PERSPECTIVE': {
      const p = request.payload;
      const result = calculatePerspectivaVitoi({
        stacks: p.stacks, prizes: p.prizes, heroIdx: 0, villainIdx: 1,
        potSize: p.potSize, heroCost: p.heroCost, winProb: p.winProb,
        realizationFactor: p.realization, edgeBase: p.edgeBase, bountyValue: p.bountyValue,
        kappa: p.kappa, numPlayersInPot: p.numPlayers, isNearPayjump: p.isNearPayjump,
        blindsRisingSoon: p.blindsRising, humanNoiseFactor: p.humanNoiseFactor,
        referenceStatus: p.referenceStatus,
      });
      return { type: 'WASM_RESULT', ...(request.id === undefined ? {} : { id: request.id }), result, engine: 'typescript', outputKind: 'working-model' };
    }
    default: {
      const unsupported: never = request;
      return { type: 'ERROR', error: `Unsupported worker message: ${String((unsupported as { type: unknown }).type)}`,
        outputKind: 'working-model' };
    }
  }
}

/** Total message boundary: malformed inputs and failed kernels always receive a response. */
export async function dispatchSimulatorMessage(
  message: unknown, loadKernels: () => Promise<InsolvencyKernels>,
): Promise<SimulatorWorkerResponse> {
  const request = message as SimulatorWorkerRequest | undefined;
  try {
    const needsWasm = request?.type === 'MATRIX' || request?.type === 'MULTIWAY_MATRIX';
    const unavailable = (): never => { throw new Error('Kernel was not requested'); };
    const kernels = needsWasm ? await loadKernels() : { equity: unavailable, multiway: unavailable };
    return processInsolvencyRequest(request as SimulatorWorkerRequest, kernels);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    if (request && (request.type === 'MATRIX' || request.type === 'DISTORTION' || request.type === 'MULTIWAY_MATRIX')) {
      return { type: request.type, id: request.id, error: detail,
        outputKind: request.type === 'MULTIWAY_MATRIX' ? 'scaffold' : 'working-model' };
    }
    return { type: 'ERROR', ...(request?.id === undefined ? {} : { id: request.id }), error: detail, outputKind: 'working-model' };
  }
}
