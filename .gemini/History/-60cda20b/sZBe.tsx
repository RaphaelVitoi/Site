'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
 */

import { useEffect, useRef, useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SotaTooltip } from '../ui/SotaTooltip';

export default function CfrRegretPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [kappa, setKappa] = useState<number>(0.85);
  const [nodes, setNodes] = useState<number>(13);
  const [pot, setPot] = useState<number>(2.5);
  const [stack, setStack] = useState<number>(40);
  const [equity, setEquity] = useState<number>(55);

  // SOTA: Fricção Zero. Envia os estados para dentro da API do requestAnimationFrame sem dar re-render na function base
  const paramsRef = useRef({ kappa: 0.85, nodes: 13, pot: 2.5, stack: 40, equity: 55 });
  useEffect(() => {
    paramsRef.current = { kappa, nodes, pot, stack, equity };
  }, [kappa, nodes, pot, stack, equity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // O alpha: true garante a mistura perfeita na estética Glassmorphism
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // SOTA: Instancia a calha de dados (Web Worker)
    const worker = new Worker(new URL('../workers/insolvency.worker.ts', import.meta.url), { type: 'module' });

    let animationFrameId: number;
    let t = 0;

    worker.onmessage = (e) => {
      if (e.data.type === 'CFR_HEATMAP') {
        const matrix = e.data.matrix as Float32Array;
        const path = e.data.path as { x: number, y: number }[];
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const currentNodes = paramsRef.current.nodes;
        const cellW = width / currentNodes;
        const cellH = height / currentNodes;

        // Heatmap de Matriz de Arrependimento Contrafactual consumindo a matriz do Worker
        for (let i = 0; i < currentNodes; i++) {
          for (let j = 0; j < currentNodes; j++) {
            const regretVal = matrix[i * currentNodes + j];
            ctx.fillStyle = `rgba(${regretVal * 255}, 50, ${255 - regretVal * 100}, ${0.1 + regretVal * 0.4})`;
            ctx.fillRect(i * cellW, j * cellH, cellW - 1, cellH - 1);
          }
        }

        // INJEÇÃO GEOMÉTRICA DO A* PATHFINDING (Vetor de Dominância de Sizing)
        ctx.beginPath();
        if (path && path.length > 0) {
          ctx.moveTo(path[0].x * width, path[0].y * height);
          for (let i = 1; i < path.length; i++) {
             // Suavização das arestas da Arvore Dinâmica (Pathfinding Metadados)
            ctx.lineTo(path[i].x * width, path[i].y * height);
          }
        } else {
          ctx.moveTo(0, height);
          ctx.lineTo(width * 0.3, height * 0.6 + Math.sin(t * 2) * 15);
          ctx.lineTo(width * 0.7, height * 0.3 + Math.cos(t * 1.5) * 15);
          ctx.lineTo(width, 0);
        }

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)'; // Emerald Cyber-Elegance
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(16, 185, 129, 1)';
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset para evitar vazamentos visuais

        t += 0.035;

        // SOTA: Transmutação do A* Pathfinding em Valores Práticos de Sizing Geométrico
        if (path && path.length >= 3) {
          const p = paramsRef.current;
          // A equidade modula a amplitude de extração por valor (Value Target)
          const equityMultiplier = Math.max(0.1, p.equity / 50);

          const flopPct = Math.min(1.5, path[0].y * 1.5 * equityMultiplier);
          const flopBet = p.pot * flopPct;

          const turnPot = p.pot + (flopBet * 2);
          const turnIdx = Math.floor(path.length / 2);
          const turnPct = Math.min(1.5, path[turnIdx].y * 1.5 * equityMultiplier);
          const turnBet = turnPot * turnPct;

          const riverJam = p.stack - flopBet - turnBet;

          const elFlop = document.getElementById('sizing-flop');
          const elTurn = document.getElementById('sizing-turn');
          const elRiver = document.getElementById('sizing-river');

          if (elFlop) elFlop.innerText = `${flopBet.toFixed(1)} bb (${Math.round(flopPct * 100)}%)`;
          if (elTurn) elTurn.innerText = `${turnBet.toFixed(1)} bb (${Math.round(turnPct * 100)}%)`;
          if (elRiver) elRiver.innerText = `${Math.max(0, riverJam).toFixed(1)} bb (JAM)`;
        }

        // Solicita o próximo frame apenas após renderizar este (Fricção Zero Síncrona)
        animationFrameId = requestAnimationFrame(() => {
          worker.postMessage({ type: 'CFR_HEATMAP', nodes: paramsRef.current.nodes, iterations: 1, kappa: paramsRef.current.kappa, id: 'cfr_loop' });
        });
      }
    };

    // Ignição da calha de dados
    worker.postMessage({ type: 'CFR_HEATMAP', nodes: paramsRef.current.nodes, iterations: 1, kappa: paramsRef.current.kappa, id: 'cfr_loop' });

    return () => {
      cancelAnimationFrame(animationFrameId);
      worker.terminate(); // Previne Memory Leaks na desmontagem
    };
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

        {/* SOTA: Inputs Deslizantes para Distorção Bayesiana */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner w-full xl:w-auto">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Kappa (Bayes)</span>
              <span className="text-xs font-mono font-black text-accent-emerald">{kappa.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0" max="2" step="0.05" value={kappa}
              onChange={(e) => setKappa(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent-emerald [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Nodos (Grafo)</span>
              <span className="text-xs font-mono font-black text-accent-indigo">{nodes}</span>
            </div>
            <input
              type="range" min="5" max="32" step="1" value={nodes}
              onChange={(e) => setNodes(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent-indigo [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Pote Inicial</span>
              <span className="text-xs font-mono font-black text-text-light">{pot.toFixed(1)} bb</span>
            </div>
            <input
              type="range" min="2" max="50" step="0.5" value={pot}
              onChange={(e) => setPot(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-text-light [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Stack Efetiva</span>
              <span className="text-xs font-mono font-black text-text-light">{stack.toFixed(1)} bb</span>
            </div>
            <input
              type="range" min="10" max="100" step="1" value={stack}
              onChange={(e) => setStack(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-text-light [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Raw Equity</span>
              <span className="text-xs font-mono font-black text-accent-pink">{equity}%</span>
            </div>
            <input
              type="range" min="10" max="90" step="1" value={equity}
              onChange={(e) => setEquity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent-pink [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
          </div>
        </div>

        <div className="text-[0.65rem] font-bold px-3 py-1.5 rounded-md border bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo shadow-inner">
          NÓ DE DECISÃO ATIVO
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-deep/50 border border-white/5 rounded-xl p-6 flex flex-col gap-4 shadow-xl">
          <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">Matriz de Arrependimento (Heatmap)</h4>
          <div className="flex-1 min-h-64 relative flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-black/20 shadow-inner overflow-hidden">
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
             <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.6rem] font-bold text-accent-indigo uppercase tracking-widest">Flop Bet (y₀)</span>
                <span id="sizing-flop" className="text-xs font-mono font-black text-text-bright">Calculando...</span>
             </div>
             <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.6rem] font-bold text-accent-emerald uppercase tracking-widest">Turn Bet (yₙ)</span>
                <span id="sizing-turn" className="text-xs font-mono font-black text-text-bright">Calculando...</span>
             </div>
             <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.6rem] font-bold text-accent-rose uppercase tracking-widest">River Jam (yₘ)</span>
                <span id="sizing-river" className="text-xs font-mono font-black text-text-bright">Calculando...</span>
             </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
