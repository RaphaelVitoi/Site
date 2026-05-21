"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface SotaMarkdownProps {
  content: string;
}

const markdownComponents = {
  h1: ({node, children, ...props}: any) => <h1 className="text-2xl font-black text-text-bright mt-8 mb-4 uppercase tracking-tighter" {...props}>{children}</h1>,
  h2: ({node, children, ...props}: any) => <h2 className="text-xl font-bold text-accent-indigo mt-6 mb-3 tracking-tight" {...props}>{children}</h2>,
  h3: ({node, children, ...props}: any) => <h3 className="text-lg font-bold text-emerald-400 mt-4 mb-2" {...props}>{children}</h3>,
  p: ({node, children, ...props}: any) => <p className="mb-4 text-[0.95rem] text-text-muted" {...props}>{children}</p>,
  ul: ({node, children, ...props}: any) => <ul className="list-disc pl-6 mb-6 text-[0.95rem] text-text-muted space-y-2" {...props}>{children}</ul>,
  ol: ({node, children, ...props}: any) => <ol className="list-decimal pl-6 mb-6 text-[0.95rem] text-text-muted space-y-2" {...props}>{children}</ol>,
  li: ({node, children, ...props}: any) => <li className="pl-1" {...props}>{children}</li>,
  strong: ({node, children, ...props}: any) => <strong className="font-bold text-text-light" {...props}>{children}</strong>,
  blockquote: ({node, children, ...props}: any) => <blockquote className="border-l-4 border-accent-indigo/50 pl-4 py-1 italic bg-white/5 rounded-r-lg my-6" {...props}>{children}</blockquote>,
  code: ({node, inline, className, children, ...props}: any) =>
    inline
      ? <code className="bg-slate-900/80 text-accent-amber px-1.5 py-0.5 rounded font-mono text-[0.85rem]" {...props}>{children}</code>
      : <code className="block bg-[#0a0a0f] text-text-light p-4 rounded-xl border border-white/10 font-mono text-[0.85rem] overflow-x-auto my-6 shadow-2xl" {...props}>{children}</code>,
};

export function SotaMarkdown({ content }: Readonly<SotaMarkdownProps>) {
  if (!content) return null;

  return (
    <div className="text-text-light leading-relaxed font-sans">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
