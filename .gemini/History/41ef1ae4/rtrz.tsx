'use client';

/**
 * IDENTITY: Painel de Estrutura de Premiação v4.2
 * PATH: src/components/simulator/panels/PayoutsPanel.tsx
 * ROLE: Tabela visual de payouts padrão para torneios.
 */

import { useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useSotaSync } from '../hooks/useSotaSync';
import { getPlaceColor } from '@/components/simulator/engine/utils';

const PAYOUT_STRUCTURES: Record<string, { players: number; payouts: { place: number; percent: number; }[]; }> = {
  'HU (2p)': { players: 2, payouts: [ { place: 1, percent: 65 }, { place: 2, percent: 35 } ] },
  '3-Way': { players: 3, payouts: [ { place: 1, percent: 50 }, { place: 2, percent: 30 }, { place: 3, percent: 20 } ] },
  'STT (6p)': { players: 6, payouts: [ { place: 1, percent: 40 }, { place: 2, percent: 30 }, { place: 3, percent: 20 }, { place: 4, percent: 10 } ] },
  'FT (9p)': { players: 9, payouts: [ { place: 1, percent: 30 }, { place: 2, percent: 20 }, { place: 3, percent: 15 }, { place: 4, percent: 11 }, { place: 5, percent: 8 }, { place: 6, percent: 6 }, { place: 7, percent: 4 }, { place: 8, percent: 3.5 }, { place: 9, percent: 2.5 } ] },
  'MTT Bolha': { players: 4, payouts: [ { place: 1, percent: 50 }, { place: 2, percent: 30 }, { place: 3, percent: 20 } ] },
};

