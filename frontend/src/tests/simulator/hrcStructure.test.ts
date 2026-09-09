import source from './fixtures/hrc-structure-pko.json';
import { parseHRCStructures, applyHRCStructure } from '../../lib/hrcStructure';
import { parseTournamentSnapshot } from '../../lib/tournamentContext';
import { generateHRCHandConfig } from '../../lib/hrcFormat';
import { pokerStarsHand } from './fixtures/handHistories';

test('actual user file fills 239 payouts, 7M chips and preserves PKO without inventing field', () => {
  const raw = JSON.stringify(source);
  const structures = parseHRCStructures(raw);
  expect(structures).toHaveLength(1);
  const s = structures[0]!;
  expect(s).toMatchObject({ chips: 7000000, bountyType: 'PKO', progressiveFactor: 0.5, rawInput: raw });
  expect(s.fullPrizes).toHaveLength(239);
  const hand = parseTournamentSnapshot(pokerStarsHand);
  const combined = applyHRCStructure(hand, s);
  expect(combined.players).toBe(hand.players);
  expect(combined.rawInput).toBe(pokerStarsHand);
  expect(combined.totalEntries).toBeUndefined();
  expect(combined.prizes).toEqual(s.fullPrizes.slice(0, hand.players.length));
  expect(combined.totalPrizePool).toBeCloseTo(3360, 8);
  expect(() => generateHRCHandConfig(combined.players, combined.prizes!, {
    snapshot: combined, selection: { room: 'PokerStars', playerIds: combined.players.map(p => p.id), participantIds: [] },
  })).toThrow('bounties por jogador');
});

test('nested collections preserve separate paths and the complete original export', () => {
  const raw = JSON.stringify({ ...source, extra: 'retained', folders: [source] });
  const items = parseHRCStructures(raw);
  expect(items.map(s => s.path)).toEqual(['/structures/0', '/folders/0/structures/0']);
  expect(items.every(s => s.rawInput === raw)).toBe(true);
});

test.each(['NaN', '', '-1', '7,000,000', '1e999'])('invalid numeric input %s is rejected', chips => {
  expect(() => parseHRCStructures(JSON.stringify({ ...source, structures: [{ ...source.structures[0], chips }] }))).toThrow();
});

test('empty collections and increasing payouts are rejected', () => {
  expect(() => parseHRCStructures(JSON.stringify({ ...source, structures: [] }))).toThrow();
  expect(() => parseHRCStructures('{}')).toThrow();
  expect(() => parseHRCStructures(JSON.stringify({ ...source, structures: [{ ...source.structures[0], prizes: { 1: '10', 2: '20' } }] }))).toThrow();
});
