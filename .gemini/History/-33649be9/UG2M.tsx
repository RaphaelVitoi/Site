/**
 * IDENTITY: O Paradoxo do Valuation (Artigo Profundo)
 * PATH: src/app/biblioteca/paradoxo-valuation/page.tsx
 * ROLE: Aprofundar o Arquétipo II (Mid vs Big) e a assimetria utilitária do ICM.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'O Paradoxo do Valuation | Raphael Vitoi',
  description: 'Por que o BTN arrisca a vida enquanto o BB arrisca apenas o lucro. O colapso da equidade no Mid vs Big.',
};

export default function ParadoxoValuationPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="O Paradoxo do Valuation"
        subtitle="O descompasso estrutural entre o Mid Stack agressivo e o Big Stack blindado pelo Câmbio de Fichas."
        category="Ensaio Epistêmico"
        icon="fa-scale-unbalanced"
      />

      <SectionHeader
        step="I"
        label="Teoria"
        title="A Assimetria do Câmbio"
        description="O mesmo pote de 10bb representa valores fiduciários ($EV) drasticamente diferentes para os envolvidos."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>No vácuo (ChipEV), quando o BTN (40bb) empurra todas as fichas e o BB (60bb) paga, ambos apostaram 40bb. Matematicamente, a transação parece perfeitamente simétrica.</p>
            <p>A lente da <strong className="text-accent-rose">Perspectiva Matemática</strong> expõe a fratura dessa premissa: o BTN apostou a sua <strong>existência na mesa</strong>. O BB apostou <strong>a sua gordura operacional</strong>.</p>

            <div className="bg-accent-rose/5 border-l-4 border-accent-rose p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-rose-light font-bold text-lg mb-4 font-heading italic">O Câmbio Desleal</h4>
              <p className="text-text-main leading-relaxed m-0 text-sm">
                O Risk Premium do BTN (ida) pode ser de 22%, enquanto o do BB (volta) é apenas 12%. O BTN acredita estar pressionando com uma agressão mecânica, mas ele está jogando um jogo onde a moeda de troca dele é o dobro do preço da moeda do oponente.
              </p>
            </div>

            <h3 className="text-text-bright font-heading mt-10">O Colapso da Fold Equity</h3>
            <p>O Paradoxo do Valuation dita que, contra o Chip Leader, a sua Fold Equity despenca não porque ele joga mal, mas porque a <strong>Tolerância ao Risco</strong> dele é estruturalmente subsidiada pelo ICM.</p>
            <p>Como ele não corre risco de eliminação (não enfrenta a dor do $0 em payjump), as ranges de call do Big Stack inflam. Consequentemente, o bluff do Mid Stack perde lucratividade. A matemática de colisão vira uma guilhotina unilateral.</p>

            <h3 className="text-text-bright font-heading mt-10">Adaptação (SOTA)</h3>
            <p>A solução não é a passividade total, mas o <strong className="text-text-bright">Redirecionamento Cirúrgico</strong>. O Mid Stack não deve travar guerras de ego com o Big Stack. O vetor ofensivo deve focar nos Stacks menores que possuem Risk Premium elevado (que sentem a dor da queda). Contra o CL, a abordagem é extração linear (value-heavy) ou defesa passiva via realização de equidade de baixo custo.</p>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[0.65rem] text-accent-indigo-light font-black uppercase tracking-widest block mb-2">Vetor Errado</span>
            <p className="text-sm text-text-muted">Atritar pré-flop com o CL na bolha para "mostrar domínio".</p>
          </div>
          <div className="p-8 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30">
            <span className="text-[0.65rem] text-accent-emerald-light font-black uppercase tracking-widest block mb-2">Vetor Correto</span>
            <p className="text-sm text-text-bright">Atacar o stack vulnerável (15-20bb) que foldará 80% do range por medo da Morte.</p>
          </div>
        </div>
      </div>

      <div className="sota-container">
        <ContentFooter
          shareTitle="O Paradoxo do Valuation | Raphael Vitoi"
          shareUrl="https://www.pokerracional.com/biblioteca/paradoxo-valuation"
          backLinkHref="/biblioteca"
          backLinkText="Voltar para Biblioteca"
        />
      </div>
    </div>
  );
}
