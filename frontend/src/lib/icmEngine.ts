import { calculateMalmuthHarville as exactIcm } from './icmMatrix';
import { calculateIcmMonteCarlo } from './montecarlo';

export interface ICMPlayer { id: string; name: string; stack: number }
export interface ICMResult {
  id: string;
  name: string;
  equity: number; // In the same unit as the supplied payouts.
  equityPercent: number; // Percentage of the entire remaining prize pool.
  winProb: number;
}
export interface IcmMethod {
  method: 'malmuth-harville-exact' | 'malmuth-harville-monte-carlo';
  populationSize: number;
  iterations: number;
  seed: number | null;
  totalChips: number;
  totalPrizes: number;
}

/** The population is the tournament, not the selected table. No ChipEV substitution. */
export function calculatePopulationIcm(players: ICMPlayer[], prizes: number[]): { results: ICMResult[]; metadata: IcmMethod } {
  const stacks = players.map(p => p.stack);
  if ([...stacks, ...prizes].some(v => !Number.isFinite(v) || v < 0)) {
    throw new RangeError('Stacks e prêmios devem ser finitos e não negativos.');
  }
  if (new Set(players.map(p => p.id)).size !== players.length) throw new Error('IDs de jogadores repetidos.');
  if (prizes.length > players.length) throw new Error('Informe apenas os payouts restantes, um por colocação premiada.');
  const totalChips = stacks.reduce((sum, value) => sum + value, 0);
  const totalPrizes = prizes.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(totalChips) || !Number.isFinite(totalPrizes)) throw new RangeError('Somas fora do intervalo numérico.');
  const live = players.filter(p => p.stack > 0);
  const exact = live.length <= 10;
  const iterations = exact || totalPrizes === 0 ? 0 : 20000;
  const seed = iterations ? 1 : null;
  let equities: number[];
  if (exact) {
    equities = exactIcm(stacks, prizes);
  } else {
    const sampled = calculateIcmMonteCarlo(live.map(p => p.stack), prizes.slice(0, live.length), { iterations: iterations || 1, seed: 1 });
    const zeroCount = players.length - live.length;
    // Same terminal convention as the exact kernel: unknown elimination order shares bottom payouts.
    const terminal = zeroCount ? prizes.slice(live.length).reduce((sum, value) => sum + value, 0) / zeroCount : 0;
    const byId = new Map(live.map((player, i) => [player.id, sampled[i] ?? 0]));
    equities = players.map(player => byId.get(player.id) ?? terminal);
  }
  return {
    results: players.map((player, i) => ({
      id: player.id, name: player.name, equity: equities[i] ?? 0,
      equityPercent: totalPrizes > 0 ? ((equities[i] ?? 0) / totalPrizes) * 100 : 0,
      winProb: totalChips > 0 ? player.stack / totalChips : 0,
    })),
    metadata: { method: exact ? 'malmuth-harville-exact' : 'malmuth-harville-monte-carlo', populationSize: players.length,
      iterations, seed, totalChips, totalPrizes },
  };
}

/** Compatibility entry point; percentages may explicitly use a wider prize pool. */
export function calculateMalmuthHarville(players: ICMPlayer[], prizes: number[], totalPool?: number): ICMResult[] {
  const { results } = calculatePopulationIcm(players, prizes);
  if (totalPool === undefined) return results;
  if (!Number.isFinite(totalPool) || totalPool <= 0) throw new RangeError('Prize pool must be finite and positive');
  return results.map(result => ({ ...result, equityPercent: result.equity / totalPool * 100 }));
}
