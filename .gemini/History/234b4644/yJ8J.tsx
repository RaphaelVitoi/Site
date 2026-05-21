/**
 * IDENTITY: Rota da Biblioteca Epistêmica
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Exibir o acervo de literatura recomendada (Filosofia, Psicologia, Existencialismo) com a estética do ecossistema.
 * BINDING: [src/app/layout.tsx, globals.css]
 * TELEOLOGY: Tornar-se um repositório interativo onde cada livro possa futuramente ter um link para resenhas, anotações e fichamentos estruturados por Raphael.
 */

import React from 'react';

export const metadata = {
    title: 'Biblioteca Epistêmica | Raphael Vitoi',
    description: 'Acervo de Filosofia, Psicologia e Existencialismo para suportar a incerteza.',
};

const books = [
  {
    id: '1',
    title: 'O Mito de Sísifo',
    author: 'Albert Camus',
    category: 'Existencialismo',
    year: '1942',
    description: 'A revolta contra o absurdo. A base filosófica para suportar os downswings inevitáveis e encontrar significado na variância implacável.',
  },
  {
    id: '2',
    title: 'Rápido e Devagar',
    author: 'Daniel Kahneman',
    category: 'Psicologia',
    year: '2011',
    description: 'Os dois sistemas da mente. Essencial para entender a falha da intuição na presença do Risk Premium e do estresse em mesas finais.',
  },
  {
    id: '3',
    title: 'Assim Falou Zaratustra',
    author: 'Friedrich Nietzsche',
    category: 'Filosofia',
    year: '1883',
    description: 'A superação de si mesmo e a transvaloração dos valores, análogo à busca incessante pela aniquilação do ego no processo de aprendizagem.',
  }
];

export default function BibliotecaPage() {
  return (
    <main className="container mx-auto px-4" style={{ padding: '4rem 0' }}>
        <section className="text-center mb-16 animate-fade-up">
            <span className="block font-mono text-xs text-slate-400 tracking-widest uppercase mb-4">Acervo Fundamental</span>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight text-white">
                Biblioteca Epistêmica
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light italic">
                A fundação teórica que sustenta a mente. Onde a Filosofia, Psicologia e Existencialismo se encontram para formar uma armadura cognitiva.
            </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {books.map((book) => (
            <article key={book.id} className="glass-panel p-8 transition-all duration-300 hover:-translate-y-2 hover:border-slate-500/30 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-600/50 shadow-inner">
                  {book.category}
                </span>
                <span className="text-xs text-slate-500 data-mono">{book.year}</span>
              </div>
              
              <h3 className="text-2xl font-heading font-bold text-white mb-2 group-hover:text-slate-200 transition-colors">{book.title}</h3>
              <p className="text-sm font-mono text-slate-400 mb-6 pb-4 border-b border-white/5">{book.author}</p>
              
              <p className="text-slate-400 text-sm flex-grow leading-relaxed">{book.description}</p>
            </article>
          ))}
        </div>
    </main>
  );
}