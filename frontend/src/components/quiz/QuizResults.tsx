'use client';

/**
 * IDENTITY: Quiz Results v7.0 GOLD
 * PATH: src/components/quiz/QuizResults.tsx
 * ROLE: Renderizador de resultados com métricas de precisão.
 */

import { motion } from 'framer-motion';
import React from 'react';

interface QuizResultsProps {
	score: number;
	total: number;
	onRestart: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ score, total, onRestart }) => {
	const percentage = Math.round((score / total) * 100);
	const isSuccess = percentage >= 70;
	const title = isSuccess ? 'Sincronia Alcançada' : 'Entropia Residual';
	const icon = isSuccess ? 'fa-bolt-lightning' : 'fa-triangle-exclamation';

	return (
		<div className="py-20 px-10 text-center relative z-10">
			<div className="flex flex-col items-center gap-10">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: 'spring', damping: 12, stiffness: 200 }}
					className={`w-24 h-24 rounded-4xl flex items-center justify-center text-4xl shadow-2xl border ${
						isSuccess
							? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald shadow-emerald-500/20'
							: 'bg-accent-danger/10 border-accent-danger/20 text-accent-danger shadow-rose-500/20'
					}`}
				>
					<i className={`fa-solid ${icon}`} />
				</motion.div>

				<div className="space-y-4">
					<h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase m-0">
						{title}
					</h2>
					<p className="text-text-muted text-lg max-w-xl mx-auto leading-relaxed font-medium italic">
						O seu modelo cognitivo foi testado contra a topologia sistêmica do Paradigma
						Vitoi.
					</p>
				</div>

				<div className="relative group/score">
					<div
						className={`absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 ${isSuccess ? 'bg-accent-emerald' : 'bg-accent-danger'}`}
					/>
					<div
						className={`relative inline-flex flex-col items-center justify-center w-56 h-56 rounded-full border-2 bg-slate-950/80 shadow-2xl ${isSuccess ? 'border-accent-emerald/30' : 'border-accent-danger/30'}`}
					>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className={`text-6xl font-mono font-black tabular-nums tracking-tighter ${isSuccess ? 'text-accent-emerald' : 'text-accent-danger'}`}
						>
							{percentage}%
						</motion.div>
						<div className="text-text-darker text-[0.65rem] uppercase tracking-[0.4em] mt-3 font-black">
							Sincronia
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-16 w-full max-w-md pt-8 border-t border-white/5">
					<div className="text-center space-y-2 group/metric">
						<span className="block text-text-darker text-[0.6rem] uppercase tracking-[0.3em] font-black group-hover:text-accent-emerald transition-colors">
							Acertos
						</span>
						<span className="text-3xl font-black font-mono text-white tabular-nums tracking-tighter">
							{score}
						</span>
					</div>
					<div className="text-center space-y-2 group/metric">
						<span className="block text-text-darker text-[0.6rem] uppercase tracking-[0.3em] font-black group-hover:text-accent-danger transition-colors">
							Entropia
						</span>
						<span className="text-3xl font-black font-mono text-white tabular-nums tracking-tighter">
							{total - score}
						</span>
					</div>
				</div>

				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={onRestart}
					className="mt-6 px-12 py-5 bg-white/5 text-text-bright border border-white/10 rounded-2xl cursor-pointer font-black transition-all text-[0.7rem] uppercase tracking-[0.3em] inline-flex items-center gap-4 hover:bg-white/10 hover:border-white/20 active:bg-white/5 shadow-xl"
				>
					<i className="fa-solid fa-rotate-right" /> Calibrar Novamente
				</motion.button>
			</div>
		</div>
	);
};
