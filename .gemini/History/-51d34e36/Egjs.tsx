/**
 * IDENTITY: Referencial Visual — Âncora Empírica Aula 1.2
 * PATH: src/components/simulator/ReferencialAula12.tsx
 * ROLE: Seção colapsável com representação visual dos dados de calibração do motor ICM.
 */

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// BTN range — dados exatos da imagem (Aula 1.2)
// [row][col]: upper-tri=suited, diagonal=pair, lower-tri=offsuit
const BTN_FREQS = [
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 57],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 52, 5],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 49, 0, 0, 0],
  [100, 100, 100, 100, 100, 100, 100, 100, 31, 0, 0, 0, 0],
  [100, 65, 54, 41, 51, 100, 100, 80, 13, 0, 0, 0, 0],
  [100, 22, 0, 0, 0, 0, 100, 100, 55, 0, 0, 0, 0],
  [92, 0, 0, 0, 0, 0, 0, 100, 69, 20, 0, 0, 0],
  [54, 0, 0, 0, 0, 0, 0, 0, 100, 52, 0, 0, 0],
  [100, 0, 0, 0, 0, 0, 0, 0, 0, 100, 24, 0, 0],
  [46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0],
  [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// BB range — defesa 82.9% vs minirraise BTN (estimativa baseada em padrão FT/ICM)
const BB_FREQS = [
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0, 0],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0],
  [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0],
  [100, 100, 100, 50, 0, 0, 0, 0, 0, 100, 100, 50, 0],
  [100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 100, 100, 50],
  [100, 100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100],
  [100, 100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100],
];

function getHandLabel(r: number, c: number): string {
  if (r === c) return RANKS[r] + RANKS[r];
  if (r < c) return RANKS[r] + RANKS[c] + 's';
  return RANKS[c] + RANKS[r] + 'o';
}

function cellBg(freq: number, color: 'indigo' | 'emerald'): string {
  if (freq === 0) return 'rgba(15,23,42,0.6)';
  if (color === 'indigo') {
    if (freq === 100) return 'rgba(99,102,241,0.55)';
    if (freq >= 50) return 'rgba(99,102,241,0.28)';
    return 'rgba(99,102,241,0.12)';
  }
  if (freq === 100) return 'rgba(52,211,153,0.4)';
  if (freq >= 50) return 'rgba(52,211,153,0.20)';
  return 'rgba(52,211,153,0.08)';
}

function cellText(freq: number): string {
  return freq === 0 ? '#1e293b' : '#cbd5e1';
}

