import settings from './fixtures/hrc-native-settings.json';
import { completeField, fieldSetup, materializeHrcField } from '../../lib/fieldCompletion';
import { parseTournamentSnapshot } from '../../lib/tournamentContext';
import { allocateWholeChips } from '../../lib/fieldModel';

const fullPrizes = Object.values(settings.eqmodel.structure.prizes);
function source() {
  return parseTournamentSnapshot(JSON.stringify({ room: 'PokerStars', stackUnit: 'chips', bigBlind:700, declaredTotalChips:378000,
    players: [6517,28000,10500,12054,36001,17500,16100,28000,21000].map((stack,i) => ({ id:String(i),name:String(i),stack,seat:i+1 })),
    fullPrizes, paidPlaces:23, totalPrizePool:fullPrizes.reduce((s,v)=>s+v,0) }));
}
test('screenshot chips imply 202328 external chips; count remains an explicit assumption', () => {
  const input=source(), ids=input.players.map(p=>p.id);
  const setup=fieldSetup(input,ids);
  expect(setup.tableChips).toBe(175672);
  expect(setup.externalChips).toBe(202328);
  expect(setup.suggestedCount).toBe(19);
  const ten=completeField(input,ids,10,'user');
  expect(ten.players.at(-1)!.stack).toBe(202328);
  const nineteen=completeField(input,ids,19,'table-mean-estimate');
  expect(nineteen.players).toHaveLength(19);
  expect(nineteen.players.reduce((s,p)=>s+p.stack,0)).toBe(378000);
  expect(nineteen.players.every(p=>Number.isSafeInteger(p.stack)&&p.stack>0)).toBe(true);
  expect(nineteen.players.slice(0,9)).toEqual(input.players);
  expect(nineteen.prizes).toEqual(fullPrizes.slice(0,19));
  expect(nineteen.fieldModel!.estimatedPlayerIds).toHaveLength(10);
});
test('rejects impossible fields and never replaces known external stacks', () => {
  const input=source(), ids=input.players.map(p=>p.id);
  for(const count of [8,9,10.5,10001]) expect(()=>completeField(input,ids,count,'user')).toThrow();
  expect(()=>completeField(input,ids.slice(0,8),20,'user')).toThrow('Já existem');
  expect(()=>completeField({...input,declaredTotalChips:100},ids,10,'user')).toThrow();
});
test('HRC fractional distribution can be materialized explicitly, preserving raw provenance and exact total', () => {
  const input=parseTournamentSnapshot(JSON.stringify(settings));
  const output=materializeHrcField(input);
  expect(output.players).toHaveLength(13);
  expect(output.players.slice(0,6)).toEqual(input.players.slice(0,6));
  expect(output.players.every(p=>Number.isSafeInteger(p.stack))).toBe(true);
  expect(output.players.reduce((s,p)=>s+p.stack,0)).toBe(378000);
  expect(output.fieldModel!.originalExternalStacks).toEqual(settings.eqmodel.otherstacks);
  expect(output.hrcConfig).toEqual(input.hrcConfig);
  expect(input.players[6]!.stack).not.toBe(output.players[6]!.stack);
});
test('apportionment conserves the integer budget including small and skewed populations', () => {
  for(const weights of [[1],[1,1,1],[100000,1,1],[0.1,0.2,0.7]]) {
    for(const total of [weights.length,17,10000]) {
      const chips=allocateWholeChips(weights,total);
      expect(chips.reduce((s,n)=>s+n,0)).toBe(total);
      expect(chips.every(n=>Number.isSafeInteger(n)&&n>0)).toBe(true);
    }
  }
});
