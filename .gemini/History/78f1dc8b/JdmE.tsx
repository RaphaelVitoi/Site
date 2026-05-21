// @ts-nocheck
"use client";

import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
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

// SOTA: Componente para Títulos Interativos com Copiar Link
const HeadingWithCopy = ({
  level,
  children,
  id,
  ...props
}: {
  level: 2 | 3;
  children: any;
  id?: string;
}) => {
  const Tag = `h${level}` as React.ElementType;
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    if (!id) return;
    e.stopPropagation();
    const url = `${globalThis.location.origin}${globalThis.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const baseStyles =
    level === 2
      ? "text-xl font-bold text-accent-indigo mt-10 mb-4 tracking-tight"
      : "text-lg font-bold text-emerald-400 mt-8 mb-3";

  return (
    <Tag
      id={id}
      className={`${baseStyles} group cursor-pointer flex items-center gap-3`}
      onClick={handleCopy}
      title="Clique para copiar o link desta seção"
      {...props}
    >
      <span className="grow">{children}</span>
      {copied ? (
        <span className="text-[0.55rem] font-black font-mono text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 animate-fade-in">
          Copiado
        </span>
      ) : (
        <i className="fa-solid fa-link text-[0.7em] opacity-0 group-hover:opacity-40 transition-all text-text-muted hover:text-accent-indigo hover:opacity-100"></i>
      )}
    </Tag>
  );
};

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="text-2xl font-black text-text-bright mt-12 mb-6 uppercase tracking-tighter border-b border-white/5 pb-4"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: (props) => <HeadingWithCopy level={2} {...props} />,
  h3: (props) => <HeadingWithCopy level={3} {...props} />,
  p: ({ children, ...props }) => (
    <p
      className="mb-6 text-[1rem] text-text-muted leading-relaxed font-medium"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc pl-6 mb-8 text-[0.95rem] text-text-muted space-y-3"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal pl-6 mb-8 text-[0.95rem] text-text-muted space-y-3"
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
    <strong className="font-black text-text-bright" {...props}>
      {children}
    </strong>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-accent-indigo/50 pl-6 py-2 italic bg-white/2 rounded-r-2xl my-8 text-text-muted text-lg shadow-sm"
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
        <div className="my-10 rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 aspect-video bg-black/40">
          <ReactPlayer url={href} width="100%" height="100%" controls />
        </div>
      );
    }
    return (
      <a
        href={href}
        className="text-accent-indigo-light hover:text-white font-bold underline decoration-accent-indigo/30 underline-offset-4 transition-all hover:decoration-accent-indigo"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !className;
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === "string" || typeof node === "number")
        return String(node);
      if (Array.isArray(node)) return node.map(extractText).join("");
      return "";
    };
    const codeString = extractText(children);
    if (!isInline && match?.[1] === "mermaid") {
      return <MermaidChart code={codeString.replace(/\n$/, "")} />;
    }
    return isInline ? (
      <code
        className="bg-accent-indigo/10 text-accent-indigo-light px-1.5 py-0.5 rounded font-mono text-[0.85rem] border border-accent-indigo/20"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="block bg-[#050508] text-text-bright p-6 rounded-2xl border border-white/10 font-mono text-[0.85rem] overflow-x-auto my-8 shadow-2xl tabular-nums leading-relaxed"
        {...props}
      >
        {children}
      </code>
    );
  },
  hr: () => <hr className="my-12 border-t border-white/5" />,
};

export function SotaMarkdown({ content }: Readonly<SotaMarkdownProps>) {
  if (!content) return null;

  return (
    <div className="text-text-main leading-relaxed font-sans sota-markdown-content animate-fade-in max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2 [&_.katex-display]:scrollbar-thin [&_.katex-display]:scrollbar-thumb-white/20">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeSlug, rehypeKatex]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default SotaMarkdown;
