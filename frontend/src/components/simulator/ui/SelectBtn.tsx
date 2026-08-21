'use client';

interface SelectBtnProps {
	label: string;
	active: boolean;
	impossible?: boolean;
	onClick: () => void;
}

type ButtonState = 'impossible' | 'active' | 'default';

const BG_CLASSES: Record<ButtonState, string> = {
	impossible: 'bg-accent-danger/5 border-accent-danger/20',
	active: 'bg-accent-indigo/30 border-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.6),inset_0_0_10px_rgba(99,102,241,0.4)]',
	default: 'bg-bg-deep hover:bg-white/5 border border-white/5',
};

const TEXT_CLASSES: Record<ButtonState, string> = {
	impossible: 'text-accent-danger/60',
	active: 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]',
	default: 'text-text-muted hover:text-text-light',
};

export const SelectBtn = ({ label, active, impossible, onClick }: Readonly<SelectBtnProps>) => {
	let stateKey: ButtonState = 'default';
	if (impossible) stateKey = 'impossible';
	else if (active) stateKey = 'active';

	const bgClass = BG_CLASSES[stateKey];
	const textClass = TEXT_CLASSES[stateKey];

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={impossible}
			className={`px-3 py-2 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all duration-300 ${bgClass} ${textClass} ${impossible ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
		>
			{label}
		</button>
	);
};
