import { allocateWholeChips } from './fieldModel';
import { type TournamentSnapshot } from './tournamentContext';
import { chipUnits } from './chipLedger';

export function fieldSetup(snapshot: TournamentSnapshot, selected: string[], blind?: number) {
  const bb = blind ?? snapshot.bigBlind;
  if (snapshot.stackUnit === 'bb' && (!bb || !Number.isFinite(bb))) throw new Error('Informe o big blind em fichas.');
  const players = snapshot.players.map(p => ({ ...p, stack: chipUnits(p.stack * (snapshot.stackUnit === 'bb' ? bb! : 1)) }));
  const table = players.filter(p => selected.includes(p.id));
  if (table.length < 2 || new Set(selected).size !== selected.length || table.length !== selected.length) throw new Error('Selecione a mesa antes de estimar o field.');
  const total = snapshot.declaredTotalChips;
  if (!total || !Number.isSafeInteger(total)) throw new Error('Informe uma estrutura com total inteiro de fichas do torneio.');
  const tableChips = table.reduce((sum, p) => sum + p.stack, 0);
  if (!Number.isSafeInteger(tableChips) || tableChips <= 0 || table.some(p => p.stack <= 0) || tableChips > total) throw new Error('Stacks da mesa incompatíveis com o total de fichas.');
  const outside = players.filter(p => !selected.includes(p.id));
  return { total, table, outside, tableChips, externalChips: total - tableChips,
    suggestedCount: Math.max(table.length + (total > tableChips ? 1 : 0), Math.round(total / (tableChips / table.length))) };
}

export function completeField(snapshot: TournamentSnapshot, selected: string[], remaining: number, countOrigin: 'table-mean-estimate' | 'user', blind?: number): TournamentSnapshot {
  const setup = fieldSetup(snapshot, selected, blind);
  if (setup.outside.length) throw new Error('Já existem stacks externos; não serão substituídos por uma estimativa da mesa.');
  if (!Number.isSafeInteger(remaining) || remaining < setup.table.length || remaining > 10000 || (snapshot.totalEntries !== undefined && remaining > snapshot.totalEntries)) throw new Error('Informe um número de restantes compatível com a mesa e o field, até 10.000 para esta geração local.');
  const n = remaining - setup.table.length;
  const sorted = setup.table.map(p => p.stack).sort((a, b) => a - b);
  const weights = Array.from({ length: n }, (_, i) => {
    const index = (i + 0.5) / n * (sorted.length - 1);
    const low = Math.floor(index), high = Math.ceil(index);
    return sorted[low]! + (sorted[high]! - sorted[low]!) * (index - low);
  });
  const chips = allocateWholeChips(weights, setup.externalChips);
  const used = new Set(snapshot.players.map(p => p.id));
  let prefix = 'estimated-field-';
  while (chips.some((_, i) => used.has(`${prefix}${i + 1}`))) prefix += 'x-';
  const external = chips.map((stack, i) => ({ id: `${prefix}${i + 1}`, name: `Externo estimado ${i + 1}`, stack }));
  const prizes = snapshot.fullPrizes?.slice(0, remaining);
  if (!prizes?.length) throw new Error('Importe a estrutura completa de premiação antes de gerar o field.');
  return { ...snapshot, stackUnit: 'chips', bigBlind: blind ?? snapshot.bigBlind, players: [...setup.table, ...external],
    remainingPlayers: remaining, suggestedPlayerIds: selected, prizes, payoutUnit: 'absolute',
    remainingPrizePool: prizes.reduce((sum, value) => sum + value, 0),
    fieldModel: { method: 'table-empirical-quantiles-v1', countOrigin, remainingPlayers: remaining, estimatedPlayerIds: external.map(p => p.id) } };
}

/** Explicit materialization of saved HRC estimates, retaining original values and source file. */
export function materializeHrcField(snapshot: TournamentSnapshot): TournamentSnapshot {
  if (snapshot.sourceFormat !== 'hrc-hand-config' || snapshot.stackUnit !== 'chips') throw new Error('Use um cenário HRC em fichas.');
  const selected = snapshot.suggestedPlayerIds ?? [];
  const table = snapshot.players.filter(p => selected.includes(p.id));
  const outside = snapshot.players.filter(p => !selected.includes(p.id));
  const total = snapshot.declaredTotalChips;
  if (!total || !Number.isSafeInteger(total) || !outside.length || table.some(p => !Number.isSafeInteger(p.stack) || p.stack <= 0)) throw new Error('Cenário incompatível com materialização em fichas inteiras.');
  const externalTotal = total - table.reduce((sum, p) => sum + p.stack, 0);
  const original = outside.map(p => p.stack);
  if (Math.abs(original.reduce((sum, value) => sum + value, 0) - externalTotal) > Math.max(1, total) * 1e-7) throw new Error('O cenário original não conserva o total declarado; revise a fonte.');
  const allocated = allocateWholeChips(original, externalTotal);
  const byId = new Map(outside.map((p, i) => [p.id, allocated[i]!]));
  return { ...snapshot, players: snapshot.players.map(p => ({ ...p, stack: byId.get(p.id) ?? p.stack })),
    fieldModel: { method: 'hrc-integer-allocation-v1', countOrigin: 'imported-scenario', remainingPlayers: snapshot.players.length,
      estimatedPlayerIds: outside.map(p => p.id), originalExternalStacks: original } };
}
