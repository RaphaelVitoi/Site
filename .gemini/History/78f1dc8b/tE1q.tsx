// @ts-nocheck
"use client";

import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import { useEffect, useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import ReactPlayer from "react-player";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface SotaMarkdownProps {
  content: string;
}

const MermaidChart = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: "dark",
        securityLevel: "loose",
      });
      mermaid.run({ nodes: [ref.current] }).catch(console.error);
    }
  }, [code]);
  return (
    <div
      className="mermaid flex justify-center my-8 p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner"
      ref={ref}
    >
      {code}
    </div>
  );
};

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="text-2xl font-black text-text-bright mt-8 mb-4 uppercase tracking-tighter"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-xl font-bold text-accent-indigo mt-6 mb-3 tracking-tight"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-bold text-emerald-400 mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 text-[0.95rem] text-text-muted" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc pl-6 mb-6 text-[0.95rem] text-text-muted space-y-2"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal pl-6 mb-6 text-[0.95rem] text-text-muted space-y-2"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-text-light" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-accent-indigo/50 pl-4 py-1 italic bg-white/5 rounded-r-lg my-6"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => {
    if (
      href &&
      (href.includes("youtube.com") ||
        href.includes("youtu.be") ||
        href.endsWith(".mp4"))
    ) {
      return (
        <div className="my-8 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 aspect-video">
          <ReactPlayer url={href} width="100%" height="100%" controls />
        </div>
      );
    }
    return (
      <a
        href={href}
        className="text-accent-indigo-light hover:text-white underline decoration-accent-indigo/50 underline-offset-4 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match?.[1] === "mermaid") {
      return <MermaidChart code={String(children).replace(/\n$/, "")} />;
    }
    return inline ? (
      <code
        className="bg-slate-900/80 text-accent-amber px-1.5 py-0.5 rounded font-mono text-[0.85rem]"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="block bg-[#0a0a0f] text-text-light p-4 rounded-xl border border-white/10 font-mono text-[0.85rem] overflow-x-auto my-6 shadow-2xl"
        {...props}
      >
        {children}
      </code>
    );
  },
};

export function SotaMarkdown({ content }: Readonly<SotaMarkdownProps>) {
  if (!content) return null;

  return (
    <div className="text-text-light leading-relaxed font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeSlug, rehypeKatex]}
        components={markdownComponents as any}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default SotaMarkdown;
