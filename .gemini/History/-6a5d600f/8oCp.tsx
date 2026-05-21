'use client';
/**
 * IDENTITY: Referencial Visual — Âncora Empírica Aula 1.2
 * PATH: src/components/simulator/ReferencialAula12.tsx
 * ROLE: Seção colapsável com representação visual dos dados de calibração do motor ICM.
 */

import { useMemo, useState, useCallback } from 'react';
import { ClientOnly } from '@/components/ui/ClientOnly';
import { BB_FREQS, BF_MATRIX, BF_PLAYERS, BF_STACKS, BTN_FREQS, BUBBLE_BF_MATRIX, BUBBLE_PLAYERS, BUBBLE_RP_MATRIX, BUBBLE_STACKS, EG_BF_MATRIX, EG_PLAYERS, EG_RP_MATRIX, EG_STACKS, PRIZES, RANKS, RP_MATRIX, TABLE_PLAYERS, TOTAL_POOL } from './ReferencialData';
import { useGemmaStream } from './useGemmaStream';

export type MatrixViewMode = 'FT' | 'BUBBLE' | 'EG';

function renderFreqLabel ( freq: number, label: string ): string
{
  if ( freq === 0 ) return '';
  if ( freq === 100 ) return label;
  return `${ freq }%`;
}

function getAccentColor ( name: string ): string
{
  if ( name === 'BTN' ) return 'var(--accent-indigo-light)';
  if ( name === 'BB' ) return 'var(--accent-emerald-light)';
  return 'var(--text-darker)';
}

function getBarBgClass ( i: number ): string
{
  if ( i === 0 ) return 'bg-linear-to-r from-amber-400 to-amber-600';
  if ( i === 1 ) return 'bg-linear-to-r from-slate-200 to-slate-400';
  if ( i === 2 ) return 'bg-linear-to-r from-violet-400 to-violet-600';
  if ( i <= 5 ) return 'bg-indigo-500/50';
  return 'bg-slate-600/40';
}

function getValColorClass ( i: number ): string
{
  if ( i === 0 ) return 'text-amber-400';
  if ( i === 1 ) return 'text-slate-400';
  if ( i === 2 ) return 'text-violet-400';
  return 'text-text-dim';
}

function getDeltaStr ( delta: number ): string
{
  if ( delta === 0 ) return '0';
  if ( delta > 0 ) return `+${ delta }`;
  return `${ delta }`;
}

function getHandLabel ( r: number, c: number ): string
{
  if ( r === c ) return RANKS[ r ] + RANKS[ r ];
  if ( r < c ) return RANKS[ r ] + RANKS[ c ] + 's';
  return RANKS[ c ] + RANKS[ r ] + 'o';
}

function cellBgClass ( freq: number, color: 'indigo' | 'emerald' ): string
{
  if ( freq === 0 ) return 'bg-slate-900/60';
  if ( color === 'indigo' )
  {
    if ( freq === 100 ) return 'bg-indigo-500/55';
    if ( freq >= 50 ) return 'bg-indigo-500/30';
    return 'bg-indigo-500/10';
  }
  if ( freq === 100 ) return 'bg-emerald-500/40';
  if ( freq >= 50 ) return 'bg-emerald-500/20';
  return 'bg-emerald-500/10';
}

function cellTextClass ( freq: number ): string
{
  return freq === 0 ? 'text-transparent' : 'text-text-light';
}

function TableDrawPositions ( { cx, cy }: Readonly<{ cx: number, cy: number; }> )
{
  const r = 14;
  const iRx = 95; const iRy = 65;
  // Ângulos sincronizados com TABLE_PLAYERS em ReferencialData.ts
  const btnX = cx + iRx * Math.cos( toRad( 90 ) );
  const btnY = cy + iRy * Math.sin( toRad( 90 ) );
  const sbX = cx + iRx * Math.cos( toRad( 130 ) );
  const sbY = cy + iRy * Math.sin( toRad( 130 ) );
  const bbX = cx + iRx * Math.cos( toRad( 170 ) );
  const bbY = cy + iRy * Math.sin( toRad( 170 ) );

  return (
    <>
      {/* SB Folds */}
      <circle cx={ sbX } cy={ sbY } r={ r } fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <text x={ sbX } y={ sbY + 4.5 } textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="8.5" fontWeight="900" letterSpacing="0.05em">FOLD</text>

      {/* BB Defends (2bb) */}
      <circle cx={ bbX } cy={ bbY } r={ r } fill="rgba(16,185,129,0.5)" stroke="var(--accent-emerald)" strokeWidth="1" />
      <circle cx={ bbX + 12 } cy={ bbY } r={ r } fill="rgba(16,185,129,0.9)" stroke="var(--accent-emerald)" strokeWidth="1.5" filter="drop-shadow(0px 0px 4px rgba(16,185,129,0.4))" />
      <text x={ bbX + 6 } y={ bbY + 4.5 } textAnchor="middle" fill="white" fontSize="11" fontWeight="900">2.0</text>

      {/* Ante */}
      <circle cx={ cx } cy={ cy + 22 } r={ 11 } fill="rgba(100,116,139,0.6)" stroke="var(--text-muted)" strokeWidth="1" />
      <text x={ cx } y={ cy + 25 } textAnchor="middle" fill="white" fontSize="7.5" fontWeight="900" letterSpacing="0.05em">ANTE</text>

      {/* BTN Opens (2bb) */}
      <circle cx={ btnX } cy={ btnY } r={ r } fill="rgba(99,102,241,0.5)" stroke="var(--accent-indigo)" strokeWidth="1" />
      <circle cx={ btnX + 12 } cy={ btnY } r={ r } fill="rgba(99,102,241,0.9)" stroke="var(--accent-indigo)" strokeWidth="1.5" filter="drop-shadow(0px 0px 4px rgba(99,102,241,0.4))" />
      <text x={ btnX + 6 } y={ btnY + 4.5 } textAnchor="middle" fill="white" fontSize="11" fontWeight="900">2.0</text>
    </>
  );
}

