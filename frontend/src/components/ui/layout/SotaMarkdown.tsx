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
			className="mermaid flex justify-center my-8 p-6 bg-black/40 rounded-3xl border border-white/5 shadow-inner overflow-hidden"
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
}: {
	level: 2 | 3;
	children: ReactNode;
	id: string | undefined;
}) => {
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
			className={`${baseStyles} group cursor-pointer flex items-center gap-4 transition-all duration-300 hover:translate-x-1`}
			onClick={handleCopy}
			title="Clique para copiar o link desta seção"
		>
			<span className="grow">{children}</span>
			{copied ? (
				<span className="text-[0.6rem] font-black font-mono text-emerald-400 uppercase tracking-[0.2em] bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 animate-fade-in shadow-lg">
					Link Copiado
				</span>
			) : (
				<i className="fa-solid fa-link text-[0.6em] opacity-0 group-hover:opacity-60 transition-all text-text-muted hover:text-accent-indigo hover:opacity-100 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"></i>
			)}
		</Tag>
	);
};

const markdownComponents: Components = {
	h1: ({ children, id }) => (
		<h1
			id={id}
			className="text-3xl font-black text-text-bright mt-16 mb-8 uppercase tracking-tighter border-b border-white/10 pb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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
		<p className="mb-8 text-[1.05rem] text-text-muted leading-loose font-medium opacity-90">
			{children}
		</p>
	),
	ul: ({ children }) => (
		<ul className="list-disc pl-8 mb-10 text-[1rem] text-text-muted space-y-4">
			{children}
		</ul>
	),
	ol: ({ children, start }) => (
		<ol start={start} className="list-decimal pl-8 mb-10 text-[1rem] text-text-muted space-y-4">
			{children}
		</ol>
	),
	li: ({ children }) => (
		<li className="pl-2">
			{children}
		</li>
	),
	strong: ({ children }) => (
		<strong className="font-black text-text-bright drop-shadow-sm">
			{children}
		</strong>
	),
	blockquote: ({ children }) => (
		<blockquote
			className="border-l-4 border-accent-indigo/40 pl-8 py-6 italic bg-white/3 rounded-2xl my-12 text-text-muted text-xl shadow-inner backdrop-blur-sm"
		>
			{children}
		</blockquote>
	),
	a: ({ children, href, title }) => {
		if (isEmbeddableMediaUrl(href)) {
			return (
				<div className="my-14 rounded-4xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] border border-white/10 aspect-video bg-black/40 group">
					<ReactPlayer url={href} width="100%" height="100%" controls />
				</div>
			);
		}
		return (
			<a
				href={href}
				title={title}
				className="text-accent-indigo-light hover:text-white font-bold underline decoration-accent-indigo/40 underline-offset-4 transition-all hover:decoration-accent-indigo hover:text-glow-indigo"
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
			<code
				className="bg-accent-indigo/10 text-accent-indigo-light px-2 py-1 rounded-lg font-mono text-[0.9rem] border border-accent-indigo/20 shadow-sm"
			>
				{children}
			</code>
		) : (
			<code
				className="block bg-[#020617]/80 text-text-bright p-8 rounded-3xl border border-white/5 font-mono text-[0.9rem] overflow-x-auto my-12 shadow-3xl tabular-nums leading-loose backdrop-blur-xl"
			>
				{children}
			</code>
		);
	},
	hr: () => <hr className="my-16 border-t border-white/5 opacity-50" />,
	table: ({ children }) => (
		<div className="overflow-x-auto w-full my-10 rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-md">
			<table className="w-full text-left border-collapse text-[0.9rem]">
				{children}
			</table>
		</div>
	),
	thead: ({ children }) => (
		<thead className="bg-white/5 border-b border-white/10">
			{children}
		</thead>
	),
	th: ({ children, align }) => (
		<th
			align={align}
			className="p-5 font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap"
		>
			{children}
		</th>
	),
	td: ({ children, align }) => (
		<td
			align={align}
			className="p-5 border-b border-white/5 text-text-light font-mono whitespace-nowrap opacity-90"
		>
			{children}
		</td>
	),
};

export function SotaMarkdown({ content }: Readonly<SotaMarkdownProps>) {
	if (!content) return null;

	return (
		<div className="text-text-main leading-relaxed font-sans sota-markdown-content animate-fade-in max-w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2 [&_.katex-display]:scrollbar-thin [&_.katex-display]:scrollbar-thumb-white/20">
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
