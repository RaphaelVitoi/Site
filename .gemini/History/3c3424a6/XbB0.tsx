'use client';

import { useState } from 'react';

const ICMCalculator = () => {
  const [stacks, setStacks] = useState(['', '', '', '']);
  const [payouts, setPayouts] = useState(['', '', '']);
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    // Lógica de cálculo do ICM (simulada com Chip-Chop para demonstração)
    const totalChips = stacks.reduce((acc, s) => acc + (parseFloat(s) || 0), 0);
    if (totalChips === 0) {
      setResults(null);
      return;
    }
    const equities = stacks.map(stack => {
      const s = parseFloat(stack) || 0;
      return ((s / totalChips) * 100).toFixed(2);
    });
    setResults(equities);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-white mb-6">Calculadora ICM - Independent Chip Model</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-400 mb-3">Estrutura de Pagamento (Payouts)</h3>
            {payouts.map((payout, index) => (
              <div key={index} className="flex items-center gap-3 mb-2">
                <label className="w-12 text-slate-400">{index + 1}º:</label>
                <input
                  type="number"
                  placeholder={`Prêmio do ${index + 1}º lugar`}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={payout}
                  onChange={(e) => {
                    const newPayouts = [...payouts];
                    newPayouts[index] = e.target.value;
                    setPayouts(newPayouts);
                  }}
                />
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-400 mb-3">Stacks dos Jogadores</h3>
            {stacks.map((stack, index) => (
              <div key={index} className="flex items-center gap-3 mb-2">
                <label className="w-20 text-slate-400">Jogador {index + 1}:</label>
                <input
                  type="number"
                  placeholder="Fichas"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={stack}
                  onChange={(e) => {
                    const newStacks = [...stacks];
                    newStacks[index] = e.target.value;
                    setStacks(newStacks);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-indigo-400 mb-4">Resultados (Equity em % - Simulado)</h3>
          <div className="flex-grow">
            {results ? (
              <ul className="space-y-3">
                {results.map((equity, index) => (
                  <li key={index} className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                    <span className="font-medium text-slate-300">Jogador {index + 1}</span>
                    <span className="font-mono text-lg text-green-400">{equity}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <p>Insira os dados e clique em "Calcular" para ver a equity.</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleCalculate}
            className="mt-6 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          >
            Calcular Equity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ICMCalculator;