'use client';
/**
 * IDENTITY: Referencial Visual — Âncora Empírica Aula 1.2
 * PATH: src/components/simulator/ReferencialAula12.tsx
 * ROLE: Seção colapsável com representação visual dos dados de calibração do motor ICM.
 *       SOTA v5.2 Sovereign: Restauração Científica Total e Impecável.
 */

import { useMemo, useState } from 'react';
import { BB_ACTION_GRID, BTN_ACTION_GRID, BF_MATRIX, BF_PLAYERS, BF_STACKS, BUBBLE_BF_MATRIX, BUBBLE_PLAYERS, BUBBLE_RP_MATRIX, BUBBLE_STACKS, EG_BF_MATRIX, EG_PLAYERS, EG_RP_MATRIX, EG_STACKS, PRIZES, RANKS, RP_MATRIX, TABLE_PLAYERS } from './ReferencialData';
import type { RangeCell, RangeAction } from './ReferencialData';

export type MatrixViewMode = 'FT' | 'BUBBLE' | 'EG';

const ACTION_COLORS: Record<RangeAction, string> = {
  raise: '#ef4444', // Red-500
  call: '#10b981',  // Emerald-500
  shove: '#6366f1', // Indigo-500
  fold: '#334155',  // Slate-700
};

function toRad ( deg: number ) { return ( deg * Math.PI ) / 180; }

