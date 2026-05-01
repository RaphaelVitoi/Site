'use client';

import { buildNexusClientUrl } from '@/lib/api-contract';
import useSWR from 'swr';

// SOTA: Fetcher isolado para lidar com o motor assincrono
const fetcher = async ( url: string ) =>
{
    const res = await fetch( url );
    if ( !res.ok ) throw new Error( 'Falha na comunicacao com a API Local' );
    return res.json();
};

interface TaskStatus
{
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    agent?: string;
}

interface KeyHealthSummary
{
    online_rate: number;
    total_keys: number;
}

export default function Dashboard ()
{
    // SWR: Polling a cada 3 segundos para reatividade "Near-Real-Time" sem onerar o SQLite
    // /status retorna Task[] -- filtramos localmente para os contadores
    const { data: statusData, error: statusError, isLoading: statusLoading } = useSWR<TaskStatus[]>( buildNexusClientUrl( '/status' ), fetcher, { refreshInterval: 3000 } );
    const { data: keysData } = useSWR<KeyHealthSummary>( buildNexusClientUrl( '/key-health-summary' ), fetcher, { refreshInterval: 10000 } );

    const pendingTasks = Array.isArray( statusData ) ? statusData.filter( ( t: TaskStatus ) => t.status === 'pending' ).length : 0;
    const activeWorkers = Array.isArray( statusData ) ? statusData.filter( ( t: TaskStatus ) => t.status === 'processing' ).length : 0;
    const recentTasks = Array.isArray( statusData ) ? statusData.slice( 0, 10 ) : [];
    const onlineKeys = keysData ? Math.round( ( keysData.online_rate ?? 0 ) * ( keysData.total_keys ?? 0 ) ) : 0;

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

            {/* Status Global Alert */ }
            { statusError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-8">
                    <strong>Aviso Critico:</strong> O Orquestrador Python (task_executor.py) parece estar offline ou inacessivel na porta 17042.
                </div>
            ) }

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1: Fila de Tarefas */ }
                <div className="p-6 rounded-2xl bg-bg-panel/40 border border-white/10 backdrop-blur-xl shadow-2xl hover:bg-bg-panel/60 transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-[0.65rem] uppercase tracking-widest text-text-muted font-black mb-2 relative z-10">Backlog (SQLite)</h3>
                    <div className="text-4xl font-light text-text-main">
                        { statusLoading ? '...' : pendingTasks }
                    </div>
                    <div className="text-xs mt-2 text-accent-indigo font-bold">
                        Tarefas Pendentes
                    </div>
                </div>

                {/* Card 2: Processamento Ativo */ }
                <div className="p-6 rounded-2xl bg-bg-panel/40 border border-white/10 backdrop-blur-xl shadow-2xl hover:bg-bg-panel/60 transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-[0.65rem] uppercase tracking-widest text-text-muted font-black mb-2 relative z-10">Motor Cognitivo</h3>
                    <div className="text-4xl font-light text-text-main">
                        { statusLoading ? '...' : activeWorkers }
                    </div>
                    <div className="text-xs mt-2 text-accent-emerald font-bold">
                        Workers Ativos
                    </div>
                </div>

                {/* Card 3: Saude das Chaves */ }
                <div className="p-6 rounded-2xl bg-bg-panel/40 border border-white/10 backdrop-blur-xl shadow-2xl hover:bg-bg-panel/60 transition-colors relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-[0.65rem] uppercase tracking-widest text-text-muted font-black mb-2 relative z-10">Economia Generalizada</h3>
                    <div className="text-4xl font-light text-text-main">
                        { onlineKeys } / { keysData?.total_keys ?? 0 }
                    </div>
                    <div className="text-xs mt-2 text-accent-amber font-bold">
                        Chaves Sadias vs Total
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tabela de Tarefas Pendentes */ }
                <div className="rounded-2xl border border-white/10 bg-bg-panel/40 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-white/10 bg-black/20">
                        <h2 className="text-sm uppercase tracking-widest font-black text-white">Operacoes em Fila</h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-text-muted bg-black/40 text-[0.65rem] uppercase tracking-widest">
                                <tr>
                                    <th className="p-4 font-black">ID da Tarefa</th>
                                    <th className="p-4 font-black">Agente Alvo</th>
                                    <th className="p-4 font-black">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                { recentTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 3 } className="p-8 text-center text-text-muted italic text-xs">Friccao Zero. Fila limpa.</td>
                                    </tr>
                                ) : (
                                    recentTasks.map( ( task: TaskStatus ) => (
                                        <tr key={ task.id } className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-[0.65rem] text-text-darker font-bold">{ task.id.split( '-' )[ 1 ] || task.id }</td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded border border-accent-indigo/20 bg-accent-indigo/10 text-[0.65rem] font-black uppercase tracking-widest text-accent-indigo-light">
                                                    { task.agent || '@dispatcher' }
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-2 text-xs font-bold text-text-muted">
                                                    <span className={ `w-1.5 h-1.5 rounded-full ${ task.status === 'processing' ? 'bg-accent-amber animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-text-darker' }` }></span>
                                                    { task.status }
                                                </span>
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Logs e Telemetria (Mock/Placeholder estrutural para futura expansao) */ }
                <div className="rounded-2xl border border-white/10 bg-bg-panel/40 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-white/10 bg-black/20">
                        <h2 className="text-sm uppercase tracking-widest font-black text-white">Fluxo de Log (SOTA)</h2>
                    </div>
                    <div className="p-5 flex-1 bg-[#0a0a0c]/80 font-mono text-[0.65rem] text-accent-emerald/80 overflow-y-auto max-h-100 shadow-inner">
                        <p className="mb-2 opacity-70">&gt; [SYS] Interface SWR estabelecida com orquestrador local.</p>
                        <p className="mb-2 opacity-70">&gt; [SYS] Aguardando telemetria WebSocket ou Polling via SQLite...</p>
                        { statusData && <p className="mb-2 text-text-dim">&gt; [POLLING] Sync concluido. { pendingTasks } pendentes, { activeWorkers } em processamento.</p> }
                        <p className="mb-2 opacity-50 cursor-blink">_</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
