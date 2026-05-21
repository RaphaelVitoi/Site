import React from 'react';

interface QuizProgressProps {
	current: number;
	total: number;
	score: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total, score }) => {
	const progressPercent = Math.round((current / total) * 100);

	return (
		<div className="py-5 px-8 border-b border-white/5 flex justify-between items-center bg-black/20">
			<div className="flex items-center gap-3">
				<span className="text-text-dim text-xs uppercase tracking-widest font-bold">
					Questão
				</span>
				<span className="font-mono font-black text-text-bright text-lg">
					{String(current + 1).padStart(2, '0')}{' '}
					<span className="text-text-darker text-sm">
						/ {String(total).padStart(2, '0')}
					</span>
				</span>
			</div>
			<div className="flex-1 mx-10 bg-white/5 h-1 rounded-full overflow-hidden">
				<div
					className="h-full bg-accent-indigo-light transition-all duration-500 ease-out shadow-[0_0_10px_rgba(129,140,248,0.5)]"
					{...{ style: { width: `${progressPercent}%` } }}
				/>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-text-dim text-xs uppercase tracking-widest font-bold">
					Acertos
				</span>
				<span className="font-mono font-black text-accent-emerald text-lg">
					{String(score).padStart(2, '0')}
				</span>
			</div>
		</div>
	);
};