// Sub-componente para os jogadores sentados
function SeatedPlayers({ cx, cy, rx, ry }: Readonly<{ cx: number, cy: number, rx: number, ry: number }>) {
  return (
    <>
      { TABLE_PLAYERS.map( ( { name, stack, angle, highlight } ) =>
      {
        const rad = toRad( angle );
        // Jogadores ficam ATRÁS das fichas (raio maior)
        const px = cx + ( rx + 45 ) * Math.cos( rad );
        const py = cy + ( ry + 35 ) * Math.sin( rad );
        const accent = getAccentColor( name );
        const isSB = name === 'SB';

        return (
          <g key={ name } className={isSB ? 'opacity-40' : 'opacity-100'}>
            <rect x={ px - 32 } y={ py - 18 } width={ 64 } height={ 36 } rx={ 10 }
              fill={ highlight ? 'rgba(99,102,241,0.25)' : 'rgba(15,23,42,0.85)' }
              stroke={ highlight ? 'var(--accent-indigo)' : accent + '44' }
              strokeWidth={highlight ? 2 : 1}
              className="backdrop-blur-sm" />
            <text x={ px } y={ py - 3 } textAnchor="middle" fill={ highlight ? 'white' : accent } fontSize="11" fontWeight="900" className="uppercase tracking-tighter">{ name }</text>
            <text x={ px } y={ py + 11 } textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontWeight="700" className="font-mono">{ stack }bb</text>
            { highlight && (
               <circle cx={px + 28} cy={py - 14} r={4} fill="var(--accent-indigo)" className="animate-pulse" />
            )}
          </g>
        );
      } ) }
    </>
  );
}

function OldRangeGrid ( { freqs, color, title, subtitle }: Readonly<{ freqs: number[][], color: 'indigo' | 'emerald', title: string, subtitle: string; }> )
{
  return (
    <div className="relative w-full max-w-[100vw] overflow-x-auto mx-auto">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[0.75rem] font-bold text-text-light">{ title }</span>
        <span className="text-[0.65rem] text-text-dim">{ subtitle }</span>
      </div>
      <table className="border-collapse text-[0.7rem] font-mono bg-slate-900/40 rounded-lg overflow-hidden min-w-max">
        <tbody>
          { RANKS.map( ( r1, i ) => (
            <tr key={ r1 }>
              { RANKS.map( ( r2, j ) =>
              {
                const freq = freqs[ i ]?.[ j ] ?? 0;
                return (
                  <td key={ r2 } className={`w-6 h-6 text-center align-middle cursor-default border border-white/5 ${cellBgClass( freq, color )} ${cellTextClass( freq )}`}>
                    { renderFreqLabel( freq, getHandLabel( i, j ) ) }
                  </td>
                );
              } ) }
            </tr>
          ) ) }
        </tbody>
      </table>
    </div>
  );
}

const PCT1 = ( ( PRIZES[ 0 ].val / TOTAL_POOL ) * 100 ).toFixed( 1 );

const PRIZE_STRUCTURES = [
  { tag: 'TOP-HEAVY', icon: '▲', colorClass: 'text-accent-gold', text: '1º ≥ 25% do prize pool total (field curto). 1º e 2º concentrados. Laddering pouco valioso. BF elevado.', active: false },
  { tag: 'FLAT', icon: '▬', colorClass: 'text-text-muted', text: `Esta estrutura: 1º = ${ PCT1 }% do pool total. Saltos entre posições equilibrados. Laddering relevante. BF próximo de 1.`, active: true },
  { tag: 'HÍBRIDA', icon: '◆', colorClass: 'text-accent-violet-light', text: 'Foge dos extremos (18-24%). Análise de exclusão: não é flat nem top-heavy de forma clara. Avalie se o laddering se aproxima mais de um extremo ou do outro.', active: false },
  { tag: 'PKO', icon: '💥', colorClass: 'text-accent-danger', text: 'Top-heavyssimo: dinheiro muito concentrado no 1º. Laddering muito menos valioso. A compensação vem pelo bounty acumulado.', active: false },
  { tag: 'SATÉLITE', icon: '🎫', colorClass: 'text-accent-emerald', text: 'Prêmios idênticos no topo (tickets de entrada). Sobrevivência pura: acumular fichas além do necessário tem EV zero.', active: false },
];

const TOY_GAMES_LIST = [
  { no: 'TG0', rpIp: 0, rpOop: 0, bluff: '33%', def: '50%', desc: 'Baseline GTO — ChipEV puro', anchor: false },
  { no: 'TG1', rpIp: 3, rpOop: 6, bluff: '↑ 40%', def: '↓ 44%', desc: 'OOP restrito — IP explora', anchor: false },
  { no: 'TG2', rpIp: 3, rpOop: 9, bluff: '↑ 50%', def: '⊘ teto', desc: 'OOP congela no limite do RP', anchor: false },
  { no: 'TG3', rpIp: 3, rpOop: 18, bluff: '↑↑', def: '⊘ teto', desc: 'IP satura bluffs; OOP imobilizado', anchor: false },
  { no: 'TG4', rpIp: 3, rpOop: 24, bluff: '⊘ max', def: '⊘ teto', desc: 'Ambos saturam — pressão extrema', anchor: false },
  { no: 'TG5', rpIp: 9, rpOop: 3, bluff: '~33%', def: '↓ 43%', desc: 'IP preserva; OOP cede levemente', anchor: false },
  { no: 'TG6', rpIp: 18, rpOop: 3, bluff: '↓ 17%', def: '↓↓', desc: 'IP contém bluffs ativamente', anchor: false },
  { no: 'TG7', rpIp: 21, rpOop: 3, bluff: '↓ 13%', def: '↓ 20%', desc: 'OOP 80% fold — âncora KJT-2-3', anchor: true },
];

