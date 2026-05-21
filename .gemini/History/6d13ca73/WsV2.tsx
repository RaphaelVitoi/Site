"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Oracle() {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const askOracle = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setAnswer('');

        try {
            const res = await fetch('http://127.0.0.1:17042/ask-oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: query, n_results: 5 }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Falha ao consultar a Memória Coletiva.');
            }

            setAnswer(data.answer);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-fuchsia-900/30 rounded-xl p-6 shadow-lg flex flex-col h-[500px]">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-900/30 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                    <i className="fa-solid fa-brain"></i>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-fuchsia-400">Templo do Oráculo (RAG)</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mt-1">Consciência Vetorial SOTA</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
                {!answer && !loading && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <i className="fa-solid fa-sparkles text-4xl mb-3 opacity-20"></i>
                        <p className="text-sm font-mono text-center opacity-50">Oráculo online.<br />Faça sua consulta à memória do projeto.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center gap-3 text-fuchsia-400 animate-pulse bg-fuchsia-950/20 p-4 rounded-lg border border-fuchsia-900/30">
                        <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                        <span className="text-sm font-mono">Sintetizando Registros Akáshicos...</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm font-mono">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                        [ENTROPIA DETECTADA] {error}
                    </div>
                )}

                {answer && (
                    <div className="p-5 bg-gray-950/50 border border-gray-800 rounded-lg">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed font-mono">
                            {answer}
                        </pre>
                        <div className="text-sm text-gray-300 leading-relaxed">
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-lg font-bold text-fuchsia-400 mt-4 mb-2" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-md font-bold text-fuchsia-400 mt-3 mb-1" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-base font-bold text-fuchsia-400 mt-2 mb-1" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 ml-2 marker:text-fuchsia-500" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 ml-2 marker:text-fuchsia-500" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1 pl-1" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold text-fuchsia-300" {...props} />,
                                    a: ({node, ...props}) => <a className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                    code: ({node, inline, className, children, ...props}: any) => inline ? <code className="bg-fuchsia-950/50 border border-fuchsia-900/30 text-fuchsia-300 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code> : <div className="bg-gray-900 border border-gray-800 rounded p-3 overflow-x-auto text-xs font-mono text-gray-400 mb-3 mt-1"><code {...props}>{children}</code></div>,
                                }}
                            >{answer}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative mt-auto">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            askOracle();
                        }
                    }}
                    placeholder="Ex: Como o orquestrador lida com o limite de rate da API?"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-4 pr-14 text-sm text-gray-200 focus:outline-none focus:border-fuchsia-500/50 transition-colors resize-none h-20 font-mono"
                />
                <button
                    onClick={askOracle}
                    disabled={loading || !query.trim()}
                    className="absolute right-3 bottom-3 w-10 h-10 rounded-md bg-fuchsia-600 hover:bg-fuchsia-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <i className="fa-solid fa-paper-plane text-sm"></i>
                </button>
            </div>
        </div>
    );
}