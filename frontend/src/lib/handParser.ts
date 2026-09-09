import type { ICMPlayer } from './icmEngine';

export interface ParsedHandHistory {
  room?: 'PokerStars' | 'GGPoker' | undefined;
  tournamentId?: string | undefined;
  handId?: string | undefined;
  tableId?: string | undefined;
  bigBlind?: number | undefined;
  smallBlind?: number | undefined;
  ante?: number | undefined;
  buttonSeat?: number | undefined;
  heroId?: string | undefined;
  totalEntries?: number | undefined;
  totalPrizePool?: number | undefined;
  declaredTotalChips?: number | undefined;
  paidPlaces?: number | undefined;
  prizes?: number[] | undefined;
  fullPrizes?: number[] | undefined;
  remainingPrizePool?: number | undefined;
  payoutUnit?: 'absolute' | undefined;
  players: (ICMPlayer & { seat: number; tableId?: string })[];
}

/** English client HH amounts: decimal dot, optional thousands commas. */
function amount(value: string): number {
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value)) throw new Error('Valor numérico inválido na HH. Exporte o histórico em inglês.');
  const parsed = Number(value.replaceAll(',', ''));
  if (!Number.isFinite(parsed)) throw new Error('Valor da HH fora do intervalo numérico.');
  return parsed;
}

/** Parse the opening snapshot only. Summary winnings are never starting stacks. */
export function parseHandHistoryDetails(raw: string): ParsedHandHistory {
  const headers = raw.match(/^(?:PokerStars (?:Hand|Game) #|Poker Hand #|GGPoker Hand #).*/gm) ?? [];
  if (headers.length > 1) throw new Error('Importe uma mão por snapshot; várias mãos não representam uma mesa simultânea.');
  const header = headers[0];
  if (header && (!/Tournament|Torneio/i.test(header) || !/(?:Hold.em No Limit|No Limit Hold.em|No Limit Texas Hold.em)/i.test(header))) {
    throw new Error('A bancada aceita mãos de torneios No-Limit Texas Hold’em.');
  }
  const room = header?.startsWith('PokerStars') ? 'PokerStars' : header ? 'GGPoker' : undefined;
  const table = /^Table ['"](.+)['"] (\d+)-max(?: Seat #(\d+) is the button)?/m.exec(raw);
  const opening = raw.split(/\*\*\* (?:HOLE CARDS|SUMMARY|FLOP|PRE-FLOP) \*\*\*/)[0]!;
  const players: ParsedHandHistory['players'] = [];
  for (const line of opening.split(/\r?\n/)) {
    if (!/^Seat \d+:/.test(line.trim())) continue;
    const m = /^Seat (\d+): (.+) \(([$€£]?)([\d,.]+)(?: in chips)?(?:, .+? bounty)?\)(?:.*)$/.exec(line.trim());
    if (!m) throw new Error('Não foi possível ler um assento da HH. Confira nomes, stacks e idioma do histórico.');
    const stack = amount(m[4]!);
    const seat = Number(m[1]);
    if (stack <= 0 || !Number.isSafeInteger(seat) || seat < 1) throw new Error('Assento ou stack inicial inválido na HH.');
    players.push({ id: `seat_${seat}`, seat, name: m[2]!, stack, ...(table ? { tableId: table[1] } : {}) });
  }
  if (new Set(players.map(p => p.id)).size !== players.length) throw new Error('Assentos repetidos na HH.');
  const blinds = header ? /\((?:[$€£]?)([\d,.]+)\/(?:[$€£]?)([\d,.]+)(?:[^)]*)\)/.exec(header) : null;
  const posted = /: posts big blind (?:[$€£]?)([\d,.]+)/.exec(raw);
  const small = /: posts small blind (?:[$€£]?)([\d,.]+)/.exec(raw);
  const ante = /: posts (?:the )?ante (?:[$€£]?)([\d,.]+)/.exec(raw);
  const hero = /^Dealt to (.+?) \[/m.exec(raw);
  const tournamentId = /(?:Tournament|Torneio) #([\w-]+)/i.exec(header ?? '')?.[1];
  const summaryHeader = /^PokerStars Tournament #(\w+).*$/m.exec(raw);
  let summary: Pick<ParsedHandHistory, 'totalEntries' | 'totalPrizePool' | 'declaredTotalChips' | 'paidPlaces' | 'prizes' | 'fullPrizes' | 'remainingPrizePool' | 'payoutUnit'> = {};
  if (summaryHeader) {
    if (tournamentId && summaryHeader[1] !== tournamentId) throw new Error('A HH e o resumo pertencem a torneios diferentes.');
    const text = raw.slice(summaryHeader.index);
    const entries = /^(\d[\d,]*) players\s*$/m.exec(text);
    const pool = /^Total Prize Pool: (?:[$€£]?)([\d,.]+)/m.exec(text);
    const chips = /^Total Chips: ([\d,.]+)/m.exec(text);
    summary = { totalEntries: entries ? amount(entries[1]!) : undefined,
      totalPrizePool: pool ? amount(pool[1]!) : undefined, declaredTotalChips: chips ? amount(chips[1]!) : undefined };
    const paid = [...text.matchAll(/^\s*(\d+): .+?, (?:[$€£])([\d,.]+)(?: USD| EUR| GBP)?(?: \([\d.]+%\))?\s*$/gm)];
    const positions = paid.map(m => Number(m[1]));
    const fullPrizes = paid.map(m => amount(m[2]!));
    const sum = fullPrizes.reduce((total, value) => total + value, 0);
    // Partial tournament summaries cannot prove the complete payout schedule.
    if (fullPrizes.length && summary.totalPrizePool !== undefined && positions.every((pos, i) => pos === i + 1) &&
      Math.abs(sum - summary.totalPrizePool) < 1e-6) {
      const prizes = fullPrizes.slice(0, players.length);
      summary = { ...summary, fullPrizes, prizes, paidPlaces: fullPrizes.length, payoutUnit: 'absolute',
        remainingPrizePool: prizes.reduce((total, value) => total + value, 0) };
    }
  }
  return {
    ...summary, players, room, tableId: table?.[1], buttonSeat: table?.[3] ? Number(table[3]) : undefined,
    tournamentId: /(?:Tournament|Torneio) #([\w-]+)/i.exec(header ?? '')?.[1],
    handId: /(?:Hand|Game) #([\w-]+)/.exec(header ?? '')?.[1],
    bigBlind: blinds ? amount(blinds[2]!) : posted ? amount(posted[1]!) : undefined,
    smallBlind: blinds ? amount(blinds[1]!) : small ? amount(small[1]!) : undefined,
    ante: ante ? amount(ante[1]!) : undefined,
    heroId: hero ? players.find(p => p.name === hero[1])?.id : undefined,
  };
}

export function parseHandHistory(rawText: string): ICMPlayer[] {
  if (!rawText) return [];
  return parseHandHistoryDetails(rawText).players;
}
