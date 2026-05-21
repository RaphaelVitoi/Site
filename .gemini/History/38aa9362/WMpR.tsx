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
    definition: 'O outcome definitivo de decisão. Transcende o ChipEV e o ICMev. Incorpora o Risk Premium, a Realização de Equidade (Fator R), o Custo Afundado e a Antevisão (FGS). É a régua absoluta de viabilidade de uma ação.',
    icon: 'fa-eye'
  },
  {
    term: 'Risk Premium (RP)',
    definition: 'A taxa de aversão ao risco imposta pelo Independent Chip Model. Representa a equidade adicional (acima das pot odds) exigida para justificar uma colisão letal.',
    icon: 'fa-percent'
  },
  {
    term: 'Downward Drift',
    definition: 'O fenômeno gravitacional da aposta sob pressão monetária. Com o aumento do Risk Premium, os sizings ótimos do GTO contraem-se (ex: overbets desaparecem, dando lugar a B20 ou checks).',
    icon: 'fa-arrow-trend-down'
  },
  {
    term: 'Axioma Lipe Piv (Fator Ψ)',
    definition: 'O filtro de entropia humana. A Regressão Bayesiana que subjuga a equidade teórica de um call quando a taxa de "Maluquice" (tilt/bluff incorreto) do oponente excede a probabilidade estatística do nuts real.',
    icon: 'fa-brain'
  },
  {
    term: 'Reverse Implied Odds (RIO)',
    definition: 'O Passivo Estrutural. O custo oculto de acertar a mão, mas ainda assim perder um pote gigante. Em cenários multiway, as RIO escalonam quadraticamente, destruindo a ilusão das Pot Odds.',
    icon: 'fa-link-slash'
  },
  {
    term: 'Bubble Factor (BF)',
    definition: 'Multiplicador de dor. A relação de câmbio assimétrica entre fichas perdidas e fichas ganhas. Se o BF = 2, perder fichas custa o dobro da utilidade de ganhá-las.',
    icon: 'fa-bomb'
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
        />
      </div>
    </div>
  );
}
