'use client';
/**
 * IDENTITY: Referencial Visual — Âncora Empírica Aula 1.2
 * PATH: src/components/simulator/ReferencialAula12.tsx
 * ROLE: Seção colapsável com representação visual dos dados de calibração do motor ICM.
 *       SOTA v7.0 GOLD: Soberania Matemática e Purificação de Damping.
 */

import { useMemo, useState } from 'react';
import {
  BB_ACTION_GRID,
  BTN_ACTION_GRID,
  BF_MATRIX,
  BF_PLAYERS,
  BF_STACKS,
  BUBBLE_BF_MATRIX,
  BUBBLE_PLAYERS,
  BUBBLE_RP_MATRIX,
  BUBBLE_STACKS,
  EG_BF_MATRIX,
  EG_PLAYERS,
  EG_RP_MATRIX,
  EG_STACKS,
  PRIZES,
  RANKS,
  RP_MATRIX,
  TABLE_PLAYERS,
} from './ReferencialData';
import type { RangeCell, RangeAction } from './ReferencialData';

export type MatrixViewMode = 'FT' | 'BUBBLE' | 'EG';

function getCellActionValue(cell: RangeCell, action: RangeAction): number | undefined {
  switch (action) {
    case 'shove':
      return cell.shove;
    case 'raise':
      return cell.raise;
    case 'call':
      return cell.call;
    case 'fold':
      return cell.fold;
  }
}

