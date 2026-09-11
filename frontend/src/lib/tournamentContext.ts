import { z } from 'zod';
import { StructureSourceSchema } from './hrcStructure';
import { parseHandHistoryDetails } from './handParser';
import type { ICMPlayer } from './icmEngine';
import { normalizeHRCHandConfig } from './hrcFormat';
import { FieldModelSchema } from './fieldModel';

export const TABLE_CAPACITY = { PokerStars: 9, GGPoker: 8 } as const;
export type PokerRoom = keyof typeof TABLE_CAPACITY;
export const TournamentPlayerSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), stack: z.number().finite().nonnegative(),
  tableId: z.string().min(1).optional(), seat: z.number().int().positive().optional(),
});
const snapshotSchema = z.object({
  fieldModel: FieldModelSchema.optional(),
  tournamentType: z.literal('MTT').default('MTT'),
  variant: z.literal('NLHE').default('NLHE'),
  declaredTotalChips: z.number().finite().positive().optional(),
  fullPrizes: z.array(z.number().finite().positive()).optional(),
  totalEntries: z.number().int().positive().optional(),
  remainingPlayers: z.number().int().min(2).optional(),
  paidPlaces: z.number().int().positive().optional(),
  totalPrizePool: z.number().finite().positive().optional(),
  remainingPrizePool: z.number().finite().positive().optional(),
  payoutUnit: z.enum(['percent-remaining-pool', 'absolute']).optional(),
  room: z.enum(['PokerStars', 'GGPoker']).optional(),
  tournamentId: z.string().optional(),
  stackUnit: z.enum(['bb', 'chips']),
  bigBlind: z.number().finite().positive().optional(),
  smallBlind: z.number().finite().nonnegative().optional(),
  ante: z.number().finite().nonnegative().optional(),
  anteType: z.string().optional(),
  handId: z.string().optional(),
  buttonSeat: z.number().int().positive().optional(),
  heroId: z.string().optional(),
  suggestedPlayerIds: z.array(z.string()).optional(),
  structureSource: StructureSourceSchema.optional(),
  hrcConfig: z.record(z.string(), z.unknown()).optional(),
  players: z.array(TournamentPlayerSchema).min(2),
  prizes: z.array(z.number().finite().nonnegative()).optional(),
});
export type TournamentPlayer = z.infer<typeof TournamentPlayerSchema>;
export type TournamentSnapshot = z.infer<typeof snapshotSchema> & {
  rawInput: string;
  sourceFormat: 'json' | 'hand-history' | 'hrc-hand-config';
};
export interface TableSelection {
  room: PokerRoom;
  playerIds: string[];
  participantIds: string[];
}

/** The population has no table-size limit. Selection never truncates that input. */
function loadRawTournamentInput(rawInput: string): { input: unknown; sourceFormat: TournamentSnapshot['sourceFormat'] } {
  const isJson = rawInput.trimStart().startsWith('{');
  if (isJson) {
    const parsed = JSON.parse(rawInput);
    if (parsed && typeof parsed === 'object' && 'handdata' in parsed) {
      return { input: normalizeHRCHandConfig(parsed), sourceFormat: 'hrc-hand-config' };
    }
    return { input: parsed, sourceFormat: 'json' };
  }
  const hand = parseHandHistoryDetails(rawInput);
  return {
    input: { ...hand, stackUnit: 'chips', suggestedPlayerIds: hand.players.map(p => p.id) },
    sourceFormat: 'hand-history',
  };
}

function validateTournamentSnapshotData(data: z.infer<typeof snapshotSchema>): void {
  if (new Set(data.players.map(p => p.id)).size !== data.players.length) {
    throw new Error('IDs de jogadores repetidos: o snapshot precisa identificar cada jogador uma única vez.');
  }
  if (data.remainingPlayers !== undefined && data.remainingPlayers !== data.players.length) {
    throw new Error('O número de jogadores restantes informado não corresponde aos stacks recebidos. Complete o snapshot.');
  }
  if (data.totalEntries !== undefined && data.totalEntries < data.players.length) {
    throw new Error('O field total não pode ser menor que o número de jogadores restantes.');
  }
  const occupied = new Set<string>();
  for (const player of data.players) {
    if (player.tableId === undefined || player.seat === undefined) continue;
    const key = JSON.stringify([player.tableId, player.seat]);
    if (occupied.has(key)) throw new Error('Dois jogadores ocupam o mesmo assento na mesma mesa.');
    occupied.add(key);
  }
}

/** The population has no table-size limit. Selection never truncates that input. */
export function parseTournamentSnapshot(rawInput: string): TournamentSnapshot {
  const { input, sourceFormat } = loadRawTournamentInput(rawInput);
  const parsed = snapshotSchema.safeParse(input);
  if (!parsed.success) throw new Error('Input inválido: informe players com id, name e stack, e stackUnit (bb ou chips).');
  validateTournamentSnapshotData(parsed.data);
  return { ...parsed.data, rawInput, sourceFormat };
}

export function selectAnalysisTable(players: TournamentPlayer[], selection: TableSelection): TournamentPlayer[] {
  const capacity = TABLE_CAPACITY[selection.room];
  const { playerIds, participantIds } = selection;
  if (!capacity || playerIds.length < 2 || playerIds.length > capacity) {
    throw new Error(`Selecione de 2 a ${capacity ?? 9} jogadores para a mesa da sala informada.`);
  }
  if (new Set(playerIds).size !== playerIds.length || new Set(participantIds).size !== participantIds.length) {
    throw new Error('A seleção contém jogadores repetidos.');
  }
  const byId = new Map(players.map(player => [player.id, player]));
  if (byId.size !== players.length) throw new Error('IDs repetidos no contexto do torneio.');
  const selected = playerIds.map(id => {
    const player = byId.get(id);
    if (!player) throw new Error('Jogador selecionado ausente do contexto do torneio.');
    if (player.seat !== undefined && player.seat > capacity) throw new Error('Assento incompatível com a sala selecionada.');
    return player;
  });
  if (new Set(selected.flatMap(p => p.tableId ? [p.tableId] : [])).size > 1) {
    throw new Error('A seleção mistura jogadores de mesas diferentes.');
  }
  if (participantIds.length === 1 || participantIds.some(id => !playerIds.includes(id))) {
    throw new Error('Selecione pelo menos dois participantes da mão, todos pertencentes à mesa.');
  }
  return selected;
}

export function normalizeTournamentPlayers(snapshot: TournamentSnapshot, bigBlind?: number): TournamentPlayer[] {
  const divisor = snapshot.stackUnit === 'bb' ? 1 : (bigBlind ?? snapshot.bigBlind);
  if (divisor === undefined || !Number.isFinite(divisor) || divisor <= 0) {
    throw new Error('Informe o big blind em fichas para converter o snapshot para BB.');
  }
  return snapshot.players.map(player => {
    const stack = player.stack / divisor;
    if (!Number.isFinite(stack)) throw new Error('Conversão de stack fora do intervalo numérico.');
    return { ...player, stack };
  });
}

/** Edited seats replace their own stack, never remove the unselected population. */
export function mergeTableEdits(population: TournamentPlayer[], edits: ICMPlayer[]): TournamentPlayer[] {
  const updates = new Map(edits.map(player => [player.id, player]));
  if (updates.size !== edits.length || edits.some(p => !population.some(original => original.id === p.id))) {
    throw new Error('Edição da mesa sem correspondência no contexto do torneio.');
  }
  return population.map(player => ({ ...player, ...updates.get(player.id) }));
}
