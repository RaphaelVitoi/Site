import { parseTournamentSnapshot, selectAnalysisTable, normalizeTournamentPlayers, mergeTableEdits } from '../../lib/tournamentContext';
import { processTableIcmRequest as processRequest } from '../../components/simulator/workers/icmTableProcessor';
import { calculatePopulationIcm } from '../../lib/icmEngine';

const population = Array.from({ length: 12 }, (_, i) => ({
  id: String(i), name: `P${i}`, stack: (i + 1) * 10, tableId: i < 9 ? 'A' : 'B', seat: i < 9 ? i + 1 : i - 8,
}));
const selection = { room: 'PokerStars' as const, playerIds: ['0', '1'], participantIds: ['0', '1'] };
function processTableIcmRequest(input: { id: string; players: typeof population; prizes: number[]; selection: typeof selection }) {
  const pool = input.prizes.reduce((sum, value) => sum + value, 0);
  return processRequest({ ...input, conditions: { fieldSize: 1000, remainingPlayers: input.players.length,
    paidPlaces: input.prizes.length, totalPrizePool: pool, remainingPrizePool: pool, payoutUnit: 'absolute' } });
}

test('preserves the whole input while selecting a broken table and a hand subset', () => {
  const raw = JSON.stringify({ room: 'PokerStars', stackUnit: 'bb', players: population, prizes: [60, 30, 10], opaqueSource: 'kept in raw input' });
  const snapshot = parseTournamentSnapshot(raw);
  expect(snapshot.rawInput).toBe(raw);
  expect(snapshot.players).toHaveLength(12);
  const table = selectAnalysisTable(snapshot.players, { ...selection, playerIds: ['0', '1', '2'] });
  expect(table).toHaveLength(3);
  expect(snapshot.players).toHaveLength(12);
});

test('room capacity limits the selected table, not the population', () => {
  const nine = population.slice(0, 9).map(p => p.id);
  expect(selectAnalysisTable(population, { ...selection, playerIds: nine })).toHaveLength(9);
  expect(() => selectAnalysisTable(population, { ...selection, room: 'GGPoker', playerIds: nine })).toThrow();
  expect(selectAnalysisTable(population, { ...selection, room: 'GGPoker', playerIds: nine.slice(0, 8) })).toHaveLength(8);
  expect(() => selectAnalysisTable(population, { ...selection, playerIds: population.slice(0, 10).map(p => p.id) })).toThrow();
});

test('rejects duplicated identities, mixed tables, and participants outside the selected table', () => {
  expect(() => parseTournamentSnapshot(JSON.stringify({ stackUnit: 'bb', players: [population[0], population[0]] }))).toThrow('IDs');
  expect(() => selectAnalysisTable(population, { ...selection, playerIds: ['0', '9'], participantIds: ['0', '9'] })).toThrow('mesas diferentes');
  expect(() => selectAnalysisTable(population, { ...selection, participantIds: ['0', '9'] })).toThrow('pertencentes');
});

test('converts chips explicitly without rounding or replacing original stacks', () => {
  const snapshot = parseTournamentSnapshot('PokerStars Hand #1: Tournament #2, Hold’em No Limit - Level I\nSeat 1: A (1525.50 in chips)\nSeat 2: B (2400 in chips)');
  expect(() => normalizeTournamentPlayers(snapshot)).toThrow('big blind');
  expect(normalizeTournamentPlayers(snapshot, 100)[0]?.stack).toBe(15.255);
  expect(snapshot.players[0]?.stack).toBe(1525.5);
  expect(snapshot.players[0]?.id).toBe('seat_1');
  expect(() => parseTournamentSnapshot('PokerStars Hand #1\nPokerStars Hand #2')).toThrow('uma mão');
});

test('edits only the selected identity and keeps all other stacks in the population', () => {
  const edited = mergeTableEdits(population, [{ ...population[0]!, stack: 99 }]);
  expect(edited).toHaveLength(12);
  expect(edited[0]?.stack).toBe(99);
  expect(edited.slice(1)).toEqual(population.slice(1));
  expect(population[0]?.stack).toBe(10);
});

test('worker values the full field before projecting the selected table; equal payouts are not ChipEV', () => {
  // Everyone is guaranteed one unit regardless of chip share: an independent oracle.
  const result = processTableIcmRequest({ id: 'field', players: population, prizes: Array(12).fill(1), selection });
  expect(result.playerIds).toEqual(['0', '1']);
  expect(result.payload).toHaveLength(6);
  expect(result.payload[0]).toBe(1);
  expect(result.payload[3]).toBe(1);
  expect(result.payload[1]).toBeCloseTo(100 / 12);
  expect(result.metadata).toMatchObject({ method: 'malmuth-harville-monte-carlo', populationSize: 12, iterations: 20000, seed: 1, totalPrizes: 12 });
});

test('outside stacks affect the table and table selection does not change valuation', () => {
  const prizes = [60, 30, 10];
  const base = processTableIcmRequest({ id: 'one', players: population, prizes, selection });
  const wider = processTableIcmRequest({ id: 'two', players: population, prizes, selection: { ...selection, playerIds: ['0', '1', '2'] } });
  expect([...wider.payload.slice(0, 6)]).toEqual([...base.payload]);
  const changed = population.map(p => p.id === '11' ? { ...p, stack: 10000 } : p);
  const other = processTableIcmRequest({ id: 'three', players: changed, prizes, selection });
  expect(other.payload[0]).toBeLessThan(base.payload[0]!);
  expect(calculatePopulationIcm(population, prizes)).toEqual(calculatePopulationIcm(population, prizes));
});

test('exact and sampled terminal conventions preserve guaranteed payouts', () => {
  expect(calculatePopulationIcm([{ id: 'a', name: 'A', stack: 100 }, { id: 'b', name: 'B', stack: 0 }], [70, 30]).results.map(p => p.equity)).toEqual([70, 30]);
  const withTerminal = [...population, { id: 'busted', name: 'Eliminado', stack: 0 }];
  const { results } = calculatePopulationIcm(withTerminal, Array(13).fill(1));
  expect(results.map(p => p.equity)).toEqual(Array(13).fill(1));
  expect(results.reduce((sum, p) => sum + p.equityPercent, 0)).toBeCloseTo(100);
});
