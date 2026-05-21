import Link from 'next/link';

const Logo = ( { className = '' }: Readonly<{ className?: string }> ) => {
    return (
        <Link href="/" aria-label="Poker Racional - Início" className={ `flex items-center gap-2.5 md:gap-3 group focus:outline-none ${className}` }>
            <div className="relative flex items-center justify-center shrink-0">
                {/* SOTA Glow Etéreo na interação */ }
                <div className="absolute inset-0 bg-accent-indigo/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 md:w-8 md:h-8 relative z-10 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[-8deg] group-hover:scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                >
                    <defs>
                        <linearGradient id="sota-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-accent-indigo-light, #818cf8)" />
                            <stop offset="100%" stopColor="var(--color-accent-indigo, #6366f1)" />
                        </linearGradient>
                    </defs>
                    {/* Monograma 'P' */ }
                    <path
                        d="M25 80 L25 20 L55 20 C69.14 20 80 30.86 80 45 C80 59.14 69.14 70 55 70 L40 70"
                        stroke="url(#sota-gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Monograma 'R' (perna) */ }
                    <path
                        d="M55 45 L80 80"
                        stroke="url(#sota-gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.85"
                    />
                </svg>
            </div>
            <span className="hidden sm:inline-flex text-lg lg:text-xl font-black tracking-tighter text-text-main transition-colors group-hover:text-text-bright whitespace-nowrap">
                Poker<span className="font-light text-text-muted group-hover:text-text-light transition-colors">Racional</span>
            </span>
        </Link>
    );
};

export default Logo;
