'use client';

import Link from 'next/link';
import ShareButtons from './ShareButtons';

interface ContentFooterProps {
    shareTitle: string;
    shareUrl: string;
    backLinkHref: string;
    backLinkText: string;
}

export default function ContentFooter ( { shareTitle, shareUrl, backLinkHref, backLinkText }: Readonly<ContentFooterProps> ) {
    return (
        <footer className="mt-16 animate-fade-up animation-delay-400">
            <ShareButtons title={ shareTitle } url={ shareUrl } />
            <nav className="text-center mt-12">
                <Link href={ backLinkHref } className="text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                    &larr; { backLinkText }
                </Link>
            </nav>
        </footer>
    );
}
