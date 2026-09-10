import { chipUnits, moneyUnits, tablePositions, validateChipLedger, validatePrizeLedger } from '../../lib/chipLedger';
import { evaluateIcmTransitions, type IcmTransitionRequest } from '../../lib/icmTransitionExperiment';
import { generateHRCHandConfig, normalizeHRCHandConfig } from '../../lib/hrcFormat';

const ledger = { total: 95000, bigBlind: 1000, buttonId: 'a', seatOrder: ['a', 'b'], players: [{ id: 'a', chips: 20250 }, { id: 'b', chips: 74750 }] };
test('canonical chips reject deficits, excess, fractions and unsafe totals', () => {
  expect(validateChipLedger(ledger).total).toBe(95000);
  for (const change of [-1, 1, 0.5]) expect(() => validateChipLedger({ ...ledger, players: [{ id: 'a', chips: 20250 + change }, ledger.players[1]] })).toThrow();
  expect(() => chipUnits(20250.1)).toThrow();
  expect(() => chipUnits(Number.MAX_SAFE_INTEGER + 1)).toThrow();
  expect(chipUnits(20250 / 37 * 37)).toBe(20250);
});
test('positions follow the button and circular order for HU, broken and full tables', () => {
  expect(tablePositions(['a', 'b'], 'b')).toEqual({ b: 'BTN / SB', a: 'BB' });
  expect(tablePositions(['a', 'b', 'c'], 'c')).toEqual({ c: 'BTN', a: 'SB', b: 'BB' });
  expect(tablePositions(['1','2','3','4','5','6','7','8','9'], '7')).toEqual({ '7':'BTN','8':'SB','9':'BB','1':'UTG','2':'UTG+1','3':'MP','4':'LJ','5':'HJ','6':'CO' });
  expect(tablePositions(['1','2','3','4','5','6','7','8'], '6')['1']).toBe('UTG');
  expect(tablePositions(['a', 'b'], 'missing')).toEqual({});
});
test('money allocation is exact in cents even when a relative tolerance would hide one cent', () => {
  expect(moneyUnits(0.29)).toBe(29);
  expect(() => moneyUnits(0.001)).toThrow();
  expect(() => validatePrizeLedger(1e9, 1e9, [6e8, 4e8])).not.toThrow();
  expect(() => validatePrizeLedger(1e9, 1e9, [6e8, 4e8 + 0.01])).toThrow('Diferença');
  expect(() => validatePrizeLedger(100, 100, [65, 34.99])).toThrow();
});

function request(): IcmTransitionRequest {
  const population = [...ledger.players, { id: 'c', chips: 5000 }].map(p => ({ id: p.id, name: p.id, stack: p.chips / 1000 }));
  return { context: { population, chipLedger: { ...ledger, total: 100000, players: [...ledger.players, { id: 'c', chips: 5000 }] }, selection: { room: 'PokerStars', playerIds: ['a','b'], participantIds: [] },
    conditions: { fieldSize: 100, remainingPlayers: 3, paidPlaces: 3, totalPrizePool: 100, remainingPrizePool: 100, payoutUnit: 'absolute' }, prizes: [50,30,20], heroId: 'a' },
    origin: 'user-assumption', horizon: 'after-table-settlement', probabilities: [0,0.5,1], iterations: 100, seed: 1,
    fold: { tableStacks: [{ id: 'a', stack: 20250 }, { id: 'b', stack: 74750 }], eliminationOrder: [] },
    win: { tableStacks: [{ id: 'a', stack: 95000 }, { id: 'b', stack: 0 }], eliminationOrder: ['b'] },
    loss: { tableStacks: [{ id: 'a', stack: 0 }, { id: 'b', stack: 95000 }], eliminationOrder: ['a'] } };
}
test('settled transitions conserve physical chips, external stacks and paid plus remaining money', () => {
  const result = evaluateIcmTransitions(request());
  expect(result.stackUnit).toBe('chips');
  for (const state of result.states) {
    expect(state.totalChips).toBe(100000);
    expect(state.population.find(p => p.id === 'c')!.stack).toBe(5000);
    expect(moneyUnits(state.paid) + moneyUnits(state.remainingPool)).toBe(10000);
  }
  const row = result.states[0]!.redistribution[0]!;
  expect(row.averageValuePerBbBefore).toBeCloseTo(row.before / 20.25);
  for (const change of [-1, 1, 0.5]) {
    const input = request(); input.win.tableStacks[0]!.stack += change;
    expect(() => evaluateIcmTransitions(input)).toThrow();
  }
});
test('HRC export keeps raw chips, payouts and HU button ordering through reimport', () => {
  const input = request();
  const json = generateHRCHandConfig(input.context.population.map((p, i) => ({ ...p, seat: i + 1 })), input.context.prizes, {
    selection: input.context.selection, conditions: input.context.conditions, chipLedger: { ...input.context.chipLedger!, buttonId: 'b' },
    snapshot: { tournamentType:'MTT', variant:'NLHE', stackUnit:'chips', players: [], rawInput:'', sourceFormat:'json', buttonSeat:2 },
  });
  const restored = normalizeHRCHandConfig(JSON.parse(json));
  expect(restored.declaredTotalChips).toBe(100000);
  expect(restored.players.reduce((sum,p) => sum+p.stack, 0)).toBe(100000);
  expect(restored.prizes).toEqual([50,30,20]);
  expect(restored.players[0]!.stack).toBe(74750);
});
