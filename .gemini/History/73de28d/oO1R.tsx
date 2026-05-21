'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

interface MarkdownRendererProps {
    readonly content: string;
}

// Componente customizado para injetar a lógica de copiar link ao clicar no título
const HeadingWithCopy = ({ level, children, id, ...props }: any) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const handleCopy = () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <Tag
            id={id}
            className="group cursor-pointer flex items-center"
            onClick={handleCopy}
            title="Clique para copiar o link desta seção"
            {...props}
        >
            <span className="flex-grow">{children}</span>
            <i className="fa-solid fa-link ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500/50 hover:text-emerald-400 text-[0.6em]"></i>
        </Tag>
    );
};

const MarkdownRenderer = memo(({ content }: MarkdownRendererProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={{
                h2: (props) => <HeadingWithCopy level={2} {...props} />,
                h3: (props) => <HeadingWithCopy level={3} {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;