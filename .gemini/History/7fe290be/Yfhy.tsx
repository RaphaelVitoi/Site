
interface ArticleHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly author: string;
  readonly publishDate: string;
  readonly readTime: string;
}

export default function ArticleHeader ( {
  title,
  subtitle,
  author,
  publishDate,
  readTime,
}: ArticleHeaderProps ) {
  return (
    <header className="page-header text-center mb-12 animate-fade-up">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading" style={ {
        background: 'linear-gradient(135deg, var(--text-main) 0%, #d946ef 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textWrap: 'balance',
      } }>
        { title }
      </h1>

      { subtitle && (
        <p className="mt-6 text-xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto text-balance">
          { subtitle }
        </p>
      ) }

      <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-slate-400 uppercase tracking-widest bg-slate-900/50 border border-white/5 rounded-full px-6 py-3 inline-flex shadow-inner">
        { author && <span className="flex items-center gap-2"><i className="fa-solid fa-user-astronaut text-indigo-400" /> { author }</span> }
        { author && publishDate && <span className="text-slate-700">&bull;</span> }
        { publishDate && <time dateTime={ publishDate } className="flex items-center gap-2"><i className="fa-regular fa-calendar text-emerald-400" /> { publishDate }</time> }
        { ( author || publishDate ) && readTime && <span className="text-slate-700">&bull;</span> }
        { readTime && <span className="flex items-center gap-2"><i className="fa-regular fa-clock text-rose-400" /> { readTime }</span> }
      </div>
    </header>
  );
}
