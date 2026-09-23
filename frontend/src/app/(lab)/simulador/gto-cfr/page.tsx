import { GtoCfrContent } from '@/components/simulator/GtoCfrContent';

export const metadata = {
	title: 'Laboratório GTO/CFR | Poker Racional',
	description:
		'Simulador interativo para convergência de Nash, Regret Matching (CFR) e A* Geometric Bet Sizing.',
};

export default function GtoCfrPage() {
	return (
		<div className="simulator-gto min-h-screen bg-bg-base pb-20">
			<header className="pt-16 pb-8 text-center max-w-4xl mx-auto px-6 animate-sota-in">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 mb-6">
					<i className="fa-solid fa-atom text-[0.6rem] text-accent-indigo animate-spin-slow" />
					<span className="text-xs font-black text-accent-indigo-light uppercase tracking-[0.12em]">
						Neural Engine v8.0 GOLD
					</span>
				</div>
				<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-6 drop-shadow-2xl">
					Laboratório <span className="text-accent-indigo">GTO / CFR</span>
				</h1>
				<p className="text-text-muted text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
					Exploração profunda de Teoria dos Jogos e Pathfinding A*. Onde a matemática fria
					do Nash encontra a termodinâmica do arrependimento recursivo.
				</p>
			</header>

			<GtoCfrContent />
		</div>
	);
}
