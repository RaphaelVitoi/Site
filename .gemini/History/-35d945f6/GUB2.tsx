'use client';

import React, { useState } from 'react';

export interface CodeBlockProps {
    code?: string;
    children?: React.ReactNode;
    language?: string;
    title?: string;
    className?: string;
}

export default function CodeBlock({ code, children, language = 'text', title, className = '' }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    // Resolve o conteudo independentemente se foi passado via prop 'code' ou 'children' (Backward Compatibility)
    const contentStr = code || (typeof children === 'string' ? children : '');

    const handleCopy = async () => {
        try {
            if (!contentStr) return;
            await navigator.clipboard.writeText(contentStr);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar codigo: ', err);
        }
    };

    return (
        <div className={`relative rounded-xl overflow-hidden border border-slate-800 bg-[#0f111a] my-6 shadow-2xl ${className}`}>
            {/* Header Bar (Estetica de Terminal SOTA) */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#171a23] border-b border-slate-800/80 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-70">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                    </div>
                    <span className="ml-2 uppercase tracking-widest text-[10px] font-semibold text-slate-500">{title || language}</span>
                </div>
                {contentStr && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors focus:outline-none"
                        aria-label="Copiar código"
                        title="Copiar"
                    >
                        {copied ? (
                            <><i className="fa-solid fa-check text-emerald-400"></i> <span className="text-emerald-400">Copiado</span></>
                        ) : (
                            <><i className="fa-regular fa-copy"></i> <span>Copiar</span></>
                        )}
                    </button>
                )}
            </div>

            {/* Area de Codigo */}
            <div className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed selection:bg-cyan-900 selection:text-cyan-50">
                <pre><code>{children || code}</code></pre>
            </div>
        </div>
    );
}