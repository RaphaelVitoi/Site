'use client';

/**
 * IDENTITY: Mesa Geométrica Interativa do Spot (Referencial Aula 1.2)
 * PATH: src/components/simulator/ui/MasterTableVisualizer.tsx
 * ROLE: Renderizar a mesa de 9 jogadores da Aula 1.2 com stacks dinâmicos, board cards, pot e destaque Hero/Villain.
 * AESTHETIC: SOTA v7.0 GOLD Glassmorphism & SVG Glow.
 */

import type { HeroPosition, Scenario } from '../solver/types';
import { TABLE_PLAYERS } from '../ReferencialData';

interface MasterTableVisualizerProps {
  scenario: Scenario;
  heroPosition: HeroPosition;
  currentPot: number;
  effectiveIpRp: number;
  effectiveOopRp: number;
  onSelectPosition?: (pos: HeroPosition) => void;
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function getHeroPosName(heroPosition: HeroPosition, scenario: Scenario): string {
  if (heroPosition === 'IP') return scenario.ipPos || 'BTN';
  if (heroPosition === 'OOP') return scenario.oopPos || 'BB';
  return heroPosition;
}

const POSITION_INDEX_MAP: Record<string, number> = {
  UTG: 2,
  EP: 3,
  MP1: 4,
  MP2: 5,
  HJ: 6,
  CO: 7,
  SB: 8,
};

function getPlayerStack(pName: string, scenario: Scenario, defaultStack: number): number {
  if (!Array.isArray(scenario.stacks) || scenario.stacks.length !== 9) {
    return defaultStack;
  }
  const ipPos = scenario.ipPos || 'BTN';
  const oopPos = scenario.oopPos || 'BB';

  if (pName === ipPos || (ipPos.includes('BTN') && pName === 'BTN') || (ipPos.includes('Vice') && pName === 'CO')) {
    return scenario.stacks[0] ?? defaultStack;
  }
  if (pName === oopPos || (oopPos.includes('BB') && pName === 'BB') || (oopPos.includes('CL') && pName === 'BB')) {
    return scenario.stacks[1] ?? defaultStack;
  }
  const mappedIdx = POSITION_INDEX_MAP[pName];
  if (mappedIdx !== undefined) {
    return scenario.stacks[mappedIdx] ?? defaultStack;
  }
  return defaultStack;
}

const BOARD_CARDS = [
  { rank: 'K', suit: '♦', color: '#38bdf8', bg: '#082f49', border: 'rgba(56, 189, 248, 0.4)' },
  { rank: 'J', suit: '♣', color: '#34d399', bg: '#064e3b', border: 'rgba(52, 211, 153, 0.4)' },
  { rank: 'T', suit: '♠', color: '#f1f5f9', bg: '#1e293b', border: 'rgba(241, 245, 249, 0.4)' },
  { rank: '2', suit: '♦', color: '#38bdf8', bg: '#082f49', border: 'rgba(56, 189, 248, 0.4)' },
  { rank: '3', suit: '♦', color: '#38bdf8', bg: '#082f49', border: 'rgba(56, 189, 248, 0.4)' },
];

export function MasterTableVisualizer({
  scenario,
  heroPosition,
  currentPot,
  effectiveIpRp,
  effectiveOopRp,
  onSelectPosition,
}: Readonly<MasterTableVisualizerProps>) {
  const W = 680;
  const H = 400;
  const rx = 240;
  const ry = 125;
  const cx = W / 2;
  const cy = H / 2;

  const heroPosName = getHeroPosName(heroPosition, scenario);
  const defaultOpponent = scenario.oopPos || 'BB';
  const villainPosName = heroPosName === (scenario.ipPos || 'BTN') ? defaultOpponent : (scenario.ipPos || 'BTN');

  const deltaRp = effectiveIpRp - effectiveOopRp;

  return (
    <div className="glass-panel relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-5 sm:p-7 shadow-2xl backdrop-blur-3xl group/table">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[at_center_center] from-indigo-500/10 via-transparent to-transparent opacity-60 transition-opacity duration-1000 group-hover/table:opacity-100" />

      {/* Header do Card da Mesa */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-indigo animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          <span className="font-mono text-[0.68rem] font-black uppercase tracking-[0.25em] text-white">
            Topologia da Mesa Final · 9 Jogadores (Aula 1.2)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[0.62rem]">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Hero ({heroPosName}): {effectiveIpRp.toFixed(1)}% RP
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Villain ({villainPosName}): {effectiveOopRp.toFixed(1)}% RP
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
            ΔRP: {deltaRp >= 0 ? `+${deltaRp.toFixed(1)}%` : `${deltaRp.toFixed(1)}%`}
          </span>
        </div>
      </div>

      {/* Render SVG da Mesa */}
      <div className="relative aspect-680/400 w-full max-w-3xl mx-auto overflow-visible">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="overflow-visible drop-shadow-2xl select-none"
        >
          <defs>
            <radialGradient id="masterFeltGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="70%" stopColor="#030712" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <linearGradient id="masterRailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="tableGlowSota" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="chipShadowSota" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Outer Glow */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx + 16}
            ry={ry + 16}
            fill="transparent"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="18"
            filter="url(#tableGlowSota)"
          />

          {/* Table Rail */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx + 10}
            ry={ry + 10}
            fill="url(#masterRailGrad)"
            stroke="#64748b"
            strokeWidth="2"
            filter="url(#chipShadowSota)"
          />

          {/* Table Felt */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="url(#masterFeltGrad)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />

          {/* SOTA Watermark no Feltro */}
          <text
            x={cx}
            y={cy - 42}
            textAnchor="middle"
            fill="rgba(255,255,255,0.06)"
            className="text-[0.65rem] font-black tracking-[0.6em] uppercase font-mono select-none"
          >
            SOTA QUANTUM ICM
          </text>

          {/* Cartas Comunitárias (Board da Aula 1.2: Kd Jc Ts 2d 3d) */}
          <g transform={`translate(${cx - 100}, ${cy - 22})`}>
            {BOARD_CARDS.map((card, idx) => (
              <g key={card.rank + card.suit} transform={`translate(${idx * 42}, 0)`}>
                <rect
                  x="0"
                  y="0"
                  width="34"
                  height="46"
                  rx="6"
                  fill={card.bg}
                  stroke={card.border}
                  strokeWidth="1.5"
                  filter="url(#chipShadowSota)"
                />
                <text
                  x="17"
                  y="20"
                  textAnchor="middle"
                  fill={card.color}
                  className="text-[0.95rem] font-black font-mono select-none"
                >
                  {card.rank}
                </text>
                <text
                  x="17"
                  y="36"
                  textAnchor="middle"
                  fill={card.color}
                  className="text-[0.8rem] font-black select-none"
                >
                  {card.suit}
                </text>
              </g>
            ))}
          </g>

          {/* Pote Central */}
          <g transform={`translate(${cx}, ${cy + 42})`}>
            <rect
              x="-50"
              y="-15"
              width="100"
              height="30"
              rx="15"
              fill="#020617"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              filter="url(#chipShadowSota)"
            />
            <text
              x="0"
              y="-2"
              textAnchor="middle"
              fill="#94a3b8"
              className="text-[0.45rem] font-black uppercase tracking-[0.2em]"
            >
              POT TOTAL
            </text>
            <text
              x="0"
              y="10"
              textAnchor="middle"
              fill="#ffffff"
              className="text-[0.7rem] font-mono font-black tracking-tight"
            >
              {currentPot.toFixed(1)} BB
            </text>
          </g>

          {/* Jogadores ao Redor da Mesa (9 Posições da Aula 1.2) */}
          {TABLE_PLAYERS.map((p) => {
            const angle = p.angle;
            const x = cx + rx * Math.cos(toRad(angle));
            const y = cy + ry * Math.sin(toRad(angle));
            const isHero = p.name === heroPosName;
            const isVillain = p.name === villainPosName;

            const playerStack = getPlayerStack(p.name, scenario, p.stack);

            let strokeColor = '#334155';
            let fillColor = '#020617';
            let textColor = '#94a3b8';
            const stackText = `${playerStack.toFixed(1)} BB`;

            if (isHero) {
              strokeColor = '#10b981';
              fillColor = '#064e3b';
              textColor = '#34d399';
            } else if (isVillain) {
              strokeColor = '#6366f1';
              fillColor = '#312e81';
              textColor = '#818cf8';
            }

            return (
              <g
                key={p.name}
                onClick={() => onSelectPosition?.(p.name as HeroPosition)}
                className="group/player cursor-pointer transition-all duration-300 hover:scale-110"
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                {/* Glow Hero / Villain */}
                {(isHero || isVillain) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="36"
                    fill="transparent"
                    stroke={isHero ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.5)'}
                    strokeWidth="3.5"
                    filter="url(#tableGlowSota)"
                  />
                )}

                {/* Base do Chip */}
                <circle
                  cx={x}
                  cy={y}
                  r="28"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                  filter="url(#chipShadowSota)"
                />

                {/* Inner Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r="24"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />

                {/* Nome da Posição */}
                <text
                  x={x}
                  y={y - 3}
                  textAnchor="middle"
                  fill={textColor}
                  className="text-[0.66rem] font-black uppercase tracking-wider font-mono select-none"
                >
                  {p.name}
                </text>

                {/* Stack do Jogador */}
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="text-[0.52rem] font-mono font-bold select-none"
                >
                  {stackText}
                </text>

                {/* Badge de RP se for Hero ou Villain */}
                {isHero && (
                  <g transform={`translate(${x}, ${y + 38})`}>
                    <rect
                      x="-30"
                      y="-8"
                      width="60"
                      height="16"
                      rx="8"
                      fill="#020617"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#34d399"
                      className="text-[0.48rem] font-mono font-black"
                    >
                      RP {effectiveIpRp.toFixed(1)}%
                    </text>
                  </g>
                )}

                {isVillain && (
                  <g transform={`translate(${x}, ${y + 38})`}>
                    <rect
                      x="-30"
                      y="-8"
                      width="60"
                      height="16"
                      rx="8"
                      fill="#020617"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#818cf8"
                      className="text-[0.48rem] font-mono font-black"
                    >
                      RP {effectiveOopRp.toFixed(1)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
