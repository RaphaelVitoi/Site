'use client';

/**
 * IDENTITY: Palco do Cenário SOTA Quantum v4.2
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibir a narrativa tática e os medidores de risco.
 * BINDING: [engine/types.ts, engine/utils.ts, ui/RiskGauge]
 */

import type { Scenario } from '../engine/types';
import RiskGauge from '../ui/RiskGauge';
import { calcBF } from '@/components/simulator/engine/utils';

const MORPH_TOOLTIPS: Record<string, string> = {
  'Valor Estrito': 'Aposta quase exclusivamente por valor. O RP alto torna blefes matematicamente insolventes.',
  'Especulativo': 'Ranges mistos focados em realizar equidade e especular implied odds sem compromisso total.',
  'Polar Máximo': 'Apenas o topo e o vácuo absoluto. Resultado de pressão de shove que elimina mãos médias.',
  'Modo Predador': 'Vantagem de Risco total. A Esperança Matemática favorece agressão máxima contra stacks agonizantes.',
  'Condensado': 'Range de mãos médias incapaz de aplicar pressão. O ICM força a passividade estrutural.',
  'Call Seletivo': 'Defesa ancorada apenas no Teto de Risco. O OOP abandona qualquer mão que não cubra o RP.',
  'Zona de Paralisia': 'RP > 40%: O custo do confronto supera o ganho de chips. Fold Nash-obrigatório.',
  'Defesa Base': 'Equilíbrio padrão em ChipEV. MDF opera sem distorção monetária.',
};

interface ScenarioStageProps {
  scenario: Scenario;
  effectiveIpRp?: number;
  effectiveOopRp?: number;
}

export default function ScenarioStage( { scenario, effectiveIpRp = scenario.ipRp, effectiveOopRp = scenario.oopRp }: Readonly<ScenarioStageProps> ) {
  const ipMorph = scenario.ipMorph ?? '--';
  const oopMorph = scenario.oopMorph ?? '--';
  const isNodelockB20 = scenario.name?.includes( 'B20' ) || scenario.narrativeTitle?.includes( 'B20' );

  return (
    <div className="glass-panel p-8 sm:p-10 lg:p-12 animate-sota-in rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-text-bright uppercase tracking-tighter leading-none">
            { isNodelockB20 ? 'Ancoragem: Block Bet (20%)' : scenario.narrativeTitle }
          </h2>
          <div className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-text-darker flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-accent-indigo" /> { scenario.narrativeSubtitle }
          </div>
        </div>
        <div className="px-5 py-2 rounded-2xl bg-accent-rose/10 border border-accent-rose/20 text-[0.65rem] font-black text-accent-rose-light uppercase tracking-widest shadow-lg flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
          { scenario.verdict }
        </div>
      </div>

      <div className={ `p-8 rounded-3xl border transition-all duration-500 shadow-inner ${isNodelockB20 ? 'bg-accent-indigo/5 border-accent-indigo/20' : 'bg-black/40 border-white/5 hover:border-white/10'} text-[0.85rem] leading-relaxed` }>
        { isNodelockB20 ? (
          <p className="text-text-muted font-medium italic m-0">
            &quot;A dinâmica foi travada via Nodelock. Agressor forçado a apostar pequeno para absorver fold equity sem inflar as RIOs.&quot;
          </p>
        ) : (
          <div 
            className="text-text-muted font-medium italic prose prose-invert max-w-none prose-p:m-0 prose-p:inline"
            dangerouslySetInnerHTML={{ __html: scenario.theory }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">

        <div className="flex flex-col items-center gap-6 group">
          <RiskGauge
            value={ effectiveIpRp }
            label="Agressor (IP)"
            pos={ scenario.ipPos }
            stack={ ipMorph }
            stackTooltip={ MORPH_TOOLTIPS[ipMorph] }
            opponentValue={ effectiveOopRp }
          />
          <div className="bg-black/60 px-6 py-3 rounded-2xl border border-white/5 text-center group-hover:border-accent-indigo/30 transition-all shadow-lg">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.3em] block mb-2">Impacto Posicional</span>
            <span className="text-[0.8rem] font-mono font-black text-accent-indigo-light tracking-tight">{ effectiveIpRp.toFixed( 1 ) }% RP <span className="opacity-30 mx-2">|</span> { calcBF( effectiveIpRp ).toFixed(2) }x BF</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 group">
          <RiskGauge
            value={ effectiveOopRp }
            label="Defensor (OOP)"
            pos={ scenario.oopPos }
            stack={ oopMorph }
            stackTooltip={ MORPH_TOOLTIPS[oopMorph] }
            opponentValue={ effectiveIpRp }
          />
          <div className="bg-black/60 px-6 py-3 rounded-2xl border border-white/5 text-center group-hover:border-accent-rose/30 transition-all shadow-lg">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.3em] block mb-2">Vulnerabilidade</span>
            <span className="text-[0.8rem] font-mono font-black text-accent-rose-light tracking-tight">{ effectiveOopRp.toFixed( 1 ) }% RP <span className="opacity-30 mx-2">|</span> { calcBF( effectiveOopRp ).toFixed(2) }x BF</span>
          </div>
        </div>

      </div>
    </div>
  );
}
