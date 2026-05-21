/**
 * IDENTITY: A Hermenêutica do Blefe (Artigo Profundo)
 * PATH: src/app/biblioteca/hermeneutica-blefe/page.tsx
 * ROLE: Análise sobre blockers, bluffing e Fator R no contexto de GTO/ICM.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'A Hermenêutica do Blefe | Raphael Vitoi',
  description: 'A anatomia da mentira matemática. Blockers, MDF Collapse e o Efeito Irradiação.',
};

export default function HermeneuticaBlefePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="A Hermenêutica do Blefe"
        subtitle="A anatomia matemática da agressão não-equitativa sob as leis do MDF e do Risk Premium."
        category="Teoria Comportamental e SOTA"
        icon="fa-masks-theater"
      />

      <SectionHeader
        step="I"
        label="Sintaxe"
        title="A Anatomia da Mentira no Solver"
        description="O blefe perfeito GTO não visa o ego, mas a indiferença matemática do defensor."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>O conceito empírico de "blefar" está manchado por Hollywood. Na ciência do Poker, o blefe não é um ato de intuição isolada, mas a <strong className="text-text-bright">aplicação de entropia controlada no Minimum Defense Frequency (MDF)</strong> do adversário.</p>

            <h3 className="text-text-bright font-heading mt-10">O Colapso do MDF Pós-Flop</h3>
            <p>A teoria prescreve que o adversário defenda (1 - Size/Pot). Se apostamos o pote (100%), ele deve defender 50% das vezes. A genialidade da <strong className="text-accent-indigo">Perspectiva Matemática</strong> revela que o MDF é um frágil castelo de cartas na presença de RIO e ICM.</p>
            <p>O defensor, ao enfrentar o abismo de um Overbet no Turn com o relógio marcando Payjump in 3 min (Antevisão), rasga o cálculo do MDF e entra em modo <strong className="text-accent-danger">Aversão Categórica (Overfold Sistêmico)</strong>. Ele defende apenas 30%.</p>

            <div className="bg-accent-emerald/5 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-emerald-light font-bold text-lg mb-4 font-heading italic">O Alpha (α) e o Fator Blockers</h4>
              <p className="text-text-main leading-relaxed m-0 text-sm">
                Nosso lucro no blefe vem da distância entre a Frequência de Fold real e o nosso risco (α = Bet / (Bet+Pot)). Para otimizar essa margem em cenários GTO, acionamos a <strong className="text-text-bright">Remoção Combinatória (Blockers)</strong>. Ter o Ás de espadas num board de flush draw impede matematicamente que ele possua o topo do range defensivo.
              </p>
            </div>

            <h3 className="text-text-bright font-heading mt-10">O Blefe SOTA (Estado da Arte)</h3>
            <p>Saber quando e por que blefar define a elite. Um blefe mal executado (ex: contra um calling station short stack que está em Pot Entrapment irreversível) é uma falha de "Hermenêutica" (interpretação) do sistema.</p>
            <p>A regra de Ouro SOTA: <strong className="text-text-bright">Nunca blefe a passividade aprisionada. Blefe a sanidade algorítmica.</strong> Um oponente bom sabe que deve foldar mãos marginais sob ICM. Um oponente ruim pagará porque o "preço parecia ok". Direcione a sua agressão vazia contra a mente estruturada, não contra o caos.</p>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-bg-elevated/40 p-6 rounded-lg border border-white/5">
            <i className="fa-solid fa-link-slash text-2xl text-accent-indigo opacity-50 mb-3" />
            <p className="text-sm text-text-bright m-0">Aproveite os Blockers Nut.</p>
          </div>
          <div className="bg-bg-elevated/40 p-6 rounded-lg border border-white/5">
            <i className="fa-solid fa-chart-line text-2xl text-accent-emerald opacity-50 mb-3" />
            <p className="text-sm text-text-bright m-0">Atraia Overfolds via RP elevado.</p>
          </div>
          <div className="bg-bg-elevated/40 p-6 rounded-lg border border-white/5">
            <i className="fa-solid fa-ban text-2xl text-accent-danger opacity-50 mb-3" />
            <p className="text-sm text-text-bright m-0">Aborte contra Calling Stations.</p>
          </div>
        </div>
      </div>

      <ContentFooter shareTitle="A Hermenêutica do Blefe | Raphael Vitoi" shareUrl="https://www.pokerracional.com/biblioteca/hermeneutica-blefe" backLinkHref="/biblioteca" backLinkText="Voltar para Biblioteca" />
    </div>
  );
}
