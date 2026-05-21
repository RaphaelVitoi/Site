/**
 * IDENTITY: O Paradoxo do Valuation no ICM
 * PATH: src/app/biblioteca/paradoxo-valuation/page.tsx
 * ROLE: Artigo técnico sobre a não-linearidade da utilidade de fichas.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel, ContentFooter]
 */

import ContentFooter from '@/components/content/ContentFooter';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'O Paradoxo do Valuation no ICM | Raphael Vitoi',
  description: 'Por que acumular fichas pode diminuir sua esperança matemática em spots específicos da reta final. A física do Valuation.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'O Paradoxo do Valuation no ICM',
  description: 'Uma análise sobre a não-linearidade da conversão entre fichas e equity monetária em torneios de poker.',
  author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function ParadoxoValuationPage () {
  const articleUrl = "https://www.pokerracional.com/biblioteca/paradoxo-valuation";
  const articleTitle = "O Paradoxo do Valuation no ICM | Raphael Vitoi";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ articleSchema } />

      {/* Header Central de Página */ }
      <div className="max-w-300 mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
              Paradoxo do Valuation
            </h1>
            <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
              A não-linearidade da utilidade de chips no ICM. Por que acumular fichas pode ser matematicamente contraproducente.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Teoria do Valor
              </span>
              <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                Utilidade Marginal
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Link href="/biblioteca" className="px-4 py-2 rounded-xl bg-bg-elevated/40 border border-white/5 text-text-muted text-[0.75rem] font-bold flex items-center gap-2 transition-all hover:text-text-bright hover:bg-bg-elevated">
              <i className="fa-solid fa-arrow-left text-[0.7rem]" /> BIBLIOTECA
            </Link>
          </div>
        </div>
      </div>

      <SectionHeader
        step="01"
        label="Paradoxo"
        title="A Ilusão das Fichas"
        description="Chamar um all-in com equidade positiva em ChipEV pode ser a decisão correta de perder dinheiro real."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>O paradoxo central do ICM é este: <strong className="text-text-bright">em determinados spots de mesa final, um call com EV de fichas positivo é um erro de valor monetário.</strong></p>
            <p>Isto ocorre devido à <strong className="text-text-bright">Utilidade Não-Linear de Fichas</strong>. No ChipEV, cada ficha vale o mesmo. No ICM, a centésima ficha que você ganha vale menos que a primeira ficha da sua stack (sua vida no torneio).</p>

            <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">A Matemática da Dor</h4>
              <p className="text-text-main m-0 leading-relaxed text-sm">
                Dobrar as fichas de 33% para 67% da mesa não dobra sua equity. Em um payout padrão, sua equity monetária move de <strong className="text-text-bright">33.3% para ~52.5%</strong>. Você ganhou 34% das fichas, mas apenas 19% de valor real. A assimetria é o motor do Risk Premium.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="02"
        label="Dinâmica"
        title="O Chip Leader como Vítima"
        description="Quem possui mais fichas carrega, paradoxalmente, o maior custo de oportunidade em cada confronto."
      />
      <div className="max-w-300 mx-auto px-6 pb-24">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>O Chip Leader é quem mais sofre com o paradoxo do valuation. Cada ficha perdida reduz sua equity de forma convexamente custosa, enquanto cada ficha ganha tem utilidade marginal decrescente. Ele deve jogar mais passivo contra outras stacks grandes, não por medo, mas por <strong className="text-text-bright">imposição matemática</strong>.</p>

            <div className="verdict-box mt-12">
              <p className="font-mono text-[0.7rem] text-accent-indigo-light uppercase tracking-[0.2em] mb-4 text-center">Síntese Ontológica</p>
              <p className="text-xl text-text-bright text-center italic font-light leading-relaxed">
                &quot;Acumular fichas é o instrumento; realizar Perspectiva Matemática é o objetivo.&quot;
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="max-w-300 mx-auto px-6 pb-12">
        <ContentFooter
          shareTitle={ articleTitle }
          shareUrl={ articleUrl }
          backLinkHref="/biblioteca"
          backLinkText="Voltar para Biblioteca"
        />
      </div>
    </div>
  );
}
