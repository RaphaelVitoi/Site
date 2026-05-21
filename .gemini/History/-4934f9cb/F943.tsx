'use client';

import useSWR from 'swr';

// SOTA: Fetcher isolado para lidar com o motor assincrono
const fetcher = async ( url: string ) => {
    const res = await fetch( url );
    if ( !res.ok ) throw new Error( 'Falha na comunicacao com a API Local' );
    return res.json();
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:17042';

interface TaskStatus {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    agent?: string;
}

export default function Dashboard () {
    // SWR: Polling a cada 3 segundos para reatividade "Near-Real-Time" sem onerar o SQLite
    // /status retorna Task[] -- filtramos localmente para os contadores
    const { data: statusData, error: statusError, isLoading: statusLoading } = useSWR( `${API_BASE}/status`, fetcher, { refreshInterval: 3000 } );
    const { data: keysData } = useSWR( `${API_BASE}/key-health-summary`, fetcher, { refreshInterval: 10000 } );

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
                <div className="p-6 rounded-xl border" style={ { backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(12px)' } }>
                    <h3 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">Backlog (SQLite)</h3>
                    <div className="text-4xl font-light text-text-main">
                        { statusLoading ? '...' : pendingTasks }
                    </div>
                    <div className="text-sm mt-2" style={ { color: 'var(--accent-primary)' } }>
                        Tarefas Pendentes
                    </div>
                </div>

                {/* Card 2: Processamento Ativo */ }
                <div className="p-6 rounded-xl border" style={ { backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(12px)' } }>
                    <h3 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">Motor Cognitivo</h3>
                    <div className="text-4xl font-light text-text-main">
                        { statusLoading ? '...' : activeWorkers }
                    </div>
                    <div className="text-sm mt-2" style={ { color: 'var(--accent-emerald)' } }>
                        Workers Ativos
                    </div>
                </div>

                {/* Card 3: Saude das Chaves */ }
                <div className="p-6 rounded-xl border" style={ { backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)', backdropFilter: 'blur(12px)' } }>
                    <h3 className="text-sm uppercase tracking-wider text-text-muted font-semibold mb-2">Economia Generalizada</h3>
                    <div className="text-4xl font-light text-text-main">
                        { onlineKeys } / { keysData?.total_keys ?? 0 }
                    </div>
                    <div className="text-sm mt-2" style={ { color: 'var(--accent-secondary)' } }>
                        Chaves Sadias vs Total
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tabela de Tarefas Pendentes */ }
                <div className="rounded-xl border overflow-hidden" style={ { backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)' } }>
                    <div className="p-5 border-b" style={ { borderColor: 'var(--glass-border)' } }>
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
                            <tbody className="divide-y" style={ { borderColor: 'var(--glass-border)' } }>
                                { recentTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 3 } className="p-8 text-center text-text-muted italic">Friccao Zero. Fila limpa.</td>
                                    </tr>
                                ) : (
                                    recentTasks.map( ( task: TaskStatus ) => (
                                        <tr key={ task.id } className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono text-xs text-text-muted">{ task.id.split( '-' )[ 1 ] || task.id }</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded text-xs font-medium" style={ { backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--accent-emerald)' } }>
                                                    { task.agent || '@dispatcher' }
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-2">
                                                    <span className={ `w-2 h-2 rounded-full ${task.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}` }></span>
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
                <div className="rounded-xl border flex flex-col" style={ { backgroundColor: 'var(--bg-card)', borderColor: 'var(--glass-border)' } }>
                    <div className="p-5 border-b" style={ { borderColor: 'var(--glass-border)' } }>
                        <h2 className="text-lg font-medium text-text-main">Fluxo de Log (SOTA)</h2>
                    </div>
                    <div className="p-5 flex-1 bg-black/40 font-mono text-xs text-green-400/80 overflow-y-auto max-h-100">
                        <p className="mb-2">&gt; [SYS] Interface SWR estabelecida com orquestrador local.</p>
                        <p className="mb-2">&gt; [SYS] Aguardando telemetria WebSocket ou Polling via SQLite...</p>
                        { statusData && <p className="mb-2 text-gray-400">&gt; [POLLING] Sync concluido. { pendingTasks } pendentes, { activeWorkers } em processamento.</p> }
                        <p className="mb-2 opacity-50 cursor-blink">_</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
