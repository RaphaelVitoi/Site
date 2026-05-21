'use client';

import React from 'react';
import { useIcmSimulation } from '../../hooks/useIcmSimulation';
import IcmCharts from './IcmCharts';
import IcmCapTable from './IcmCapTable';

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

        {/* Integração dos Novos Componentes Filhos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IcmCharts 
            totalFounderShares={sim.totalFounderShares} 
            investorShares={sim.investorShares} 
          />
          <IcmCapTable 
            founders={sim.founders} 
            investorShares={sim.investorShares} 
            totalSharesPostInvestment={sim.totalSharesPostInvestment} 
          />
        </div>
      </div>
    </div>
  );
}