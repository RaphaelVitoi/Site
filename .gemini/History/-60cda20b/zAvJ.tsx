'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
 */

import { useEffect, useRef } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SotaTooltip } from '../ui/SotaTooltip';

export default function CfrRegretPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // O alpha: true garante a mistura perfeita na estética Glassmorphism
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // RENDERIZAÇÃO FRICÇÃO ZERO (Placeholder para o Float32Array do WebWorker)
      const cols = 13;
      const rows = 13;
      const cellW = width / cols;
      const cellH = height / rows;

      // Heatmap de Matriz de Arrependimento Contrafactual
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const regretVal = (Math.sin(i * 0.5 + t) * Math.cos(j * 0.5 + t) + 1) / 2;
          ctx.fillStyle = `rgba(${regretVal * 255}, 50, ${255 - regretVal * 100}, ${0.1 + regretVal * 0.4})`;
          ctx.fillRect(i * cellW, j * cellH, cellW - 1, cellH - 1);
        }
      }

      // INJEÇÃO GEOMÉTRICA DO A* PATHFINDING (Vetor de Dominância de Sizing)
      ctx.beginPath();
      ctx.moveTo(0, height);
      // Simulando a convergência matemática de Nash
      ctx.lineTo(width * 0.3, height * 0.6 + Math.sin(t * 2) * 15);
      ctx.lineTo(width * 0.7, height * 0.3 + Math.cos(t * 1.5) * 15);
      ctx.lineTo(width, 0);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)'; // Emerald Cyber-Elegance
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(16, 185, 129, 1)';
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset para evitar vazamentos visuais

      t += 0.035;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <GlassPanel className="flex flex-col gap-6 p-8 mt-8 animate-sota-in max-w-full overflow-hidden">
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
          <div className="flex-1 min-h-[16rem] relative flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-black/20 shadow-inner overflow-hidden">
             {/* Fricção Zero: Canvas isolado da Main Thread (Anti Re-renders) */}
             <canvas
               ref={canvasRef}
               width={400}
               height={256}
               className="absolute inset-0 w-full h-full object-cover opacity-85"
             />
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
