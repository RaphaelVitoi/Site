'use client';

/**
 * IDENTITY: Quiz Question v4.2 Gold
 * PATH: src/components/quiz/QuizQuestion.tsx
 * ROLE: Renderizador de questões com feedback gamificado.
 */

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import type { QuizOption, QuizQuestion as QuizQuestionType } from './types';

interface QuizQuestionProps {
	question: QuizQuestionType;
	selectedOptionId?: string;
	onSelectOption: (optionId: string) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
	question,
	selectedOptionId,
	onSelectOption,
}) => {
	const isAnswered = selectedOptionId !== undefined && selectedOptionId !== '';
	const isUserCorrect = selectedOptionId === question.correctOptionId;

	return (
		<div className="p-10 lg:p-12">
			<h2 className="text-white mb-12 text-2xl lg:text-3xl leading-tight font-black tracking-tighter">
				{question.text}
			</h2>

			<div className="flex flex-col gap-5">
				{question.options.map((option: QuizOption, idx) => {
					const isSelected = selectedOptionId === option.id;
					const isCorrect = option.id === question.correctOptionId;

					let btnClasses =
						'relative p-6 rounded-2xl text-left transition-all duration-500 outline-none flex justify-between items-center gap-6 text-[0.95rem] leading-relaxed border shadow-sm group/opt overflow-hidden';
					let icon = null;

					if (isAnswered) {
						if (isCorrect) {
							btnClasses +=
								' border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald-light shadow-[0_0_20px_rgba(16,185,129,0.1)] cursor-default';
							icon = (
								<i className="fa-solid fa-circle-check text-xl text-accent-emerald" />
							);
						} else if (isSelected && !isCorrect) {
							btnClasses +=
								' border-accent-rose/40 bg-accent-rose/10 text-accent-rose shadow-[0_0_20px_rgba(244,63,94,0.1)] cursor-default';
							icon = (
								<i className="fa-solid fa-circle-xmark text-xl text-accent-rose" />
							);
						} else {
							btnClasses +=
								' border-white/5 bg-white/3 text-text-darker cursor-default opacity-40 grayscale';
						}
					} else {
						btnClasses +=
							' cursor-pointer border-white/10 bg-slate-900/40 text-text-light hover:border-accent-indigo/50 hover:bg-slate-900/60 hover:-translate-y-1 hover:shadow-2xl';
					}

					return (
						<motion.button
							key={option.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: idx * 0.1 }}
							onClick={() => !isAnswered && onSelectOption(option.id)}
							disabled={isAnswered}
							className={btnClasses}
						>
							{!isAnswered && (
								<div className="absolute inset-0 bg-linear-to-r from-accent-indigo/5 to-transparent opacity-0 group-hover/opt:opacity-100 transition-opacity" />
							)}

							<span className="font-bold relative z-10">{option.label}</span>
							{icon && (
								<motion.span
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className="shrink-0 relative z-10"
								>
									{icon}
								</motion.span>
							)}
						</motion.button>
					);
				})}
			</div>

			<AnimatePresence>
				{isAnswered && question.explanation && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className={`mt-12 p-10 rounded-[2.5rem] border backdrop-blur-3xl shadow-2xl relative overflow-hidden ${isUserCorrect ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-accent-danger/5 border-accent-danger/20'}`}
					>
						<div className="absolute top-0 right-0 p-8 opacity-5">
							<i
								className={`fa-solid ${isUserCorrect ? 'fa-lightbulb' : 'fa-triangle-exclamation'} text-6xl text-white`}
							/>
						</div>

						<div className="flex items-center gap-4 mb-6 relative z-10">
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${isUserCorrect ? 'bg-accent-emerald/20 border-accent-emerald/30 text-accent-emerald' : 'bg-accent-danger/20 border-accent-danger/30 text-accent-danger'}`}
							>
								<i
									className={`fa-solid ${isUserCorrect ? 'fa-check' : 'fa-bolt'} text-sm`}
								/>
							</div>
							<h3
								className={`uppercase tracking-[0.3em] text-[0.75rem] font-black m-0 ${isUserCorrect ? 'text-accent-emerald' : 'text-accent-danger'}`}
							>
								{isUserCorrect ? 'Visão SOTA Confirmada' : 'Entropia Detectada'}
							</h3>
						</div>

						<div className="text-indigo-100/80 text-[1rem] m-0 leading-loose font-medium relative z-10">
							{question.explanation}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
