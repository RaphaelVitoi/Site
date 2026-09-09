import { readCurrentInsolvencyResponse } from '../../components/simulator/workers/insolvencyResponse';
import { dispatchSimulatorMessage, processInsolvencyRequest } from '../../components/simulator/workers/insolvencyProcessor';
import type { InsolvencyWorkerRequest } from '../../components/simulator/workers/insolvencyProtocol';

const ids = { MATRIX: 3, DISTORTION: 7, MULTIWAY_MATRIX: 2 };
const matrixReply = { type: 'MATRIX', id: 3, outputKind: 'working-model', matrix: [0.7, 0.25, 0.05, -2, 0.1] };

test.each([undefined, null, 42, 'MATRIX', {}, [], { type: 'ERROR' }, { ...matrixReply, id: '3' }])(
  'rejects malformed or unrelated messages without reading an absent type: %p', data => {
    expect(readCurrentInsolvencyResponse(data, ids)).toBeNull();
  },
);

test('accepts a current matrix and rejects an old or future reply', () => {
  expect(readCurrentInsolvencyResponse(matrixReply, ids)).toEqual(matrixReply);
  expect(readCurrentInsolvencyResponse({ ...matrixReply, id: 2 }, ids)).toBeNull();
  expect(readCurrentInsolvencyResponse({ ...matrixReply, id: 4 }, ids)).toBeNull();
  expect(readCurrentInsolvencyResponse(matrixReply, { ...ids, MATRIX: 4 })).toBeNull();
});

test.each([[], [1, 2], [0.7, 0.25, 0.05, NaN, 0.1], [0.7, 0.25, 0.05, Infinity, 0.1], ['0.7', 0.25, 0.05, 0, 0]])(
  'does not publish an incomplete or nonfinite matrix: %p', (...matrix) => {
    // Jest expands each array row into arguments.
    expect(readCurrentInsolvencyResponse({ ...matrixReply, matrix }, ids)).toBeNull();
  },
);

test('accepts outputs from all three real processor branches with independent request ids', () => {
  const freq = { ip_check: 40, ip_bet_small: 40, ip_bet_large: 20, oop_call: 50, oop_fold: 40, oop_raise: 10 };
  const tensor = new Float64Array(2 * 1326);
  const kernels = { equity: () => 0.75, multiway: () => tensor };
  const requests: InsolvencyWorkerRequest[] = [
    { type: 'MATRIX', id: 3, villainRange: 'KK', heroRange: 'AA', board: '', rpFactor: 0.2,
      heroInvested: 2, currentPot: 10, activePlayers: 2, kappa: 1, humanNoiseFactor: 0 },
    { type: 'DISTORTION', id: 7, ipRpFlop: 20, oopRpFlop: 10, freqFlop: freq,
      ipRpTurn: 18, oopRpTurn: 9, freqTurn: freq, ipRpRiver: 15, oopRpRiver: 7, freqRiver: freq,
      topologicAggression: 1, activePlayers: 2, pots: [5, 10, 20], humanNoiseFactor: 0 },
    { type: 'MULTIWAY_MATRIX', id: 2, rangesData: tensor, numPlayers: 2, boardMask: 0, targetIterations: 10 },
  ];
  for (const request of requests) {
    const produced = processInsolvencyRequest(request, kernels);
    expect(readCurrentInsolvencyResponse(produced, ids)).toEqual(produced);
  }
  const decoded = readCurrentInsolvencyResponse(processInsolvencyRequest(requests[2]!, kernels), ids);
  expect(decoded?.multiwayResult).toBe(tensor);
});

test('preserves correlated failures so the hook can clear the correct pending state', async () => {
  const unavailable = async () => { throw new Error('WASM unavailable'); };
  for (const type of ['MATRIX', 'DISTORTION', 'MULTIWAY_MATRIX'] as const) {
    const produced = await dispatchSimulatorMessage({ type, id: ids[type] }, unavailable);
    expect(readCurrentInsolvencyResponse(produced, ids)).toEqual(produced);
  }
});

test('rejects missing distortion streets and nonfinite or untyped multiway tensors', () => {
  expect(readCurrentInsolvencyResponse({ type: 'DISTORTION', id: 7, outputKind: 'working-model', nashResults: {} }, ids)).toBeNull();
  for (const multiwayResult of [[0, 0], new Float64Array([NaN])]) {
    expect(readCurrentInsolvencyResponse({ type: 'MULTIWAY_MATRIX', id: 2, outputKind: 'scaffold', multiwayResult }, ids)).toBeNull();
  }
});
