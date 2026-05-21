'use client';

import Link from 'next/link';

const Logo = ( { className = '' }: Readonly<{ className?: string; }> ) =>
{
    return (
        <Link href="/" aria-label="PokerRacional - Início" className={ `flex items-center gap-3 group focus:outline-none ${ className }` }>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-slate-800 to-slate-950 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(99,102,241,0.2)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_30px_rgba(99,102,241,0.6)] group-hover:border-accent-indigo/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-accent-indigo/30 to-accent-fuchsia/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-15"
                >
                    <path
                        d="M12 2L22 7V17L12 22L2 17V7L12 2Z M12 22V12 M22 7L12 12 M2 7L12 12"
                        stroke="url(#logo-gradient)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-accent-indigo group-hover:text-accent-fuchsia transition-colors duration-500 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
                    <defs>
                        <linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#cbd5e1" />
                            <stop offset="1" stopColor="#64748b" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="flex flex-col">
                <span className="hidden sm:inline-flex text-xl font-black tracking-tighter text-gradient-sota leading-none">
                    Poker<span className="font-medium text-slate-400 group-hover:text-accent-indigo-light transition-colors duration-500">Racional</span>
                </span>
            </div>
        </Link>
    );
};

export default Logo;
