/**
 * IDENTITY: Widget do Corredor Estocástico e Âncoras Canônicas (SOTA v8.0 GOLD)
 * PATH: src/components/simulator/ui/ProspectRiskCorridorWidget.tsx
 * ROLE: Exibe elementos específicos (âncoras ativáveis) com critérios lógicos explícitos,
 *       a visualização da tendência central (μ) e bandas de desvio-padrão (±1σ, ±2σ),
 *       curva contínua de densidade gaussiana e modelagem de Prospect Theory (Kahneman-Tversky).
 *
 * @format
 */

'use client';

import { useMemo, useState } from 'react';
import {
  CANONICAL_ANCHORS,
  calculateStochasticCorridor,
  type CanonicalAnchor,
  type StochasticCorridorInput,
} from '@/lib/prospectCorridor';

// Escala SVG para o corredor (-40% a +50%)
const MIN_RANGE = -40;
const MAX_RANGE = 50;
const RANGE_SPAN = MAX_RANGE - MIN_RANGE;

function toSvgX(val: number): number {
  const clamped = Math.max(MIN_RANGE, Math.min(MAX_RANGE, val));
  return ((clamped - MIN_RANGE) / RANGE_SPAN) * 100;
}

interface ProspectRiskCorridorWidgetProps {
  rawEquity: number;
  realizationFactor: number;
  psiFactor: number;
  potOdds?: number;
  spr?: number;
  numPlayers?: number;
  lossAversionLambda?: number;
  isNearPayjump?: boolean;
  activeAnchorId: string;
  onSelectAnchor: (anchor: CanonicalAnchor) => void;
}

