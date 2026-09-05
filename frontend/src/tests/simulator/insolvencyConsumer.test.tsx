import { renderHook } from '@testing-library/react';
import { useMasterSpotLogic } from '../../components/simulator/hooks/useMasterSpotLogic';
import { SCENARIOS } from '../../components/simulator/solver/scenarios';

test('the context used by panels receives and updates worker output', () => {
  const metrics = { winRate: 0.7, loseRate: 0.25, tieRate: 0.05, trueInsolvencyEv: 2, riskIndex: 0.1 };
  const input: Parameters<typeof useMasterSpotLogic>[0] = {
    scenario: SCENARIOS[0]!, heroPosition: 'IP', safeHeroInvested: 1, safeCurrentPot: 5,
    safeActivePlayers: 2, anteSize: 12.5, blindsRisingSoon: false,
    effectiveIpRp: 0, effectiveOopRp: 0, quantumPerspectiva: null, apiQuantumMetrics: null,
    nativeRangeMetric: { equity: 50, isCalculating: false }, insolvencyMatrixData: metrics,
    isCalculatingInsolvency: false, dispatchInsolvencyMatrix: jest.fn(), dispatchIcmDistortion: jest.fn(),
    nashResults: null, bayesianWinProb: null, predictiveProfile: null, predictiveTelemetry: null,
    setNativeRangeMetric: jest.fn(), pkoValue: 0, aggFactor: 1,
  };
  const { result, rerender } = renderHook((props) => useMasterSpotLogic(props), { initialProps: input });
  expect(result.current.wasmContextValue.insolvencyMatrixData).toBe(metrics);
  const updated = { ...metrics, trueInsolvencyEv: -3 };
  rerender({ ...input, insolvencyMatrixData: updated });
  expect(result.current.wasmContextValue.insolvencyMatrixData).toBe(updated);
});
