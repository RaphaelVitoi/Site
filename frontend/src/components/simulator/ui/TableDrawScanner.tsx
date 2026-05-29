'use client';

import React, { useState } from 'react';

interface TableDrawScannerProps {
  heroPosition: string;
  onUnlock: () => void;
  isUnlocked: boolean;
  children: React.ReactNode;
}

export function TableDrawScanner({ heroPosition, onUnlock, isUnlocked, children }: Readonly<TableDrawScannerProps>) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Scan do BB (Alvo / Reator)',
      description:
        'O BB é o alvo primário e o detentor final da ação pré-flop. Qual o Potencial Gravitacional (Stack) dele? Ele tem perfil passivo ou induz entropia?',
      icon: 'fa-crosshairs',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
    {
      title: 'Scan do BTN (Ameaça Posicional)',
      description:
        'O BTN detém a soberania posicional (IP absoluta). Ele tem stack para exercer o Poder de Veto sobre você?',
      icon: 'fa-chess-knight',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Scan do SB (Corredor da Morte)',
      description:
        'A pior posição da mesa. Ele está pressionado pelo BB e fora de posição. Um SB agressivo aqui é uma anomalia ou desespero?',
      icon: 'fa-skull',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      title: 'Varredura Retroativa (CO → Hero)',
      description: `Analise do Cutoff retroativamente até você (${heroPosition}). Qual a sua Massa Efetiva (Stack)? A órbita está favorável ou a Força de Maré (t-3) exige ação iminente?`,
      icon: 'fa-backward-fast',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ];

  const getProgressColor = (idx: number) => {
    if (idx < currentStep) return 'bg-accent-indigo shadow-[0_0_10px_rgba(99,102,241,0.5)]';
    if (idx === currentStep) return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]';
    return 'bg-white/10';
  };

  const getCardVisibility = (idx: number) => {
    if (idx === currentStep) return 'opacity-100 translate-x-0 scale-100';
    if (idx < currentStep) return 'opacity-0 -translate-x-10 scale-95 pointer-events-none';
    return 'opacity-0 translate-x-10 scale-95 pointer-events-none';
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="glass-panel animate-sota-in relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden border-white/10 p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] lg:p-14">
      <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_top_right] to-transparent" />

      <div className="z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <h2 className="mb-2 text-2xl font-black tracking-[0.3em] text-white uppercase">Table Draw Scanner</h2>
        <p className="text-text-muted mb-12 text-[0.7rem] font-medium tracking-[0.2em] uppercase">
          Raciocínio Lógico Fechado: Sincronize a Hierarquia da Decisão
        </p>

        {/* Progress Bar */}
        <div className="mb-12 flex w-full justify-center gap-4">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`h-1.5 max-w-[80px] flex-1 rounded-full transition-all duration-500 ${getProgressColor(idx)}`}
            />
          ))}
        </div>

        {/* Active Step Card */}
        <div className="relative mb-12 flex min-h-[200px] w-full items-center justify-center">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${getCardVisibility(idx)}`}
            >
              <div
                className={`h-16 w-16 rounded-2xl ${step.bg} ${step.border} flex items-center justify-center border ${step.color} mb-6 shadow-lg`}
              >
                <i className={`fa-solid ${step.icon} text-2xl`}></i>
              </div>
              <h3 className="mb-4 text-xl font-bold text-white">{step.title}</h3>
              <p className="text-text-dim max-w-md text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep((prev) => prev + 1);
            } else {
              onUnlock();
            }
          }}
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-8 py-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
        >
          <div className="absolute inset-0 translate-x-[-100%] bg-linear-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
          <span className="relative z-10 flex items-center gap-3 text-xs font-black tracking-[0.2em] text-white uppercase">
            {currentStep < steps.length - 1
              ? 'Confirmar Analise e Avancar'
              : 'Desbloquear Perspectiva Matematica (PMev)'}
            <i
              className={`fa-solid ${currentStep < steps.length - 1 ? 'fa-arrow-right' : 'fa-unlock'} opacity-70 transition-all group-hover:translate-x-1 group-hover:opacity-100`}
            ></i>
          </span>
        </button>
      </div>
    </div>
  );
}
