'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type Task = {
  id: string;
  description: string;
  status: TaskStatus;
  timestamp: string;
  completedAt?: string | null;
  model?: string | null;
};
type Result = { id: string; content: string };

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Na fila',
  running: 'Em execução',
  completed: 'Concluída',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};
const STATUS_STYLE: Record<TaskStatus, string> = {
  pending: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  running: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  completed: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  failed: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  cancelled: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleString('pt-BR');
}

export function NexusOperationsPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const response = await fetch('/api/vitoi/tasks', { cache: 'no-store' });
      if (!response.ok) throw new Error('Fila operacional indisponível.');
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('Resposta inesperada da fila.');
      setTasks(
        (data as Task[])
          .slice()
          .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
          .slice(0, 30),
      );
      setLastUpdated(new Date());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao consultar a fila.');
    } finally {
      refreshing.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/vitoi/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) throw new Error(data.error ?? 'Não foi possível enfileirar a tarefa.');
      setDescription('');
      setNotice(`Tarefa ${data.id} aceita pela fila; isso ainda não significa que foi executada.`);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao enviar tarefa.');
    } finally {
      setSubmitting(false);
    }
  }

  async function openResult(id: string) {
    setResult(null);
    setError('');
    try {
      const response = await fetch(`/api/vitoi/tasks/result?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Resultado ainda não disponível.');
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao abrir resultado.');
    }
  }

  const counts = tasks.reduce((acc, task) => ({ ...acc, [task.status]: acc[task.status] + 1 }), {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  });
  const stalePending = tasks.some(
    (task) => task.status === 'pending' && Date.now() - Date.parse(task.timestamp) > 15 * 60 * 1000,
  );

  return (
    <section aria-labelledby="nexus-operations-heading" className="mb-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-accent-indigo-light mb-1 text-sm font-semibold">Operação da fila</p>
          <h2 id="nexus-operations-heading" className="m-0 text-2xl font-bold text-white">
            Fila Nexus
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5"
          aria-label="Atualizar fila"
        >
          <i className="fa-solid fa-rotate mr-2" aria-hidden="true" />
          Atualizar
        </button>
      </div>

      <GlassPanel className="mb-4 p-4">
        <div className="grid grid-cols-2 gap-y-3 md:grid-cols-4 md:divide-x md:divide-white/10">
          {(['pending', 'running', 'completed', 'failed'] as const).map((status) => (
            <div key={status} className="px-4 first:pl-1">
              <div className="text-text-muted text-sm">{STATUS_LABEL[status]}</div>
              <div className="mt-1 text-2xl font-bold text-white tabular-nums">{loading ? '—' : counts[status]}</div>
            </div>
          ))}
        </div>
        <div className="text-text-muted mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
          <span role="status" aria-live="polite">
            <i
              className={`fa-solid fa-circle mr-2 ${error ? 'text-rose-300' : loading ? 'text-amber-200' : 'text-emerald-300'}`}
              aria-hidden="true"
            />
            {error ? 'Fila sem resposta' : loading ? 'Consultando a fila' : 'API e QueueManager respondendo'}
          </span>
          <span>
            {lastUpdated ? `Atualizado ${lastUpdated.toLocaleTimeString('pt-BR')}` : 'Sem leitura confirmada'}
          </span>
        </div>
      </GlassPanel>
      {stalePending ? (
        <div role="status" className="mb-4 border-l-2 border-amber-300 px-4 py-2 text-sm text-amber-100">
          Há tarefa pendente há mais de 15 minutos; isso pode indicar atraso ou falta de consumo, não confirma worker
          parado.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <GlassPanel className="p-5">
          <h3 className="mt-0 mb-3 text-base font-bold text-white">Produzir pelo dashboard</h3>
          <form onSubmit={submit}>
            <label htmlFor="nexus-task-description" className="text-text-muted mb-2 block text-sm">
              Descrição da tarefa
            </label>
            <textarea
              id="nexus-task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={4000}
              required
              rows={4}
              className="focus:border-accent-indigo w-full rounded-lg border border-white/15 bg-slate-950/60 p-3 text-sm text-white outline-none"
              placeholder="Descreva o trabalho para o dispatcher e worker canônicos."
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-text-muted text-xs">{description.length}/4000 · despacho via QueueManager</span>
              <button
                disabled={submitting || !description.trim()}
                className="bg-accent-indigo rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Enviando…' : 'Enfileirar tarefa'}
              </button>
            </div>
          </form>
          {notice ? (
            <p role="status" className="mt-3 text-sm text-emerald-200">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="m-0 text-base font-bold text-white">Atividade recente</h3>
            <span className="text-text-muted text-xs">janela de 7 dias · até 30</span>
          </div>
          {loading ? <p className="text-text-muted text-sm">Consultando QueueManager…</p> : null}
          {!loading && tasks.length === 0 ? (
            <p className="text-text-muted text-sm">Nenhuma tarefa recente retornada pela fila.</p>
          ) : null}
          <ul className="m-0 max-h-[28rem] list-none space-y-3 overflow-y-auto p-0">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-lg border border-white/10 bg-slate-950/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[task.status] ?? STATUS_STYLE.pending}`}
                  >
                    {STATUS_LABEL[task.status] ?? task.status}
                  </span>
                  <time className="text-text-muted text-[11px]">{formatDate(task.timestamp)}</time>
                </div>
                <p className="my-2 line-clamp-3 text-sm whitespace-pre-wrap text-white">{task.description}</p>
                <div className="text-text-muted flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate">
                    {task.id}
                    {task.model ? ` · ${task.model}` : ''}
                  </span>
                  {task.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => void openResult(task.id)}
                      className="text-accent-indigo-light shrink-0 underline"
                    >
                      Abrir resultado
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      {result ? (
        <GlassPanel className="mt-4 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="m-0 font-bold text-white">Resultado · {result.id}</h3>
            <button type="button" onClick={() => setResult(null)} className="text-text-muted text-sm">
              Fechar
            </button>
          </div>
          <pre className="text-text-bright max-h-[32rem] overflow-auto text-sm break-words whitespace-pre-wrap">
            {result.content}
          </pre>
        </GlassPanel>
      ) : null}
    </section>
  );
}
