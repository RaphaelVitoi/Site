import React from "react";

export interface BeliefDistribution {
  category: string; // Ex: 'Value Nuts', 'Marginal', 'Draws', 'Air'
  prior: number; // Range 0.0 a 1.0
  posterior: number; // Range 0.0 a 1.0
}

export interface BayesianBeliefPanelProps {
  beliefs: BeliefDistribution[];
  street: "Pre-Flop" | "Flop" | "Turn" | "River";
  confidenceIndex: number; // Porcentagem de certeza do colapso da range (0-100)
}

export const BayesianBeliefPanel: React.FC<BayesianBeliefPanelProps> = ({
  beliefs,
  street,
  confidenceIndex,
}) => {
  return (
    <div className="relative w-full max-w-2xl p-6 bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden font-sans">
      {/* Efeito de Brilho SOTA (Antevisão de Colapso) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm"></div>

      <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-white">
            Bayesian Belief State
          </h2>
          <p className="text-xs font-mono text-cyan-400/80 mt-1 uppercase tracking-widest">
            Colapso Dinâmico — {street}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-magenta-400">
            {confidenceIndex.toFixed(1)}%
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest">
            Índice de Certeza
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {beliefs.map((belief, index) => {
          const delta = belief.posterior - belief.prior;
          const isPositive = delta >= 0;

          return (
            <div key={index} className="relative group">
              <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
                <span>{belief.category}</span>
                <span
                  className={
                    isPositive ? "text-green-400" : "text-indian_red-400"
                  }
                >
                  {isPositive ? "+" : ""}
                  {(delta * 100).toFixed(1)}%
                </span>
              </div>

              {/* Trilho Base */}
              <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden relative">
                {/* Prior Belief (Fantasma/Referência) */}
                <div
                  className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-700 ease-in-out"
                  ref={(el) => {
                    if (el) el.style.width = `${belief.prior * 100}%`;
                  }}
                  title={`Prior: ${(belief.prior * 100).toFixed(1)}%`}
                ></div>

                {/* Posterior Belief (Estado Colapsado SOTA) */}
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isPositive ? "bg-cyan-500" : "bg-magenta-500"}`}
                  ref={(el) => {
                    if (el) el.style.width = `${belief.posterior * 100}%`;
                  }}
                  title={`Posterior: ${(belief.posterior * 100).toFixed(1)}%`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
