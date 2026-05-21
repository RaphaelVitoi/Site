'use client';

/**
 * IDENTITY: Bloco de Código Estilizado
 * PATH: src/components/simulator/ui/CodeBlock.tsx
 * ROLE: Exibir snippets de código com highlight base e botão de copy.
 */

import React, { useState } from 'react';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export default function CodeBlock({ code, language = 'typescript' }: Readonly<CodeBlockProps>) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            background: '#0a0f1c',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            margin: '1rem 0',
            position: 'relative'
        }}>
            {/* Header do bloco */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.4rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {language}
                </span>
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'transparent', border: 'none', color: copied ? '#10b981' : '#64748b',
                        cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'color 0.2s', padding: 0
                    }}
                >
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
                    {copied ? 'Copiado!' : 'Copiar'}
                </button>
            </div>
            {/* Corpo do bloco */}
            <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto' }}>
                <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {code}
                </code>
            </pre>
        </div>
    );
}