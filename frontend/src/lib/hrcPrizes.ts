/** HRC uses range-start prize keys; the final key is the last paid position. */
export function readHRCPrizes(prizes: Record<string, number>, remaining: number) {
  const positions = Object.keys(prizes).map(Number).sort((a, b) => a - b);
  if (!positions.length || positions[0] !== 1 || positions.some(n => !Number.isSafeInteger(n) || n < 1 || !(String(n) in prizes))) {
    throw new Error('Estrutura HRC com posições pagas inválidas.');
  }
  let total = 0;
  let previous = Infinity;
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]!;
    const prize = prizes[String(pos)]!;
    if (!Number.isFinite(prize) || prize <= 0 || prize > previous) throw new Error('Payouts HRC devem ser positivos e decrescentes.');
    total += prize * ((positions[i + 1] ?? pos + 1) - pos);
    previous = prize;
  }
  if (!Number.isFinite(total)) throw new Error('Prize pool HRC fora do intervalo numérico.');
  const paidPlaces = positions.at(-1)!;
  let cursor = 0;
  const payouts = Array.from({ length: Math.min(remaining, paidPlaces) }, (_, i) => {
    while (cursor + 1 < positions.length && positions[cursor + 1]! <= i + 1) cursor++;
    return prizes[String(positions[cursor])]!;
  });
  return { payouts, paidPlaces, totalPrizePool: total };
}
