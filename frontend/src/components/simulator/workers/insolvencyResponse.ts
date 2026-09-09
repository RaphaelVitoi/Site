import { z } from 'zod';
import type { InsolvencyWorkerRequest, InsolvencyWorkerResponse } from './insolvencyProtocol';

const finite = z.number().finite();
const frequencies = z.object({
  ip_check: finite, ip_bet_small: finite, ip_bet_large: finite,
  oop_call: finite, oop_fold: finite, oop_raise: finite,
});
const frequencyResult = z.object({ center: finite, spread: finite, delta: finite });
const distortion = z.object({
  ip: z.object({ check: frequencyResult, bet_small: frequencyResult, bet_large: frequencyResult }),
  oop: z.object({ call: frequencyResult, fold: frequencyResult, raise: frequencyResult }),
  deltaRp: finite,
  bExponent: finite,
  rawData: z.object({ ipRp: finite, oopRp: finite, chipEvFreqs: frequencies }),
});
const envelope = z.object({
  type: z.enum(['MATRIX', 'DISTORTION', 'MULTIWAY_MATRIX']),
  id: z.number().int().nonnegative().safe(),
  outputKind: z.enum(['working-model', 'scaffold']),
});
const responseSchema = z.union([
  envelope.extend({ error: z.string().min(1) }),
  envelope.extend({ type: z.literal('MATRIX'), matrix: z.array(finite).length(5) }),
  envelope.extend({
    type: z.literal('DISTORTION'),
    nashResults: z.object({ flop: distortion, turn: distortion, river: distortion }),
  }),
  envelope.extend({
    type: z.literal('MULTIWAY_MATRIX'),
    multiwayResult: z.instanceof(Float64Array).refine(values => values.every(Number.isFinite)),
  }),
]);

export type InsolvencyRequestIds = Record<InsolvencyWorkerRequest['type'], number>;

/** A MessageEvent type annotation cannot validate data crossing a worker boundary.
 * Validate only shape and finite numbers here; this does not certify the model.
 * Correlation is per operation, so a reply from one channel cannot cancel another.
 */
export function readCurrentInsolvencyResponse(
  data: unknown,
  latestIds: InsolvencyRequestIds,
): InsolvencyWorkerResponse | null {
  const header = envelope.safeParse(data);
  if (!header.success || header.data.id !== latestIds[header.data.type]) return null;
  const response = responseSchema.safeParse(data);
  return response.success ? response.data : null;
}
