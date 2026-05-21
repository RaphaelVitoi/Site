'use client';

import React, { useState } from 'react';
import { useIcmSimulation } from './useIcmSimulation';
import IcmCharts from './IcmCharts';
import IcmCapTable from './IcmCapTable';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function IcmSimulator() {
  const sim = useIcmSimulation();
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async () => {
    const element = document.getElementById('icm-report');
    if (!element) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Dobro da resolução para ficar nítido
        backgroundColor: '#09090b', // zinc-950 (fundo exato do Tailwind)
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`CapTable_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="icm-report" className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800 shadow-2xl">
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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Option Pool (%)</label>
          <input
            type="number"
            value={sim.optionPoolPercent}
            onChange={(e) => sim.setOptionPoolPercent(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 p-2 rounded focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-zinc-800/50 pb-4">
          <h2 className="text-xl font-bold text-magenta-500">Resultados da Simulação</h2>
          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-magenta-600 hover:border-magenta-500 hover:text-white disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            optionPoolShares={sim.optionPoolShares}
          />
          <IcmCapTable
            founders={sim.founders}
            investorShares={sim.investorShares}
            optionPoolShares={sim.optionPoolShares}
            totalSharesPostInvestment={sim.totalSharesPostInvestment}
          />
        </div>
      </div>
    </div>
  );
}