import { z } from 'zod';
import { readHRCPrizes } from './hrcPrizes';
import type { TournamentSnapshot } from './tournamentContext';

const amount = z.union([z.number(), z.string().regex(/^\d+(?:\.\d+)?$/).transform(Number)])
  .pipe(z.number().finite().positive());
const structureSchema = z.object({
  name: z.string().min(1), chips: amount,
  prizes: z.record(z.string(), amount),
  bountyType: z.string().optional(),
  progressiveFactor: z.number().finite().min(0).max(1).optional(),
}).passthrough();
export const StructureSourceSchema = z.object({
  rawInput: z.string(), path: z.string(), name: z.string(), chips: z.number().finite().positive(),
  fullPrizes: z.array(z.number().finite().positive()).min(1),
  bountyType: z.string().optional(), progressiveFactor: z.number().finite().min(0).max(1).optional(),
});
export type HRCStructureSource = z.infer<typeof StructureSourceSchema>;

/** Structure Manager collection: metadata and payouts, never a population of players. */
export function parseHRCStructures(rawInput: string): HRCStructureSource[] {
  if (rawInput.length > 5 * 1024 * 1024) throw new Error('Estrutura excede 5 MB.');
  const result: HRCStructureSource[] = [];
  function visit(value: unknown, path: string, depth: number) {
    if (depth > 32 || result.length > 1000) throw new Error('Coleção de estruturas muito extensa; exporte uma pasta menor.');
    const folder = z.object({ name: z.string(), structures: z.array(z.unknown()), folders: z.array(z.unknown()) }).safeParse(value);
    if (!folder.success) throw new Error('Coleção HRC inválida: são esperados name, structures e folders.');
    folder.data.structures.forEach((item, index) => {
      const parsed = structureSchema.safeParse(item);
      if (!parsed.success) throw new Error('Estrutura HRC inválida: confira nome, fichas, premiação e metadados de bounty.');
      const data = parsed.data;
      const summary = readHRCPrizes(data.prizes, 0);
      if (summary.paidPlaces > 100000) throw new Error('Estrutura excede 100.000 posições pagas suportadas nesta importação.');
      result.push({ rawInput, path: `${path}/structures/${index}`, name: data.name, chips: data.chips,
        fullPrizes: readHRCPrizes(data.prizes, summary.paidPlaces).payouts,
        bountyType: data.bountyType, progressiveFactor: data.progressiveFactor });
    });
    folder.data.folders.forEach((child, index) => visit(child, `${path}/folders/${index}`, depth + 1));
  }
  visit(JSON.parse(rawInput.replace(/^\uFEFF/, '')), '', 0);
  if (!result.length) throw new Error('A coleção não contém estruturas de torneio.');
  return result;
}

function sumPrizes(values: number[]): number {
  let total = 0;
  let correction = 0;
  for (const value of values) {
    const adjusted = value - correction;
    const next = total + adjusted;
    correction = (next - total) - adjusted;
    total = next;
  }
  return total;
}

export function applyHRCStructure(snapshot: TournamentSnapshot, structure: HRCStructureSource): TournamentSnapshot {
  const prizes = structure.fullPrizes.slice(0, snapshot.players.length);
  return { ...snapshot, structureSource: structure, declaredTotalChips: structure.chips,
    fullPrizes: structure.fullPrizes, paidPlaces: structure.fullPrizes.length,
    totalPrizePool: sumPrizes(structure.fullPrizes),
    remainingPrizePool: sumPrizes(prizes),
    payoutUnit: 'absolute', prizes };
}
