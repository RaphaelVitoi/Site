import { z } from 'zod';

export const TournamentConditionsSchema = z.object({
  fieldSize: z.number().int().positive().safe(),
  remainingPlayers: z.number().int().min(2).safe(),
  paidPlaces: z.number().int().positive().safe(),
  totalPrizePool: z.number().finite().positive(),
  remainingPrizePool: z.number().finite().positive(),
  declaredTotalChipsBb: z.number().finite().positive().optional(),
  payoutUnit: z.enum(['percent-remaining-pool', 'absolute']),
});
export type TournamentConditions = z.infer<typeof TournamentConditionsSchema>;

export function defaultTournamentConditions(remainingPlayers: number, payoutCount: number): TournamentConditions {
  const beforeMoney = payoutCount < remainingPlayers;
  return {
    fieldSize: Math.max(1000, remainingPlayers), remainingPlayers,
    paidPlaces: beforeMoney ? payoutCount : Math.max(150, remainingPlayers),
    totalPrizePool: 100000, remainingPrizePool: beforeMoney ? 100000 : 10000,
    payoutUnit: 'percent-remaining-pool',
  };
}

/** User parameters define the scenario. Reject contradictions, never fabricate missing stacks. */
export function resolveTournamentPayouts(conditions: TournamentConditions, stacksCount: number, payouts: number[]): number[] {
  const parsed = TournamentConditionsSchema.safeParse(conditions);
  if (!parsed.success) throw new Error('Field, restantes e ITM devem ser inteiros positivos; prize pools devem ser positivos e finitos.');
  const c = parsed.data;
  if (c.paidPlaces > c.fieldSize) throw new Error('ITM não pode exceder o field total.');
  if (c.remainingPlayers > c.fieldSize) throw new Error('Jogadores restantes não podem exceder o field total.');
  if (c.remainingPlayers !== stacksCount) throw new Error(`Informe os ${c.remainingPlayers} stacks restantes; há ${stacksCount} no contexto.`);
  if (c.remainingPrizePool > c.totalPrizePool) throw new Error('O prize pool restante não pode exceder o prize pool total.');
  if (c.remainingPlayers >= c.paidPlaces && c.remainingPrizePool !== c.totalPrizePool) {
    throw new Error('Antes de qualquer posição paga ser eliminada, o prize pool restante deve ser igual ao total.');
  }
  if (c.remainingPlayers < c.paidPlaces && c.remainingPrizePool === c.totalPrizePool) {
    throw new Error('Com colocações pagas já eliminadas, o pool restante deve ser menor que o total.');
  }
  const count = Math.min(c.remainingPlayers, c.paidPlaces);
  if (payouts.length !== count) throw new Error(`Informe ${count} payouts restantes para este field/ITM.`);
  if (payouts.some((value, index) => !Number.isFinite(value) || value <= 0 || (index > 0 && value > payouts[index - 1]!))) {
    throw new Error('Payouts devem ser positivos e ordenados do maior para o menor.');
  }
  const total = payouts.reduce((sum, value) => sum + value, 0);
  const target = c.payoutUnit === 'absolute' ? c.remainingPrizePool : 100;
  if (Math.abs(total - target) > Math.max(1, target) * 1e-8) {
    throw new Error(c.payoutUnit === 'absolute' ? 'A soma dos payouts deve coincidir com o prize pool restante.' : 'Os payouts percentuais devem somar 100% do pool restante.');
  }
  return c.payoutUnit === 'absolute' ? payouts : payouts.map(value => value / 100 * c.remainingPrizePool);
}

/** Explicitly synthetic descending percentages for a newly imported table without payouts. */
export function defaultTournamentPayouts(count: number): number[] {
  const total = count * (count + 1) / 2;
  const payouts = Array.from({ length: count }, (_, i) => Math.floor((count - i) / total * 10000) / 100);
  payouts[0] = payouts[0]! + Math.round((100 - payouts.reduce((sum, v) => sum + v, 0)) * 100) / 100;
  return payouts;
}


export function validateTournamentChipMass(conditions: TournamentConditions, stacks: number[]): void {
  const total = stacks.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || stacks.some(value => !Number.isFinite(value) || value < 0) || total <= 0) throw new Error('Informe stacks finitos e não negativos, com soma positiva.');
  const declared = conditions.declaredTotalChipsBb;
  if (declared !== undefined && (!Number.isFinite(declared) || declared <= 0 || Math.abs(total - declared) > Math.max(1, total) * 1e-7)) {
    throw new Error(`Total de fichas incompatível: declarado ${declared} BB; stacks recebidos somam ${total} BB. Complete os stacks externos ou revise o total informado.`);
  }
}
