
interface ArticleHeaderProps
{
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
}: Readonly<ArticleHeaderProps> )
{
  return (
    <header className="page-header text-center mb-12 animate-fade-up">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter font-heading bg-linear-to-br from-text-main to-accent-fuchsia text-transparent bg-clip-text" style={ { textWrap: 'balance' } }>
        { title }
      </h1>

      { subtitle && (
        <p className="mt-6 text-xl text-text-muted font-medium leading-relaxed max-w-3xl mx-auto text-balance">
          { subtitle }
        </p>
      ) }

      <div className="mt-8 inline-flex flex-wrap justify-center items-center gap-4 text-[0.65rem] font-mono font-bold text-text-muted uppercase tracking-widest bg-bg-panel/40 border border-white/5 rounded-full px-6 py-3 shadow-inner backdrop-blur-md">
        { author && <span className="flex items-center gap-2"><i className="fa-solid fa-user-astronaut text-accent-indigo-light" /> { author }</span> }
        { author && publishDate && <span className="text-white/20">&bull;</span> }
        { publishDate && <time dateTime={ publishDate } className="flex items-center gap-2"><i className="fa-regular fa-calendar text-accent-emerald" /> { publishDate }</time> }
        { ( author || publishDate ) && readTime && <span className="text-white/20">&bull;</span> }
        { readTime && <span className="flex items-center gap-2"><i className="fa-regular fa-clock text-accent-danger" /> { readTime }</span> }
      </div>
    </header>
  );
}
