/**
 * IDENTITY: Hub de Psicologia High Stakes
 * PATH: src/components/content/PsychologyHub.tsx
 * ROLE: Renderizar a grade interativa de artigos sobre Psicologia, aplicando estética Dark/Cyber e efeitos de estado.
 * BINDING: [src/app/artigos/psicologia-hs/page.tsx (Rota Pai Injetora)]
 * TELEOLOGY: Evoluir para suportar filtros dinâmicos de conteúdo, expansão para relatórios de sessão em áudio/vídeo.
 */
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';

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

export default function PsychologyHub ( { posts }: Readonly<PsychologyHubProps> ) {
  const safePosts = useMemo( () => ( Array.isArray( posts ) ? posts : [] ), [ posts ] );

  const [ selectedTag, setSelectedTag ] = useState<string | null>( null );

  const allTags = useMemo( () => {
    const tags = new Set<string>();
    safePosts.forEach( post => post.tags.forEach( tag => tags.add( tag ) ) );
    return Array.from( tags ).sort( ( a, b ) => a.localeCompare( b ) );
  }, [ safePosts ] );


  const filteredPosts = useMemo( () => {
    if ( !selectedTag ) return safePosts;
    return safePosts.filter( post => post.tags.includes( selectedTag ) );
  }, [ safePosts, selectedTag ] );

  if ( safePosts.length === 0 )
  {
    return (
      <div className="text-center p-10 glass-panel animate-fade-up">
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Nenhuma anomalia psicológica detectada no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      { allTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={ () => setSelectedTag( null ) }
            className={ `px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all border ${selectedTag === null ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white hover:border-white/30'}` }
          >
            Todos
          </button>
          { allTags.map( tag => (
            <button
              key={ tag }
              onClick={ () => setSelectedTag( tag ) }
              className={ `px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all border ${selectedTag === tag ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]' : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white hover:border-white/30'}` }
            >
              { tag }
            </button>
          ) ) }
        </div>
      ) }

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <AnimatePresence mode="popLayout">
          { filteredPosts.map( ( post ) => (
            <motion.article
              key={ post.id }
              layout
              initial={ { opacity: 0, scale: 0.9 } }
              animate={ { opacity: 1, scale: 1 } }
              exit={ { opacity: 0, scale: 0.9 } }
              transition={ { duration: 0.25 } }
              className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:shadow-[0_10px_30px_-15px_rgba(217,70,239,0.3)] flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 flex-wrap">
                  { post.tags.map( tag => (
                    <button
                      type="button"
                      key={ tag }
                      onClick={ ( e ) => {
                        e.preventDefault();
                        setSelectedTag( tag );
                      } }
                      className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 bg-fuchsia-400/10 px-2 py-1 rounded border border-fuchsia-400/20 cursor-pointer hover:bg-fuchsia-400/20 transition-colors"
                    >
                      { tag }
                    </button>
                  ) ) }
                </div>
                <span className="text-xs text-slate-500 data-mono">{ post.readTime }</span>
              </div>

              <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-fuchsia-300 transition-colors">{ post.title }</h3>
              <p className="text-slate-400 text-sm grow leading-relaxed">{ post.excerpt }</p>

              <Link href={ `/artigos/psicologia-hs/${post.slug || 'a-ameaca-organica'}` }>
                <button className="mt-6 text-xs font-bold tracking-widest text-slate-300 uppercase self-start border-b border-fuchsia-500/0 group-hover:border-fuchsia-500/50 group-hover:text-white transition-all pb-1">
                  Acessar Protocolo &rarr;
                </button>
              </Link>
            </motion.article>
          ) ) }
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
