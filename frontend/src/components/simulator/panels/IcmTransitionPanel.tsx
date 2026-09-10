'use client';

import { useState } from 'react';
import type { CounterfactualRequest } from '@/lib/counterfactualExperiment';
import type { IcmTransitionRequest, IcmTransitionResult } from '@/lib/icmTransitionExperiment';
import { downloadHRCJson } from '@/lib/hrcExport';

type Props = { context: CounterfactualRequest['context']; inputError: string | null };
const actions = ['fold', 'win', 'loss'] as const;
const titles = { fold: 'Após fold', win: 'Call vence', loss: 'Call perde' };

/** A changed tournament resets transition assumptions; past requests cannot reappear. */
export default function IcmTransitionPanel(props: Props) {
  return <TransitionEditor key={JSON.stringify(props.context)} {...props} />;
}

function TransitionEditor({ context, inputError }: Props) {
  const players = context.population.filter(p => context.selection.playerIds.includes(p.id));
  const [stacks, setStacks] = useState(() => Object.fromEntries(players.map(p => [p.id, { fold: String(p.stack), win: String(p.stack), loss: String(p.stack) }])));
  const [orders, setOrders] = useState({ fold: '', win: '', loss: '' });
  const [probabilities, setProbabilities] = useState('0.54, 0.60, 0.66');
  const [iterations, setIterations] = useState('2000');
  const [edited, setEdited] = useState(false);
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState<{ key: string; result: IcmTransitionResult } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const key = JSON.stringify({ stacks, orders, probabilities, iterations, edited });
  const result = !inputError && completed?.key === key ? completed.result : null;
  const error = failure?.key === key ? failure.message : null;
  function number(value: string) {
    if (!value.trim() || !Number.isFinite(Number(value))) throw new Error('Preencha números finitos; use ponto decimal e vírgula para separar probabilidades.');
    return Number(value);
  }
  async function calculate() {
    setPending(true); setFailure(null); setCompleted(null);
    try {
      const branch = (action: typeof actions[number]) => ({
        tableStacks: players.map(p => ({ id: p.id, stack: number(stacks[p.id]![action]) })),
        eliminationOrder: orders[action].trim() ? orders[action].split(',').map(id => id.trim()) : [],
      });
      const payload: IcmTransitionRequest = { context, origin: edited ? 'user-assumption' : 'identity-default', horizon: 'after-table-settlement',
        fold: branch('fold'), win: branch('win'), loss: branch('loss'), probabilities: probabilities.split(',').map(number), iterations: number(iterations), seed: 1 };
      const response = await fetch('/api/sota/icm-transitions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) { const body: { error?: string } = await response.json(); throw new Error(body.error ?? 'Falha ao avaliar transições.'); }
      const output: IcmTransitionResult = await response.json();
      setCompleted({ key, result: output });
    } catch (caught) { setFailure({ key, message: caught instanceof Error ? caught.message : 'Falha no cálculo.' }); }
    finally { setPending(false); }
  }
  return <section className="rounded-xl border border-white/20 p-4 space-y-4" aria-label="Transições de stacks com ICM">
    <h3 className="text-lg font-bold">Bancada PMev · valores derivados de ICM</h3>
    <p>Jogador analisado: {context.population.find(p => p.id === context.heroId)?.name ?? 'Selecione o HERO'}. {context.population.length} stacks no field; {context.population.length - players.length} externos permanecem no cálculo.</p>
    <p>Informe os stacks em BB ao final de cada resultado, com todo pote distribuído. O ICM usa o field completo e a premiação por colocações. Os três resultados devem representar a mesma etapa de liquidação da mesa.</p>
    <p>Default: todos os stacks permanecem iguais, portanto as ações são indiferentes. As transições futuras são hipóteses suas; não são deduzidas da HH. Bounties não entram nesta valoração.</p>
    <div className="overflow-x-auto"><table className="w-full text-left"><caption>Stacks após a transição · BB</caption><thead><tr><th>Jogador / ID</th>{actions.map(action => <th key={action}>{titles[action]}</th>)}</tr></thead><tbody>
      {players.map(p => <tr key={p.id}><th>{p.name} / {p.id}</th>{actions.map(action => <td key={action}><input className="w-24 rounded bg-slate-800 p-2 text-white" aria-label={`${titles[action]}: ${p.name}`} title="Stack final em BB. Todas as fichas devem permanecer distribuídas entre os jogadores." value={stacks[p.id]![action]} onChange={event => { setStacks({ ...stacks, [p.id]: { ...stacks[p.id]!, [action]: event.target.value } }); setEdited(true); }} /></td>)}</tr>)}
    </tbody></table></div>
    <div className="grid gap-3 sm:grid-cols-3">{actions.map(action => <label key={action} className="flex flex-col gap-1"><span>Eliminados · {titles[action]}</span><input className="rounded bg-slate-800 p-2 text-white" aria-label={`Eliminados: ${titles[action]}`} title="IDs separados por vírgula, da pior para a melhor colocação. Inclua todos os stacks zerados. Vazio se ninguém sair." value={orders[action]} onChange={event => { setOrders({ ...orders, [action]: event.target.value }); setEdited(true); }} /></label>)}</div>
    <p>Eliminados: informe os IDs da pior para a melhor colocação, conforme a classificação resolvida do torneio. Não inferimos empate nem dividimos prêmios automaticamente.</p>
    <label className="flex flex-col gap-1"><span>Probabilidades de vitória assumidas</span><input className="rounded bg-slate-800 p-2 text-white" aria-label="Probabilidades das transições" value={probabilities} onChange={event => { setProbabilities(event.target.value); setEdited(true); }} /></label>
    <small>De 0 a 1; use ponto decimal e vírgula entre cenários. Sem empates de showdown neste molde.</small>
    <label className="flex flex-col gap-1"><span>Amostras Monte Carlo por resultado</span><input className="rounded bg-slate-800 p-2 text-white" aria-label="Amostras ICM" title="100 a 20000. Usado quando restam mais de 10 stacks; abaixo disso, ICM exato. Pedidos acima do orçamento computacional são recusados sem truncar o field." value={iterations} onChange={event => { setIterations(event.target.value); setEdited(true); }} /></label>
    <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={pending || !!inputError} onClick={calculate}>{pending ? 'Avaliando field…' : 'Calcular transições ICM'}</button>
    {inputError && <p role="alert">Corrija o contexto: {inputError}</p>}
    {error && <p role="alert">{error}</p>}
    {result && <div aria-live="polite" className="space-y-3 overflow-x-auto">
      <p>{result.approximate ? 'ICM aproximado por Monte Carlo; diferenças pequenas podem refletir erro amostral. Não há intervalo de confiança calculado.' : 'ICM Malmuth-Harville exato para os estados informados.'} Valores na unidade monetária dos payouts.</p>
      <table className="w-full text-right"><caption>Liquidação e valoração do field</caption><thead><tr><th>Resultado</th><th>Pagamentos</th><th>Pool restante</th><th>Valor do HERO</th><th>Método / amostras</th></tr></thead><tbody>{result.states.map(state => <tr key={state.action}><th>{titles[state.action]}</th><td>{state.paid.toFixed(2)}</td><td>{state.remainingPool.toFixed(2)}</td><td>{state.heroValue.toFixed(2)}</td><td>{state.method.endsWith('exact') ? 'Exato' : `MC / ${state.iterations}`}</td></tr>)}</tbody></table>
      <table className="w-full text-right"><caption>Comparação condicional · valores monetários</caption><thead><tr><th>Vitória</th><th>Fold</th><th>Call</th><th>Call − fold</th></tr></thead><tbody>{result.rows.map((row, i) => <tr key={i}><td>{(row.probability * 100).toFixed(2)}%</td><td>{row.fold.toFixed(2)}</td><td>{row.call.toFixed(2)}</td><td>{row.delta.toFixed(2)}</td></tr>)}</tbody></table>
      <p>{result.everywhereIndifferent ? 'Indiferença em toda a grade.' : result.threshold === null ? 'Sem ponto de indiferença no intervalo de 0 a 1.' : `Indiferença ${result.approximate ? 'estimada' : 'calculada'} em ${(result.threshold * 100).toFixed(2)}%.`}</p>
      <p>Prêmios pagos são somados uma única vez à equidade restante. O JSON inclui pagamentos por jogador e colocação, todos os stacks e valores, seed e premissas.</p>
      <h4 className="font-bold">Reavaliação do field · antes e depois</h4>
      <p>Uma stack pode mudar de valuation sem ganhar ou perder fichas. Os deltas incluem prêmios pagos; o total deve se conservar. Valor médio por BB não é valor marginal de uma ficha.</p>
      <p>Esta é a dimensão monetária da mesa como organismo, descrita em <a className="underline" href="/biblioteca/entendendo-o-icm-e-suas-heuristicas">Entendendo o ICM e suas heurísticas</a>. A capacidade futura de pressionar ou realizar valor ainda não é calculada aqui.</p>
      {result.states.map(state => <details key={state.action}>
        <summary>{titles[state.action]} · saldo agregado dos deltas: {state.totalValuationDelta.toFixed(6)}</summary>
        <table className="w-full text-right"><caption>{titles[state.action]} · jogadores com stack inalterada também são reavaliados</caption><thead><tr><th>Jogador</th><th>Stack BB</th><th>Antes</th><th>Depois + pago</th><th>Δ valuation</th><th>Valor médio / BB</th></tr></thead><tbody>
          {state.redistribution.map(row => <tr key={row.id}><th>{context.population.find(p => p.id === row.id)?.name ?? row.id}{row.unchangedStack ? ' · stack inalterada' : ''}</th><td>{row.stackBefore} → {row.stackAfter}</td><td>{row.before.toFixed(2)}</td><td>{row.after.toFixed(2)}</td><td>{row.delta.toFixed(2)}</td><td>{row.averageValuePerBbBefore.toFixed(2)} → {row.averageValuePerBbAfter === null ? 'sem stack' : row.averageValuePerBbAfter.toFixed(2)}</td></tr>)}
        </tbody></table>
      </details>)}
      <button type="button" className="rounded border px-3 py-2" onClick={() => downloadHRCJson(JSON.stringify(result, null, 2), 'pmev-icm-transitions.json')}>Exportar transições e valoração</button>
    </div>}
  </section>;
}
