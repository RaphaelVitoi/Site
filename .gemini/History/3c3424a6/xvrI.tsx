'use client';

import { useState, useEffect } from 'react';

const ICMCalculator = () => {
  // Data state
  const [stacks, setStacks] = useState(['10000', '5000', '3000', '2000']);
  const [payouts, setPayouts] = useState(['50', '30', '20']);
  const [results, setResults] = useState<number[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    
    // Animação gráfica (simulando tempo de processamento neural)
    setTimeout(() => {
      const totalChips = stacks.reduce((acc, s) => acc + (parseFloat(s) || 0), 0);
      if (totalChips === 0) {
        setResults(null);
        setIsCalculating(false);
        return;
      }
      
      // ICM Approximation (Visualização Vetorial Didática)
      const equities = stacks.map(stack => {
        const s = parseFloat(stack) || 0;
        return parseFloat(((s / totalChips) * 100).toFixed(2));
      });
      
      setResults(equities);
      setIsCalculating(false);
    }, 600);
  };

  // Trigger initial calculation on mount
  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 mb-16 animate-fade-up">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4 font-editorial tracking-wide">Laboratório de Risco</h2>
        <p className="text-slate-400 font-light max-w-2xl mx-auto">
          Simule a pressão do Independent Chip Model. A geometria do risco visualizada em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Esquerda: Parâmetros */}
        <div className="space-y-6">
          
          {/* Box de Payouts */}
          <div className="glass-panel p-6 sm:p-8 relative">
             <h3 className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-bold mb-6 flex items-center gap-3">
                <i className="fa-solid fa-trophy"></i> Estrutura de Premiação (%)
             </h3>
             <div className="flex gap-4">
                {payouts.map((payout, index) => (
                  <div key={index} className="flex-1 relative group">
                    <label className="absolute -top-3 left-4 bg-[#0f172a] px-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold z-10 transition-colors group-focus-within:text-indigo-400">
                      {index + 1}º Lugar
                    </label>
                    <input
                      type="number"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-slate-700/50 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-white data-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-center text-lg relative z-0"
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
          </div>

          {/* Box de Stacks usando classe customizada scenario-btn */}
          <div className="glass-panel p-6 sm:p-8 relative">
             <h3 className="text-xs uppercase tracking-[0.2em] text-sky-400 font-bold mb-6 flex items-center gap-3">
                <i className="fa-solid fa-coins"></i> Stacks (Fichas)
             </h3>
             <div className="space-y-4">
                {stacks.map((stack, index) => (
                  <div key={index} className="scenario-btn active group">
                    <div className="icon-box">
                        <span className="font-bold text-sm">P{index + 1}</span>
                    </div>
                    <div className="flex-1 relative">
                       <input
                        type="number"
                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-400/50 px-2 py-1 text-white data-mono focus:outline-none transition-all text-xl"
                        value={stack}
                        onChange={(e) => {
                            const newStacks = [...stacks];
                            newStacks[index] = e.target.value;
                            setStacks(newStacks);
                        }}
                       />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Direita: Visor */}
        <div>
           <div className="glass-panel h-full flex flex-col p-6 sm:p-8 relative overflow-hidden border-indigo-500/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
              
              <h3 className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold mb-8 text-center relative z-10">
                Equity Vetorial
              </h3>
              
              <div className="flex-grow flex flex-col justify-center space-y-6 relative z-10">
            {results ? (
                {results.map((equity, index) => (
                         <div key={index} className="relative group">
                             <div className="flex justify-between items-end mb-2">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jogador {index + 1}</span>
                                 <span className={`text-2xl font-bold text-white data-mono transition-opacity duration-300 ${isCalculating ? 'opacity-50' : 'glow-text'}`}>
                                    {equity.toFixed(2)}%
                                 </span>
                             </div>
                             <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden inset-shadow">
                                 <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] bar-transition" 
                                    style={{ width: `${isCalculating ? 0 : equity}%` }}
                                 ></div>
                             </div>
                         </div>
                     ))
                 ) : (
                     <div className="text-center text-slate-500 pulse-glow">
                        <i className="fa-solid fa-satellite-dish text-4xl mb-4 opacity-50"></i>
                        <p className="font-light text-sm">Aguardando telemetria...</p>
                     </div>
                 )}
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="mt-10 relative z-10 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold tracking-[0.1em] uppercase text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isCalculating ? (
                    <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Processando
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <i className="fa-solid fa-bolt"></i> Computar
                    </span>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ICMCalculator;