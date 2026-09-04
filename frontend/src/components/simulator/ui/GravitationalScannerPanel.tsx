'use client';

import { useMemo, useState } from 'react';
import { classifyTier, type StackTier } from '@/lib/perspectiva';

interface GravitationalScannerProps {
  stacks: number[];
  heroIdx: number;
  playerNames?: string[];
}

const TIER_META: Record<
  StackTier,
  {
    name: string;
    label: string;
    orbitRadius: number; // Percentual no viewBox 400x400
    color: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    description: string;
  }
> = {
  micro: {
    name: 'Micro Stack',
    label: 'MICRO (< 10bb)',
    orbitRadius: 75,
    color: '#f43f5e',
    borderClass: 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    bgClass: 'bg-rose-950/40',
    textClass: 'text-rose-400',
    description: 'Horizonte de Eventos. O valor de fold entra em colapso; o custo da órbita exige all-in.',
  },
  short: {
    name: 'Short Stack',
    label: 'SHORT (10-15bb)',
    orbitRadius: 95,
    color: '#f97316',
    borderClass: 'border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    bgClass: 'bg-orange-950/40',
    textClass: 'text-orange-400',
    description: 'Pressão de Shove/Fold crítica. Elevada sensibilidade à aproximação dos blinds.',
  },
  mid: {
    name: 'Mid Stack',
    label: 'MID (15-35bb)',
    orbitRadius: 135,
    color: '#f59e0b',
    borderClass: 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    bgClass: 'bg-amber-950/40',
    textClass: 'text-amber-400',
    description: 'Zona do Paradoxo do Valuation. Máxima vulnerabilidade ao Poder de Veto do Chip Leader.',
  },
  big: {
    name: 'Big Stack',
    label: 'BIG (> 35bb)',
    orbitRadius: 165,
    color: '#10b981',
    borderClass: 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    bgClass: 'bg-emerald-950/40',
    textClass: 'text-emerald-400',
    description: 'Órbita Estável. Baixa gravidade de eliminação e alta capacidade de realizar equidade.',
  },
  chipleader: {
    name: 'Singularidade (CL)',
    label: 'SOL • CHIP LEADER',
    orbitRadius: 0,
    color: '#fbbf24',
    borderClass: 'border-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.5)]',
    bgClass: 'bg-amber-950/60',
    textClass: 'text-amber-300',
    description: 'Centro Gravitacional. Detém o Poder de Veto e impõe o Teto do Prêmio de Risco aos oponentes.',
  },
};

const DEFAULT_POSITIONS = ['HERO', 'VILÃO 1', 'VILÃO 2', 'VILÃO 3', 'CO', 'BTN', 'SB', 'BB'];

