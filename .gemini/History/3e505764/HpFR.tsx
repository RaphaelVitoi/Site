
/**
 * IDENTITY: O Manifesto (Raphael Vitoi)
 * PATH: src/app/quem-sou/page.tsx
 * ROLE: Manifesto filosófico e institucional do autor.
 * PRINCIPLE: Autoridade & Sofisticação Epistêmica.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'O Manifesto | Raphael Vitoi',
  description: 'Educador, Estrategista e Especialista em Sistemas Complexos. A mente por trás da catedral cibernética do PokerRacional.',
};

const authorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Raphael Vitoi',
  jobTitle: 'Arquiteto de Sistemas Estratégicos',
  description: 'Educador e Profissional de Poker, criador do paradigma da Perspectiva Matemática.',
  sameAs: [
    'https://www.instagram.com/raphaelvitoi/',
    'https://www.twitch.tv/RaphaelVitoiPoker',
    'https://www.youtube.com/@RaphaelVitoiPoker'
  ]
};

export default function QuemSouPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <JsonLd data={ authorSchema } />

      <ContentPageHeader
        title="O Manifesto"
        subtitle="Educador, Estrategista e Especialista em Sistemas Complexos. A mente por trás da arquitetura Nexus."
        category="Identidade"
        icon="fa-fingerprint"
      />

      <div className="sota-container pb-12">
        <GlassPanel className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 p-8 sm:p-12 items-center border-accent-indigo/10">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black group shadow-2xl shadow-indigo-900/20">
            <video autoPlay muted playsInline loop preload="metadata" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-1000">
              <source src="/0309.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading">Raphael Vitoi</h2>
            <p className="text-lg text-text-muted leading-relaxed font-medium">
              Profissional há mais de uma década, minha missão é decodificar a <strong className="text-text-bright">Geometria do Risco</strong> para jogadores que buscam o topo da cadeia estratégica.
            </p>
            <div className="flex flex-wrap gap-2">
              { ['Sistemas Complexos', 'Teoria dos Jogos', 'Análise Recursiva'].map( tag => (
                <span key={ tag } className="px-3 py-1 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.55rem] font-black text-accent-indigo-light uppercase tracking-widest">{ tag }</span>
              ) ) }
            </div>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="FIL"
        label="Doutrina"
        title="A Gestão Elegante da Incerteza"
        description="O poker não é sobre cartas. É sobre a arquitetura da decisão sob pressão absoluta."
      />

      <div className="sota-container pb-24">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>Minha abordagem transita entre a <strong className="text-text-bright">Análise Bayesiana e a Fenomenologia da Incerteza</strong>. Acredito que a maestria estratégica reside na capacidade de ver o invisível: o campo de força do Risk Premium que governa cada ação.</p>

            <blockquote className="text-3xl font-light italic text-text-bright border-l-2 border-accent-indigo/30 pl-10 py-4 my-16 font-heading tracking-tight leading-snug">
              &quot;O poker não é sobre sorte. É sobre a gestão elegante da incerteza e a precisão tática de evitar colisões onde sua edge é amortizada.&quot;
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
              { [
                { title: 'Deepsolver', label: 'Embaixador', link: 'https://deepsolver.com' },
                { title: 'GTO Wizard', label: 'Afiliado', link: 'https://gtowizard.com' },
                { title: 'trueICM', label: 'Criador', link: 'https://trueicm.com' }
              ].map( p => (
                <a key={ p.title } href={ p.link } target="_blank" rel="noopener" className="p-6 rounded-2xl bg-white/3 border border-white/5 hover:border-accent-indigo/30 hover:bg-white/5 transition-all text-center group">
                  <span className="text-[0.5rem] font-black text-text-darker uppercase tracking-[0.2em] mb-2 block group-hover:text-accent-indigo transition-colors">{ p.label }</span>
                  <strong className="text-lg font-black text-text-bright uppercase tracking-tighter">{ p.title }</strong>
                </a>
              ) ) }
            </div>

            <div className="mt-24 pt-12 border-t border-white/5 text-center">
              <Link href="/#metodo" className="btn-primary pulse-glow px-12 py-5 text-lg font-black tracking-widest rounded-2xl">
                RETORNAR AO NEXUS <i className="fa-solid fa-house ml-3" />
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
