'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
 */

import { useEffect, useRef, useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';

// SOTA: Despacho Estático de Renderização para redução de complexidade ciclomática (SonarLint S3776)
function renderHeatmap(ctx: CanvasRenderingContext2D, matrix: Float32Array, nodes: number, w: number, h: number) {
  const cellW = w / nodes;
  const cellH = h / nodes;
  for (let i = 0; i < nodes; i++) {
    for (let j = 0; j < nodes; j++) {
      const regretVal = matrix[i * nodes + j];
      ctx.fillStyle = `rgba(${regretVal * 255}, 50, ${255 - regretVal * 100}, ${0.1 + regretVal * 0.4})`;
      ctx.fillRect(i * cellW, j * cellH, cellW - 1, cellH - 1);
    }
  }
}

function renderPathfinding(ctx: CanvasRenderingContext2D, path: {x: number, y: number}[], t: number, w: number, h: number) {
  ctx.beginPath();
  if (path && path.length > 0) {
    ctx.moveTo(path[0].x * w, path[0].y * h);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x * w, path[i].y * h);
    }
  } else {
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.3, h * 0.6 + Math.sin(t * 2) * 15);
    ctx.lineTo(w * 0.7, h * 0.3 + Math.cos(t * 1.5) * 15);
    ctx.lineTo(w, 0);
  }
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 12;
  ctx.shadowColor = 'rgba(16, 185, 129, 1)';
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function updateSizingDom(path: {x: number, y: number}[], p: {pot: number, stack: number, equity: number}) {
  if (!path || path.length < 3) return;
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

export interface CfrRegretPanelProps {
  initialPot?: number;
  initialStack?: number;
  initialEquity?: number;
}

export default function CfrRegretPanel({ initialPot = 2.5, initialStack = 40, initialEquity = 55 }: Readonly<CfrRegretPanelProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [kappa, setKappa] = useState<number>(0.85);
  const [nodes, setNodes] = useState<number>(13);
  const [pot, setPot] = useState<number>(initialPot);
  const [stack, setStack] = useState<number>(initialStack);
  const [equity, setEquity] = useState<number>(initialEquity);

  // SOTA: Fricção Zero. Envia os estados para dentro da API do requestAnimationFrame sem dar re-render na function base
  const paramsRef = useRef({ kappa: 0.85, nodes: 13, pot: initialPot, stack: initialStack, equity: initialEquity });
  useEffect(() => {
    paramsRef.current = { kappa, nodes, pot, stack, equity };
  }, [kappa, nodes, pot, stack, equity]);

  useEffect(() => {
    setPot(initialPot);
    setStack(initialStack);
    setEquity(initialEquity);
  }, [initialPot, initialStack, initialEquity]);

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

        renderHeatmap(ctx, matrix, paramsRef.current.nodes, width, height);
        renderPathfinding(ctx, path, t, width, height);
        updateSizingDom(path, paramsRef.current);

        t += 0.035;

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
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end pb-5 border-b border-white/5 gap-6 mb-2">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-md shadow-inner">IA Lab</span>
            <h3 className="text-sm font-black text-white tracking-widest uppercase m-0 flex items-center gap-2">
              <i className="fa-solid fa-network-wired text-accent-indigo opacity-80" /> CFR & A* Pathfinding
            </h3>
          </div>
          <p className="text-[0.75rem] text-text-muted mt-2 m-0 leading-relaxed font-medium">
            Minimização de Arrependimento Contrafactual (WASM). A IA explora a árvore de decisão para convergir ao Equilíbrio de Nash. O <strong>A* Pathfinding</strong> projeta o <em>Sizing Geométrico</em> ideal baseando-se na <span className="text-accent-pink-light">Equity Real</span> injetada pelo simulador, adaptando a agressão para maximizar o EV.
          </p>
        </div>

        {/* SOTA: Inputs Deslizantes Refinados */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 shadow-inner w-full xl:w-auto">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Kappa κ</span>
              <span className="text-[0.65rem] font-mono font-black text-accent-emerald">{kappa.toFixed(2)}</span>
            </div>
            <input
              type="range" min="0" max="2" step="0.05" value={kappa}
              onChange={(e) => setKappa(Number.parseFloat(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-accent-emerald [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:bg-white/10 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Nodos</span>
              <span className="text-[0.65rem] font-mono font-black text-accent-indigo">{nodes}</span>
            </div>
            <input
              type="range" min="5" max="32" step="1" value={nodes}
              onChange={(e) => setNodes(Number.parseInt(e.target.value, 10))}
              className="w-full h-1 bg-white/5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-accent-indigo [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:bg-white/10 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Pote Inic.</span>
              <span className="text-[0.65rem] font-mono font-black text-text-light">{pot.toFixed(1)}</span>
            </div>
            <input
              type="range" min="2" max="50" step="0.5" value={pot}
              onChange={(e) => setPot(Number.parseFloat(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-text-muted [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:bg-white/10 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Stack</span>
              <span className="text-[0.65rem] font-mono font-black text-text-light">{stack.toFixed(1)}</span>
            </div>
            <input
              type="range" min="10" max="100" step="1" value={stack}
              onChange={(e) => setStack(Number.parseFloat(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-text-muted [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:bg-white/10 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-[0.6rem] font-black text-accent-pink uppercase tracking-widest opacity-80">Equity</span>
              <span className="text-[0.65rem] font-mono font-black text-accent-pink">{equity.toFixed(1)}%</span>
            </div>
            <input
              type="range" min="10" max="90" step="1" value={equity}
              onChange={(e) => setEquity(Number.parseFloat(e.target.value))}
              className="w-full h-1 bg-accent-pink/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-accent-pink [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:bg-accent-pink/20 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-linear-to-b from-bg-panel/40 to-bg-deep/60 border border-white/5 rounded-2xl p-7 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group hover:border-white/10 transition-colors">
          <div className="flex flex-col gap-1">
            <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">Matriz de Arrependimento Contrafactual</h4>
            <p className="text-[0.5rem] text-text-darker uppercase tracking-widest m-0">Convergência termodinâmica do Nash Equilibrium.</p>
          </div>
          <div className="flex-1 min-h-64 relative flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/40 shadow-inner overflow-hidden">
             <canvas
               ref={canvasRef}
               width={400}
               height={256}
               className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 filter contrast-125"
             />
          </div>
        </div>

        <div className="bg-linear-to-b from-bg-panel/40 to-bg-deep/60 border border-white/5 rounded-2xl p-7 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start">
             <div className="flex flex-col gap-1">
               <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">A* Pathfinding (Sizing Geométrico)</h4>
               <p className="text-[0.5rem] text-text-darker uppercase tracking-widest m-0">Explosão geométrica de Pot calibrada por Equity.</p>
             </div>
          </div>
          <div className="flex-1 min-h-40 flex flex-col gap-4 justify-center">
             <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5 shadow-inner hover:bg-black/70 hover:border-accent-indigo/30 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse"></span>
                  <span className="text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest">Flop Bet (y₀)</span>
                </div>
                <span id="sizing-flop" className="text-[0.8rem] font-mono font-black text-white">Calculando...</span>
             </div>
             <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5 shadow-inner hover:bg-black/70 hover:border-accent-emerald/30 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse"></span>
                  <span className="text-[0.65rem] font-bold text-accent-emerald-light uppercase tracking-widest">Turn Bet (yₙ)</span>
                </div>
                <span id="sizing-turn" className="text-[0.8rem] font-mono font-black text-white">Calculando...</span>
             </div>
             <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-white/5 shadow-inner hover:bg-black/70 hover:border-accent-rose/30 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse"></span>
                  <span className="text-[0.65rem] font-bold text-accent-rose-light uppercase tracking-widest">River Jam (yₘ)</span>
                </div>
                <span id="sizing-river" className="text-[0.8rem] font-mono font-black text-white">Calculando...</span>
             </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
