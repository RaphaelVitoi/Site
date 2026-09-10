import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CounterfactualPanel from '../../components/simulator/panels/CounterfactualPanel';
import { evaluateCounterfactual } from '../../lib/counterfactualExperiment';
import { defaultTournamentConditions } from '../../lib/tournamentConditions';

const context = {
  population: [{ id: 'a', name: 'A', stack: 40 }, { id: 'b', name: 'B', stack: 60 }],
  selection: { room: 'GGPoker' as const, playerIds: ['a', 'b'], participantIds: [] },
  conditions: defaultTournamentConditions(2, 2), prizes: [65, 35], heroId: 'a',
};
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('submits full context and clears obsolete output after an edit', async () => {
  global.fetch = jest.fn(async (_url, init) => ({ ok: true, json: async () => evaluateCounterfactual(JSON.parse(String(init?.body))) } as Response));
  render(<CounterfactualPanel context={context} inputError={null} />);
  fireEvent.click(screen.getByText('Comparar hipóteses'));
  await waitFor(() => expect(screen.getByText('Indiferença em 56.00% de vitória.')).toBeTruthy());
  fireEvent.change(screen.getByLabelText('Valor futuro ao foldar'), { target: { value: '102' } });
  expect(screen.queryByText('Indiferença em 56.00% de vitória.')).toBeNull();
  fireEvent.click(screen.getByText('Comparar hipóteses'));
  await waitFor(() => expect(screen.getByText('Indiferença em 64.00% de vitória.')).toBeTruthy());
});

test('incomplete context disables submission and blank numbers never become zero', async () => {
  global.fetch = jest.fn();
  const view = render(<CounterfactualPanel context={context} inputError="Stacks ausentes" />);
  expect((screen.getByText('Comparar hipóteses') as HTMLButtonElement).disabled).toBe(true);
  view.rerender(<CounterfactualPanel context={context} inputError={null} />);
  fireEvent.change(screen.getByLabelText('Valor futuro ao foldar'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Comparar hipóteses'));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Preencha'));
  expect(global.fetch).not.toHaveBeenCalled();
});
