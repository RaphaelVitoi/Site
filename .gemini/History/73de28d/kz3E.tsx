'use client';

import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    readonly content: string;
}

// Componente customizado para injetar a lógica de copiar link ao clicar no título
const HeadingWithCopy = ( { level, children, id, ...props }: any ) => {
    const Tag = `h${level}` as React.ElementType;
    const [ copied, setCopied ] = useState( false );

    const handleCopy = () => {
        const url = `${globalThis.location.origin}${globalThis.location.pathname}#${id}`;
        navigator.clipboard.writeText( url ).then( () => {
            setCopied( true );
            setTimeout( () => setCopied( false ), 2000 );
        } );
    };

    return (
        <Tag
            id={ id }
            className="group cursor-pointer flex items-center"
            onClick={ handleCopy }
            title="Clique para copiar o link desta seção"
            { ...props }
        >
            <span className="grow">{ children }</span>
            { copied ? (
                <span className="ml-3 text-[0.6em] font-mono text-emerald-400 font-bold transition-opacity flex items-center">
                    <i className="fa-solid fa-check mr-1"></i> Copiado!
                </span>
            ) : (
                <i className="fa-solid fa-link ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500/50 hover:text-emerald-400 text-[0.6em]"></i>
            ) }
        </Tag>
    );
};

const markdownComponents = {
    h2: ( props: any ) => <HeadingWithCopy level={ 2 } { ...props } />,
    h3: ( props: any ) => <HeadingWithCopy level={ 3 } { ...props } />,
};

const MarkdownRenderer = memo( ( { content }: MarkdownRendererProps ) => {
    return (
        <ReactMarkdown
            remarkPlugins={ [ remarkGfm ] }
            rehypePlugins={ [ rehypeSlug ] }
            components={ markdownComponents }
        >
            { content }
        </ReactMarkdown>
    );
} );

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
