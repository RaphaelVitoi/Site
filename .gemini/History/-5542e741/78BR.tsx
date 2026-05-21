
/**
 * IDENTITY: Pilar Técnico - O Motor de Diluição (SPR Physics)
 * PATH: src/app/biblioteca/motor-diluicao/page.tsx
 * ROLE: Explicar a dissipação do Risk Premium conforme o dinheiro entra no pote.
 * PRINCIPLE: Simetria & Rigor Matemático.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'O Motor de Diluição | Raphael Vitoi',
  description: 'Como o Risk Premium se dissipa conforme o SPR decresce. A física do ICM aplicada por street.',
};

export default function MotorDiluicaoPage() {
  const pageUrl = "https://www.pokerracional.com/biblioteca/motor-diluicao";
  const pageTitle = "O Motor de Diluição: A Física do SPR";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <JsonLd data={ { '@context': 'https://schema.org', '@type': 'TechArticle', headline: pageTitle } } />

      <ContentPageHeader
        title="Motor de Diluição"
        subtitle="A dissipação progressiva do risco existencial conforme a árvore de decisão colapsa."
        category="Mecânica"
        icon="fa-water"
      />

      <SectionHeader
        step="01"
        label="Conceito"
        title="O Axioma da Dissipação"
        description="O ICM não é estático. Sua magnitude é uma função inversa do comprometimento do pote."
      />

      <div className="sota-container mb-24">
        <GlassPanel className="p-8 md:p-16 border-white/5">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p className="text-xl">O erro sistêmico do jogador comum é carregar a paralisia do ICM para o River. O <strong className="text-text-bright">Motor de Diluição</strong> prova que, conforme o SPR cai, a capacidade do ICM de distorcer as pot odds evapora.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-16">
              { [
                { street: 'PRÉ-FLOP', spr: 'SPR ∞', rp: '100%', status: 'Foco: Sobrevivência', color: 'bg-accent-rose' },
                { street: 'FLOP / TURN', spr: 'SPR 2-6', rp: '≈60%', status: 'Foco: Amortização', color: 'bg-accent-indigo' },
                { street: 'RIVER', spr: 'SPR < 1', rp: '<10%', status: 'Foco: Equidade Bruta', color: 'bg-accent-emerald' }
              ].map( ( s, i ) => (
                <div key={ i } className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden group">
                  <div className={ `absolute top-0 right-0 w-32 h-32 ${s.color} opacity-5 blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity` } />
                  <span className="text-[0.5rem] font-black text-text-darker uppercase tracking-[0.3em] mb-2 block">{ s.street }</span>
                  <h4 className="text-2xl font-black text-text-bright mb-4">{ s.spr }</h4>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5">
                      <div className={ `h-full rounded-full ${s.color}` } style={ { width: s.rp } } />
                    </div>
                    <span className="text-xs font-mono font-bold text-text-bright">{ s.rp } RP</span>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-text-dim">{ s.status }</p>
                </div>
              ) ) }
            </div>

            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading mb-8 mt-24 border-l-4 border-accent-indigo pl-6">
              2. A Transferência de Alavancagem
            </h2>
            <p>Conforme as fichas saem do seu stack e entram no centro da mesa, o seu <strong>Valuation</strong> aumenta. O River é a zona de libertação: com um SPR de 0.5, o custo existencial já foi amortizado e a decisão converge para o equilíbrio de ChipEV.</p>

            <blockquote className="text-2xl font-light italic text-text-bright border-l-2 border-accent-indigo/30 pl-10 py-4 my-16">
              &quot;Quem tem medo de ICM no River está, na verdade, cego para a diluição do risco. A maestria exige saber quando parar de proteger e começar a realizar.&quot;
            </blockquote>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container">
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
