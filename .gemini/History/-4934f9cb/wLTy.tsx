"use client";
'use client';

import React, { useMemo } from 'react';
import React from 'react';
import useSWR from 'swr';
import Oracle from './Oracle';
import DependencyGraph from './DependencyGraph';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
// SOTA: Fetcher isolado para lidar com o motor assincrono
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha na comunicacao com a API Local');
  return res.json();
};

const API_BASE = 'http://127.0.0.1:17042';

export default function Dashboard() {
    // SOTA: Polling Inteligente e Cache. Respeita a máquina sem sobrecarregar a rede local.
    const { data: tasks, error: tasksError, isLoading: tasksLoading } = useSWR(
        'http://127.0.0.1:17042/status?status=all',
        fetcher,
        { refreshInterval: 3000, errorRetryCount: 3 }
    );
  // SWR: Polling a cada 3 segundos para reatividade "Near-Real-Time" sem onerar o SQLite
  const { data: statusData, error: statusError, isLoading: statusLoading } = useSWR(`${API_BASE}/status`, fetcher, { refreshInterval: 3000 });
  const { data: keysData, error: keysError } = useSWR(`${API_BASE}/keys/health`, fetcher, { refreshInterval: 10000 });

    const { data: health, error: healthError, isLoading: healthLoading } = useSWR(
        'http://127.0.0.1:17042/key-health-summary?window_minutes=180',
        fetcher,
        { refreshInterval: 15000 }
    );
  return (
    <div className="container pt-16 pb-20 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight">
          Nexus Orchestrator
        </h1>
        <p className="text-text-muted mt-2 text-lg">
          Telemetria SOTA 8.0 & Monitoramento de Agentes
        </p>
      </header>

    // Agregação Matemática O(N) das Tarefas
    const metrics = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return { pending: 0, running: 0, completed: 0, failed: 0 };
        return tasks.reduce(
            (acc, task) => {
                if (task.status in acc) acc[task.status as keyof typeof acc]++;
                return acc;
            },
            { pending: 0, running: 0, completed: 0, failed: 0 }
        );
    }, [tasks]);
      {/* Status Global Alert */}
      {statusError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8">
          <strong>Aviso Critico:</strong> O Orquestrador Python (task_executor.py) parece estar offline ou inacessivel na porta 17042.
        </div>
      )}

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
            <header className="mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-bold text-cyan-400 tracking-tight">NEXUS ORCHESTRATOR</h1>
                <p className="text-gray-400 text-sm mt-1">Camada de Telemetria SOTA | Painel Vivo</p>
            </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Fila de Tarefas */}
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
          <h3 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">Backlog (SQLite)</h3>
          <div className="text-4xl font-light text-text-main">
            {statusLoading ? '...' : statusData?.pending_tasks ?? 0}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--accent-primary)' }}>
            Tarefas Pendentes
          </div>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Pendentes" value={metrics.pending} color="text-yellow-400" loading={tasksLoading} />
                <MetricCard title="Em Execução" value={metrics.running} color="text-fuchsia-400" loading={tasksLoading} />
                <MetricCard title="Concluídas" value={metrics.completed} color="text-green-400" loading={tasksLoading} />
                <MetricCard title="Falhas" value={metrics.failed} color="text-red-400" loading={tasksLoading} />
            </div>
        {/* Card 2: Processamento Ativo */}
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
          <h3 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">Motor Cognitivo</h3>
          <div className="text-4xl font-light text-text-main">
            {statusLoading ? '...' : statusData?.active_workers ?? 0}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--accent-emerald)' }}>
            Workers Ativos
          </div>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Saúde Sistêmica (Chaves SOTA)</h2>
                    {healthLoading ? (
                        <div className="animate-pulse space-y-4 py-1">
                            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                        </div>
                    ) : healthError ? (
                        <p className="text-red-400 text-sm font-mono border border-red-900 bg-red-950/20 p-3 rounded">
                            [FALHA] Não foi possível conectar ao Kernel Híbrido (127.0.0.1:17042).
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Tamanho do Pool</span>
                                <span className="font-mono text-lg">{health?.total_keys || 0} chaves</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                <span className="text-gray-400">Confiabilidade da Rota</span>
                                <span className={`font-mono text-lg ${health?.online_rate >= 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {((health?.online_rate || 0) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Latência Estável (P95)</span>
                                <span className="font-mono text-lg text-cyan-400">
                                    {health?.p95_latency_ms ? `${health.p95_latency_ms} ms` : 'Aguardando...'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
        {/* Card 3: Saude das Chaves */}
        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
          <h3 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">Economia Generalizada</h3>
          <div className="text-4xl font-light text-text-main">
            {keysData?.healthy_keys ?? 0} / {keysData?.total_keys ?? 0}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--accent-secondary)' }}>
            Chaves Sadias vs Total
          </div>
        </div>
      </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col h-80">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4">Registro Akáshico</h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {tasks?.slice(0, 10).map((task: any) => (
                            <div key={task.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 flex justify-between items-center">
                                <div className="truncate pr-4 flex-1">
                                    <p className="text-sm font-medium text-gray-200 truncate">{task.description}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{task.id} • {task.agent}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold shrink-0 ${task.status === 'completed' ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
                                    task.status === 'running' ? 'bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-800/50 animate-pulse' :
                                        task.status === 'failed' ? 'bg-red-900/30 text-red-400 border border-red-800/50' :
                                            'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* O Templo do Oráculo (RAG) */}
                <div className="lg:col-span-2">
                    <Oracle />
                </div>

                {/* Grafo Topológico SOTA */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2"><i className="fa-solid fa-diagram-project text-cyan-400"></i> Topologia de Execução (Grafo Acíclico)</h2>
                    <DependencyGraph tasks={tasks || []} />
                </div>
            </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tabela de Tarefas Pendentes */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h2 className="text-lg font-medium text-text-main">Operacoes em Fila</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-text-muted bg-black/20">
                <tr>
                  <th className="p-4 font-medium">ID da Tarefa</th>
                  <th className="p-4 font-medium">Agente Alvo</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--glass-border)' }}>
                {!statusData?.recent_tasks || statusData.recent_tasks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-text-muted italic">Friccao Zero. Fila limpa.</td>
                  </tr>
                ) : (
                  statusData.recent_tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-xs text-text-muted">{task.id.split('-')[1] || task.id}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--accent-emerald)' }}>
                          {task.agent || '@dispatcher'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${task.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></span>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    );
}

function MetricCard({ title, value, color, loading }: { title: string, value: number, color: string, loading: boolean }) {
    return (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
            {loading ? <div className="h-10 w-16 bg-gray-800 animate-pulse rounded"></div> : <span className={`text-5xl font-black font-mono ${color}`}>{value}</span>}
        {/* Logs e Telemetria (Mock/Placeholder estrutural para futura expansao) */}
        <div className="rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
            <h2 className="text-lg font-medium text-text-main">Fluxo de Log (SOTA)</h2>
          </div>
          <div className="p-5 flex-1 bg-black/40 font-mono text-xs text-green-400/80 overflow-y-auto max-h-[400px]">
            <p className="mb-2">&gt; [SYS] Interface SWR estabelecida com orquestrador local.</p>
            <p className="mb-2">&gt; [SYS] Aguardando telemetria WebSocket ou Polling via SQLite...</p>
            {statusData && <p className="mb-2 text-gray-400">&gt; [POLLING] Sync concluido. {statusData.pending_tasks} iteracoes lidas.</p>}
            <p className="mb-2 opacity-50 cursor-blink">_</p>
          </div>
        </div>
    );
      </div>
    </div>
  );
}