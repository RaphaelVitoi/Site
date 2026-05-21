import React from 'react';

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
}: ArticleHeaderProps) {
  return (
    <header className="page-header text-center mb-12 animate-fade-up">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-heading" style={{
        background: 'linear-gradient(135deg, #fff 0%, #d946ef 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textWrap: 'balance',
      }}>
        {title}
      </h1>

      {subtitle && (
        <p className="mt-6 text-xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto text-balance">
          {subtitle}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-sm font-mono text-slate-500 uppercase tracking-wider">
        {author && <span><i className="fa-solid fa-user-astronaut mr-2" /> {author}</span>}
        {author && publishDate && <span className="text-slate-700">&bull;</span>}
        {publishDate && <time dateTime={publishDate}><i className="fa-regular fa-calendar mr-2" /> {publishDate}</time>}
        {(author || publishDate) && readTime && <span className="text-slate-700">&bull;</span>}
        {readTime && <span><i className="fa-regular fa-clock mr-2" /> {readTime}</span>}
      </div>
    </header>
  );
}