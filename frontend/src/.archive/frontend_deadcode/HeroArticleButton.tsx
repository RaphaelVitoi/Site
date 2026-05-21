import Link from 'next/link';

export function HeroArticleButton() {
	return (
		<div className="my-10 flex w-full justify-center">
			<Link
				href="/biblioteca/entendendo-o-icm-e-suas-heuristicas"
				className="group relative inline-flex items-center justify-center gap-4 rounded-md bg-slate-950 px-8 py-4 text-sm font-mono text-slate-300 shadow-2xl ring-1 ring-white/10 transition-all duration-300 hover:bg-slate-900 hover:text-white hover:ring-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
			>
				{/* Efeito Glow Estético (Cosmovisão Vitoi: Dark/Cyber) */}
				<div className="absolute -inset-0.5 -z-10 rounded-md bg-linear-to-r from-indigo-900 to-purple-900 opacity-0 blur-md transition duration-500 group-hover:opacity-100"></div>

				<span className="font-bold text-indigo-500">[SOTA]</span>
				<span className="tracking-wide">
					A Falácia das Pot Odds e a Ontologia da Decisão
				</span>

				<svg
					className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-indigo-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					/>
				</svg>
			</Link>
		</div>
	);
}
