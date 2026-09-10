import { evaluateIcmTransitions, type IcmTransitionRequest, TransitionCapacityError } from '../../lib/icmTransitionExperiment';
import { defaultTournamentConditions } from '../../lib/tournamentConditions';

function fixture(): IcmTransitionRequest {
  const population = ['a', 'b', 'c'].map(id => ({ id, name: id, stack: 10 }));
  return { context: { population, selection: { room: 'PokerStars', playerIds: ['a', 'b'], participantIds: [] },
    conditions: defaultTournamentConditions(3, 3), prizes: [50, 30, 20], heroId: 'a' },
    origin: 'user-assumption', horizon: 'after-table-settlement', probabilities: [0, 4 / 7, 1], iterations: 100, seed: 1,
    fold: { tableStacks: [{ id: 'a', stack: 10 }, { id: 'b', stack: 10 }], eliminationOrder: [] },
    win: { tableStacks: [{ id: 'a', stack: 20 }, { id: 'b', stack: 0 }], eliminationOrder: ['b'] },
    loss: { tableStacks: [{ id: 'a', stack: 0 }, { id: 'b', stack: 20 }], eliminationOrder: ['a'] } };
}

test('pays the eliminated player once, values the whole field and derives the 4/7 threshold', () => {
  const result = evaluateIcmTransitions(fixture());
  expect(result.threshold).toBeCloseTo(4 / 7);
  expect(result.utilities.fold).toBeCloseTo(10000 / 3);
  expect(result.utilities.win).toBeCloseTo(13000 / 3);
  expect(result.utilities.loss).toBe(2000);
  expect(result.rows[1]!.comparison).toBe('tie');
  expect(result.states[1]!.payments).toEqual([{ id: 'b', place: 3, amount: 2000 }]);
  result.states.forEach(state => {
    expect(state.totalChips).toBe(30);
    expect(state.totalValue).toBeCloseTo(10000);
    expect(state.paid + state.remainingPool).toBe(10000);
    expect(state.population.find(p => p.id === 'c')!.stack).toBe(10);
  });
  expect(result.states[1]!.valuations.find(p => p.id === 'c')!.total).toBeCloseTo(11000 / 3);
  const observer = result.states[1]!.redistribution.find(p => p.id === 'c')!;
  expect(observer.unchangedStack).toBe(true);
  expect(observer.delta).toBeCloseTo(1000 / 3);
  expect(observer.averageValuePerBbBefore).toBeCloseTo(1000 / 3);
  expect(observer.averageValuePerBbAfter).toBeCloseTo(1100 / 3);
  expect(result.states[1]!.totalValuationDelta).toBeCloseTo(0);
  expect(result.states[1]!.redistribution.find(p => p.id === 'b')!.averageValuePerBbAfter).toBeNull();
});

test('multiple eliminations require exact resolved ranking, not payout sharing', () => {
  const input = fixture(); input.context.selection.playerIds.push('c');
  const branch = { tableStacks: [{ id: 'a', stack: 30 }, { id: 'b', stack: 0 }, { id: 'c', stack: 0 }], eliminationOrder: ['b', 'c'] };
  input.fold = branch; input.win = branch; input.loss = branch;
  const r = evaluateIcmTransitions(input);
  expect(r.states[0]!.payments).toEqual([{ id: 'b', place: 3, amount: 2000 }, { id: 'c', place: 2, amount: 3000 }]);
  expect(r.utilities.fold).toBe(5000);
  input.fold.eliminationOrder = [];
  expect(() => evaluateIcmTransitions(input)).toThrow('ordem');
});

test('unpaid eliminations remove players but no prize money', () => {
  const input = fixture(); input.context.conditions = defaultTournamentConditions(3, 2); input.context.prizes = [65, 35];
  const r = evaluateIcmTransitions(input);
  expect(r.states[1]!.payments).toEqual([{ id: 'b', place: 3, amount: 0 }]);
  expect(r.states[1]!.remainingPool).toBe(100000);
});

test.each(['fold', 'win', 'loss'] as const)('rejects chip creation in %s before valuation', action => {
  const input = fixture(); input[action].tableStacks[0]!.stack += 1;
  expect(() => evaluateIcmTransitions(input)).toThrow('conservar');
});

test('refuses external stack edits, duplicate IDs and impossible rankings', () => {
  const input = fixture(); input.fold.tableStacks[0]!.id = 'c';
  expect(() => evaluateIcmTransitions(input)).toThrow('jogador da mesa');
  input.fold.tableStacks[0]!.id = 'b';
  expect(() => evaluateIcmTransitions(input)).toThrow('exatamente uma vez');
  input.fold.tableStacks[0]!.id = 'a'; input.win.eliminationOrder = ['a'];
  expect(() => evaluateIcmTransitions(input)).toThrow('ordem');
});

test('Monte Carlo preserves 115 external stacks and declares approximation and reproducible seed', () => {
  const input = fixture();
  input.context.population = input.context.population.slice(0, 2).concat(Array.from({ length: 115 }, (_, i) => ({ id: `x${i}`, name: `X${i}`, stack: 10 })));
  input.context.conditions = defaultTournamentConditions(117, 2); input.context.prizes = [65, 35];
  const result = evaluateIcmTransitions(input);
  expect(result.approximate).toBe(true);
  expect(result.states[1]!.population).toHaveLength(117);
  expect(result.states[1]!.survivors).toHaveLength(116);
  expect(result.states[1]!.seed).toBe(1);
  expect(result.states[1]!.totalValue).toBeCloseTo(100000);
  expect(evaluateIcmTransitions(input).rows).toEqual(result.rows);
});

test('work budget rejects excess cost without a population cutoff or truncation', () => {
  const input = fixture();
  input.context.population.push(...Array.from({ length: 2000 }, (_, i) => ({ id: `x${i}`, name: `X${i}`, stack: 10 })));
  input.context.conditions = defaultTournamentConditions(2003, 3); input.iterations = 20000;
  expect(() => evaluateIcmTransitions(input)).toThrow(TransitionCapacityError);
});

test('hero elimination and remaining equity cannot be credited together', () => {
  const r = evaluateIcmTransitions(fixture());
  expect(r.states[2]!.valuations.find(p => p.id === 'a')).toEqual({ id: 'a', paid: 2000, remainingEquity: 0, total: 2000 });
});

test('a stack transfer without elimination revalues an unchanged third stack', () => {
  const input = fixture();
  input.win = { tableStacks: [{ id: 'a', stack: 15 }, { id: 'b', stack: 5 }], eliminationOrder: [] };
  const state = evaluateIcmTransitions(input).states[1]!;
  const observer = state.redistribution.find(p => p.id === 'c')!;
  expect(observer.unchangedStack).toBe(true);
  expect(observer.after).toBeCloseTo(3400);
  expect(observer.delta).toBeCloseTo(200 / 3);
  expect(state.paid).toBe(0);
  expect(state.totalValuationDelta).toBeCloseTo(0);
});
