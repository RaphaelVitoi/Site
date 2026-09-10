import { z } from 'zod';
import { CounterfactualContextSchema, compareTerminalUtilities, validateCounterfactualContext, COUNTERFACTUAL_MODEL } from './counterfactualExperiment';
import { calculatePopulationIcm } from './icmEngine';
import { calculateIcmMonteCarlo } from './montecarlo';
import { moneyUnits } from './chipLedger';

const transitionSchema = z.object({
  tableStacks: z.array(z.object({ id: z.string(), stack: z.number().finite().nonnegative() }).strict()).min(2).max(9),
  // First ID takes the worst remaining place; no equal sharing is inferred.
  eliminationOrder: z.array(z.string()).max(9),
}).strict();
export const IcmTransitionRequestSchema = z.object({
  context: CounterfactualContextSchema,
  origin: z.enum(['identity-default', 'user-assumption']),
  horizon: z.literal('after-table-settlement'),
  fold: transitionSchema, win: transitionSchema, loss: transitionSchema,
  probabilities: z.array(z.number().finite().min(0).max(1)).min(1).max(21),
  iterations: z.number().int().min(100).max(20000).default(2000),
  seed: z.number().int().min(0).max(0xffffffff).default(1),
}).strict();
export type IcmTransitionRequest = z.infer<typeof IcmTransitionRequestSchema>;
export class TransitionCapacityError extends Error {}

