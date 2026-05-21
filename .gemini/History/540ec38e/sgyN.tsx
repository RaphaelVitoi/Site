'use client';

/**
 * IDENTITY: SOTA Content Header (A Assinatura)
 * PATH: src/components/layout/ContentPageHeader.tsx
 * ROLE: Prover identidade visual, título e apresentação consistente para páginas de conteúdo.
 * PRINCIPLE: Harmonia Estética & Antevisão.
 */

import Link from 'next/link';

interface ContentPageHeaderProps
{
    title: string;
    subtitle?: string;
    category?: string;
    icon?: string;
}

export function ContentPageHeader ( { title, subtitle, category, icon = 'fa-book-open' }: Readonly<ContentPageHeaderProps> )
{
    return (
        <header className="sota-container pt-32 pb-12 animate-sota-in">
            <div className="flex flex-col gap-6">

                {/* Breadcrumb SOTA */ }
                <nav className="flex items-center gap-3 text-label opacity-40 hover:opacity-100 transition-opacity">
                    <Link href="/" className="hover:text-accent-indigo transition-colors">Home</Link>
                    <i className="fa-solid fa-chevron-right text-[0.5rem]"></i>
                    { category && (
                        <>
                            <Link href={ `/${ category.toLowerCase() }` } className="hover:text-accent-indigo transition-colors uppercase">{ category }</Link>
                            <i className="fa-solid fa-chevron-right text-[0.5rem]"></i>
                        </>
                    ) }
                    <span className="text-text-darker truncate max-w-50">{ title }</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo shadow-lg shadow-indigo-900/10">
                                <i className={ `fa-solid ${ icon } text-xl` }></i>
                            </div>
                            { category && (
                                <span className="px-3 py-1 rounded-full bg-white/3 border border-white/5 text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em]">
                                    { category }
                                </span>
                            ) }
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-gradient-sota tracking-tighter leading-[1.1]">
                            { title }
                        </h1>

                        { subtitle && (
                            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl border-l-2 border-accent-indigo/40 pl-6 py-1">
                                { subtitle }
                            </p>
                        ) }
                    </div>

                    <div className="hidden lg:block">
                        <div className="text-right space-y-1 opacity-20 hover:opacity-50 transition-opacity">
                            <span className="text-label block">Paradigma VITOI</span>
                            <span className="text-[0.55rem] font-mono font-bold uppercase tracking-widest text-text-muted">Quantum Intelligence Layer</span>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-linear-to-r from-white/10 via-white/5 to-transparent mt-8"></div>
            </div>
        </header>
    );
}
