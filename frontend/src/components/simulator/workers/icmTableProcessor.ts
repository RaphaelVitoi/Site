import { z } from 'zod';
import { calculatePopulationIcm, type IcmMethod } from '../../../lib/icmEngine';
import { selectAnalysisTable, TournamentPlayerSchema } from '../../../lib/tournamentContext';
import { TournamentConditionsSchema, resolveTournamentPayouts, validateTournamentChipMass } from '../../../lib/tournamentConditions';

const requestSchema = z.object({
  id: z.string(),
  players: z.array(TournamentPlayerSchema).min(2),
  prizes: z.array(z.number().finite().nonnegative()),
  conditions: TournamentConditionsSchema,
  selection: z.object({
    room: z.enum(['PokerStars', 'GGPoker']),
    playerIds: z.array(z.string()), participantIds: z.array(z.string()),
  }),
});
export type IcmTableRequest = z.infer<typeof requestSchema>;
export interface IcmTableResponse {
  id: string;
  type: 'ICM_RESULT';
  playerIds: string[];
  payload: Float64Array;
  metadata: IcmMethod;
}

/** Compute on the entire population, project only after ICM valuation. */
export function processTableIcmRequest(data: unknown): IcmTableResponse {
  const { id, players, prizes, selection, conditions } = requestSchema.parse(data);
  const table = selectAnalysisTable(players, selection);
  validateTournamentChipMass(conditions, players.map(p => p.stack));
  const payouts = resolveTournamentPayouts(conditions, players.length, prizes);
  const { results, metadata } = calculatePopulationIcm(players, payouts);
  const byId = new Map(results.map(row => [row.id, row]));
  const payload = new Float64Array(table.length * 3);
  table.forEach((player, i) => {
    const result = byId.get(player.id)!;
    payload.set([result.equity, result.equityPercent, result.winProb], i * 3);
  });
  return { id, type: 'ICM_RESULT', playerIds: table.map(player => player.id), payload, metadata };
}
