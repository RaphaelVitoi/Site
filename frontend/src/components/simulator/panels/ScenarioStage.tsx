'use client';

/**
 * IDENTITY: Palco do Cenário SOTA Quantum
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibir a narrativa tática e os medidores de risco (Risk Gauges).
 * PRINCIPLE: Harmonia Visual & Rigor Matemático.
 */

import type { Scenario } from '../engine/types';
import RiskGauge from '../ui/RiskGauge';

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

const calcBF = ( rp: number ): string => {
  if ( rp >= 100 ) return '∞';
  if ( rp === 0 ) return '1.00';
  return ( 100 / ( 100 - rp ) ).toFixed( 2 );
};

export default function ScenarioStage( { scenario }: Readonly<{ scenario: Scenario }> ) {
  const ipMorph = scenario.ipMorph ?? '--';
  const oopMorph = scenario.oopMorph ?? '--';
  const isNodelockB20 = scenario.name?.includes( 'B20' ) || scenario.narrativeTitle?.includes( 'B20' );

  return (
    <div className="glass-panel p-8 animate-sota-in border-accent-indigo/10 flex flex-col gap-8">

      {/* HEADER DO PALCO */ }
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-text-bright uppercase tracking-tighter leading-none">
            { isNodelockB20 ? 'Ancoragem: Block Bet (20%)' : scenario.narrativeTitle }
          </h2>
          <div className="text-label opacity-50">
            <i className="fa-solid fa-layer-group text-accent-indigo" /> { scenario.narrativeSubtitle }
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-[0.6rem] font-black text-accent-rose-light uppercase tracking-widest">
          { scenario.verdict }
        </div>
      </div>

      {/* CONTEXTO TÁTICO */ }
      <div className={ `p-6 rounded-2xl border ${isNodelockB20 ? 'bg-accent-indigo/5 border-accent-indigo/20' : 'bg-black/20 border-white/5'} text-sm leading-relaxed` }>
        <p className="text-text-muted font-medium italic">
          &quot;{ isNodelockB20 ? 'A dinâmica foi travada via Nodelock. Agressor forçado a apostar pequeno para absorver fold equity sem inflar as RIOs.' : scenario.theory }&quot;
        </p>
      </div>

      {/* RISK GAUGES: SIMETRIA QUÂNTICA */ }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

        {/* IP */ }
        <div className="flex flex-col items-center gap-4 group">
          <RiskGauge
            value={ scenario.ipRp }
            label="Agressor (IP)"
            pos={ scenario.ipPos }
            stack={ ipMorph }
            stackTooltip={ MORPH_TOOLTIPS[ipMorph] }
            color="indigo"
            opponentValue={ scenario.oopRp }
          />
          <div className="bg-bg-deep/60 px-4 py-2 rounded-xl border border-white/5 text-center group-hover:border-accent-indigo/30 transition-all">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest block mb-1">Impacto Posicional</span>
            <span className="text-xs font-mono font-bold text-accent-indigo-light">{ scenario.ipRp.toFixed( 1 ) }% RP · { calcBF( scenario.ipRp ) }x BF</span>
          </div>
        </div>

        {/* OOP */ }
        <div className="flex flex-col items-center gap-4 group">
          <RiskGauge
            value={ scenario.oopRp }
            label="Defensor (OOP)"
            pos={ scenario.oopPos }
            stack={ oopMorph }
            stackTooltip={ MORPH_TOOLTIPS[oopMorph] }
            color="rose"
            opponentValue={ scenario.ipRp }
          />
          <div className="bg-bg-deep/60 px-4 py-2 rounded-xl border border-white/5 text-center group-hover:border-accent-rose/30 transition-all">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest block mb-1">Vulnerabilidade</span>
            <span className="text-xs font-mono font-bold text-accent-rose-light">{ scenario.oopRp.toFixed( 1 ) }% RP · { calcBF( scenario.oopRp ) }x BF</span>
          </div>
        </div>

      </div>
    </div>
  );
}
