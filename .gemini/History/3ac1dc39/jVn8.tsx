/**
 * IDENTITY: Entendendo o ICM e suas Heurísticas
 * PATH: src/app/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx
 * ROLE: Artigo técnico sobre Risk Premium, Amortização de Edge e Downward Drift.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel, ContentFooter]
 */

import ContentFooter from '@/components/content/ContentFooter';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Entendendo o ICM e suas Heurísticas | Poker Racional',
  description: 'Aprofundamento em Risk Premium, Downward Drift e a Perspectiva Matemática aplicada ao pós-flop.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Entendendo o ICM e suas Heurísticas',
  description: 'Uma desconstrução da Perspectiva Matemática: como o Risk Premium e o Downward Drift organizam o equilíbrio pós-flop.',
  author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function EntendendoIcmPage () {
  const articleUrl = "https://www.pokerracional.com/biblioteca/entendendo-o-icm-e-suas-heuristicas";
  const articleTitle = "Entendendo o ICM e suas Heurísticas | Poker Racional";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ articleSchema } />

      {/* Header Central de Página */ }
      <div className="max-w-300 mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
              Entendendo o ICM
            </h1>
            <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
              A Perspectiva Matemática: Risk Premium, Amortização de Edge e Downward Drift. A física do jogo sob pressão monetária.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Teoria Fundamental
              </span>
              <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                Exegese Matemática
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
        title="Antevisão e a Fronteira do Edge"
        description="A vantagem competitiva migrou para o ICM pós-flop e para a capacidade de projetar o fluxo sistêmico."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <blockquote className="border-l-4 border-accent-indigo pl-6 italic text-text-bright my-8">
              &quot;Aprenda como interpretar o RP e de que maneira podemos usá-lo a nosso favor pós-flop através da Perspectiva Matemática.&quot;
            </blockquote>
            <p>
              Tabelas de push/fold são commodities. A verdadeira vantagem estratégica reside na <strong className="text-text-bright">Antevisão</strong>: a habilidade de olhar para uma mesa e ver o &quot;campo de força&quot; do Risk Premium antes das cartas serem distribuídas.
            </p>
            <h4 className="text-text-main font-heading mt-10 mb-4">Variáveis Sistêmicas:</h4>
            <ul className="space-y-3 list-none pl-0">
              <li className="flex items-start gap-3"><i className="fa-solid fa-circle-nodes text-accent-indigo mt-1.5 text-xs" /> <span><strong className="text-text-bright">Erosão Antecipada (t-3):</strong> Como saltos de blinds degradam o valor do fold presente.</span></li>
              <li className="flex items-start gap-3"><i className="fa-solid fa-circle-nodes text-accent-indigo mt-1.5 text-xs" /> <span><strong className="text-text-bright">Vizinhança Estratégica:</strong> O impacto do perfil das stacks à sua esquerda.</span></li>
              <li className="flex items-start gap-3"><i className="fa-solid fa-circle-nodes text-accent-indigo mt-1.5 text-xs" /> <span><strong className="text-text-bright">Antipoiese do Sistema:</strong> O torneio como organismo que se auto-organiza em torno das colisões.</span></li>
            </ul>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="02"
        label="Motor"
        title="O Teto do Risk Premium"
        description="Representa a equity adicional necessária para justificar o risco existencial de um confronto."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <div className="bg-bg-elevated/50 border border-accent-rose/20 p-8 my-10 rounded-2xl">
              <h4 className="mt-0 text-accent-rose font-bold text-lg mb-4 font-heading">Âncora de Vitoi (24% RP)</h4>
              <p className="m-0 leading-relaxed text-sm">
                Acima de <strong className="text-text-bright">24% de Risk Premium</strong>, a MDF (Minimum Defense Frequency) do defensor colapsa. Ele entra em estado de <strong className="text-text-bright text-shadow-glow">Impotência Teórica</strong>: o agressor pode blefar com frequências &quot;absurdas&quot; e o fold ainda assim permanece como a única decisão Nash-equilibrada.
              </p>
            </div>

            <h3 className="text-text-bright font-heading mt-12 mb-6">Toy Games: Visualizando a Distorção</h3>
            <figure className="my-10 group">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png"
                  alt="Toy Game 1 - Chip EV"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <figcaption className="text-center text-xs text-text-dim mt-4 uppercase tracking-[0.1em] font-mono">
                Toy Game 1: Equilíbrio estável em ChipEV (Vácuo Matemático)
              </figcaption>
            </figure>

            <figure className="my-10 group">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-accent-rose/30 shadow-[0_0_30px_rgba(225,29,72,0.1)]">
                <Image
                  src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image6.png"
                  alt="Toy Game 5 - O Colapso da MDF"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <figcaption className="text-center text-xs text-accent-rose-light mt-4 uppercase tracking-[0.1em] font-mono font-bold">
                Toy Game 5: Colapso total da defesa sob RP 24% (Opressão Nash)
              </figcaption>
            </figure>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="03"
        label="Heurística"
        title="Downward Drift e Insolvência"
        description="As Pot Odds são métricas de baixa resolução. O Ci revela quando odds 'boas' são destrutivas."
      />
      <div className="max-w-300 mx-auto px-6 pb-24">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>O <strong className="text-text-bright">Downward Drift</strong> (O&apos;Kearney & Carter) é a manifestação física do RP nos sizings: a distribuição inteira de apostas desloca um degrau para baixo. Overbets desaparecem; 2/3 vira 1/3; 1/3 vira check.</p>

            <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading italic">Coeficiente de Insolvência (Ci)</h4>
              <p className="font-mono text-sm text-accent-emerald-light mb-4">Ci = Perspectiva / Pot_Odds</p>
              <p className="text-text-main m-0 leading-relaxed text-sm">
                Se <strong className="text-text-bright">Ci &lt; 1</strong>, as pot odds são mentirosas. Elas incentivam a entrada em potes cujas Reverse Implied Odds (RIO) e pressões de ICM tornam o investimento insolvente no longo prazo.
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
