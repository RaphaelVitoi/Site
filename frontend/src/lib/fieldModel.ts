import { z } from 'zod';

export const FieldModelSchema = z.object({
  method: z.enum(['table-empirical-quantiles-v1', 'hrc-integer-allocation-v1']),
  countOrigin: z.enum(['table-mean-estimate', 'user', 'imported-scenario']),
  remainingPlayers: z.number().int().min(2),
  estimatedPlayerIds: z.array(z.string()),
  originalExternalStacks: z.array(z.number().finite().positive()).optional(),
});
export type FieldModel = z.infer<typeof FieldModelSchema>;

/** Largest-remainder apportionment of a declared chip budget; each live player gets >=1 chip. */
export function allocateWholeChips(weights: number[], total: number): number[] {
  if (!Number.isSafeInteger(total) || total < weights.length || weights.some(w => !Number.isFinite(w) || w <= 0)) throw new Error('Não há fichas inteiras suficientes para os jogadores externos.');
  if (weights.length === 0) {
    if (total) {
      throw new Error('Há fichas externas sem jogadores.');
    }
    return [];
  }
  const mass = weights.reduce((sum, w) => sum + w, 0);
  if (!Number.isFinite(mass)) throw new Error('Distribuição fora da precisão suportada.');
  const quotas = weights.map(w => w / mass * (total - weights.length));
  const result = quotas.map(q => 1 + Math.floor(q));
  const remaining = total - result.reduce((sum, n) => sum + n, 0);
  if (remaining < 0 || remaining > weights.length) throw new Error('Distribuição fora da precisão suportada.');
  const order = quotas.map((q, i) => ({ i, rest: q - Math.floor(q) })).sort((a, b) => b.rest - a.rest || a.i - b.i);
  for (let i = 0; i < remaining; i++) result[order[i]!.i]!++;
  return result;
}
