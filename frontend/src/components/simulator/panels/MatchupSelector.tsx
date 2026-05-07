'use client';

/**
 * IDENTITY: Matchup Selector — Pressão de Risco por Confronto v4.2
 * PATH: src/components/simulator/panels/MatchupSelector.tsx
 * ROLE: Seleciona agressor e defensor em 3 ambientes de Mesa Final (FT1/FT2/FT3).
 * BINDING: [engine/ftEnvironments.ts, components/simulator/engine/utils.ts, ui/*]
 */

import { useState } from 'react';
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
  const resultCardBgClass = rp === null ? 'bg-slate-900/50' : 'bg-slate-900/80';
  const resultCardBorderClass = rp === null ? 'border-white/5' : 'border-white/10';

  const agressorData = agressor ? env.stacks.find( p => p.id === agressor ) : null;
  const defensorData = defensor ? env.stacks.find( p => p.id === defensor ) : null;

  return (
    <div className="glass-panel p-6 sm:p-8 lg:p-10 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="mb-10 border-b border-white/5 pb-6">
        <p className="text-[0.6rem] font-black text-accent-indigo uppercase tracking-[0.25em] mb-2">Matchup Selector · Mesa Final</p>
        <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">Pressão de Risco por Confronto</h2>
        <p className="text-[0.75rem] text-text-muted m-0 leading-relaxed font-medium">Escolha o ambiente de FT, selecione o agressor e o defensor para mapear a <strong className="text-white">Distorção ICM</strong>.</p>
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        { FT_ENVIRONMENTS.map( e => (
          <button key={ e.id } onClick={ () => handleEnvChange( e.id ) } className={`py-3 px-5 rounded-2xl border cursor-pointer transition-all text-left group ${activeEnvId === e.id ? 'border-accent-indigo bg-accent-indigo/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/5 bg-black/40 hover:bg-white/5'}`}>
            <div className={`font-mono text-[0.65rem] font-black tracking-tight ${activeEnvId === e.id ? 'text-accent-indigo-light' : 'text-text-darker'}`}>{ e.id }</div>
            <div className={`text-[0.65rem] mt-1 font-bold uppercase tracking-wider ${activeEnvId === e.id ? 'text-white' : 'text-text-muted group-hover:text-text-dim'}`}>{ e.title.replace( /^FT \d: /, '' ) }</div>
          </button>
        ) ) }
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 py-4 px-6 bg-black/40 rounded-2xl border border-white/5 text-[0.72rem] text-text-muted italic leading-relaxed shadow-inner">
           <i className="fa-solid fa-quote-left text-accent-indigo mr-2 opacity-50" />
           { env.description }
        </div>
        <div className="flex-1 py-4 px-6 bg-accent-amber/5 rounded-2xl border border-accent-amber/10 text-[0.7rem] text-accent-amber/80 leading-relaxed font-medium">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          Painel de referência estática (Ambientes FT Ancorados).
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start mb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-text-darker" />
            <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">Seleção de Gladiadores</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            { env.stacks.map( player => (
              <PlayerSelectButton key={ player.id } player={ player } isA={ agressor === player.id } isD={ defensor === player.id } onClick={ () => handlePlayerClick( player.id ) } />
            ) ) }
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={`p-8 rounded-3xl border text-center min-h-52 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden ${rp === null ? 'bg-black/40 border-white/5' : 'bg-black/60 border-white/10'}`}>
            { rp === null ? (
              <>
                <div className="text-5xl opacity-10 mb-4 leading-none">⚔</div>
                <p className="text-[0.75rem] text-text-darker m-0 italic font-medium uppercase tracking-widest">{ agressor ? 'Aguardando Defensor...' : 'Selecione o Agressor' }</p>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-radial-[at_center_center] from-current/5 to-transparent pointer-events-none" style={{ color: classification?.color.includes('rose') ? 'var(--accent-danger)' : classification?.color.includes('amber') ? 'var(--accent-amber)' : 'var(--accent-emerald)' } as React.CSSProperties} />
                <div className={`font-mono tabular-nums text-6xl font-black leading-none tracking-tighter relative z-10 ${classification?.color}`}>{ rp.toFixed( 1 ) }<span className="text-2xl font-bold ml-1">%</span></div>
                <div className="text-[0.6rem] text-text-dim mt-4 mb-4 uppercase font-black tracking-[0.3em] relative z-10">Risk Premium (RP)</div>
                <div className={`inline-flex items-center gap-2 py-2 px-4 rounded-full border text-[0.65rem] font-black uppercase tracking-widest bg-black/40 relative z-10 ${classification?.color} border-current/30 shadow-lg`}>
                   { classification?.badge } { classification?.label }
                </div>
              </>
            ) }
          </div>

          { agressorData && (
            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 shadow-inner space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[0.65rem] text-accent-indigo-light font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                    Agressor: { agressorData.pos }
                </span>
                <span className="font-mono tabular-nums text-[0.75rem] text-white font-black">{ agressorData.bb.toFixed( 1 ) } bb</span>
              </div>
              { defensorData && (
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-[0.65rem] text-accent-danger font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-danger shadow-[0_0_8px_var(--accent-danger)]" />
                    Defensor: { defensorData.pos }
                  </span>
                  <span className="font-mono tabular-nums text-[0.75rem] text-white font-black">{ defensorData.bb.toFixed( 1 ) } bb</span>
                </div>
              ) }
            </div>
          ) }

          { rp !== null && (
            <div className="p-5 rounded-2xl bg-accent-indigo/5 border border-accent-indigo/10 text-[0.75rem] text-text-muted leading-relaxed shadow-sm">
              { rp >= 40 && ( <p className="m-0">RP ≥ 40%: o agressor entra em <strong className="text-accent-danger uppercase">Death Zone</strong>. Qualquer aposta expõe equity suficiente para ser explorada com fold elevado pelo defensor.</p> ) }
              { rp >= 25 && rp < 40 && ( <p className="m-0">RP ≥ 25%: <strong className="text-accent-amber uppercase">Predator Zone</strong>. Agressor tem pressão significativa de ICM — range de 3-bet linear colapsa.</p> ) }
              { rp >= 15 && rp < 25 && ( <p className="m-0">RP 15–25%: <strong className="text-accent-danger/80 uppercase">Zona de Pressão</strong>. Ambos têm equity ICM a proteger. Frequências Nash ajustadas para baixo.</p> ) }
              { rp < 15 && ( <p className="m-0">RP { '<' } 15%: <strong className="text-accent-emerald uppercase">Zona Normal</strong>. Pressão ICM baixa — frequências próximas ao GTO chipEV.</p> ) }
            </div>
          ) }

          { ( agressor || defensor ) && (
            <button onClick={ () => { setAgressor( null ); setDefensor( null ); } } className="py-2.5 px-4 rounded-xl border border-white/10 bg-black/40 text-text-darker text-[0.65rem] font-black uppercase tracking-widest cursor-pointer transition-all hover:text-text-muted hover:bg-white/5 active:scale-95">↺ Reset Matchup</button>
          ) }
        </div>
      </div>

      <div className="pt-10 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-text-darker" />
            <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">Matriz de Interação Fractal · RP (Agressor × Defensor)</p>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="border-separate border-spacing-1 font-mono tabular-nums text-[0.65rem] w-full">
            <thead>
              <tr>
                <th className="text-left text-text-darker font-black py-2 px-2 text-[0.6rem] w-14 uppercase tracking-tighter border-b border-white/5">A \ D</th>
                { env.stacks.map( p => ( <th key={ p.id } className={`text-center py-2 px-1 text-[0.6rem] whitespace-nowrap min-w-10 uppercase border-b border-white/5 ${defensor === p.id ? 'text-accent-danger font-black' : 'text-text-darker font-bold'}`}>{ p.pos.split( ' ' )[ 0 ] }</th> ) ) }
              </tr>
            </thead>
            <tbody className="before:block before:h-2">
              { env.stacks.map( rowPlayer => (
                <tr key={ rowPlayer.id }>
                  <td className={`py-1 pr-3 pl-2 text-[0.6rem] whitespace-nowrap border-r border-white/5 uppercase ${agressor === rowPlayer.id ? 'font-black text-accent-indigo' : 'font-bold text-text-darker'}`}>{ rowPlayer.pos.split( ' ' )[ 0 ] }</td>
                  { env.stacks.map( colPlayer => {
                    const val = env.rpMatrix[ rowPlayer.id ]?.[ colPlayer.id ] ?? 0;
                    const isDiag = rowPlayer.id === colPlayer.id;
                    const isHighlighted = rowPlayer.id === agressor && colPlayer.id === defensor;
                    const { bg, color } = getRpCellStyle( val, isDiag, isHighlighted );
                    return (
                      <td key={ colPlayer.id } onClick={ () => { if ( !isDiag ) { setAgressor( rowPlayer.id ); setDefensor( colPlayer.id ); } } } className={`text-center py-1 px-0.5 rounded transition-all ${bg} ${color} ${isHighlighted ? 'font-black outline-2 outline-indigo-500 -outline-offset-1' : 'font-bold'} ${isDiag ? 'cursor-default text-transparent' : 'cursor-pointer'}`}>
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

      <div>
        <p className="text-[0.58rem] font-extrabold text-slate-400 uppercase tracking-widest m-0 mb-2.5">Estrutura de Premiação — Referência $10k</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-1.5">
          { PAYOUTS_10K.map( ( p, i ) => (
            <div key={ p.pos } className={`py-2 px-3 rounded-lg flex justify-between items-center gap-2 border ${i < 3 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900/40 border-white/5'}`}>
              <span className={`text-[0.62rem] font-bold ${i < 3 ? 'text-indigo-400' : 'text-slate-500'}`}>{ p.pos }</span>
              <span className={`font-mono tabular-nums text-[0.62rem] font-black ${i < 3 ? 'text-indigo-400' : 'text-slate-400'}`}>{ p.val }</span>
            </div>
          ) ) }
        </div>
      </div>

    </div>
  );
}