export function GravitationalScannerPanel({
  stacks,
  heroIdx = 0,
  playerNames,
}: Readonly<GravitationalScannerProps>) {
  const [inspectedIdx, setInspectedIdx] = useState<number | null>(null);

  const systemData = useMemo(() => {
    const totalChips = stacks.reduce((a, b) => a + b, 0);
    if (totalChips === 0) return { center: null, planets: [], totalChips: 0 };

    const resolvedNames = playerNames && playerNames.length >= stacks.length
      ? playerNames
      : stacks.length === 2
        ? ['HERO', 'VILÃO']
        : DEFAULT_POSITIONS.slice(0, stacks.length);

    const indexedStacks = stacks.map((stack, idx) => ({
      stack,
      idx,
      name: resolvedNames[idx] ?? `P${idx + 1}`,
      isHero: idx === heroIdx,
      tier: classifyTier(stack, stacks),
      massPct: Number(((stack / totalChips) * 100).toFixed(1)),
    }));

    // O Sol é o jogador com o maior stack da mesa (Chipleader)
    const sorted = [...indexedStacks].sort((a, b) => b.stack - a.stack);
    const center = sorted[0];
    const planets = sorted.slice(1);

    return { center, planets, totalChips };
  }, [stacks, heroIdx, playerNames]);

  if (!systemData.center) return null;
  const center = systemData.center;

  const activeInspected = inspectedIdx !== null
    ? (center.idx === inspectedIdx
        ? center
        : systemData.planets.find((p) => p.idx === inspectedIdx) ?? center)
    : center;

  const centerTier = TIER_META[center.tier];

  return (
    <div className="group/scanner relative flex w-full flex-col items-center rounded-4xl border border-white/8 bg-slate-950/60 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 rounded-4xl bg-grain opacity-5 mix-blend-overlay" />

      {/* Cabeçalho do Scanner */}
      <div className="relative z-10 mb-6 flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent-amber h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_12px_var(--color-accent-amber)]" />
          <div>
            <h4 className="text-white m-0 text-[0.75rem] font-black tracking-[0.3em] uppercase">
              Scanner Gravitacional &middot; Astrofísica PMev
            </h4>
            <p className="text-text-dim m-0 text-[0.58rem] font-mono uppercase tracking-wider">
              Mapeamento de Curvatura de Risco ICM, Singularidade e Poder de Veto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[0.55rem] text-text-muted">
          <span>MASSA TOTAL:</span>
          <span className="font-black text-white">{systemData.totalChips.toFixed(1)} bb</span>
        </div>
      </div>

      {/* Palco Orbital Gravitacional (SVG e Corpos Celestes) */}
      <div className="relative my-4 flex aspect-square w-full max-w-[380px] items-center justify-center select-none">
        {/* SVG: Órbitas Concéntricas e Vetores Geodésicos de Força */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 400"
        >
          <defs>
            {/* Gradiente da Corona Estelar do Sol */}
            <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>

            {/* Marcador de Seta Gravitacional */}
            <marker
              id="gravArrow"
              viewBox="0 0 6 6"
              refX="5"
              refY="3"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" opacity="0.6" />
            </marker>
          </defs>

          {/* Halo Central da Singularidade */}
          <circle cx="200" cy="200" r="60" fill="url(#sunCorona)" />

          {/* Órbita 1: Horizonte de Eventos (< 15bb) */}
          <circle
            cx="200"
            cy="200"
            r="80"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.3"
          />
          <text
            x="200"
            y="114"
            fill="#f43f5e"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            opacity="0.6"
            letterSpacing="0.15em"
          >
            HORIZONTE DE EVENTOS
          </text>

          {/* Órbita 2: Zona de Compressão (Paradoxo do Valuation) */}
          <circle
            cx="200"
            cy="200"
            r="135"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="6 6"
            opacity="0.25"
          />
          <text
            x="200"
            y="58"
            fill="#f59e0b"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            opacity="0.5"
            letterSpacing="0.15em"
          >
            PARADOXO DO VALUATION
          </text>

          {/* Órbita 3: Zona Externa (Estabilidade de Stack) */}
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="#6366f1"
            strokeWidth="0.75"
            strokeDasharray="8 8"
            opacity="0.2"
          />

          {/* Linhas Geodésicas de Atração do Sol para cada Planeta */}
          {systemData.planets.map((planet, i) => {
            const numPlanets = systemData.planets.length;
            const angle = numPlanets === 1
              ? 0 // Posição equilibrada à direita para Head-Up
              : (2 * Math.PI * i) / numPlanets - Math.PI / 2;

            const radius = TIER_META[planet.tier].orbitRadius;
            const px = 200 + Math.cos(angle) * radius;
            const py = 200 + Math.sin(angle) * radius;

            const isInspected = inspectedIdx === planet.idx;

            return (
              <g key={`geodesic-${planet.idx}`}>
                <line
                  x1="200"
                  y1="200"
                  x2={px}
                  y2={py}
                  stroke={isInspected ? '#fbbf24' : '#f59e0b'}
                  strokeWidth={isInspected ? 1.5 : 1}
                  strokeDasharray="3 3"
                  opacity={isInspected ? 0.8 : 0.35}
                />
                {/* Ponto médio: indicador de tensão vetorial */}
                <circle
                  cx={(200 + px) / 2}
                  cy={(200 + py) / 2}
                  r="2"
                  fill="#fbbf24"
                  opacity={isInspected ? 0.9 : 0.5}
                />
              </g>
            );
          })}
        </svg>

        {/* O Sol Central (Singularidade / Chip Leader) */}
        <button
          type="button"
          onClick={() => setInspectedIdx(center.idx)}
          onMouseEnter={() => setInspectedIdx(center.idx)}
          className={`absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-3xl border p-3.5 transition-all duration-300 hover:scale-105 active:scale-95 ${centerTier.bgClass} ${centerTier.borderClass} ${inspectedIdx === center.idx ? 'ring-2 ring-amber-400/50' : ''}`}
          style={{ minWidth: '92px' }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            <span className="text-[0.62rem] font-black tracking-widest text-amber-300 uppercase">
              {center.isHero ? 'HERO (CL)' : 'SOL (CL)'}
            </span>
          </div>
          <span className="font-mono text-xs font-black text-white">
            {center.stack.toFixed(1)} bb
          </span>
          <span className="text-[0.52rem] font-mono text-amber-200/80 font-bold mt-0.5">
            {center.massPct}% da mesa
          </span>
        </button>

        {/* Os Planetas Orbitais (Demais Stacks) */}
        {systemData.planets.map((planet, i) => {
          const numPlanets = systemData.planets.length;
          const angle = numPlanets === 1
            ? 0 // Posicionado à direita no HU
            : (2 * Math.PI * i) / numPlanets - Math.PI / 2;

          const meta = TIER_META[planet.tier];
          const radius = meta.orbitRadius;

          // Conversão de coordenadas para percentual no container relativo
          const leftPct = 50 + ((Math.cos(angle) * radius) / 200) * 50;
          const topPct = 50 + ((Math.sin(angle) * radius) / 200) * 50;

          const isInspected = inspectedIdx === planet.idx;

          return (
            <button
              type="button"
              key={planet.idx}
              onClick={() => setInspectedIdx(planet.idx)}
              onMouseEnter={() => setInspectedIdx(planet.idx)}
              className={`absolute z-30 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-2xl border p-2 transition-all duration-300 hover:scale-110 active:scale-95 ${meta.bgClass} ${meta.borderClass} ${planet.isHero ? 'border-accent-indigo/80 bg-accent-indigo/25 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : ''} ${isInspected ? 'ring-2 ring-white/30 scale-105' : ''}`}
              style={{ left: `${leftPct}%`, top: `${topPct}%`, minWidth: '78px' }}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${planet.isHero ? 'bg-accent-indigo shadow-[0_0_6px_var(--color-accent-indigo)]' : ''}`}
                  style={!planet.isHero ? { backgroundColor: meta.color } : undefined}
                />
                <span className="text-[0.58rem] font-black tracking-wider text-white uppercase">
                  {planet.isHero ? 'HERO' : planet.name}
                </span>
              </div>
              <span className="font-mono text-[0.68rem] font-black text-white">
                {planet.stack.toFixed(1)} bb
              </span>
              <span className="text-[0.48rem] font-mono text-text-dim font-bold">
                {meta.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* HUD Holográfico de Inspeção Tática PMev */}
      <div className="relative z-10 mt-2 w-full rounded-2xl border border-white/8 bg-black/40 p-4 sm:p-5 shadow-inner backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center border font-mono text-xs font-black"
              style={{
                backgroundColor: `${TIER_META[activeInspected.tier].color}15`,
                borderColor: `${TIER_META[activeInspected.tier].color}40`,
                color: TIER_META[activeInspected.tier].color,
              }}
            >
              <i className="fa-solid fa-atom" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  {activeInspected.isHero ? 'HERO' : activeInspected.name}
                </span>
                <span
                  className="text-[0.52rem] font-black px-2 py-0.5 rounded-full uppercase"
                  style={{
                    backgroundColor: `${TIER_META[activeInspected.tier].color}20`,
                    color: TIER_META[activeInspected.tier].color,
                    border: `1px solid ${TIER_META[activeInspected.tier].color}40`,
                  }}
                >
                  {TIER_META[activeInspected.tier].label}
                </span>
              </div>
              <span className="text-[0.55rem] font-mono text-text-muted">
                Massa: {activeInspected.stack.toFixed(1)} bb ({activeInspected.massPct}% do field ativo)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[0.6rem]">
            <span className="text-text-muted">PODER DE VETO:</span>
            <span className={`font-black ${activeInspected.idx === systemData.center.idx ? 'text-accent-amber' : 'text-text-darker'}`}>
              {activeInspected.idx === systemData.center.idx ? 'ATIVO (DOMINANTE)' : 'SUBMETIDO'}
            </span>
          </div>
        </div>

        <p className="m-0 mt-3 text-[0.68rem] leading-relaxed font-sans text-text-dim">
          {activeInspected.idx === systemData.center.idx ? (
            <span>
              <strong className="text-accent-amber-light">Ação Predadora:</strong> Você detém a Singularidade da mesa.
              A sua força gravitacional deforma as Pot Odds dos oponentes e impõe um severo teto de fold equity.
              Use o Poder de Veto para induzir overfolds matemáticos.
            </span>
          ) : activeInspected.tier === 'mid' ? (
            <span>
              <strong className="text-amber-400">Paradoxo do Valuation de Vitoi:</strong> Este stack (15-35bb) tem muito valor monetário a perder em payjump.
              A colisão contra o Sol resulta em sangria catastrófica de EV de sobrevivência, forçando-o à defensiva passiva.
            </span>
          ) : activeInspected.tier === 'micro' || activeInspected.tier === 'short' ? (
            <span>
              <strong className="text-rose-400">Horizonte de Eventos:</strong> Stack crítico em órbita terminal.
              A força de maré dos blinds anula a vantagem de esperar. Agressão polarizada de Shove/Fold é o único escape de sobrevivência.
            </span>
          ) : (
            <span>
              <strong className="text-emerald-400">Órbita Estável:</strong> Stack profundo capaz de amortecer colisões de médio porte.
              Permite exploração máxima da realização de equidade posicional (R) sem risco iminente de payjump jump.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
