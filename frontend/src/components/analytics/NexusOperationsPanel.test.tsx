import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NexusOperationsPanel } from './NexusOperationsPanel';

describe('NexusOperationsPanel', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('submete pela fila e mantém enfileirada distinta de concluída', async () => {
    const pending = {
      id: 'DASH-test',
      description: 'Revisar integração do Nexus',
      status: 'pending',
      timestamp: new Date().toISOString(),
		};
		globalThis.fetch = jest.fn().mockImplementation((_input: RequestInfo | URL, init?: RequestInit) => {
			if (init?.method === 'POST') {
				return Promise.resolve({ ok: true, json: async () => ({ status: 'SUCCESS', id: pending.id }) } as Response);
			}
			return Promise.resolve({ ok: true, json: async () => [pending] } as Response);
		});

    render(<NexusOperationsPanel />);
    await waitFor(() => expect(screen.getByText('API e QueueManager respondendo')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Descrição da tarefa'), { target: { value: pending.description } });
    fireEvent.click(screen.getByRole('button', { name: 'Enfileirar tarefa' }));

    await waitFor(() => expect(screen.getByText(/ainda não significa que foi executada/i)).toBeInTheDocument());
    expect(screen.getAllByText('Na fila').length).toBeGreaterThanOrEqual(2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/vitoi/tasks',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ description: pending.description }) }),
    );
  });
});