function getActionColor(action: RangeAction): string {
  switch (action) {
    case 'shove':
      return '#6366f1';
    case 'raise':
      return '#ef4444';
    case 'call':
      return '#10b981';
    case 'fold':
      return '#334155';
  }
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function getHandLabel(r: number, c: number): string {
  const rRank = RANKS.at(r) ?? '';
  const cRank = RANKS.at(c) ?? '';
  if (r === c) return rRank + rRank;
  if (r < c) return rRank + cRank + 's';
  return cRank + rRank + 'o';
}

function getRpGravityColor(rp: number): string {
  if (rp <= 0) return 'bg-slate-900/40 text-text-dim opacity-30';
  if (rp < 5) return 'bg-emerald-500/10 text-emerald-400/70 border-emerald-500/20';
  if (rp < 10) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (rp < 15) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (rp < 20) return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  return 'bg-rose-600/40 text-rose-300 border-rose-500/60 font-black';
}

function LegendSection() {
  return (
    <div className="flex flex-col gap-12">
      {/* HRC Context & Core Metrics */}
      <div className="relative grid grid-cols-1 gap-6 overflow-hidden rounded-4xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl md:grid-cols-2 lg:grid-cols-4">
        <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-50" />
        <div className="space-y-2">
          <h4 className="text-accent-indigo text-[0.7rem] font-black tracking-[0.3em] uppercase">HRC Context</h4>
          <p className="text-text-muted text-[0.8rem] leading-relaxed font-medium">
            MTT Vanilla $11 · 126 Players
            <br />
            Final Table 9P · 12.5% Ante
            <br />
            <span className="font-mono text-white">0.5bb / 1.0bb</span>
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-accent-amber text-[0.7rem] font-black tracking-[0.3em] uppercase">Bubble Factor</h4>
          <p className="text-text-muted text-[0.8rem] leading-relaxed font-medium">
            Dívida de Equidade.
            <br />
            Quanto suas fichas perdem valor ao serem colocadas em risco.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-accent-emerald text-[0.7rem] font-black tracking-[0.3em] uppercase">Risk Premium</h4>
          <p className="text-text-muted text-[0.8rem] leading-relaxed font-medium">
            Imposto do ICM.
            <br />
            <span className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-white">RP = (BF-1)/BF</span>
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-accent-danger text-[0.7rem] font-black tracking-[0.3em] uppercase">Âncora SOTA</h4>
          <p className="text-text-muted text-[0.8rem] leading-relaxed font-medium">
            BTN (39.9bb) vs BB (53.9bb)
            <br />
            BTN RP: <strong className="text-white">21.4%</strong> (Grave)
            <br />
            BB RP: <strong className="text-white">12.9%</strong> (Médio)
          </p>
        </div>
      </div>

      {/* Tournament Structures Framework */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          {
            title: 'TOP-HEAVY (▲)',
            desc: `1º lugar ≥ 25%. Laddering pouco valioso; o valor está em ganhar, não em sobreviver. Pressão ICM severa: foldar para subir uma posição tem EV marginal. BF elevado.`,
            color: 'border-amber-500/20 bg-amber-500/5',
          },
          {
            title: 'FLAT (▬)',
            desc: `1º lugar ≤ 18%. Saltos equilibrados e previsíveis. Laddering relevante: subir UMA posição tem valor real e tangível. BF próximo de 1; o jogo se aproxima de ChipEV.`,
            color: 'border-emerald-500/20 bg-emerald-500/5',
            active: true,
          },
          {
            title: 'HÍBRIDA (◆)',
            desc: `18-24%. Zona de exclusão. Método de análise por exclusão. Varia entre sites e formatos. Exige avaliação manual da curva de payjumps.`,
            color: 'border-indigo-500/20 bg-indigo-500/5',
          },
          {
            title: 'PKO (💥)',
            desc: `Top-heavyssimo (sempre). Dinheiro estático concentrado no 1º. A compensação vem pelo bounty acumulado, diluindo o ICM estático.`,
            color: 'border-rose-500/20 bg-rose-500/5',
          },
          {
            title: 'SATÉLITE (🎫)',
            desc: `ICM Binário e Terminal. Prêmios idênticos no topo. Dinâmica de sobrevivência pura. Acumular além do necessário tem EV zero. Ticket ou nada.`,
            color: 'border-white/10 bg-white/5',
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`rounded-3xl border p-6 transition-all ${item.color} ${item.active ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)] ring-2 ring-emerald-500' : ''}`}
          >
            <h5 className="mb-3 text-[0.75rem] font-black tracking-widest text-white">{item.title}</h5>
            <p className="text-text-muted m-0 text-[0.7rem] leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionRangeGrid({
  grid,
  title,
  subtitle,
}: Readonly<{
  grid: RangeCell[][];
  title: string;
  subtitle: string;
}>) {
  return (
    <div className="group/grid flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h4 className="m-0 text-[1.1rem] font-black tracking-tight text-white uppercase">{title}</h4>
        <p className="text-text-darker m-0 text-[0.7rem] font-bold tracking-[0.15em] uppercase">{subtitle}</p>
      </div>
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/60 p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-500 hover:border-white/20">
        {/* Glow de Fundo */}
        <div className="pointer-events-none absolute inset-0 bg-radial-[at_center_center] from-indigo-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-1000 group-hover/grid:opacity-100" />

        <div
          className="relative z-10 grid aspect-square w-full gap-0.5"
          style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}
        >
          {grid.flat().map((cell, i) => {
            const r = Math.floor(i / 13);
            const c = i % 13;
            const handLabel = getHandLabel(r, c);
            const isEmpty = !cell.raise && !cell.call && !cell.shove && (!cell.fold || cell.fold === 100);

            return (
              <div
                key={handLabel}
                className={`group/cell relative aspect-square overflow-hidden rounded-sm transition-all duration-300 ${isEmpty ? 'border border-white/5 bg-slate-900/40' : 'border border-white/10 bg-slate-950/80 hover:z-20 hover:scale-[1.15] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}
              >
                <div className="absolute inset-0 flex flex-col">
                  {(['shove', 'raise', 'call', 'fold'] as RangeAction[]).map((action) => {
                    const actionVal = getCellActionValue(cell, action);
                    const actionColor = getActionColor(action);
                    return actionVal && (!isEmpty || action !== 'fold') ? (
                      <div
                        key={action}
                        style={{
                          height: `${actionVal}%`,
                          backgroundColor: actionColor,
                        }}
                        className="w-full opacity-90 transition-opacity group-hover/cell:opacity-100"
                      />
                    ) : null;
                  })}
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span
                    className={`font-mono text-[0.45rem] font-black drop-shadow-md transition-colors select-none lg:text-[0.55rem] ${isEmpty ? 'text-white/10 group-hover/cell:text-white/30' : 'text-white/50 group-hover/cell:text-white'}`}
                  >
                    {getHandLabel(r, c)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BoardAndTableLeft(_props: Readonly<{ rpBtn: number; rpBb: number }>) {
  const W = 540;
  const H = 380;
  const rx = 180;
  const ry = 110;
  const cx = W / 2;
  const cy = H / 2;

  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="text-text-darker m-0 mb-6 text-[0.8rem] font-black tracking-[0.3em] uppercase">Board Reference</p>
        <div className="flex justify-center gap-4">
          {[
            {
              rank: 'K',
              suit: '♦',
              colorClass: 'text-sky-400',
              borderClass: 'border-sky-400/40',
              bg: 'bg-sky-950/20',
            },
            {
              rank: 'J',
              suit: '♣',
              colorClass: 'text-emerald-400',
              borderClass: 'border-emerald-400/40',
              bg: 'bg-emerald-950/20',
            },
            {
              rank: 'T',
              suit: '♠',
              colorClass: 'text-slate-100',
              borderClass: 'border-slate-100/40',
              bg: 'bg-slate-800/40',
            },
            {
              rank: '2',
              suit: '♦',
              colorClass: 'text-sky-400',
              borderClass: 'border-sky-400/40',
              bg: 'bg-sky-950/20',
            },
            {
              rank: '3',
              suit: '♦',
              colorClass: 'text-sky-400',
              borderClass: 'border-sky-400/40',
              bg: 'bg-sky-950/20',
            },
          ].map(({ rank, suit, colorClass, borderClass, bg }) => (
            <div
              key={rank + suit}
              className={`h-28 w-20 rounded-2xl ${bg} border-2 ${borderClass} group relative flex flex-col items-center justify-center gap-1 overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-2`}
            >
              <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent opacity-50" />
              <span className={`relative z-10 text-[2.4rem] leading-none font-black drop-shadow-md ${colorClass}`}>
                {rank}
              </span>
              <span className={`relative z-10 text-[1.6rem] leading-none drop-shadow-md ${colorClass}`}>{suit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <p className="text-text-darker m-0 mb-6 text-[0.8rem] font-black tracking-[0.3em] uppercase">
          Geometric Topology
        </p>
        <div className="rounded-5xl relative overflow-hidden border border-white/10 bg-slate-950/80 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
          {/* Ambient Backlight */}
          <div className="pointer-events-none absolute inset-0 bg-radial-[at_center_center] from-indigo-500/5 to-transparent" />
          <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible drop-shadow-2xl">
            <defs>
              <radialGradient id="feltGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="80%" stopColor="#020617" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <linearGradient id="railGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <filter id="tableGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="chipShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Outer Glow */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx + 15}
              ry={ry + 15}
              fill="transparent"
              stroke="rgba(99, 102, 241, 0.15)"
              strokeWidth="20"
              filter="url(#tableGlow)"
            />
            {/* Table Rail */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx + 12}
              ry={ry + 12}
              fill="url(#railGrad)"
              stroke="#475569"
              strokeWidth="2"
              filter="url(#chipShadow)"
            />
            {/* Table Felt */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="url(#feltGrad)"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />

            {/* Center Details */}
            <circle
              cx={cx}
              cy={cy}
              r="40"
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle cx={cx} cy={cy} r="30" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fill="currentColor"
              className="text-[0.65rem] font-black tracking-[0.8em] text-white/10 uppercase"
            >
              SOTA
            </text>

            {TABLE_PLAYERS.map((p) => {
              const angle = p.angle;
              const x = cx + rx * Math.cos(toRad(angle));
              const y = cy + ry * Math.sin(toRad(angle));
              const isHero = p.name === 'BB';
              const isVillain = p.name === 'BTN';

              let accent = 'text-text-muted';
              if (isHero) accent = 'text-emerald-400';
              else if (isVillain) accent = 'text-indigo-400';

              let strokeColor = '#334155';
              if (isHero) strokeColor = '#10b981';
              else if (isVillain) strokeColor = '#6366f1';

              let chipRingStroke = 'rgba(255,255,255,0.05)';
              if (isHero) chipRingStroke = 'rgba(16, 185, 129, 0.3)';
              else if (isVillain) chipRingStroke = 'rgba(99, 102, 241, 0.3)';

              let stackColor = 'text-slate-400/80';
              if (isHero) stackColor = 'text-emerald-200/80';
              else if (isVillain) stackColor = 'text-indigo-200/80';

              return (
                <g
                  key={p.name}
                  className="group/player cursor-default transition-all hover:scale-110"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                >
                  {/* Position specific glow */}
                  {(isHero || isVillain) && (
                    <circle
                      cx={x}
                      cy={y}
                      r="38"
                      fill="transparent"
                      stroke={isHero ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}
                      strokeWidth="3"
                      filter="url(#tableGlow)"
                    />
                  )}

                  {/* Chip Base */}
                  <circle
                    cx={x}
                    cy={y}
                    r="32"
                    fill="#020617"
                    stroke={strokeColor}
                    strokeWidth="4"
                    filter="url(#chipShadow)"
                  />
                  {/* Chip Inner Ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r="26"
                    fill="transparent"
                    stroke={chipRingStroke}
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />

                  <text
                    x={x}
                    y={y - 2}
                    textAnchor="middle"
                    fill="currentColor"
                    className={`text-[0.85rem] font-black uppercase ${accent} drop-shadow-md`}
                  >
                    {p.name}
                  </text>
                  <text
                    x={x}
                    y={y + 12}
                    textAnchor="middle"
                    fill="currentColor"
                    className={`font-mono text-[0.65rem] font-bold ${stackColor}`}
                  >
                    {p.stack}bb
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function RiskAndPrizesRight(
  _props: Readonly<{
    rpBtn: number;
    rpBb: number;
    btnStack: number;
    bbStack: number;
  }>,
) {
  return (
    <div className="flex flex-col gap-12">
      <div className="space-y-6">
        <p className="text-text-darker m-0 text-[0.8rem] font-black tracking-[0.3em] uppercase">
          Financial Structure (FLAT)
        </p>
        <div className="rounded-5xl space-y-7 border border-white/5 bg-slate-900/40 p-10 shadow-inner">
          {PRIZES.map(({ pos, val, jump }, i) => {
            const widthPct = `${(val / (PRIZES.at(0)?.val ?? 1)) * 100}%`;

            let barBgClass = 'bg-white/10';
            let valColorClass = 'text-text-muted';

            if (i === 0) {
              barBgClass = 'bg-linear-to-r from-amber-400 to-amber-600';
              valColorClass = 'text-amber-400';
            } else if (i === 1) {
              barBgClass = 'bg-linear-to-r from-slate-200 to-slate-400';
              valColorClass = 'text-slate-400';
            } else if (i === 2) {
              barBgClass = 'bg-linear-to-r from-violet-400 to-violet-600';
              valColorClass = 'text-violet-400';
            }

            return (
              <div key={pos} className="group/jump flex items-center gap-6">
                <span className="text-text-darker w-6 font-mono text-[0.75rem] font-black">{pos}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${barBgClass}`}
                    style={{ width: widthPct }}
                  />
                </div>
                <div className="flex w-32 items-center justify-end gap-4">
                  {jump > 0 && (
                    <span className="text-[0.65rem] font-bold text-emerald-500/40 opacity-0 transition-opacity group-hover/jump:opacity-100">
                      Δ{jump.toFixed(1)}
                    </span>
                  )}
                  <span className={`font-mono text-[0.85rem] font-black ${valColorClass}`}>${val.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-text-darker m-0 text-[0.8rem] font-black tracking-[0.3em] uppercase">
          HRC Decision Tree Specs
        </p>
        <div className="rounded-5xl relative space-y-8 overflow-hidden border border-white/10 bg-slate-900/60 p-10 shadow-2xl">
          <div className="bg-accent-indigo/5 absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />
          <div className="flex items-start gap-6">
            <div className="bg-accent-indigo h-12 w-1.5 shrink-0 rounded-full" />
            <div className="space-y-2">
              <h5 className="text-[0.8rem] font-black tracking-widest text-white uppercase">Sizing Drift Logic</h5>
              <p className="text-text-muted m-0 text-[0.75rem] leading-relaxed font-medium">
                No contexto de ICM severo, cbets elevadas migram para{' '}
                <strong className="text-white">abordagens de menor sizing (20-50%)</strong>. Esta prática é quase
                inexistente em cenários ChipEV tradicionais.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            <div className="bg-accent-emerald h-12 w-1.5 shrink-0 rounded-full" />
            <div className="space-y-2">
              <h5 className="text-[0.8rem] font-black tracking-widest text-white uppercase">
                Nash Equilibrium Precision
              </h5>
              <p className="text-text-muted m-0 text-[0.75rem] leading-relaxed font-medium">
                Simulações HRC apresentam um <strong className="text-white">e-Nash reduzido</strong>, eliminando os
                ruídos operacionais comuns no GTO Wizard e garantindo maior estabilidade estratégica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToyGamesFramework() {
  return (
    <div className="mt-6">
      <div className="mb-12 flex flex-col gap-1">
        <p className="m-0 text-2xl font-black tracking-tighter text-white uppercase">Strategic Toy Games</p>
        <p className="text-text-darker m-0 text-[0.8rem] font-bold tracking-[0.2em] uppercase">
          Framework Teórico — ΔRP as Distortion Axis
        </p>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            term: 'Toy game',
            def: 'Lente didática de causa e efeito que isola o ΔRP para demonstrar seu efeito sobre frequências de equilíbrio.',
          },
          {
            term: 'Baseline GTO (TG0)',
            def: 'Equilíbrio ChipEV Puro: RP = 0%. Bluff IP = 33% · Def OOP = 50% (MDF). Referência para todos os desvios SOTA.',
          },
          {
            term: 'ΔRP = IP_RP − OOP_RP',
            def: 'Eixo central. Positivo → IP constringido (overfold OOP). Negativo → IP com Licença de Agressão.',
          },
        ].map(({ term, def }) => (
          <div
            key={term}
            className="group rounded-4xl border border-indigo-500/10 bg-slate-900/50 p-8 transition-all hover:border-indigo-500/30"
          >
            <span className="mb-4 block text-[0.9rem] font-black tracking-[0.2em] text-indigo-400 uppercase transition-transform group-hover:translate-x-1">
              {term}
            </span>
            <span className="text-text-muted text-[0.9rem] leading-relaxed font-medium">{def}</span>
          </div>
        ))}
      </div>

      <div className="scrollbar-hide rounded-5xl shadow-3xl overflow-x-auto border border-white/5">
        <table className="w-full border-collapse bg-slate-900/40">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80">
              <th className="text-text-darker px-8 py-5 text-left text-[0.8rem] font-black tracking-widest whitespace-nowrap uppercase">
                Node
              </th>
              <th className="px-8 py-5 text-right text-[0.8rem] font-black tracking-widest whitespace-nowrap text-indigo-400 uppercase">
                RP IP
              </th>
              <th className="px-8 py-5 text-right text-[0.8rem] font-black tracking-widest whitespace-nowrap text-rose-500 uppercase">
                RP OOP
              </th>
              <th className="px-8 py-5 text-right text-[0.8rem] font-black tracking-widest whitespace-nowrap text-emerald-500 uppercase">
                ΔRP
              </th>
              <th className="text-text-muted px-8 py-5 text-right text-[0.8rem] font-black tracking-widest whitespace-nowrap uppercase">
                Bluff IP
              </th>
              <th className="text-text-muted px-8 py-5 text-right text-[0.8rem] font-black tracking-widest whitespace-nowrap uppercase">
                Def OOP
              </th>
              <th className="text-text-darker px-8 py-5 text-left text-[0.8rem] font-black tracking-widest uppercase">
                Effect
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/10">
            {[
              {
                no: 'TG0',
                rpi: 0,
                rpo: 0,
                delta: 0,
                bluff: 33,
                def: 50,
                effect: 'Baseline GTO (MDF Perfeito)',
              },
              {
                no: 'TG1',
                rpi: 3,
                rpo: 6,
                delta: -3,
                bluff: 37,
                def: 44,
                effect: 'Efeito Batata Quente (OOP absorve risco)',
              },
              {
                no: 'TG2',
                rpi: 3,
                rpo: 9,
                delta: -6,
                bluff: 42,
                def: 40,
                effect: 'Teto do RP (OOP atinge piso de defesa)',
              },
              {
                no: 'TG3',
                rpi: 3,
                rpo: 18,
                delta: -15,
                bluff: 48,
                def: 40,
                effect: 'Defesa Inelástica (Pacto Silencioso)',
              },
              {
                no: 'TG4',
                rpi: 9,
                rpo: 3,
                delta: 6,
                bluff: 30,
                def: 35,
                effect: 'Contra-intuitividade: Defensor coberto folda MAIS',
              },
              {
                no: 'TG5',
                rpi: 18,
                rpo: 3,
                delta: 15,
                bluff: 25,
                def: 28,
                effect: 'Vantagem de Risco: IP impõe custo de colisão',
              },
              {
                no: 'TG6',
                rpi: 21,
                rpo: 3,
                delta: 18,
                bluff: 20,
                def: 22,
                effect: 'Agressão Impune (Bolha/Terminal)',
              },
            ].map((row, i) => {
              const rowBg = i % 2 === 0 ? 'bg-white/2' : '';
              let deltaLabel = row.delta.toString();
              if (row.delta > 0) deltaLabel = `+${row.delta}`;
              else if (row.delta === 0) deltaLabel = '0';

              return (
                <tr key={row.no} className={`border-b border-white/5 transition-colors hover:bg-indigo-500/5 ${rowBg}`}>
                  <td className="px-8 py-5 text-[0.85rem] font-black text-white">{row.no}</td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-indigo-300">{row.rpi}%</td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-rose-400">{row.rpo}%</td>
                  <td className="px-8 py-5 text-right font-mono font-black text-white">{deltaLabel}%</td>
                  <td className="text-text-dim px-8 py-5 text-right font-mono">{row.bluff}%</td>
                  <td className="text-text-dim px-8 py-5 text-right font-mono">{row.def}%</td>
                  <td className="text-text-muted px-8 py-5 text-[0.8rem] font-medium">{row.effect}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReferencialAula12() {
  const [matrixView] = useState<MatrixViewMode>('FT');

  const matrixData = useMemo(() => {
    switch (matrixView) {
      case 'BUBBLE':
        return {
          mPlayers: BUBBLE_PLAYERS,
          mStacks: BUBBLE_STACKS,
          mBf: BUBBLE_BF_MATRIX,
          mRp: BUBBLE_RP_MATRIX,
        };
      case 'EG':
        return {
          mPlayers: EG_PLAYERS,
          mStacks: EG_STACKS,
          mBf: EG_BF_MATRIX,
          mRp: EG_RP_MATRIX,
        };
      default:
        return { mPlayers: BF_PLAYERS, mStacks: BF_STACKS, mBf: BF_MATRIX, mRp: RP_MATRIX };
    }
  }, [matrixView]);

  const activeBtnIdx = 6;
  const activeBbIdx = 8;
  const rpBb = matrixData.mRp[activeBbIdx]?.[activeBtnIdx] ?? 0;
  const rpBtn = matrixData.mRp[activeBtnIdx]?.[activeBbIdx] ?? 0;
  const bfBb = matrixData.mBf[activeBbIdx]?.[activeBtnIdx] ?? 1;
  const bfBtn = matrixData.mBf[activeBtnIdx]?.[activeBbIdx] ?? 1;

  const isBBUnderPressure = rpBb > rpBtn;
  const pressureDelta = Math.abs(rpBb - rpBtn).toFixed(1);

  return (
    <div id="anchor-aula12" className="w-full">
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-white/5 p-12 transition-all outline-none select-none hover:bg-white/5 lg:p-16">
          <div className="flex items-center gap-8">
            <div className="bg-accent-indigo/10 text-accent-indigo group-open:bg-accent-indigo flex h-14 w-14 items-center justify-center rounded-3xl shadow-xl transition-all group-open:text-white">
              <i className="fa-solid fa-chevron-right text-xl group-open:rotate-90" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-accent-indigo-light text-[0.7rem] font-black tracking-[0.5em] uppercase opacity-80">
                Reference Layer 01
              </span>
              <h3 className="m-0 text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
                Âncora Científica SOTA v7.0 GOLD
              </h3>
            </div>
          </div>
          <div className="text-text-darker hidden items-center gap-8 text-[0.7rem] font-black uppercase md:flex">
            <div className="flex flex-col items-end gap-1 leading-none">
              <span className="opacity-50">BTN Anchor</span>
              <span className="font-mono text-lg text-white">{rpBtn.toFixed(1)}%</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-end gap-1 leading-none">
              <span className="opacity-50">BB Anchor</span>
              <span className="font-mono text-lg text-white">{rpBb.toFixed(1)}%</span>
            </div>
          </div>
        </summary>

        <div className="animate-sota-in flex flex-col gap-24 bg-linear-to-b from-black/20 to-transparent p-12 lg:p-16">
          <LegendSection />

          <div className="grid w-full grid-cols-1 gap-24 xl:grid-cols-2">
            <div className="space-y-20">
              <BoardAndTableLeft rpBtn={rpBtn} rpBb={rpBb} />
            </div>
            <div className="space-y-20">
              <RiskAndPrizesRight rpBtn={rpBtn} rpBb={rpBb} btnStack={BF_STACKS[6] ?? 0} bbStack={BF_STACKS[8] ?? 0} />
            </div>
          </div>

          <div className="border-t border-white/5 pt-24">
            <div className="mb-12 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
              <h3 className="m-0 text-center text-xl font-black tracking-[0.3em] text-white uppercase sm:text-2xl">
                Topological Range Equilibrium
              </h3>
              <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
            </div>

            <div className="grid grid-cols-1 items-start justify-items-center gap-20 lg:grid-cols-2">
              <div className="w-full max-w-140">
                <ActionRangeGrid
                  grid={BTN_ACTION_GRID}
                  title="BTN Opening Range (33.6%)"
                  subtitle="HRC Scientific NAI · Status: Aggression License"
                />
              </div>
              <div className="w-full max-w-140">
                <ActionRangeGrid
                  grid={BB_ACTION_GRID}
                  title="BB Reaction Range (82.9%)"
                  subtitle="HRC Scientific Def · Status: Asymmetric Pressure"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-24">
            <div className="mb-10 flex flex-col gap-1">
              <p className="m-0 text-2xl font-black tracking-tighter text-white uppercase">ICM Rulers Matrix</p>
              <p className="text-text-darker m-0 text-[0.8rem] font-bold tracking-[0.2em] uppercase">
                Malmuth-Harville Cross Reorganization
              </p>
            </div>
            <div className="scrollbar-hide rounded-5xl shadow-4xl overflow-x-auto border border-white/5">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/95 backdrop-blur-2xl">
                    <th className="sticky left-0 z-30 border-r border-white/10 bg-slate-900 px-6 py-5 text-left">
                      <div className="text-center text-[0.6rem] leading-tight font-black text-indigo-400/70 uppercase">
                        Hero
                        <br />
                        (Def)
                      </div>
                    </th>
                    {matrixData.mPlayers.map((p, i) => (
                      <th
                        key={p}
                        className="text-text-muted border-b border-white/10 px-6 py-5 text-center text-[0.8rem] font-black tracking-tighter whitespace-nowrap uppercase"
                      >
                        <div className="mb-1 text-white">{p}</div>
                        <div className="text-text-darker font-mono text-[0.7rem]">
                          {matrixData.mStacks.at(i)?.toFixed(1) ?? '0.0'}bb
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-900/40">
                  {matrixData.mBf.map((row, r) => {
                    const playerName = matrixData.mPlayers.at(r) ?? `P${r}`;
                    const playerStack = matrixData.mStacks.at(r);
                    const isRowActive = r === activeBbIdx;

                    return (
                      <tr
                        key={playerName}
                        className={`border-b border-white/5 transition-colors ${isRowActive ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}
                      >
                        <td className="sticky left-0 z-20 border-r border-white/10 bg-slate-900 px-6 py-4 text-center shadow-xl">
                          <div className="text-[0.8rem] font-black text-white uppercase">{playerName}</div>
                          <div className="text-text-darker font-mono text-[0.6rem]">
                            {playerStack?.toFixed(1) ?? '0.0'}bb
                          </div>
                        </td>
                        {row.map((bf, c) => {
                          const rp = matrixData.mRp.at(r)?.at(c) ?? 0;
                          const gravity = getRpGravityColor(rp);
                          const isActiveMatch = r === activeBbIdx && c === activeBtnIdx;
                          const columnPlayerName = matrixData.mPlayers.at(c) ?? `P${c}`;

                          return (
                            <td
                              key={`${playerName}-${columnPlayerName}`}
                              className={`px-2 py-4 text-center transition-all ${isActiveMatch ? 'z-10 ring-2 ring-indigo-500 ring-inset' : ''}`}
                            >
                              {r === c ? (
                                <div className="mx-auto h-1.5 w-1.5 rounded-full bg-white/10" />
                              ) : (
                                <div
                                  className={`flex flex-col gap-1.5 rounded-2xl border p-3 ${gravity} group/cell shadow-sm transition-transform hover:scale-110`}
                                >
                                  <div className="font-mono text-[0.9rem] leading-none font-black tracking-tighter">
                                    {rp.toFixed(1)}%
                                  </div>
                                  <div className="text-[0.6rem] leading-none font-bold tracking-widest uppercase opacity-50">
                                    BF {bf.toFixed(2)}x
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-white/5 pt-24">
            <ToyGamesFramework />
          </div>

          <div className="border-t border-white/5 pt-24">
            <div className="glass-panel group rounded-6xl shadow-5xl relative overflow-hidden border border-white/10 bg-black/40 p-0 text-left">
              <div className="from-accent-indigo/20 to-accent-danger/10 pointer-events-none absolute top-0 right-0 h-200 w-250 translate-x-1/4 -translate-y-1/4 transform rounded-full bg-linear-to-bl opacity-40 blur-[200px]" />

              <div className="relative z-10 p-16 sm:p-20 lg:p-24">
                <div className="mb-16 flex items-center gap-6">
                  <div className="bg-accent-indigo h-4 w-4 rounded-full shadow-[0_0_25px_var(--accent-indigo)]" />
                  <h3 className="m-0 text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                    Audit Protocol SOTA v7.0 GOLD
                  </h3>
                </div>

                <div className="grid grid-cols-1 items-center gap-24 text-left lg:grid-cols-2">
                  <div className="flex flex-col justify-center gap-10">
                    <div className="space-y-3">
                      <h4 className="text-[1rem] font-black tracking-[0.4em] text-white uppercase">
                        Risk Asymmetry Detection
                      </h4>
                      <div className="bg-accent-indigo h-1.5 w-24 rounded-full" />
                    </div>
                    <p className="text-text-muted m-0 max-w-xl text-[1.1rem] leading-relaxed font-medium">
                      Nesta topologia 9P, o {isBBUnderPressure ? 'BB' : 'BTN'} sofre uma pressão assimétrica
                      catastrófica. A <strong className="text-white">Gravidade da Distância</strong> entre RPs (
                      {pressureDelta}%) desloca o equilíbrio para um regime de{' '}
                      <strong className="text-accent-emerald">Exploração Forçada</strong>.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-12 rounded-4xl border border-white/10 bg-black/60 p-12 shadow-inner">
                      <div className="flex flex-col gap-4">
                        <span className="text-text-darker text-[0.7rem] font-black tracking-widest uppercase">
                          BF BTN (Agressor)
                        </span>
                        <span className="font-mono text-4xl font-black text-white">{bfBtn.toFixed(2)}x</span>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="text-accent-danger/60 text-[0.7rem] font-black tracking-widest uppercase">
                          BF BB (Defensor)
                        </span>
                        <span className="text-accent-danger font-mono text-4xl font-black">{bfBb.toFixed(2)}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-10">
                    <div className="rounded-5xl shadow-3xl group/diag relative overflow-hidden border border-white/10 bg-white/5 p-12 transition-all hover:border-white/20 hover:bg-white/10">
                      <div className="bg-accent-amber absolute top-0 left-0 h-full w-3 opacity-50" />
                      <h4 className="text-accent-amber mb-6 flex items-center gap-4 text-[0.9rem] leading-none font-black tracking-widest uppercase">
                        <i className="fa-solid fa-triangle-exclamation text-2xl" /> Structural Vulnerability (RIO)
                      </h4>
                      <p className="text-text-muted m-0 text-[1rem] leading-relaxed font-medium">
                        O range do BB contém mãos marginais que, apesar do acerto, sofrem de{' '}
                        <strong className="text-white">Reverse Implied Odds severas</strong>. O custo de colisão é
                        inflado pelo Bubble Factor de {bfBb.toFixed(2)}x, tornando o call um erro de valuation
                        sistêmico.
                      </p>
                    </div>

                    <div className="rounded-5xl shadow-3xl group/diag relative overflow-hidden border border-white/10 bg-white/5 p-12 transition-all hover:border-white/20 hover:bg-white/10">
                      <div className="bg-accent-emerald absolute top-0 left-0 h-full w-3 opacity-50" />
                      <h4 className="text-accent-emerald mb-6 flex items-center gap-4 text-[0.9rem] leading-none font-black tracking-widest uppercase">
                        <i className="fa-solid fa-bullseye text-2xl" /> Exploitation Directive
                      </h4>
                      <p className="text-text-muted m-0 text-[1rem] leading-relaxed font-medium">
                        Com um Risk Premium menor ({rpBtn.toFixed(1)}%), o BTN opera sob regime de{' '}
                        <strong className="text-white">Agressão Descontada</strong>. O limiar de equidade é reduzido,
                        tornando o overshove no River matematicamente inquestionável.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
