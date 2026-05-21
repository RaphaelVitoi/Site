/**
 * IDENTITY: Calculadora ICM (Interface)
 * PATH: src/components/icm/ICMCalculator.tsx
 * ROLE: Cuidar do input de dados (estado) e exibir resultados do ICM mantendo o padrão Dark/Cyber.
 * BINDING: [src/lib/icmEngine.ts (Motor Algorítmico), src/app/tools/icm/page.tsx (Rota Injetora), globals.css (Estética)]
 * TELEOLOGY: Tornar-se um portal didático e imersivo ("Sentir a Equity"), expandindo no futuro para importar hand histories diretos de trackers (Hand2Note).
 */
'use client';

import React, { useState, useMemo } from 'react';
import { calculateMalmuthHarville, ICMPlayer } from '@/lib/icmEngine';
import { parseHandHistory } from '@/lib/handParser';
import ScenarioSimulator from './ScenarioSimulator';

export interface Scenario {
  name: string;
  stacks: number[];
}

const presetScenarios: Scenario[] = [
  { name: "Toy Game 1 (ChipEV)", stacks: [10000, 10000, 10000] },
  { name: "Toy Game 2 (RP 3 vs 6)", stacks: [15000, 10000, 5000] },
  { name: "Toy Game 3 (RP 3 vs 9 - Teto)", stacks: [20000, 8000, 2000] },
  { name: "Inv. TG 1 (RP 9 vs 3)", stacks: [8000, 20000, 2000] },
  { name: "Inv. TG 2 (RP 18 vs 3)", stacks: [4000, 25000, 1000] },
  { name: "Inv. TG 3 (RP 21 vs 3)", stacks: [2000, 27000, 1000] },
];

