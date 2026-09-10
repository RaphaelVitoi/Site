'use client';

import { useState } from 'react';
import type { CounterfactualRequest, CounterfactualResult } from '@/lib/counterfactualExperiment';
import { downloadHRCJson } from '@/lib/hrcExport';

type Props = { context: CounterfactualRequest['context']; inputError: string | null };
const defaults = { fold: '98', win: '120', loss: '70', probabilities: '0.54, 0.60, 0.66' };

export default function CounterfactualPanel({ context, inputError }: Props) {
  const [values, setValues] = useState(defaults);
  const [edited, setEdited] = useState(false);
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState<{ key: string; result: CounterfactualResult } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const key = JSON.stringify({ context, values, edited });
  const result = completed?.key === key && !inputError ? completed.result : null;
  const error = failure?.key === key ? failure.message : null;

  async function calculate() {
    setPending(true); setFailure(null); setCompleted(null);
    try {
      const tokens = values.probabilities.split(',').map(value => value.trim());
      if (tokens.some(value => !value) || [values.fold, values.win, values.loss].some(value => !value.trim())) throw new Error('Preencha todos os valores. Use ponto decimal e vírgula entre probabilidades.');
      const payload: CounterfactualRequest = { context, assumptions: {
        origin: edited ? 'user-assumption' : 'didactic-default', unit: 'toy-utility', horizon: 'shared-terminal-horizon',
        fold: Number(values.fold), win: Number(values.win), loss: Number(values.loss), probabilities: tokens.map(Number),
      } };
      const response = await fetch('/api/sota/counterfactual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const body: { error?: string } = await response.json();
        throw new Error(body.error ?? 'Não foi possível calcular.');
      }
      const output: CounterfactualResult = await response.json();
      setCompleted({ key, result: output });
    } catch (caught) { setFailure({ key, message: caught instanceof Error ? caught.message : 'Falha no experimento.' }); }
    finally { setPending(false); }
  }

  return <section className="rounded-xl border border-white/20 p-4 space-y-4" aria-label="Experimento de contrafactuais">
    <h3 className="text-lg font-bold">Bancada PMev · fold e call</h3>
    <p>Compare valores futuros no mesmo horizonte. Os defaults são um exemplo didático em unidades de utilidade; não representam dinheiro ou equidade calculada do torneio.</p>
    <p>{context.population.length} stacks no contexto · {context.selection.playerIds.length} jogadores na mesa. Os valores abaixo são hipóteses independentes do cálculo ICM do torneio.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      {([
        ['fold', 'Valor futuro ao foldar', 'Inclua a continuação após fold no mesmo horizonte dos outros resultados.'],
        ['win', 'Valor futuro ao vencer o call', 'Valor terminal absoluto: não some novamente pote ou fichas investidas.'],
        ['loss', 'Valor futuro ao perder o call', 'Use a mesma unidade e horizonte. Perder não implica necessariamente valor zero.'],
        ['probabilities', 'Probabilidades de vitória assumidas', 'De 0 a 1, até 21 valores; ponto decimal e vírgula para separar. Não há empates de showdown neste molde.'],
      ] as const).map(([field, label, help]) => <label key={field} className="flex flex-col gap-1">
        <span id={`counterfactual-label-${field}`}>{label}</span>
        <input className="rounded bg-slate-800 p-2 text-white" value={values[field]} title={help} aria-labelledby={`counterfactual-label-${field}`} aria-describedby={`counterfactual-${field}`} onChange={event => { setValues({ ...values, [field]: event.target.value }); setEdited(true); }} />
        <small id={`counterfactual-${field}`}>{help}</small>
      </label>)}
    </div>
    <p>{edited ? 'Origem: hipóteses editadas pelo usuário.' : 'Origem: defaults didáticos da curadoria.'}</p>
    <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={pending || !!inputError} onClick={calculate}>{pending ? 'Calculando…' : 'Comparar hipóteses'}</button>
    {inputError && <p role="alert">Corrija o contexto do torneio: {inputError}</p>}
    {error && <p role="alert">{error}</p>}
    {result && <div aria-live="polite" className="space-y-3 overflow-x-auto">
      <table className="w-full text-right"><caption>Valores esperados · utilidade assumida</caption><thead><tr><th>Probabilidade</th><th>Fold</th><th>Call</th><th>Call − fold</th><th>Comparação</th></tr></thead><tbody>
        {result.rows.map((row, i) => <tr key={i}><td>{(row.probability * 100).toFixed(2)}%</td><td>{row.fold.toFixed(2)}</td><td>{row.call.toFixed(2)}</td><td>{row.delta.toFixed(2)}</td><td>{row.comparison === 'tie' ? 'Indiferente' : row.comparison === 'call' ? 'Call maior' : 'Fold maior'}</td></tr>)}
      </tbody></table>
      <p>{result.everywhereIndifferent ? 'Indiferença em todas as probabilidades.' : result.threshold === null ? 'Não há ponto de indiferença entre 0% e 100%.' : `Indiferença em ${(result.threshold * 100).toFixed(2)}% de vitória.`}</p>
      <p>Amplitude dos deltas: {result.deltaRange.map(value => value.toFixed(2)).join(' a ')}. Não é intervalo de confiança nem recomendação de equilíbrio.</p>
      <button type="button" className="rounded border px-3 py-2" onClick={() => downloadHRCJson(JSON.stringify(result, null, 2), 'pmev-counterfactual.json')}>Exportar experimento e contexto</button>
    </div>}
  </section>;
}
