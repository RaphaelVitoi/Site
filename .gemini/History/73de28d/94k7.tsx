import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    readonly content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}