export function evaluateIcmTransitions(raw: unknown) {
  const snapshot = IcmTransitionRequestSchema.parse(raw);
  const { context: c } = snapshot;
  const payouts = validateCounterfactualContext(c);
  if (c.population.some(p => p.stack <= 0)) throw new Error('O snapshot inicial deve conter apenas jogadores ainda vivos. Resolva eliminações anteriores antes do experimento.');
  const rawChips = new Map(c.chipLedger?.players.map(p => [p.id, p.chips]));
  const initialPopulation = c.population.map(p => ({ ...p, stack: rawChips.get(p.id) ?? p.stack }));
  const stackUnit = c.chipLedger ? 'chips' as const : 'bb' as const;
  const bbScale = c.chipLedger?.bigBlind ?? 1;
  const initialChips = initialPopulation.reduce((sum, p) => sum + p.stack, 0);
  const initialPool = payouts.reduce((sum, p) => sum + p, 0);
  const tableIds = new Set(c.selection.playerIds);

  // Validate every branch before spending time in the sampler.
  const states = (['fold', 'win', 'loss'] as const).map(action => {
    const transition = snapshot[action];
    const updates = new Map(transition.tableStacks.map(p => [p.id, p.stack]));
    if (updates.size !== tableIds.size || updates.size !== transition.tableStacks.length || [...updates.keys()].some(id => !tableIds.has(id))) {
      throw new Error(`${action}: informe cada jogador da mesa exatamente uma vez; jogadores externos permanecem no field.`);
    }
    if (c.chipLedger && transition.tableStacks.some(p => !Number.isSafeInteger(p.stack))) throw new Error(`${action}: stacks devem ser fichas inteiras.`);
    const population = initialPopulation.map(p => ({ ...p, stack: updates.get(p.id) ?? p.stack }));
    const totalChips = population.reduce((sum, p) => sum + p.stack, 0);
    if (!Number.isFinite(totalChips) || (c.chipLedger ? !Number.isSafeInteger(totalChips) || totalChips !== initialChips : Math.abs(totalChips - initialChips) > Math.max(1, initialChips) * 1e-9)) {
      throw new Error(`${action}: a transição deve conservar ${initialChips} ${stackUnit === 'chips' ? 'fichas' : 'BB'}, incluindo o field completo. Não deixe fichas em um pote não distribuído.`);
    }
    const busted = population.filter(p => p.stack === 0).map(p => p.id);
    const order = transition.eliminationOrder;
    if (order.length !== busted.length || new Set(order).size !== order.length || order.some(id => !busted.includes(id))) {
      throw new Error(`${action}: declare a ordem de todos os eliminados, da pior para a melhor colocação, sem empates inferidos.`);
    }
    const payments = order.map((id, i) => ({ id, place: population.length - i, amount: payouts[population.length - i - 1] ?? 0 }));
    const survivors = population.filter(p => p.stack > 0);
    const remainingPayouts = payouts.slice(0, survivors.length);
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingPool = remainingPayouts.reduce((sum, p) => sum + p, 0);
    if (c.chipLedger && payments.reduce((sum, p) => sum + moneyUnits(p.amount), 0) + remainingPayouts.reduce((sum, p) => sum + moneyUnits(p), 0) !== moneyUnits(c.conditions.remainingPrizePool)) throw new Error('Premiação inconsistente em centavos após liquidação.');
    if (Math.abs(paid + remainingPool - initialPool) > Math.max(1, initialPool) * 1e-9) throw new Error('Premiação inconsistente após liquidação.');
    return { action, population, survivors, payments, remainingPayouts, paid, remainingPool, totalChips };
  });
  // A workload budget, not a population limit. Never truncate stacks or payouts.
  const initialState: typeof states[number] = { action: 'fold', population: initialPopulation, survivors: initialPopulation,
    payments: [], remainingPayouts: payouts, paid: 0, remainingPool: initialPool, totalChips: initialChips };
  const work = [...states, initialState].reduce((sum, s) => sum + (s.survivors.length > 10 ? s.survivors.length * s.remainingPayouts.length * snapshot.iterations : 0), 0);
  if (work > 100_000_000) throw new TransitionCapacityError('Este pedido excede o orçamento de cálculo síncrono. Reduza as amostras; nenhum stack ou payout foi descartado.');

  const valueState = (state: typeof states[number]) => {
    const exact = state.survivors.length <= 10;
    const equities = exact
      ? calculatePopulationIcm(state.survivors, state.remainingPayouts).results.map(r => r.equity)
      : calculateIcmMonteCarlo(state.survivors.map(p => p.stack), state.remainingPayouts, { iterations: snapshot.iterations, seed: snapshot.seed });
    const byId = new Map(state.survivors.map((p, i) => [p.id, equities[i]!]));
    const paymentById = new Map(state.payments.map(p => [p.id, p.amount]));
    const valuations = state.population.map(p => ({ id: p.id, paid: paymentById.get(p.id) ?? 0, remainingEquity: byId.get(p.id) ?? 0,
      total: (paymentById.get(p.id) ?? 0) + (byId.get(p.id) ?? 0) }));
    const totalValue = valuations.reduce((sum, v) => sum + v.total, 0);
    if (!Number.isFinite(totalValue) || Math.abs(totalValue - initialPool) > Math.max(1, initialPool) * 1e-7) throw new Error('A valoração não conservou a premiação.');
    return { ...state, valuations, heroValue: valuations.find(p => p.id === c.heroId)!.total,
      method: exact ? 'malmuth-harville-exact' as const : 'malmuth-harville-monte-carlo' as const,
      iterations: exact ? 0 : snapshot.iterations, seed: exact ? null : snapshot.seed,
      totalValue, accountingResidual: totalValue - initialPool };
  };
  const baseline = valueState(initialState);
  const initialValues = new Map(baseline.valuations.map(p => [p.id, p.total]));
  const initialStacks = new Map(initialPopulation.map(p => [p.id, p.stack]));
  const valued = states.map(state => {
    const value = valueState(state);
    const stacksAfter = new Map(state.population.map(p => [p.id, p.stack]));
    const redistribution = value.valuations.map(v => {
      const before = initialValues.get(v.id)!;
      const stackBefore = initialStacks.get(v.id)!;
      const stackAfter = stacksAfter.get(v.id)!;
      return { id: v.id, before, after: v.total, paid: v.paid, remainingEquity: v.remainingEquity,
        delta: v.total - before, stackBefore, stackAfter, unchangedStack: stackBefore === stackAfter,
        averageValuePerBbBefore: before / stackBefore * bbScale,
        averageValuePerBbAfter: stackAfter > 0 ? v.remainingEquity / stackAfter * bbScale : null };
    });
    return { ...value, redistribution, totalValuationDelta: redistribution.reduce((sum, p) => sum + p.delta, 0) };
  });
  const [fold, win, loss] = valued;
  const utilities = { fold: fold!.heroValue, win: win!.heroValue, loss: loss!.heroValue };
  return {
    stackUnit,
    model: { ...COUNTERFACTUAL_MODEL, id: 'settled-table-icm-binary', version: '1.1.0', hypotheses: [...COUNTERFACTUAL_MODEL.hypotheses, 'PM-GLOBAL'],
      references: [...COUNTERFACTUAL_MODEL.references, { source: 'S07', blocks: [105, 111], hypothesis: 'PM-GLOBAL',
        originalDocument: 'https://docs.google.com/document/d/1S5kufnSM5y15CxDjr_nLi1oQoOvndlV3imDRBl-SxfU/edit' }] },
    snapshot, payouts, unit: 'payout-currency' as const, contextRole: 'full-field-icm-valuation' as const,
    baseline: { ...baseline, action: 'before' as const }, states: valued, utilities, ...compareTerminalUtilities({ ...utilities, probabilities: snapshot.probabilities }),
    approximate: [...valued, baseline].some(s => s.method === 'malmuth-harville-monte-carlo'),
    limitations: ['Transições de stacks e probabilidades são hipóteses do usuário; não são extraídas automaticamente da HH.',
      'Reavaliação monetária ICM do field; capacidade futura de pressão e realização estratégica não são estimadas por este adaptador.',
      'ICM após liquidação da mesa; sem bounties, reentradas, raises ou verificação de legalidade de apostas.',
      'Sem classificação empatada: informe a ordem de colocação resolvida conforme as regras do torneio.',
      'Monte Carlo, quando usado, aproxima o ICM; seed reproduzível não certifica convergência. Sem intervalo de confiança para o delta.'],
  };
}
export type IcmTransitionResult = ReturnType<typeof evaluateIcmTransitions>;
