import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { useQuizStore } from '@/store/QuizStore';

// Constantes de Ranks para os eixos (A, K, Q...)
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function BayesianRangeGrid() {
  const opponentRange = useQuizStore((state: any) => state.opponentRange);

  if (!opponentRange || opponentRange.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-bg-panel/80 rounded-2xl border border-white/10">
      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-2">
        Contração Bayesiana (Oponente)
      </h3>
      <div className="grid grid-cols-13 gap-px bg-black/50 p-1 border border-white/5 rounded-lg w-full max-w-sm">
        {opponentRange.map((row: number[], r: number) =>
          row.map((freq: number, c: number) => {
            // Definindo topologia da matriz: Par, Suited ou Offsuit
            const isPair = r === c;
            const isSuited = r < c;

            let label = `${RANKS[c]}${RANKS[r]}o`;
            let colorClass = 'bg-white/20 text-white';

            if (isPair) {
              label = `${RANKS[r]}${RANKS[c]}`;
              colorClass = 'bg-accent-emerald text-black';
            } else if (isSuited) {
              label = `${RANKS[r]}${RANKS[c]}s`;
              colorClass = 'bg-accent-indigo text-white';
            }

            // Opacidade baseada na Frequência Absoluta
            const opacity = freq > 0 ? 0.1 + freq * 0.9 : 0.05;

            return (
              <motion.div
                key={`${r}-${c}`}
                initial={{ opacity: 0 }}
                animate={{ opacity }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                title={`${label}: ${(freq * 100).toFixed(1)}%`}
                className={`aspect-square flex items-center justify-center text-[0.45rem] font-bold rounded-xs ${colorClass}`}
              >
                {label}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
