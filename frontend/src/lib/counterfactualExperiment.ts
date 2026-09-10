import { z } from 'zod';
import { ChipLedgerSchema, validateChipLedger, validatePrizeLedger } from './chipLedger';
import { TournamentPlayerSchema, selectAnalysisTable } from './tournamentContext';
import { TournamentConditionsSchema, resolveTournamentPayouts, validateTournamentChipMass } from './tournamentConditions';

/** Reviewed executable adapter; source documents are references, never executable input. */
export const COUNTERFACTUAL_MODEL = {
  id: 'terminal-utility-binary', version: '1.0.0',
  hypotheses: ['PM-CONTINUATION', 'PM-FOLD', 'PM-MARGINAL-STABILITY'],
  corpus: 'pmev-2026-09-09',
  references: [
    { source: 'S09', blocks: [12, 15], hypothesis: 'PM-CONTINUATION' },
    { artifact: 'reports/curation/pmev-2026-09-09/experiments.json', experiment: 'TOY-FOLD' },
    { artifact: 'reports/curation/pmev-2026-09-09/supplement-crosswalk.json', hypothesis: 'PM-MARGINAL-STABILITY' },
  ],
  status: 'experimental-assumptions',
} as const;

const utility = z.number().finite().min(-1e12).max(1e12);
export const CounterfactualContextSchema = z.object({
  chipLedger: ChipLedgerSchema.optional(),
  population: z.array(TournamentPlayerSchema).min(2),
  selection: z.object({ room: z.enum(['PokerStars', 'GGPoker']), playerIds: z.array(z.string()), participantIds: z.array(z.string()) }),
  conditions: TournamentConditionsSchema,
  prizes: z.array(z.number().finite().positive()),
  heroId: z.string().min(1),
});
export const CounterfactualRequestSchema = z.object({
  context: CounterfactualContextSchema,
  assumptions: z.object({
    origin: z.enum(['didactic-default', 'user-assumption']),
    unit: z.literal('toy-utility'),
    horizon: z.literal('shared-terminal-horizon'),
    fold: utility,
    win: utility,
    loss: utility,
    probabilities: z.array(z.number().finite().min(0).max(1)).min(1).max(21),
  }).strict(),
}).strict();
export type CounterfactualRequest = z.infer<typeof CounterfactualRequestSchema>;

export function validateCounterfactualContext(c: CounterfactualRequest['context']) {
  if (c.chipLedger) {
    const ledger = validateChipLedger(c.chipLedger);
    const byId = new Map(ledger.players.map(p => [p.id, p.chips / ledger.bigBlind]));
    if (byId.size !== c.population.length || c.population.some(p => byId.get(p.id) !== p.stack) || ledger.seatOrder.length !== c.selection.playerIds.length || ledger.seatOrder.some(id => !c.selection.playerIds.includes(id))) throw new Error('A projeção em BB diverge do ledger de fichas ou da mesa.');
  }
  selectAnalysisTable(c.population, c.selection);
  const payouts = resolveTournamentPayouts(c.conditions, c.population.length, c.prizes);
  if (c.chipLedger) validatePrizeLedger(c.conditions.totalPrizePool, c.conditions.remainingPrizePool, payouts);
  validateTournamentChipMass(c.conditions, c.population.map(p => p.stack));
  if (!c.selection.playerIds.includes(c.heroId)) throw new Error('Selecione um jogador da mesa para o experimento.');
  if (!c.population.some(p => p.id === c.heroId && p.stack > 0)) throw new Error('O jogador precisa ter fichas para participar do experimento.');
  if (c.selection.participantIds.length && !c.selection.participantIds.includes(c.heroId)) throw new Error('O jogador deve participar da mão selecionada.');
  return payouts;
}

export function compareTerminalUtilities(a: { win: number; loss: number; fold: number; probabilities: number[] }) {
  // Absolute terminal values: fold is a counterfactual, not an extra reward or cost.
  const rows = a.probabilities.map(probability => {
    const call = probability * a.win + (1 - probability) * a.loss;
    const delta = call - a.fold;
    const tolerance = 1e-12 * Math.max(1, Math.abs(call), Math.abs(a.fold));
    return { probability, fold: a.fold, call, delta,
      comparison: Math.abs(delta) <= tolerance ? 'tie' as const : delta > 0 ? 'call' as const : 'fold' as const };
  });
  const rawThreshold = a.win === a.loss ? null : (a.fold - a.loss) / (a.win - a.loss);
  const threshold = rawThreshold !== null && rawThreshold >= 0 && rawThreshold <= 1 ? rawThreshold : null;
  return { threshold, everywhereIndifferent: a.win === a.loss && a.fold === a.win,
    rows, deltaRange: [Math.min(...rows.map(r => r.delta)), Math.max(...rows.map(r => r.delta))] };
}

export function evaluateCounterfactual(input: unknown) {
  const snapshot = CounterfactualRequestSchema.parse(input);
  const { context: c, assumptions: a } = snapshot;
  const payouts = validateCounterfactualContext(c);
  if (a.win < a.loss) throw new Error('O valor ao vencer deve ser maior ou igual ao valor ao perder neste molde.');
  return {
    model: COUNTERFACTUAL_MODEL, snapshot, payouts,
    method: 'deterministic-expectation' as const,
    contextRole: 'validated-snapshot-not-utility-estimator' as const,
    evaluatedActions: ['fold', 'call'] as const,
    ...compareTerminalUtilities(a),
    limitations: ['Valores e probabilidades assumidos; não são equidades estimadas do field.',
      'Mesmo horizonte e unidade para fold e call; não somar novamente fichas investidas.',
      'Sem empates de showdown, raises ou solve de equilíbrio. A amplitude não é intervalo de confiança.'],
  };
}
export type CounterfactualResult = ReturnType<typeof evaluateCounterfactual>;
