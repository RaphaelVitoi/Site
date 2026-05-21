import Link from 'next/link';

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 w-full max-w-full overflow-x-hidden animate-fade-up">
			<div className="inline-flex max-w-full flex-wrap justify-center items-center gap-2 px-3 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/30 mb-8 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
				<span className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse"></span>
				<span className="text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest text-center wrap-break-word">
					Protocolo SOTA v6.2.1 GOLD Ativo
				</span>
			</div>

			<h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight wrap-break-word max-w-full px-2 text-glow-indigo transition-all duration-500">
				A Fronteira da Resolução
			</h1>

			<p className="text-base sm:text-lg md:text-xl text-slate-400 font-medium max-w-2xl mb-12 leading-relaxed px-2">
				Perspectiva Matemática, Regret Matching (CFR) e Inferência Local. O ecossistema
				definitivo para a desconstrução tática no Poker.
			</p>

			<div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-xs sm:max-w-none justify-center">
				<Link
					href="/templo/gemma"
					className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-accent-indigo text-white font-black uppercase tracking-widest text-xs hover:bg-accent-indigo-light hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-3"
				>
					<i className="fa-solid fa-brain" /> Consultar Oráculo
				</Link>
				<Link
					href="/simulador/gto-cfr"
					className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-accent-emerald/20 border border-accent-emerald/30 text-accent-emerald-light font-black uppercase tracking-widest text-xs hover:bg-accent-emerald/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
				>
					<i className="fa-solid fa-network-wired" /> Laboratório GTO/CFR
				</Link>
				<Link
					href="/biblioteca"
					className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-text-muted font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
				>
					<i className="fa-solid fa-book-open" /> Acessar Biblioteca
				</Link>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
				<FeatureCard
					title="Oráculo Gemma 4"
					icon="fa-microchip"
					href="/templo/gemma"
					desc="Inferência Local & RAG Vetorial"
				/>
				<FeatureCard
					title="Laboratório CFR"
					icon="fa-network-wired"
					href="/simulador/gto-cfr"
					desc="Regret Matching & A* Pathfinding"
				/>
				<FeatureCard
					title="Simulador Mestre"
					icon="fa-scale-unbalanced"
					href="/simulador"
					desc="Distorções ICM & Motor Quântico"
				/>
				<FeatureCard
					title="A Mente Coletiva"
					icon="fa-book-journal-whills"
					href="/biblioteca"
					desc="Registro Akáshico (Artigos SOTA)"
				/>
			</div>
		</div>
	);
}

function FeatureCard({
	title,
	icon,
	href,
	desc,
}: Readonly<{ title: string; icon: string; href: string; desc: string }>) {
	return (
		<Link
			href={href}
			className="glass-panel p-6 flex flex-col items-center text-center group hover:border-accent-indigo/30 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden bg-bg-panel/40 backdrop-blur-2xl"
		>
			<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
			<div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-accent-indigo/15 transition-all duration-1000" />
			<div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-accent-indigo/20 group-hover:text-accent-indigo-light transition-colors text-text-muted relative z-10 shadow-inner">
				<i className={`fa-solid ${icon} text-xl drop-shadow-md`}></i>
			</div>
			<h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 group-hover:text-glow-indigo transition-all duration-500 relative z-10">
				{title}
			</h3>
			<p className="text-xs text-slate-400 relative z-10 font-medium">{desc}</p>
		</Link>
	);
}
