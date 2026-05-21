'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TelemetryEventData
{
    evLoss: number;
    isCorrect: boolean;
    createdAt: Date;
}

export function TelemetryCharts ( { data }: Readonly<{ data: TelemetryEventData[]; }> )
{
    const chartData = useMemo( () =>
    {
            return data.map( ( e, index ) => {
                const dateObj = new Date( e.createdAt );
                return {
                    index: index + 1,
                    evLoss: e.evLoss,
                    accuracy: e.isCorrect ? 100 : 0,
                    timeLabel: dateObj.toLocaleTimeString( 'pt-BR', { hour: '2-digit', minute: '2-digit' } )
                };
            } );
    }, [ data ] );

    if ( data.length === 0 ) return <div className="text-center text-text-dim text-sm uppercase tracking-widest mt-12">Sem dados termodinâmicos suficientes. Interaja com o simulador para gerar telemetria.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-sota-in">
            <GlassPanel className="p-6 border-white/5">
                <h3 className="text-[0.7rem] font-black uppercase tracking-widest text-accent-rose mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-chart-area" /> Progressão de Sunk Cost (EV Loss)
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                            <XAxis dataKey="timeLabel" tick={ { fontSize: 9, fill: '#64748b', fontFamily: 'var(--font-mono)' } } tickLine={ false } axisLine={ false } dy={ 10 } minTickGap={ 20 } />
                            <YAxis hide domain={ [ 0, 'dataMax + 1' ] } />
                            <Tooltip contentStyle={ { background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px' } } itemStyle={ { color: 'var(--accent-rose)', fontWeight: 'bold' } } labelStyle={ { display: 'none' } } />
                            <Area type="monotone" dataKey="evLoss" stroke="var(--accent-rose)" strokeWidth={ 2 } fillOpacity={ 0.2 } fill="var(--accent-rose)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassPanel>
            <GlassPanel className="p-6 border-white/5">
                <h3 className="text-[0.7rem] font-black uppercase tracking-widest text-accent-emerald mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-chart-line" /> Estabilidade Cognitiva (Taxa de Acertos)
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ chartData }>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                            <XAxis dataKey="timeLabel" tick={ { fontSize: 9, fill: '#64748b', fontFamily: 'var(--font-mono)' } } tickLine={ false } axisLine={ false } dy={ 10 } minTickGap={ 20 } />
                            <YAxis hide domain={ [ 0, 100 ] } />
                            <Tooltip contentStyle={ { background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px' } } itemStyle={ { color: 'var(--accent-emerald)', fontWeight: 'bold' } } labelStyle={ { display: 'none' } } />
                            <Line type="stepAfter" dataKey="accuracy" stroke="var(--accent-emerald)" strokeWidth={ 2 } dot={ false } />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GlassPanel>
        </div>
    );
}