function getBfTextColorClass(val: number): string {
  if (val >= 2) return 'text-rose-400';
  if (val >= 1.6) return 'text-amber-400';
  if (val >= 1.3) return 'text-cyan-400';
  if (val === 1) return 'text-text-muted opacity-50'; // Diagonal baseline (ChipEV)
  return 'text-green-400';
}

function getBfBgClass(val: number): string {
  if (val >= 2) return 'bg-rose-500/50';
  if (val >= 1.6) return 'bg-amber-500/40';
  if (val >= 1.3) return 'bg-cyan-500/20';
  if (val === 1) return 'bg-slate-900/30';
  return 'bg-green-500/20';
}

function getDeltaColorClass(delta: number): string {
  if (delta > 0) return 'text-rose-500';
  if (delta < 0) return 'text-emerald-400';
  return 'text-text-darker';
}

function getBluffColorClass(bluff: string): string {
  if (bluff.startsWith('↑')) return 'text-emerald-400';
  if (bluff.startsWith('↓')) return 'text-amber-500';
  if (bluff.startsWith('⊘')) return 'text-indigo-400';
  return 'text-text-muted';
}

function getDefColorClass(def: string): string {
  if (def.startsWith('↓')) return 'text-amber-500';
  if (def.startsWith('⊘')) return 'text-rose-500';
  return 'text-text-muted';
}

function ToyGameRow({ row, i }: Readonly<{ row: typeof TOY_GAMES_LIST[0], i: number }>) {
  const delta = row.rpIp - row.rpOop;
  const deltaStr = getDeltaStr( delta );
  const deltaColorClass = getDeltaColorClass(delta);
  const bluffColorClass = getBluffColorClass(row.bluff);
  const defColorClass = getDefColorClass(row.def);

  let rowBgClass = 'bg-white/5';
  if (row.anchor) rowBgClass = 'bg-indigo-500/5';
  else if (i % 2 === 0) rowBgClass = 'bg-transparent';

  let rowBorderClass = 'border-l-[3px] border-l-transparent border-b border-white/5';
  if (row.anchor) rowBorderClass = 'border-l-[3px] border-l-indigo-500/50 border-b border-white/5';

  return (
    <tr className={`${rowBgClass} ${rowBorderClass}`}>
      <td className={`py-3 px-4 font-bold whitespace-nowrap font-mono text-[0.9rem] ${row.anchor ? 'text-indigo-400' : 'text-text-muted'}`}>
        { row.no }{ row.anchor && <span className="text-indigo-400 ml-1.5">★</span> }
      </td>
      <td className="py-3 px-4 text-right text-indigo-400 font-bold whitespace-nowrap text-[0.9rem]">{ row.rpIp }%</td>
      <td className="py-3 px-4 text-right text-rose-500 font-bold whitespace-nowrap text-[0.9rem]">{ row.rpOop }%</td>
      <td className={`py-3 px-4 text-right font-extrabold whitespace-nowrap font-mono text-[0.95rem] ${deltaColorClass}`}>{ deltaStr }</td>
      <td className={`py-3 px-4 text-right font-bold whitespace-nowrap text-[0.9rem] ${bluffColorClass}`}>{ row.bluff }</td>
      <td className={`py-3 px-4 text-right font-bold whitespace-nowrap text-[0.9rem] ${defColorClass}`}>{ row.def }</td>
      <td className={`py-3 px-4 font-normal text-[0.9rem] ${row.anchor ? 'text-indigo-300' : 'text-text-muted'}`}>{ row.desc }</td>
    </tr>
  );
}

function BfMatrixRow({ row, r, mPlayers, mStacks, mRp, activeBtnIdx, activeBbIdx }: Readonly<{ row: number[], r: number, mPlayers: string[], mStacks: number[], mRp: number[][], activeBtnIdx: number, activeBbIdx: number }>) {
  return (
    <tr>
      <td className="py-2 px-2.5 text-text-muted font-bold text-[0.9rem] whitespace-nowrap border-r border-white/5">
        { mPlayers[ r ] }<br /><span className="text-text-dim font-medium text-[0.85rem]">{ mStacks[ r ] }</span>
      </td>
      { row.map( ( val: number, c: number ) => {
        const rp = mRp[ r ][ c ];
        const textColorClass = getBfTextColorClass(val);
        const bgClass = getBfBgClass(val);
                const isHighlight = r === activeBbIdx && c === activeBtnIdx;
                const borderClass = isHighlight ? 'border-2 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)] z-10 relative' : 'border border-white/5';
        return (
                  <td key={ mPlayers[ c ] } className={`py-2.5 px-2 text-center min-w-17.5 ${borderClass} leading-snug align-middle ${bgClass}`}>
                    { val === 1 ? <div className="text-text-dim text-[0.8rem] font-bold">1.00</div> : (
              <>
                <div className={`${textColorClass} ${val >= 1.6 ? 'font-extrabold' : 'font-bold'} text-[0.95rem]`}>{ val.toFixed( 2 ) }</div>
                <div className={`${textColorClass} text-[0.85rem] font-semibold mt-1.5 border-t border-white/5 pt-1`}>{ rp }%</div>
              </>
            ) }
          </td>
        );
      } ) }
    </tr>
  );
}

function toRad ( deg: number ) { return ( deg * Math.PI ) / 180; }

