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
    <header className="mb-12 border-b border-white/10 pb-8 animate-fade-up">
      <h1 className="text-4xl font-extrabold tracking-tight text-white font-heading sm:text-5xl mb-4 glow-text">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-slate-400 mb-6 font-light leading-relaxed border-l-2 border-slate-500/30 pl-4 ml-1">
          {subtitle}
        </p>
      )}
      <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-4 gap-y-2 font-mono uppercase tracking-widest">
        <div className="flex items-center text-slate-300 font-bold">
          <i className="fa-solid fa-user-astronaut mr-2 text-slate-500"></i>
          <span>{author}</span>
        </div>
        <span className="text-white/20">&middot;</span>
        <time dateTime={publishDate} className="flex items-center"><i className="fa-regular fa-calendar mr-2 text-slate-500"></i>{publishDate}</time>
        <span className="text-white/20 hidden sm:inline">&middot;</span>
        <span className="bg-slate-900/50 px-2 py-1 rounded border border-white/5 data-mono">{readTime}</span>
      </div>
    </header>
  );
}