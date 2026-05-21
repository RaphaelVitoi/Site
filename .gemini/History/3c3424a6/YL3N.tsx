/**
 * IDENTITY: Calculadora ICM (Interface)
 * PATH: src/components/ICMCalculator.tsx
 * ROLE: Cuidar do input de dados (estado) e exibir resultados do ICM mantendo o padrão Dark/Cyber.
 */
'use client';

import React, { useState, useMemo } from 'react';
import { calculateMalmuthHarville, ICMPlayer } from '../lib/icmEngine';

export default function ICMCalculator() {
  const [players, setPlayers] = useState<ICMPlayer[]>([
    { id: '1', name: 'Hero', stack: 10000 },
    { id: '2', name: 'Villain A', stack: 5000 },
    { id: '3', name: 'Villain B', stack: 5000 },
  ]);
  
  const [prizes, setPrizes] = useState<number[]>([50, 30, 20]);

  // Memoização do cálculo matemático para evitar re-renders desnecessários
  const results = useMemo(() => {
    return calculateMalmuthHarville(players, prizes);
  }, [players, prizes]);

  const handleStackChange = (id: string, newStack: string) => {
    const val = parseInt(newStack, 10);
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, stack: isNaN(val) ? 0 : val } : p));
  };

  const handlePrizeChange = (index: number, newPrize: string) => {
    const val = parseFloat(newPrize);
    setPrizes(prev => {
      const updated = [...prev];
      updated[index] = isNaN(val) ? 0 : val;
      return updated;
    });
  };

  const addPlayer = () => {
    setPlayers(prev => [
      ...prev, 
      { id: Date.now().toString(), name: `Player ${prev.length + 1}`, stack: 1000 }
    ]);
  };

  const addPrize = () => setPrizes(prev => [...prev, 0]);

  return (
    <div className="glass-panel p-6 sm:p-10 w-full max-w-4xl mx-auto mt-8 animate-fade-up">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-heading text-white glow-text mb-2">Motor ICM de Alta Precisão</h2>
        <p className="text-sm text-slate-400">Algoritmo de Malmuth-Harville</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção Esquerda: Inputs */}
        <div className="space-y-6">
          
          {/* Stacks Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-semibold text-accent-primary uppercase tracking-widest text-xs">Stacks (Fichas)</h3>
              <button onClick={addPlayer} className="text-xs text-slate-400 hover:text-white transition-colors">
                + Add Player
              </button>
            </div>
            <div className="space-y-3">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded border border-white/5">
                  <input 
                    type="text" 
                    value={p.name}
                    onChange={(e) => setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, name: e.target.value } : pl))}
                    className="bg-transparent text-sm text-white focus:outline-none w-1/2"
                  />
                  <input 
                    type="number"
                    min="0"
                    value={p.stack}
                    onChange={(e) => handleStackChange(p.id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-sm p-2 rounded w-1/2 text-right data-mono focus:border-accent-primary focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prizes Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-semibold text-accent-emerald uppercase tracking-widest text-xs">Payouts ($/%)</h3>
              <button onClick={addPrize} className="text-xs text-slate-400 hover:text-white transition-colors">
                + Add Payout
              </button>
            </div>
            <div className="space-y-3">
              {prizes.map((prize, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded border border-white/5">
                  <span className="text-sm text-slate-400 w-1/2">{idx + 1}º Lugar</span>
                  <input 
                    type="number"
                    min="0"
                    value={prize}
                    onChange={(e) => handlePrizeChange(idx, e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-sm p-2 rounded w-1/2 text-right data-mono focus:border-accent-emerald focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Seção Direita: Resultados */}
        <div>
          <div className="bg-slate-900/80 rounded-xl p-6 border border-white/10 h-full">
            <h3 className="font-heading font-semibold text-white uppercase tracking-widest text-xs mb-4 border-b border-white/10 pb-2">Equidade Calculada (Real-Time)</h3>
            
            <div className="space-y-4">
              {results.map((res) => (
                <div key={res.id} className="relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-slate-300">{res.name}</span>
                    <div className="text-right">
                      <span className="text-white font-bold data-mono block leading-none">
                        $ {res.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-accent-sky font-semibold data-mono">
                        {res.equityPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {/* Barra de Progresso Visual */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-accent-primary to-accent-sky h-1.5 rounded-full bar-transition"
                      style={{ width: `${res.equityPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
              <span>Total Chips: <strong className="text-slate-300 data-mono">{players.reduce((s, p) => s + p.stack, 0)}</strong></span>
              <span>Prize Pool: <strong className="text-slate-300 data-mono">${prizes.reduce((s, p) => s + p, 0)}</strong></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}