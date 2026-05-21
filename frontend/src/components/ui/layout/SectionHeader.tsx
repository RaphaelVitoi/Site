'use client';

interface SectionHeaderProps {
	readonly step: string;
	readonly label: string;
	readonly title: string;
	readonly description: string;
	readonly id?: string;
}

/**
 * IDENTITY: SectionHeader (SOTA UI GOLD)
 * ROLE: Cabeçalho padronizado para seções, seguindo o Design System.
 *       Garante consistência visual com glows dinâmicos e tipografia high-end.
 */
export function SectionHeader({
	step,
	label,
	title,
	description,
	id,
}: Readonly<SectionHeaderProps>) {
	return (
		<div
			id={id}
			className="w-full mx-auto px-4 pt-12 pb-8 relative group flex flex-col items-center text-center"
		>
			<div className="flex items-center justify-center gap-4 mb-8">
				<div className="h-px w-16 bg-linear-to-r from-transparent to-accent-indigo/60" />
				<div className="relative">
					<div className="absolute inset-0 bg-accent-indigo/20 blur-md rounded-full" />
					<span className="relative text-[0.65rem] font-black text-accent-indigo-light bg-bg-deep/80 border border-accent-indigo/30 px-5 py-2 rounded-full tracking-[0.25em] font-mono shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center min-w-[3rem]">
						{step}
					</span>
				</div>
				<span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-[0.35em] group-hover:text-text-main transition-colors duration-500">
					{label}
				</span>
				<div className="h-px w-16 bg-linear-to-l from-transparent to-accent-indigo/60" />
			</div>

			<h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-black m-0 mb-6 tracking-tighter text-white font-heading uppercase transition-all duration-700 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-gradient-sota">
				{title}
			</h2>

			<p className="m-0 text-[0.95rem] text-text-muted leading-relaxed max-w-2xl font-body font-medium group-hover:text-text-main transition-colors duration-500">
				{description}
			</p>
		</div>
	);
}

export default SectionHeader;
