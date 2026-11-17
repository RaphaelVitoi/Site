'use client';

import { useState } from 'react';

export function DownwardDriftWidget() {
  const [rp, setRp] = useState(15);
  const betFreq = Math.max(12, Math.round(65 - rp * 1.35));
  const minEquity = Math.min(80, Math.round(50 + rp * 0.5));
  let sizing = 'Grande — 75% pot';
  let sizingColorClass = 'text-[#765421]';
  let sizingColorHex = '#765421';
  if (rp > 10 && rp <= 22) {
    sizing = 'Pequeno — 30% pot';
    sizingColorClass = 'text-[#286247]';
    sizingColorHex = '#286247';
  } else if (rp > 22) {
    sizing = 'Check — 0% pot';
    sizingColorClass = 'text-[#6e3636]';
    sizingColorHex = '#6e3636';
  }

  // SVG dimensions: width = 380 (viewbox 0 0 400 120, range from 10 to 390)
  const xStart = 10 + (minEquity / 100) * 380;
  const xEnd = 390;
  const controlY = 110 - (betFreq / 100) * 160;
  const controlX = (xStart + xEnd) / 2;
  const activePath = `M ${xStart},110 Q ${controlX},${controlY} ${xEnd},110 Z`;
  const cutoffLabelX = Math.max(15, xStart - 45);
  const cutoffBackdropX = Math.max(10, cutoffLabelX - 5);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#DED9D2] bg-[#FAFAF8] p-10 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(13,12,10,0.04)]">
      <div className="flex items-center justify-between border-b border-[#DED9D2] pb-4.5">
        <span className="font-mono text-xs font-bold tracking-[0.14em] text-[#0D0C0A] uppercase">
          Downward Drift Model
        </span>
        <span className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.14em] text-[#765421] uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#765421]" /> Active
        </span>
      </div>

      {/* Interactive SVG Curve Visualizer */}
      <div className="relative h-30 w-full overflow-hidden rounded-lg border border-[#EDE8E1] bg-[#F5F3EE]">
        <svg viewBox="0 0 400 120" className="block h-full w-full" aria-label="Visualizador Interativo de Curva Downward Drift" role="img">
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#765421" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#765421" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B2B0AB" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#B2B0AB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Total Range Curve */}
          <path d="M 10,110 Q 200,10 390,110 Z" fill="url(#grayGradient)" />
          <path d="M 10,110 Q 200,10 390,110" stroke="#B2B0AB" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />

          {/* Active Range Curve */}
          <path d={activePath} fill="url(#goldGradient)" className="transition-[d] duration-300 ease-in-out" />
          <path
            d={`M ${xStart},110 Q ${controlX},${controlY} ${xEnd},110`}
            stroke="#765421"
            strokeWidth="1.5"
            fill="none"
            className="transition-[d] duration-300 ease-in-out"
          />

          {/* Threshold marker */}
          <line
            x1={xStart}
            y1="10"
            x2={xStart}
            y2="110"
            stroke={sizingColorHex}
            strokeWidth="1"
            strokeDasharray="2 2"
            className="transition-all duration-300 ease-in-out"
          />
          <circle cx={xStart} cy="60" r="3" fill={sizingColorHex} className="transition-all duration-300 ease-in-out" />

          {/* Text labels */}
          <text x="15" y="25" fill="#625f5a" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1">
            MÃOS FRACAS
          </text>
          <text x="310" y="25" fill="#625f5a" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1">
            MÃOS FORTES
          </text>
          {/* Superficie opaca: a curva dinamica nunca disputa legibilidade com o rotulo de corte. */}
          <rect
            data-a11y-contrast-backdrop="downward-drift-cutoff"
            x={cutoffBackdropX}
            y="94"
            width="100"
            height="16"
            rx="2"
            fill="#F5F3EE"
            pointerEvents="none"
          />
          <text
            x={cutoffLabelX}
            y="105"
            fill={sizingColorHex}
            fontFamily="var(--font-mono)" fontSize="7"
            fontWeight="bold"
            letterSpacing="0.5"
            className="transition-all duration-300 ease-in-out"
          >
            CORTE: {minEquity}% EQ
          </text>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between font-mono text-xs tracking-[0.14em] text-[#625f5a] uppercase">
          <span>Risk Premium da Mesa</span>
          <span className="font-bold text-[#0D0C0A]">{rp}%</span>
        </div>
        <div className="relative h-1 overflow-hidden rounded-full bg-[#EDE8E1]">
          <progress
            value={rp}
            max="35"
            className="absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-progress-bar]:bg-[#B09460] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-[#B09460]"
            aria-hidden="true"
          />
          <input
            type="range"
            min="0"
            max="35"
            value={rp}
            onChange={(e) => setRp(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Risk Premium"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Frequência de Bet', value: `${betFreq}%` },
          { label: 'Eq. mínima p/ Bet', value: `${minEquity}%` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#DED9D2] bg-[#F5F3EE] px-4.5 py-4 transition-all duration-300"
          >
            <p className="mb-2 font-mono text-xs font-bold tracking-[0.14em] text-[#625f5a] uppercase">
              {item.label}
            </p>
            <p className="font-display text-[1.45rem] leading-none font-bold tracking-[-0.02em] text-[#0D0C0A]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#DED9D2] bg-[#F5F3EE] px-5 py-4.5 transition-all duration-300">
        <span className="font-mono text-xs font-bold tracking-[0.14em] text-[#625f5a] uppercase">
          Sizing recomendado
        </span>
        <span className={`font-mono text-[0.72rem] font-bold transition-colors duration-300 ${sizingColorClass}`}>
          {sizing}
        </span>
      </div>
    </div>
  );
}
