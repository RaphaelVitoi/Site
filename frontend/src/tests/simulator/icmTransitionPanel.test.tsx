import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import IcmTransitionPanel from '../../components/simulator/panels/IcmTransitionPanel';
import { evaluateIcmTransitions } from '../../lib/icmTransitionExperiment';
import { defaultTournamentConditions } from '../../lib/tournamentConditions';

const context = { population: [{ id: 'a', name: 'A', stack: 40 }, { id: 'b', name: 'B', stack: 60 }],
  selection: { room: 'GGPoker' as const, playerIds: ['a', 'b'], participantIds: [] },
  conditions: defaultTournamentConditions(2, 2), prizes: [65, 35], heroId: 'a' };
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('identity default yields equal actions and context changes reset old transitions', async () => {
  global.fetch = jest.fn(async (_url, init) => ({ ok: true, json: async () => evaluateIcmTransitions(JSON.parse(String(init?.body))) } as Response));
  const view = render(<IcmTransitionPanel context={context} inputError={null} />);
  fireEvent.click(screen.getByText('Calcular transições ICM'));
  await waitFor(() => expect(screen.getByText('Indiferença em toda a grade.')).toBeTruthy());
  fireEvent.change(screen.getByLabelText('Após fold: A'), { target: { value: '35' } });
  expect(screen.queryByText('Indiferença em toda a grade.')).toBeNull();
  view.rerender(<IcmTransitionPanel context={{ ...context, population: [{ id: 'a', name: 'A', stack: 50 }, { id: 'b', name: 'B', stack: 50 }] }} inputError={null} />);
  expect((screen.getByLabelText('Após fold: A') as HTMLInputElement).value).toBe('50');
});

test('blank stacks are rejected locally and tournament errors block submission', async () => {
  global.fetch = jest.fn();
  const view = render(<IcmTransitionPanel context={context} inputError="Complete o field" />);
  expect((screen.getByText('Calcular transições ICM') as HTMLButtonElement).disabled).toBe(true);
  view.rerender(<IcmTransitionPanel context={context} inputError={null} />);
  fireEvent.change(screen.getByLabelText('Call vence: A'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Calcular transições ICM'));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('números finitos'));
  expect(global.fetch).not.toHaveBeenCalled();
});
