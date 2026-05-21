import React from 'react';
import { Shareholder } from './useIcmSimulation';

interface IcmCapTableProps {
  founders: Shareholder[];
  investorShares: number;
  optionPoolShares: number;
  totalSharesPostInvestment: number;
}

export default function IcmCapTable({ founders, investorShares, optionPoolShares, totalSharesPostInvestment }: IcmCapTableProps) {

  const getPercentage = (shares: number) => {
    if (totalSharesPostInvestment === 0) return '0.00%';
    return ((shares / totalSharesPostInvestment) * 100).toFixed(2) + '%';
  };

  return (
    <div className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-x-auto">
      <h3 className="text-lg font-semibold text-zinc-200 mb-4">Cap Table Detalhado (Post-Money)</h3>
      <table className="w-full text-left text-sm text-zinc-400 whitespace-nowrap">
        <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50 border-b border-zinc-800">
          <tr>
            <th className="px-4 py-3">Acionista</th>
            <th className="px-4 py-3 text-right">Ações</th>
            <th className="px-4 py-3 text-right">% (Post-Money)</th>
          </tr>
        </thead>
        <tbody>
          {founders.map((founder) => (
            <tr key={founder.id} className="border-b border-zinc-800/50">
              <td className="px-4 py-3 font-medium text-zinc-300">{founder.name}</td>
              <td className="px-4 py-3 text-right font-mono">{founder.shares.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-mono">{getPercentage(founder.shares)}</td>
            </tr>
          ))}
          <tr className="border-b border-zinc-800/50 bg-cyan-950/10">
            <td className="px-4 py-3 font-medium text-cyan-400">Novos Investidores</td>
            <td className="px-4 py-3 text-right font-mono text-cyan-400">{investorShares.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td className="px-4 py-3 text-right font-mono text-cyan-400">{getPercentage(investorShares)}</td>
          </tr>
          <tr className="border-b border-zinc-800/50 bg-violet-950/10">
            <td className="px-4 py-3 font-medium text-violet-400">Option Pool</td>
            <td className="px-4 py-3 text-right font-mono text-violet-400">{optionPoolShares.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td className="px-4 py-3 text-right font-mono text-violet-400">{getPercentage(optionPoolShares)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="font-bold text-white bg-zinc-950/80 border-t border-zinc-700">
            <td className="px-4 py-3">Total</td>
            <td className="px-4 py-3 text-right font-mono">{totalSharesPostInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td className="px-4 py-3 text-right font-mono">100.00%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}