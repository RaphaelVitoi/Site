'use client';

interface SelectBtnProps {
	label: string;
	active: boolean;
	impossible?: boolean;
	onClick: () => void;
}

export const SelectBtn = ({ label, active, impossible, onClick }: Readonly<SelectBtnProps>) => {
	let stateKey = 'default';
	if (impossible) stateKey = 'impossible';
	else if (active) stateKey = 'active';

	const bgClass = {
		impossible: 'bg-accent-danger/5 border-accent-danger/20',
		active: 'bg-accent-indigo/30 border-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.6),inset_0_0_10px_rgba(99,102,241,0.4)]',
		default: 'bg-bg-deep hover:bg-white/5 border border-white/5',
	}[stateKey];

	const textClass = {
		impossible: 'text-accent-danger/60',
		active: 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]',
		default: 'text-text-muted hover:text-text-light',
	}[stateKey];

	return (
		<button
			onClick={onClick}
			disabled={impossible}
			className={`px-3 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all duration-300 ${bgClass} ${textClass} ${impossible ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
		>
			{label}
		</button>
	);
};
