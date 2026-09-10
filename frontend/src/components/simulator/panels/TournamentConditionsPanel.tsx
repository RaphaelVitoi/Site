'use client';
import type { TournamentConditions } from '@/lib/tournamentConditions';

const fields = [
  ['fieldSize', 'Field total', 'Total de entradas do MTT, incluindo reentradas se esse for o critério do torneio. Não limita a mesa analisada.'],
  ['remainingPlayers', 'Jogadores restantes', 'Jogadores ainda representados no snapshot. Informe um stack para cada um, inclusive os de outras mesas.'],
  ['declaredTotalChipsBb', 'Fichas totais (BB)', 'Opcional: total de fichas do torneio em BB. Deve corresponder à soma de todos os stacks. Em branco, usa a soma recebida.'],
  ['paidPlaces', 'ITM (posições pagas)', 'Quantidade total de colocações premiadas no torneio, não a porcentagem do field.'],
  ['totalPrizePool', 'Prize pool total', 'Premiação por colocações do MTT, sem bounties, em uma única unidade monetária escolhida por você.'],
  ['remainingPrizePool', 'Prize pool restante', 'Soma das premiações ainda em disputa. Exclui os valores já pagos aos eliminados.'],
] as const;

export default function TournamentConditionsPanel({ value, onChange, canonicalUnits = false }: Readonly<{
  value: TournamentConditions; onChange: (next: TournamentConditions) => void;
  canonicalUnits?: boolean;
}>) {
  return <fieldset className="space-y-3 rounded-xl border border-white/15 p-4 text-sm text-text-light">
    <legend className="px-2 font-semibold">Contexto do MTT · No-Limit Texas Hold’em</legend>
    <p>Parâmetros do seu cenário. Os valores iniciais são defaults editáveis de toy game; substitua-os pelos dados do torneio.</p>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.filter(([key]) => !canonicalUnits || key !== 'declaredTotalChipsBb').map(([key, label, description]) => <label key={key} className="min-w-0" title={description}>
        {label} <span aria-hidden="true">ⓘ</span>
        <input aria-label={label} aria-describedby={`mtt-${key}-hint`} type="number" min={key.includes('PrizePool') || key === 'declaredTotalChipsBb' ? 0 : 1}
          step={key.includes('PrizePool') ? (canonicalUnits ? '0.01' : 'any') : key === 'declaredTotalChipsBb' ? 'any' : '1'} value={Number.isNaN(value[key]) ? '' : (value[key] ?? '')}
          onChange={event => onChange({ ...value, [key]: event.target.value === '' ? (key === 'declaredTotalChipsBb' ? undefined : NaN) : Number(event.target.value) })}
          className="mt-1 w-full rounded-lg border border-white/20 bg-bg-panel p-2" />
        <span id={`mtt-${key}-hint`} className="mt-1 block text-xs text-text-muted">{description}</span>
      </label>)}
      {!canonicalUnits && <label>Unidade dos payouts
        <select aria-label="Unidade dos payouts" className="mt-1 w-full rounded-lg border border-white/20 bg-bg-panel p-2" value={value.payoutUnit}
          onChange={event => onChange({ ...value, payoutUnit: event.target.value as TournamentConditions['payoutUnit'] })}>
          <option value="percent-remaining-pool">% do prize pool restante</option>
          <option value="absolute">Valores monetários absolutos</option>
        </select>
        <span className="mt-1 block text-xs text-text-muted">A seleção interpreta os números digitados; não converte nem normaliza sua lista silenciosamente.</span>
      </label>}
    </div>
  </fieldset>;
}
