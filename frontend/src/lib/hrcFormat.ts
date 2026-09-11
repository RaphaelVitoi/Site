import { readHRCPrizes } from './hrcPrizes';
export { readHRCPrizes } from './hrcPrizes';
import { z } from 'zod';
import type { TournamentPlayer, TableSelection, TournamentSnapshot } from './tournamentContext';
import { selectAnalysisTable } from './tournamentContext';
import { TournamentConditionsSchema, resolveTournamentPayouts, type TournamentConditions } from './tournamentConditions';
import { validateChipLedger, validatePrizeLedger, type ChipLedger } from './chipLedger';
import { FieldModelSchema } from './fieldModel';

const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
const nativeSchema = z.object({
  handdata: z.object({
    stacks: z.array(positive).min(2).max(9),
    blinds: z.tuple([positive, nonnegative, nonnegative]),
    anteType: z.string().optional(), skipSb: z.boolean().optional(),
    movingBu: z.boolean().optional(), straddleType: z.string().optional(),
  }).passthrough(),
  eqmodel: z.object({
    id: z.enum(['mtticm', 'malmuthharvil']),
    otherstacks: z.array(positive).optional(),
    structure: z.object({ name: z.string().optional(), chips: positive.optional(), prizes: z.record(z.string(), nonnegative) }).passthrough(),
  }).passthrough(),
  treeconfig: z.record(z.string(), z.unknown()).optional(),
  engine: z.record(z.string(), z.unknown()).optional(),
}).passthrough();
export type HRCHandConfig = z.infer<typeof nativeSchema>;

export function readHRCHandConfig(value: unknown): HRCHandConfig {
  const parsed = nativeSchema.safeParse(value);
  if (!parsed.success) throw new Error('JSON HRC inválido ou modelo não suportado. Use Save As → JSON (Hand Config) de um cenário ICM sem bounties.');
  const data = parsed.data;
  if (data.handdata.blinds[1] > data.handdata.blinds[0]) throw new Error('Small blind maior que o big blind na configuração HRC.');
  if (Object.keys(data.eqmodel).some(key => /bounty|knockout/i.test(key)) ||
    (Array.isArray(data.handdata['bounties']) && data.handdata['bounties'].some(Number))) {
    throw new Error('Este cálculo trata os payouts por colocação; configuração de bounties precisa de um modelo próprio.');
  }
  if (data.handdata.straddleType && data.handdata.straddleType !== 'OFF') throw new Error('Straddle não faz parte deste toy game de MTT.');
  const total = data.handdata.stacks.reduce((sum, v) => sum + v / 100, 0) + (data.eqmodel.otherstacks ?? []).reduce((sum, v) => sum + v, 0);
  if (!Number.isFinite(total) || (data.eqmodel.structure.chips !== undefined && Math.abs(total - data.eqmodel.structure.chips) > Math.max(1, total) * 1e-7)) {
    throw new Error(`Total de fichas do HRC inconsistente: declarado ${data.eqmodel.structure.chips}; soma dos stacks ${total}. Revise structure.chips ou complete/corrija os stacks.`);
  }
  return data;
}

