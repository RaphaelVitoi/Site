interface LessonHeaderProps {
  title: string;
  category: string;
  date?: string;
  author?: string;
}

export default function LessonHeader({ title, category, date, author }: Readonly<LessonHeaderProps>) {
  return (
    <header className="page-header animate-fade-up relative mb-16 text-center">
      <div className="sota-header-kicker mb-8">
        <span className="sota-header-marker" aria-hidden="true" />
        {category}
      </div>
      <h1 className="sota-page-title sota-page-title--lesson text-balance">{title}</h1>

      {(date || author) && (
        <div className="text-text-muted mt-10 flex items-center justify-center gap-6 font-mono text-[0.65rem] font-bold tracking-[0.2em] uppercase">
          {author && (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-gem text-accent-indigo/50" /> {author}
            </span>
          )}
          {author && date && <span className="h-1 w-1 rounded-full bg-white/20" />}
          {date && (
            <span className="flex items-center gap-2">
              <i className="fa-regular fa-clock opacity-50" />{' '}
              {new Date(date).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
