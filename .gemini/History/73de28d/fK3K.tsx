import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

interface MarkdownRendererProps {
    readonly content: string;
}

const MarkdownRenderer = memo(({ content }: MarkdownRendererProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
        >
            {content}
        </ReactMarkdown>
    );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;