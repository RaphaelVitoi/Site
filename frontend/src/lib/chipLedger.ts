import { z } from 'zod';
import { FieldModelSchema } from './fieldModel';

export const ChipLedgerSchema = z.object({
  fieldModel: FieldModelSchema.optional(),
  total: z.number().int().positive().safe(),
  bigBlind: z.number().int().positive().safe(),
  players: z.array(z.object({ id: z.string(), chips: z.number().int().nonnegative().safe() })).min(2),
  buttonId: z.string(),
  seatOrder: z.array(z.string()).min(2).max(9),
});
export type ChipLedger = z.infer<typeof ChipLedgerSchema>;

export function moneyUnits(value: number): number {
  const cents = value * 100;
  const integer = Math.round(cents);
  if (!Number.isSafeInteger(integer) || integer < 0 || Math.abs(integer - cents) > Math.min(1e-7, Math.max(1, Math.abs(cents)) * Number.EPSILON * 4)) {
    throw new Error('Informe valores monetários não negativos com no máximo duas casas decimais, dentro da precisão suportada.');
  }
  return integer;
}

export function validatePrizeLedger(total: number, remaining: number, prizes: number[]): void {
  const pool = moneyUnits(total);
  const target = moneyUnits(remaining);
  const allocated = prizes.reduce((sum, value) => sum + moneyUnits(value), 0);
  if (!Number.isSafeInteger(allocated) || pool <= 0 || target <= 0 || target > pool) throw new Error('Prize pools inconsistentes.');
  if (allocated !== target) throw new Error(`A soma dos payouts deve coincidir com o prize pool restante. Diferença: ${((allocated - target) / 100).toFixed(2)}.`);
}

/** Only reverse floating point conversion noise, never round a fractional stack. */
export function chipUnits(value: number): number {
  const integer = Math.round(value);
  if (!Number.isSafeInteger(integer) || integer < 0 || Math.abs(integer - value) > Math.min(1e-7, Math.max(1, Math.abs(value)) * Number.EPSILON * 4)) {
    throw new Error('Stacks devem representar fichas inteiras. Revise estimativas fracionárias da fonte; nenhuma ficha foi arredondada.');
  }
  return integer;
}

export function validateChipLedger(input: unknown): ChipLedger {
  const parsed = ChipLedgerSchema.safeParse(input);
  if (!parsed.success) throw new Error('Informe fichas inteiras, big blind positivo, total do torneio e botão da mesa.');
  const ledger = parsed.data;
  const ids = new Set(ledger.players.map(p => p.id));
  if (ids.size !== ledger.players.length || new Set(ledger.seatOrder).size !== ledger.seatOrder.length || ledger.seatOrder.some(id => !ids.has(id)) || !ledger.seatOrder.includes(ledger.buttonId)) throw new Error('Assentos, IDs ou botão inconsistentes.');
  const sum = ledger.players.reduce((total, p) => total + p.chips, 0);
  if (!Number.isSafeInteger(sum)) throw new Error('Total de fichas fora da precisão inteira suportada.');
  if (sum !== ledger.total) throw new Error(sum < ledger.total ? `Faltam distribuir ${ledger.total - sum} fichas do torneio.` : `Há ${sum - ledger.total} fichas excedentes no torneio.`);
  return ledger;
}

export function tablePositions(seatOrder: string[], buttonId: string): Record<string, string> {
  const button = seatOrder.indexOf(buttonId);
  if (button < 0 || seatOrder.length < 2 || seatOrder.length > 9 || new Set(seatOrder).size !== seatOrder.length) return {};
  if (seatOrder.length === 2) return { [buttonId]: 'BTN / SB', [seatOrder[(button + 1) % 2]!]: 'BB' };
  const earlyBySize: Record<number, string[]> = {
    3: [], 4: ['CO'], 5: ['HJ', 'CO'], 6: ['UTG', 'HJ', 'CO'],
    7: ['UTG', 'LJ', 'HJ', 'CO'], 8: ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO'],
    9: ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO'],
  };
  const early = earlyBySize[seatOrder.length]!;
  const labels = ['BTN', 'SB', 'BB', ...early];
  return Object.fromEntries(labels.map((label, i) => [seatOrder[(button + i) % seatOrder.length]!, label]));
}