function BoardAndTableLeft({ rpBtn, rpBb }: Readonly<{ rpBtn: number, rpBb: number }>) {
  const W = 500; const H = 340;
  const rx = 170; const ry = 100;
  const cx = W / 2; const cy = H / 2;

  return (
    <div className="flex flex-col gap-6">
      {/* Board */}
      <div>
        <p className="m-0 mb-3 text-[0.95rem] font-bold text-text-muted uppercase tracking-[0.08em]">Board</p>
        <div className="flex gap-2">
          { [
            { rank: 'K', suit: '♦', colorClass: 'text-sky-400', borderClass: 'border-sky-400/30' },
            { rank: 'J', suit: '♣', colorClass: 'text-emerald-400', borderClass: 'border-emerald-400/30' },
            { rank: 'T', suit: '♠', colorClass: 'text-text-light', borderClass: 'border-white/30' },
            { rank: '2', suit: '♦', colorClass: 'text-sky-400', borderClass: 'border-sky-400/30' },
            { rank: '3', suit: '♦', colorClass: 'text-sky-400', borderClass: 'border-sky-400/30' },
          ].map( ( { rank, suit, colorClass, borderClass } ) => (
            <div key={ rank + suit } className={`w-16 h-22 rounded-lg bg-slate-900/90 border ${borderClass} flex flex-col items-center justify-center gap-1`}>
              <span className={`text-[1.6rem] font-black leading-none ${colorClass}`}>{ rank }</span>
              <span className={`text-[1.4rem] leading-none ${colorClass}`}>{ suit }</span>
            </div>
          ) ) }
        </div>
      </div>

      {/* Mesa oval */}
      <div>
        <p className="m-0 mb-3 text-[0.95rem] font-bold text-text-muted uppercase tracking-[0.08em]">Table Draw — Final Table 9P</p>
        <svg viewBox={ `0 0 ${ W } ${ H }` } className="block w-full max-w-125 mx-auto">
          <ellipse cx={ cx } cy={ cy } rx={ rx } ry={ ry } fill="rgba(22,101,52,0.35)" stroke="rgba(34,197,94,0.2)" strokeWidth="2" />
          <ellipse cx={ cx } cy={ cy } rx={ rx - 14 } ry={ ry - 12 } fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1" />
          <text x={ cx } y={ cy - 40 } textAnchor="middle" fill="var(--text-muted)" fontSize="15" fontWeight="600">Pot: 5.63bb</text>
          <SeatedPlayers cx={cx} cy={cy} rx={rx} ry={ry} />
          <TableDrawPositions cx={ cx } cy={ cy } />
        </svg>
        <div className="flex gap-x-6 gap-y-2.5 flex-wrap mt-4">
          { ( [
            { id: 'SB', colorClass: 'bg-amber-500', textClass: 'text-amber-500', text: '0.5bb · obrig.' },
            { id: 'BB', colorClass: 'bg-emerald-500', textClass: 'text-emerald-500', text: '1bb · obrig.' },
            { id: 'ANTE', colorClass: 'bg-slate-400', textClass: 'text-slate-400', text: '1.125bb · dead' },
            { id: 'BTN', colorClass: 'bg-indigo-400', textClass: 'text-indigo-400', text: '2bb · open' },
          ] as const ).map( ( { id, colorClass, textClass, text } ) => (
            <div key={ id } className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${colorClass}`} />
              <span className={`text-[0.85rem] font-bold ${textClass}`}>{ id }</span>
              <span className="text-[0.85rem] text-text-dim">{ text }</span>
            </div>
          ) ) }
        </div>
      </div>

      {/* Insight de Risk Advantage */}
      <div className="py-5 px-6 bg-slate-900/40 rounded-lg border-l-[3px] border-emerald-500/50">
        <p className="m-0 text-[0.95rem] text-text-muted leading-relaxed">
          Ambos os RPs são bem significativos. O <strong className="text-text-bright">Risk Advantage</strong> (subtração entre ambos os RPs) para o BTN é <strong className={riskAdvantage > 0 ? "text-accent-emerald" : "text-rose-400"}>
            {riskAdvantage > 0 ? '+' : ''}{riskAdvantage.toFixed(1)}%
          </strong>. Essa é a métrica da proporção do quanto ele pode ser agressivo vs o BB de forma geral.
        </p>
      </div>

      {/* Insight de RIO e EV_Fold (Perspectiva Matemática SOTA) */}
      <div className="py-5 px-6 bg-slate-900/40 rounded-lg border-l-[3px] border-rose-400">
        <p className="m-0 text-[0.95rem] text-text-muted leading-relaxed">
          <strong className="text-rose-400">Perspectiva Matemática (RIO):</strong> O EV do fold <strong>NUNCA</strong> é 0. As pot odds geram pseudo-densidade que mascara o <strong className="text-text-bright">Passivo Estrutural</strong> das Reverse Implied Odds. Em cenários multiway, as RIO crescem exponencialmente (<span className="font-mono">x²</span>), tornando o call uma armadilha fatal de valuation.
        </p>
      </div>

      {/* Insight de Lucro Real (PMev) */}
      <div className="py-5 px-6 bg-slate-900/40 rounded-lg border-l-[3px] border-amber-400">
        <p className="m-0 text-[0.95rem] text-text-muted leading-relaxed">
          <strong className="text-amber-400">PMev — A Ilusão do Min-Cash:</strong> O investimento inicial é negativo (-$11). O prêmio da bolha (23º lugar) é $16.76. O <strong>Ganho Real</strong> é apenas <strong className="text-text-bright">$5.76</strong>. A bolha é a ponte para zerar o prejuízo, mas a partir do ITM, a relevância de um payjump é estritamente proporcional à diferença de Ganho Real. Payjumps marginais são negligenciados em favor da alavancagem para a cravada; payjumps gigantes redefinem a aversão ao risco.
        </p>
      </div>
    </div>
  );
}

function RiskAndPrizesRight({ rpBtn, rpBb, btnStack, bbStack }: Readonly<{ rpBtn: number, rpBb: number, btnStack: number, bbStack: number }>) {
  const riskAdvantage = rpBtn - rpBb;
  return (
    <div className="flex flex-col gap-6">
      {/* RP + Ranges pré-flop */}
      <div className="flex gap-12 flex-wrap items-start">
        <div className="min-w-60 max-w-85">
          <p className="m-0 mb-3 text-[0.95rem] font-bold text-text-muted uppercase tracking-[0.08em]">Risk Premium</p>
          <div className="flex flex-col gap-2">
            { [
              { label: `BTN (${btnStack}bb)`, rp: rpBtn, colorClass: 'text-indigo-400', bgClass: 'bg-indigo-400' },
              { label: `BB  (${bbStack}bb)`, rp: rpBb, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-400' },
            ].map( ( { label, rp, colorClass, bgClass } ) => {
              const widthProps = { style: { width: `${ ( rp / 30 ) * 100 }%` } };
              return (
                <div key={ label } className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-[0.85rem] text-text-dim w-22.5 shrink-0">{ label }</span>
                  <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${bgClass}`} {...widthProps} />
                  </div>
                  <span className={`text-[0.85rem] font-bold w-12 text-right ${colorClass}`}>{ rp }%</span>
                </div>
              );
            } ) }
            <p className="m-0 mt-2 text-[0.85rem] text-text-dim">
              Risk Advantage BTN <strong className={riskAdvantage > 0 ? "text-accent-emerald" : "text-rose-400"}>
                {riskAdvantage > 0 ? '+' : ''}{riskAdvantage.toFixed(1)}%
              </strong>
            </p>
          </div>
        </div>
        <div className="min-w-50">
          <p className="m-0 mb-3 text-[0.95rem] font-bold text-text-muted uppercase tracking-[0.08em]">Ranges pré-flop</p>
          <div className="text-[0.9rem] text-text-muted flex flex-col gap-1.5 leading-relaxed">
            <div><span className="text-indigo-400 font-bold">BTN</span> abre 33.6% · minirraise 2bb</div>
            <div className="text-[0.85rem] text-text-dim pl-2">fold 66.4%</div>
            <div className="mt-1.5"><span className="text-emerald-400 font-bold">BB</span> defende 82.9%</div>
            <div className="text-[0.85rem] text-text-dim pl-2">fold 17.1% · call 64.4% · 3bet 10.2% · shove 8.4%</div>
          </div>
        </div>
      </div>

      {/* Prêmios */}
      <div className="mt-2">
        <p className="m-0 mb-3 text-[0.95rem] font-bold text-text-muted uppercase tracking-[0.08em]">Estrutura de Prêmios — MTT $11 · 126 entradas</p>
        <div className="flex flex-col gap-1.5">
          { PRIZES.map( ( { pos, val }, i ) =>
          {
            const poolPct = ( val / TOTAL_POOL ) * 100;
            const barBgClass = getBarBgClass(i);
            const valColorClass = getValColorClass(i);
            const widthProps = { style: { width: `${ poolPct }%` } };
            return (
              <div key={ pos } className="flex items-center gap-2">
                <span className="text-[0.85rem] text-text-dim w-7 text-right shrink-0">{ pos }</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${barBgClass}`} {...widthProps} />
                </div>
                <div className="flex gap-2 items-baseline w-22.5 justify-end shrink-0">
                  <span className="text-[0.75rem] text-text-darker font-mono">{ poolPct.toFixed( 1 ) }%</span>
                  <span className={`text-[0.85rem] w-13 text-right ${valColorClass} ${i < 3 ? 'font-bold' : 'font-medium'}`}>${ val }</span>
                </div>
              </div>
            );
          } ) }
        </div>

        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          { PRIZE_STRUCTURES.map( ( { tag, icon, colorClass, text, active } ) => (
            <div key={ tag } className={`flex flex-col gap-1.5 py-3 px-3.5 rounded-lg border ${active ? 'bg-white/10 border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.1)]' : 'bg-white/5 border-white/10'} ${colorClass}`}>
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{ icon }</span>
                <span className="text-[0.85rem] font-extrabold uppercase tracking-wider">{ tag }</span>
                { active && <span className="ml-auto text-[0.75rem] font-bold uppercase tracking-widest opacity-90">↑ ref</span> }
              </div>
              <span className="text-[0.85rem] text-text-muted leading-relaxed">{ text }</span>
            </div>
          ) ) }
        </div>
      </div>
    </div>
  );
}

function RangesDuel({ rpBtn, rpBb }: Readonly<{ rpBtn: number, rpBb: number }>) {
  return (
    <div className="mt-4">
      <p className="m-0 mb-5 text-[1.05rem] font-bold text-text-muted uppercase tracking-[0.08em] text-center">
        Duelo de Ranges: BTN (Agressor) vs BB (Defensor)
      </p>
      <div className="flex flex-row flex-wrap justify-center gap-10 items-center pb-4">
        <div className="flex-none">
          <OldRangeGrid freqs={ BTN_FREQS } color="indigo" title={`BTN (RFI) · RP ${rpBtn}%`} subtitle="33.6% open" />
        </div>
        <div className="flex-none">
          <OldRangeGrid freqs={ BB_FREQS } color="emerald" title={`BB (Defesa) · RP ${rpBb}%`} subtitle="82.9% continue" />
        </div>
      </div>
    </div>
  );
}

function IcmRulers({ matrixView, setMatrixView, matrixData, activeBtnIdx, activeBbIdx }: Readonly<{ matrixView: MatrixViewMode, setMatrixView: (v: MatrixViewMode) => void, matrixData: { mPlayers: string[], mStacks: number[], mBf: number[][], mRp: number[][] }, activeBtnIdx: number, activeBbIdx: number }>) {
  const isFT = matrixView === 'FT';
  const isBubble = matrixView === 'BUBBLE';
  const isEG = matrixView === 'EG';
  const { mPlayers, mStacks, mBf, mRp } = matrixData;

  return (
    <div className="mt-6">
      {/* Título */}
      <div className="flex items-baseline justify-between flex-wrap gap-4 mb-5">
        <div className="flex items-baseline gap-4">
          <p className="m-0 text-[1.05rem] font-bold text-text-muted uppercase tracking-[0.08em]">Réguas do ICM:</p>
          <p className="m-0 text-[0.9rem] text-text-dim">Multiplicadores de Dor e Teto de Risco</p>
        </div>
        <div className="flex bg-slate-900/60 rounded-md p-1 border border-white/5">
          <button onClick={ () => setMatrixView( 'FT' ) } className={`px-3 py-1.5 text-[0.8rem] rounded border-none cursor-pointer transition-all duration-200 ${isFT ? 'font-extrabold text-text-light bg-indigo-500/20' : 'font-medium text-text-dim bg-transparent hover:text-white'}`}>FT (Aula 1.2)</button>
          <button onClick={ () => setMatrixView( 'BUBBLE' ) } className={`px-3 py-1.5 text-[0.8rem] rounded border-none cursor-pointer transition-all duration-200 ${isBubble ? 'font-extrabold text-text-light bg-amber-500/20' : 'font-medium text-text-dim bg-transparent hover:text-white'}`}>Bolha (26 Left)</button>
          <button onClick={ () => setMatrixView( 'EG' ) } className={`px-3 py-1.5 text-[0.8rem] rounded border-none cursor-pointer transition-all duration-200 ${isEG ? 'font-extrabold text-text-light bg-emerald-500/20' : 'font-medium text-text-dim bg-transparent hover:text-white'}`}>Early Game (3ª Mão)</button>
        </div>
      </div>

      {/* Legenda BF + RP */}
      <div className="flex flex-col gap-4 mb-6 py-6 px-7 bg-slate-900/50 rounded-lg border-l-[3px] border-amber-500/30">
        <div className="grid grid-cols-[minmax(40px,max-content)_1fr] gap-x-6 gap-y-4 items-center">
          <div className="contents">
            <span className="text-[0.9rem] font-extrabold text-text-light whitespace-nowrap text-right">BF</span>
            <span className="text-[0.9rem] text-text-muted leading-relaxed">
              Multiplicador ICM: quanto os pot odds crescem sob risco de eliminação. <span className="text-text-light font-mono text-[0.85rem]">BF = 1/(1−RP)</span>.
            </span>
          </div>
          <div className="contents">
            <span className="text-[0.9rem] font-extrabold text-text-light whitespace-nowrap text-right">RP</span>
            <span className="text-[0.9rem] text-text-muted leading-relaxed">
              Equity adicional (%) exigida acima dos pot odds para um call. Linha = Defensor · Coluna = Agressor.
            </span>
          </div>
        </div>
        {/* Escala de cor unificada — BF determina o nível; RP herda a mesma cor */}
        <div className="flex items-center gap-5 flex-wrap pt-4 border-t border-white/5">
          <span className="text-[0.85rem] font-bold text-text-dim uppercase tracking-[0.08em] whitespace-nowrap">Intensidade</span>
          <div className="flex gap-6 flex-wrap items-center">
            { [
              { bgClass: 'bg-rose-500/50', borderClass: 'border-rose-400', colorClass: 'text-rose-400', label: 'BF > 2.0', desc: 'crítico' },
              { bgClass: 'bg-amber-500/40', borderClass: 'border-amber-400', colorClass: 'text-amber-400', label: '1.6–2.0', desc: 'elevado' },
              { bgClass: 'bg-cyan-500/20', borderClass: 'border-cyan-400', colorClass: 'text-cyan-400', label: '1.3–1.6', desc: 'moderado' },
              { bgClass: 'bg-green-500/20', borderClass: 'border-green-400', colorClass: 'text-green-400', label: '< 1.3', desc: 'baixo' },
            ].map( ( { bgClass, borderClass, colorClass, label, desc } ) => (
              <div key={ label } className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm border shrink-0 inline-block ${bgClass} ${borderClass}`} />
                <span className={`text-[0.85rem] font-bold whitespace-nowrap font-mono ${colorClass}`}>{ label }</span>
                <span className="text-[0.85rem] text-text-dim whitespace-nowrap">{ desc }</span>
              </div>
            ) ) }
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-[0.85rem]">
          <thead>
            <tr>
                      <th className="py-2 px-2.5 text-left"></th>
              { mPlayers.map( ( p, i ) => (
                <th key={ p } className="py-2 px-2.5 text-text-muted font-bold text-[0.9rem] text-center whitespace-nowrap">
                          { p }<br/><span className="text-text-dim font-medium text-[0.85rem]">{ mStacks[ i ] }</span>
                </th>
              ) ) }
            </tr>
          </thead>
          <tbody>
            { mBf.map( ( row, r ) => (
              <BfMatrixRow key={ mPlayers[ r ] } row={row} r={r} mPlayers={mPlayers} mStacks={mStacks} mRp={mRp} activeBtnIdx={activeBtnIdx} activeBbIdx={activeBbIdx} />
            ) ) }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToyGamesFramework() {
  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-4 mb-5">
        <p className="m-0 text-[1.05rem] font-bold text-text-muted uppercase tracking-[0.08em]">Toy Games</p>
        <p className="m-0 text-[0.9rem] text-text-dim">Framework Teórico — ΔRP como eixo de distorção</p>
      </div>

      {/* Legenda conceitual */}
      <div className="grid grid-cols-[minmax(140px,max-content)_1fr] gap-x-6 gap-y-4 items-center mb-6 py-6 px-7 bg-slate-900/50 rounded-lg border-l-[3px] border-indigo-500/30">
        { [
          {
            term: 'Toy game',
            def: 'Modelo simplificado que isola o ΔRP para demonstrar seu efeito sobre frequências de equilíbrio. Lente didática de causa e efeito — não representa spots reais.',
          },
          {
            term: 'Baseline GTO (TG0)',
            def: 'Equilíbrio sem distorção ICM: RP = 0% para ambos. Bluff IP = 33% · Def OOP = 50% (MDF). Referência para medir todos os desvios.',
          },
          {
            term: 'ΔRP = IP_RP − OOP_RP',
            def: 'Eixo central. Positivo → IP mais constringido (bluffs menores, OOP defende mais). Negativo → IP com vantagem de agressão.',
          },
          {
            term: '⊘ teto / ⊘ max',
            def: 'Saturação: teto = defesa OOP congelada pelo RP. max = bluff IP no limite do BF. Além desses pontos qualquer ajuste é EV−.',
          },
          {
            term: 'RIO / EV_fold',
            def: 'Reverse Implied Odds e Valor de Desistência. EV_fold nunca é 0. RIO é a antimatéria das pot odds, escalonando via entropia logarítmica em potes Multiway.',
          },
        ].map( ( { term, def } ) => (
          <div key={ term } className="contents">
            <span className="text-[0.9rem] font-extrabold text-indigo-400 whitespace-nowrap text-right">{ term }</span>
            <span className="text-[0.9rem] text-text-muted leading-relaxed">{ def }</span>
          </div>
        ) ) }
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[0.9rem] text-text-light">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-3 px-4 text-left font-bold text-text-dim text-[0.85rem] uppercase tracking-[0.08em] whitespace-nowrap">Nó</th>
              <th className="py-3 px-4 text-right font-bold text-indigo-400 text-[0.85rem] uppercase tracking-[0.08em] whitespace-nowrap">RP IP</th>
              <th className="py-3 px-4 text-right font-bold text-rose-500 text-[0.85rem] uppercase tracking-[0.08em] whitespace-nowrap">RP OOP</th>
              <th className="py-3 px-4 text-right font-bold text-emerald-500 text-[0.85rem] uppercase tracking-[0.08em] whitespace-nowrap">ΔRP</th>
              <th className="py-3 px-4 text-right font-bold text-text-muted text-[0.85rem] uppercase tracking-[0.08em] whitespace-nowrap">Bluff IP</th>
              <th className="py-3 px-4 text-right font-bold text-text-muted text-[0.85rem] uppercase tracking-[0.08em] whitespace-nowrap">Def OOP</th>
              <th className="py-3 px-4 text-left font-bold text-text-dim text-[0.85rem] uppercase tracking-[0.08em]">Efeito</th>
            </tr>
          </thead>
          <tbody>
            { TOY_GAMES_LIST.map( ( row, i ) => <ToyGameRow key={row.no} row={row} i={i} /> ) }
          </tbody>
        </table>
      </div>
      {/* Glossário de Símbolos Refinado */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-6 gap-y-4 mt-6 pt-6 border-t border-white/5">
        { [
          { sym: '↑ / ↓', desc: 'Acima / abaixo do baseline GTO (33% bluff · 50% def)' },
          { sym: '↑↑ / ↓↓', desc: 'Desvio acentuado — dinâmica dominante' },
          { sym: '⊘ teto', desc: 'Defesa congelada pelo RP do OOP — fold sustentável' },
          { sym: '⊘ max', desc: 'Bluff IP saturado — limite imposto pelo BF' },
          { sym: 'ΔRP', desc: 'IP_RP − OOP_RP · Positivo = IP constringido' },
        ].map( ( { sym, desc } ) => (
          <div key={ sym } className="flex items-start gap-3">
            <span className="text-[0.8rem] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 py-0.5 px-2 rounded font-mono whitespace-nowrap mt-px">{ sym }</span>
            <span className="text-[0.85rem] text-text-muted leading-relaxed">{ desc }</span>
          </div>
        ) ) }
      </div>

      {/* Citações e Referências */}
      <div className="mt-8 py-5 px-6 bg-slate-900/40 rounded-lg border-l-[3px] border-slate-500/50 flex flex-col gap-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-indigo-400 text-[0.8rem]">★</span>
          <span className="text-[0.9rem] text-text-muted">
            <strong className="text-text-light font-semibold">Divergência Arquitetônica:</strong> HRC Pós-Flop (nosso cânone) considera o Bunching Effect total e a irradiação de TODAS as stacks, enquanto solvers isolados (GTO Wizard) operam com mais &quot;ruído&quot; e e-Nash menos estável.
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-indigo-400 text-[0.8rem]">★</span>
          <span className="text-[0.9rem] text-text-muted">
            <strong className="text-text-light font-semibold">Âncora empírica:</strong> 93 nodes HRC vs GTO Wizard, Raphael Vitoi 2024
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-indigo-400 text-[0.8rem]">★</span>
          <span className="text-[0.9rem] text-text-muted">
            <strong className="text-text-light font-semibold">Downward Drift:</strong> Dara O&apos;Kearney &amp; Barry Carter, <em>Endgame Poker Strategy: The ICM Book</em>, D&amp;B Publishing
          </span>
        </div>
      </div>
    </div>
  );
}

