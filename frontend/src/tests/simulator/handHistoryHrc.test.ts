import { processTableIcmRequest } from '../../components/simulator/workers/icmTableProcessor';
import nativeFtSettings from './fixtures/hrc-native-ft-settings.json';
import nativeSettings from './fixtures/hrc-native-settings.json';
import { pokerStarsHand, ggHand } from './fixtures/handHistories';
import { parseTournamentSnapshot, normalizeTournamentPlayers } from '../../lib/tournamentContext';
import { generateHRCHandConfig } from '../../lib/hrcFormat';
import { defaultTournamentConditions, defaultTournamentPayouts, resolveTournamentPayouts } from '../../lib/tournamentConditions';

// Real HRC settings fixture: only configuration, never imported solution EVs or ranges.
test('native HRC snapshot retains other tables and reconciles the distinct chip scales', () => {
  const snapshot = parseTournamentSnapshot(JSON.stringify(nativeSettings));
  expect(snapshot.sourceFormat).toBe('hrc-hand-config');
  expect(snapshot.players).toHaveLength(13);
  expect(snapshot.suggestedPlayerIds).toHaveLength(6);
  expect(snapshot.players.reduce((sum, p) => sum + p.stack, 0)).toBeCloseTo(378000, 5);
  expect(snapshot.bigBlind).toBe(1000);
  expect(normalizeTournamentPlayers(snapshot)[0]?.stack).toBe(59.51);
  expect(snapshot.paidPlaces).toBe(23);
  expect(snapshot.prizes).toHaveLength(13);
  expect(snapshot.prizes?.[12]).toBe(26.39);
});

test.each([[pokerStarsHand, 'PokerStars', 100, '900001 7', 5], [ggHand, 'GGPoker', 1000, '42', 8]] as const)(
  'HH auto-fill extracts initial seats, blinds, button and hero (%s)', (text, room, bb, table, button) => {
    const snapshot = parseTournamentSnapshot(text);
    expect(snapshot).toMatchObject({ room, bigBlind: bb, buttonSeat: button, stackUnit: 'chips' });
    expect(snapshot.players).toHaveLength(3);
    expect(snapshot.players.every(p => p.tableId === table)).toBe(true);
    expect(snapshot.players.find(p => p.id === snapshot.heroId)?.name).toBe('Hero');
    expect(snapshot.prizes).toBeUndefined();
    expect(snapshot.totalEntries).toBeUndefined();
    expect(snapshot.rawInput).toBe(text);
  });

test('GG commas and PS decimals remain exact; summary winnings never replace starting stacks', () => {
  expect(normalizeTournamentPlayers(parseTournamentSnapshot(pokerStarsHand))[0]?.stack).toBe(15.255);
  expect(normalizeTournamentPlayers(parseTournamentSnapshot(ggHand)).map(p => p.stack)).toEqual([15, 32.5, 22.5]);
});

test.each([
  pokerStarsHand.replace('Hold\'em No Limit', 'Omaha Pot Limit'),
  pokerStarsHand.replace('Tournament #900001, $10+$1 USD ', ''),
  pokerStarsHand + ggHand,
  pokerStarsHand.replace('1,525.50', '1.525,50'),
  pokerStarsHand.replace('Seat 8:', 'Seat 2:'),
])('rejects a contradictory or unsupported HH instead of partially accepting seats', text => {
  expect(() => parseTournamentSnapshot(text)).toThrow();
});

test('HRC export/reimport preserves full tournament equity inputs and source tree settings', () => {
  const snapshot = parseTournamentSnapshot(JSON.stringify(nativeSettings));
  const population = normalizeTournamentPlayers(snapshot);
  const selection = { room: 'PokerStars' as const, playerIds: snapshot.suggestedPlayerIds!, participantIds: [] };
  const output = generateHRCHandConfig(population, snapshot.prizes!, { selection, snapshot });
  const json = JSON.parse(output);
  expect(json.handdata.stacks).toEqual(nativeSettings.handdata.stacks);
  expect(json.handdata.blinds).toEqual(nativeSettings.handdata.blinds);
  expect(json.eqmodel.structure.chips).toBeCloseTo(378000, 6);
  expect(json.eqmodel.otherstacks).toHaveLength(7);
  expect(json.treeconfig).toEqual(nativeSettings.treeconfig);
  expect(json.engine).toEqual(nativeSettings.engine);
  const again = parseTournamentSnapshot(output);
  expect(again.players).toHaveLength(13);
  expect(again.prizes).toEqual(snapshot.prizes);
  expect(again.paidPlaces).toBe(23);
});

test('new HH export rotates physical seats to HRC positions and retains user MTT conditions', () => {
  const snapshot = parseTournamentSnapshot(ggHand);
  const population = normalizeTournamentPlayers(snapshot);
  const conditions = defaultTournamentConditions(3, 3);
  const selection = { room: 'GGPoker' as const, playerIds: population.map(p => p.id), participantIds: [] };
  const output = generateHRCHandConfig(population, [5000, 3000, 2000], { snapshot, selection, conditions });
  const json = JSON.parse(output);
  expect(json.handdata.stacks).toEqual([2250000, 1500000, 3250000]); // BU, SB, BB at 3-handed.
  expect(json.handdata.blinds).toEqual([100000, 50000, 12500]);
  const again = parseTournamentSnapshot(output);
  expect(again).toMatchObject({ room: 'GGPoker', totalEntries: 1000, paidPlaces: 150, totalPrizePool: 100000, remainingPrizePool: 10000 });
});

