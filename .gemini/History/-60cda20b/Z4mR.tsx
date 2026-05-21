'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
 */

import { GlassPanel } from '@/components/ui/GlassPanel';
import { SotaTooltip } from '../ui/SotaTooltip';

export default function CfrRegretPanel() {
  return (
    <GlassPanel className="flex flex-col gap-6 p-8 mt-8 animate-sota-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
        <div>
          <h3 className="text-sm font-black text-accent-indigo-light uppercase tracking-widest m-0 flex items-center gap-2">
            <i className="fa-solid fa-network-wired text-accent-indigo" /> CFR & Regret Matching
          </h3>
          <p className="text-xs text-text-dim mt-1.5 m-0 leading-relaxed max-w-md">
            Minimização de Arrependimento Contrafactual. IA Self-Play explorando a árvore de decisão para convergir ao Equilíbrio de Nash.
          </p>
        </div>
        <div className="text-[0.65rem] font-bold px-3 py-1.5 rounded-md border bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo shadow-inner">
          NÓ DE DECISÃO ATIVO
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-deep/50 border border-white/5 rounded-xl p-6 flex flex-col gap-4 shadow-xl">
          <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">Matriz de Arrependimento (Heatmap)</h4>
          <div className="flex-1 min-h-40 flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-black/20 shadow-inner">
            <span className="text-xs font-bold text-text-darker uppercase tracking-widest animate-pulse">Aguardando Iterações WGSL...</span>
          </div>
        </div>

        <div className="bg-bg-deep/50 border border-white/5 rounded-xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-center">
             <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">A* Pathfinding (Sizing Geométrico)</h4>
             <SotaTooltip title="Explosão Geométrica" content="Busca o caminho ideal de bet sizing para colocar o stack inteiro no meio no River com o máximo de EV, respeitando a contração do RP nas streets futuras." align="right" theme="emerald">
                <i className="fa-solid fa-circle-info text-text-darker hover:text-accent-emerald transition-colors cursor-help"></i>
             </SotaTooltip>
          </div>
          <div className="flex-1 min-h-40 flex flex-col gap-3">
             {/* Skeleton visual provisório para a Árvore de Sizing */}
             <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.6rem] font-bold text-accent-indigo uppercase tracking-widest">Flop Bet</span>
                <span className="text-xs font-mono font-black text-text-muted">-- bb</span>
             </div>
             <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.6rem] font-bold text-accent-emerald uppercase tracking-widest">Turn Bet</span>
                <span className="text-xs font-mono font-black text-text-muted">-- bb</span>
             </div>
             <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.6rem] font-bold text-accent-rose uppercase tracking-widest">River Jam</span>
                <span className="text-xs font-mono font-black text-text-muted">-- bb</span>
             </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
