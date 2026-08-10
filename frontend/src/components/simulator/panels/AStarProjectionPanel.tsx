'use client';

/**
 * IDENTITY: Painel de Projeção A* (Geometric Bet Sizing)
 * PATH: src/components/simulator/panels/AStarProjectionPanel.tsx
 * ROLE: Visualizar o caminho ótimo de crescimento do pote até o All-in.
 */

import { useMemo } from 'react';

interface AStarProjectionPanelProps {
  pot: number;
  stack: number;
  equity: number;
}

export default function AStarProjectionPanel({ pot, stack, equity }: Readonly<AStarProjectionPanelProps>) {
  const streets = 3; // Flop, Turn, River

  const projection = useMemo(() => {
    const targetPot = pot + stack * 2;
    if (pot <= 0 || targetPot <= pot) return null;

    // f = ((targetPot/pot)^(1/n) - 1) / 2
    const growthFactor = targetPot / pot;
    const f = (Math.pow(growthFactor, 1 / streets) - 1) / 2;

    const steps = [];
    let currentPot = pot;
    let currentStack = stack;

    for (let i = 0; i < streets; i++) {
      const bet = currentPot * f;
      const streetNames = ['Flop', 'Turn', 'River'];
      const streetName = streetNames[i] ?? 'River';

      // Simulação de Fold Equity baseada na agressão (tamanho da aposta) e equity do Hero
      // Quanto maior a aposta relativa ao pote, maior o FE inicial.
      // Quanto maior a equity do Hero (range forte), menor o FE necessário.
      const baseFE = (f * 1.5 + (1 - equity / 100) * 0.5) * 100;
      const foldEquity = Math.min(95, Math.max(10, baseFE - i * 5));

      steps.push({
        street: streetName,
        potBefore: currentPot,
        bet: bet,
        betPct: f * 100,
        potAfter: currentPot + bet * 2,
        remainingStack: currentStack - bet,
        fe: foldEquity,
      });
      currentPot += bet * 2;
      currentStack -= bet;
    }

    return { f, steps, targetPot };
  }, [pot, stack, equity]);

  if (!projection) return null;

  return (
    <div className="glass-panel bg-bg-panel/60 rounded-4xl border border-white/5 p-8 shadow-xl backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-accent-indigo/10 border-accent-indigo/20 flex h-10 w-10 items-center justify-center rounded-2xl border">
          <i className="fa-solid fa-route text-accent-indigo" />
        </div>
        <div>
          <h4 className="m-0 text-[0.7rem] font-black tracking-widest text-white uppercase">A* Geometric Projection</h4>
          <p className="text-text-darker m-0 text-[0.55rem] font-bold tracking-tighter uppercase">
            Caminho Ótimo para Polarização de Ranges
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {projection.steps.map((step, idx) => (
          <div
            key={step.street}
            className="group hover:border-accent-indigo/30 relative rounded-3xl border border-white/5 bg-black/40 p-6 transition-all"
          >
            <div className="bg-bg-base text-accent-indigo absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[0.6rem] font-black">
              {idx + 1}
            </div>
            <div className="text-text-darker mb-4 text-[0.55rem] font-black tracking-widest uppercase">
              {step.street}
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-text-dim text-[0.5rem] font-bold uppercase">Aposta</span>
                <span className="font-mono text-[0.85rem] font-black text-white">
                  {step.bet.toFixed(1)} <span className="text-[0.5rem]">bb</span>
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="bg-accent-indigo h-full shadow-[0_0_8px_var(--accent-indigo)]"
                  ref={(el) => {
                    if (el) {
                      el.style.width = `${Math.min(100, step.betPct)}%`;
                    }
                  }}
                />
              </div>

              {/* Fold Equity Mock Display */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-text-darker text-[0.45rem] font-black uppercase">Req. Fold Equity</span>
                <span className="text-accent-indigo-light font-mono text-[0.6rem] font-bold">
                  {step.fe.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-2 text-[0.5rem] font-bold tracking-tighter uppercase">
                <span className="text-accent-indigo-light">{step.betPct.toFixed(0)}% Pot</span>
                <span className="text-text-darker">Pot: {step.potAfter.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-accent-indigo/5 border-accent-indigo/10 mt-8 flex items-center justify-between rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-circle-info text-accent-indigo-light text-xs" />
          <span className="text-[0.6rem] font-medium text-indigo-100/70">
            Projeção geométrica constante para maximizar a pressão de fold equity.
          </span>
        </div>
        <div className="text-[0.6rem] font-black tracking-widest text-white uppercase">
          f-factor: <span className="text-accent-indigo">{(projection.f * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
