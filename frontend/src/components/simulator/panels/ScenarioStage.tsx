'use client';

/**
 * IDENTITY: Palco do Cenário SOTA Quantum v7.0 GOLD
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibir a narrativa tática e os medidores de risco com proporções áureas e alta densidade.
 * BINDING: [engine/types.ts, engine/utils.ts, ui/RiskGauge]
 */

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import type { Scenario } from '../solver/types';
import RiskGauge from '../ui/RiskGauge';

interface ScenarioStageProps {
  scenario: Scenario;
  effectiveIpRp?: number;
  effectiveOopRp?: number;
  /** SOTA: Horizonte dinâmico vindo do motor quântico */
  dynamicDeathZone?: number;
}

export default function ScenarioStage({
  scenario,
  effectiveIpRp = scenario.ipRp,
  effectiveOopRp = scenario.oopRp,
  dynamicDeathZone,
}: Readonly<ScenarioStageProps>) {
  const ipMorph = scenario.ipMorph ?? '--';
  const oopMorph = scenario.oopMorph ?? '--';
  const isNodelockB20 =
    scenario.name?.includes('B20') || scenario.narrativeTitle?.includes('B20');

  return (
    <div className="rounded-3xl border border-white/8 bg-slate-950/60 backdrop-blur-2xl shadow-xl relative overflow-hidden animate-sota-in transition-all duration-300 hover:border-white/15">
      {/* Ambient Backlight (subtle) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent-indigo/8 blur-[80px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent-emerald/5 blur-[80px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-5 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)] animate-pulse" />
            <h2 className="text-base font-black text-white uppercase tracking-tight leading-tight m-0">
              {isNodelockB20 ? 'Block Bet (20%)' : scenario.narrativeTitle}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/8 font-mono text-[0.55rem] text-text-muted">
            <i className="fa-solid fa-layer-group text-accent-indigo text-[0.6rem]" />
            <span>{scenario.narrativeSubtitle}</span>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-[0.58rem] font-black text-accent-rose-light uppercase tracking-[0.15em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
          <span>{scenario.verdict}</span>
        </div>
      </div>

      {/* Teoria Sintética */}
      <div className="relative z-10 px-5 pt-4 pb-3">
        <div className="p-4 rounded-xl border border-white/5 bg-black/25 text-[0.8rem] leading-relaxed shadow-inner relative">
          {isNodelockB20 ? (
            <p className="text-indigo-100/80 font-medium italic m-0">
              &quot;Dinâmica travada via Nodelock. Agressor forçado a apostar pequeno para absorver fold equity sem inflar as RIOs.&quot;
            </p>
          ) : (
            <div className="text-indigo-100/80 font-medium italic italic-sota-markdown">
              <SotaMarkdown content={scenario.theory} />
            </div>
          )}
          <div className="absolute bottom-3 right-3 opacity-15">
            <i className="fa-solid fa-quote-right text-accent-indigo text-sm" />
          </div>
        </div>
      </div>

      {/* Gauges de Risco IP vs OOP */}
      <div className="grid grid-cols-2 gap-5 px-5 pb-5 pt-2 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <RiskGauge
            value={effectiveIpRp}
            label="Agressor (IP)"
            pos={scenario.ipPos}
            stack={ipMorph}
            opponentValue={effectiveOopRp}
            dynamicDeathZone={dynamicDeathZone}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <RiskGauge
            value={effectiveOopRp}
            label="Defensor (OOP)"
            pos={scenario.oopPos}
            stack={oopMorph}
            opponentValue={effectiveIpRp}
            dynamicDeathZone={dynamicDeathZone}
          />
        </div>
      </div>
    </div>
  );
}
