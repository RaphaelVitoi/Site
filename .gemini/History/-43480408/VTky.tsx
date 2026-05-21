import Link from 'next/link';

export default function Footer ()
{
  const currentYear = new Date().getFullYear();
  return (
    <footer id="contato" className="relative border-t border-white/5 bg-bg-deep pt-16 pb-8 overflow-hidden z-10">
      {/* Background abstrato sutil */ }
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

      <div className="sota-container flex flex-col items-center justify-center text-center relative z-10">

        {/* Branding/Logo */ }
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="group relative flex flex-col items-center gap-4 focus:outline-none mb-4">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-all duration-700 group-hover:border-white/20 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
               <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transition-transform duration-700 group-hover:scale-110 text-white">
                 <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                 <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                 <path d="M2 7V17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                 <path d="M22 7V17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                 <path d="M12 12V22" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
               </svg>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tighter text-white leading-none">
                POKER<span className="font-light text-white/70 tracking-widest ml-1">RACIONAL</span>
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.45em] text-accent-indigo-light mt-3 leading-none">
                A Geometria do Risco
              </span>
            </div>
          </Link>
          <p className="text-text-muted text-sm max-w-md leading-relaxed mt-2 font-medium">
            Inteligência SOTA, ICM Pós-Flop e o Paradigma da Perspectiva Matemática. O Edge Mudou de Lugar.
          </p>
        </div>

        {/* Navigation / Quick Links */ }
        <nav className="flex flex-wrap justify-center gap-6 mb-10 text-xs font-black uppercase tracking-[0.15em] text-text-dim">
          <Link href="/aulas/icm-masterclass" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Masterclass</Link>
          <Link href="/simulador" className="hover:text-accent-emerald hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all">Motor ICM</Link>
          <Link href="/artigos/estado-da-arte" className="hover:text-accent-indigo-light hover:drop-shadow-[0_0_10px_rgba(129,140,248,0.5)] transition-all">Whitepaper 2025</Link>
          <Link href="/biblioteca" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Biblioteca</Link>
          <Link href="/quem-sou" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">O Autor</Link>
        </nav>

        {/* Social Icons */ }
        <div className="flex items-center gap-6 mb-12">
          <a
            href="https://www.instagram.com/raphaelvitoi/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-accent-pink hover:border-accent-pink/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:-translate-y-1 transition-all duration-300"
            aria-label="Instagram"
          >
            <i className="fa-brands fa-instagram text-xl"></i>
          </a>
          <a
            href="https://www.youtube.com/@RaphaelVitoiPoker"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-accent-danger hover:border-accent-danger/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-1 transition-all duration-300"
            aria-label="YouTube"
          >
            <i className="fa-brands fa-youtube text-xl"></i>
          </a>
          <a
            href="https://www.twitch.tv/RaphaelVitoiPoker"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-accent-violet hover:border-accent-violet/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:-translate-y-1 transition-all duration-300"
            aria-label="Twitch"
          >
            <i className="fa-brands fa-twitch text-xl"></i>
          </a>
        </div>

        {/* Copyright & Legal */ }
        <div className="w-full flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 text-[0.65rem] font-bold text-text-dim uppercase tracking-widest gap-4">
          <p>
            &copy; { currentYear } Raphael Vitoi. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse"></span>
            <span>Nexus System Online</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
