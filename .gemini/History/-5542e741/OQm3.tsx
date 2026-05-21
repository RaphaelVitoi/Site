/**
 * IDENTITY: O Motor de Diluição (Dissipação de Risco)
 * PATH: src/app/biblioteca/motor-diluicao/page.tsx
 * ROLE: Artigo técnico sobre a dinâmica do Risk Premium conforme o SPR decresce.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel, ContentFooter]
 */

import ContentFooter from '@/components/content/ContentFooter';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'O Motor de Diluição | Raphael Vitoi',
  description: 'Como o Risk Premium afeta os ranges de call de forma não-linear através das streets. A física do SPR no ICM.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'O Motor de Diluição: Dissipação de Risk Premium por Street',
  description: 'Uma análise sobre como o decréscimo do SPR ao longo das ruas dilui a pressão do ICM sobre a tomada de decisão.',
  author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function MotorDiluicaoPage () {
  const articleUrl = "https://www.pokerracional.com/biblioteca/motor-diluicao";
  const articleTitle = "O Motor de Diluição | Raphael Vitoi";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ articleSchema } />

      {/* Header Central de Página */ }
      <div className="max-w-300 mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
              O Motor de Diluição
            </h1>
            <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
              A dissipação progressiva do Risk Premium conforme o SPR decresce. Como o ICM perde força do flop ao river.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                { ' ' }Dinâmica de Streets
              </span>
              <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                Física do SPR
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
        label="Fundação"
        title="A Pressão Dinâmica"
        description="O ICM não é um interruptor on/off. Sua magnitude é uma função decrescente do SPR restante."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>O Risk Premium não é uma constante. Ele se manifesta com força total no <strong className="text-text-bright">pré-flop</strong> (SPR máximo) e se dissipa conforme fichas são movidas para o centro do pote. O que chamamos de <strong className="text-text-bright">Motor de Diluição</strong> é o mecanismo que explica por que o river em ICM se joga quase como ChipEV.</p>

            <div className="bg-accent-indigo/10 border-l-4 border-accent-indigo p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-indigo-light font-bold text-lg mb-4 font-heading">Axioma da Diluição</h4>
              <p className="text-text-main m-0 leading-relaxed text-sm">
                Quanto menor o SPR, menor a capacidade do ICM de distorcer as pot odds. No river, com SPR de 0.5, o custo existencial já foi pago ou diluído no pote. O erro sistêmico do jogador comum é ter &quot;medo de ICM&quot; no river quando a matemática já o liberou para o equilíbrio de ChipEV.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="02"
        label="Heurística"
        title="O SPR Pipeline"
        description="A curva de dissipação é convexa: a maior queda ocorre entre o pré-flop e o flop."
      />
      <div className="max-w-300 mx-auto px-6 pb-24">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>A street mais subestimada do ICM é o <strong className="text-text-bright">flop</strong>. Com SPRs típicos de 4 a 7, o defensor ainda carrega Risk Premium substancial. Uma c-bet ignorando essa inércia é um vazamento grave de valor. O turn é a zona de transição, e o river é a zona de libertação.</p>

            <div className="my-10 overflow-x-auto">
              <table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-text-bright uppercase text-[0.65rem] tracking-[0.15em] font-mono">
                    <th className="py-4 px-6">Street</th>
                    <th className="py-4 px-6">Driver Principal</th>
                    <th className="py-4 px-6">Estado do RP</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text-muted font-body">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-text-main font-bold">Pré-Flop</td>
                    <td className="py-4 px-6 text-accent-rose font-mono">ICM Puro</td>
                    <td className="py-4 px-6">Máximo (100%)</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-text-main font-bold">Flop</td>
                    <td className="py-4 px-6 text-accent-emerald font-mono">ICM + Realização</td>
                    <td className="py-4 px-6">Significativo (~60%)</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-text-main font-bold">River</td>
                    <td className="py-4 px-6 text-accent-indigo-light font-mono">ChipEV</td>
                    <td className="py-4 px-6">Residual (&lt;10%)</td>
                  </tr>
                </tbody>
              </table>
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