export function normalizeHRCHandConfig(value: unknown) {
  const config = readHRCHandConfig(value);
  const players: TournamentPlayer[] = [
    ...config.handdata.stacks.map((stack, i) => ({ id: `hrc_table_${i}`, name: `HRC ${i + 1}`, stack: stack / 100, tableId: 'HRC mesa', seat: i + 1 })),
    ...(config.eqmodel.otherstacks ?? []).map((stack, i) => ({ id: `hrc_field_${i}`, name: `Field ${i + 1}`, stack })),
  ];
  const prizeData = readHRCPrizes(config.eqmodel.structure.prizes, players.length);
  const bigBlind = config.handdata.blinds[0] / 100;
  const fieldExtension = z.object({ fieldModel: FieldModelSchema.optional() }).safeParse(config['pmev']);
  let extra: { room?: 'PokerStars' | 'GGPoker'; totalEntries?: number; paidPlaces?: number; totalPrizePool?: number } = {};
  const extension = z.object({ room: z.enum(['PokerStars', 'GGPoker']), conditions: TournamentConditionsSchema }).safeParse(config['pmev']);
  if (extension.success) {
    const c = extension.data.conditions;
    resolveTournamentPayouts({ ...c, payoutUnit: 'absolute' }, players.length, prizeData.payouts);
    extra = { room: extension.data.room, totalEntries: c.fieldSize, paidPlaces: c.paidPlaces, totalPrizePool: c.totalPrizePool };
  }
  return {
    players, declaredTotalChips: config.eqmodel.structure.chips ?? players.reduce((sum, p) => sum + p.stack, 0), stackUnit: 'chips' as const, bigBlind, smallBlind: config.handdata.blinds[1] / 100, ante: config.handdata.blinds[2] / 100,
    anteType: config.handdata.anteType ?? 'REGULAR', remainingPlayers: players.length,
    paidPlaces: prizeData.paidPlaces, totalPrizePool: prizeData.totalPrizePool,
    remainingPrizePool: prizeData.payouts.reduce((sum, v) => sum + v, 0), prizes: prizeData.payouts,
    payoutUnit: 'absolute' as const, suggestedPlayerIds: players.filter(p => p.tableId).map(p => p.id),
    hrcConfig: config, fieldModel: fieldExtension.success && fieldExtension.data.fieldModel ? {
      ...fieldExtension.data.fieldModel, remainingPlayers: players.length,
      estimatedPlayerIds: players.filter(p => !p.tableId).map(p => p.id),
    } : undefined, ...extra,
  };
}

export interface HRCExportOptions {
  chipLedger?: ChipLedger;
  selection: TableSelection;
  conditions?: TournamentConditions;
  snapshot?: TournamentSnapshot | undefined;
  bigBlind?: number | undefined;
}

function validateExportLedger(
  population: TournamentPlayer[],
  payouts: number[],
  options: HRCExportOptions,
) {
  const ledger = options.chipLedger ? validateChipLedger(options.chipLedger) : undefined;
  const rawChips = new Map(ledger?.players.map(p => [p.id, p.chips]));
  if (ledger && (population.length !== rawChips.size || population.some(p => rawChips.get(p.id)! / ledger.bigBlind !== p.stack))) {
    throw new Error('Exportação diverge das fichas canônicas.');
  }
  if (ledger && options.conditions) {
    validatePrizeLedger(options.conditions.totalPrizePool, options.conditions.remainingPrizePool, payouts);
  }
  const source = options.snapshot;
  if (source?.structureSource?.bountyType && !['NONE', 'OFF'].includes(source.structureSource.bountyType.toUpperCase())) {
    throw new Error('Estrutura de bounty preservada. Exporte a coleção original para o HRC; exportar uma configuração PKO completa exige bounties por jogador e modelo próprio.');
  }
  return { ledger, rawChips };
}

function orderTableSeats(
  table: TournamentPlayer[],
  ledger: ReturnType<typeof validateChipLedger> | undefined,
  source: TournamentSnapshot | undefined,
): TournamentPlayer[] {
  if (ledger) {
    if (ledger.seatOrder.length !== table.length || ledger.seatOrder.some(id => !table.some(p => p.id === id))) {
      throw new Error('Mesa exportada diverge dos assentos canônicos.');
    }
    const button = ledger.seatOrder.indexOf(ledger.buttonId);
    const first = table.length === 2 ? button : (button + 3) % table.length;
    const order = [...ledger.seatOrder.slice(first), ...ledger.seatOrder.slice(0, first)];
    return order.map(id => table.find(p => p.id === id)!);
  }
  if (source?.buttonSeat !== undefined && table.every(p => p.seat !== undefined)) {
    const seats = [...table].sort((a, b) => a.seat! - b.seat!);
    const button = seats.findIndex(p => p.seat === source.buttonSeat);
    if (button < 0) throw new Error('O botão informado não está na mesa selecionada.');
    const first = seats.length === 2 ? button : (button + 3) % seats.length;
    return [...seats.slice(first), ...seats.slice(0, first)];
  }
  return table;
}

