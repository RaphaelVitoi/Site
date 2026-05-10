'use client';

/**
 * IDENTITY: Painel Didático de Insolvência SOTA
 * PATH: src/components/simulator/ui/InsolvencyQuizPanel.tsx
 * ROLE: Conecta a Árvore de Decisão (Zustand) ao Feedback Visceral (Framer Motion).
 */

import { motion, AnimatePresence, type Variants } from 'framer-motion';
// @ts-ignore
import { useQuizStore } from '@/store/QuizStore';

export function InsolvencyQuizPanel() {
  const {
    quizzes,
    currentQuizIndex,
    answerQuiz,
    nextQuiz,
    isCompleted,
    evLossAccumulated,
    visceralFeedback,
    clearFeedback
  } = useQuizStore();

  if (!quizzes || quizzes.length === 0) return null;

  // Renderização Pós-Conclusão
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 lg:p-10 rounded-4xl bg-bg-panel/80 border border-white/10 shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-radial-[at_center] from-accent-indigo/10 to-transparent pointer-events-none" />
        <h2 className="text-xl font-black text-white tracking-widest uppercase mb-4 relative z-10">Diagnóstico Concluído</h2>
        <p className="text-xs text-text-muted mb-4 uppercase tracking-[0.2em] relative z-10">Penalidade Termodinâmica (EV Loss)</p>
        <div className={`text-5xl font-mono font-black relative z-10 ${evLossAccumulated > 0.5 ? 'text-accent-danger drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'text-accent-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
          -{evLossAccumulated.toFixed(2)} bb
        </div>
        <p className="text-[0.65rem] text-text-darker mt-6 max-w-sm mx-auto leading-relaxed relative z-10">
          A sobrevivência no Poker exige a preservação do valuation da stack. Um EV Loss alto indica falhas na leitura das Reverse Implied Odds ou da aversão à perda de ICM.
        </p>
      </motion.div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];

  // Matriz Visceral SOTA (Framer Motion)
  const feedbackVariants: Variants = {
    idle: { x: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.05)' },
    flash_red: {
      backgroundColor: ['rgba(15, 23, 42, 0.4)', 'rgba(225, 29, 72, 0.3)', 'rgba(15, 23, 42, 0.4)'],
      borderColor: ['rgba(255, 255, 255, 0.05)', 'rgba(225, 29, 72, 0.8)', 'rgba(255, 255, 255, 0.05)'],
      transition: { duration: 0.6, ease: "easeInOut" }
    },
    shake_fatal: {
      x: [-15, 15, -12, 12, -8, 8, 0],
      backgroundColor: 'rgba(225, 29, 72, 0.5)',
      borderColor: 'rgba(225, 29, 72, 1)',
      transition: { duration: 0.5, ease: "linear" }
    },
    success_glow: {
      backgroundColor: ['rgba(15, 23, 42, 0.4)', 'rgba(16, 185, 129, 0.2)', 'rgba(15, 23, 42, 0.4)'],
      borderColor: ['rgba(255, 255, 255, 0.05)', 'rgba(16, 185, 129, 0.8)', 'rgba(255, 255, 255, 0.05)'],
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <motion.div
      variants={feedbackVariants}
      animate={visceralFeedback}
      onAnimationComplete={() => {
        if (visceralFeedback !== 'idle') {
          setTimeout(clearFeedback, 1200);
        }
      }}
      className="glass-panel p-8 lg:p-10 rounded-4xl border border-white/5 shadow-2xl relative overflow-hidden group/quiz"
    >
      <div className="absolute inset-0 bg-radial-[at_top_right] from-white/5 to-transparent pointer-events-none" />

      <div className="mb-8 relative z-10 flex items-start justify-between gap-4">
        <div>
          <span className="text-[0.6rem] font-black text-accent-indigo uppercase tracking-[0.3em] bg-accent-indigo/10 px-3 py-1 rounded-lg border border-accent-indigo/20">
            Nó de Decisão {currentQuizIndex + 1} / {quizzes.length}
          </span>
          <h3 className="text-lg lg:text-xl font-black text-white mt-5 leading-relaxed tracking-tight">
            {currentQuiz.question}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center shrink-0 shadow-inner">
          <i className="fa-solid fa-code-branch text-text-muted" />
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {currentQuiz.options.map((option: any, idx: number) => {
            let optionData;
            try {
              // SOTA Guard: Se a string vier crua do banco ou já for JSON
              optionData = typeof option === 'string' ? JSON.parse(option) : option;
            } catch {
              optionData = option;
            }
            return (
              <motion.button
                key={`${currentQuiz.id}-opt-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  answerQuiz(idx);
                  setTimeout(nextQuiz, visceralFeedback === 'shake_fatal' ? 2000 : 1500);
                }}
                disabled={visceralFeedback !== 'idle'}
                className="text-left px-6 py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-text-muted hover:text-white group/btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[0.6rem] font-black text-text-darker group-hover/btn:border-accent-indigo group-hover/btn:text-accent-indigo-light transition-colors">
                    {String.fromCodePoint(65 + idx)}
                  </div>
                  <span>{optionData.text || optionData}</span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {visceralFeedback !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 relative z-10"
        >
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted block mb-1">
            Análise do Oráculo:
          </span>
          <p className="text-sm font-medium text-white/80 leading-relaxed italic">
            &quot;{currentQuiz.explanation}&quot;
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
