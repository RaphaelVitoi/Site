import React from 'react';

interface ArticleHeaderProps {
  title: string;
  subtitle?: string;
  author: string;
  publishDate: string;
  readTime: string;
}

export default function ArticleHeader({
  title,
  subtitle,
  author,
  publishDate,
  readTime,
}: ArticleHeaderProps) {
  return (
    <header className="mb-8 border-b border-gray-200 pb-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-3">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-gray-600 mb-4">
          {subtitle}
        </p>
      )}
      <div className="flex items-center text-sm text-gray-500 space-x-4 font-medium">
        <div className="flex items-center text-gray-900">
          <span>{author}</span>
        </div>
        <span>&middot;</span>
        <time dateTime={publishDate}>{publishDate}</time>
        <span>&middot;</span>
        <span>{readTime} de leitura</span>
      </div>
    </header>
  );
}