export default function PayoutsPanel ()
{
  const [ activeStructure, setActiveStructure ] = useState( 'STT (6p)' );
  const [ customPayouts, setCustomPayouts ] = useState<{ place: number; percent: number; }[]>( [
    { place: 1, percent: 50 },
    { place: 2, percent: 30 },
    { place: 3, percent: 20 },
  ] );

  const { physics, isHydrated } = useSotaSync();

  if ( !isHydrated ) return null;

  const isCustom = activeStructure === 'Custom';
  const structure = isCustom
    ? { players: customPayouts.length * 3, payouts: customPayouts }
    : ( PAYOUT_STRUCTURES[ activeStructure ] ?? PAYOUT_STRUCTURES[ 'STT (6p)' ] );

  const updateCustomPayout = ( index: number, newPercent: number ) =>
  {
    const updated = [ ...customPayouts ];
    updated[ index ].percent = newPercent;
    setCustomPayouts( updated );
  };

  const addCustomPayout = () => setCustomPayouts( [ ...customPayouts, { place: customPayouts.length + 1, percent: 0 } ] );
  const removeCustomPayout = () => setCustomPayouts( customPayouts.length > 1 ? customPayouts.slice( 0, -1 ) : customPayouts );

  const totalPercent = structure?.payouts.reduce( ( s, p ) => s + p.percent, 0 ) || 0;

  return (
    <GlassPanel className="flex flex-col gap-4 p-8">
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <h3 className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest m-0">Estrutura de Premiação</h3>
        <div className="flex items-center gap-2">
          <span className="text-[0.55rem] font-mono text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 px-2 py-0.5 rounded border border-accent-indigo/20 shadow-inner">Sync: { physics.referenceStatus }</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        { [ ...Object.keys( PAYOUT_STRUCTURES ), 'Custom' ].map( ( key ) => (
          <button key={ key } type="button" onClick={ () => setActiveStructure( key ) } className={ `px-3 py-1.5 rounded-lg text-[0.6rem] font-black uppercase tracking-widest transition-all ${ activeStructure === key ? 'bg-accent-indigo/20 border border-accent-indigo/40 text-accent-indigo-light shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-bg-deep border border-white/5 text-text-muted hover:bg-white/5 hover:text-text-light hover:border-white/10' }` }>{ key }</button>
        ) ) }
      </div>

      <div className="bg-bg-deep border border-white/5 rounded-xl overflow-hidden shadow-inner flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-4 py-3 text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Posição</th>
                <th className="px-4 py-3 text-[0.6rem] font-black text-text-dim uppercase tracking-widest text-right">Prêmio (%)</th>
                <th className="px-4 py-3 text-[0.6rem] font-black text-text-dim uppercase tracking-widest text-right w-1/2">Distribuição</th>
              </tr>
            </thead>
            <tbody suppressHydrationWarning>
              { structure?.payouts.map( ( p, idx ) => {
                const transformProps = { style: { transform: `translateX(-${ 100 - Math.min( p.percent * 2, 100 ) }%)` } };
                return (
                  <tr key={ p.place } className="border-b border-white/5 hover:bg-white/5 transition-colors group" suppressHydrationWarning>
                    <td className="px-4 py-3"><span className={ `text-[0.7rem] font-black ${ getPlaceColor( p.place ) }` }>{ p.place }º</span></td>
                    <td className="px-4 py-3 text-right">
                      { isCustom ? (
                        <div className="flex justify-end items-center gap-1.5">
                          <input type="number" value={ p.percent } onChange={ ( e ) => updateCustomPayout( idx, Number.parseFloat( e.target.value ) || 0 ) } className="w-16 bg-slate-900/80 border border-white/10 rounded px-2 py-1 text-accent-emerald text-[0.7rem] font-mono font-black text-right focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/50 transition-all" />
                          <span className="text-[0.65rem] text-text-dim font-black">%</span>
                        </div>
                      ) : (
                        <span className="font-mono tabular-nums text-[0.75rem] font-black text-accent-emerald">{ p.percent }%</span>
                      ) }
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full max-w-30 ml-auto relative">
                        <div className={ `absolute inset-0 w-full h-full transition-transform duration-1000 ease-out origin-left ${ p.place === 1 ? 'bg-linear-to-r from-accent-amber to-accent-gold' : 'bg-linear-to-r from-accent-indigo to-accent-indigo-light' }` } {...transformProps} />
                      </div>
                    </td>
                  </tr>
                ); } ) }
            </tbody>
          </table>
        </div>

        { isCustom && (
          <div className="p-3 flex gap-2 bg-white/5 border-b border-white/5">
            <button type="button" onClick={ addCustomPayout } className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-[0.6rem] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"><i className="fa-solid fa-plus text-[0.5rem]" aria-hidden="true" /> Posição</button>
            { customPayouts.length > 1 && ( <button type="button" onClick={ removeCustomPayout } aria-label="Remover Posição" className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-accent-danger text-[0.6rem] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center gap-1.5"><i className="fa-solid fa-minus text-[0.5rem]" aria-hidden="true" /> Remover</button> ) }
            <button type="button" onClick={ addCustomPayout } className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-[0.6rem] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
              <i className="fa-solid fa-plus text-[0.5rem]" aria-hidden="true" /> Posição
            </button>
            { customPayouts.length > 1 ? (
              <button type="button" onClick={ removeCustomPayout } aria-label="Remover Posição" className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-accent-danger text-[0.6rem] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center gap-1.5">
                <i className="fa-solid fa-minus text-[0.5rem]" aria-hidden="true" /> Remover
              </button>
            ) : null }
          </div>
        ) }

        <div className="px-4 py-3 flex justify-between items-center bg-slate-950/40">
          <span className="text-[0.6rem] font-bold text-text-dim uppercase tracking-widest">{ isCustom ? 'Customizado' : `${ structure?.players } Jogadores` }</span>
          <span className={ `font-mono tabular-nums text-[0.65rem] font-black flex items-center gap-2 ${ totalPercent === 100 ? 'text-accent-emerald' : 'text-accent-amber' }` }>TOTAL: { totalPercent.toFixed( 1 ) }% { totalPercent !== 100 && <i className="fa-solid fa-triangle-exclamation text-accent-danger" title="A soma dos prêmios deve ser idealmente 100%" /> }</span>
          <span className={ `font-mono tabular-nums text-[0.65rem] font-black flex items-center gap-2 ${ totalPercent === 100 ? 'text-accent-emerald' : 'text-accent-amber' }` }>
            TOTAL: { totalPercent.toFixed( 1 ) }%
            { totalPercent !== 100 ? (
              <i className="fa-solid fa-triangle-exclamation text-accent-danger" title="A soma dos prêmios deve ser idealmente 100%" />
            ) : null }
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}
