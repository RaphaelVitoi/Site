'use client';

/**
 * IDENTITY: Pipeline Visual de Dissipação do Risk Premium
 * PATH: src/components/simulator/ui/SprPipeline.tsx
 * ROLE: Renderizar 4 nós (PRE -> FLOP -> TURN -> RIVER) com o RP residual por street.
 *       rpValue = oopRp × (remaining_stack / eff_stack) — RP que resta se colidir aqui.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import type { SprStage } from '../engine/types';
import AnimatedNumber from './AnimatedNumber';
import { useSotaSync } from '../hooks/useSotaSync';

interface SprPipelineProps {
  /** Estágios do pipeline de dissipação de RP */
  stages: SprStage[];
  /** Índice do estágio ativo (padrão 0 = PRE) */
  activeStage?: number;
}

const OPACITY_LEVELS = [1, 0.7, 0.5, 0.3];

export default function SprPipeline({
  stages,
  activeStage = 0,
}: Readonly<SprPipelineProps>) {
  const { physics, isHydrated } = useSotaSync();

  if ( !isHydrated ) return null;

  return (
    <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-sm font-black text-text-bright uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-water text-accent-sky text-xs" />
          <span>Dissipação Estrutural (Pot Entrapment)</span>
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[0.55rem] font-mono text-accent-sky uppercase tracking-widest bg-accent-sky/10 px-2 py-0.5 rounded border border-accent-sky/20 shadow-inner">
            Sync: { physics.referenceStatus }
          </span>
        </div>
      </div>

      <div className="relative flex justify-between items-center py-4 px-2">
        {/* Linha conectora */}
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-white/5 -translate-y-1/2 z-0" />

        {stages.map((stage, idx) => {
          const isActive = idx === activeStage;
          const opacity = OPACITY_LEVELS[idx] ?? 0.3;
          const isDeathZone = stage.rpValue >= 35;
          const isGold = stage.rpValue >= 20 && !isDeathZone;

          const valueColor = isDeathZone ? 'text-accent-danger' : isGold ? 'text-accent-gold' : 'text-accent-emerald';
          const ringColor = isDeathZone ? 'ring-accent-danger/30' : isGold ? 'ring-accent-gold/30' : 'ring-accent-emerald/30';
          const bgActive = isDeathZone ? 'bg-accent-danger/10' : isGold ? 'bg-accent-gold/10' : 'bg-accent-emerald/10';

          return (
            <div
              key={stage.name}
              className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}`}
              style={{ opacity: isActive ? 1 : opacity }}
            >
              <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 bg-bg-deep backdrop-blur-md ${isActive ? `border-white/20 ring-4 ${ringColor} ${bgActive}` : 'border-white/10'}`}>
                <span className="text-[0.55rem] text-text-dim font-black uppercase tracking-tighter leading-none mb-0.5">{stage.name}</span>
                <span className={`text-sm font-black font-mono tracking-tighter ${valueColor}`}>
                  <AnimatedNumber value={stage.rpValue} suffix="%" decimals={1} />
                </span>
              </div>
              <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mt-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                Pot: {stage.potSize.toFixed(1)}bb
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-[0.7rem] text-text-muted leading-relaxed font-medium">
        <strong className="text-text-bright">Axioma do Aprisionamento ao Pote:</strong> O RP residual indica o custo da colisão <em>nesta</em> street. Conforme o pote cresce (Multiway ou Action), a stack perde valuation e a dor do fold (Sunk Cost) supera o risco de eliminação. A agressão pós-flop deve antever essa dissipação — o Teto do RP cai.
      </div>
    </div>
  );
}