export function ProspectRiskCorridorWidget({
  rawEquity,
  realizationFactor,
  psiFactor,
  potOdds = 0.33,
  spr = 2.0,
  numPlayers = 2,
  lossAversionLambda = 2.25,
  isNearPayjump = false,
  activeAnchorId,
  onSelectAnchor,
}: Readonly<ProspectRiskCorridorWidgetProps>) {
  const [viewMode, setViewMode] = useState<'corridor' | 'gaussian' | 'prospect_curve'>('corridor');
  const [localLambda, setLocalLambda] = useState<number>(lossAversionLambda);

  const corridorInput: StochasticCorridorInput = useMemo(
    () => ({
      rawEquity,
      realizationFactor,
      psiFactor,
      potOdds,
      spr,
      numPlayers,
      lossAversionLambda: localLambda,
      isNearPayjump,
    }),
    [
      rawEquity,
      realizationFactor,
      psiFactor,
      potOdds,
      spr,
      numPlayers,
      localLambda,
      isNearPayjump,
    ],
  );

  const corridor = useMemo(
    () => calculateStochasticCorridor(corridorInput),
    [corridorInput],
  );

  const currentAnchor = useMemo(() => {
    return (
      CANONICAL_ANCHORS.find((a) => a.id === activeAnchorId) ||
      CANONICAL_ANCHORS.find((a) => a.id === corridor.matchedAnchorId) ||
      CANONICAL_ANCHORS[0]
    );
  }, [activeAnchorId, corridor.matchedAnchorId]);

  const xZero = toSvgX(0);
  const xMu = toSvgX(corridor.mu);
  const x1Lower = toSvgX(corridor.band1sLower);
  const x1Upper = toSvgX(corridor.band1sUpper);
  const x2Lower = toSvgX(corridor.band2sLower);
  const x2Upper = toSvgX(corridor.band2sUpper);

  // Curva Gaussiana SVG (PDF: Probability Density Function)
  const gaussianPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const mu = corridor.mu;
    const sigma = Math.max(1.0, corridor.sigma);

    for (let xVal = MIN_RANGE; xVal <= MAX_RANGE; xVal += 1.5) {
      const z = (xVal - mu) / sigma;
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      // Normalização de altura para viewBox 100 x 50
      const normY = 46 - pdf * sigma * 28;
      pts.push({ x: toSvgX(xVal), y: Math.max(4, Math.min(48, normY)) });
    }

    const pathD = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return pathD;
  }, [corridor.mu, corridor.sigma]);

  // Curva de Prospecto Kahneman & Tversky v(x)
  const prospectPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const alpha = 0.88;
    const beta = 0.88;
    const lambda = localLambda;

    for (let xVal = -30; xVal <= 30; xVal += 1) {
      let vx = 0;
      if (xVal >= 0) {
        vx = Math.pow(xVal, alpha);
      } else {
        vx = -lambda * Math.pow(Math.abs(xVal), beta);
      }

      // Mapear xVal de [-30, 30] para [5, 95] e vx para [45, 5]
      const svgX = 50 + (xVal / 30) * 45;
      const svgY = 25 - (vx / 45) * 20;
      pts.push({ x: svgX, y: Math.max(4, Math.min(46, svgY)) });
    }

    const pathD = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return pathD;
  }, [localLambda]);

  const statusTheme = useMemo(() => {
    switch (corridor.decisionStatus) {
      case 'soberana':
        return {
          badgeClass: 'text-accent-emerald border-emerald-500/30 bg-emerald-500/10',
          dotClass: 'bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]',
          label: 'AÇÃO SOBERANA (ROBUSTA SOB 1σ)',
          band1sFill: 'rgba(16, 185, 129, 0.25)',
          band2sFill: 'rgba(16, 185, 129, 0.10)',
          strokeColor: '#10b981',
        };
      case 'marginal':
        return {
          badgeClass: 'text-accent-amber border-amber-500/30 bg-amber-500/10',
          dotClass: 'bg-accent-amber shadow-[0_0_8px_var(--accent-amber)] animate-pulse',
          label: 'ZONA MARGINAL (SENSÍVEL À VARIÂNCIA)',
          band1sFill: 'rgba(245, 158, 11, 0.25)',
          band2sFill: 'rgba(245, 158, 11, 0.10)',
          strokeColor: '#f59e0b',
        };
      case 'insolvente':
      default:
        return {
          badgeClass: 'text-accent-rose border-rose-500/30 bg-rose-500/10',
          dotClass: 'bg-accent-rose shadow-[0_0_8px_var(--accent-rose)] animate-pulse',
          label: 'INSOLVÊNCIA DE PERSPECTIVA (OVERFOLD)',
          band1sFill: 'rgba(244, 63, 94, 0.25)',
          band2sFill: 'rgba(244, 63, 94, 0.10)',
          strokeColor: '#f43f5e',
        };
    }
  }, [corridor.decisionStatus]);

  return (
    <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 md:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-accent-indigo/10 blur-3xl" />

      {/* HEADER DO MOTOR EXPERIMENTAL */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)] animate-pulse" />
            <span className="text-[0.65rem] font-black tracking-[0.3em] text-accent-indigo-light uppercase">
              Motor Experimental · Corredor Estocástico
            </span>
            <span className="rounded-md border border-accent-indigo/30 bg-accent-indigo/15 px-2 py-0.5 font-mono text-[0.55rem] font-bold text-accent-indigo-light uppercase">
              Ψ × R ± σ
            </span>
          </div>
          <p className="m-0 mt-1 text-[0.65rem] font-medium tracking-wide text-text-dim">
            Modelagem contínua de tendência central e dispersão por desvio-padrão ancorada no Tratado PMev.
          </p>
        </div>

        {/* STATUS DA DECISÃO */}
        <div
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-2 font-mono text-[0.6rem] font-black tracking-widest uppercase shadow-lg transition-all ${statusTheme.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusTheme.dotClass}`} />
          {statusTheme.label}
        </div>
      </div>

      {/* SELETOR DE ÂNCORAS CANÔNICAS ATIVÁVEIS */}
      <div className="my-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[0.6rem] font-black tracking-[0.25em] text-text-muted uppercase">
            Âncoras Canônicas Ativáveis (Pontos de Referência)
          </span>
          <span className="text-[0.55rem] font-bold text-text-darker tracking-wider uppercase">
            Selecione para Ativar &middot; Calibração Instantânea
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {CANONICAL_ANCHORS.map((anchor) => {
            const isSelected = activeAnchorId === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => onSelectAnchor(anchor)}
                aria-pressed={isSelected}
                className={`group relative flex flex-col items-start justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-accent-indigo/50 bg-accent-indigo/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'border-white/5 bg-black/40 hover:border-white/15 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[0.55rem] font-black uppercase text-white">
                    {anchor.tag}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1.5 font-mono text-[0.55rem] font-black tracking-widest text-accent-indigo-light uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                      <span>ATIVA</span>
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <strong className="block text-[0.68rem] font-black tracking-wide text-white">
                    {anchor.name}
                  </strong>
                  <span className="block text-[0.58rem] font-medium text-text-dim">
                    {anchor.subtitle}
                  </span>
                </div>

                <div className="mt-3 flex w-full items-center justify-between border-t border-white/5 pt-2 font-mono text-[0.55rem] text-text-muted">
                  <span>Ψ {anchor.defaults.psiFactor.toFixed(2)}x</span>
                  <span>R {anchor.defaults.realizationFactor.toFixed(2)}x</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PAINEL DE CRITÉRIOS LÓGICOS EXPLÍCITOS */}
      {currentAnchor && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-black/60 p-5 shadow-inner">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] font-black tracking-[0.25em] text-accent-indigo-light uppercase">
                  Critério Lógico Explícito:
                </span>
                <span className="text-[0.55rem] font-mono font-bold text-text-darker uppercase">
                  {currentAnchor.teoremaRef}
                </span>
              </div>
              <p className="m-0 text-[0.72rem] leading-relaxed font-medium text-indigo-100/90">
                {currentAnchor.criterioLogico}
              </p>
              <div className="pt-1 text-[0.68rem] leading-relaxed text-text-dim italic">
                &ldquo;{currentAnchor.diretrizEstrategica}&rdquo;
              </div>
            </div>

            {/* SINTESE PARAMETRICA */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2.5 font-mono text-[0.6rem]">
              <div className="flex flex-col">
                <span className="text-[0.5rem] font-bold text-text-darker uppercase">Ψ Fator</span>
                <span className="font-black text-accent-rose-light">
                  {psiFactor.toFixed(2)}x
                </span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[0.5rem] font-bold text-text-darker uppercase">R Realiz.</span>
                <span className="font-black text-accent-emerald">
                  {realizationFactor.toFixed(2)}x
                </span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div className="flex flex-col">
                <span className="text-[0.5rem] font-bold text-text-darker uppercase">λ Aversão</span>
                <span className="font-black text-accent-amber">
                  {localLambda.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELETOR DE MODO DE VISUALIZAÇÃO GRÁFICA (ADITIVO SOTA) */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('corridor')}
            className={`px-3 py-1 rounded-lg text-[0.6rem] font-mono font-bold uppercase transition-all ${
              viewMode === 'corridor'
                ? 'bg-accent-indigo text-white shadow-sm'
                : 'text-text-dim hover:text-white'
            }`}
          >
            Corredor (μ ± σ)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('gaussian')}
            className={`px-3 py-1 rounded-lg text-[0.6rem] font-mono font-bold uppercase transition-all ${
              viewMode === 'gaussian'
                ? 'bg-accent-indigo text-white shadow-sm'
                : 'text-text-dim hover:text-white'
            }`}
          >
            Densidade Gaussiana (PDF)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('prospect_curve')}
            className={`px-3 py-1 rounded-lg text-[0.6rem] font-mono font-bold uppercase transition-all ${
              viewMode === 'prospect_curve'
                ? 'bg-accent-indigo text-white shadow-sm'
                : 'text-text-dim hover:text-white'
            }`}
          >
            Curva Kahneman-Tversky v(x)
          </button>
        </div>

        {/* AJUSTE DINÂMICO DE AVERSÃO À PERDA λ */}
        <div className="flex items-center gap-2 text-[0.6rem] font-mono">
          <span className="text-text-muted">Sensibilidade λ:</span>
          <input
            type="range"
            min="1.0"
            max="3.5"
            step="0.05"
            value={localLambda}
            onChange={(e) => setLocalLambda(Number.parseFloat(e.target.value))}
            className="w-20 accent-accent-amber h-1.5 bg-white/10 rounded-lg cursor-pointer"
            aria-label="Ajustar coeficiente lambda de aversão à perda"
          />
          <span className="text-accent-amber font-bold">{localLambda.toFixed(2)}x</span>
        </div>
      </div>

      {/* VISUALIZAÇÃO DO CORREDOR ESTOCÁSTICO (SVG RESPONSIVO) */}
      <div className="rounded-3xl border border-white/5 bg-black/50 p-5 shadow-2xl">
        <div className="mb-2 flex items-center justify-between text-[0.6rem] font-black tracking-widest text-text-muted uppercase">
          <span>Corredor Estocástico: Tendência (μ) & Dispersão (±1σ, ±2σ)</span>
          <span className="font-mono text-white">
            μ = {corridor.mu > 0 ? `+${corridor.mu.toFixed(1)}%` : `${corridor.mu.toFixed(1)}%`}{' '}
            &middot; σ = ±{corridor.sigma.toFixed(1)}%
          </span>
        </div>

        <div className="relative h-24 w-full overflow-hidden rounded-2xl bg-slate-950/80 p-2">
          {viewMode === 'corridor' && (
            <svg
              className="h-full w-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              aria-label="Gráfico do Corredor Estocástico"
            >
              {/* Grade de fundo */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              
              {/* Linha de Breakeven (Zero) */}
              <line
                x1={xZero}
                y1="4"
                x2={xZero}
                y2="36"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.75"
                strokeDasharray="1.5, 1.5"
              />

              {/* Banda 2σ (Dispersão Total 95.4%) */}
              <rect
                x={Math.min(x2Lower, x2Upper)}
                y="10"
                width={Math.max(0.5, Math.abs(x2Upper - x2Lower))}
                height="20"
                fill={statusTheme.band2sFill}
                rx="3"
              />

              {/* Banda 1σ (Intervalo de Confiança 68.3%) */}
              <rect
                x={Math.min(x1Lower, x1Upper)}
                y="13"
                width={Math.max(0.5, Math.abs(x1Upper - x1Lower))}
                height="14"
                fill={statusTheme.band1sFill}
                rx="2"
              />

              {/* Marcadores de extremos 2σ */}
              <line
                x1={x2Lower}
                y1="8"
                x2={x2Lower}
                y2="32"
                stroke={statusTheme.strokeColor}
                strokeWidth="0.75"
                opacity="0.6"
              />
              <line
                x1={x2Upper}
                y1="8"
                x2={x2Upper}
                y2="32"
                stroke={statusTheme.strokeColor}
                strokeWidth="0.75"
                opacity="0.6"
              />

              {/* Linha Central de Tendência (μ) */}
              <line
                x1={xMu}
                y1="5"
                x2={xMu}
                y2="35"
                stroke={statusTheme.strokeColor}
                strokeWidth="1.5"
              />
              <circle
                cx={xMu}
                cy="20"
                r="2.5"
                fill="#ffffff"
                stroke={statusTheme.strokeColor}
                strokeWidth="1"
              />
            </svg>
          )}

          {viewMode === 'gaussian' && (
            <svg
              className="h-full w-full"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
              aria-label="Gráfico do Corredor Estocástico"
            >
              {/* Eixo horizontal */}
              <line x1="0" y1="46" x2="100" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              {/* Linha Zero */}
              <line x1={xZero} y1="4" x2={xZero} y2="46" stroke="#64748b" strokeWidth="0.6" strokeDasharray="1.5, 1.5" />
              {/* Linha Central μ */}
              <line x1={xMu} y1="4" x2={xMu} y2="46" stroke={statusTheme.strokeColor} strokeWidth="1" />
              {/* Curva Gaussiana */}
              <path d={gaussianPoints} fill="none" stroke={statusTheme.strokeColor} strokeWidth="1.5" />
              {/* Ponto μ no topo */}
              <circle cx={xMu} cy={12} r="2.5" fill="#ffffff" stroke={statusTheme.strokeColor} strokeWidth="1" />
            </svg>
          )}

          {viewMode === 'prospect_curve' && (
            <svg
              className="h-full w-full"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
              aria-label="Gráfico do Corredor Estocástico"
            >
              {/* Eixos cartesianos X e Y centrados em (50, 25) */}
              <line x1="5" y1="25" x2="95" y2="25" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="50" y1="5" x2="50" y2="45" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              {/* Curva Assimétrica de Kahneman-Tversky v(x) */}
              <path d={prospectPoints} fill="none" stroke="#f59e0b" strokeWidth="1.8" />
              {/* Labels explicativos */}
              <text x="75" y="16" fill="#10b981" fontSize="3.5" fontFamily="var(--font-mono)">
                Ganhos (Côncavo)
              </text>
              <text x="10" y="38" fill="#f43f5e" fontSize="3.5" fontFamily="var(--font-mono)">
                Perdas (Convexo · -λ)
              </text>
            </svg>
          )}
        </div>

        {/* RÉGUA DE LEGENDA DO CORREDOR */}
        <div className="mt-3 flex items-center justify-between font-mono text-[0.55rem] text-text-darker">
          <span>Worst-Case (VaR -2σ): {corridor.band2sLower}%</span>
          <span className="text-text-muted">Piso Breakeven: 0.0%</span>
          <span>Upside (+2σ): +{corridor.band2sUpper}%</span>
        </div>
      </div>

      {/* METRICAS CHAVE CONSOLIDADAS */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Tendência Central (μ)
          </span>
          <strong
            className={`mt-1 block font-mono text-xl font-black tabular-nums ${
              corridor.mu >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
            }`}
          >
            {corridor.mu >= 0 ? `+${corridor.mu.toFixed(1)}%` : `${corridor.mu.toFixed(1)}%`}
          </strong>
          <span className="text-[0.55rem] text-text-dim">Margem sobre equilíbrio</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Dispersão (σ)
          </span>
          <strong className="mt-1 block font-mono text-xl font-black text-white tabular-nums">
            ±{corridor.sigma.toFixed(1)}%
          </strong>
          <span className="text-[0.55rem] text-text-dim">Volatilidade estocástica</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Prob. de Solvência
          </span>
          <strong className="mt-1 block font-mono text-xl font-black text-accent-indigo-light tabular-nums">
            {(corridor.solvencyProbability * 100).toFixed(1)}%
          </strong>
          <span className="text-[0.55rem] text-text-dim">P(PMev &gt; Baseline)</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
          <span className="block text-[0.52rem] font-black tracking-widest text-text-muted uppercase">
            Equidade Efetiva (E × R)
          </span>
          <strong className="mt-1 block font-mono text-xl font-black text-accent-amber tabular-nums">
            {corridor.effectiveEquityPct.toFixed(1)}%
          </strong>
          <span className="text-[0.55rem] text-text-dim">
            Necessária: {corridor.requiredEquityPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
