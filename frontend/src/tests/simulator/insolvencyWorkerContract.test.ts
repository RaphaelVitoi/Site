import { dispatchSimulatorMessage } from '../../components/simulator/workers/insolvencyProcessor';
import { calculatePerspectivaVitoi } from '../../lib/perspectiva';
import type { PerspectiveWorkerRequest } from '../../components/simulator/workers/insolvencyProtocol';

const unavailableKernels = jest.fn(async (): Promise<never> => { throw new Error('WASM unavailable'); });
beforeEach(() => unavailableKernels.mockClear());

test.each([undefined, null, {}, { type: 'UNKNOWN' }, 'MATRIX', { type: 42 }])(
  'malformed and unknown messages always receive a structured response: %p', async (message) => {
    await expect(dispatchSimulatorMessage(message, unavailableKernels)).resolves.toMatchObject({ type: 'ERROR', error: expect.any(String) });
    expect(unavailableKernels).not.toHaveBeenCalled();
  },
);

test('DownwardDrift receives a finite row-major 9 × 20 RIO grid without WASM', async () => {
  const request = { type: 'MULTIWAY_RIO', id: 'drift_rio', maxPlayers: 9, sprLevels: 20, baseTension: 0.15 };
  const result = await dispatchSimulatorMessage(request, unavailableKernels);
  expect(result.type).toBe('MULTIWAY_RIO_RESULT');
  if (result.type !== 'MULTIWAY_RIO_RESULT') throw new Error('Missing RIO result');
  expect(result.id).toBe('drift_rio');
  expect(result.matrix).toBeInstanceOf(Float32Array);
  expect(result.matrix).toHaveLength(180);
  expect(result.matrix.every(Number.isFinite)).toBe(true);
  expect([...result.matrix.slice(20, 40)]).toEqual(Array(20).fill(0));
  expect(result.matrix[59]).toBeGreaterThan(0);
  expect(unavailableKernels).not.toHaveBeenCalled();
  await expect(dispatchSimulatorMessage({ ...request, sprLevels: -1 }, unavailableKernels))
    .resolves.toMatchObject({ type: 'ERROR', id: 'drift_rio' });
});

test('PerspectivePanel receives the existing scenario calculation, without a WASM dependency', async () => {
  const payload: PerspectiveWorkerRequest['payload'] = { stacks: [50, 50], prizes: [70, 30], kappa: 0.5, numPlayers: 2,
    bountyValue: 0, potSize: 10, heroCost: 5, winProb: 0.55, realization: 1, edgeBase: 1.2,
    isNearPayjump: false, blindsRising: false, humanNoiseFactor: 0,
    heroRp: 15, villainRp: 15, stackEff: 50, referenceStatus: 'baseline' };
  const response = await dispatchSimulatorMessage({ type: 'CALCULATE_PERSPECTIVE', id: 9, payload }, unavailableKernels);
  expect(response).toMatchObject({ type: 'WASM_RESULT', id: 9, engine: 'typescript', outputKind: 'working-model' });
  if (response.type !== 'WASM_RESULT') throw new Error('Missing perspective result');
  expect(response.result).toEqual(calculatePerspectivaVitoi({
    stacks: [50, 50], prizes: [70, 30], heroIdx: 0, villainIdx: 1, potSize: 10,
    heroCost: 5, winProb: 0.55, realizationFactor: 1, edgeBase: 1.2,
    kappa: 0.5, numPlayersInPot: 2, bountyValue: 0, isNearPayjump: false,
    blindsRisingSoon: false, humanNoiseFactor: 0, referenceStatus: 'baseline',
  }));
  expect(unavailableKernels).not.toHaveBeenCalled();
});

test('failed WASM requests preserve their type and id so consumers can clear pending states', async () => {
  await expect(dispatchSimulatorMessage({ type: 'MATRIX', id: 12 }, unavailableKernels))
    .resolves.toMatchObject({ type: 'MATRIX', id: 12, error: 'WASM unavailable' });
  await expect(dispatchSimulatorMessage({ type: 'MULTIWAY_MATRIX', id: 13 }, unavailableKernels))
    .resolves.toMatchObject({ type: 'MULTIWAY_MATRIX', id: 13, outputKind: 'scaffold', error: 'WASM unavailable' });
});
