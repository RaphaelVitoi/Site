'use client';

import React, { useState, useEffect } from 'react';

interface CodeBlockProps {
  readonly code: string;
  readonly language: string;
  readonly showLineNumbers?: boolean;
}

export default function CodeBlock({ code, language, showLineNumbers }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
    } catch (err) {
      console.error('Falha ao copiar o código:', err);
    }
  };

  return (
    <div className="relative my-6 rounded-lg bg-slate-950 border border-white/10 shadow-lg overflow-hidden font-mono">
      {/* Header do CodeBlock */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/5">
        <span className="text-xs text-slate-400 uppercase tracking-wider select-none">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
          aria-label="Copiar código"
        >
          {isCopied ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Copiado!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copiar
            </span>
          )}
        </button>
      </div>
      
      {/* Área de Código */}
      <div className="p-4 overflow-x-auto text-sm text-slate-300 leading-relaxed">
        <pre>
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}