'use client';

/**
 * IDENTITY: Visualizador de Estrutura de Payouts SOTA v4.2
 * PATH: src/components/simulator/panels/PayoutsPanel.tsx
 * ROLE: Exibir a curva de premiação e os valores percentuais.
 */

import React, { useMemo } from 'react';
import
{
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface PayoutsPanelProps
{
  payouts: number[];
}

const CustomTooltip = ( { active, payload }: any ) =>
{
  if ( active && payload?.length )
  {
    return (
      <div className="p-3 bg-slate-950/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest mb-1">{ payload[ 0 ].payload.pos }º Lugar</p>
        <p className="text-[0.8rem] font-mono font-black text-accent-indigo-light">{ payload[ 0 ].value.toFixed( 1 ) }%</p>
      </div>
    );
  }
  return null;
};

export default function PayoutsPanel ( { payouts }: Readonly<PayoutsPanelProps> )
{
  const chartData = useMemo( () =>
  {
    return payouts.map( ( val, i ) => ( {
      pos: i + 1,
      value: val,
    } ) );
  }, [ payouts ] );

  return (
    <div className="glass-panel p-6 sm:p-8 lg:p-12 animate-sota-in flex flex-col gap-10 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex justify-between items-start border-b border-white/5 pb-6">
        <div>
          <h3 className="text-[0.75rem] font-black text-text-main uppercase tracking-[0.2em] m-0">Estrutura de Payouts</h3>
          <p className="m-0 mt-1.5 text-[0.6rem] text-text-dim font-medium uppercase tracking-wider">Distribuição do Pool de Premiação</p>
        </div>
        <div className="px-4 py-1.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-[0.6rem] font-black text-accent-emerald uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            VITOI STANDARD
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">Curva de Progressão</p>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10}>
                    <AreaChart data={ chartData }>
                        <defs>
                            <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={ 0.3 } />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={ 0 } />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
                        <XAxis dataKey="pos" tick={ { fill: '#475569', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)' } } axisLine={ false } tickLine={ false } />
                        <YAxis tick={ { fill: '#475569', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)' } } axisLine={ false } tickLine={ false } unit="%" />
                        <Tooltip content={ <CustomTooltip /> } />
                        <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={ 3 } fillOpacity={ 1 } fill="url(#colorPayout)" animationDuration={ 1500 } />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto scrollbar-hide pb-2">
          { payouts.map( ( p, i ) => (
            <div key={ `payout-${ i }` /* NOSONAR */ } className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-1 transition-all hover:bg-black/60 hover:border-accent-indigo/20 group">
              <span className="text-[0.5rem] font-black text-text-darker uppercase tracking-widest group-hover:text-text-muted transition-colors">{ i + 1 }º LUGAR</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[0.9rem] font-mono font-black text-white">{ p.toFixed( 1 ) }</span>
                <span className="text-[0.55rem] font-black text-text-muted">%</span>
              </div>
            </div>
          ) ) }
        </div>
      </div>
    </div>
  );
}
