'use client';

import Link from 'next/link';
import ShareButtons from './ShareButtons';

interface ContentFooterProps
{
    shareTitle: string;
    shareUrl: string;
    backLinkHref: string;
    backLinkText: string;
}

export default function ContentFooter ( { shareTitle, shareUrl, backLinkHref, backLinkText }: Readonly<ContentFooterProps> )
{
    return (
        <footer className="mt-24 pt-12 border-t border-white/5 animate-fade-up animation-delay-400 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <ShareButtons title={ shareTitle } url={ shareUrl } />
            <nav className="text-center mt-16">
                <Link href={ backLinkHref } className="group inline-flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-muted group-hover:border-accent-emerald group-hover:text-accent-emerald transition-all duration-500">
                        <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform duration-500" />
                    </div>
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-text-dim group-hover:text-white transition-colors duration-500">
                        { backLinkText }
                    </span>
                </Link>
            </nav>
        </footer>
    );
}
