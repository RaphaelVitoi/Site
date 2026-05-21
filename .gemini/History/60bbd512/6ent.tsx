'use client';

import React from 'react';
import { useIcmSimulation } from '../../hooks/useIcmSimulation';

export default function IcmSimulator() {
  const sim = useIcmSimulation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800 shadow-2xl">
      <div className="col-span-1 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-cyan-500">Controles de Simulação</h2>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Valuation Pre-Money (R$)</label>
          <input 
            type="number" 
            value={sim.preMoney} 
            onChange={(e) => sim.setPreMoney(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 p-2 rounded focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Aporte / Investimento (R$)</label>
          <input 
            type="number" 
            value={sim.investment} 
            onChange={(e) => sim.setInvestment(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 p-2 rounded focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="col-span-2 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-magenta-500">Resultados da Simulação</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
            <p className="text-sm text-zinc-400">Valuation Post-Money</p>
            <p className="text-2xl font-bold text-white">R$ {sim.postMoney.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
            <p className="text-sm text-zinc-400">Preço por Ação</p>
            <p className="text-2xl font-bold text-white">R$ {sim.pricePerShare.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 border-b border-zinc-700 pb-2">Cap Table - Resumo</h3>
          <ul className="space-y-2">
            <li className="flex justify-between text-sm">
              <span className="text-zinc-400">Ações dos Fundadores:</span>
              <span className="font-mono text-zinc-200">{sim.totalFounderShares.toLocaleString()}</span>
            </li>
            <li className="flex justify-between text-sm">
              <span className="text-zinc-400">Ações do Investidor:</span>
              <span className="font-mono text-zinc-200">{sim.investorShares.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </li>
            <li className="flex justify-between text-sm font-bold border-t border-zinc-800 pt-2 mt-2">
              <span className="text-cyan-400">Total Post-Aporte:</span>
              <span className="font-mono text-cyan-400">{sim.totalSharesPostInvestment.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}