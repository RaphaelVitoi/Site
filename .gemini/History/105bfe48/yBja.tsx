'use client';

/**
 * IDENTITY: Matchup Selector — Pressão de Risco por Confronto
 * PATH: src/components/simulator/panels/MatchupSelector.tsx
 * ROLE: Seleciona agressor e defensor em 3 ambientes de Mesa Final (FT1/FT2/FT3)
 *       e exibe o Risk Premium do confronto via ftEnvironments.ts.
 * BINDING: [engine/ftEnvironments.ts, simulator.module.css]
 */

import { useState } from 'react';
import { FT_ENVIRONMENTS, PAYOUTS_10K } from '../engine/ftEnvironments';

interface PlayerRowDisplay
{
  borderColor: string;
  bg: string;
  badgeBg: string;
  badgeText: string;
  nameColor: string;
  stackColor: string;
}

function buildPlayerRowDisplay ( isA: boolean, isD: boolean, playerId: string ): PlayerRowDisplay
{
  const state: PlayerRowDisplay = {
    borderColor: 'border-white/5',
    bg: 'bg-slate-800/25',
    badgeBg: 'bg-slate-900/80',
    badgeText: playerId.replace( 'p', '' ),
    nameColor: 'text-text-muted',
    stackColor: 'text-text-dim',
  };

  if ( isA )
  {
    state.borderColor = 'border-indigo-500/45';
    state.bg = 'bg-indigo-500/15';
    state.badgeBg = 'bg-indigo-900';
    state.badgeText = 'A';
    state.nameColor = 'text-indigo-400';
    state.stackColor = 'text-indigo-500';
  } else if ( isD )
  {
    state.borderColor = 'border-rose-500/45';
    state.bg = 'bg-rose-500/15';
    state.badgeBg = 'bg-rose-900';
    state.badgeText = 'D';
    state.nameColor = 'text-rose-400';
    state.stackColor = 'text-rose-500';
  }

  return state;
}

interface StackPlayer
{
  id: string;
  pos: string;
  bb: number;
}

function PlayerSelectButton ( {
  player,
  isA,
  isD,
  onClick,
}: Readonly<{
  player: StackPlayer;
  isA: boolean;
  isD: boolean;
  onClick: () => void;
}> )
{
  const display = buildPlayerRowDisplay( isA, isD, player.id );
  const badgeFg = isA || isD ? 'text-white' : 'text-slate-400';

  return (
    <button
      key={ player.id }
      onClick={ onClick }
      className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all w-full border ${display.bg} ${display.borderColor}`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded flex items-center justify-center text-[0.58rem] font-black shrink-0 font-mono border ${display.badgeBg} ${display.borderColor} ${badgeFg}`}>
          { display.badgeText }
        </div>
        <span className={`text-[0.75rem] font-bold leading-tight ${display.nameColor}`}>
          { player.pos }
        </span>
      </div>
      <span className={`font-mono tabular-nums text-[0.82rem] font-black ${display.stackColor}`}>
        { player.bb.toFixed( 1 ) }<span className="text-[0.58rem] font-semibold ml-0.5 opacity-50">bb</span>
      </span>
    </button>
  );
}

function classifyRp ( rp: number ): { label: string; color: string; badge: string; }
{
  if ( rp >= 40 ) return { label: 'Death Zone', color: 'text-accent-danger', badge: '☠' };
  if ( rp >= 25 ) return { label: 'Predator Zone', color: 'text-accent-amber', badge: '⚠' };
  if ( rp >= 15 ) return { label: 'Zona de Pressão', color: 'text-accent-rose', badge: '▲' };
  return { label: 'Zona Normal', color: 'text-accent-emerald', badge: '●' };
}

function getRpCellStyle ( val: number, isDiag: boolean, isHighlighted: boolean )
{
  if ( isDiag )
  {
    return { bg: 'bg-slate-900/20', color: 'text-transparent' };
  }
  if ( isHighlighted )
  {
    return { bg: 'bg-indigo-500/35', color: 'text-white' };
  }
  if ( val >= 40 ) return { bg: 'bg-rose-500/25', color: 'text-accent-danger' };
  if ( val >= 25 ) return { bg: 'bg-amber-500/20', color: 'text-accent-amber' };
  if ( val >= 15 ) return { bg: 'bg-rose-600/15', color: 'text-accent-danger' };
  if ( val > 0 ) return { bg: 'bg-emerald-500/10', color: 'text-accent-emerald' };
  return { bg: 'bg-slate-900/30', color: 'text-text-dim' };
}

