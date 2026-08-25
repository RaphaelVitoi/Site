'use client';

/**
 * IDENTITY: Quiz Engine SOTA v7.0 GOLD
 * PATH: src/components/quiz/QuizEngine.tsx
 * ROLE: Orquestrador de avaliação cognitiva.
 * AESTHETIC: SOTA Gold Standard (Symmetry, Depth, Motion).
 */

import { logTelemetryEvent } from '@/lib/telemetry-client';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import {
	resolveTelemetryCategory,
	type QuizQuestion as QuizQuestionType,
	type TelemetryCategory,
} from './types';

interface QuizEngineProps {
	questions: QuizQuestionType[];
	onQuizRestart?: () => void;
	onAnswer?: (isCorrect: boolean, evLoss: number, category: TelemetryCategory) => void;
}

const EMPTY_QUESTIONS: QuizQuestionType[] = [];

export const QuizEngine: React.FC<QuizEngineProps> = ({ questions, onQuizRestart, onAnswer }) => {
	const safeQuestions = useMemo(
		() => (Array.isArray(questions) ? questions : EMPTY_QUESTIONS),
		[questions],
	);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	const isFinished = currentIndex >= safeQuestions.length;

	const score = useMemo(() => {
		return safeQuestions.reduce((acc, q) => {
			return acc + (answers[q.id] === q.correctOptionId ? 1 : 0);
		}, 0);
	}, [answers, safeQuestions]);

	const handleSelectOption = (optionId: string) => {
		const currentQ = safeQuestions[currentIndex];
		if (!currentQ) return;
		setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));

		const isCorrect = optionId === currentQ.correctOptionId;
		const evLoss = isCorrect ? 0 : 0.5;
		const telemetryCategory = resolveTelemetryCategory(currentQ.category);

		logTelemetryEvent({
			category: telemetryCategory,
			metadata: { questionId: currentQ.id, questionText: currentQ.text },
			userAction: optionId,
			optimalAction: currentQ.correctOptionId,
			evLoss,
			isCorrect,
		});
		if (onAnswer) {
			onAnswer(isCorrect, evLoss, telemetryCategory);
		}
	};

	const handleNext = () => setCurrentIndex((prev) => prev + 1);
	const handleRestart = () => {
		setAnswers({});
		setCurrentIndex(0);
		if (onQuizRestart) onQuizRestart();
	};

	if (safeQuestions.length === 0) return null;

	const currentQuestion = safeQuestions[currentIndex];
	if (!isFinished && !currentQuestion) return null;

	return (
		<div className="max-w-4xl mx-auto flex flex-col gap-12">
			<AnimatePresence mode="wait">
				{isFinished ? (
					<motion.div
						key="results"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.05 }}
						className="glass-panel rounded-5xl bg-bg-panel/60 border border-white/10 shadow-2xl overflow-hidden relative"
					>
						<div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/10 to-transparent pointer-events-none" />
						<QuizResults
							score={score}
							total={safeQuestions.length}
							onRestart={handleRestart}
						/>
					</motion.div>
				) : (
					<motion.div
						key="quiz"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col gap-10"
					>
						<QuizProgress
							current={currentIndex}
							total={safeQuestions.length}
							score={score}
						/>

						<div className="glass-panel rounded-4xl bg-bg-panel/60 border border-white/5 shadow-2xl overflow-hidden relative group/engine">
							<div className="absolute inset-0 bg-radial-[at_top_left] from-accent-indigo/5 to-transparent pointer-events-none" />

							{currentQuestion && (
								<QuizQuestion
									question={currentQuestion}
									selectedOptionId={answers[currentQuestion.id] || ''}
									onSelectOption={handleSelectOption}
								/>
							)}

							<div className="px-10 pb-10 pt-0 flex justify-end min-h-24">
								{currentQuestion && answers[currentQuestion.id] && (
									<motion.button
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										onClick={handleNext}
										className="px-8 py-4 bg-accent-indigo text-white border border-accent-indigo-light/20 rounded-2xl cursor-pointer font-black transition-all uppercase tracking-widest text-[0.7rem] flex items-center gap-4 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-95"
									>
										{currentIndex === safeQuestions.length - 1
											? 'Analisar Perfil'
											: 'Sincronizar'}
										<i className="fa-solid fa-arrow-right-long" />
									</motion.button>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
