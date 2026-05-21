'use client';

/**
 * IDENTITY: Matchup Selector — Pressão de Risco por Confronto (SOTA v4.1)
 * PATH: src/components/simulator/panels/MatchupSelector.tsx
 * ROLE: Seleciona agressor e defensor em 3 ambientes de Mesa Final (FT1/FT2/FT3)
 *       e exibe o Risk Premium do confronto via ftEnvironments.ts.
 * BINDING: [engine/ftEnvironments.ts, ui/MatchupPlayerButton.tsx, ui/QuantumCombatPanel.tsx]
 */

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { FT_ENVIRONMENTS, PAYOUTS_10K } from '../engine/ftEnvironments';
import styles from '../simulator.module.css';
import { MatchupPlayerButton } from '../ui/MatchupPlayerButton';

function classifyRp ( rp: number ): { label: string; colorClass: string; badge: string } {
  if ( rp >= 40 ) return { label: 'Death Zone', colorClass: 'text-rose-500 border-rose-500/50 bg-rose-500/10', badge: '☠' };
  if ( rp >= 25 ) return { label: 'Predator Zone', colorClass: 'text-amber-500 border-amber-500/50 bg-amber-500/10', badge: '⚠' };
  if ( rp >= 15 ) return { label: 'Zona de Pressão', colorClass: 'text-fuchsia-500 border-fuchsia-500/50 bg-fuchsia-500/10', badge: '▲' };
  return { label: 'Zona Normal', colorClass: 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10', badge: '●' };
}

function getRpCellClass ( val: number, isDiag: boolean, isHighlighted: boolean ) {
  if ( isDiag ) return 'bg-slate-900/40 text-transparent pointer-events-none';
  if ( isHighlighted ) return 'bg-indigo-500/40 text-white ring-2 ring-indigo-500 ring-inset font-black';
  if ( val >= 40 ) return 'bg-rose-500/25 text-rose-400 hover:bg-rose-500/40';
  if ( val >= 25 ) return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/35';
  if ( val >= 15 ) return 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/25';
  if ( val > 0 ) return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25';
  return 'bg-slate-900/30 text-slate-600';
}

function calcBF ( rp: number ): string {
  if ( rp >= 100 ) return '∞';
  if ( rp === 0 ) return '1.00';
  return ( 100 / ( 100 - rp ) ).toFixed( 2 );
}

function RpInterpretation ( { rp }: Readonly<{ rp: number | null }> ) {
  if ( rp === null ) return null;
  const bf = calcBF( rp );

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300 leading-relaxed shadow-inner">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <span className="font-bold uppercase tracking-widest text-slate-500 text-[10px]">Diagnóstico Sistêmico</span>
        <span className="font-mono font-black text-indigo-400">BF { bf }×</span>
      </div>

      { rp >= 40 && (
        <p className="m-0 font-medium italic">
          <span className="text-rose-500 font-black uppercase tracking-widest mr-2">Death Zone:</span>
          Insolvência iminente. O agressor exerce um <em>Leverage</em> fatal. O custo de um call mal-sucedido destrói a Perspectiva de título. O defensor é forçado a um overfold extremo, abandonando o MDF e defendendo estritamente o Teto do Risk Premium.
        </p>
      ) }
      { rp >= 25 && rp < 40 && (
        <p className="m-0 font-medium italic">
          <span className="text-amber-500 font-black uppercase tracking-widest mr-2">Predator Zone:</span>
          Pressão gravitacional severa. O range de 3-bet linear colapsa. O <em>Downward Drift</em> força a assimetria: o defensor expande a frequência de bluff-catching devido ao aprisionamento do pote (Sunk Cost), enquanto os ranges de shove se polarizam brutalmente.
        </p>
      ) }
      { rp >= 15 && rp < 25 && (
        <p className="m-0 font-medium italic">
          <span className="text-fuchsia-500 font-black uppercase tracking-widest mr-2">Zona de Pressão:</span>
          Ambos os jogadores possuem <em>Valuation</em> substancial a proteger. As frequências de Nash sofrem contração orgânica; a árvore de decisão é podada e os confrontos tendem a ser resolvidos pelo núcleo de valor (Premium Ranges).
        </p>
      ) }
      { rp < 15 && (
        <p className="m-0 font-medium italic">
          <span className="text-emerald-500 font-black uppercase tracking-widest mr-2">Zona Normal:</span>
          Pressão de ICM diluída. O ecossistema opera próximo à linha de base do ChipEV. O EV do fold retorna ao custo passivo dos blinds/antes, permitindo maior elasticidade sistêmica nos ranges de open e flat call.
        </p>
      ) }
    </div>
  );
}

