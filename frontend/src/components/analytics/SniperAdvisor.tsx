'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';

interface SniperAdvisorProps {
  topVazamento: string | null;
  evLoss: number;
}

export function SniperAdvisor({ topVazamento, evLoss }: SniperAdvisorProps) {
  if (!topVazamento || evLoss === 0) return null;

  const getRecommendation = () => {
    switch (topVazamento) {
      case 'Risk Premium':
        return "Protocolo Sniper: Sua margem de Risco está operando no limite de insolvência. Reduza seu ABI em 20% e filtre torneios com fields menores que 500 jogadores para estabilizar o PM.";
      case 'Bolha':
        return "Protocolo Sniper: Aversão à perda detectada. O ICM está consumindo seu edge. Force a dobra contra alvos com stack < 15bb para retomar o controle termodinâmico.";
      case 'Pós-Flop':
        return "Protocolo Sniper: Pot Entrapment identificado. Pare de cometer Hero Calls marginais. Filtre apenas por spots onde a Ação Soberana (PM > 0) é clara.";
      default:
        return "Protocolo Sniper: Entropia detectada. Reverta para o framework básico e reavalie sua seleção de alvos antes da próxima sessão.";
    }
  };

  return (
    <GlassPanel className="p-8 border-accent-indigo/30 bg-gradient-to-r from-accent-indigo/10 to-transparent mb-8">
      <div className="flex items-start gap-6">
        <div className="p-4 bg-accent-indigo/20 rounded-2xl">
          <i className="fa-solid fa-crosshairs text-3xl text-accent-indigo-light" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Conselheiro Smart Sniper</h3>
          <p className="text-text-muted leading-relaxed max-w-2xl font-medium">{getRecommendation()}</p>
        </div>
      </div>
    </GlassPanel>
  );
}
