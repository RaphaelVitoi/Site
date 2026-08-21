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
			className="w-full mx-auto px-6 pt-20 pb-12 relative group flex flex-col items-center text-center"
		>
			<div className="flex items-center justify-center gap-5 mb-10">
				<div className="h-px w-20 bg-linear-to-r from-transparent to-accent-indigo/60" />
				<div className="relative">
					<div className="absolute inset-0 bg-accent-indigo/20 blur-lg rounded-full" />
					<span className="relative text-[0.7rem] font-black text-accent-indigo-light bg-bg-deep/80 border border-accent-indigo/30 px-6 py-2.5 rounded-full tracking-[0.4em] font-mono shadow-[0_0_25px_rgba(99,102,241,0.3)] flex items-center justify-center min-w-16">
						{step}
					</span>
				</div>
				<span className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.3em] group-hover:text-text-main transition-colors duration-500">
					{label}
				</span>
				<div className="h-px w-20 bg-linear-to-l from-transparent to-accent-indigo/60" />
			</div>

			<h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-black m-0 mb-8 tracking-tighter text-white font-heading uppercase transition-all duration-700 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:text-glow-indigo">
				{title}
			</h2>

			<p className="m-0 text-[1.1rem] text-text-muted leading-loose max-w-3xl font-body font-medium group-hover:text-text-main transition-colors duration-500 opacity-90">
				{description}
			</p>
		</div>
	);
}

export default SectionHeader;
