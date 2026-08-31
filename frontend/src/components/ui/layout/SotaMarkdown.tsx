'use client';

import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import dynamic from 'next/dynamic';
import type { ElementType, ReactNode, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { isEmbeddableMediaUrl, isExternalHttpUrl } from '@/lib/markdown-url-policy';

// SOTA: Configuração global do Mermaid fora do ciclo de render para evitar overhead.
mermaid.initialize({
  startOnLoad: false, // Desativado para controle manual via mermaid.run
  theme: 'dark',
  // SEGURANCA: 'strict' e nao 'loose'. O modo 'loose' habilita HTML arbitrario
  // dentro dos rotulos e diretivas `click` que executam JavaScript. O conteudo
  // deste componente nao e todo estatico: a rota /biblioteca/[slug] renderiza
  // `content.body` vindo de /api/v1/content/{slug}, que tem caminho de
  // ingestao no backend. Verificado em 2026-08-21: nenhum diagrama publicado
  // usa `click` nem HTML em rotulo — os unicos .md com mermaid sao
  // documentacao interna (.cerebro, .claude), fora do bundle. Ou seja,
  // 'loose' nao comprava funcionalidade nenhuma e custava superficie de XSS.
  securityLevel: 'strict',
  fontFamily: 'var(--font-heading)',
});

// SOTA: Offloading do ReactPlayer para evitar travamento de hidratação (SSR) e reduzir FCP.
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface SotaMarkdownProps {
  content: string;
}

const MermaidChart = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (ref.current) {
      mermaid.run({ nodes: [ref.current] }).catch((err) => {
        if (isMounted) console.error('Mermaid Render Error:', err);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <div
      className="mermaid my-8 flex justify-center overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-6 shadow-inner"
      ref={ref}
    >
      {code}
    </div>
  );
};

// SOTA: Componente para Títulos Interativos com Copiar Link
const HeadingWithCopy = ({ level, children, id }: { level: 2 | 3; children: ReactNode; id: string | undefined }) => {
  const Tag = `h${level}` as ElementType;
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
      ? 'text-2xl font-black text-accent-indigo mt-14 mb-6 tracking-tight uppercase'
      : 'text-xl font-bold text-emerald-400 mt-10 mb-4 tracking-tight';

  return (
    <Tag
      id={id}
      className={`${baseStyles} group flex cursor-pointer items-center gap-4 transition-all duration-300 hover:translate-x-1`}
      onClick={handleCopy}
      title="Clique para copiar o link desta seção"
    >
      <span className="grow">{children}</span>
      {copied ? (
        <span className="animate-fade-in rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-[0.6rem] font-black tracking-[0.2em] text-emerald-400 uppercase shadow-lg">
          Link Copiado
        </span>
      ) : (
        <i className="fa-solid fa-link text-text-muted hover:text-accent-indigo text-[0.6em] opacity-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all group-hover:opacity-60 hover:opacity-100"></i>
      )}
    </Tag>
  );
};

const markdownComponents: Components = {
  h1: ({ children, id }) => (
    <h1
      id={id}
      className="text-text-bright mt-16 mb-8 border-b border-white/10 pb-6 text-3xl font-black tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }: { children?: ReactNode; id?: string | undefined }) => (
    <HeadingWithCopy level={2} id={id}>
      {children}
    </HeadingWithCopy>
  ),
  h3: ({ children, id }: { children?: ReactNode; id?: string | undefined }) => (
    <HeadingWithCopy level={3} id={id}>
      {children}
    </HeadingWithCopy>
  ),
  p: ({ children }) => (
    <p className="text-text-muted mb-8 text-[1.05rem] leading-loose font-medium opacity-90">{children}</p>
  ),
  ul: ({ children }) => <ul className="text-text-muted mb-10 list-disc space-y-4 pl-8 text-[1rem]">{children}</ul>,
  ol: ({ children, start }) => (
    <ol start={start} className="text-text-muted mb-10 list-decimal space-y-4 pl-8 text-[1rem]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-2">{children}</li>,
  strong: ({ children }) => <strong className="text-text-bright font-black drop-shadow-sm">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="border-accent-indigo/40 text-text-muted my-12 rounded-2xl border-l-4 bg-white/3 py-6 pl-8 text-xl italic shadow-inner backdrop-blur-sm">
      {children}
    </blockquote>
  ),
  a: ({ children, href, title }) => {
    if (isEmbeddableMediaUrl(href)) {
      return (
        <div className="group my-14 aspect-video overflow-hidden rounded-4xl border border-white/10 bg-black/40 shadow-[0_40px_80px_rgba(0,0,0,0.7)]">
          <ReactPlayer url={href} width="100%" height="100%" controls />
        </div>
      );
    }
    return (
      <a
        href={href}
        title={title}
        className="text-accent-indigo-light decoration-accent-indigo/40 hover:decoration-accent-indigo hover:text-glow-indigo font-bold underline underline-offset-4 transition-all hover:text-white"
        target={isExternalHttpUrl(href) ? '_blank' : undefined}
        rel={isExternalHttpUrl(href) ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !className;

    // Função auxiliar segura para extração de texto sem Node in context
    const extractText = (node: ReactNode): string => {
      if (typeof node === 'string' || typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (node && typeof node === 'object' && 'props' in node) {
        const element = node as ReactElement<{ children?: ReactNode }>;
        if (element.props?.children) {
          return extractText(element.props.children);
        }
      }
      return '';
    };

    const codeString = extractText(children);
    if (!isInline && match?.[1] === 'mermaid') {
      return <MermaidChart code={codeString.replace(/\n$/, '')} />;
    }
    return isInline ? (
      <code className="bg-accent-indigo/10 text-accent-indigo-light border-accent-indigo/20 rounded-lg border px-2 py-1 font-mono text-[0.9rem] shadow-sm">
        {children}
      </code>
    ) : (
      <code className="text-text-bright shadow-3xl my-12 block overflow-x-auto rounded-3xl border border-white/5 bg-[#020617]/80 p-8 font-mono text-[0.9rem] leading-loose tabular-nums backdrop-blur-xl">
        {children}
      </code>
    );
  },
  hr: () => <hr className="my-16 border-t border-white/5 opacity-50" />,
  table: ({ children }) => (
    <div className="my-10 w-full overflow-x-auto rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md">
      <table className="w-full border-collapse text-left text-[0.9rem]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-white/10 bg-white/5">{children}</thead>,
  th: ({ children, align }) => (
    <th align={align} className="text-text-muted p-5 font-black tracking-[0.2em] whitespace-nowrap uppercase">
      {children}
    </th>
  ),
  img: ({ src, alt, width, height }) => (
    <img
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className="my-8 h-auto max-w-full rounded-3xl border border-white/10 shadow-2xl"
    />
  ),
  td: ({ children, align }) => (
    <td align={align} className="text-text-light border-b border-white/5 p-5 font-mono whitespace-nowrap opacity-90">
      {children}
    </td>
  ),
};

export function SotaMarkdown({ content }: Readonly<SotaMarkdownProps>) {
  if (!content) return null;

  return (
    <div className="text-text-main sota-markdown-content animate-fade-in max-w-full font-sans leading-relaxed [&_.katex-display]:scrollbar-thin [&_.katex-display]:scrollbar-thumb-white/20 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeSlug, [rehypeKatex, { strict: false }]]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
