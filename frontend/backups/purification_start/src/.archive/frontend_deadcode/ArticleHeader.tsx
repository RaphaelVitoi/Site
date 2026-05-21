interface ArticleHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly author: string;
  readonly publishDate: string;
  readonly readTime: string;
}

export default function ArticleHeader({
  title,
  subtitle,
  author,
  publishDate,
  readTime,
}: Readonly<ArticleHeaderProps>) {
  return (
    <header className="page-header text-center mb-16 animate-fade-up relative">
      <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-px h-8 bg-linear-to-b from-transparent to-accent-fuchsia/50" />
      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter font-heading text-white uppercase text-balance">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-8 text-lg sm:text-xl text-text-muted font-medium leading-relaxed max-w-3xl mx-auto text-balance italic">
          &quot;{subtitle}&quot;
        </p>
      )}

      <div className="mt-10 inline-flex flex-wrap justify-center items-center gap-6 text-[0.65rem] font-mono font-bold text-text-muted uppercase tracking-[0.2em] border-t border-white/5 pt-8">
        {author && (
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-gem text-accent-indigo/50" /> {author}
          </span>
        )}
        {publishDate && (
          <time dateTime={publishDate} className="flex items-center gap-2">
            <i className="fa-regular fa-calendar opacity-50" /> {publishDate}
          </time>
        )}
        {readTime && (
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-hourglass-half text-accent-danger/50" />{" "}
            {readTime}
          </span>
        )}
      </div>
    </header>
  );
}
