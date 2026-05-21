/**
 * IDENTITY: Calculadora ICM (Interface)
 * PATH: src/components/ICMCalculator.tsx
 * ROLE: Cuidar do input de dados (estado) e exibir resultados do ICM mantendo o padrão Dark/Cyber.
 * BINDING: [src/lib/icmEngine.ts (Motor Algorítmico), src/app/tools/icm/page.tsx (Rota Injetora), globals.css (Estética)]
 * TELEOLOGY: Tornar-se um portal didático e imersivo ("Sentir a Equity"), expandindo no futuro para importar hand histories diretos de trackers (Hand2Note).
 */
'use client';

import React, { useState, useMemo } from 'react';
import { calculateMalmuthHarville, ICMPlayer } from '../lib/icmEngine';
import { parseHandHistory } from '../lib/handParser';

export default function ICMCalculator() {
  const [players, setPlayers] = useState<ICMPlayer[]>([
    { id: '1', name: 'Hero', stack: 10000 },
    { id: '2', name: 'Villain A', stack: 5000 },
    { id: '3', name: 'Villain B', stack: 5000 },
  ]);
  
  const [prizes, setPrizes] = useState<number[]>([50, 30, 20]);

  const [historyInput, setHistoryInput] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);

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

  const handleHistoryPasted = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setHistoryInput(text);

    const parsed = parseHandHistory(text);
    if (parsed.length > 0) {
      setIsDecoding(true);
      setTimeout(() => {
        setPlayers(parsed);
        setIsDecoding(false);
        setHistoryInput(''); // Limpa o input após o sucesso para não sujar a tela
      }, 600); // Micro-interação: 600ms para gamificação visual (decodificação)
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-10 w-full max-w-4xl mx-auto mt-8 animate-fade-up">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-heading text-white glow-text mb-2">Motor ICM de Alta Precisão</h2>
        <p className="text-sm text-slate-400">Algoritmo de Malmuth-Harville</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção Esquerda: Inputs */}
        <div className="space-y-6">
          
          {/* Seção de Parser (Ingestão de Dados) */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-semibold text-fuchsia-400 uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                Ingestão de Dados (MDA)
              </h3>
            </div>
            <div className="relative">
              <textarea
                value={historyInput}
                onChange={handleHistoryPasted}
                placeholder="Cole o log da mão aqui (Hand2Note, PokerStars)..."
                className={`w-full bg-slate-900/50 border ${isDecoding ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'border-white/5 focus:border-fuchsia-500/50'} text-slate-300 text-sm p-3 rounded-lg data-mono focus:outline-none transition-all duration-300 min-h-[80px] resize-y`}
              />
              {isDecoding && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg border border-fuchsia-500/50 z-10">
                  <span className="text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
                    Decodificando...
                  </span>
                </div>
              )}
            </div>
          </div>

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