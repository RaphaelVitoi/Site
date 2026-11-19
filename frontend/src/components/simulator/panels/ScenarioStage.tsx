'use client';

/**
 * IDENTITY: Palco do Cenário SOTA Quantum v7.0 GOLD
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibir a narrativa tática e os medidores de risco com proporções áureas e alta densidade.
 * BINDING: [engine/types.ts, engine/utils.ts, ui/RiskGauge]
 */

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import type { Scenario } from '../solver/types';
import { RiskGauge } from '../ui/RiskGauge';

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
  const isNodelockB20 = scenario.name?.includes('B20') || scenario.narrativeTitle?.includes('B20');

  return (
    <div className="animate-sota-in relative overflow-hidden rounded-3xl border border-white/8 bg-slate-950/60 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-white/15">
      {/* Ambient Backlight (subtle) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-accent-indigo/8 absolute -top-20 -right-20 h-48 w-48 rounded-full blur-[80px]" />
        <div className="bg-accent-emerald/5 absolute -bottom-20 -left-20 h-48 w-48 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-accent-indigo h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_8px_var(--accent-indigo)]" />
            <h2 className="m-0 text-base leading-tight font-black tracking-tight text-white uppercase">
              {isNodelockB20 ? 'Block Bet (20%)' : scenario.narrativeTitle}
            </h2>
          </div>
          <div className="text-text-muted inline-flex items-center gap-1.5 rounded-md border border-white/8 bg-white/5 px-2 py-0.5 font-mono text-[0.55rem]">
            <i className="fa-solid fa-layer-group text-accent-indigo text-[0.6rem]" />
            <span>{scenario.narrativeSubtitle}</span>
          </div>
        </div>

        <div className="bg-accent-rose/10 border-accent-rose/20 text-accent-rose-light flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[0.58rem] font-black tracking-[0.15em] uppercase">
          <div className="bg-accent-rose h-1.5 w-1.5 animate-pulse rounded-full" />
          <span>{scenario.verdict}</span>
        </div>
      </div>

      {/* Teoria Sintética */}
      <div className="relative z-10 px-5 pt-4 pb-3">
        <div className="relative rounded-xl border border-white/5 bg-black/25 p-4 text-[0.8rem] leading-relaxed shadow-inner">
          {isNodelockB20 ? (
            <p className="m-0 font-medium text-indigo-100/80 italic">
              &quot;Dinâmica travada via Nodelock. Agressor forçado a apostar pequeno para absorver fold equity sem
              inflar as RIOs.&quot;
            </p>
          ) : (
            <div className="italic-sota-markdown font-medium text-indigo-100/80 italic">
              <SotaMarkdown content={scenario.theory} />
            </div>
          )}
          <div className="absolute right-3 bottom-3 opacity-15">
            <i className="fa-solid fa-quote-right text-accent-indigo text-sm" />
          </div>
        </div>
      </div>

      {/* Gauges de Risco IP vs OOP */}
      <div className="relative z-10 grid grid-cols-2 gap-5 px-5 pt-2 pb-5">
        <div className="flex flex-col items-center gap-3">
          <RiskGauge
            value={effectiveIpRp}
            label="Agressor (IP)"
            pos={scenario.ipPos}
            stack={ipMorph}
            opponentValue={effectiveOopRp}
            {...(dynamicDeathZone === undefined ? {} : { dynamicDeathZone })}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <RiskGauge
            value={effectiveOopRp}
            label="Defensor (OOP)"
            pos={scenario.oopPos}
            stack={oopMorph}
            opponentValue={effectiveIpRp}
            {...(dynamicDeathZone === undefined ? {} : { dynamicDeathZone })}
          />
        </div>
      </div>
    </div>
  );
}
