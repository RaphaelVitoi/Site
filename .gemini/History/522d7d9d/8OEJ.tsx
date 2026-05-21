/**
 * IDENTITY: Hub de Psicologia High Stakes
 * PATH: src/components/PsychologyHub.tsx
 * ROLE: Renderizar a grade interativa de artigos sobre Psicologia, aplicando estética Dark/Cyber e efeitos de estado.
 * BINDING: [src/app/psicologia-hs/page.tsx (Rota Pai Injetora)]
 * TELEOLOGY: Evoluir para suportar filtros dinâmicos de conteúdo, expansão para relatórios de sessão em áudio/vídeo.
 */
'use client';

import React from 'react';
import Link from 'next/link';

export interface SpecPost {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  slug?: string;
}

interface PsychologyHubProps {
  posts: SpecPost[];
}

export default function PsychologyHub({ posts }: PsychologyHubProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center p-10 glass-panel animate-fade-up">
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Nenhuma anomalia psicológica detectada no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-fade-up">
      {posts.map((post) => (
        <article 
          key={post.id} 
          className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:shadow-[0_10px_30px_-15px_rgba(217,70,239,0.3)] flex flex-col h-full group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 bg-fuchsia-400/10 px-2 py-1 rounded border border-fuchsia-400/20">
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-slate-500 data-mono">{post.readTime}</span>
          </div>
          
          <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">{post.title}</h3>
          <p className="text-slate-400 text-sm flex-grow leading-relaxed">{post.excerpt}</p>
          
          <Link href={`/psicologia-hs/${post.slug || 'a-ameaca-organica'}`}>
            <button className="mt-6 text-xs font-bold tracking-widest text-slate-300 uppercase self-start border-b border-fuchsia-500/0 group-hover:border-fuchsia-500/50 group-hover:text-white transition-all pb-1">
              Acessar Protocolo &rarr;
            </button>
          </Link>
        </article>
      ))}
    </div>
  );
}