import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      id="contato"
      className="relative border-t border-white/5 bg-bg-deep pt-24 pb-12 overflow-hidden z-10"
    >
      {/* SOTA: Geometria Técnica de Fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_at_bottom,black_20%,transparent_70%)] pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

      <div className="sota-container flex flex-col items-center justify-center text-center relative z-10">
        {/* Branding/Logo (SOTA Gold Style) */}
        <div className="mb-14 flex flex-col items-center">
          <Link
            href="/"
            className="group relative flex flex-col items-center gap-5 focus:outline-none mb-6"
          >
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-4xl bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-700 group-hover:border-white/20 group-hover:shadow-[0_0_60px_rgba(255,255,255,0.1)]">
              <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-360 text-white"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 7V17"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 7V17"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12V22"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tighter text-white leading-none">
                POKER{" "}
                <span className="font-light text-white/60 tracking-[0.3em] ml-1.5">
                  RACIONAL
                </span>
              </span>
              <span className="text-[0.7rem] font-black uppercase tracking-[0.5em] text-accent-indigo-light mt-4 leading-none opacity-80 group-hover:text-white transition-colors duration-500">
                A Geometria do Risco
              </span>
            </div>
          </Link>
          <p className="text-text-muted text-[0.8rem] max-w-lg leading-loose mt-4 font-medium opacity-70">
            Inteligência SOTA, ICM Pós-Flop e o Paradigma da Perspectiva
            Matemática.
            <br />
            <span className="text-text-darker uppercase tracking-widest text-[0.6rem] font-black mt-2 inline-block">
              O Edge Mudou de Lugar.
            </span>
          </p>
        </div>

        {/* Navigation / Quick Links */}
        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-6 mb-16 text-[0.65rem] font-black uppercase tracking-[0.3em] text-text-dim relative">
          <div className="absolute -inset-x-20 inset-y-0 bg-white/2 blur-2xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <Link
            href="/aulas/icm-masterclass"
            className="hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
          >
            Masterclass
          </Link>
          <Link
            href="/simulador"
            className="hover:text-accent-emerald hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300"
          >
            Motor ICM
          </Link>
          <Link
            href="/artigos/estado-da-arte"
            className="hover:text-accent-indigo-light hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.4)] transition-all duration-300"
          >
            Whitepaper
          </Link>
          <Link
            href="/biblioteca"
            className="hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
          >
            Biblioteca
          </Link>
          <Link
            href="/templo/analytics"
            className="hover:text-accent-indigo-light hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.4)] transition-all duration-300"
          >
            Hub AGN
          </Link>
          <Link
            href="/quem-sou"
            className="hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
          >
            O Autor
          </Link>
        </nav>

        {/* Social Icons (SOTA High-End) */}
        <div className="flex items-center gap-8 mb-16">
          <SocialLink
            href="https://www.instagram.com/raphaelvitoi/"
            icon="fa-instagram"
            label="Instagram"
            color="rose"
          />
          <SocialLink
            href="https://www.youtube.com/@RaphaelVitoiPoker"
            icon="fa-youtube"
            label="YouTube"
            color="red"
          />
          <SocialLink
            href="https://www.twitch.tv/RaphaelVitoiPoker"
            icon="fa-twitch"
            label="Twitch"
            color="violet"
          />
        </div>

        {/* Copyright & Legal */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-white/5 text-[0.6rem] font-black text-text-darker uppercase tracking-[0.4em] gap-6 relative">
          <p className="m-0">
            &copy; {currentYear} Raphael Vitoi &middot;{" "}
            <span className="text-white/20">Axioma Sovereign</span>
          </p>
          <div className="flex items-center gap-3 bg-white/3 px-4 py-2 rounded-full border border-white/5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_10px_var(--color-accent-emerald)]"></div>
            <span className="text-text-muted">Nexus Core Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  icon,
  label,
  color,
}: Readonly<{
  href: string;
  icon: string;
  label: string;
  color: "rose" | "red" | "violet";
}>) {
  const colorMap = {
    rose: "hover:text-accent-pink hover:border-accent-pink/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    red: "hover:text-accent-danger hover:border-accent-danger/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    violet:
      "hover:text-accent-violet hover:border-accent-violet/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-14 h-14 rounded-[1.25rem] bg-black/40 border border-white/5 flex items-center justify-center text-text-dim transition-all duration-500 hover:-translate-y-2 ${colorMap[color]}`}
      aria-label={label}
    >
      <i className={`fa-brands ${icon} text-2xl`}></i>
    </a>
  );
}
