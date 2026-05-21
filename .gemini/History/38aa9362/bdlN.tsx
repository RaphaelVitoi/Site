/**
 * IDENTITY: Glossário Formal SOTA (Conceitos ICM)
 * PATH: src/app/aulas/conceitos-icm/page.tsx
 * ROLE: Dicionário terminológico e epistemológico do Framework VITOI.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Glossário ICM SOTA | Raphael Vitoi',
  description: 'Dicionário formal do paradigma VITOI: Risk Premium, Bubble Factor, Downward Drift e Perspectiva Matemática.',
};

const GLOSSARY_TERMS = [
  {
    term: 'Perspectiva Matemática (PM)',
    definition: 'A síntese final de rigor absoluto. Transcende o ChipEV e o ICMev ao integrar a Hierarquia de 4 Camadas: Snapshot, Lógica, Predição e Fluxo Sistêmico. É a bússola que dita a ação ótima dentro do dinamismo do torneio.',
    icon: 'fa-eye'
  },
  {
    term: 'Teto de Nash (41%)',
    definition: 'O horizonte de eventos da agressão. Prova matemática de que, sob pressão standard de ICM no River, é estruturalmente impossível necessitar de mais do que ~41% de equidade para um call. Acima disso, o sistema colapsa.',
    icon: 'fa-shield-halved'
  },
  {
    term: 'Coeficiente de Insolvência (Ci)',
    definition: 'Razão entre a Perspectiva Matemática e as Pot Odds. Se Ci < 1, as Reverse Implied Odds (RIO) tornam o investimento imediato uma dívida estratégica impagável, revelando a falácia do "preço barato".',
    icon: 'fa-scale-unbalanced'
  },
  {
    term: 'Erosão de Órbita (FGS t-3)',
    definition: 'A gravidade temporal da mesa. Antecipa o salto de blinds e a posição futura do jogador (ex: UTG caminhando para o BB). Obriga a agressividade para comprar mãos baratas antes da inflação de custo de vida.',
    icon: 'fa-clock-rotate-left'
  },
  {
    term: 'Vantagem de Risco (Risk Advantage)',
    definition: 'A diferença entre os Risk Premiums dos envolvidos. Mede a proporção de agressividade permitida. O Chip Leader usa sua vantagem para negar a perspectiva alheia, não apenas para acumular fichas.',
    icon: 'fa-bolt-lightning'
  },
  {
    term: 'Risk Premium (RP)',
    definition: 'A taxa de aversão ao risco imposta pelo ICM. No pós-flop, o RP entra em diluição conforme o pote cresce e o custo do fold (Sunk Cost) supera o risco de eliminação.',
    icon: 'fa-percent'
  }
];

export default function ConceitosIcmPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <JsonLd data={ {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Glossário ICM SOTA',
        author: { '@type': 'Person', name: 'Raphael Vitoi' }
      } } />

      <ContentPageHeader
        title="Dicionário Epistêmico SOTA"
        subtitle="A taxonomia do Poker Profissional. O vocabulário exato para ler, interpretar e subjugar o ecossistema GTO."
        category="Documentação Oficial"
        icon="fa-spell-check"
      />

      <SectionHeader
        step="01"
        label="Ontologia"
        title="A Linguagem da Complexidade"
        description="Sem o rigor na nomenclatura, a análise bayesiana colapsa em achismo. Estes são os vetores do Paradigma."
      />

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          { GLOSSARY_TERMS.map( ( item, idx ) => (
            <GlassPanel key={ idx } className="p-8 border-white/5 hover:border-accent-indigo/30 transition-all group flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo-light text-xl shrink-0 group-hover:scale-110 transition-transform">
                  <i className={ `fa-solid ${item.icon}` } />
                </div>
                <h3 className="text-xl font-heading font-black text-text-bright uppercase tracking-tighter m-0">
                  { item.term }
                </h3>
              </div>
              <p className="text-text-muted leading-relaxed text-sm flex-1">
                { item.definition }
              </p>
            </GlassPanel>
          ) ) }
        </div>
      </div>

      <div className="sota-container pb-12">
        <GlassPanel className="p-12 text-center bg-bg-elevated/40">
          <h3 className="text-2xl font-black font-heading text-text-bright mb-4">Mente Sincronizada?</h3>
          <p className="text-text-muted mb-8 max-w-2xl mx-auto">
            Agora que a linguagem SOTA está clara, o próximo passo é aplicá-la diretamente no Motor Mestre.
          </p>
          <a href="/simulador" className="btn-primary px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2 pulse-glow">
            Acessar Simulador Quântico <i className="fa-solid fa-atom" />
          </a>
        </GlassPanel>
      </div>

      <div className="sota-container">
        <ContentFooter
          shareTitle="Glossário ICM SOTA | Raphael Vitoi"
          shareUrl="https://www.pokerracional.com/aulas/conceitos-icm"
          backLinkHref="/"
          backLinkText="Voltar para a Home"
        />
      </div>
    </div>
  );
}
