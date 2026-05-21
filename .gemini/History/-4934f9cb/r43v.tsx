"use client";

import React, { useMemo } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
    // SOTA: Polling Inteligente e Cache. Respeita a máquina sem sobrecarregar a rede local.
    const { data: tasks, error: tasksError, isLoading: tasksLoading } = useSWR(
        'http://127.0.0.1:17042/status?status=all',
        fetcher,
        { refreshInterval: 3000, errorRetryCount: 3 }
    );

    const { data: health, error: healthError, isLoading: healthLoading } = useSWR(
        'http://127.0.0.1:17042/key-health-summary?window_minutes=180',
        fetcher,
        { refreshInterval: 15000 }
    );

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

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
            <header className="mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-bold text-cyan-400 tracking-tight">NEXUS ORCHESTRATOR</h1>
                <p className="text-gray-400 text-sm mt-1">Camada de Telemetria SOTA | Painel Vivo</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Pendentes" value={metrics.pending} color="text-yellow-400" loading={tasksLoading} />
                <MetricCard title="Em Execução" value={metrics.running} color="text-fuchsia-400" loading={tasksLoading} />
                <MetricCard title="Concluídas" value={metrics.completed} color="text-green-400" loading={tasksLoading} />
                <MetricCard title="Falhas" value={metrics.failed} color="text-red-400" loading={tasksLoading} />
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
            </div>
        </div>
    );
}

function MetricCard({ title, value, color, loading }: { title: string, value: number, color: string, loading: boolean }) {
    return (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
            {loading ? <div className="h-10 w-16 bg-gray-800 animate-pulse rounded"></div> : <span className={`text-5xl font-black font-mono ${color}`}>{value}</span>}
        </div>
    );
}