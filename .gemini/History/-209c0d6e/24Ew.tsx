/**
 * IDENTITY: A Amortização da Edge (Artigo Profundo)
 * PATH: src/app/biblioteca/amortizacao-da-edge/page.tsx
 * ROLE: Explicar a relação entre SPR, variância e a supressão do edge técnico.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'A Amortização da Edge | Raphael Vitoi',
  description: 'Como o SPR baixo neutraliza a habilidade, colapsa a árvore de decisão e equaliza profissionais e recreativos.',
};

export default function AmortizacaoEdgePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="A Amortização da Edge"
        subtitle="A física de como a falta de profundidade (SPR) castra a vantagem técnica e entrega o torneio ao caos da variância."
        category="Ensaio Epistêmico"
        icon="fa-compress-arrows-alt"
      />

      <SectionHeader
        step="I"
        label="Teoria"
        title="O Colapso da Árvore de Decisão"
        description="O Edge (Vantagem Técnica) precisa de espaço para operar. Quando o SPR cai, a habilidade desaparece."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>Existe um mito de que o melhor jogador de poker sempre vence. A verdade inconveniente da Perspectiva Matemática é que a habilidade (Edge) é estritamente proporcional à <strong className="text-text-bright">Razão Stack-to-Pot (SPR)</strong>.</p>

            <h3 className="text-text-bright font-heading mt-10">O Espaço da Manobra</h3>
            <p>Com um SPR de 15 (ex: Pote de 2bb e Stacks de 30bb), a árvore de decisão permite C-bets, floats, check-raises no turn e hero folds no river. Cada nó dessa árvore é uma oportunidade para o jogador SOTA extrair micro-vantagens do oponente. A Edge acumula-se através de múltiplos pontos de inflexão.</p>
            <p>Contudo, quando o SPR cai para 2 (ex: Pote de 5bb e Stack de 10bb), a árvore sofre uma poda brutal. As decisões tornam-se quase instantaneamente <strong className="text-accent-rose">binárias (All-in ou Fold)</strong>. O espaço de manobra desaparece.</p>

            <div className="bg-accent-indigo/5 border-l-4 border-accent-indigo p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-indigo-light font-bold text-lg mb-4 font-heading italic">O Fator Amortizador</h4>
              <p className="text-text-main leading-relaxed m-0 text-sm font-mono">
                Er(S) = (Sigma / Delta_H) * log10(S)
              </p>
              <p className="text-text-main leading-relaxed mt-3 text-sm">
                A equação dita que o Retorno de Borda <em>Er</em> é dependente do Stack <em>S</em>. O recreativo que empurra All-in pré-flop com 10bb não joga muito pior do que a elite mundial; a matemática resolve o spot por ele. A Edge do profissional sofre uma <strong className="text-text-bright">Amortização Estrutural</strong>.
              </p>
            </div>

            <h3 className="text-text-bright font-heading mt-10">Adaptação (SOTA)</h3>
            <p>Evite inflar potes marginais fora de posição quando isso resultar num SPR baixo no turn. Se você tem Edge, o seu objetivo primordial deve ser <strong className="text-accent-emerald">manter o SPR alto pelo maior tempo possível</strong> em potes onde o Nuts não está definido. Preserve a sua árvore de decisão; não entregue o torneio à roleta da variância prematura.</p>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[0.65rem] text-accent-rose-light font-black uppercase tracking-widest block mb-2">Erro Comum</span>
            <p className="text-sm text-text-muted">3-betar mãos médias para "ganhar fold equity" e acabar com SPR de 1.5 pós-flop contra jogadores erráticos.</p>
          </div>
          <div className="p-8 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30">
            <span className="text-[0.65rem] text-accent-emerald-light font-black uppercase tracking-widest block mb-2">Abordagem SOTA</span>
            <p className="text-sm text-text-bright">Flat call em posição para reter um SPR de 8, garantindo margem para punir erros no turn e river.</p>
          </div>
        </div>
      </div>

      <div className="sota-container">
        <ContentFooter shareTitle="A Amortização da Edge | Raphael Vitoi" shareUrl="https://www.pokerracional.com/biblioteca/amortizacao-da-edge" backLinkHref="/biblioteca" backLinkText="Voltar para Biblioteca" />
      </div>
    </div>
  );
}