export default function ICMCalculator() {
  const [players, setPlayers] = useState<ICMPlayer[]>([
    { id: '1', name: 'Hero', stack: 10000 },
    { id: '2', name: 'Villain A', stack: 10000 },
    { id: '3', name: 'Villain B', stack: 10000 },
  ]);

  const [prizes, setPrizes] = useState<number[]>([50, 30, 20]);

  const [historyInput, setHistoryInput] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(presetScenarios[0].name);

  const handleScenarioChange = (scenarioName: string) => {
    const scenario = presetScenarios.find((s) => s.name === scenarioName);
    if (scenario) {
      setPlayers(prev => prev.map((p, idx) => ({ ...p, stack: scenario.stacks[idx] ?? p.stack })));
      setActiveScenario(scenarioName);
    }
  };

  // Memoização do cálculo matemático para evitar re-renders desnecessários
  const results = useMemo(() => {
    return calculateMalmuthHarville(players, prizes);
  }, [players, prizes]);

  const handleStackChange = (id: string, newStack: string) => {
    const val = parseInt(newStack, 10);
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, stack: isNaN(val) ? 0 : val } : p));
    setActiveScenario(null); // Auditoria: desmarca o cenário ativo se o usuário intervir manualmente
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
    <div className="bg-[#0f172a]/75 backdrop-blur-[24px] border border-white/[0.06] rounded-[24px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 sm:p-10 w-full max-w-5xl mx-auto mt-8 relative overflow-hidden transition-all duration-300">

      {/* Background Orbs (Luz Neon Orgânica) */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
          <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Motor ICM Ativo</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] mb-2 tracking-tight">Algoritmo de Malmuth-Harville</h2>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Cálculo de Equidade de Torneio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seção Esquerda: Inputs */}
        <div className="space-y-6">

          {/* Seção de Parser (Ingestão de Dados) */}
          <div className="bg-[#0f172a]/60 border border-slate-800/60 p-6 rounded-2xl relative z-10 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-black text-fuchsia-400 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <i className="fa-solid fa-bolt"></i>
                Ingestão de Dados (MDA)
              </h3>
            </div>
            <div className="relative">
              <textarea
                value={historyInput}
                onChange={handleHistoryPasted}
                placeholder="Cole o log da mão aqui (Hand2Note, PokerStars)..."
                className={`w-full bg-slate-900/60 border ${isDecoding ? 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'border-white/5 focus:border-fuchsia-500/50 focus:bg-slate-900'} text-slate-300 text-sm p-4 rounded-xl data-mono focus:outline-none transition-all duration-300 min-h-[90px] resize-y shadow-inner`}
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

          {/* Scenario Simulator */}
          <ScenarioSimulator
            scenarios={presetScenarios}
            activeScenario={activeScenario}
            onScenarioChange={handleScenarioChange}
          />

          {/* Stacks Section */}
          <div className="bg-[#0f172a]/60 border border-slate-800/60 p-6 rounded-2xl relative z-10 shadow-inner">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h3 className="font-heading font-black text-cyan-400 uppercase tracking-widest text-[11px]"><i className="fa-solid fa-coins mr-2"></i>Stacks (Fichas)</h3>
              <button onClick={addPlayer} className="text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white transition-all">
                <i className="fa-solid fa-plus mr-1"></i> Player
              </button>
            </div>
            <div className="space-y-4">
              {players.map((p) => (
                <div key={p.id} className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-xl border border-white/5 transition-all hover:border-white/10 hover:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, name: e.target.value } : pl))}
                      className="bg-transparent font-medium text-sm text-white focus:outline-none w-1/2"
                    />
                    <input
                      type="number"
                      min="0"
                      value={p.stack}
                      onChange={(e) => handleStackChange(p.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-lg w-1/2 text-right data-mono focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                  {/* Range Slider Interativo */}
                  <input
                    type="range"
                    min="0"
                    max="40000" /* Limite maleável de fichas para arraste fluido */
                    step="500"
                    value={p.stack}
                    onChange={(e) => handleStackChange(p.id, e.target.value)}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prizes Section */}
          <div className="bg-[#0f172a]/60 border border-slate-800/60 p-6 rounded-2xl relative z-10 shadow-inner">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <h3 className="font-heading font-black text-emerald-400 uppercase tracking-widest text-[11px]"><i className="fa-solid fa-trophy mr-2"></i>Payouts ($/%)</h3>
              <button onClick={addPrize} className="text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white transition-all">
                <i className="fa-solid fa-plus mr-1"></i> Payout
              </button>
            </div>
            <div className="space-y-3">
              {prizes.map((prize, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 w-1/2">{idx + 1}º Lugar</span>
                  <input
                    type="number"
                    min="0"
                    value={prize}
                    onChange={(e) => handlePrizeChange(idx, e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2 rounded-lg w-1/2 text-right data-mono focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Seção Direita: Resultados */}
        <div className="relative z-10 h-full">
          <div className="bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-3xl p-8 border border-white/[0.05] h-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
            <h3 className="font-heading font-black text-slate-400 uppercase tracking-[0.15em] text-[11px] mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
              <span>Painel de Equidade Real-Time</span>
              <i className="fa-solid fa-chart-line text-cyan-400"></i>
            </h3>

            <div className="space-y-6">
              {results.map((res) => (
                <div key={res.id} className="relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[13px] font-bold tracking-wide text-slate-200">{res.name}</span>
                    <div className="text-right">
                      <span className="text-xl text-white font-bold data-mono block leading-none tracking-tight">
                        $ {res.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-sky-400 font-bold data-mono uppercase tracking-widest mt-1 block">
                        {res.equityPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {/* Barra de Progresso Visual */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden shadow-inner border border-white/5 mt-3">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-sky-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                      style={{ width: `${res.equityPercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex flex-col gap-1">Fichas em Jogo <strong className="text-slate-300 data-mono text-sm">{players.reduce((s, p) => s + p.stack, 0).toLocaleString()}</strong></span>
              <span className="flex flex-col gap-1 text-right">Prize Pool Total <strong className="text-slate-300 data-mono text-sm">${prizes.reduce((s, p) => s + p, 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}