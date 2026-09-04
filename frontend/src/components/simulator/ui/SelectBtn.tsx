'use client';

interface SelectBtnProps {
	label: string;
	active: boolean;
	impossible?: boolean;
	variant?: 'hero' | 'villain';
	onClick: () => void;
}

export const SelectBtn = ({
	label,
	active,
	impossible,
	variant = 'hero',
	onClick,
}: Readonly<SelectBtnProps>) => {
	const parts = label.trim().split(/\s+/);
	const position = parts[0] ?? label;
	const stack = parts.slice(1).join(' ');

	let containerClasses = 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20 text-text-muted hover:text-white cursor-pointer hover:-translate-y-0.5';

	if (impossible) {
		containerClasses = 'bg-black/20 border-white/5 text-text-darker/40 opacity-30 cursor-not-allowed';
	} else if (active) {
		if (variant === 'villain') {
			containerClasses = 'bg-accent-rose/15 border-accent-rose/60 text-white shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-1 ring-accent-rose/40 cursor-pointer';
		} else {
			containerClasses = 'bg-accent-indigo/15 border-accent-indigo/60 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-accent-indigo/40 cursor-pointer';
		}
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={impossible}
			className={`group relative inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-wider border transition-all duration-200 outline-none select-none ${containerClasses}`}
		>
			{active && !impossible && (
				<span
					className={`h-1.5 w-1.5 rounded-full shrink-0 animate-pulse ${
						variant === 'villain'
							? 'bg-accent-rose shadow-[0_0_8px_var(--color-accent-rose)]'
							: 'bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]'
					}`}
				/>
			)}
			<span className="font-black text-white">{position}</span>
			{stack && (
				<span
					className={`font-mono text-[0.6rem] font-bold transition-colors ${
						active
							? variant === 'villain'
								? 'text-accent-rose-light'
								: 'text-accent-indigo-light'
							: 'text-text-darker group-hover:text-text-muted'
					}`}
				>
					{stack}
				</span>
			)}
		</button>
	);
};
