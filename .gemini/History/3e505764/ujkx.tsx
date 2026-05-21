/**
 * IDENTITY: O Manifesto (Identidade do Autor)
 * PATH: src/app/quem-sou/page.tsx
 * ROLE: Apresentar Raphael Vitoi — bio, visão estratégica, manifesto e parcerias.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel]
 */

import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Quem é Raphael Vitoi | O Manifesto',
  description: 'Educador, Estrategista e Especialista em Sistemas Complexos. Decodificando a Nova Fronteira do Poker e a Perspectiva Matemática.',
};

const authorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Raphael Vitoi',
  jobTitle: 'Estrategista de Poker e Especialista em Sistemas Complexos',
  description: 'Educador e Profissional de Poker há mais de dez anos, criador do framework Perspectiva Matemática.',
  sameAs: [
    'https://www.instagram.com/raphaelvitoi/',
    'https://www.twitch.tv/RaphaelVitoiPoker',
    'https://www.youtube.com/@RaphaelVitoiPoker'
  ]
};

export default function QuemSouPage () {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ authorSchema } />

      {/* Header Central de Página */ }
      <div className="max-w-300 mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
              O Manifesto
            </h1>
            <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
              Educador, Estrategista, Profissional de Poker e Especialista em Sistemas Complexos. A mente por trás da Catedral Cibernética.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Identidade SOTA
              </span>
              <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                Exegese do Autor
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Link href="/" className="px-4 py-2 rounded-xl bg-bg-elevated/40 border border-white/5 text-text-muted text-[0.75rem] font-bold flex items-center gap-2 transition-all hover:text-text-bright hover:bg-bg-elevated">
              <i className="fa-solid fa-arrow-left text-[0.7rem]" /> VOLTAR AO NEXUS
            </Link>
          </div>
        </div>
      </div>

      {/* Video Section */ }
      <SectionHeader
        step="01"
        label="Apresentação"
        title="Raphael Vitoi"
        description="Educador e Profissional de Poker há mais de dez anos, decodificando a complexidade dos sistemas para jogadores que buscam o topo da cadeia alimentar."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="aspect-video relative overflow-hidden bg-black group">
          <video controls autoPlay muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700">
            <source src="/0309.mp4" type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
        </GlassPanel>
      </div>

      {/* Filosofia e Visão */ }
      <SectionHeader
        step="02"
        label="Filosofia"
        title="Sistemas Complexos e Teoria dos Jogos"
        description="A abordagem transita entre a Análise Bayesiana, Preditiva e Recursiva, focando na adaptação estratégica e exegese comportamental."
      />
      <div className="max-w-300 mx-auto px-6 pb-24">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>Educador e Profissional de Poker há mais de dez anos, Raphael Vitoi é um especialista em <strong className="text-text-bright">Sistemas Complexos, ICM, Multiway Spots e Teoria dos Jogos</strong>. Sua abordagem transita entre a <strong className="text-text-bright">Análise Bayesiana, Preditiva e Recursiva</strong>, focando na adaptação estratégica e análise comportamental (GTO e desvio).</p>
            <p>Além das mesas, mergulha na <strong className="text-text-bright">Psicologia do Poker</strong>, dissecando os vieses cognitivos que custam dinheiro.</p>

            <div className="bg-accent-indigo/10 border-l-4 border-accent-indigo p-8 my-10 rounded-r-2xl">
              <p className="m-0 text-text-main leading-relaxed">
                <strong className="text-accent-indigo-light uppercase tracking-widest text-sm block mb-2 font-heading">Polimata e Estrategista</strong>
                Raphael não ensina apenas &quot;cartas&quot;; ele ensina arquitetura de decisão. Como <strong className="text-text-bright">Embaixador Deepsolver</strong>, <strong className="text-text-bright">Afiliado GTO Wizard</strong> e criador do <strong className="text-text-bright">trueICM</strong>, ele decodifica a complexidade dos sistemas para jogadores que buscam o topo da cadeia alimentar.
              </p>
            </div>

            <p className="italic text-2xl text-center my-12 text-text-bright border-y border-white/5 py-10 font-heading tracking-tight">
              &quot;O poker não é sobre sorte. É sobre a gestão elegante da incerteza.&quot;
            </p>

            <div className="flex flex-wrap gap-4 justify-center mt-12">
              <a href="https://deepsolver.com" target="_blank" rel="noopener" className="badge-link-primary badge-link px-6 py-3 text-sm">Embaixador Deepsolver</a>
              <a href="https://gtowizard.com" target="_blank" rel="noopener" className="badge-link-emerald badge-link px-6 py-3 text-sm">Afiliado GTO Wizard</a>
              <a href="https://trueicm.com" target="_blank" rel="noopener" className="badge-link-secondary badge-link px-6 py-3 text-sm">Criador trueICM.com</a>
            </div>

            <div className="mt-20 text-center">
              <Link href="/#metodo" className="btn-primary pulse-glow px-12 py-5 text-lg font-black tracking-widest rounded-2xl">
                CONHECER O MÉTODO <i className="fa-solid fa-arrow-right ml-3" />
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
