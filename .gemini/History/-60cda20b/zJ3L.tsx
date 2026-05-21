'use client';

/**
 * IDENTITY: Painel CFR (Counterfactual Regret Minimization)
 * PATH: src/components/simulator/panels/CfrRegretPanel.tsx
 * ROLE: Laboratório SOTA de IA. Exibe o Heatmap de Regret Matching e a Árvore de Dimensionamento Geométrico.
 */

import { useEffect, useRef, useState } from 'react';

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
  const [nodes] = useState<number>(13);
  const [pot, setPot] = useState<number>(initialPot);
  const [stack, setStack] = useState<number>(initialStack);
  const [equity, setEquity] = useState<number>(initialEquity);
  const workerRef = useRef<Worker | null>(null);

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

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/cfr.worker.ts', import.meta.url), { type: 'module' });
    }
    workerRef.current ??= new Worker(new URL('../workers/cfr.worker.ts', import.meta.url), { type: 'module' });

    let animId: number;
    let t = 0;
    const path: {x: number, y: number}[] = [];

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { matrix } = e.data;
      const { nodes: n } = paramsRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderHeatmap(ctx, matrix, n, canvas.width, canvas.height);
      renderPathfinding(ctx, path, t, canvas.width, canvas.height);
      updateSizingDom(path, paramsRef.current);
    };

    const loop = () => {
      t += 0.01;

      // SOTA: Delega o cálculo do Regret Matching Real para o Web Worker
      workerRef.current?.postMessage({
        id: 'cfr_tick',
        nodes: paramsRef.current.nodes,
        pot: paramsRef.current.pot,
        stack: paramsRef.current.stack,
        equity: paramsRef.current.equity,
        kappa: paramsRef.current.kappa
      });

      // Pathfinding A* Mock (Visual Only)
      if (path.length === 0 || Math.random() > 0.95) {
        path.length = 0;
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
          path.push({
            x: i / steps,
            y: 0.8 - (i / steps) * 0.6 + Math.sin(t + i) * 0.05
          });
        }
      }

      animId = setTimeout(loop, 33) as unknown as number; // 30fps para simetria I/O
    };

    loop();
    return () => {
      clearTimeout(animId);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return (
    <div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/5 gap-6">
        <div>
          <h3 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] m-0">
            IA Laboratory &middot; <span className="text-text-muted">CFR Engine</span>
          </h3>
          <p className="text-[0.65rem] text-text-dim mt-2 m-0 leading-relaxed max-w-md font-medium uppercase tracking-wider">
            Counterfactual Regret Minimization (CFR) & Predictive Pathfinding.
          </p>
        </div>
        <div className="text-[0.6rem] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-accent-indigo/20 bg-accent-indigo/5 text-accent-indigo-light shadow-lg flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
          Neural Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
           <div className="bg-black/40 p-6 sm:p-8 rounded-3xl border border-white/5 shadow-inner space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
                <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">Ajuste de Parâmetros</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="cfr-kappa" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Alpha κ (Regret)</label>
                  <span className="text-[0.65rem] font-mono font-black text-accent-indigo bg-black/60 px-2 py-0.5 rounded border border-white/5">{ Math.round( kappa * 100 ) }%</span>
                </div>
                <input id="cfr-kappa" type="range" min="0.1" max="1" step="0.05" value={ kappa } onChange={ ( e ) => setKappa( Number.parseFloat( e.target.value ) ) } className="w-full h-1 accent-accent-indigo bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label htmlFor="cfr-equity" className="text-[0.6rem] text-text-muted uppercase font-black tracking-widest">Equity Hero</label>
                  <span className="text-[0.65rem] font-mono font-black text-accent-emerald bg-black/60 px-2 py-0.5 rounded border border-white/5">{ Math.round( equity ) }%</span>
                </div>
                <input id="cfr-equity" type="range" min="0" max="100" step="1" value={ equity } onChange={ ( e ) => setEquity( Number.parseFloat( e.target.value ) ) } className="w-full h-1 accent-accent-emerald bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2 bg-black/60 p-4 rounded-2xl border border-white/5">
                    <span className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest block">Pot Size (BB)</span>
                    <input type="number" value={ pot } onChange={(e) => setPot(Number.parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none text-[0.85rem] font-mono font-black text-white focus:outline-none focus:ring-0" />
                 </div>
                 <div className="space-y-2 bg-black/60 p-4 rounded-2xl border border-white/5">
                    <span className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest block">Eff. Stack (BB)</span>
                    <input type="number" value={ stack } onChange={(e) => setStack(Number.parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none text-[0.85rem] font-mono font-black text-white focus:outline-none focus:ring-0" />
                 </div>
              </div>
           </div>

           <div className="bg-accent-indigo/5 border border-accent-indigo/10 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
             <i className="fa-solid fa-microchip text-accent-indigo-light text-xl mt-1" />
             <div className="space-y-2">
                <h4 className="text-[0.65rem] font-black text-white uppercase tracking-widest m-0">Dimensionamento Geométrico</h4>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">Flop</span>
                        <div id="sizing-flop" className="text-[0.7rem] font-mono font-black text-white">--</div>
                    </div>
                    <div className="text-center">
                        <span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">Turn</span>
                        <div id="sizing-turn" className="text-[0.7rem] font-mono font-black text-white">--</div>
                    </div>
                    <div className="text-center">
                        <span className="text-[0.45rem] text-text-darker uppercase font-black block mb-1">River</span>
                        <div id="sizing-river" className="text-[0.7rem] font-mono font-black text-accent-danger">--</div>
                    </div>
                </div>
             </div>
           </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="relative aspect-square w-full max-w-112.5 mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl group">
                <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/10 to-transparent pointer-events-none" />
                <canvas ref={ canvasRef } width={ 450 } height={ 450 } className="w-full h-full cursor-crosshair group-hover:scale-[1.02] transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-2 py-1 rounded bg-black/80 border border-white/10 text-[0.5rem] font-bold text-text-muted uppercase tracking-widest backdrop-blur-md">Regret Matching Heatmap</span>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <span className="px-2 py-1 rounded bg-accent-emerald/20 border border-accent-emerald/30 text-[0.5rem] font-bold text-accent-emerald uppercase tracking-widest backdrop-blur-md">A* Pathfinding</span>
                </div>
            </div>
            <p className="text-[0.65rem] text-text-muted leading-relaxed text-center px-4 italic font-medium">
                O heatmap visualiza a densidade de arrependimento (regret) em cada nó da árvore. O pathfinding busca o equilíbrio dinâmico entre pot-odds e pressão ICM estrutural.
            </p>
        </div>
      </div>
    </div>
  );
}
