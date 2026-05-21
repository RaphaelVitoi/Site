import Link from 'next/link';

interface ArticleItem {
    href: string;
    tags: string[];
    title: string;
    description: string;
    readingTime: string;
    isNew: boolean;
}

export default function AnimatedArticleGrid ( { articles }: { readonly articles: ArticleItem[] } ) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { articles.map( ( article, idx ) => (
                <Link
                    key={ idx }
                    href={ article.href }
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)]"
                >
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                { article.tags.map( tag => (
                                    <span key={ tag } className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                                        { tag }
                                    </span>
                                ) ) }
                            </div>
                            { article.isNew && (
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Recente"></span>
                            ) }
                        </div>
                        <h3 className="mb-3 font-serif text-xl font-bold text-slate-100 group-hover:text-white transition-colors">
                            { article.title }
                        </h3>
                        <p className="mb-6 text-sm text-slate-400 leading-relaxed">
                            { article.description }
                        </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs font-mono text-slate-500 group-hover:border-slate-700 transition-colors">
                        <span>{ article.readingTime }</span>
                        <span className="flex items-center gap-1 text-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            Ler Artigo <i className="fa-solid fa-arrow-right"></i>
                        </span>
                    </div>
                </Link>
            ) ) }
        </div>
    );
}