export default function MatchupSelector () {
  const [ activeEnvId, setActiveEnvId ] = useState( 'FT1' );
  const [ agressor, setAgressor ] = useState<string | null>( null );
  const [ defensor, setDefensor ] = useState<string | null>( null );

  const env = FT_ENVIRONMENTS.find( e => e.id === activeEnvId )!;

  const handlePlayerClick = ( playerId: string ) => {
    if ( typeof agressor === 'string' && defensor === null )
    {
      if ( playerId === agressor )
      {
        setAgressor( null );
      } else
      {
        setDefensor( playerId );
      }
    } else
    {
      setAgressor( playerId );
      setDefensor( null );
    }
  };

  const rp = agressor && defensor ? ( env.rpMatrix[ agressor ]?.[ defensor ] ?? null ) : null;
  const classification = rp === null ? null : classifyRp( rp );

  const agressorData = agressor ? ( env.stacks.find( p => p.id === agressor ) ?? null ) : null;
  const defensorData = defensor ? ( env.stacks.find( p => p.id === defensor ) ?? null ) : null;

  return (
    <div className={ cn( styles.glassPanel, "p-5 sm:p-8 space-y-8 w-full max-w-full overflow-hidden" ) }>
      {/* Header Analítico */ }
      <div className="space-y-2">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Matriz de Colisão SOTA · Mesa Final</p>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Assimetria e Pressão de Risco</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Selecione a topologia da FT abaixo. O 1º clique instaura o <span className="text-indigo-400 font-bold">Agressor (Leverage)</span> e o 2º clique confina o <span className="text-rose-400 font-bold">Defensor (Passivo)</span> para quantificar a distorção gravitacional.
        </p>
      </div>

      {/* Tabs de Ambiente FT */ }
      <div className="flex flex-wrap gap-2">
        { FT_ENVIRONMENTS.map( e => {
          const isActive = activeEnvId === e.id;
          return (
            <button
              key={ e.id }
              onClick={ () => { setActiveEnvId( e.id ); setAgressor( null ); setDefensor( null ); } }
              className={ cn(
                "px-4 py-2.5 rounded-xl border transition-all duration-300 text-left min-w-25 flex-1 sm:flex-none",
                isActive
                  ? "bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "bg-slate-900/40 border-white/5 hover:border-white/10"
              ) }
            >
              <div className={ cn( "font-mono text-[10px] font-black", isActive ? "text-indigo-300" : "text-slate-500" ) }>{ e.id }</div>
              <div className={ cn( "text-[9px] font-bold mt-0.5", isActive ? "text-indigo-400" : "text-slate-600" ) }>{ e.title.replace( /^FT \d: /, '' ) }</div>
            </button>
          );
        } ) }
      </div>

      {/* Descrição do Ecossistema */ }
      <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 text-xs text-slate-400 italic leading-relaxed border-l-4 border-l-indigo-500/30 shadow-inner">
        { env.description }
      </div>

      {/* Main Simulation Stage */ }
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Coluna: Seleção de Topologia */ }
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-hand-pointer opacity-50"></i> Seleção de Confronto Direto
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            { env.stacks.map( player => (
              <MatchupPlayerButton
                key={ player.id }
                player={ player }
                isAgressor={ agressor === player.id }
                isDefensor={ defensor === player.id }
                onClick={ () => handlePlayerClick( player.id ) }
              />
            ) ) }
          </div>
        </div>

        {/* Coluna: Output Quântico */ }
        <div className="space-y-4">
          {/* Display Central de RP */ }
          <div className={ cn(
            "p-8 rounded-2xl border flex flex-col items-center justify-center text-center min-h-45 transition-all duration-500 shadow-2xl relative overflow-hidden group",
            rp === null ? "bg-slate-900/50 border-white/5" : cn( "bg-slate-900/80", classification?.colorClass.split( ' ' )[ 1 ] )
          ) }>
            { rp === null ? (
              <>
                <div className="text-4xl opacity-10 mb-3 group-hover:scale-110 transition-transform">⚔</div>
                <p className="text-xs text-slate-500 font-medium italic">
                  { agressor ? 'Escolha o defensor' : 'Escolha o agressor' }
                </p>
              </>
            ) : (
              <>
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                  <i className="fa-solid fa-gauge-high text-9xl"></i>
                </div>
                <div className={ cn( "font-mono tabular-nums text-5xl font-black tracking-tighter leading-none mb-1", classification?.colorClass.split( ' ' )[ 0 ] ) }>
                  { rp.toFixed( 1 ) }<span className="text-2xl font-bold ml-0.5">%</span>
                </div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Risk Premium Agressor</div>
                <div className={ cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-lg",
                  classification?.colorClass
                ) }>
                  <span>{ classification?.badge }</span>
                  <span>{ classification?.label }</span>
                </div>
              </>
            ) }
          </div>

          {/* Player Matchup Details */ }
          { agressorData && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 shadow-inner">
              <div className="flex justify-between items-center text-indigo-400">
                <span className="text-[10px] font-black uppercase">Agressor: { agressorData.pos }</span>
                <span className="font-mono text-xs font-black">{ agressorData.bb.toFixed( 1 ) } bb</span>
              </div>
              { defensorData && (
                <div className="flex justify-between items-center text-rose-400 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-black uppercase">Defensor: { defensorData.pos }</span>
                  <span className="font-mono text-xs font-black">{ defensorData.bb.toFixed( 1 ) } bb</span>
                </div>
              ) }
            </div>
          ) }

          <RpInterpretation rp={ rp } />

          { ( agressor || defensor ) && (
            <button
              onClick={ () => { setAgressor( null ); setDefensor( null ); } }
              className="w-full py-2.5 rounded-lg border border-white/5 bg-slate-800/30 text-slate-400 text-[10px] font-bold hover:text-white hover:bg-slate-800/60 hover:border-white/10 transition-all uppercase tracking-widest cursor-pointer"
            >
              <i className="fa-solid fa-rotate-left mr-2"></i> Limpar Seleção Analítica
            </button>
          ) }
        </div>
      </div>

      {/* Heatmap Topológico 9×9 */ }
      <div className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Matriz Completa RP · Agressor (L) × Defensor (C)</p>
          <div className="flex gap-3 text-[9px] font-bold uppercase tracking-tighter opacity-60">
            <span className="text-emerald-400 whitespace-nowrap">● Normal</span>
            <span className="text-rose-300 whitespace-nowrap">▲ Pressão</span>
            <span className="text-amber-400 whitespace-nowrap">⚠ Predator</span>
            <span className="text-rose-500 whitespace-nowrap">☠ Death</span>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar rounded-xl border border-white/5 bg-black/20 p-2 sm:p-4 shadow-inner w-full">
          <table className="w-full border-separate border-spacing-0.75 font-mono tabular-nums text-[10px]">
            <thead>
              <tr>
                <th className="text-left text-slate-700 font-bold p-1 w-12 text-[9px]">A \ D</th>
                { env.stacks.map( p => (
                  <th key={ p.id } className={ cn(
                    "text-center p-1 font-bold transition-colors min-w-9",
                    defensor === p.id ? "text-rose-400 scale-110" : "text-slate-600"
                  ) }>
                    { p.pos.split( ' ' )[ 0 ] }
                  </th>
                ) ) }
              </tr>
            </thead>
            <tbody>
              { env.stacks.map( rowPlayer => (
                <tr key={ rowPlayer.id }>
                  <td className={ cn(
                    "p-1 font-bold transition-colors whitespace-nowrap text-[9px]",
                    agressor === rowPlayer.id ? "text-indigo-400 scale-105" : "text-slate-600"
                  ) }>
                    { rowPlayer.pos.split( ' ' )[ 0 ] }
                  </td>
                  { env.stacks.map( colPlayer => {
                    const val = env.rpMatrix[ rowPlayer.id ]?.[ colPlayer.id ] ?? 0;
                    const isDiag = rowPlayer.id === colPlayer.id;
                    const isHighlighted = rowPlayer.id === agressor && colPlayer.id === defensor;

                    return (
                      <td
                        key={ colPlayer.id }
                        onClick={ () => { if ( !isDiag ) { setAgressor( rowPlayer.id ); setDefensor( colPlayer.id ); } } }
                        className={ cn(
                          "text-center py-2 rounded-md transition-all duration-200 cursor-pointer text-[10px] font-black border border-transparent",
                          getRpCellClass( val, isDiag, isHighlighted )
                        ) }
                      >
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

      {/* Estrutura de Valuation (Payouts) */ }
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-trophy opacity-50"></i> Estrutura de Valuation — Referência $10k
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2">
          { PAYOUTS_10K.map( ( p, i ) => (
            <div key={ p.pos } className={ cn(
              "p-3 rounded-xl border transition-all duration-300 group hover:scale-[1.02]",
              i < 3
                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.05)]"
                : "bg-slate-900/40 border-white/5"
            ) }>
              <div className={ cn( "text-[9px] font-black uppercase mb-1", i < 3 ? "text-indigo-300" : "text-slate-600" ) }>{ p.pos }</div>
              <div className={ cn( "font-mono text-xs font-black tracking-tight", i < 3 ? "text-white" : "text-slate-400" ) }>{ p.val }</div>
            </div>
          ) ) }
        </div>
      </div>
    </div>
  );
}