function EngineSotaPanel({ isStreaming, isPreparing, isCompleted, streamedText, error, handleAnaliseMotor, stopStream }: Readonly<{
  isStreaming: boolean;
  isPreparing: boolean;
  isCompleted: boolean;
  streamedText: string;
  error: string | null;
  handleAnaliseMotor: () => void;
  stopStream: () => void;
}>) {
  return (
    <div className="mt-8 pt-8 border-t border-white/5">
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleAnaliseMotor}
          disabled={isStreaming}
          className="btn-primary px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {isStreaming ? 'Calculando Trajetória...' : 'Disparar Motor SOTA'}
        </button>

        {isStreaming && (
          <button onClick={stopStream} className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors">
            Abortar
          </button>
        )}
      </div>

      {error && <div className="text-rose-500 font-mono text-sm p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">{error}</div>}

      {isPreparing && (
        <div className="flex flex-col gap-3 animate-pulse opacity-60 bg-black/20 p-6 rounded-xl border border-white/5">
          <div className="text-accent-indigo text-xs font-mono mb-2 flex items-center gap-3"><i className="fa-solid fa-microchip animate-spin-slow"/> QUANTIZANDO PERSPECTIVA MATEMÁTICA...</div>
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-5/6" />
        </div>
      )}

      {!isPreparing && (streamedText || isCompleted) && (
        <div className="font-mono text-[0.85rem] text-text-light leading-relaxed bg-black/40 p-6 rounded-xl border border-white/5 whitespace-pre-wrap">
          {streamedText}
          {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-accent-indigo animate-pulse" />}
        </div>
      )}
    </div>
  );
}