export default function MatchupSelector ()
{
  const [ activeEnvId, setActiveEnvId ] = useState( 'FT1' );
  const [ agressor, setAgressor ] = useState<string | null>( null );
  const [ defensor, setDefensor ] = useState<string | null>( null );

  const env = FT_ENVIRONMENTS.find( e => e.id === activeEnvId ) ?? FT_ENVIRONMENTS[ 0 ];

  const handlePlayerClick = ( playerId: string ) =>
  {
    // Fluxo: clique 1 = agressor, clique 2 = defensor, clique 3 = reinicia
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
    <div className="glass-panel p-4 md:p-6">

      {/* Header */ }
      <div className="mb-6">
        <p className="text-[0.58rem] font-black text-indigo-400 uppercase tracking-widest mb-1">
          Matchup Selector · Mesa Final
        </p>
        <h2 className="text-[1.1rem] font-extrabold text-white mb-1 tracking-tight">
          Pressão de Risco por Confronto
        </h2>
        <p className="text-[0.78rem] text-slate-400 m-0 leading-relaxed">
          Escolha o ambiente de FT, clique no agressor e depois no defensor para ver o RP aplicado.
        </p>
      </div>

      {/* FT Environment Tabs */ }
      <div className="flex gap-2 mb-5 flex-wrap">
        { FT_ENVIRONMENTS.map( e =>
        {
          const isActive = activeEnvId === e.id;
          return (
            <button
              key={ e.id }
              onClick={ () => handleEnvChange( e.id ) }
              className={`py-2 px-4 rounded-xl border cursor-pointer transition-all text-left ${isActive ? 'border-indigo-500/50 bg-[#1e2245]' : 'border-white/5 bg-slate-900/50'}`}
            >
              <div className={`font-mono text-[0.65rem] font-black tracking-tight ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                { e.id }
              </div>
              <div className={`text-[0.6rem] mt-0.5 font-semibold ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                { e.title.replace( /^FT \d: /, '' ) }
              </div>
            </button>
          );
        } ) }
      </div>

      {/* Descrição do ambiente */ }
      <div className="py-2.5 px-4 bg-slate-800/30 rounded-xl border border-white/5 mb-7 text-[0.78rem] text-slate-400 italic leading-relaxed">
        { env.description }
      </div>

      {/* Grid principal: jogadores + resultado */ }
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,350px)_1fr] xl:grid-cols-[minmax(300px,400px)_1fr] gap-6 xl:gap-10 items-start mb-8">

        {/* Coluna de jogadores */ }
        <div>
          <p className="text-[0.58rem] font-extrabold text-slate-400 uppercase tracking-widest m-0 mb-2.5">
            1º clique <span className="text-indigo-400">Agressor</span> · 2º clique <span className="text-rose-400">Defensor</span>
          </p>
          <div className="flex flex-col gap-1.5">
            { env.stacks.map( player => (
              <PlayerSelectButton
                key={ player.id }
                player={ player }
                isA={ agressor === player.id }
                isD={ defensor === player.id }
                onClick={ () => handlePlayerClick( player.id ) }
              />
            ) ) }
          </div>
        </div>

        {/* Coluna de resultado */ }
        <div className="flex flex-col gap-3.5">

          {/* Display do RP */ }
          <div className={`p-6 rounded-2xl border text-center min-h-[155px] flex flex-col items-center justify-center transition-all duration-400 ${resultCardBgClass} ${resultCardBorderClass}`}>
            { rp === null ? (
              <>
                <div className="text-4xl opacity-15 mb-2 leading-none">⚔</div>
                <p className="text-[0.75rem] text-slate-600 m-0 italic">
                  { agressor ? 'Escolha o defensor' : 'Escolha o agressor' }
                </p>
              </>
            ) : (
              <>
                <div className={`font-mono tabular-nums text-[3.2rem] font-black leading-none tracking-tighter ${classification?.color}`}>
                  { rp.toFixed( 1 ) }<span className="text-[1.4rem] font-bold">%</span>
                </div>
                <div className="text-[0.58rem] text-slate-400 mt-1 mb-3 uppercase tracking-widest">
                  Risk Premium do Agressor
                </div>
                <div className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full border text-[0.62rem] font-extrabold uppercase tracking-widest bg-black/20 ${classification?.color} border-current/30`}>
                  { classification?.badge } { classification?.label }
                </div>
              </>
            ) }
          </div>

          {/* Resumo do matchup */ }
          { agressorData && (
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <div className={`flex justify-between items-center ${defensorData ? 'mb-1.5' : ''}`}>
                <span className="text-[0.62rem] text-indigo-400 font-bold">
                  Agressor: { agressorData.pos }
                </span>
                <span className="font-mono tabular-nums text-[0.65rem] text-indigo-400 font-black">
                  { agressorData.bb.toFixed( 1 ) } bb
                </span>
              </div>
              { defensorData && (
                <div className="flex justify-between items-center">
                  <span className="text-[0.62rem] text-rose-400 font-bold">
                    Defensor: { defensorData.pos }
                  </span>
                  <span className="font-mono tabular-nums text-[0.65rem] text-rose-400 font-black">
                    { defensorData.bb.toFixed( 1 ) } bb
                  </span>
                </div>
              ) }
            </div>
          ) }

          {/* Interpretação contextual */ }
          { rp !== null && (
            <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 text-[0.72rem] text-slate-400 leading-relaxed">
              { rp >= 40 && (
                <span>RP ≥ 40%: o agressor entra em <strong className="text-rose-500">Death Zone</strong>. Qualquer aposta
                  expõe equity suficiente para ser explorada com fold elevado pelo defensor. Defender deve ajustar para calls apertados.</span>
              ) }
              { rp >= 25 && rp < 40 && (
                <span>RP ≥ 25%: <strong className="text-amber-500">Predator Zone</strong>. Agressor tem pressão significativa de ICM
                  — range de 3-bet linear colapsa, defensor expande bluff-catching.</span>
              ) }
              { rp >= 15 && rp < 25 && (
                <span>RP 15–25%: <strong className="text-rose-400">Zona de Pressão</strong>. Ambos têm equity ICM a proteger.
                  Frequências Nash ajustadas para baixo; confronto possível com range seleto.</span>
              ) }
              { rp < 15 && (
                <span>RP { '<' } 15%: <strong className="text-emerald-500">Zona Normal</strong>. Pressão ICM baixa — frequências próximas ao GTO chipEV.
                  Confronto padrão sem distorção significativa.</span>
              ) }
            </div>
          ) }

          {/* Botão de reset */ }
          { ( agressor || defensor ) && (
            <button
              onClick={ () => { setAgressor( null ); setDefensor( null ); } }
              className="py-1.5 px-3 rounded-lg border border-white/5 bg-slate-800/30 text-slate-500 text-[0.62rem] font-semibold cursor-pointer transition-colors hover:text-slate-300"
            >
              ↺ Limpar seleção
            </button>
          ) }
        </div>
      </div>

      {/* Heatmap 9×9 */ }
      <div className="mb-8">
        <p className="text-[0.58rem] font-extrabold text-slate-400 uppercase tracking-widest m-0 mb-2.5">
          Matriz Completa RP · Agressor (linha) × Defensor (coluna)
        </p>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-[3px] font-mono tabular-nums text-[0.6rem] w-full">
            <thead>
              <tr>
                <th className="text-left text-slate-500 font-semibold py-1 px-1.5 text-[0.58rem] w-[52px]">
                  A \ D
                </th>
                { env.stacks.map( p => (
                  <th key={ p.id } className={`text-center py-1 px-0.5 text-[0.58rem] whitespace-nowrap min-w-[32px] ${defensor === p.id ? 'text-rose-500 font-black' : 'text-slate-500 font-bold'}`}>
                    { p.pos.split( ' ' )[ 0 ] }
                  </th>
                ) ) }
              </tr>
            </thead>
            <tbody>
              { env.stacks.map( rowPlayer => (
                <tr key={ rowPlayer.id }>
                  <td style={{
                    color: agressor === rowPlayer.id ? 'var(--accent-indigo-light)' : 'var(--text-dim)'
                  }} className={`py-0.5 pr-1.5 pl-1 text-[0.58rem] whitespace-nowrap ${agressor === rowPlayer.id ? 'font-black text-indigo-400' : 'font-bold text-slate-400'}`}>
                    { rowPlayer.pos.split( ' ' )[ 0 ] }
                  </td>
                  { env.stacks.map( colPlayer =>
                  {
                    const val = env.rpMatrix[ rowPlayer.id ]?.[ colPlayer.id ] ?? 0;
                    const isDiag = rowPlayer.id === colPlayer.id;
                    const isHighlighted = rowPlayer.id === agressor && colPlayer.id === defensor;
                    const { bg, color } = getRpCellStyle( val, isDiag, isHighlighted );

                    return (
                      <td
                        key={ colPlayer.id }
                        onClick={ () =>
                        {
                          if ( isDiag ) return;
                          setAgressor( rowPlayer.id );
                          setDefensor( colPlayer.id );
                        } }
                        className={`text-center py-1 px-0.5 rounded transition-all ${bg} ${color} ${isHighlighted ? 'font-black outline-2 outline-indigo-500 outline-offset-[-1px]' : 'font-bold'} ${isDiag ? 'cursor-default text-transparent' : 'cursor-pointer'}`}
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
        <p className="text-[0.58rem] text-slate-500 italic mt-2 leading-relaxed">
          Clique em qualquer célula para selecionar o matchup. Verde { '<' }15% · Rose 15–25% · Amarelo 25–40% · Vermelho ≥40% (Death Zone).
        </p>
      </div>

      {/* Estrutura de premiação */ }
      <div>
        <p className="text-[0.58rem] font-extrabold text-slate-400 uppercase tracking-widest m-0 mb-2.5">
          Estrutura de Premiação — Referência $10k
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-1.5">
          { PAYOUTS_10K.map( ( p, i ) => (
            <div key={ p.pos } className={`py-2 px-3 rounded-lg flex justify-between items-center gap-2 border ${i < 3 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900/40 border-white/5'}`}>
              <span className={`text-[0.62rem] font-bold ${i < 3 ? 'text-indigo-400' : 'text-slate-500'}`}>
                { p.pos }
              </span>
              <span className={`font-mono tabular-nums text-[0.62rem] font-black ${i < 3 ? 'text-indigo-400' : 'text-slate-400'}`}>
                { p.val }
              </span>
            </div>
          ) ) }
        </div>
      </div>

    </div>
  );
}
