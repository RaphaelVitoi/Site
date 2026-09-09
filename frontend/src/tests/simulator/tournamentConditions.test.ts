import { defaultTournamentConditions, resolveTournamentPayouts, validateTournamentChipMass } from '../../lib/tournamentConditions';
import { processTableIcmRequest } from '../../components/simulator/workers/icmTableProcessor';

test('FT defaults describe an MTT context and convert percentages to the remaining pool', () => {
  const conditions = defaultTournamentConditions(2, 2);
  expect(conditions).toMatchObject({ fieldSize: 1000, paidPlaces: 150, remainingPlayers: 2 });
  expect(resolveTournamentPayouts(conditions, 2, [65, 35])).toEqual([6500, 3500]);
  const result = processTableIcmRequest({ id: 'ft', players: [{ id: 'a', name: 'A', stack: 50 }, { id: 'b', name: 'B', stack: 50 }],
    prizes: [65, 35], conditions, selection: { room: 'GGPoker', playerIds: ['a', 'b'], participantIds: [] } });
  expect([...result.payload]).toEqual([5000, 50, 0.5, 5000, 50, 0.5]);
  expect(result.metadata.totalPrizes).toBe(10000);
});

test.each([
  { fieldSize: 1 }, { paidPlaces: 1001 }, { remainingPlayers: 3 }, { fieldSize: 2.5 },
  { remainingPrizePool: 100001 }, { totalPrizePool: NaN }, { paidPlaces: 0 }, { remainingPrizePool: 100000 },
])('rejects impossible user context instead of manufacturing output: %p', patch => {
  expect(() => resolveTournamentPayouts({ ...defaultTournamentConditions(2, 2), ...patch }, 2, [65, 35])).toThrow();
});

test('ITM, remaining payouts and pool totals must be consistent', () => {
  const bubble = defaultTournamentConditions(4, 3);
  expect(resolveTournamentPayouts(bubble, 4, [50, 30, 20])).toEqual([50000, 30000, 20000]);
  expect(() => resolveTournamentPayouts({ ...bubble, remainingPrizePool: 50000 }, 4, [50, 30, 20])).toThrow('Antes');
  expect(() => resolveTournamentPayouts(bubble, 4, [60, 40])).toThrow('3 payouts');
  expect(() => resolveTournamentPayouts(bubble, 4, [20, 30, 50])).toThrow('ordenados');
  expect(() => resolveTournamentPayouts(bubble, 4, [60, 30, 20])).toThrow('100%');
  expect(() => resolveTournamentPayouts({ ...bubble, payoutUnit: 'absolute' }, 4, [50, 30, 20])).toThrow('soma');
});


test('a declared whole-tournament chip total prevents a lone HH table from masquerading as complete context', () => {
  const conditions = { ...defaultTournamentConditions(2, 2), declaredTotalChipsBb: 3780 };
  expect(() => validateTournamentChipMass(conditions, [40, 55])).toThrow('stacks externos');
  expect(() => validateTournamentChipMass({ ...conditions, declaredTotalChipsBb: 95 }, [40, 55])).not.toThrow();
  expect(() => validateTournamentChipMass(defaultTournamentConditions(2, 2), [40, 55])).not.toThrow();
});
