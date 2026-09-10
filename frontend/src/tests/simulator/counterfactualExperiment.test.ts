import { evaluateCounterfactual, type CounterfactualRequest } from '../../lib/counterfactualExperiment';
import { defaultTournamentConditions } from '../../lib/tournamentConditions';

export function fixture(): CounterfactualRequest {
  return { context: {
    population: [{ id: 'a', name: 'A', stack: 40 }, { id: 'b', name: 'B', stack: 60 }],
    selection: { room: 'GGPoker', playerIds: ['a', 'b'], participantIds: [] },
    conditions: defaultTournamentConditions(2, 2), prizes: [65, 35], heroId: 'a',
  }, assumptions: { origin: 'didactic-default', unit: 'toy-utility', horizon: 'shared-terminal-horizon',
    fold: 98, win: 120, loss: 70, probabilities: [0.54, 0.60, 0.66] } };
}

test('curated synthetic case crosses indifference without double-counting fold', () => {
  const r = evaluateCounterfactual(fixture());
  expect(r.rows.map(row => row.delta)).toEqual([-1, 2, 5]);
  expect(r.threshold).toBeCloseTo(0.56);
  expect(r.rows.map(row => row.comparison)).toEqual(['fold', 'call', 'call']);
  expect(r.payouts).toEqual([6500, 3500]);
});

test('changing fold continuation changes the threshold, not the call valuation', () => {
  const input = fixture(); input.assumptions.fold = 102;
  const r = evaluateCounterfactual(input);
  expect(r.threshold).toBeCloseTo(0.64);
  expect(r.rows[1]!.call).toBe(100);
  expect(r.rows[1]!.delta).toBe(-2);
});

test('common utility translation preserves action ordering and thresholds', () => {
  const input = fixture(); const before = evaluateCounterfactual(input);
  input.assumptions.fold += 500; input.assumptions.win += 500; input.assumptions.loss += 500;
  const after = evaluateCounterfactual(input);
  expect(after.threshold).toBe(before.threshold);
  after.rows.forEach((r, i) => expect(r.delta).toBeCloseTo(before.rows[i]!.delta));
});

test.each([NaN, Infinity, -0.1, 1.1])('rejects impossible probability %p', value => {
  const input = fixture(); input.assumptions.probabilities = [value];
  expect(() => evaluateCounterfactual(input)).toThrow();
});

test('preserves 115 off-table players; the limit is on the table, not population', () => {
  const input = fixture();
  input.context.population.push(...Array.from({ length: 115 }, (_, i) => ({ id: `x${i}`, name: `X${i}`, stack: 10 })));
  input.context.conditions = defaultTournamentConditions(117, 2);
  const r = evaluateCounterfactual(input);
  expect(r.snapshot.context.population).toHaveLength(117);
  expect(r.rows.map(row => row.delta)).toEqual([-1, 2, 5]);
  expect(r.contextRole).toBe('validated-snapshot-not-utility-estimator');
});

test('rejects missing tournament stacks and inconsistent chip mass', () => {
  const input = fixture(); input.context.conditions.remainingPlayers = 3;
  expect(() => evaluateCounterfactual(input)).toThrow('3 stacks');
  input.context.conditions.remainingPlayers = 2; input.context.conditions.declaredTotalChipsBb = 999;
  expect(() => evaluateCounterfactual(input)).toThrow('Total de fichas');
});

test('rejects a ninth GG seat and a hero absent from the hand', () => {
  const input = fixture();
  input.context.selection.playerIds = Array.from({ length: 9 }, (_, i) => String(i));
  expect(() => evaluateCounterfactual(input)).toThrow('8 jogadores');
  input.context.selection.playerIds = ['a', 'b']; input.context.heroId = 'outsider';
  expect(() => evaluateCounterfactual(input)).toThrow('jogador da mesa');
});

test('constant and dominated utilities have explicit indifference semantics', () => {
  const input = fixture(); input.assumptions.win = 70; input.assumptions.fold = 70;
  expect(evaluateCounterfactual(input).everywhereIndifferent).toBe(true);
  input.assumptions.fold = 80;
  const result = evaluateCounterfactual(input);
  expect(result.threshold).toBeNull();
  expect(result.rows.every(row => row.comparison === 'fold')).toBe(true);
  input.assumptions.win = 60;
  expect(() => evaluateCounterfactual(input)).toThrow('maior ou igual');
});

test('an eliminated hero cannot call', () => {
  const input = fixture(); input.context.population[0]!.stack = 0;
  expect(() => evaluateCounterfactual(input)).toThrow('ter fichas');
});
