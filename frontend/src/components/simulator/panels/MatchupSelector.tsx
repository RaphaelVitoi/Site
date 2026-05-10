'use client';

/**
 * IDENTITY: Matchup Selector — Pressão de Risco por Confronto v4.2
 * PATH: src/components/simulator/panels/MatchupSelector.tsx
 * ROLE: Seleciona agressor e defensor em 3 ambientes de Mesa Final (FT1/FT2/FT3).
 * BINDING: [engine/ftEnvironments.ts, components/simulator/engine/utils.ts, ui/*]
 */

import React, { useState } from 'react';
import { FT_ENVIRONMENTS, PAYOUTS_10K } from '../engine/ftEnvironments';
import { classifyRp, getRpCellStyle } from '@/components/simulator/engine/utils';
import { PlayerSelectButton } from '@/components/simulator/ui/PlayerSelectButton';

export default function MatchupSelector ()
{
  const [ activeEnvId, setActiveEnvId ] = useState( 'FT1' );
  const [ agressor, setAgressor ] = useState<string | null>( null );
  const [ defensor, setDefensor ] = useState<string | null>( null );

  const env = FT_ENVIRONMENTS.find( e => e.id === activeEnvId ) ?? FT_ENVIRONMENTS[ 0 ];

  const handlePlayerClick = ( playerId: string ) =>
  {
    if ( agressor === null || defensor !== null )
    {
      setAgressor( playerId );
      setDefensor( null );
      return;
    }

    if ( playerId === agressor )
    {
      setAgressor( null );
    } else
    {
      setDefensor( playerId );
    }
  };

  const handleEnvChange = ( id: string ) =>
  {
    setActiveEnvId( id );
    setAgressor( null );
    setDefensor( null );
  };

  const rp = agressor && defensor ? ( env.rpMatrix[ agressor ]?.[ defensor ] ?? null ) : null;
  const classification = rp === null ? null : classifyRp( rp );

  const agressorData = agressor ? env.stacks.find( p => p.id === agressor ) : null;
  const defensorData = defensor ? env.stacks.find( p => p.id === defensor ) : null;

  let bgGlowColor = 'var(--accent-emerald)';
  if (classification?.color.includes('rose')) bgGlowColor = 'var(--accent-danger)';
  else if (classification?.color.includes('amber')) bgGlowColor = 'var(--accent-amber)';

  return (
    <div className="glass-panel p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col gap-12 animate-sota-in overflow-hidden relative rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="mb-10 border-b border-white/5 pb-10">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
            <p className="text-[0.7rem] font-black text-accent-indigo-light uppercase tracking-[0.3em] m-0">Matchup Selector &middot; Mesa Final</p>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mb-4 tracking-tight uppercase">Pressão de Risco por Confronto</h2>
        <p className="text-[0.85rem] text-text-muted m-0 leading-relaxed font-medium">Escolha o ambiente de FT, selecione o agressor e o defensor para mapear a <strong className="text-text-bright uppercase tracking-widest text-[0.65rem]">Distorção ICM</strong> no multiverso de confrontos.</p>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x sota-mask-fade-r">
          { FT_ENVIRONMENTS.map( e => (
            <button key={ e.id } onClick={ () => handleEnvChange( e.id ) } className={`shrink-0 snap-start py-4 px-6 rounded-2xl border cursor-pointer transition-all duration-500 text-left group active:scale-95 ${activeEnvId === e.id ? 'border-accent-indigo/40 bg-slate-900/80 shadow-2xl -translate-y-1' : 'border-white/5 bg-black/40 hover:bg-white/5'}`}>
              <div className={`font-mono text-[0.7rem] font-black tracking-tighter ${activeEnvId === e.id ? 'text-accent-indigo-light' : 'text-text-darker'}`}>{ e.id }</div>
              <div className={`text-[0.65rem] mt-2 font-black uppercase tracking-[0.2em] ${activeEnvId === e.id ? 'text-white' : 'text-text-muted group-hover:text-text-dim'}`}>{ e.title.replace( /^FT \d: /, '' ) }</div>
            </button>
          ) ) }
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="flex-1 py-6 px-8 bg-black/40 rounded-3xl border border-white/5 text-[0.8rem] text-text-muted italic leading-relaxed shadow-inner group/quote hover:border-accent-indigo/20 transition-all">
           <i className="fa-solid fa-quote-left text-accent-indigo text-lg mb-2 block opacity-30 group-hover/quote:opacity-60 transition-opacity" />
           { env.description }
        </div>
        <div className="flex-1 py-6 px-8 bg-accent-amber/5 rounded-3xl border border-accent-amber/10 text-[0.75rem] text-accent-amber/80 leading-relaxed font-medium flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-triangle-exclamation text-base" />
          </div>
          <p className="m-0">Painel de referência estática &middot; Ambientes FT Ancorados no Cânone.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start mb-16">
        <div className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
            <p className="text-[0.7rem] font-black text-text-muted uppercase tracking-[0.3em] m-0">Seleção de Gladiadores</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            { env.stacks.map( player => (
              <PlayerSelectButton key={ player.id } player={ player } isA={ agressor === player.id } isD={ defensor === player.id } onClick={ () => handlePlayerClick( player.id ) } />
            ) ) }
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className={`p-10 rounded-4xl border text-center min-h-64 flex flex-col items-center justify-center transition-all duration-700 shadow-3xl relative overflow-hidden ${rp === null ? 'bg-black/40 border-white/5' : 'bg-slate-900/80 border-white/10'}`}>
            { rp === null ? (
              <>
                <div className="text-6xl opacity-10 mb-6 leading-none">⚔</div>
                <p className="text-[0.8rem] text-text-darker m-0 italic font-black uppercase tracking-[0.3em]">{ agressor ? 'Aguardando Defensor...' : 'Selecione o Agressor' }</p>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-radial-[at_center_center] from-current/5 to-transparent pointer-events-none opacity-20" style={{ color: bgGlowColor } as React.CSSProperties} />
                <div className={`font-mono tabular-nums text-7xl font-black leading-none tracking-tighter relative z-10 ${classification?.color} drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>{ rp.toFixed( 1 ) }<span className="text-3xl font-bold ml-1.5">%</span></div>
                <div className="text-[0.65rem] text-text-darker mt-6 mb-6 uppercase font-black tracking-[0.4em] relative z-10">Risk Premium (RP)</div>
                <div className={`inline-flex items-center gap-3 py-3 px-6 rounded-2xl border text-[0.7rem] font-black uppercase tracking-[0.2em] bg-black/60 relative z-10 ${classification?.color} border-current/30 shadow-2xl`}>
                   { classification?.badge } { classification?.label }
                </div>
              </>
            ) }
          </div>

          { agressorData && (
            <div className="p-8 rounded-3xl bg-black/40 border border-white/5 shadow-inner space-y-5 group/stacks hover:border-accent-indigo/20 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] text-accent-indigo-light font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                    Agressor: { agressorData.pos }
                </span>
                <span className="font-mono tabular-nums text-[0.85rem] text-white font-black bg-black/60 px-2 py-0.5 rounded">{ agressorData.bb.toFixed( 1 ) } <span className="text-xs text-text-darker">bb</span></span>
              </div>
              { defensorData && (
                <div className="flex justify-between items-center pt-5 border-t border-white/5">
                  <span className="text-[0.7rem] text-accent-danger font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-danger shadow-[0_0_8px_var(--accent-danger)]" />
                    Defensor: { defensorData.pos }
                  </span>
                  <span className="font-mono tabular-nums text-[0.85rem] text-white font-black bg-black/60 px-2 py-0.5 rounded">{ defensorData.bb.toFixed( 1 ) } <span className="text-xs text-text-darker">bb</span></span>
                </div>
              ) }
            </div>
          ) }

          { rp !== null && (
            <div className="p-6 rounded-3xl bg-accent-indigo/5 border border-accent-indigo/10 text-[0.85rem] text-text-muted leading-relaxed shadow-lg border-l-4 border-l-accent-indigo">
              { rp >= 40 && ( <p className="m-0 font-medium">RP ≥ 40%: o agressor entra em <strong className="text-accent-danger uppercase tracking-tighter">Death Zone</strong>. Qualquer aposta expõe equity suficiente para ser explorada com fold elevado pelo defensor.</p> ) }
              { rp >= 25 && rp < 40 && ( <p className="m-0 font-medium">RP ≥ 25%: <strong className="text-accent-amber uppercase tracking-tighter">Predator Zone</strong>. Agressor tem pressão significativa de ICM — range de 3-bet linear colapsa.</p> ) }
              { rp >= 15 && rp < 25 && ( <p className="m-0 font-medium">RP 15–25%: <strong className="text-accent-danger/80 uppercase tracking-tighter">Zona de Pressão</strong>. Ambos têm equity ICM a proteger. Frequências Nash ajustadas para baixo.</p> ) }
              { rp < 15 && ( <p className="m-0 font-medium">RP { '<' } 15%: <strong className="text-accent-emerald uppercase tracking-tighter">Zona Normal</strong>. Pressão ICM baixa — frequências próximas ao GTO chipEV.</p> ) }
            </div>
          ) }

          { ( agressor || defensor ) && (
            <button onClick={ () => { setAgressor( null ); setDefensor( null ); } } className="py-4 px-6 rounded-2xl border border-white/5 bg-black/40 text-text-darker text-[0.7rem] font-black uppercase tracking-[0.2em] cursor-pointer transition-all hover:text-white hover:bg-white/5 active:scale-95 group/reset">
                <i className="fa-solid fa-rotate-left mr-3 group-hover/reset:rotate-180 transition-transform duration-500" /> Reset Matchup
            </button>
          ) }
        </div>
      </div>

      <div className="pt-12 border-t border-white/5">
        <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
            <p className="text-[0.7rem] font-black text-text-muted uppercase tracking-[0.3em] m-0">Matriz de Interação Fractal &middot; <span className="text-text-darker">RP (Agressor × Defensor)</span></p>
        </div>
        <div className="overflow-x-auto scrollbar-hide bg-black/40 p-1.5 rounded-3xl border border-white/5 shadow-inner">
          <table className="border-separate border-spacing-1 font-mono tabular-nums text-[0.65rem] w-full">
            <thead>
              <tr>
                <th className="text-left text-text-darker font-black py-4 px-4 text-[0.65rem] w-20 uppercase tracking-widest border-b border-white/5">A \ D</th>
                { env.stacks.map( p => ( <th key={ p.id } className={`text-center py-4 px-2 text-[0.7rem] font-black whitespace-nowrap min-w-12 uppercase border-b border-white/5 ${defensor === p.id ? 'text-accent-danger' : 'text-text-darker'}`}>{ p.pos.split( ' ' )[ 0 ] }</th> ) ) }
              </tr>
            </thead>
            <tbody className="before:block before:h-3">
              { env.stacks.map( rowPlayer => (
                <tr key={ rowPlayer.id } className="group/row">
                  <td className={`py-3 pr-4 pl-4 text-[0.7rem] whitespace-nowrap border-r border-white/5 uppercase transition-colors ${agressor === rowPlayer.id ? 'font-black text-accent-indigo' : 'font-bold text-text-darker group-hover/row:text-text-dim'}`}>{ rowPlayer.pos.split( ' ' )[ 0 ] }</td>
                  { env.stacks.map( colPlayer => {
                    const val = env.rpMatrix[ rowPlayer.id ]?.[ colPlayer.id ] ?? 0;
                    const isDiag = rowPlayer.id === colPlayer.id;
                    const isHighlighted = rowPlayer.id === agressor && colPlayer.id === defensor;
                    const { bg, color } = getRpCellStyle( val, isDiag, isHighlighted );
                    return (
                      <td key={ colPlayer.id } onClick={ () => { if ( !isDiag ) { setAgressor( rowPlayer.id ); setDefensor( colPlayer.id ); } } } className={`text-center py-3 px-1 rounded-xl transition-all duration-300 ${bg} ${color} ${isHighlighted ? 'font-black scale-110 shadow-2xl z-10 border border-white/30' : 'font-bold border border-transparent'} ${isDiag ? 'cursor-default text-transparent' : 'cursor-pointer hover:scale-[1.05]'}`}>
                        { isDiag ? '—' : val.toFixed( 1 ) }
                      </td>
                    );
                  } ) }
                </tr>
              ) ) }
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-10">
        <p className="text-[0.65rem] font-black text-text-darker uppercase tracking-[0.4em] m-0 mb-6 px-2">Estrutura de Premiação &middot; <span className="text-text-dim">$10k Ref</span></p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          { PAYOUTS_10K.map( ( p, i ) => (
            <div key={ p.pos } className={`py-4 px-5 rounded-2xl flex justify-between items-center gap-3 border transition-all hover:border-white/20 ${i < 3 ? 'bg-accent-indigo/10 border-accent-indigo/20 shadow-lg' : 'bg-black/40 border-white/5'}`}>
              <span className={`text-[0.7rem] font-black uppercase tracking-widest ${i < 3 ? 'text-accent-indigo-light' : 'text-text-darker'}`}>{ p.pos }</span>
              <span className={`font-mono tabular-nums text-[0.75rem] font-black ${i < 3 ? 'text-white' : 'text-text-muted'}`}>{ p.val }</span>
            </div>
          ) ) }
        </div>
      </div>

    </div>
  );
}
