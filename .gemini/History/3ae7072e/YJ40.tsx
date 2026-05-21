'use client';

/**
 * IDENTITY: Dashboard de Perspectiva Matemática SOTA v4.0 (VITOI - QUANTUM)
 * PATH: src/components/simulator/panels/PerspectivePanel.tsx
 * ROLE: Visualização da Física Quântica do Poker: Piso Dinâmico, RIO Exponencial e Valuation.
 */

import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  calculatePerspectivaVitoi
} from '../../../lib/perspectiva';
import styles from '../simulator.module.css';

// === ESTILOS ===
const PANEL_STYLE: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' };
const LAYER_STEP: React.CSSProperties = {
  padding: '0.75rem',
  borderRadius: '8px',
  borderLeft: '4px solid #6366f1',
  background: 'rgba(255,255,255,0.02)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

interface PerspectivePanelProps {
  initialStacks?: number[];
  initialPrizes?: number[];
}

export default function PerspectivePanel ( { initialStacks, initialPrizes }: Readonly<PerspectivePanelProps> ) {
  const stacks = useMemo( () => initialStacks ?? [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ], [ initialStacks ] );
  const prizes = useMemo( () => initialPrizes ?? [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ], [ initialPrizes ] );

  // --- ESTADO DO SIMULADOR (Quantum v4.0) ---
  const [ winProb, setWinProb ] = useState( 0.55 );
  const [ realization, setRealization ] = useState( 1 );
  const edgeBase = 1.2;
  const [ potSize, setPotSize ] = useState( 7.5 );
  const heroCost = 3.75;
  const [ bountyValue, setBountyValue ] = useState( 0 );
  const [ numPlayers, setNumPlayers ] = useState( 2 );
  const [ isNearPayjump, setIsNearPayjump ] = useState( false );
  const [ blindsRising, setBlindsRising ] = useState( false );
  const [ kappa, setKappa ] = useState( 0.5 ); // Nível de Credibilidade (Axioma Lipe Piv)

  const result = useMemo( () => {
    return calculatePerspectivaVitoi( {
      stacks, prizes,
      heroIdx: 0, villainIdx: 1,
      potSize, heroCost, winProb,
      realizationFactor: realization,
      edgeBase,
      bountyValue,
      kappa,
      numPlayersInPot: numPlayers,
      isNearPayjump,
      blindsRisingSoon: blindsRising
    } );
  }, [ stacks, prizes, potSize, heroCost, winProb, realization, edgeBase, bountyValue, kappa, numPlayers, isNearPayjump, blindsRising ] );

  // --- DATA GEN ---
  const chartData = useMemo( () => {
    const points = [];
    for ( let p = 0; p <= 100; p += 5 )
    {
      const pDecimal = p / 100;
      const r = calculatePerspectivaVitoi( {
        stacks, prizes, heroIdx: 0, villainIdx: 1,
        potSize, heroCost, winProb: pDecimal,
        realizationFactor: realization, edgeBase, bountyValue, kappa,
        numPlayersInPot: numPlayers, isNearPayjump, blindsRisingSoon: blindsRising
      } );
      points.push( { name: `${p}%`, prob: p, "PM Quantum": r.perspectivaPct } );
    }
    return points;
  }, [ stacks, prizes, potSize, heroCost, realization, edgeBase, bountyValue, kappa, numPlayers, isNearPayjump, blindsRising ] );

  return (
    <div className={ styles.glassPanel } style={ PANEL_STYLE }>
      <div style={ { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
        <div>
          <h3 style={ { margin: 0, fontSize: '0.65rem', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em' } }>
            Perspectiva Matemática &middot; v4.0 Quantum
          </h3>
          <p style={ { margin: '0.25rem 0 0', fontSize: '0.55rem', color: '#64748b' } }>
            Física da Decisão: Piso Dinâmico e Dívida RIO
          </p>
        </div>
        <div style={ { fontSize: '0.5rem', background: isNearPayjump ? 'rgba(16,185,129,0.1)' : 'transparent', padding: '4px 8px', borderRadius: '4px', border: isNearPayjump ? '1px solid #10b98133' : '1px solid transparent', color: '#10b981' } }>
          { isNearPayjump && "LADDERING ATIVO" }
        </div>
      </div>

      {/* CONTROLES QUANTUM */ }
      <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' } }>
        <div>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 } }>Oponentes ({ numPlayers })</label>
          <input type="range" min="2" max="5" step="1" value={ numPlayers } onChange={ ( e ) => setNumPlayers( Number.parseInt( e.target.value ) ) } style={ { width: '100%', accentColor: '#f43f5e' } } />
        </div>
        <div style={ { display: 'flex', flexDirection: 'column', gap: '0.2rem', justifyContent: 'center' } }>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' } }>
            <input type="checkbox" checked={ isNearPayjump } onChange={ ( e ) => setIsNearPayjump( e.target.checked ) } /> Perto de Payjump
          </label>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' } }>
            <input type="checkbox" checked={ blindsRising } onChange={ ( e ) => setBlindsRising( e.target.checked ) } /> Blinds Subindo
          </label>
        </div>
        <div>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 } }>PKO Bounty ({ Math.round( bountyValue * 100 ) }%)</label>
          <input type="range" min="0" max="0.1" step="0.005" value={ bountyValue } onChange={ ( e ) => setBountyValue( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#fbbf24' } } />
        </div>

        <div>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 } }>Credibilidade κ ({ Math.round( kappa * 100 ) }%)</label>
          <input type="range" min="0" max="1" step="0.05" value={ kappa } onChange={ ( e ) => setKappa( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#ec4899' } } />
        </div>

        <div style={ { gridColumn: 'span 3', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.2rem 0' } } />

        <div>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 } }>Equity ({ Math.round( winProb * 100 ) }%)</label>
          <input type="range" min="0" max="1" step="0.01" value={ winProb } onChange={ ( e ) => setWinProb( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#6366f1' } } />
        </div>
        <div>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 } }>Pot ({ potSize }bb)</label>
          <input type="range" min="2" max="100" step="0.5" value={ potSize } onChange={ ( e ) => setPotSize( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#f59e0b' } } />
        </div>
        <div>
          <label style={ { fontSize: '0.45rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 900 } }>Realização R ({ realization }x)</label>
          <input type="range" min="0.5" max="1.5" step="0.05" value={ realization } onChange={ ( e ) => setRealization( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#10b981' } } />
        </div>
      </div>

      {/* PIPELINE DE TRANSMUTAÇÃO QUANTUM */ }
      <div style={ { display: 'flex', flexDirection: 'column', gap: '0.4rem' } }>
        <div style={ { ...LAYER_STEP, borderLeftColor: '#475569' } }>
          <span style={ { fontSize: '0.5rem', fontWeight: 900, color: '#94a3b8' } }>LAYER 1: ICMev</span>
          <span style={ { fontSize: '0.65rem', fontWeight: 900 } }>{ result.currentEquityPct.toFixed( 2 ) }%</span>
        </div>

        <div style={ { ...LAYER_STEP, borderLeftColor: '#f59e0b' } }>
          <div>
            <span style={ { fontSize: '0.5rem', fontWeight: 900, color: '#f59e0b', display: 'block' } }>LAYER 2: ESPERANÇA MATEMÁTICA (LÓGICA)</span>
            <span style={ { fontSize: '0.4rem', color: '#64748b' } }>Valuation: { result.valuation.toFixed( 2 ) }x | Dívida RIO: -{ result.rioLiability.toFixed( 2 ) }%</span>
          </div>
          <span style={ { fontSize: '0.65rem', fontWeight: 900 } }>Explosão: { ( ( result.valuation - 1 ) * 100 ).toFixed( 0 ) }%</span>
        </div>

        <div style={ { ...LAYER_STEP, borderLeftColor: '#10b981' } }>
          <div>
            <span style={ { fontSize: '0.5rem', fontWeight: 900, color: '#10b981', display: 'block' } }>LAYER 3: EXPECTATIVA MATEMÁTICA (PREDITIVA)</span>
            <span style={ { fontSize: '0.4rem', color: '#64748b' } }>Piso (EV_fold): { result.dynamicEvFold.toFixed( 2 ) }% | FGS Health: { result.fgsHealth.toFixed( 2 ) }x</span>
          </div>
          <span style={ { fontSize: '0.65rem', fontWeight: 900 } }>{ result.isActionBetterThanFold ? "Soberano" : "Insolvente" }</span>
        </div>

        <div style={ { ...LAYER_STEP, borderLeftColor: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '1rem' } }>
          <div>
            <span style={ { fontSize: '0.6rem', fontWeight: 900, color: '#818cf8', display: 'block' } }>LAYER 4: PERSPECTIVA MATEMÁTICA (PM)</span>
            <span style={ { fontSize: '0.45rem', color: '#64748b' } }>Edge Amortizada: { result.amortizedEdge.toFixed( 2 ) }x | Ci: { result.ci.toFixed( 2 ) }</span>
          </div>
          { Math.abs( result.perspectivaPct ) <= 5 && (
            <div style={ { marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px', fontSize: '0.45rem', color: '#f472b6', fontWeight: 800 } }>
              ⚠️ ZONA MARGINAL (EV INSTÁVEL): Decisão altamente sensível à imprecisão de range do oponente.
              <div style={ { marginTop: '0.3rem', color: '#e2e8f0', fontStyle: 'italic', fontWeight: 600 } }>&quot;O tamanho do desvio (exploit) deve ser proporcional à credibilidade da sua informação. (Nunca temos 0% de informação, e nunca temos 100%).&quot; — Axioma Lipe Piv</div>
            </div>
          ) }
          <span style={ { fontSize: '1.2rem', fontWeight: 900, color: result.isActionBetterThanFold ? '#10b981' : '#f43f5e' } }>
            { result.perspectivaPct.toFixed( 2 ) }%
          </span>
        </div>
      </div>

      {/* EQUITY CURVES CHART */ }
      <div style={ { height: '140px', background: 'rgba(15,23,42,0.4)', borderRadius: '12px', padding: '1rem 0.5rem 0.5rem 0', border: '1px solid rgba(255,255,255,0.05)' } }>
        <ResponsiveContainer width="100%" height="100%" minWidth={ 1 } minHeight={ 1 } initialDimension={ { width: 1, height: 1 } }>
          <LineChart data={ chartData }>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
            <XAxis dataKey="name" fontSize={ 8 } tick={ { fill: '#475569' } } axisLine={ false } tickLine={ false } />
            <YAxis fontSize={ 8 } tick={ { fill: '#475569' } } axisLine={ false } tickLine={ false } tickFormatter={ ( v ) => `${v.toFixed( 0 )}%` } />
            <Tooltip contentStyle={ { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.6rem', borderRadius: '8px' } } />
            <ReferenceLine y={ 0 } stroke="#475569" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="PM Quantum" stroke="#818cf8" strokeWidth={ 2.5 } dot={ false } />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* DIAGNÓSTICO SOTA */ }
      <div style={ { padding: '0.75rem', background: 'rgba(99,102,241,0.05)', borderLeft: '3px solid #6366f1', borderRadius: '4px', fontSize: '0.5rem', color: '#cbd5e1', lineHeight: 1.6 } }>
        <strong>SÍNTESE QUANTUM:</strong> { result.diagnostico }
        <br />
        <span style={ { color: '#94a3b8' } }>Protocolo: { result.isActionBetterThanFold ? "A utilidade da colisão neutraliza a erosão do tempo." : "A omissão estratégica preserva o capital sistêmico." }</span>
        { isNearPayjump && <div style={ { marginTop: '0.5rem', color: '#fbbf24', fontWeight: 700 } }>[EXTREMA AVERSÃO AO RISCO]: A pressão de payjump induz o overfold. A inversão de EVs negativos da teoria pura exige um desvio (exploit) estritamente proporcional à credibilidade dessa leitura (Axioma Lipe Piv).</div> }
      </div>
    </div>
  );
}
