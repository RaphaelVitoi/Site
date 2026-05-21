'use client';

/**
 * IDENTITY: Dashboard de Perspectiva Matemática SOTA v4.0 (VITOI - QUANTUM)
 * PATH: src/components/simulator/panels/PerspectivePanel.tsx
 * ROLE: Visualização da Física Quântica do Poker: Piso Dinâmico, RIO Exponencial e Valuation.
 */

import { MetricTooltip } from '@/app/ICMlaboratory/RiskPremiumDashboard';
import type React from 'react';
import { useMemo, useState } from 'react';
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
const PANEL_STYLE: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.8rem', padding: '2rem' };
const LAYER_STEP: React.CSSProperties = {
  padding: '1.25rem 1.5rem',
  borderRadius: '12px',
  borderLeft: '4px solid var(--accent-indigo)',
  background: 'rgba(15,23,42,0.4)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease'
};

const INITIAL_CHART_DIMENSION = { width: 1, height: 1 };

interface PerspectivePanelProps {
  initialStacks?: number[];
  initialPrizes?: number[];
  anteSize?: number;
  heroInvestedBb?: number;
  currentPotBb?: number;
}

export default function PerspectivePanel ( { initialStacks, initialPrizes, anteSize = 12.5, heroInvestedBb = 1, currentPotBb = 2.5 }: Readonly<PerspectivePanelProps> ) {
  const stacks = useMemo( () => initialStacks ?? [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ], [ initialStacks ] );
  const prizes = useMemo( () => initialPrizes ?? [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ], [ initialPrizes ] );

  // --- ESTADO DO SIMULADOR (Quantum v4.0) ---
  const [ winProb, setWinProb ] = useState( 0.55 );
  const [ realization, setRealization ] = useState( 1 );
  const edgeBase = 1.2;
  const [ bountyValue, setBountyValue ] = useState( 0 );
  const [ numPlayers, setNumPlayers ] = useState( 2 );
  const [ isNearPayjump, setIsNearPayjump ] = useState( false );
  const [ blindsRising, setBlindsRising ] = useState( false );
  const [ kappa, setKappa ] = useState( 0.5 ); // Nível de Credibilidade (Axioma Lipe Piv)

  // SOTA: O Sunk Cost e Pot Size herdam da arvore global para unificar a termodinamica.
  const potSize = currentPotBb;
  const foldEvBb = useMemo( () => -( Math.abs( heroInvestedBb ) + ( anteSize / 100 ) ), [ heroInvestedBb, anteSize ] );
  const heroCost = Math.abs( foldEvBb );

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

  // SOTA: Render Shield para o Gráfico (Economia Generalizada)
  // Evita o re-render catastrófico do Recharts quando o slider 'winProb' (Equity) é deslizado.
  const chartElement = useMemo( () => (
    <ResponsiveContainer width="100%" height="100%" minWidth={ 0 } minHeight={ 0 } initialDimension={ INITIAL_CHART_DIMENSION }>
      <LineChart data={ chartData }>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={ false } />
        <XAxis dataKey="name" fontSize={ 8 } tick={ { fill: '#475569' } } axisLine={ false } tickLine={ false } />
        <YAxis fontSize={ 8 } tick={ { fill: '#475569' } } axisLine={ false } tickLine={ false } tickFormatter={ ( v ) => `${v.toFixed( 0 )}%` } />
        <Tooltip contentStyle={ { background: 'var(--bg-panel)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.6rem', borderRadius: '8px' } } />
        <ReferenceLine y={ 0 } stroke="#475569" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="PM Quantum" stroke="#818cf8" strokeWidth={ 2.5 } dot={ false } />
      </LineChart>
    </ResponsiveContainer>
  ), [ chartData ] );

  return (
    <div className={ styles.glassPanel } style={ PANEL_STYLE }>
      <div style={ { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
        <div>
          <h3 style={ { margin: 0, fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.15em' } }>
            Perspectiva Matemática &middot; v4.0 Quantum
          </h3>
          <p style={ { margin: '0.35rem 0 0', fontSize: '0.7rem', color: 'var(--text-dim)' } }>
            Física da Decisão: Piso Dinâmico e Dívida RIO
          </p>
        </div>
        <div style={ { fontSize: '0.65rem', fontWeight: 800, background: isNearPayjump ? 'rgba(16,185,129,0.1)' : 'transparent', padding: '6px 12px', borderRadius: '6px', border: isNearPayjump ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent', color: 'var(--accent-emerald)' } }>
          { isNearPayjump && "LADDERING ATIVO" }
        </div>
      </div>

      {/* CONTROLES QUANTUM */ }
      <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' } }>
        <div>
          <label htmlFor="perspective-opponents" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 } }>Oponentes ({ numPlayers })</label>
          <input id="perspective-opponents" type="range" min="2" max="5" step="1" value={ numPlayers } onChange={ ( e ) => setNumPlayers( Number.parseInt( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-danger)' } } />
        </div>
        <div style={ { display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' } }>
          <label htmlFor="perspective-payjump" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' } }>
            <input id="perspective-payjump" type="checkbox" checked={ isNearPayjump } onChange={ ( e ) => setIsNearPayjump( e.target.checked ) } style={ { width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' } } /> Perto de Payjump
          </label>
          <label htmlFor="perspective-blinds" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' } }>
            <input id="perspective-blinds" type="checkbox" checked={ blindsRising } onChange={ ( e ) => setBlindsRising( e.target.checked ) } style={ { width: '16px', height: '16px', accentColor: 'var(--accent-danger)' } } /> Blinds Subindo
          </label>
        </div>
        <div>
          <label htmlFor="perspective-pko" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 } }>PKO Bounty ({ Math.round( bountyValue * 100 ) }%)</label>
          <input id="perspective-pko" type="range" min="0" max="0.1" step="0.005" value={ bountyValue } onChange={ ( e ) => setBountyValue( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-gold)' } } />
        </div>

        <div>
          <label htmlFor="perspective-kappa" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 } }>Credibilidade κ ({ Math.round( kappa * 100 ) }%)</label>
          <input id="perspective-kappa" type="range" min="0" max="1" step="0.05" value={ kappa } onChange={ ( e ) => setKappa( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-pink)' } } />
        </div>

        <div style={ { gridColumn: 'span 3', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' } } />

        <div>
          <label htmlFor="perspective-equity" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 } }>Equity ({ Math.round( winProb * 100 ) }%)</label>
          <input id="perspective-equity" type="range" min="0" max="1" step="0.01" value={ winProb } onChange={ ( e ) => setWinProb( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-indigo)' } } />
        </div>
        <div>
          <span style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, display: 'block' } }>Sunk Cost / Pot</span>
          <div style={ { fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-amber)', fontFamily: 'monospace', marginTop: '0.35rem' } }>-{ heroCost.toFixed( 2 ) }bb / { potSize.toFixed( 1 ) }bb</div>
        </div>
        <div>
          <label htmlFor="perspective-realization" style={ { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900 } }>Realização R ({ realization }x)</label>
          <input id="perspective-realization" type="range" min="0.5" max="1.5" step="0.05" value={ realization } onChange={ ( e ) => setRealization( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-emerald)' } } />
        </div>
      </div>

      {/* PIPELINE DE TRANSMUTAÇÃO QUANTUM */ }
      <div style={ { display: 'flex', flexDirection: 'column', gap: '0.8rem' } }>
        <MetricTooltip title="LAYER 1: ICMev (Snapshot)" desc="A fotografia estática. Fichas convertidas em equidade de prêmio (Malmuth-Harville). Ignora completamente a variância, a posição e o tempo. Útil como base, perigoso como conclusão.">
          <div className="hover:bg-slate-800/60 transition-colors" style={ { ...LAYER_STEP, borderLeftColor: 'var(--text-darker)' } }>
            <span style={ { fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' } }>LAYER 1: ICMev</span>
            <span style={ { fontSize: '1rem', fontWeight: 900, color: 'var(--text-light)' } }>{ result.currentEquityPct.toFixed( 2 ) }%</span>
          </div>
        </MetricTooltip>

        <MetricTooltip title="LAYER 2: Esperança Matemática" desc="A injeção da Lógica. O Valuation corrige a assimetria (fichas ganhas vs perdidas) e a Dívida RIO pune a insolvência de múltiplos jogadores no pote.">
          <div className="hover:bg-slate-800/60 transition-colors" style={ { ...LAYER_STEP, borderLeftColor: 'var(--accent-amber)' } }>
            <div>
              <span style={ { fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-amber)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' } }>LAYER 2: ESPERANÇA MATEMÁTICA (LÓGICA)</span>
              <span style={ { fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 } }>Valuation: <strong className="text-amber-500/80">{ result.valuation.toFixed( 2 ) }x</strong> | Dívida RIO: <strong className="text-amber-500/80">-{ result.rioLiability.toFixed( 2 ) }%</strong></span>
            </div>
            <span style={ { fontSize: '1rem', fontWeight: 900, color: 'var(--accent-amber)' } }>Explosão: { ( ( result.valuation - 1 ) * 100 ).toFixed( 0 ) }%</span>
          </div>
        </MetricTooltip>

        <MetricTooltip title="LAYER 3: Expectativa Preditiva" desc="A Psicologia do Tempo. FGS mede a urgência da sobrevivência (t-3 blinds) e o Piso Dinâmico estabelece o verdadeiro custo do fold.">
          <div className="hover:bg-slate-800/60 transition-colors" style={ { ...LAYER_STEP, borderLeftColor: 'var(--accent-emerald)' } }>
            <div>
              <span style={ { fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-emerald)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' } }>LAYER 3: EXPECTATIVA MATEMÁTICA (PREDITIVA)</span>
              <span style={ { fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 } }>Piso (EV_fold): <strong className="text-emerald-500/80">{ result.dynamicEvFold.toFixed( 2 ) }%</strong> | FGS Health: <strong className="text-emerald-500/80">{ result.fgsHealth.toFixed( 2 ) }x</strong></span>
            </div>
            <span style={ { fontSize: '1rem', fontWeight: 900, color: 'var(--accent-emerald)' } }>{ result.isActionBetterThanFold ? "Soberano" : "Insolvente" }</span>
          </div>
        </MetricTooltip>

        <MetricTooltip title="LAYER 4: Perspectiva Matemática" desc="A Síntese Máxima SOTA. Se o valor é positivo, a utilidade da colisão supera o piso estrutural do fold e a erosão do tempo, justificando a agressão.">
          <div style={ { borderLeft: '4px solid var(--accent-indigo-light)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 8px 30px rgba(99,102,241,0.15)' } }>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
              <div>
                <span style={ { fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-indigo-light)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' } }>LAYER 4: PERSPECTIVA MATEMÁTICA (PM)</span>
                <span style={ { fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600 } }>Edge Amortizada: <strong className="text-indigo-300">{ result.amortizedEdge.toFixed( 2 ) }x</strong> | Cᵢ: <strong className="text-indigo-300">{ result.ci.toFixed( 2 ) }</strong> | κ: <strong className="text-indigo-300">{ Math.round( kappa * 100 ) }%</strong></span>
              </div>
              <span style={ { fontSize: '2rem', fontWeight: 900, color: result.isActionBetterThanFold ? 'var(--accent-emerald)' : 'var(--accent-danger)' } }>
                { result.perspectivaPct.toFixed( 2 ) }%
              </span>
            </div>
            { Math.abs( result.perspectivaPct ) <= 5 && (
              <div style={ { marginTop: '1rem', padding: '0.85rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px', fontSize: '0.65rem', color: 'var(--accent-pink-light)', fontWeight: 800, lineHeight: 1.5 } }>
                <i className="fa-solid fa-triangle-exclamation mr-2"></i> ZONA MARGINAL (EV INSTÁVEL): Decisão altamente sensível à imprecisão de range.
                <div style={ { marginTop: '0.4rem', color: 'var(--text-bright)', fontStyle: 'italic', fontWeight: 600 } }>&quot;O tamanho do desvio (exploit) deve ser proporcional à credibilidade da sua informação.&quot; — Axioma Lipe Piv</div>
              </div>
            ) }
          </div>
        </MetricTooltip>
      </div>

      {/* EQUITY CURVES CHART */ }
      <div style={ { height: '180px', background: 'rgba(15,23,42,0.4)', borderRadius: '16px', padding: '1.25rem 0.5rem 0.5rem 0', border: '1px solid rgba(255,255,255,0.05)' } }>
        { chartElement }
      </div>

      {/* DIAGNÓSTICO SOTA */ }
      <div style={ { padding: '1.25rem', background: 'rgba(99,102,241,0.08)', borderLeft: '4px solid var(--accent-indigo)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: 1.6 } }>
        <strong className="text-indigo-400">SÍNTESE QUANTUM:</strong> { result.diagnostico }
        <div style={ { marginTop: '0.4rem' } }>
          <span style={ { color: 'var(--text-muted)' } }>Protocolo: { result.isActionBetterThanFold ? "A utilidade da colisão neutraliza a erosão do tempo." : "A omissão estratégica preserva o capital sistêmico." }</span>
        </div>
        { isNearPayjump && <div style={ { marginTop: '0.8rem', padding: '0.75rem', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-gold)', fontWeight: 700 } }><i className="fa-solid fa-bolt mr-2"></i>[EXTREMA AVERSÃO AO RISCO]: A pressão de payjump induz o overfold. A inversão de EVs negativos da teoria pura exige um desvio (exploit) estritamente proporcional à credibilidade dessa leitura (Axioma Lipe Piv).</div> }
      </div>
    </div>
  );
}