test('invalid native contexts and unsupported models cannot produce valid-looking output', () => {
  expect(() => parseTournamentSnapshot(JSON.stringify({ ...nativeSettings, eqmodel: { ...nativeSettings.eqmodel, otherstacks: [] } }))).toThrow('fichas');
  expect(() => parseTournamentSnapshot(JSON.stringify({ ...nativeSettings, eqmodel: { ...nativeSettings.eqmodel, id: 'pko' } }))).toThrow('modelo');
  expect(() => parseTournamentSnapshot('{"version":"3.0","equityModel":{},"players":[]}')).toThrow();
});

test.each([2, 3, 6, 8, 9])('synthetic payout defaults remain valid for %i seats', count => {
  const payouts = defaultTournamentPayouts(count);
  expect(() => resolveTournamentPayouts(defaultTournamentConditions(count, count), count, payouts)).not.toThrow();
});


test('native MTT final-table config keeps nine seats and trims only already-paid prizes for valuation', () => {
  // The source FT save itself has inconsistent chip metadata. Keep it intact and reject it.
  expect(() => parseTournamentSnapshot(JSON.stringify(nativeFtSettings))).toThrow('375013');
  const consistent = { ...nativeFtSettings, eqmodel: { ...nativeFtSettings.eqmodel,
    structure: { ...nativeFtSettings.eqmodel.structure, chips: 375013 } } };
  const snapshot = parseTournamentSnapshot(JSON.stringify(consistent));
  expect(snapshot.players).toHaveLength(9);
  expect(snapshot.prizes).toHaveLength(9);
  expect(snapshot.paidPlaces).toBe(23);
  expect(snapshot.players.reduce((sum, p) => sum + p.stack, 0)).toBeCloseTo(375013, 6);
  const output = JSON.parse(generateHRCHandConfig(normalizeTournamentPlayers(snapshot), snapshot.prizes!, {
    snapshot, selection: { room: 'PokerStars', playerIds: snapshot.suggestedPlayerIds!, participantIds: [] },
  }));
  expect(output.eqmodel.id).toBe('mtticm');
  expect(output.eqmodel.otherstacks).toEqual([]);
  expect(output.eqmodel.structure.prizes).toEqual(nativeFtSettings.eqmodel.structure.prizes);
});


test('123 remaining players: eight table seats plus 115 other HRC stacks all reach valuation', () => {
  const tableStacks = Array.from({ length: 8 }, (_, i) => (20000 + i * 1000) * 100);
  const otherstacks = Array.from({ length: 115 }, (_, i) => 10000 + i * 100);
  const chips = tableStacks.reduce((sum, v) => sum + v / 100, 0) + otherstacks.reduce((sum, v) => sum + v, 0);
  const config = { ...nativeSettings, handdata: { ...nativeSettings.handdata, stacks: tableStacks },
    eqmodel: { ...nativeSettings.eqmodel, otherstacks, structure: { ...nativeSettings.eqmodel.structure, chips } } };
  const snapshot = parseTournamentSnapshot(JSON.stringify(config));
  const population = normalizeTournamentPlayers(snapshot);
  expect(population).toHaveLength(123);
  const selection = { room: 'GGPoker' as const, playerIds: snapshot.suggestedPlayerIds!, participantIds: [] };
  const conditions = { fieldSize: 1000, remainingPlayers: 123, paidPlaces: 23, totalPrizePool: snapshot.totalPrizePool!,
    remainingPrizePool: snapshot.remainingPrizePool!, payoutUnit: 'absolute' as const };
  const result = processTableIcmRequest({ id: '123', players: population, prizes: snapshot.prizes!, selection, conditions });
  expect(result.metadata.populationSize).toBe(123);
  expect(result.playerIds).toHaveLength(8);
  expect(result.payload).toHaveLength(24);
  expect(result.payload.every(Number.isFinite)).toBe(true);
  const output = JSON.parse(generateHRCHandConfig(population, snapshot.prizes!, { snapshot, selection, conditions }));
  expect(output.handdata.stacks).toHaveLength(8);
  expect(output.eqmodel.otherstacks).toHaveLength(115);
  expect(parseTournamentSnapshot(JSON.stringify(output)).players).toHaveLength(123);
});


test('an attached complete PokerStars tournament summary fills field and the full prize structure', () => {
  const text = pokerStarsHand + `\nPokerStars Tournament #900001, No Limit Hold'em
126 players
Total Prize Pool: $1,000.00 USD
Total Chips: 378000
1: Winner (Brazil), $500.00 (50%)
2: Runner (Brazil), $300.00 (30%)
3: Third (Brazil), $150.00 (15%)
4: Fourth (Brazil), $50.00 (5%)
`;
  const snapshot = parseTournamentSnapshot(text);
  expect(snapshot).toMatchObject({ totalEntries: 126, totalPrizePool: 1000, declaredTotalChips: 378000,
    paidPlaces: 4, fullPrizes: [500, 300, 150, 50], prizes: [500, 300, 150], remainingPrizePool: 950, payoutUnit: 'absolute' });
  expect(() => parseTournamentSnapshot(text.replace('PokerStars Tournament #900001', 'PokerStars Tournament #99'))).toThrow('diferentes');
  const partial = parseTournamentSnapshot(text.replace('4: Fourth (Brazil), $50.00 (5%)', ''));
  expect(partial.totalPrizePool).toBe(1000);
  expect(partial.prizes).toBeUndefined();
});
