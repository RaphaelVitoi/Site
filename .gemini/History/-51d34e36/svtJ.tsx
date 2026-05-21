/**
 * IDENTITY: Referencial Visual — Âncora Empírica Aula 1.2
 * PATH: src/components/simulator/ReferencialAula12.tsx
 * ROLE: Seção colapsável com representação visual dos dados de calibração do motor ICM.
 */

import { BB_FREQS, BF_MATRIX, BF_PLAYERS, BF_STACKS, BTN_FREQS, PRIZES, RANKS, RP_MATRIX, TABLE_PLAYERS, TOTAL_POOL } from './ReferencialData';
import styles from './simulator.module.css';

function renderFreqLabel ( freq: number, label: string ): string {
  if ( freq === 0 ) return '';
  if ( freq === 100 ) return label;
  return `${freq}%`;
}

function getAccentColor ( name: string ): string {
  if ( name === 'BTN' ) return 'var(--accent-indigo-light)';
  if ( name === 'BB' ) return 'var(--accent-emerald-light)';
  return 'var(--text-darker)';
}

function getBarBg ( i: number ): string {
  if ( i === 0 ) return 'linear-gradient(to right,var(--accent-gold),var(--accent-amber))';
  if ( i === 1 ) return 'linear-gradient(to right,var(--text-light),var(--text-muted))';
  if ( i === 2 ) return 'linear-gradient(to right,var(--accent-violet-light),var(--accent-violet-dark))';
  if ( i <= 5 ) return `rgba(99,102,241,${( 0.5 - i * 0.06 ).toFixed( 2 )})`;
  return `rgba(71,85,105,${( 0.42 - ( i - 6 ) * 0.08 ).toFixed( 2 )})`;
}

function getValColor ( i: number ): string {
  if ( i === 0 ) return 'var(--accent-gold)';
  if ( i === 1 ) return 'var(--text-muted)';
  if ( i === 2 ) return 'var(--accent-violet-light)';
  return 'var(--text-dim)';
}

function getBfTextColor ( val: number ): string {
  if ( val === 0 ) return 'transparent';
  if ( val >= 2 ) return 'var(--accent-danger-light)';
  if ( val >= 1.6 ) return 'var(--accent-amber-light)';
  if ( val >= 1.3 ) return 'var(--accent-cyan)';
  return 'var(--accent-green)';
}

function getDeltaStr ( delta: number ): string {
  if ( delta === 0 ) return '0';
  if ( delta > 0 ) return `+${delta}`;
  return `${delta}`;
}

function getDeltaColor ( delta: number ): string {
  if ( delta > 0 ) return 'var(--accent-red)';
  if ( delta < 0 ) return 'var(--accent-emerald-light)';
  return 'var(--text-darker)';
}

function getBluffColor ( bluff: string ): string {
  if ( bluff.startsWith( '↑' ) ) return 'var(--accent-emerald-light)';
  if ( bluff.startsWith( '↓' ) ) return 'var(--accent-amber)';
  if ( bluff.startsWith( '⊘' ) ) return 'var(--accent-indigo-light)';
  return 'var(--text-muted)';
}

function getDefColor ( def: string ): string {
  if ( def.startsWith( '↓' ) ) return 'var(--accent-amber)';
  if ( def.startsWith( '⊘' ) ) return 'var(--accent-red)';
  return 'var(--text-muted)';
}

function getHandLabel ( r: number, c: number ): string {
  if ( r === c ) return RANKS[ r ] + RANKS[ r ];
  if ( r < c ) return RANKS[ r ] + RANKS[ c ] + 's';
  return RANKS[ c ] + RANKS[ r ] + 'o';
}

function cellBg ( freq: number, color: 'indigo' | 'emerald' ): string {
  if ( freq === 0 ) return 'rgba(15,23,42,0.6)';
  if ( color === 'indigo' )
  {
    if ( freq === 100 ) return 'rgba(99,102,241,0.55)';
    if ( freq >= 50 ) return 'rgba(99,102,241,0.28)';
    return 'rgba(99,102,241,0.12)';
  }
  if ( freq === 100 ) return 'rgba(52,211,153,0.4)';
  if ( freq >= 50 ) return 'rgba(52,211,153,0.20)';
  return 'rgba(52,211,153,0.08)';
}

function cellText ( freq: number ): string {
  return freq === 0 ? 'var(--bg-panel)' : 'var(--text-light)';
}