function buildHrcPrizeMap(
  payouts: number[],
  populationLength: number,
  source?: TournamentSnapshot,
  template?: HRCHandConfig,
  conditions?: TournamentConditions,
): Record<string, number> {
  const prizeMap: Record<string, number> = {};
  source?.fullPrizes?.forEach((prize, i) => { prizeMap[String(i + 1)] = prize; });
  if (template && !source?.fullPrizes) {
    const originalPrizes = readHRCPrizes(template.eqmodel.structure.prizes, populationLength);
    const keepHistorical = payouts.length === originalPrizes.payouts.length &&
      (!conditions || conditions.paidPlaces === originalPrizes.paidPlaces);
    if (keepHistorical) Object.assign(prizeMap, template.eqmodel.structure.prizes);
  }
  payouts.forEach((prize, i) => { prizeMap[String(i + 1)] = prize; });
  return prizeMap;
}

/** Settings only: no strategies or calculated EVs. Native HRC table amounts use cents (x100). */
export function generateHRCHandConfig(population: TournamentPlayer[], payouts: number[], options: HRCExportOptions): string {
  const { ledger, rawChips } = validateExportLedger(population, payouts, options);
  const source = options.snapshot;
  const rawTable = selectAnalysisTable(population, options.selection);
  const table = orderTableSeats(rawTable, ledger, source);
  const bb = ledger?.bigBlind ?? options.bigBlind ?? source?.bigBlind ?? 100;
  if (!Number.isFinite(bb) || bb <= 0) throw new Error('Big blind inválido para exportação.');
  if (population.some(p => !Number.isFinite(p.stack) || p.stack <= 0)) throw new Error('O setup de mão HRC exige stacks positivos.');
  if (!payouts.length || payouts.length > population.length || payouts.some((p, i) => !Number.isFinite(p) || p <= 0 || (i > 0 && p > payouts[i - 1]!))) throw new Error('Payouts inválidos para exportação HRC.');
  const tableIds = new Set(table.map(p => p.id));
  const outside = population.filter(p => !tableIds.has(p.id));
  const template = source?.hrcConfig ? readHRCHandConfig(source.hrcConfig) : undefined;
  const prizeMap = buildHrcPrizeMap(payouts, population.length, source, template, options.conditions);
  const cents = (value: number) => {
    const rounded = Math.round(value);
    if (!Number.isSafeInteger(rounded) || Math.abs(value - rounded) > 1e-6) throw new Error('A precisão dos stacks/blinds excede a escala de centésimos do HRC. Ajuste os inputs.');
    return rounded;
  };
  const config = {
    handdata: {
      ...template?.handdata, stacks: table.map(p => cents((rawChips.get(p.id) ?? p.stack * bb) * 100)),
      blinds: [cents(bb * 100), cents((source?.smallBlind ?? bb / 2) * 100), cents((source?.ante ?? 0) * 100)],
      skipSb: template?.handdata.skipSb ?? false, movingBu: template?.handdata.movingBu ?? true,
      anteType: source?.anteType ?? template?.handdata.anteType ?? 'REGULAR', straddleType: 'OFF',
    },
    eqmodel: {
      id: 'mtticm', otherstacks: outside.map(p => rawChips.get(p.id) ?? p.stack * bb).sort((a, b) => b - a),
      structure: { name: 'MTT - payouts em disputa', chips: ledger?.total ?? population.reduce((sum, p) => sum + p.stack * bb, 0), prizes: prizeMap },
    },
    treeconfig: template?.treeconfig ?? { mode: 'ui', preflop: { id: 'preflop.settings.general', settings: {
      ALLOWED_FLATS_PER_RAISE: [0, 0, 0, 0, 0], ALLOW_SB_COMPLETE: false, SIZES_OPEN_OTHERS: 'all-in', SIZES_OPEN_BU: 'all-in', SIZES_OPEN_SB: 'all-in',
    } } },
    engine: template?.engine ?? { type: 'montecarlo', maxactive: Math.min(3, table.length) },
    pmev: { kind: 'hand-config-only', conditions: options.conditions, room: options.selection.room,
      fieldModel: ledger?.fieldModel ?? source?.fieldModel,
      note: 'Setup de mão. Revise posições e árvore no HRC. Payouts anteriores à etapa atual só são preservados quando presentes no arquivo original.',
      players: population, selection: options.selection, stackUnit: 'bb' },
  };
  readHRCHandConfig(config);
  readHRCPrizes(prizeMap, population.length);
  return JSON.stringify(config, null, 2);
}
