'use client';

interface InfoTooltipProps {
	text: string;
}

export const InfoTooltip = ({ text }: Readonly<InfoTooltipProps>) => {
	const iconProps = {
		style: { fontSize: '0.62rem', color: 'var(--text-darker)', lineHeight: 1 },
	};
	return (
		<div className="relative group inline-flex items-center ml-1 cursor-help">
			<span {...iconProps}>ⓘ</span>
			<div className="absolute bottom-full -left-4 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-48 sm:w-64 max-w-[85vw] p-2 sm:p-3 bg-bg-deep border border-indigo-500/30 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-100 pointer-events-none text-[0.65rem] text-text-light leading-relaxed font-sans normal-case tracking-normal text-left">
				{text}
			</div>
		</div>
	);
};