function RangeGrid ( { freqs, color, title, pct }: Readonly<{
  freqs: number[][];
  color: 'indigo' | 'emerald';
  title: string;
  pct: string;
}> ) {
  const accentColor = color === 'indigo' ? 'var(--accent-indigo-light)' : 'var(--accent-emerald-light)';
  return (
    <div>
      <p style={ { margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' } }>
        { title } <span style={ { color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' } }>— { pct }</span>
      </p>
      <div style={ { overflowX: 'hidden' } }>
        <table style={ { borderCollapse: 'collapse', fontSize: '0.7rem' } }>
          <thead>
            <tr>
              <th style={ { width: '18px' } } />
              { RANKS.map( ( r: string ) => (
                <th key={ r } style={ { width: '32px', padding: '2px', textAlign: 'center', color: 'var(--text-darker)', fontWeight: 700 } }>{ r }</th>
              ) ) }
            </tr>
          </thead>
          <tbody>
            { RANKS.map( ( rowRank: string, r: number ) => (
              <tr key={ rowRank }>
                <td style={ { padding: '2px 4px 2px 0', color: 'var(--text-darker)', fontWeight: 700, textAlign: 'right' } }>{ rowRank }</td>
                { RANKS.map( ( _: string, c: number ) => {
                  const freq = freqs[ r ][ c ];
                  const label = getHandLabel( r, c );
                  const isPair = r === c;
                  return (
                    <td key={ label } title={ `${label}: ${freq}%` } style={ {
                      width: '32px',
                      height: '24px',
                      padding: '1px',
                      textAlign: 'center',
                      background: cellBg( freq, color ),
                      border: isPair ? `1px solid ${accentColor}66` : '1px solid rgba(255,255,255,0.03)',
                      color: cellText( freq ),
                      fontSize: '0.7rem',
                      lineHeight: 1,
                      fontWeight: isPair ? 700 : 400,
                    } }>
                      { renderFreqLabel( freq, label ) }
                    </td>
                  );
                } ) }
              </tr>
            ) ) }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function bfColor ( v: number ): string {
  if ( v === 0 ) return 'rgba(15,23,42,0.5)';
  if ( v >= 2 ) return 'rgba(239,68,68,0.55)';
  if ( v >= 1.6 ) return 'rgba(245,158,11,0.45)';
  if ( v >= 1.3 ) return 'rgba(6,182,212,0.22)';
  return 'rgba(34,197,94,0.2)';
}

function rpColor ( v: number ): string {
  if ( v === 0 ) return 'rgba(15,23,42,0.5)';
  if ( v >= 50 ) return 'rgba(239,68,68,0.55)';
  if ( v >= 35 ) return 'rgba(245,158,11,0.45)';
  if ( v >= 20 ) return 'rgba(245,158,11,0.25)';
  return 'rgba(34,197,94,0.2)';
}

function toRad ( deg: number ) { return ( deg * Math.PI ) / 180; }

export default function ReferencialAula12 () {
  const W = 500; const H = 340;
  const rx = 170; const ry = 100;
  const cx = W / 2; const cy = H / 2;

  return (
    <div id="anchor-aula12" style={ { maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' } }>
      <details style={ { borderBottom: '1px solid rgba(255,255,255,0.06)' } }>
        <summary style={ {
          cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center',
          gap: '0.75rem', padding: '1.2rem 0', fontSize: '1.05rem', color: 'var(--text-dim)',
          fontWeight: 600, letterSpacing: '0.04em', userSelect: 'none',
        } }>
          <span style={ { fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' } }>▶ Referencial</span>
          <span style={ { fontWeight: 400, color: 'var(--text-dim)' } }>— Âncora Empírica (Aula 1.2) · KJT-2-3 · BTN 21.4% RP vs BB 12.9% RP</span>
        </summary>

        <div style={ { display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '3rem', paddingTop: '1rem' } }>

          {/* Grid 2-col: Esquerda(Board+Mesa) | Direita(RP+Prêmios) */ }
          <div className={ styles.refGrid2Col }>

            {/* ESQUERDA — Board + Mesa */ }
            <div style={ { display: 'flex', flexDirection: 'column', gap: '1.5rem' } }>
              {/* Board */ }
              <div>
                <p style={ { margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Board</p>
                <div style={ { display: 'flex', gap: '8px' } }>
                  { [
                    { rank: 'K', suit: '♦', color: 'var(--accent-blue)' },
                    { rank: 'J', suit: '♣', color: 'var(--accent-emerald-light)' },
                    { rank: 'T', suit: '♠', color: 'var(--text-light)' },
                    { rank: '2', suit: '♦', color: 'var(--accent-blue)' },
                    { rank: '3', suit: '♦', color: 'var(--accent-blue)' },
                  ].map( ( { rank, suit, color } ) => (
                    <div key={ rank + suit } style={ {
                      width: '64px', height: '88px', borderRadius: '8px',
                      background: 'rgba(15,23,42,0.9)', border: `1px solid ${color}55`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    } }>
                      <span style={ { fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 } }>{ rank }</span>
                      <span style={ { fontSize: '1.4rem', color, lineHeight: 1 } }>{ suit }</span>
                    </div>
                  ) ) }
                </div>
              </div>

              {/* Mesa oval */ }
              <div>
                <p style={ { margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Table Draw — Final Table 9P</p>
                <svg viewBox={ `0 0 ${W} ${H}` } style={ { display: 'block', width: '100%', maxWidth: `${W}px`, margin: '0 auto' } }>
                  <ellipse cx={ cx } cy={ cy } rx={ rx } ry={ ry } fill="rgba(22,101,52,0.35)" stroke="rgba(34,197,94,0.2)" strokeWidth="2" />
                  <ellipse cx={ cx } cy={ cy } rx={ rx - 14 } ry={ ry - 12 } fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1" />
                  <text x={ cx } y={ cy - 40 } textAnchor="middle" fill="var(--text-muted)" fontSize="15" fontWeight="600">Pot: 5.63bb</text>
                  { ( () => {
                    const r = 12;
                    const iRx = 90; const iRy = 60;
                    const sbX = cx + iRx * Math.cos( toRad( -15 ) );
                    const sbY = cy + iRy * Math.sin( toRad( -15 ) );
                    const bbX = cx + iRx * Math.cos( toRad( 20 ) );
                    const bbY = cy + iRy * Math.sin( toRad( 20 ) );
                    const btnX = cx + iRx * Math.cos( toRad( -50 ) );
                    const btnY = cy + iRy * Math.sin( toRad( -50 ) );
                    return (
                      <>
                        <circle cx={ sbX } cy={ sbY } r={ r } fill="rgba(245,158,11,0.85)" stroke="var(--accent-amber)" strokeWidth="1.2" />
                        <text x={ sbX } y={ sbY + 4 } textAnchor="middle" fill="white" fontSize="10" fontWeight="900">0.5</text>
                        <circle cx={ bbX } cy={ bbY } r={ r } fill="rgba(16,185,129,0.8)" stroke="var(--accent-emerald)" strokeWidth="1.2" />
                        <text x={ bbX } y={ bbY + 4 } textAnchor="middle" fill="white" fontSize="10" fontWeight="900">1</text>
                        <circle cx={ cx } cy={ cy + 18 } r={ r } fill="rgba(100,116,139,0.8)" stroke="var(--text-muted)" strokeWidth="1.2" />
                        <text x={ cx } y={ cy + 21 } textAnchor="middle" fill="white" fontSize="8" fontWeight="900">ANTE</text>
                        <circle cx={ btnX - 8 } cy={ btnY } r={ r } fill="rgba(99,102,241,0.65)" stroke="var(--accent-indigo)" strokeWidth="1.2" />
                        <circle cx={ btnX + 8 } cy={ btnY } r={ r } fill="rgba(99,102,241,0.9)" stroke="var(--accent-indigo)" strokeWidth="1.2" />
                        <text x={ btnX } y={ btnY + 3.5 } textAnchor="middle" fill="white" fontSize="9" fontWeight="900">BTN</text>
                      </>
                    );
                  } )() }
                  { TABLE_PLAYERS.map( ( { name, stack, angle, highlight }: { name: string; stack: string; angle: number; highlight: boolean } ) => {
                    const rad = toRad( angle );
                    const px = cx + ( rx + 34 ) * Math.cos( rad );
                    const py = cy + ( ry + 24 ) * Math.sin( rad );
                    const accent = getAccentColor( name );
                    return (
                      <g key={ name }>
                        <rect x={ px - 32 } y={ py - 18 } width={ 64 } height={ 36 } rx={ 6 }
                          fill={ highlight ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.7)' }
                          stroke={ accent + '66' } strokeWidth="1" />
                        <text x={ px } y={ py - 3 } textAnchor="middle" fill={ accent } fontSize="12" fontWeight="700">{ name }</text>
                        <text x={ px } y={ py + 11 } textAnchor="middle" fill="var(--text-muted)" fontSize="11">{ stack }bb</text>
                      </g>
                    );
                  } ) }
                </svg>
                <div style={ { display: 'flex', gap: '0.6rem 1.5rem', flexWrap: 'wrap', marginTop: '1rem' } }>
                  { ( [
                    { id: 'SB', color: 'var(--accent-amber)', text: '0.5bb · obrig.' },
                    { id: 'BB', color: 'var(--accent-emerald)', text: '1bb · obrig.' },
                    { id: 'ANTE', color: 'var(--text-muted)', text: '1.125bb · dead' },
                    { id: 'BTN', color: 'var(--accent-indigo-light)', text: '2bb · open' },
                  ] as const ).map( ( { id, color, text } ) => (
                    <div key={ id } style={ { display: 'flex', alignItems: 'center', gap: '4px' } }>
                      <span style={ { width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 } } />
                      <span style={ { fontSize: '0.85rem', fontWeight: 700, color } }>{ id }</span>
                      <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)' } }>{ text }</span>
                    </div>
                  ) ) }
                </div>
              </div>

              {/* Insight de Risk Advantage */ }
              <div style={ {
                padding: '1.2rem 1.5rem',
                background: 'rgba(15,23,42,0.4)',
                borderRadius: '8px',
                borderLeft: '3px solid rgba(16,185,129,0.5)',
              } }>
                <p style={ { margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 } }>
                  Ambos os RPs são bem significativos, porém o RP do BTN é gigantesco e o <strong style={ { color: 'var(--text-bright)' } }>Risk Advantage</strong> (subtração entre ambos os RPs) a favor dele é <strong style={ { color: 'var(--accent-emerald)' } }>+8.5%</strong>. Essa é a métrica da proporção do quanto ele pode ser agressivo vs o BB de forma geral.
                </p>
              </div>
            </div>

            {/* DIREITA — RP + Ranges + Prêmios (coluna alinhada) */ }
            <div style={ { display: 'flex', flexDirection: 'column', gap: '1.5rem' } }>
              {/* RP + Ranges pré-flop */ }
              <div style={ { display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' } }>
                <div style={ { minWidth: '240px', maxWidth: '340px' } }>
                  <p style={ { margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Risk Premium</p>
                  <div style={ { display: 'flex', flexDirection: 'column', gap: '8px' } }>
                    { [
                      { label: 'BTN (40bb)', rp: 21.4, color: 'var(--accent-indigo-light)' },
                      { label: 'BB  (55bb)', rp: 12.9, color: 'var(--accent-emerald-light)' },
                    ].map( ( { label, rp, color } ) => (
                      <div key={ label } style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)', width: '90px', flexShrink: 0 } }>{ label }</span>
                        <div style={ { flex: 1, height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' } }>
                          <div style={ { width: `${( rp / 30 ) * 100}%`, height: '100%', background: color, borderRadius: '4px' } } />
                        </div>
                        <span style={ { fontSize: '0.85rem', fontWeight: 700, color, width: '48px', textAlign: 'right' } }>{ rp }%</span>
                      </div>
                    ) ) }
                    <p style={ { margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' } }>
                      Risk Advantage BTN <strong style={ { color: 'var(--accent-emerald)' } }>+8.5%</strong>
                    </p>
                  </div>
                </div>
                <div style={ { minWidth: '200px' } }>
                  <p style={ { margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Ranges pré-flop</p>
                  <div style={ { fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.5 } }>
                    <div><span style={ { color: 'var(--accent-indigo-light)', fontWeight: 700 } }>BTN</span> abre 33.6% · minirraise 2bb</div>
                    <div style={ { fontSize: '0.85rem', color: 'var(--text-dim)', paddingLeft: '8px' } }>fold 66.4%</div>
                    <div style={ { marginTop: '6px' } }><span style={ { color: 'var(--accent-emerald-light)', fontWeight: 700 } }>BB</span> defende 82.9%</div>
                    <div style={ { fontSize: '0.85rem', color: 'var(--text-dim)', paddingLeft: '8px' } }>fold 17.1% · call 64.4% · 3bet 10.2% · shove 8.4%</div>
                  </div>
                </div>
              </div>

              {/* Prêmios */ }
              <div style={ { marginTop: '0.5rem' } }>
                <p style={ { margin: '0 0 0.8rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Estrutura de Prêmios — MTT $11 · 126 entradas</p>
                <div style={ { display: 'flex', flexDirection: 'column', gap: '6px' } }>
                  { PRIZES.map( ( { pos, val }: { pos: string; val: number }, i: number ) => {
                    const poolPct = ( val / TOTAL_POOL ) * 100;
                    const barBg = getBarBg( i );
                    const valColor = getValColor( i );
                    return (
                      <div key={ pos } style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)', width: '28px', textAlign: 'right', flexShrink: 0 } }>{ pos }</span>
                        <div style={ { flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' } }>
                          <div style={ { width: `${poolPct}%`, height: '100%', borderRadius: '4px', background: barBg } } />
                        </div>
                        <div style={ { display: 'flex', gap: '8px', alignItems: 'baseline', width: '90px', justifyContent: 'flex-end', flexShrink: 0 } }>
                          <span style={ { fontSize: '0.75rem', color: 'var(--text-darker)', fontFamily: 'monospace' } }>{ poolPct.toFixed( 1 ) }%</span>
                          <span style={ { fontSize: '0.85rem', color: valColor, width: '52px', textAlign: 'right', fontWeight: i < 3 ? 700 : 500 } }>${ val }</span>
                        </div>
                      </div>
                    );
                  } ) }
                </div>
                <div style={ { marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' } }>
                  { ( () => {
                    const pct1 = ( ( PRIZES[ 0 ].val / TOTAL_POOL ) * 100 ).toFixed( 1 );
                    return ( [
                      { tag: 'TOP-HEAVY', icon: '▲', color: 'var(--accent-gold)', text: '1º ≥ 25% do prize pool total (field curto). 1º e 2º concentrados. Laddering pouco valioso. BF elevado.', active: false },
                      { tag: 'FLAT', icon: '▬', color: 'var(--text-muted)', text: `Esta estrutura: 1º = ${pct1}% do pool total. Saltos entre posições equilibrados. Laddering relevante. BF próximo de 1.`, active: true },
                      { tag: 'HÍBRIDA', icon: '◆', color: 'var(--accent-violet-light)', text: 'Foge dos extremos (18-24%). Análise de exclusão: não é flat nem top-heavy de forma clara. Avalie se o laddering se aproxima mais de um extremo ou do outro.', active: false },
                      { tag: 'PKO', icon: '💥', color: 'var(--accent-danger)', text: 'Top-heavyssimo: dinheiro muito concentrado no 1º. Laddering muito menos valioso. A compensação vem pelo bounty acumulado.', active: false },
                      { tag: 'SATÉLITE', icon: '🎫', color: 'var(--accent-emerald)', text: 'Prêmios idênticos no topo (tickets de entrada). Sobrevivência pura: acumular fichas além do necessário tem EV zero.', active: false },
                    ] );
                  } )().map( ( { tag, icon, color, text, active } ) => (
                    <div key={ tag } style={ {
                      display: 'flex', flexDirection: 'column', gap: '6px',
                      padding: '12px 14px', borderRadius: '8px',
                      background: active ? `${color}20` : `${color}0d`,
                      border: `1px solid ${color}${active ? '70' : '28'}`,
                      boxShadow: active ? `0 0 8px ${color}22` : 'none',
                    } }>
                      <div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <span style={ { fontSize: '1rem', color, lineHeight: 1 } }>{ icon }</span>
                        <span style={ { fontSize: '0.85rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.05em' } }>{ tag }</span>
                        { active && <span style={ { marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 } }>↑ ref</span> }
                      </div>
                      <span style={ { fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 } }>{ text }</span>
                    </div>
                  ) ) }
                </div>
              </div>
            </div>
          </div>

          {/* Ranges — lado a lado */ }
          <div style={ { marginTop: '1rem' } }>
            <p style={ { margin: '0 0 1.2rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>
              Duelo de Ranges: BTN (Agressor) vs BB (Defensor)
            </p>
            <div style={ {
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: '2.5rem',
              alignItems: 'flex-start',
              overflowX: 'auto',
              paddingBottom: '1rem'
            } }>
              <div style={ { flex: '0 0 auto' } }>
                <RangeGrid freqs={ BTN_FREQS } color="indigo" title="BTN (RFI)" pct="33.6% open" />
              </div>
              <div style={ { flex: '0 0 auto' } }>
                <RangeGrid freqs={ BB_FREQS } color="emerald" title="BB (Defesa)" pct="82.9% continue" />
              </div>
            </div>
          </div>

          {/* Bubble Factors + Risk Premium (unificados) */ }
          <div style={ { marginTop: '1.5rem' } }>
            {/* Título */ }
            <div style={ { display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.2rem' } }>
              <p style={ { margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Réguas do ICM:</p>
              <p style={ { margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' } }>Matriz 9x9 — Multiplicadores de Dor e Teto de Risco</p>
            </div>

            {/* Legenda BF + RP */ }
            <div style={ {
              display: 'flex', flexDirection: 'column', gap: '1rem',
              marginBottom: '1.5rem', padding: '1.5rem 1.8rem',
              background: 'rgba(15,23,42,0.5)', borderRadius: '8px',
              borderLeft: '3px solid rgba(245,158,11,0.3)',
            } }>
              <div style={ { display: 'grid', gridTemplateColumns: 'minmax(40px, max-content) 1fr', gap: '1rem 1.5rem', alignItems: 'center' } }>
                <div style={ { display: 'contents' } }>
                  <span style={ { fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-light)', whiteSpace: 'nowrap', textAlign: 'right' } }>BF</span>
                  <span style={ { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 } }>
                    Multiplicador ICM: quanto os pot odds crescem sob risco de eliminação. <span style={ { color: 'var(--text-light)', fontFamily: 'monospace', fontSize: '0.85rem' } }>BF = 1/(1−RP)</span>.
                  </span>
                </div>
                <div style={ { display: 'contents' } }>
                  <span style={ { fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-light)', whiteSpace: 'nowrap', textAlign: 'right' } }>RP</span>
                  <span style={ { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 } }>
                    Equity adicional (%) exigida acima dos pot odds para um call. Linha = Defensor · Coluna = Agressor.
                  </span>
                </div>
              </div>
              {/* Escala de cor unificada — BF determina o nível; RP herda a mesma cor */ }
              <div style={ { display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' } }>
                <span style={ { fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>Intensidade</span>
                <div style={ { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' } }>
                  { [
                    { bg: 'rgba(239,68,68,0.55)', color: 'var(--accent-danger-light)', label: 'BF > 2.0', desc: 'crítico' },
                    { bg: 'rgba(245,158,11,0.45)', color: 'var(--accent-amber-light)', label: '1.6–2.0', desc: 'elevado' },
                    { bg: 'rgba(6,182,212,0.22)', color: 'var(--accent-cyan)', label: '1.3–1.6', desc: 'moderado' },
                    { bg: 'rgba(34,197,94,0.2)', color: 'var(--accent-green)', label: '< 1.3', desc: 'baixo' },
                  ].map( ( { bg, color, label, desc } ) => (
                    <div key={ label } style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
                      <span style={ { width: '12px', height: '12px', borderRadius: '3px', background: bg, border: `1px solid ${color}`, flexShrink: 0, display: 'inline-block' } } />
                      <span style={ { fontSize: '0.85rem', color, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'monospace' } }>{ label }</span>
                      <span style={ { fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' } }>{ desc }</span>
                    </div>
                  ) ) }
                </div>
              </div>
            </div>

            <div style={ { overflowX: 'auto' } }>
              <table style={ { borderCollapse: 'collapse', fontSize: '0.85rem' } }>
                <thead>
                  <tr>
                    <th style={ { padding: '8px 10px', textAlign: 'left' } } />
                    { BF_PLAYERS.map( ( p: string, i: number ) => (
                      <th key={ p } style={ { padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap' } }>
                        { p }<br /><span style={ { color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem' } }>{ BF_STACKS[ i ] }</span>
                      </th>
                    ) ) }
                  </tr>
                </thead>
                <tbody>
                  { BF_MATRIX.map( ( row: number[], r: number ) => (
                    <tr key={ BF_PLAYERS[ r ] }>
                      <td style={ { padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.08)' } }>
                        { BF_PLAYERS[ r ] }<br /><span style={ { color: 'var(--text-dim)', fontWeight: 500, fontSize: '0.85rem' } }>{ BF_STACKS[ r ] }</span>
                      </td>
                      { row.map( ( val: number, c: number ) => {
                        const rp = RP_MATRIX[ r ][ c ];
                        // Thresholds calibrados ao range real da matriz (max ~22.6%)
                        const bfTextColor = getBfTextColor( val );
                        const rpTextColor = bfTextColor;
                        return (
                          <td key={ BF_PLAYERS[ c ] } style={ {
                            padding: '10px 8px', textAlign: 'center', minWidth: '70px',
                            background: bfColor( val ),
                            border: '1px solid rgba(255,255,255,0.06)',
                            lineHeight: 1.4,
                            verticalAlign: 'middle',
                          } }>
                            { val === 0 ? '' : (
                              <>
                                <div style={ { color: bfTextColor, fontWeight: val >= 1.6 ? 800 : 700, fontSize: '0.95rem' } }>{ val.toFixed( 2 ) }</div>
                                <div style={ {
                                  color: rpTextColor,
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  marginTop: '6px',
                                  borderTop: '1px solid rgba(255,255,255,0.06)',
                                  paddingTop: '4px',
                                } }>{ rp }%</div>
                              </>
                            ) }
                          </td>
                        );
                      } ) }
                    </tr>
                  ) ) }
                </tbody>
              </table>
            </div>
          </div>

          {/* Toy Games */ }
          <div style={ { marginTop: '1.5rem' } }>
            <div style={ { display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.2rem' } }>
              <p style={ { margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Toy Games</p>
              <p style={ { margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' } }>Framework Teórico — ΔRP como eixo de distorção</p>
            </div>

            {/* Legenda conceitual */ }
            <div style={ {
              display: 'grid', gridTemplateColumns: 'minmax(140px, max-content) 1fr', gap: '1rem 1.5rem',
              alignItems: 'center',
              marginBottom: '1.5rem', padding: '1.5rem 1.8rem',
              background: 'rgba(15,23,42,0.5)', borderRadius: '8px',
              borderLeft: '3px solid rgba(99,102,241,0.3)',
            } }>
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
              ].map( ( { term, def } ) => (
                <div key={ term } style={ { display: 'contents' } }>
                  <span style={ { fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-indigo-light)', whiteSpace: 'nowrap', textAlign: 'right' } }>{ term }</span>
                  <span style={ { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 } }>{ def }</span>
                </div>
              ) ) }
            </div>
            <div style={ { overflowX: 'auto' } }>
              <table style={ { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-light)' } }>
                <thead>
                  <tr style={ { borderBottom: '1px solid rgba(255,255,255,0.08)' } }>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>Nó</th>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-indigo-light)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>RP IP</th>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-danger)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>RP OOP</th>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>ΔRP</th>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>Bluff IP</th>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' } }>Def OOP</th>
                    <th style={ { padding: '0.8rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' } }>Efeito</th>
                  </tr>
                </thead>
                <tbody>
                  { ( [
                    { no: 'TG0', rpIp: 0, rpOop: 0, bluff: '33%', def: '50%', desc: 'Baseline GTO — ChipEV puro', anchor: false },
                    { no: 'TG1', rpIp: 3, rpOop: 6, bluff: '↑ 40%', def: '↓ 44%', desc: 'OOP restrito — IP explora', anchor: false },
                    { no: 'TG2', rpIp: 3, rpOop: 9, bluff: '↑ 50%', def: '⊘ teto', desc: 'OOP congela no limite do RP', anchor: false },
                    { no: 'TG3', rpIp: 3, rpOop: 18, bluff: '↑↑', def: '⊘ teto', desc: 'IP satura bluffs; OOP imobilizado', anchor: false },
                    { no: 'TG4', rpIp: 3, rpOop: 24, bluff: '⊘ max', def: '⊘ teto', desc: 'Ambos saturam — pressão extrema', anchor: false },
                    { no: 'TG5', rpIp: 9, rpOop: 3, bluff: '~33%', def: '↓ 43%', desc: 'IP preserva; OOP cede levemente', anchor: false },
                    { no: 'TG6', rpIp: 18, rpOop: 3, bluff: '↓ 17%', def: '↓↓', desc: 'IP contém bluffs ativamente', anchor: false },
                    { no: 'TG7', rpIp: 21, rpOop: 3, bluff: '↓ 13%', def: '↓ 20%', desc: 'OOP 80% fold — âncora KJT-2-3', anchor: true },
                  ] as const ).map( ( row, i ) => {
                    const delta = row.rpIp - row.rpOop;
                    const deltaStr = getDeltaStr( delta );
                    const deltaColor = getDeltaColor( delta );
                    const bluffColor = getBluffColor( row.bluff );
                    const defColor = getDefColor( row.def );

                    let rowBg = 'rgba(255,255,255,0.01)';
                    if ( row.anchor )
                    {
                      rowBg = 'rgba(99,102,241,0.06)';
                    } else if ( i % 2 === 0 )
                    {
                      rowBg = 'transparent';
                    }

                    return (
                      <tr key={ row.no } style={ {
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: row.anchor ? '3px solid rgba(99,102,241,0.5)' : '3px solid transparent',
                        background: rowBg,
                      } }>
                        <td style={ { padding: '0.8rem 1rem', fontWeight: 700, color: row.anchor ? 'var(--accent-indigo-light)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.9rem' } }>
                          { row.no }{ row.anchor && <span style={ { color: 'var(--accent-indigo-light)', marginLeft: '6px' } }>★</span> }
                        </td>
                        <td style={ { padding: '0.8rem 1rem', textAlign: 'right', color: 'var(--accent-indigo-light)', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.9rem' } }>{ row.rpIp }%</td>
                        <td style={ { padding: '0.8rem 1rem', textAlign: 'right', color: 'var(--accent-danger)', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.9rem' } }>{ row.rpOop }%</td>
                        <td style={ { padding: '0.8rem 1rem', textAlign: 'right', color: deltaColor, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.95rem' } }>{ deltaStr }</td>
                        <td style={ { padding: '0.8rem 1rem', textAlign: 'right', color: bluffColor, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.9rem' } }>{ row.bluff }</td>
                        <td style={ { padding: '0.8rem 1rem', textAlign: 'right', color: defColor, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.9rem' } }>{ row.def }</td>
                        <td style={ { padding: '0.8rem 1rem', color: row.anchor ? 'var(--accent-indigo-lighter)' : 'var(--text-muted)', fontSize: '0.9rem' } }>{ row.desc }</td>
                      </tr>
                    );
                  } ) }
                </tbody>
              </table>
            </div>
            {/* Glossário de Símbolos Refinado */ }
            <div style={ {
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem 1.5rem',
              margin: '1.5rem 0 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)'
            } }>
              { [
                { sym: '↑ / ↓', desc: 'Acima / abaixo do baseline GTO (33% bluff · 50% def)' },
                { sym: '↑↑ / ↓↓', desc: 'Desvio acentuado — dinâmica dominante' },
                { sym: '⊘ teto', desc: 'Defesa congelada pelo RP do OOP — fold sustentável' },
                { sym: '⊘ max', desc: 'Bluff IP saturado — limite imposto pelo BF' },
                { sym: 'ΔRP', desc: 'IP_RP − OOP_RP · Positivo = IP constringido' },
              ].map( ( { sym, desc } ) => (
                <div key={ sym } style={ { display: 'flex', alignItems: 'flex-start', gap: '0.8rem' } }>
                  <span style={ {
                    fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-indigo-light)',
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                    padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', whiteSpace: 'nowrap', marginTop: '1px'
                  } }>{ sym }</span>
                  <span style={ { fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 } }>{ desc }</span>
                </div>
              ) ) }
            </div>

            {/* Citações e Referências */ }
            <div style={ {
              marginTop: '2rem', padding: '1rem 1.2rem',
              background: 'rgba(15,23,42,0.4)', borderRadius: '6px',
              borderLeft: '3px solid rgba(71,85,105,0.5)',
              display: 'flex', flexDirection: 'column', gap: '0.6rem'
            } }>
              <div style={ { display: 'flex', alignItems: 'baseline', gap: '8px' } }>
                <span style={ { color: 'var(--accent-indigo-light)', fontSize: '0.8rem' } }>★</span>
                <span style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>
                  <strong style={ { color: 'var(--text-light)', fontWeight: 600 } }>Divergência Arquitetônica:</strong> HRC Pós-Flop (nosso cânone) considera o Bunching Effect total e a irradiação de TODAS as stacks, enquanto solvers isolados (GTO Wizard) operam com mais &quot;ruído&quot; e e-Nash menos estável.
                </span>
              </div>
              <div style={ { display: 'flex', alignItems: 'baseline', gap: '8px' } }>
                <span style={ { color: 'var(--accent-indigo-light)', fontSize: '0.8rem' } }>★</span>
                <span style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>
                  <strong style={ { color: 'var(--text-light)', fontWeight: 600 } }>Âncora empírica:</strong> 93 nodes HRC vs GTO Wizard, Raphael Vitoi 2024
                </span>
              </div>
              <div style={ { display: 'flex', alignItems: 'baseline', gap: '8px' } }>
                <span style={ { color: 'var(--accent-indigo-light)', fontSize: '0.8rem' } }>★</span>
                <span style={ { fontSize: '0.85rem', color: 'var(--text-muted)' } }>
                  <strong style={ { color: 'var(--text-light)', fontWeight: 600 } }>Downward Drift:</strong> O&apos;Kearney &amp; Carter, <em>PKO Poker Strategy</em>, D&amp;B Poker 2023
                </span>
              </div>
            </div>
          </div>

        </div>
      </details>
    </div>
  );
}
