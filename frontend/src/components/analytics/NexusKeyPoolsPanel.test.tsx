import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NexusKeyPoolsPanel } from './NexusKeyPoolsPanel';

const MOCK_OFFLINE = {
  timestamp: '2026-11-18T12:00:00Z',
  mode: 'offline',
  total_vars: 2,
  total_synced: 2,
  anomalies_count: 0,
  fails_count: 0,
  warns_count: 0,
  p95_latency_ms: 120,
  openrouter_runtime_keys: 25,
  summaries: [
    {
      pool: 'OpenRouter Tier 1',
      total_vars: 2,
      synced: 2,
      invalid_fmt: 0,
      role: 'Core Cognitivo',
      policy: '0-tolerancia',
      health_label: 'READY (offline)',
      avg_latency_ms: 120,
    },
  ],
  entries: [
    {
      pool: 'OpenRouter Tier 1',
      variable: 'OPENROUTER_TIER1_KEY_1',
      mask: 'sk-or-v1-a...b23f',
      sha8: 'b01a17b1',
      sync: 'SYNCED',
      process: 'MATCH',
      format_valid: true,
      health_label: 'READY',
      health_ok: true,
      latency_ms: 120,
      role_hint: 'len=73',
    },
  ],
  anomalies: [],
};

describe('NexusKeyPoolsPanel', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('carrega resumo mascarado e dispara sonda live (0 tokens) ao clicar no botao', async () => {
    globalThis.fetch = jest.fn().mockImplementation((_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ...MOCK_OFFLINE, mode: 'live' }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => MOCK_OFFLINE } as Response);
    });

    render(<NexusKeyPoolsPanel />);
    await waitFor(() => expect(screen.getByText('2/2')).toBeInTheDocument());
    expect(screen.getByText('OpenRouter Tier 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sondar Live/i }));
    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/sota/key-pools',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ live: true, pool: '' }) }),
      ),
    );
  });
});
