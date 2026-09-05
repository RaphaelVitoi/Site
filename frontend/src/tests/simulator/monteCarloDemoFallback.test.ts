/** @jest-environment node */
import { monteCarloPool } from '../../lib/monteCarloParallelPool';

jest.mock('#monte-carlo-wasm-runtime', () => ({
  initializeMonteCarloWasm: jest.fn().mockRejectedValue(new Error('Fixture: unavailable WASM')),
}));

test('keeps a usable demo output without claiming unexecuted samples or confidence', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    const result = await monteCarloPool.calculateEquity({ heroRange: 'AA', villainRange: 'KK', iterations: 10000 });
    expect(result.mode).toBe('DEMO_FALLBACK');
    expect(result.equityPercentage).toBe(50);
    expect(result.iterations).toBe(0);
    expect(result.stdError).toBeNull();
    expect(result.confidenceInterval95).toBeNull();
  } finally {
    error.mockRestore();
  }
});
