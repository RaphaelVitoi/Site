import Link from 'next/link';

const Logo = ({ className = '' }: { className?: string }) => {
    return (
        <Link href="/" aria-label="Poker Racional - Início" className={`flex items-center gap-3 group focus:outline-none ${className}`}>
            <svg
                width="28"
                height="28"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-110"
            >
                <defs>
                    <linearGradient id="sota-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a5b4fc" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
                {/* A stylized 'P' that looks like a chart or chip */}
                <path
                    d="M20 85 L20 15 L60 15 C76.5685 15 90 28.4315 90 45 L90 45 C90 61.5685 76.5685 75 60 75 L45 75"
                    stroke="url(#sota-gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M50 85 L50 75" stroke="#475569" strokeWidth="10" strokeLinecap="round" />
            </svg>
            <span
                className="hidden sm:inline text-xl font-black tracking-tighter text-slate-200 transition-colors group-hover:text-white"
            >
                PokerRacional
            </span>
        </Link>
    );
};

export default Logo;
