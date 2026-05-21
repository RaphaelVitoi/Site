'use client'; // Esta diretiva deve estar no topo do arquivo para funcionar corretamente

import React from 'react';

interface DailyStat {
    day: string;
    count: number;
}

export default function PerformanceChart({ data }: { data: DailyStat[] }) {
    // Estado para controlar a animação de montagem
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!data || data.length === 0) return <div className="text-zinc-600 italic">Aguardando dados de autopoiese...</div>; // Mensagem para quando não há dados

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div className="bg-black/40 border border-green-900/30 p-6 rounded-xl">
            <div className="flex justify-between items-end h-40 gap-2">
                {data.map((day, i) => {
                    const height = (day.count / maxCount) * 100;
                    return (
                        <div key={day.day} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-green-500 text-black text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap z-10">
                                {day.day}: {day.count} tarefas
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full bg-gradient-to-t from-green-900 to-green-400 rounded-t-sm transition-all duration-1000 ease-out"
                                style={{ height: `${height}%` }}
                            />

                            {/* Label (Show only some to avoid clutter) */}
                            {(i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) && (
                                <span className="text-[8px] text-zinc-500 mt-2 rotate-45 origin-left">
                                    {day.day.split('-').slice(1).join('/')}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                    Histórico de Autopoiese (SOTA)
                </div>
                <div className="text-xs text-green-400 font-mono">
                    {data.reduce((acc, curr) => acc + day.count, 0)} Vitórias Totais
                </div>
            </div>
        </div>
    );
}