export default function ReferencialAula12 ()
{
  const [ matrixView, setMatrixView ] = useState<MatrixViewMode>( 'FT' );

  const { streamedText, isStreaming, isCompleted, error, generateAnalysis, stopStream } = useGemmaStream();
  const isPreparing = isStreaming && streamedText.length === 0;

  const matrixData = useMemo( () =>
  {
    switch ( matrixView )
    {
      case 'BUBBLE': return { mPlayers: BUBBLE_PLAYERS, mStacks: BUBBLE_STACKS, mBf: BUBBLE_BF_MATRIX, mRp: BUBBLE_RP_MATRIX };
      case 'EG': return { mPlayers: EG_PLAYERS, mStacks: EG_STACKS, mBf: EG_BF_MATRIX, mRp: EG_RP_MATRIX };
      default: return { mPlayers: BF_PLAYERS, mStacks: BF_STACKS, mBf: BF_MATRIX, mRp: RP_MATRIX };
    }
  }, [ matrixView ] );

  // Mapeamento Posicional SOTA: Translação dinâmica do Table Draw para a Matriz O(1)
  const btnStack = TABLE_PLAYERS.find(p => p.name === 'BTN')?.stack || 40;
  const bbStack = TABLE_PLAYERS.find(p => p.name === 'BB')?.stack || 55;

  const getClosestIndex = useCallback((stack: number, stacks: number[]) => {
      return stacks.reduce((closest, current, idx) => Math.abs(current - stack) < Math.abs(stacks[closest] - stack) ? idx : closest, 0);
  }, []);

  const activeBtnIdx = useMemo(() => getClosestIndex(btnStack, matrixData.mStacks), [matrixData.mStacks, btnStack, getClosestIndex]);
  const activeBbIdx = useMemo(() => getClosestIndex(bbStack, matrixData.mStacks), [matrixData.mStacks, bbStack, getClosestIndex]);

  const rpBb = matrixData.mRp[activeBbIdx]?.[activeBtnIdx] ?? 0;
  const rpBtn = matrixData.mRp[activeBtnIdx]?.[activeBbIdx] ?? 0;
  const bfBb = matrixData.mBf[activeBbIdx]?.[activeBtnIdx] ?? 1;
  const bfBtn = matrixData.mBf[activeBtnIdx]?.[activeBbIdx] ?? 1;

  const handleAnaliseMotor = useCallback(() => {
    const heroStack = matrixData.mStacks[activeBtnIdx];
    const villainStack = matrixData.mStacks[activeBbIdx];
    const prompt = `Cenário Estrutural: ${matrixView}\nBoard: K-J-T-2-3\nBTN (Agressor): ${heroStack}bb (RP: ${rpBtn}% / BF: ${bfBtn})\nBB (Defensor): ${villainStack}bb (RP: ${rpBb}% / BF: ${bfBb})\nAnalise este embate considerando a Assimetria de Risco e a Teoria Vitoi.`;
    generateAnalysis(prompt);
  }, [matrixView, matrixData, activeBtnIdx, activeBbIdx, rpBtn, bfBtn, rpBb, bfBb, generateAnalysis]);

  const riskAdvantage = rpBtn - rpBb;

  return (
    <div id="anchor-aula12" className="max-w-7xl mx-auto px-6">
      <details className="border-b border-white/5 group">
        <summary className="cursor-pointer list-none flex items-center gap-3 py-5 text-[1.05rem] text-text-dim font-semibold tracking-widest select-none outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo rounded-lg">
          <span className="text-[0.85rem] uppercase tracking-widest text-text-muted group-open:text-accent-indigo transition-colors">▶ Referencial</span>
          <span className="font-normal text-text-dim group-open:text-text-light transition-colors">
            — Âncora Empírica (Aula 1.2) · KJT-2-3 · BTN {rpBtn}% RP vs BB {rpBb}% RP
          </span>
        </summary>

        <div className="flex flex-col gap-12 pb-12 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-12 w-full">
            <BoardAndTableLeft rpBtn={rpBtn} rpBb={rpBb} />
            <RiskAndPrizesRight rpBtn={rpBtn} rpBb={rpBb} btnStack={btnStack} bbStack={bbStack} />
          </div>
          <RangesDuel rpBtn={rpBtn} rpBb={rpBb} />
          <IcmRulers matrixView={matrixView} setMatrixView={setMatrixView} matrixData={matrixData} activeBtnIdx={activeBtnIdx} activeBbIdx={activeBbIdx} />
          <ToyGamesFramework />
          <ClientOnly fallback={<div className="mt-8 pt-8 border-t border-white/5 animate-pulse"><div className="h-10 w-48 bg-white/5 rounded-lg mb-6"></div><div className="h-24 w-full bg-black/20 rounded-xl border border-white/5"></div></div>}>
            <EngineSotaPanel
              isStreaming={isStreaming}
              isPreparing={isPreparing}
              isCompleted={isCompleted}
              streamedText={streamedText}
              error={error}
              handleAnaliseMotor={handleAnaliseMotor}
              stopStream={stopStream}
            />
          </ClientOnly>
        </div>
      </details>
    </div>
  );
}
