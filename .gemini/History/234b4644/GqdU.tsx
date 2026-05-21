/**
 * IDENTITY: Laboratório Toy Games (Predator Mode)
 * PATH: src/app/toy-games/page.tsx
 * ROLE: Renderizar cenários didáticos extremos de ICM para gamificação do aprendizado.
 * BINDING: [src/app/layout.tsx, globals.css]
 * TELEOLOGY: Evoluir para consumir engines de NashSolver reais no navegador, testando o Risk Premium do usuário em tempo real.
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ToyGamesPage() {
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | null>(null);

  // Efeito sonoro gamificado (Radar Lock) via Web Audio API (opcional/conceitual)
  const playRadarLock = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Silencioso se bloqueado pelo navegador
    }
  };

  const handleScenarioSelect = (scenario: 'A' | 'B') => {
    setActiveScenario(scenario);
    playRadarLock();
  };

  return (
    <main className="container mx-auto px-4" style={{ padding: '4rem 0' }}>
      <div className="text-center mb-16 animate-fade-up">
        <span className="block font-mono text-xs text-red-500 tracking-widest uppercase mb-4 animate-pulse">
          [ AVISO: DINÂMICAS EXCLUSIVAS DE ICM ]
        </span>
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
          Toy Games: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Predator Mode</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto italic text-sm">
          Isolando a mecânica do Risk Premium. Sinta a impunidade de agredir quando o oponente está paralisado na Death Zone.
        </p>
      </div>

      {/* Seleção de Cenário */}
      <div className="flex justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <button 
          onClick={() => handleScenarioSelect('A')}
          className={`px-6 py-3 rounded-lg font-heading font-bold uppercase tracking-widest text-sm transition-all duration-300 border ${activeScenario === 'A' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-slate-500'}`}
        >
          Cenário A: O Franco-Atirador
        </button>
        <button 
          onClick={() => handleScenarioSelect('B')}
          className={`px-6 py-3 rounded-lg font-heading font-bold uppercase tracking-widest text-sm transition-all duration-300 border ${activeScenario === 'B' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:border-slate-500'}`}
        >
          Cenário B: O Bully do Botão
        </button>
      </div>

      {/* Palco do Cenário */}
      <div className="max-w-4xl mx-auto animate-fade-up" style={{ minHeight: '300px' }}>
        {activeScenario === 'A' && (
          <div className="glass-panel p-8 border-red-500/30 shadow-[inset_0_0_50px_rgba(239,68,68,0.05)]">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-4">Blind War Extrema (4-Handed)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-950/50 p-6 rounded-xl border border-green-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
                <h3 className="text-green-400 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><span>IP / Predador</span></h3>
                <div className="text-3xl font-bold text-white mb-1">Hero (SB)</div>
                <div className="text-slate-400 data-mono text-sm mb-4">Stack: 50bb (Chipleader)</div>
                <div className="bg-slate-900 rounded p-3 border border-white/5">
                  <div className="text-xs text-slate-500 uppercase">Risk Premium</div>
                  <div className="text-xl text-green-400 data-mono font-bold">12%</div>
                  <p className="text-xs text-slate-400 mt-2">Licença para matar. Pode shovar 100% (ATC).</p>
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-xl border border-red-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
                <h3 className="text-red-400 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><span>OOP / Presa</span></h3>
                <div className="text-3xl font-bold text-white mb-1">Villain (BB)</div>
                <div className="text-slate-400 data-mono text-sm mb-4">Stack: 12bb (Short Stack)</div>
                <div className="bg-slate-900 rounded p-3 border border-red-500/20">
                  <div className="text-xs text-slate-500 uppercase">Risk Premium</div>
                  <div className="text-xl text-red-500 data-mono font-bold animate-pulse">45%</div>
                  <p className="text-xs text-slate-400 mt-2">Death Zone. Paralisado pela existência de stacks de 8bb na mesa.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeScenario === 'B' && (
          <div className="glass-panel p-8 border-orange-500/30 flex items-center justify-center min-h-[300px]">
            <p className="text-slate-400 font-mono animate-pulse">Carregando matriz do Bully do Botão...</p>
          </div>
        )}
      </div>
    </main>
  );
}