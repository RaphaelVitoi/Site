/**
 * IDENTITY: Psicologia High Stakes (Exegese da Incerteza)
 * PATH: src/app/artigos/psicologia-hs/page.tsx
 * ROLE: Artigo completo sobre a fenomenologia do risco, vieses e heurísticas.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel, PsychologyHub]
 */

import ContentFooter from '@/components/content/ContentFooter';
import PsychologyHub, { SpecPost } from '@/components/content/PsychologyHub';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Psicologia High Stakes | Raphael Vitoi',
  description: 'Protocolo de Análise Psicológica para Mesas Finais de Poker. Fenomenologia da incerteza e exegese do risco sob pressão.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Psicologia High Stakes: A Fenomenologia da Incerteza',
  description: 'Uma investigação profunda sobre como o ICM e o Risk Premium distorcem a percepção humana e a tomada de decisão.',
  author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

const fallbackPosts: SpecPost[] = [
  {
    id: 'hermeneutica-blefe',
    slug: 'hermeneutica-blefe',
    title: 'Hermenêutica do Blefe',
    excerpt: 'Lendo as intenções do oponente através da lente do excesso de gozo e da psicanálise lacaniana.',
    readTime: '10 MIN',
    tags: ['Psicologia', 'Teoria'],
    href: '/biblioteca/hermeneutica-blefe',
  },
  {
    id: 'paradoxo-do-valuation',
    slug: 'paradoxo-do-valuation',
    title: 'O Paradoxo do Valuation no ICM',
    excerpt: 'Por que acumular fichas pode diminuir sua esperança matemática quando as dinâmicas de poder são ignoradas.',
    readTime: '12 MIN',
    tags: ['Teoria', 'ICM'],
    href: '/biblioteca/paradoxo-valuation',
  }
];

export default function PsicologiaHSPage() {
  const pageUrl = "https://www.pokerracional.com/artigos/psicologia-hs";
  const pageTitle = "Psicologia High Stakes | Raphael Vitoi";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ articleSchema } />

      {/* Header Central de Página */ }
      <div className="max-w-[1200px] mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-gradient-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
              Psicologia High Stakes
            </h1>
            <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-[580px]">
              A Fenomenologia da Incerteza. Exegese crítica das heurísticas de ICM, vieses cognitivos e a mecânica do colapso humano sob pressão.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                { ' ' }Hub Ativo
              </span>
              <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                Análise Comportamental
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
        label="Contexto"
        title="A Fenomenologia da Incerteza"
        description="Uma exegese crítica das heurísticas de ICM e da arquitetura de solvers em ambientes de informação imperfeita."
      />
      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>A estratégia de torneios multimesa (MTT) exige uma reavaliação radical do risco: o valor nominal das fichas é substituído por uma métrica de valor monetário extrínseco, definida pelo Independent Chip Model (ICM). Esta análise investiga as estruturas de decisão pós-flop contrastando as implementações algorítmicas do GTO Wizard e do Hold&apos;em Resources Calculator (HRC).</p>

            <h3 className="text-text-bright font-heading">A Divergência Arquitetônica: GTO Wizard vs HRC</h3>
            <p>O sistema HRC incorpora o impacto das cartas descartadas pelos jogadores que desistiram pré-flop (<strong className="text-text-bright">&quot;Bunching Effect&quot;</strong>), enquanto solvers tradicionais restringem a análise apenas aos competidores ativos. Essa distinção é vital para a precisão dos ranges em mesas finais.</p>

            <div className="my-10 overflow-x-auto">
              <table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-text-bright uppercase text-[0.65rem] tracking-[0.15em] font-mono">
                    <th className="py-4 px-6">Variável Analítica</th>
                    <th className="py-4 px-6">GTO Wizard (ChipEV)</th>
                    <th className="py-4 px-6">HRC (ICMev)</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text-muted font-body">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-text-main font-bold">Bunching Effect</td>
                    <td className="py-4 px-6">Restrito aos ativos</td>
                    <td className="py-4 px-6 text-accent-emerald font-mono">Global (Incluso)</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-text-main font-bold">Análise de Stacks</td>
                    <td className="py-4 px-6">Stack efetiva</td>
                    <td className="py-4 px-6 text-accent-emerald font-mono">Topologia Total</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-text-main font-bold">Heurística</td>
                    <td className="py-4 px-6">Equidade bruta</td>
                    <td className="py-4 px-6 text-accent-emerald font-mono">Risk Premium (RP)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="02"
        label="Fundamentos"
        title="Ontologia do Risk Premium"
        description="O limite superior de defesa onde o defensor é impedido de realizar sua equidade devido ao risco existencial."
      />
      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <h3 className="text-text-bright font-heading">O Teto do RP</h3>
            <p>O Risk Premium (RP) funciona como uma taxa de câmbio entre fichas e dinheiro real. O <strong className="text-text-bright">&quot;Teto do RP&quot;</strong> define o limite superior de defesa onde, independentemente da frequência de blefes do agressor, o defensor é impedido de realizar sua equidade devido ao risco existencial que o confronto impõe à sua stack.</p>

            <div className="bg-accent-indigo/10 border-l-4 border-accent-indigo p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-indigo-light font-bold text-lg mb-4 font-heading italic">Dialética dos Toy Games</h4>
              <p className="text-text-main leading-relaxed m-0">
                Em ChipEV, o defensor sustenta o equilíbrio defendendo 50% contra um pot-size bet. Sob ICM extremo (RP de 24%), o agressor pode blefar com frequências matematicamente &quot;erradas&quot; e ainda assim ser lucrativo, pois o custo da eliminação força o defensor a um <strong className="text-text-bright">overfold estrutural</strong>. Não é covardia; é Nash.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="03"
        label="Síntese"
        title="Heurísticas e Responsabilidade"
        description="A maestria reside na harmonia entre a frieza do código binário e a profundidade da reflexão humana."
      />
      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body text-center">
            <p className="text-2xl font-light leading-relaxed max-w-3xl mx-auto italic text-text-bright">
              &quot;O Chip Leader não briga por fichas; ele briga por Perspectiva. Cada call descuidado que o Vice-Líder dobra é uma transferência de alavancagem futura.&quot;
            </p>
            <p className="mt-12 text-sm text-text-dim border-t border-white/5 pt-10 uppercase tracking-widest font-mono">
              O ICM é a lei gravitacional que curva a estratégia estratégica.
            </p>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="04"
        label="Acervo"
        title="Protocolos Psicológicos"
        description="Mergulhe nas anomalias cognitivas que distorcem a matemática pura."
      />
      <div className="max-w-[1200px] mx-auto px-6 pb-24">
        <PsychologyHub posts={ fallbackPosts } />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <ContentFooter
          shareTitle={ pageTitle }
          shareUrl={ pageUrl }
          backLinkHref="/biblioteca"
          backLinkText="Voltar para Biblioteca"
        />
      </div>
    </div>
  );
}
