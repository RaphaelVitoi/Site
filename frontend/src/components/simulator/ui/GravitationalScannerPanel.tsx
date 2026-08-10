'use client';

import { useMemo } from 'react';
import { classifyTier, type StackTier } from '@/lib/perspectiva';

interface GravitationalScannerProps {
  stacks: number[];
  heroIdx: number;
}

const TIER_COLORS: Record<StackTier, string> = {
  micro: 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.8)] border border-rose-400/50',
  short:
    'bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.6)] border border-orange-400/50',
  mid: 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-400/50',
  big: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/50',
  chipleader:
    'bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.9)] border border-amber-300/80',
};

const TIER_SIZES: Record<StackTier, string> = {
  micro: 'w-4 h-4',
  short: 'w-6 h-6',
  mid: 'w-8 h-8',
  big: 'w-12 h-12',
  chipleader: 'w-20 h-20',
};

export function GravitationalScannerPanel({ stacks, heroIdx }: Readonly<GravitationalScannerProps>) {
  const systemData = useMemo(() => {
    const totalChips = stacks.reduce((a, b) => a + b, 0);
    if (totalChips === 0) return { center: null, planets: [] };

    const indexedStacks = stacks.map((stack, idx) => ({
      stack,
      idx,
      isHero: idx === heroIdx,
      tier: classifyTier(stack, stacks),
    }));

    // O Sol é o Chipleader Absoluto
    const sorted = [...indexedStacks].sort((a, b) => b.stack - a.stack);
    const center = sorted[0];
    const planets = sorted.slice(1); // Ordenados do 2o maior para o micro

    return { center, planets, totalChips };
  }, [stacks, heroIdx]);

  if (!systemData.center) return null;

  return (
    <div className="group/scanner relative flex w-full flex-col items-center justify-center rounded-4xl border border-white/5 bg-linear-to-b from-black/60 to-black/20 p-8 shadow-inner">
      <div className="pointer-events-none absolute inset-0 rounded-4xl bg-[url('/img/noise.png')] opacity-5 mix-blend-overlay" />

      <div className="relative z-10 mb-8 flex w-full items-center gap-3">
        <div className="bg-accent-amber h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_var(--accent-amber)]" />
        <h4 className="text-text-muted m-0 text-[0.65rem] font-black tracking-[0.35em] uppercase">
          Scanner Gravitacional &middot; SOTA v6
        </h4>
      </div>

      <div className="relative mb-6 flex aspect-square w-full max-w-[320px] items-center justify-center">
        {/* Órbitas SVG de fundo (O Campo Gravitacional) */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-30 transition-opacity duration-1000 group-hover/scanner:opacity-60"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="35"
            fill="none"
            stroke="var(--accent-rose)"
            strokeWidth="0.75"
            strokeDasharray="3 6"
            className="animate-[spin_60s_linear_infinite] opacity-60"
          />
          <circle
            cx="100"
            cy="100"
            r="65"
            fill="none"
            stroke="var(--accent-orange)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            className="animate-[spin_80s_linear_infinite_reverse] opacity-40"
          />
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth="0.25"
            strokeDasharray="5 10"
            className="animate-[spin_100s_linear_infinite] opacity-30"
          />
        </svg>

        {/* O Sol (Chipleader) */}
        <div
          className={`absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-700 hover:scale-110 ${TIER_SIZES[systemData.center.tier]} ${TIER_COLORS[systemData.center.tier]}`}
        >
          {systemData.center.isHero && (
            <span className="text-[0.6rem] font-black tracking-widest text-black/90 drop-shadow-md">HERO</span>
          )}
          {/* Aura de Poder de Veto */}
          <div className="absolute inset-0 animate-ping rounded-full bg-white/50 opacity-30" />
        </div>

        {/* Os Planetas */}
        {systemData.planets.map((planet, i) => {
          // Golden Ratio (Angulo Áureo) para distribuição orgânica
          const goldenAngle = 2.399963229728653;
          const angle = i * goldenAngle;

          // Órbitas (percentual do raio do viewBox SVG)
          // micro: r=35, short: r=65, outros: r=95
          let baseOrbit = 95;
          if (planet.tier === 'micro') baseOrbit = 35;
          else if (planet.tier === 'short') baseOrbit = 65;

          let jitter = 0;
          if (i % 3 === 0) jitter = 3;
          else if (i % 2 === 0) jitter = -3;

          const orbitLevel = baseOrbit + jitter; // Valor de 0 a 100

          // Conversão para posicionamento responsivo em porcentagem
          // A distância do centro (50%) é orbitLevel / 2
          const leftPct = 50 + (Math.cos(angle) * orbitLevel) / 2;
          const topPct = 50 + (Math.sin(angle) * orbitLevel) / 2;

          return (
            <div
              key={planet.idx}
              className={`absolute z-30 flex items-center justify-center rounded-full transition-all duration-1000 hover:scale-125 ${TIER_SIZES[planet.tier]} ${TIER_COLORS[planet.tier]} ${planet.isHero ? 'shadow-[0_0_25px_rgba(255,255,255,0.7)] ring-2 ring-white ring-offset-4 ring-offset-black/60' : ''}`}
              style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, -50%)' }}
              title={`Stack: ${planet.stack.toFixed(1)}bb | Tier: ${planet.tier}`}
            >
              {planet.isHero && <span className="text-[0.45rem] font-black text-black/90 drop-shadow-md">HERO</span>}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-2 flex min-h-[80px] w-full items-center justify-center space-y-3 rounded-2xl border border-white/5 bg-white/5 p-5 text-center">
        <p className="text-text-dim m-0 max-w-sm text-[0.75rem] leading-relaxed font-medium">
          {systemData.center.isHero ? (
            <span className="text-accent-amber-light font-bold">
              A&ccedil;&atilde;o Predadora: Voc&ecirc; &eacute; o Sol da mesa. A sua agressividade imp&otilde;e um
              &quot;Teto do RP&quot; severo nos oponentes. Use o Poder de Veto.
            </span>
          ) : (
            <span>
              O CL det&eacute;m a Gravidade.{' '}
              <strong className="text-accent-rose-light font-black">
                Evite a Zona de Colis&atilde;o (Raios Internos)
              </strong>
              , o custo estrutural da derrota destr&oacute;i a sua Perspectiva.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