function getHandLabel ( r: number, c: number ): string
{
  if ( r === c ) return RANKS[ r ] + RANKS[ r ];
  if ( r < c ) return RANKS[ r ] + RANKS[ c ] + 's';
  return RANKS[ c ] + RANKS[ r ] + 'o';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-slate-900/60 rounded-4xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-50" />
            <div className="space-y-2">
                <h4 className="text-[0.7rem] font-black text-accent-indigo uppercase tracking-[0.3em]">HRC Context</h4>
                <p className="text-[0.8rem] text-text-muted leading-relaxed font-medium">
                MTT Vanilla $11 · 126 Players<br/>
                Final Table 9P · 12.5% Ante<br/>
                <span className="text-white font-mono">0.5bb / 1.0bb</span>
                </p>
            </div>
            <div className="space-y-2">
                <h4 className="text-[0.7rem] font-black text-accent-amber uppercase tracking-[0.3em]">Bubble Factor</h4>
                <p className="text-[0.8rem] text-text-muted leading-relaxed font-medium">
                Dívida de Equidade.<br/>
                Quanto suas fichas perdem valor ao serem colocadas em risco.
                </p>
            </div>
            <div className="space-y-2">
                <h4 className="text-[0.7rem] font-black text-accent-emerald uppercase tracking-[0.3em]">Risk Premium</h4>
                <p className="text-[0.8rem] text-text-muted leading-relaxed font-medium">
                Imposto do ICM.<br/>
                <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 rounded-sm">RP = (BF-1)/BF</span>
                </p>
            </div>
            <div className="space-y-2">
                <h4 className="text-[0.7rem] font-black text-accent-danger uppercase tracking-[0.3em]">Âncora SOTA</h4>
                <p className="text-[0.8rem] text-text-muted leading-relaxed font-medium">
                BTN (39.9bb) vs BB (53.9bb)<br/>
                BTN RP: <strong className="text-white">21.4%</strong> (Grave)<br/>
                BB RP: <strong className="text-white">12.9%</strong> (Médio)
                </p>
            </div>
        </div>

        {/* Tournament Structures Framework */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
                {
                    title: 'TOP-HEAVY (▲)',
                    desc: `1º lugar ≥ 25%. Laddering pouco valioso; o valor está em ganhar, não em sobreviver. Pressão ICM severa: foldar para subir uma posição tem EV marginal. BF elevado.`,
                    color: 'border-amber-500/20 bg-amber-500/5'
                },
                {
                    title: 'FLAT (▬)',
                    desc: `1º lugar ≤ 18%. Saltos equilibrados e previsíveis. Laddering relevante: subir UMA posição tem valor real e tangível. BF próximo de 1; o jogo se aproxima de ChipEV.`,
                    color: 'border-emerald-500/20 bg-emerald-500/5',
                    active: true
                },
                {
                    title: 'HÍBRIDA (◆)',
                    desc: `18-24%. Zona de exclusão. Método de análise por exclusão. Varia entre sites e formatos. Exige avaliação manual da curva de payjumps.`,
                    color: 'border-indigo-500/20 bg-indigo-500/5'
                },
                {
                    title: 'PKO (💥)',
                    desc: `Top-heavyssimo (sempre). Dinheiro estático concentrado no 1º. A compensação vem pelo bounty acumulado, diluindo o ICM estático.`,
                    color: 'border-rose-500/20 bg-rose-500/5'
                },
                {
                    title: 'SATÉLITE (🎫)',
                    desc: `ICM Binário e Terminal. Prêmios idênticos no topo. Dinâmica de sobrevivência pura. Acumular além do necessário tem EV zero. Ticket ou nada.`,
                    color: 'border-white/10 bg-white/5'
                },
            ].map(item => (
                <div key={item.title} className={`p-6 rounded-3xl border transition-all ${item.color} ${item.active ? 'ring-2 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}>
                        <h5 className="text-xs font-black text-white mb-3 tracking-widest">{item.title}</h5>
                    <p className="text-[0.7rem] text-text-muted leading-relaxed font-medium m-0">{item.desc}</p>
                </div>
            ))}
        </div>
    </div>
  );
}

function ActionRangeGrid({ grid, title, subtitle }: Readonly<{ grid: RangeCell[][], title: string, subtitle: string }>) {
  return (
    <div className="flex flex-col gap-5 group/grid">
      <div className="flex flex-col gap-1">
        <h4 className="m-0 text-[1.1rem] font-black text-white uppercase tracking-tight">{ title }</h4>
        <p className="m-0 text-[0.7rem] font-bold text-text-darker uppercase tracking-[0.15em]">{ subtitle }</p>
      </div>
      <div className="p-3 bg-slate-950/60 rounded-4xl border border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden transition-all duration-500 hover:border-white/20">
        {/* Glow de Fundo */}
        <div className="absolute inset-0 bg-radial-[at_center_center] from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover/grid:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="grid gap-0.5 w-full aspect-square relative z-10 grid-cols-[repeat(13,_1fr)]">
            { grid.flat().map( ( cell, i ) => {
            const r = Math.floor(i / 13);
            const c = i % 13;
            const isEmpty = !cell.raise && !cell.call && !cell.shove && (!cell.fold || cell.fold === 100);
            const handLabel = getHandLabel( r, c );

            return (
            <div key={ handLabel } className={`relative group/cell overflow-hidden rounded-sm aspect-square transition-all duration-300 ${isEmpty ? 'bg-slate-900/40 border border-white/5 hover:bg-slate-800/60' : 'bg-slate-950/80 border border-white/10 hover:z-20 hover:scale-[1.2] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}>
            <div className="absolute inset-0 flex flex-col">
                {(['shove', 'raise', 'call', 'fold'] as RangeAction[]).map(action => (
                    cell[action] && (!isEmpty || action !== 'fold') ? (
                        <div key={action}
                             style={{
                                 height: `${cell[action]}%`,
                                 backgroundColor: ACTION_COLORS[action]
                             }}
                             className="w-full opacity-80 group-hover/cell:opacity-100 transition-opacity" />
                    ) : null
                ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`text-[0.45rem] lg:text-[0.55rem] font-black font-mono transition-colors drop-shadow-md select-none ${isEmpty ? 'text-white/10 group-hover/cell:text-white/40' : 'text-white/60 group-hover/cell:text-white font-bold'}`}>
                { getHandLabel( r, c ) }
              </span>
            </div>
            </div>
            );
            } ) }        </div>
      </div>
    </div>
  );
}

function BoardAndTableLeft({ rpBtn: _rpBtn, rpBb: _rpBb }: Readonly<{ rpBtn: number, rpBb: number }>) {
  const W = 540; const H = 380;
  const rx = 180; const ry = 110;
  const cx = W / 2; const cy = H / 2;

  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="m-0 mb-6 text-[0.8rem] font-black text-text-darker uppercase tracking-[0.3em]">Board Reference</p>
        <div className="flex justify-center gap-4">
          { [
            { rank: 'K', suit: '♦', colorClass: 'text-sky-400', borderClass: 'border-sky-400/40', bg: 'bg-sky-950/20' },
            { rank: 'J', suit: '♣', colorClass: 'text-emerald-400', borderClass: 'border-emerald-400/40', bg: 'bg-emerald-950/20' },
            { rank: 'T', suit: '♠', colorClass: 'text-slate-100', borderClass: 'border-slate-100/40', bg: 'bg-slate-800/40' },
            { rank: '2', suit: '♦', colorClass: 'text-sky-400', borderClass: 'border-sky-400/40', bg: 'bg-sky-950/20' },
            { rank: '3', suit: '♦', colorClass: 'text-sky-400', borderClass: 'border-sky-400/40', bg: 'bg-sky-950/20' },
          ].map( ( { rank, suit, colorClass, borderClass, bg } ) => (
            <div key={ rank + suit } className={`w-20 h-28 rounded-2xl ${bg} border-2 ${borderClass} flex flex-col items-center justify-center gap-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl group hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent opacity-50" />
              <span className={`text-[2.4rem] font-black leading-none drop-shadow-md relative z-10 ${colorClass}`}>{ rank }</span>
              <span className={`text-[1.6rem] leading-none drop-shadow-md relative z-10 ${colorClass}`}>{ suit }</span>
            </div>
          ) ) }
        </div>
      </div>

      <div className="relative">
        <p className="m-0 mb-6 text-[0.8rem] font-black text-text-darker uppercase tracking-[0.3em]">Geometric Topology</p>
        <div className="bg-slate-950/80 rounded-5xl border border-white/10 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl relative">
            {/* Ambient Backlight */}
            <div className="absolute inset-0 bg-radial-[at_center_center] from-indigo-500/5 to-transparent pointer-events-none" />
            <svg width="100%" height="100%" viewBox={`0 0 ${ W } ${ H }`} className="overflow-visible drop-shadow-2xl">
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
              <ellipse cx={ cx } cy={ cy } rx={ rx + 15 } ry={ ry + 15 } fill="transparent" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="20" filter="url(#tableGlow)" />
              {/* Table Rail */}
              <ellipse cx={ cx } cy={ cy } rx={ rx + 12 } ry={ ry + 12 } fill="url(#railGrad)" stroke="#475569" strokeWidth="2" filter="url(#chipShadow)" />
              {/* Table Felt */}
              <ellipse cx={ cx } cy={ cy } rx={ rx } ry={ ry } fill="url(#feltGrad)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Center Details */}
              <circle cx={cx} cy={cy} r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={cx} cy={cy} r="30" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
              <text x={cx} y={cy + 4} textAnchor="middle" fill="currentColor" className="text-[0.65rem] font-black text-white/10 uppercase tracking-[0.8em]">SOTA</text>

              { TABLE_PLAYERS.map( ( p ) => {
                const angle = p.angle;
                const x = cx + rx * Math.cos( toRad( angle ) );
                const y = cy + ry * Math.sin( toRad( angle ) );
                const isHero = p.name === 'BB';
                const isVillain = p.name === 'BTN';

                let accent = 'text-text-muted';
                if (isHero) accent = 'text-emerald-400';
                else if (isVillain) accent = 'text-indigo-400';

                let strokeColor = "#334155";
                if (isHero) strokeColor = "#10b981";
                else if (isVillain) strokeColor = "#6366f1";

                let innerRingStroke = "rgba(255,255,255,0.05)";
                if (isHero) innerRingStroke = "rgba(16, 185, 129, 0.3)";
                else if (isVillain) innerRingStroke = "rgba(99, 102, 241, 0.3)";

                let stackColor = 'text-slate-400/80';
                if (isHero) stackColor = 'text-emerald-200/80';
                else if (isVillain) stackColor = 'text-indigo-200/80';

                let glowStroke = "rgba(99, 102, 241, 0.3)";
                if (isHero) glowStroke = "rgba(16, 185, 129, 0.3)";

                return (
                  <g key={ p.name } className="group/player transition-all hover:scale-110 cursor-default" style={{ transformOrigin: `${x}px ${y}px` }}>
                    {/* Position specific glow */}
                    {(isHero || isVillain) && (
                      <circle cx={ x } cy={ y } r="38" fill="transparent" stroke={glowStroke} strokeWidth="3" filter="url(#tableGlow)" />
                    )}

                    {/* Chip Base */}
                    <circle cx={ x } cy={ y } r="32" fill="#020617" stroke={strokeColor} strokeWidth="4" filter="url(#chipShadow)" />
                    {/* Chip Inner Ring */}
                    <circle cx={ x } cy={ y } r="26" fill="transparent" stroke={innerRingStroke} strokeWidth="2" strokeDasharray="3 3" />

                    <text x={ x } y={ y - 2 } textAnchor="middle" fill="currentColor" className={`text-[0.85rem] font-black uppercase ${accent} drop-shadow-md`}>{ p.name }</text>
                    <text x={ x } y={ y + 12 } textAnchor="middle" fill="currentColor" className={`text-[0.65rem] font-mono font-bold ${stackColor}`}>{ p.stack }bb</text>
                  </g>
                );
              } ) }
            </svg>
        </div>
      </div>
    </div>
  );
}

function RiskAndPrizesRight({ rpBtn: _rpBtn, rpBb: _rpBb, btnStack: _btnStack, bbStack: _bbStack }: Readonly<{ rpBtn: number, rpBb: number, btnStack: number, bbStack: number }>) {
  return (
    <div className="flex flex-col gap-12">
      <div className="space-y-6">
        <p className="m-0 text-[0.8rem] font-black text-text-darker uppercase tracking-[0.3em]">Financial Structure (FLAT)</p>
        <div className="bg-slate-900/40 rounded-5xl border border-white/5 p-10 space-y-7 shadow-inner">
          { PRIZES.map( ( { pos, val, jump }, i ) => {
            const widthProps = { style: { width: `${ ( val / PRIZES[ 0 ].val ) * 100 }%` } };

            let barBgClass = 'bg-white/10';
            if (i === 0) barBgClass = 'bg-linear-to-r from-amber-400 to-amber-600';
            else if (i === 1) barBgClass = 'bg-linear-to-r from-slate-200 to-slate-400';
            else if (i === 2) barBgClass = 'bg-linear-to-r from-violet-400 to-violet-600';

            let valColorClass = 'text-text-muted';
            if (i === 0) valColorClass = 'text-amber-400';
            else if (i === 1) valColorClass = 'text-slate-400';
            else if (i === 2) valColorClass = 'text-violet-400';

            return (
              <div key={ pos } className="flex items-center gap-6 group/jump">
                            <span className="text-xs font-black text-text-darker w-6 font-mono">{ pos }</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${barBgClass}`} {...widthProps} />
                </div>
                <div className="flex items-center gap-4 w-32 justify-end">
                   {jump > 0 && <span className="text-[0.65rem] font-bold text-emerald-500/40 opacity-0 group-hover/jump:opacity-100 transition-opacity">Δ{jump.toFixed(1)}</span>}
                   <span className={`text-[0.85rem] font-black font-mono ${valColorClass}`}>${ val.toFixed(2) }</span>
                </div>
              </div>
            );
          } ) }
        </div>
      </div>

      <div className="space-y-6">
        <p className="m-0 text-[0.8rem] font-black text-text-darker uppercase tracking-[0.3em]">HRC Decision Tree Specs</p>
        <div className="bg-slate-900/60 rounded-5xl border border-white/10 p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 blur-3xl rounded-full" />
            <div className="flex items-start gap-6">
                <div className="w-1.5 h-12 bg-accent-indigo rounded-full shrink-0" />
                <div className="space-y-2">
                    <h5 className="text-[0.8rem] font-black text-white uppercase tracking-widest">Sizing Drift Logic</h5>
                                <p className="text-xs text-text-muted leading-relaxed m-0 font-medium">
                        No contexto de ICM severo, cbets elevadas migram para <strong className="text-white">abordagens de menor sizing (20-50%)</strong>. Esta prática é quase inexistente em cenários ChipEV tradicionais.
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-6">
                <div className="w-1.5 h-12 bg-accent-emerald rounded-full shrink-0" />
                <div className="space-y-2">
                    <h5 className="text-[0.8rem] font-black text-white uppercase tracking-widest">Nash Equilibrium Precision</h5>
                                <p className="text-xs text-text-muted leading-relaxed m-0 font-medium">
                        Simulações HRC apresentam um <strong className="text-white">e-Nash reduzido</strong>, eliminando os ruídos operacionais comuns no GTO Wizard e garantindo maior estabilidade estratégica.
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
      <div className="flex flex-col gap-1 mb-12">
          <p className="m-0 text-2xl font-black text-white uppercase tracking-tighter">Strategic Toy Games</p>
          <p className="m-0 text-[0.8rem] font-bold text-text-darker uppercase tracking-[0.2em]">Framework Teórico — ΔRP as Distortion Axis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        { [
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
        ].map( ( { term, def } ) => (
          <div key={ term } className="p-8 bg-slate-900/50 rounded-4xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all group">
            <span className="text-[0.9rem] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-4 group-hover:translate-x-1 transition-transform">{ term }</span>
            <span className="text-[0.9rem] text-text-muted leading-relaxed font-medium">{ def }</span>
          </div>
        ) ) }
      </div>

      <div className="overflow-x-auto scrollbar-hide rounded-5xl border border-white/5 shadow-3xl">
        <table className="w-full border-collapse bg-slate-900/40">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80">
              <th className="py-5 px-8 text-left font-black text-text-darker text-[0.8rem] uppercase tracking-widest whitespace-nowrap">Node</th>
              <th className="py-5 px-8 text-right font-black text-indigo-400 text-[0.8rem] uppercase tracking-widest whitespace-nowrap">RP IP</th>
              <th className="py-5 px-8 text-right font-black text-rose-500 text-[0.8rem] uppercase tracking-widest whitespace-nowrap">RP OOP</th>
              <th className="py-5 px-8 text-right font-black text-emerald-500 text-[0.8rem] uppercase tracking-widest whitespace-nowrap">ΔRP</th>
              <th className="py-5 px-8 text-right font-black text-text-muted text-[0.8rem] uppercase tracking-widest whitespace-nowrap">Bluff IP</th>
              <th className="py-5 px-8 text-right font-black text-text-muted text-[0.8rem] uppercase tracking-widest whitespace-nowrap">Def OOP</th>
              <th className="py-5 px-8 text-left font-black text-text-darker text-[0.8rem] uppercase tracking-widest">Effect</th>
            </tr>
          </thead>
          <tbody className="bg-slate-900/10">
            {[
                { no: 'TG0', rpi: 0, rpo: 0, delta: 0, bluff: 33, def: 50, effect: 'Baseline GTO (MDF Perfeito)' },
                { no: 'TG1', rpi: 3, rpo: 6, delta: -3, bluff: 37, def: 44, effect: 'Efeito Batata Quente (OOP absorve risco)' },
                { no: 'TG2', rpi: 3, rpo: 9, delta: -6, bluff: 42, def: 40, effect: 'Teto do RP (OOP atinge piso de defesa)' },
                { no: 'TG3', rpi: 3, rpo: 18, delta: -15, bluff: 48, def: 40, effect: 'Defesa Inelástica (Pacto Silencioso)' },
                { no: 'TG4', rpi: 9, rpo: 3, delta: 6, bluff: 30, def: 35, effect: 'Contra-intuitividade: Defensor coberto folda MAIS' },
                { no: 'TG5', rpi: 18, rpo: 3, delta: 15, bluff: 25, def: 28, effect: 'Vantagem de Risco: IP impõe custo de colisão' },
                { no: 'TG6', rpi: 21, rpo: 3, delta: 18, bluff: 20, def: 22, effect: 'Agressão Impune (Bolha/Terminal)' },
            ].map((row, i) => {
                let deltaText = `${row.delta}`;
                if (row.delta > 0) deltaText = `+${row.delta}`;
                else if (row.delta === 0) deltaText = '0';

                return (
                <tr key={ row.no } className={`border-b border-white/5 transition-colors hover:bg-indigo-500/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                    <td className="py-5 px-8 font-black text-white text-[0.85rem]">{ row.no }</td>
                    <td className="py-5 px-8 text-right font-mono text-indigo-300 font-bold">{ row.rpi }%</td>
                    <td className="py-5 px-8 text-right font-mono text-rose-400 font-bold">{ row.rpo }%</td>
                    <td className="py-5 px-8 text-right font-mono font-black text-white">{ deltaText }%</td>
                    <td className="py-5 px-8 text-right font-mono text-text-dim">{ row.bluff }%</td>
                    <td className="py-5 px-8 text-right font-mono text-text-dim">{ row.def }%</td>
                    <td className="py-5 px-8 text-[0.8rem] text-text-muted font-medium">{ row.effect }</td>
                </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReferencialAula12 ()
{
  const [ matrixView ] = useState<MatrixViewMode>( 'FT' );

  const matrixData = useMemo( () =>
  {
    switch ( matrixView )
    {
      case 'BUBBLE': return { mPlayers: BUBBLE_PLAYERS, mStacks: BUBBLE_STACKS, mBf: BUBBLE_BF_MATRIX, mRp: BUBBLE_RP_MATRIX };
      case 'EG': return { mPlayers: EG_PLAYERS, mStacks: EG_STACKS, mBf: EG_BF_MATRIX, mRp: EG_RP_MATRIX };
      default: return { mPlayers: BF_PLAYERS, mStacks: BF_STACKS, mBf: BF_MATRIX, mRp: RP_MATRIX };
    }
  }, [ matrixView ] );

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
        <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-12 lg:p-16 hover:bg-white/5 transition-all select-none outline-none border-b border-white/5">
          <div className="flex items-center gap-8">
            <div className="w-14 h-14 rounded-3xl bg-accent-indigo/10 flex items-center justify-center text-accent-indigo group-open:bg-accent-indigo group-open:text-white transition-all shadow-xl">
                <i className="fa-solid fa-chevron-right group-open:rotate-90 text-xl" />
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="text-[0.7rem] font-black uppercase tracking-[0.5em] text-accent-indigo-light opacity-80">Reference Layer 01</span>
                <h3 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight uppercase">Âncora Científica SOTA v5.2 Gold</h3>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[0.7rem] font-black uppercase text-text-darker">
             <div className="flex flex-col items-end leading-none gap-1">
                <span className="opacity-50">BTN Anchor</span>
                <span className="text-white text-lg font-mono">{rpBtn.toFixed(1)}%</span>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="flex flex-col items-end leading-none gap-1">
                <span className="opacity-50">BB Anchor</span>
                <span className="text-white text-lg font-mono">{rpBb.toFixed(1)}%</span>
             </div>
          </div>
        </summary>

        <div className="flex flex-col gap-24 p-12 lg:p-16 animate-sota-in bg-linear-to-b from-black/20 to-transparent">

          <LegendSection />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-24 w-full">
            <div className="space-y-20">
                <BoardAndTableLeft rpBtn={rpBtn} rpBb={rpBb} />
            </div>
            <div className="space-y-20">
                <RiskAndPrizesRight rpBtn={rpBtn} rpBb={rpBb} btnStack={BF_STACKS[6]} bbStack={BF_STACKS[8]} />
            </div>
          </div>

          <div className="pt-24 border-t border-white/5">
            <div className="flex items-center justify-center gap-4 mb-12">
                <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
                <h3 className="text-xl sm:text-2xl font-black text-white m-0 tracking-[0.3em] uppercase text-center">
                    Topological Range Equilibrium
                </h3>
                <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start justify-items-center">
                <div className="w-full max-w-140">
                    <ActionRangeGrid grid={ BTN_ACTION_GRID } title="BTN Opening Range (33.6%)" subtitle="HRC Scientific NAI · Status: Aggression License" />
                </div>
                <div className="w-full max-w-140">
                    <ActionRangeGrid grid={ BB_ACTION_GRID } title="BB Reaction Range (82.9%)" subtitle="HRC Scientific Def · Status: Asymmetric Pressure" />
                </div>
            </div>
          </div>

          <div className="pt-24 border-t border-white/5">
            <div className="flex flex-col gap-1 mb-10">
              <p className="m-0 text-2xl font-black text-white uppercase tracking-tighter">ICM Rulers Matrix</p>
              <p className="m-0 text-[0.8rem] font-bold text-text-darker uppercase tracking-[0.2em]">Malmuth-Harville Cross Reorganization</p>
            </div>
            <div className="overflow-x-auto scrollbar-hide rounded-5xl border border-white/5 shadow-4xl">
                <table className="border-collapse w-full">
                    <thead>
                        <tr className="bg-slate-900/95 backdrop-blur-2xl">
                            <th className="py-5 px-6 text-left border-r border-white/10 sticky left-0 z-30 bg-slate-900">
                                <div className="text-[0.6rem] font-black text-indigo-400/70 uppercase text-center leading-tight">Hero<br/>(Def)</div>
                            </th>
                            { matrixData.mPlayers.map( ( p, i ) => (
                                <th key={ p } className="py-5 px-6 text-text-muted font-black text-[0.8rem] text-center whitespace-nowrap uppercase tracking-tighter border-b border-white/10">
                                    <div className="text-white mb-1">{ p }</div>
                                    <div className="text-text-darker font-mono text-[0.7rem]">{ matrixData.mStacks[ i ].toFixed(1) }bb</div>
                                </th>
                            ) ) }
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/40">
                        { matrixData.mBf.map((row, r) => (
                            <tr key={matrixData.mPlayers[r]} className={`border-b border-white/5 transition-colors ${r === activeBbIdx ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}>
                                <td className="py-4 px-6 border-r border-white/10 sticky left-0 z-20 bg-slate-900 shadow-xl text-center">
                                    <div className="text-[0.8rem] font-black text-white uppercase">{matrixData.mPlayers[r]}</div>
                                    <div className="text-[0.6rem] font-mono text-text-darker">{matrixData.mStacks[r]}bb</div>
                                </td>
                                { row.map((bf, c) => {
                                    const rp = matrixData.mRp[r][c];
                                    const gravity = getRpGravityColor(rp);
                                    const isActiveMatch = r === activeBbIdx && c === activeBtnIdx;
                                    return (
                                        <td key={matrixData.mPlayers[c]} className={`py-4 px-2 text-center transition-all ${isActiveMatch ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}`}>
                                            { r === c ? <div className="w-1.5 h-1.5 rounded-full bg-white/10 mx-auto" /> : (
                                                <div className={`flex flex-col gap-1.5 p-3 rounded-2xl border ${gravity} shadow-sm group/cell hover:scale-110 transition-transform`}>
                                                    <div className="text-[0.9rem] font-black font-mono leading-none tracking-tighter">
                                                        { rp.toFixed( 1 ) }%
                                                    </div>
                                                    <div className="text-[0.6rem] font-bold opacity-50 uppercase tracking-widest leading-none">
                                                        BF { bf.toFixed( 2 ) }x
                                                    </div>
                                                </div>
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

          <div className="pt-24 border-t border-white/5">
            <ToyGamesFramework />
          </div>

          <div className="pt-24 border-t border-white/5">
            <div className="glass-panel border border-white/10 p-0 overflow-hidden relative group rounded-6xl bg-black/40 text-left shadow-5xl">
              <div className="absolute top-0 right-0 w-250 h-200 bg-linear-to-bl from-accent-indigo/20 to-accent-danger/10 blur-[200px] pointer-events-none rounded-full transform translate-x-1/4 -translate-y-1/4 opacity-40" />

              <div className="p-16 sm:p-20 lg:p-24 relative z-10">
                <div className="flex items-center gap-6 mb-16">
                    <div className="w-4 h-4 rounded-full bg-accent-indigo shadow-[0_0_25px_var(--accent-indigo)]" />
                    <h3 className="text-3xl sm:text-4xl font-black text-white m-0 tracking-tight uppercase">
                        SOTA Topological Audit
                    </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 text-left items-center">
                  <div className="flex flex-col gap-10 justify-center">
                    <div className="space-y-3">
                        <h4 className="text-[1rem] font-black text-white uppercase tracking-[0.4em]">
                            Risk Asymmetry Detection
                        </h4>
                        <div className="h-1.5 w-24 bg-accent-indigo rounded-full" />
                    </div>
                    <p className="text-[1.1rem] text-text-muted leading-relaxed m-0 font-medium max-w-xl">
                        Nesta topologia 9P, o {isBBUnderPressure ? 'BB' : 'BTN'} sofre uma pressão assimétrica catastrófica. A <strong className="text-white">Gravidade da Distância</strong> entre RPs ({pressureDelta}%)
                        desloca o equilíbrio para um regime de <strong className="text-accent-emerald">Exploração Forçada</strong>.
                    </p>
                    <div className="bg-black/60 border border-white/10 rounded-4xl p-12 mt-2 shadow-inner grid grid-cols-2 gap-12">
                        <div className="flex flex-col gap-4">
                            <span className="text-[0.7rem] font-black uppercase tracking-widest text-text-darker">BF BTN (Agressor)</span>
                            <span className="text-4xl font-mono font-black text-white">{bfBtn.toFixed(2)}x</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[0.7rem] font-black uppercase tracking-widest text-accent-danger/60">BF BB (Defensor)</span>
                            <span className="text-4xl font-mono font-black text-accent-danger">{bfBb.toFixed(2)}x</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-10">
                    <div className="bg-white/5 border border-white/10 rounded-5xl p-12 hover:bg-white/10 transition-all hover:border-white/20 shadow-3xl group/diag relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-3 h-full bg-accent-amber opacity-50" />
                        <h4 className="text-[0.9rem] font-black text-accent-amber uppercase tracking-widest mb-6 flex items-center gap-4 leading-none">
                            <i className="fa-solid fa-triangle-exclamation text-2xl" /> Structural Vulnerability (RIO)
                        </h4>
                            <p className="text-base text-text-muted leading-relaxed m-0 font-medium">
                            O range do BB contém mãos marginais que, apesar do acerto, sofrem de <strong className="text-white">Reverse Implied Odds severas</strong>. O custo de colisão é inflado pelo Bubble Factor de {bfBb.toFixed(2)}x, tornando o call um erro de valuation sistêmico.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-5xl p-12 hover:bg-white/10 transition-all hover:border-white/20 shadow-3xl group/diag relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-3 h-full bg-accent-emerald opacity-50" />
                        <h4 className="text-[0.9rem] font-black text-accent-emerald uppercase tracking-widest mb-6 flex items-center gap-4 leading-none">
                            <i className="fa-solid fa-bullseye text-2xl" /> Exploitation Directive
                        </h4>
                            <p className="text-base text-text-muted leading-relaxed m-0 font-medium">
                            Com um Risk Premium menor ({rpBtn.toFixed(1)}%), o BTN opera sob regime de <strong className="text-white">Agressão Descontada</strong>. O limiar de equidade é reduzido, tornando o overshove no River matematicamente inquestionável.
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
