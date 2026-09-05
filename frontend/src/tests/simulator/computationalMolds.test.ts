import { maskToBytes, rangeToBitmask } from '../../components/simulator/workers/rangeParser';
import { processInsolvencyRequest } from '../../components/simulator/workers/insolvencyProcessor';
import { calculateMalmuthHarville, computeBubbleFactorMatrix } from '../../lib/icmMatrix';

test('all 1326 physical combos survive the existing sparse WASM ABI', () => {
  const ranks = '23456789TJQKA', suits = 'shdc';
  const card = (id: number) => `${ranks[Math.floor(id / 4)]}${suits[id % 4]}`;
  for (let hi = 1; hi < 52; hi++) for (let lo = 0; lo < hi; lo++) {
    const bytes = maskToBytes(rangeToBitmask(card(hi) + card(lo)));
    const bit = hi * 52 + lo;
    expect((bytes[Math.floor(bit / 8)]! >> (bit % 8)) & 1).toBe(1);
    expect(bytes.reduce((n, value) => n + value.toString(2).replaceAll('0', '').length, 0)).toBe(1);
  }
  expect(maskToBytes(rangeToBitmask('AA'))).not.toEqual(maskToBytes(rangeToBitmask('KK')));
  expect(rangeToBitmask('AhAh')).toBe(0n);
});

test('terminal payouts and HU threshold remain coherent with guaranteed prizes', () => {
  expect(calculateMalmuthHarville([100, 0], [70, 30])).toEqual([70, 30]);
  expect(calculateMalmuthHarville([100, 0, 0], [70, 20, 10])).toEqual([70, 15, 15]);
  expect(calculateMalmuthHarville([50, 50], [])).toEqual([0, 0]);
  const matrix = computeBubbleFactorMatrix([50, 50], [70, 30]);
  expect(matrix.bfMatrix[0]![1]).toBe(1);
  expect(matrix.reqEquityMatrix[0]![1]).toBe(50);
});

test('matrix produces the response consumed by the hook and preserves both ranges', () => {
  const equity = jest.fn(() => 0.8);
  const response = processInsolvencyRequest({ type: 'MATRIX', id: 7,
    heroRange: 'AA', villainRange: 'KK', board: '', rpFactor: 1,
    heroInvested: 5, currentPot: 10, activePlayers: 2, kappa: 1, humanNoiseFactor: 0,
  }, { equity, multiway: jest.fn() });
  expect(response.type).toBe('MATRIX');
  if (response.type !== 'MATRIX') throw new Error('Unexpected response');
  expect(response.id).toBe(7);
  expect(response.outputKind).toBe('working-model');
  expect(response.matrix).toHaveLength(5);
  expect(response.matrix!.every(Number.isFinite)).toBe(true);
  expect(response.matrix!.slice(0, 3).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  expect(equity.mock.calls[0]![0]).not.toEqual(equity.mock.calls[0]![1]);
});

test('distortion returns all three streets in the consumer format', () => {
  const freqs = { ip_check: 40, ip_bet_small: 35, ip_bet_large: 25, oop_call: 50, oop_fold: 40, oop_raise: 10 };
  const result = processInsolvencyRequest({ type: 'DISTORTION', id: 3,
    ipRpFlop: 10, oopRpFlop: 20, freqFlop: freqs,
    ipRpTurn: 10, oopRpTurn: 20, freqTurn: freqs,
    ipRpRiver: 10, oopRpRiver: 20, freqRiver: freqs,
    topologicAggression: 1.2, activePlayers: 2, pots: [7.5, 22.5, 40], humanNoiseFactor: 0,
  }, { equity: jest.fn(), multiway: jest.fn() });
  expect(result.type).toBe('DISTORTION');
  if (result.type !== 'DISTORTION') throw new Error('Unexpected response');
  for (const street of Object.values(result.nashResults!)) {
    expect(street.oop.call.center + street.oop.fold.center + street.oop.raise.center).toBeCloseTo(100);
  }
  expect(Object.keys(result.nashResults!)).toEqual(['flop', 'turn', 'river']);
});

test('multiway retains its scaffold identity and rejects malformed memory input', () => {
  const request = { type: 'MULTIWAY_MATRIX' as const, id: 4, numPlayers: 2,
    rangesData: new Float64Array(2652).fill(1), boardMask: 0, targetIterations: 10 };
  const multiway = jest.fn(() => new Float64Array([0, 0, 0]));
  expect(processInsolvencyRequest(request, { equity: jest.fn(), multiway }).outputKind).toBe('scaffold');
  expect(() => processInsolvencyRequest({ ...request, rangesData: new Float64Array(10) },
    { equity: jest.fn(), multiway })).toThrow(RangeError);
  expect(multiway).toHaveBeenCalledTimes(1);
});
