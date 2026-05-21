import Link from 'next/link';

const Logo = ( { className = '' }: Readonly<{ className?: string }> ) => {
    return (
        <Link href="/" aria-label="Poker Racional - Início" className={ `flex items-center gap-3 group focus:outline-none ${className}` }>
            <svg
                width="28"
                height="28"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 transition-all duration-300 group-hover:rotate-[-5deg] group-hover:scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            >
                <defs>
                    <linearGradient id="sota-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-indigo-soft)" />
                        <stop offset="100%" stopColor="var(--accent-indigo)" />
                    </linearGradient>
                </defs>
                {/* 'P' part of the PR monogram */ }
                <path
                    d="M25 80 L25 20 L55 20 C69.14 20 80 30.86 80 45 C80 59.14 69.14 70 55 70 L40 70"
                    stroke="url(#sota-gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* 'R' leg part of the monogram */ }
                <path
                    d="M55 45 L80 80"
                    stroke="url(#sota-gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                />
            </svg>
            <span className="hidden sm:inline-flex text-xl font-black tracking-tighter text-slate-200 transition-colors group-hover:text-white whitespace-nowrap">
                Poker<span className="font-light text-slate-400 group-hover:text-slate-200 transition-colors">Racional</span>
            </span>
        </Link>
    );
};

export default Logo;