function RangeGrid({ freqs, color, title, pct }: {
  freqs: number[][];
  color: 'indigo' | 'emerald';
  title: string;
  pct: string;
}) {
  const accentColor = color === 'indigo' ? '#818cf8' : '#34d399';
  return (
    <div>
      <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title} <span style={{ color: '#64748b', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>— {pct}</span>
      </p>
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.65rem' }}>
          <thead>
            <tr>
              <th style={{ width: '20px' }} />
              {RANKS.map(r => (
                <th key={r} style={{ width: '32px', padding: '2px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: '0.65rem' }}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RANKS.map((rowRank, r) => (
              <tr key={rowRank}>
                <td style={{ padding: '2px 4px 2px 0', color: '#64748b', fontWeight: 700, fontSize: '0.65rem', textAlign: 'right' }}>{rowRank}</td>
                {RANKS.map((_, c) => {
                  const freq = freqs[r][c];
                  const label = getHandLabel(r, c);
                  const isPair = r === c;
                  return (
                    <td key={c} title={`${label}: ${freq}%`} style={{
                      width: '32px',
                      height: '24px',
                      padding: '2px',
                      textAlign: 'center',
                      background: cellBg(freq, color),
                      border: isPair ? `1px solid ${accentColor}44` : '1px solid rgba(255,255,255,0.03)',
                      color: cellText(freq),
                      fontSize: '0.65rem',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      fontWeight: isPair ? 700 : 400,
                    }}>
                      {freq > 0 ? (freq === 100 ? label : `${freq}%`) : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PRIZES = [
  { pos: '1º', val: 237.34 }, { pos: '2º', val: 170.96 },
  { pos: '3º', val: 135.17 }, { pos: '4º', val: 109.99 },
  { pos: '5º', val: 90.28 }, { pos: '6º', val: 73.95 },
  { pos: '7º', val: 59.92 }, { pos: '8º', val: 47.56 },
  { pos: '9º', val: 36.47 },
];
const TOTAL_PRIZES = PRIZES.reduce((s, p) => s + p.val, 0);
const TOTAL_POOL = 1260; // ~126 entradas a $11 descontando o rake


// Bubble Factor matrix (9x9) — valores da imagem Aula 1.2
const BF_PLAYERS = ['UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB'];
const BF_STACKS = [9.4, 52.4, 22.2, 7.0, 44.3, 24.3, 40.0, 13.4, 55.0];
const BF_MATRIX = [
  [0, 1.63, 1.53, 1.23, 1.62, 1.55, 1.61, 1.45, 1.64],
  [1.10, 0, 1.29, 1.07, 1.96, 1.32, 1.15, 1.15, 2.64],
  [1.21, 2.12, 0, 1.15, 2.09, 1.94, 2.06, 1.34, 2.13],
  [1.28, 1.48, 1.41, 0, 1.47, 1.42, 1.46, 1.33, 1.48],
  [1.12, 2.53, 1.35, 1.09, 0, 1.40, 2.06, 1.18, 2.55],
  [1.20, 2.18, 1.78, 1.14, 2.14, 0, 2.11, 1.32, 2.19],
  [1.13, 2.47, 1.39, 1.09, 2.41, 1.45, 0, 1.20, 2.49],
  [1.31, 1.83, 1.69, 1.20, 1.80, 1.71, 1.79, 0, 1.83],
  [1.10, 2.38, 1.27, 1.07, 1.86, 1.30, 1.69, 1.14, 0],
];

// Risk Premium matrix — valores exatos do HRC (vitoi.hrcz)
// RP[row][col] = RP do jogador da linha ao enfrentar o jogador da coluna
// Colunas: UTG, EP, MP1, MP2, HJ, CO, BU, SB, BB
const RP_MATRIX = [
  [0, 12.0, 10.5, 5.2, 11.8, 10.7, 11.6, 9.2, 12.1], // UTG
  [2.4, 0, 6.2, 1.8, 16.2, 7.0, 21.2, 3.5, 22.6], // EP
  [4.8, 18.0, 0, 3.5, 17.6, 16.0, 17.3, 7.3, 18.1], // MP1
  [6.1, 9.6, 8.4, 0, 9.5, 8.6, 9.7, 7.2, 9.7], // MP2
  [2.8, 21.7, 7.4, 2.1, 0, 8.3, 17.3, 4.1, 21.8], // HJ
  [4.5, 18.5, 15.1, 3.3, 18.1, 0, 17.8, 6.8, 18.6], // CO
  [3.1, 13.7, 8.2, 2.3, 20.7, 9.2, 0, 4.5, 21.4], // BU
  [6.7, 14.6, 13.0, 4.6, 14.3, 13.0, 14.2, 0, 14.7], // SB
  [2.3, 20.4, 5.9, 1.7, 15.1, 6.6, 12.9, 3.4, 0], // BB
];

function bfColor(v: number): string {
  if (v === 0) return 'rgba(15,23,42,0.5)';
  if (v >= 2.0) return 'rgba(239,68,68,0.55)';
  if (v >= 1.6) return 'rgba(245,158,11,0.45)';
  if (v >= 1.3) return 'rgba(6,182,212,0.22)';
  return 'rgba(34,197,94,0.2)';
}

function rpColor(v: number): string {
  if (v === 0) return 'rgba(15,23,42,0.5)';
  if (v >= 50) return 'rgba(239,68,68,0.55)';
  if (v >= 35) return 'rgba(245,158,11,0.45)';
  if (v >= 20) return 'rgba(245,158,11,0.25)';
  return 'rgba(34,197,94,0.2)';
}

// Posições angulares da mesa (9-handed, iniciando em BTN~bottom-right)
const TABLE_PLAYERS = [
  { name: 'BTN', stack: '39.88', angle: -50, highlight: true },
  { name: 'SB', stack: '12.73', angle: -15, highlight: false },
  { name: 'BB', stack: '53.88', angle: 20, highlight: true },
  { name: 'UTG', stack: '9.25', angle: 60, highlight: false },
  { name: 'EP', stack: '52.24', angle: 100, highlight: false },
  { name: 'MP1', stack: '22.08', angle: 140, highlight: false },
  { name: 'MP2', stack: '6.88', angle: 180, highlight: false },
  { name: 'HJ', stack: '44.16', angle: 220, highlight: false },
  { name: 'CO', stack: '24.16', angle: 260, highlight: false },
];

function toRad(deg: number) { return (deg * Math.PI) / 180; }

export default function ReferencialAula12() {
  const W = 500; const H = 340;
  const rx = 170; const ry = 100;
  const cx = W / 2; const cy = H / 2;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem' }}>
      <details style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <summary style={{
          cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center',
          gap: '0.75rem', padding: '1.2rem 0', fontSize: '0.85rem', color: '#64748b',
          fontWeight: 600, letterSpacing: '0.04em', userSelect: 'none',
        }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>▶ Referencial</span>
          <span style={{ fontWeight: 400, color: '#64748b' }}>— Âncora Empírica (Aula 1.2) · KJT-2-3 · BTN 21.4% RP vs BB 12.9% RP</span>
        </summary>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '2.5rem', paddingTop: '1rem' }}>

          {/* Grid 2-col: Esquerda(Board+Mesa) | Direita(RP+Prêmios) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem 3rem', alignItems: 'start' }}>

            {/* ESQUERDA — Board + Mesa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Board */}
              <div>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Board</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { rank: 'K', suit: '♦', color: '#60a5fa' },
                    { rank: 'J', suit: '♣', color: '#34d399' },
                    { rank: 'T', suit: '♠', color: '#cbd5e1' },
                    { rank: '2', suit: '♦', color: '#60a5fa' },
                    { rank: '3', suit: '♦', color: '#60a5fa' },
                  ].map(({ rank, suit, color }, i) => (
                    <div key={i} style={{
                      width: '48px', height: '68px', borderRadius: '6px',
                      background: 'rgba(15,23,42,0.9)', border: `1px solid ${color}55`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                    }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color, lineHeight: 1 }}>{rank}</span>
                      <span style={{ fontSize: '1rem', color, lineHeight: 1 }}>{suit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mesa oval */}
              <div>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Table Draw — Final Table 9P</p>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', maxWidth: `${W}px`, margin: '0 auto' }}>
                  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(22,101,52,0.35)" stroke="rgba(34,197,94,0.2)" strokeWidth="2" />
                  <ellipse cx={cx} cy={cy} rx={rx - 14} ry={ry - 12} fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1" />
                  <text x={cx} y={cy - 40} textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="600">Pot: 5.63bb</text>
                  {(() => {
                    const r = 12;
                    const iRx = 90; const iRy = 60;
                    const sbX = cx + iRx * Math.cos(toRad(-15));
                    const sbY = cy + iRy * Math.sin(toRad(-15));
                    const bbX = cx + iRx * Math.cos(toRad(20));
                    const bbY = cy + iRy * Math.sin(toRad(20));
                    const btnX = cx + iRx * Math.cos(toRad(-50));
                    const btnY = cy + iRy * Math.sin(toRad(-50));
                    return (
                      <>
                        <circle cx={sbX} cy={sbY} r={r} fill="rgba(245,158,11,0.85)" stroke="#f59e0b" strokeWidth="1.2" />
                        <text x={sbX} y={sbY + 3.5} textAnchor="middle" fill="white" fontSize="8" fontWeight="900">0.5</text>
                        <circle cx={bbX} cy={bbY} r={r} fill="rgba(16,185,129,0.8)" stroke="#10b981" strokeWidth="1.2" />
                        <text x={bbX} y={bbY + 3.5} textAnchor="middle" fill="white" fontSize="8" fontWeight="900">1</text>
                        <circle cx={cx} cy={cy + 18} r={r} fill="rgba(100,116,139,0.8)" stroke="#94a3b8" strokeWidth="1.2" />
                        <text x={cx} y={cy + 21} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="900">ANTE</text>
                        <circle cx={btnX - 8} cy={btnY} r={r} fill="rgba(99,102,241,0.65)" stroke="#6366f1" strokeWidth="1.2" />
                        <circle cx={btnX + 8} cy={btnY} r={r} fill="rgba(99,102,241,0.9)" stroke="#6366f1" strokeWidth="1.2" />
                        <text x={btnX} y={btnY + 3.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="900">BTN</text>
                      </>
                    );
                  })()}
                  {TABLE_PLAYERS.map(({ name, stack, angle, highlight }) => {
                    const rad = toRad(angle);
                    const px = cx + (rx + 34) * Math.cos(rad);
                    const py = cy + (ry + 24) * Math.sin(rad);
                    const accent = name === 'BTN' ? '#818cf8' : name === 'BB' ? '#34d399' : '#475569';
                    return (
                      <g key={name}>
                        <rect x={px - 28} y={py - 16} width={56} height={32} rx={5}
                          fill={highlight ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.7)'}
                          stroke={accent + '66'} strokeWidth="1" />
                        <text x={px} y={py - 3} textAnchor="middle" fill={accent} fontSize="10" fontWeight="700">{name}</text>
                        <text x={px} y={py + 10} textAnchor="middle" fill="#94a3b8" fontSize="9">{stack}bb</text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{ display: 'flex', gap: '0.4rem 1.25rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                  {([
                    { id: 'SB', color: '#f59e0b', text: '0.5bb · obrig.' },
                    { id: 'BB', color: '#10b981', text: '1bb · obrig.' },
                    { id: 'ANTE', color: '#94a3b8', text: '1.125bb · dead' },
                    { id: 'BTN', color: '#818cf8', text: '2bb · open' },
                  ] as const).map(({ id, color, text }) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color }}>{id}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DIREITA — RP + Ranges + Prêmios (coluna alinhada) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* RP + Ranges pré-flop */}
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '220px', maxWidth: '300px' }}>
                  <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Premium</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { label: 'BTN (40bb)', rp: 21.4, color: '#818cf8' },
                      { label: 'BB  (55bb)', rp: 12.9, color: '#34d399' },
                    ].map(({ label, rp, color }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', width: '80px', flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${(rp / 30) * 100}%`, height: '100%', background: color, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color, width: '42px', textAlign: 'right' }}>{rp}%</span>
                      </div>
                    ))}
                    <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#64748b' }}>
                      Risk Advantage BTN <strong style={{ color: '#10b981' }}>+8.5%</strong>
                    </p>
                  </div>
                </div>
                <div style={{ minWidth: '200px' }}>
                  <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ranges pré-flop</p>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.4 }}>
                    <div><span style={{ color: '#818cf8', fontWeight: 700 }}>BTN</span> abre 33.6% · minirraise 2bb</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', paddingLeft: '6px' }}>fold 66.4%</div>
                    <div style={{ marginTop: '4px' }}><span style={{ color: '#34d399', fontWeight: 700 }}>BB</span> defende 82.9%</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', paddingLeft: '6px' }}>fold 17.1% · call 64.4% · 3bet 10.2% · shove 8.4%</div>
                  </div>
                </div>
              </div>

              {/* Prêmios */}
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estrutura de Prêmios — MTT $11 · 126 entradas</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {PRIZES.map(({ pos, val }, i) => {
                    const pct = (val / TOTAL_POOL) * 100;
                    const barBg = i === 0 ? 'linear-gradient(to right,#fbbf24,#f59e0b)'
                      : i === 1 ? 'linear-gradient(to right,#cbd5e1,#94a3b8)'
                        : i === 2 ? 'linear-gradient(to right,#c4b5fd,#8b5cf6)'
                          : i <= 5 ? `rgba(99,102,241,${(0.5 - i * 0.06).toFixed(2)})`
                            : `rgba(71,85,105,${(0.42 - (i - 6) * 0.08).toFixed(2)})`;
                    const valColor = i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#c4b5fd' : '#64748b';
                    return (
                      <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', width: '24px', textAlign: 'right', flexShrink: 0 }}>{pos}</span>
                        <div style={{ flex: 1, height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: barBg }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: valColor, width: '54px', textAlign: 'right', flexShrink: 0, fontWeight: i < 3 ? 700 : 500 }}>${val}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
                  {(() => {
                    const pct1 = ((PRIZES[0].val / TOTAL_POOL) * 100).toFixed(1);
                    return ([
                      { tag: 'TOP-HEAVY', icon: '▲', color: '#fbbf24', text: '1º lugar ≥ 25% do pool. Foco extremo nas cabeças (Top 2 em fields curtos). Pressão ICM severa.', active: false },
                      { tag: 'FLAT', icon: '▬', color: '#94a3b8', text: '1º lugar < 18%. Posições inferiores se valorizam. Laddering equilibrado com saltos significativos.', active: false },
                      { tag: 'HÍBRIDA', icon: '◆', color: '#c4b5fd', text: `Ref. atual: ≈${pct1}% do pool total. Foge dos extremos (18–24%). Avalie os saltos para o topo caso a caso.`, active: true },
                      { tag: 'PKO', icon: '💥', color: '#f43f5e', text: 'Top-heavyssimo. Dinheiro estático muito concentrado no 1º. Laddering perde valor para os Bounties.', active: false },
                      { tag: 'SATÉLITE', icon: '🎫', color: '#10b981', text: 'Prêmios idênticos no topo (Tickets). Dinâmica de sobrevivência pura; acumular fichas extras tem EV zero.', active: false },
                    ]);
                  })().map(({ tag, icon, color, text, active }) => (
                    <div key={tag} style={{
                      display: 'flex', flexDirection: 'column', gap: '5px',
                      padding: '10px 12px', borderRadius: '8px',
                      background: active ? `${color}20` : `${color}0d`,
                      border: `1px solid ${active ? `${color}70` : `${color}28`}`,
                      boxShadow: active ? `0 0 8px ${color}22` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color, lineHeight: 1 }}>{icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tag}</span>
                        {active && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>↑ ref</span>}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.45 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ranges — lado a lado */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem 2.5rem', alignItems: 'flex-start' }}>
            <RangeGrid freqs={BTN_FREQS} color="indigo" title="BTN — Range de Abertura (RFI)" pct="33.6% open · fold 66.4%" />
            <RangeGrid freqs={BB_FREQS} color="emerald" title="BB — Defesa vs minirraise" pct="82.9% continue · fold 17.1%" />
          </div>

          {/* Bubble Factors + Risk Premium (unificados) */}
          <div>
            {/* Título */}
            <p style={{ margin: '0 0 0.6rem', fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Bubble Factors — FT BTN 40 BB 55
            </p>

            {/* Legenda BF + RP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '0.7rem' }}>
              {/* Definições */}
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', flex: 1, minWidth: '220px' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '1px', whiteSpace: 'nowrap' }}>BF</span>
                  <span style={{ fontSize: '0.62rem', color: '#475569', lineHeight: 1.5 }}>
                    Multiplicador ICM: quanto os pot odds crescem sob risco de eliminação. <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.58rem' }}>BF = 1/(1−RP)</span>. Cor indica intensidade.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', flex: 1, minWidth: '220px' }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '1px', whiteSpace: 'nowrap' }}>RP</span>
                  <span style={{ fontSize: '0.62rem', color: '#475569', lineHeight: 1.5 }}>
                    Equity adicional (%) acima dos pot odds para justificar um call. Linha = quem chama · coluna = quem apostou.
                  </span>
                </div>
              </div>
              {/* Escala de cor unificada — BF determina o nível; RP herda a mesma cor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Nível ICM</span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { bg: 'rgba(239,68,68,0.55)', color: '#fca5a5', label: 'BF > 2.0', desc: 'crítico' },
                    { bg: 'rgba(245,158,11,0.45)', color: '#fde68a', label: '1.6–2.0', desc: 'elevado' },
                    { bg: 'rgba(6,182,212,0.18)', color: '#67e8f9', label: '1.3–1.6', desc: 'moderado' },
                    { bg: 'rgba(34,197,94,0.2)', color: '#4ade80', label: '< 1.3', desc: 'baixo' },
                  ].map(({ bg, color, label, desc }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: bg, border: `1px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: '0.58rem', color, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
                      <span style={{ fontSize: '0.58rem', color: '#475569', whiteSpace: 'nowrap' }}>{desc}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.58rem', color: '#475569', fontStyle: 'italic' }}>— BF e RP</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }} />
                    {BF_PLAYERS.map((p, i) => (
                      <th key={p} style={{ padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {p}<br /><span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>{BF_STACKS[i]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BF_MATRIX.map((row, r) => (
                    <tr key={r}>
                      <td style={{ padding: '6px 8px', color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                        {BF_PLAYERS[r]}<br /><span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}>{BF_STACKS[r]}</span>
                      </td>
                      {row.map((val, c) => {
                        const rp = RP_MATRIX[r][c];
                        // Thresholds calibrados ao range real da matriz (max ~22.6%)
                        const bfTextColor = val === 0 ? 'transparent' : val >= 2.0 ? '#fca5a5' : val >= 1.6 ? '#fde68a' : val >= 1.3 ? '#67e8f9' : '#4ade80';
                        const rpTextColor = bfTextColor;
                        return (
                          <td key={c} style={{
                            padding: '8px 6px', textAlign: 'center', minWidth: '60px',
                            background: bfColor(val),
                            border: '1px solid rgba(255,255,255,0.06)',
                            lineHeight: 1.4,
                            verticalAlign: 'middle',
                          }}>
                            {val === 0 ? '' : (
                              <>
                                <div style={{ color: bfTextColor, fontWeight: val >= 1.6 ? 800 : 700, fontSize: '0.75rem' }}>{val.toFixed(2)}</div>
                                <div style={{
                                  color: rpTextColor,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  marginTop: '4px',
                                  borderTop: '1px solid rgba(255,255,255,0.06)',
                                  paddingTop: '2px',
                                }}>{rp}%</div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Toy Games */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Toy Games</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Framework Teórico — ΔRP como eixo de distorção</p>
            </div>

            {/* Legenda conceitual */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'minmax(140px, max-content) 1fr', gap: '0.8rem 1.5rem',
              alignItems: 'center',
              marginBottom: '1.2rem', padding: '1.2rem 1.5rem',
              background: 'rgba(15,23,42,0.5)', borderRadius: '8px',
              borderLeft: '2px solid rgba(99,102,241,0.3)',
            }}>
              {[
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
              ].map(({ term, def }) => (
                <div key={term} style={{ display: 'contents' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', whiteSpace: 'nowrap', textAlign: 'right' }}>{term}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>{def}</span>
                </div>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Nó</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#818cf8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>RP IP</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#f43f5e', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>RP OOP</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>ΔRP</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Bluff IP</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Def OOP</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Efeito</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    { no: 'TG0', rpIp: 0, rpOop: 0, bluff: '33%', def: '50%', desc: 'Baseline GTO — ChipEV puro', anchor: false },
                    { no: 'TG1', rpIp: 3, rpOop: 6, bluff: '↑ 40%', def: '↓ 44%', desc: 'OOP restrito — IP explora', anchor: false },
                    { no: 'TG2', rpIp: 3, rpOop: 9, bluff: '↑ 50%', def: '⊘ teto', desc: 'OOP congela no limite do RP', anchor: false },
                    { no: 'TG3', rpIp: 3, rpOop: 18, bluff: '↑↑', def: '⊘ teto', desc: 'IP satura bluffs; OOP imobilizado', anchor: false },
                    { no: 'TG4', rpIp: 3, rpOop: 24, bluff: '⊘ max', def: '⊘ teto', desc: 'Ambos saturam — pressão extrema', anchor: false },
                    { no: 'TG5', rpIp: 9, rpOop: 3, bluff: '~33%', def: '↓ 43%', desc: 'IP preserva; OOP cede levemente', anchor: false },
                    { no: 'TG6', rpIp: 18, rpOop: 3, bluff: '↓ 17%', def: '↓↓', desc: 'IP contém bluffs ativamente', anchor: false },
                    { no: 'TG7', rpIp: 21, rpOop: 3, bluff: '↓ 13%', def: '↓ 20%', desc: 'OOP 80% fold — âncora KJT-2-3', anchor: true },
                  ] as const).map((row, i) => {
                    const delta = row.rpIp - row.rpOop;
                    const deltaStr = delta === 0 ? '0' : delta > 0 ? `+${delta}` : `${delta}`;
                    const deltaColor = delta > 0 ? '#f87171' : delta < 0 ? '#34d399' : '#475569';
                    const bluffColor = row.bluff.startsWith('↑') ? '#34d399'
                      : row.bluff.startsWith('↓') ? '#f59e0b'
                        : row.bluff.startsWith('⊘') ? '#818cf8'
                          : '#94a3b8';
                    const defColor = row.def.startsWith('↓') ? '#f59e0b'
                      : row.def.startsWith('⊘') ? '#f87171'
                        : '#94a3b8';
                    return (
                      <tr key={i} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: row.anchor ? '2px solid rgba(99,102,241,0.5)' : '2px solid transparent',
                        background: row.anchor ? 'rgba(99,102,241,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      }}>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: row.anchor ? '#818cf8' : '#94a3b8', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                          {row.no}{row.anchor && <span style={{ color: '#818cf8', marginLeft: '4px' }}>★</span>}
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: '#818cf8', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.rpIp}%</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: '#f43f5e', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.rpOop}%</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: deltaColor, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>{deltaStr}</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: bluffColor, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.bluff}</td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: defColor, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.def}</td>
                        <td style={{ padding: '0.6rem 0.8rem', color: row.anchor ? '#c7d2fe' : '#94a3b8', fontSize: '0.75rem' }}>{row.desc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Glossário de símbolos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.5rem', margin: '1rem 0 0.5rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { sym: '↑ / ↓', desc: 'acima / abaixo do baseline GTO (33% bluff · 50% def)' },
                { sym: '↑↑ / ↓↓', desc: 'desvio acentuado — dinâmica dominante' },
                { sym: '⊘ teto', desc: 'defesa congelada pelo RP do OOP — fold máximo sustentável' },
                { sym: '⊘ max', desc: 'bluff IP saturado — limite superior imposto pelo BF' },
                { sym: 'ΔRP', desc: 'IP_RP − OOP_RP · positivo = IP mais constringido' },
              ].map(({ sym, desc }) => (
                <div key={sym} style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{sym}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '1rem 0 0', lineHeight: 1.55 }}>
              ★ Âncora empírica: 93 nodes HRC vs GTO Wizard, Raphael Vitoi 2024 &nbsp;·&nbsp; Downward Drift: O&apos;Kearney &amp; Carter, <em>PKO Poker Strategy</em>, D&amp;B Poker 2023
            </p>
          </div>

        </div>
      </details>
    </div>
  );
}
