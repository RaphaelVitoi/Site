import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export const metadata = {
  title: 'Conceitos ICM | Raphael Vitoi',
  description:
    'Definição formal de Risk Premium, Bubble Factor, Expectativa, Perspectiva e Esperança Matemática — o framework que estende ICM EV para o espaço decisório do torneio inteiro.',
};

const toc = [
  {
    num: '01',
    id: 'rp-vs-bf',
    label: 'Fundamento',
    title: 'Risk Premium vs. Bubble Factor',
    desc: 'Dois lados da mesma assimetria. Definições e relação matemática.',
  },
  {
    num: '02',
    id: 'esperanca',
    label: 'Estratégico',
    title: 'Esperança Matemática',
    desc: 'Equação de decisão e Edge Relativa Er(S).',
  },
  {
    num: '03',
    id: 'expectativa',
    label: 'Preditiva',
    title: 'Expectativa Matemática',
    desc: 'Cadeia de consequências e Antevisão.',
  },
  {
    num: '04',
    id: 'perspectiva',
    label: 'Síntese',
    title: 'Perspectiva Matemática',
    desc: 'Equação formal (PM) e Risco de Ressurreição.',
  },
  {
    num: '05',
    id: 'separacao',
    label: 'Estrutura',
    title: 'Extensão do ICM EV',
    desc: 'MDF em ICM e o paradoxo da pressão simultânea.',
  },
] as const;

export default function ConceitosICM() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">

      <ContentPageHeader
        title="Glossário Formal"
        subtitle="Risk Premium, Perspectiva, Esperança e Expectativa Matemática. O framework que organiza o raciocínio ICM pós-flop."
        category="Educação"
        icon="fa-microscope"
      />

      {/* ==================== ÍNDICE CIBERNÉTICO ==================== */ }
      <div className="sota-container py-12">
        <GlassPanel className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <span className="flex-1 h-px bg-linear-to-r from-transparent via-accent-indigo/20 to-transparent" />
            <span className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.3em]">Índice Analítico</span>
            <span className="flex-1 h-px bg-linear-to-r from-transparent via-accent-indigo/20 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            { toc.map( ( { num, id, label, title, desc } ) => (
              <a key={ id } href={ `#${id}` } className="group p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-accent-indigo/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xl font-black text-text-muted group-hover:text-accent-indigo transition-colors">{ num }</span>
                  <span className="text-[0.55rem] font-bold text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 px-2 py-0.5 rounded">{ label }</span>
                </div>
                <h4 className="text-sm font-bold text-text-main mb-1 group-hover:text-text-bright transition-colors">{ title }</h4>
                <p className="text-[0.7rem] text-text-muted leading-relaxed line-clamp-2">{ desc }</p>
              </a>
            ) ) }
          </div>
        </GlassPanel>
      </div>

      {/* ==================== 1. RP VS BF ==================== */ }
      <div id="rp-vs-bf" className="scroll-mt-24">
        <SectionHeader
          step="01"
          label="Fundamento"
          title="Risk Premium vs. Bubble Factor"
          description="Dois lados da mesma assimetria. Definições, relação matemática e por que RP é o padrão do framework."
        />
        <div className="sota-container pb-12">
          <GlassPanel className="p-8 sm:p-12 lg:p-16">
            <div className="prose prose-invert prose-lg max-w-none text-text-muted">
              <p>
                ICM impõe assimetria ao valor das fichas: cada chip perdido vale mais do que cada chip
                ganho. Essa assimetria pode ser expressa de duas formas. O <strong>Risk
                  Premium (RP)</strong> e o <strong>Bubble Factor (BF)</strong> medem o mesmo fenômeno.
              </p>

              <h3 className="text-text-bright font-heading mt-10 mb-4">Risk Premium</h3>
              <p>
                O RP é a equity adicional, acima dos pot odds puros, que um jogador precisa ter para
                justificar um call de all-in sob a pressão do ICM.
              </p>

              <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading italic">Relação Matemática</h4>
                <p className="font-mono text-sm text-accent-indigo-light mb-4">BF = 100 / (100 &minus; RP)</p>
                <p className="text-text-main m-0 leading-relaxed text-sm">
                  Exemplo: RP de 21% &rarr; BF = 100 / 79 &asymp; 1,27. No framework VITOI, o RP é a unidade base por sua clareza operacional imediata.
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ==================== 2. ESPERANÇA ==================== */ }
      <div id="esperanca" className="scroll-mt-24">
        <SectionHeader
          step="02"
          label="Estratégico-Lógica"
          title="Esperança Matemática"
          description="A métrica de decisão correta: ganho esperado em posição de torneio de uma ação específica."
        />
        <div className="sota-container pb-12">
          <GlassPanel className="p-8 sm:p-12 lg:p-16">
            <div className="prose prose-invert prose-lg max-w-none text-text-muted">
              <p>
                Responde: <em>o que posso concretamente buscar neste cenário, em termos de probabilidades,
                  riscos e ganhos?</em> É a medida da expectativa realizável de melhora de posição no torneio.
              </p>

              <div className="bg-bg-elevated/50 border border-white/5 p-8 my-10 rounded-2xl">
                <h4 className="mt-0 text-accent-indigo font-bold text-lg mb-4 font-heading">Equação de Decisão</h4>
                <p className="font-mono text-xs text-text-muted mb-0 leading-relaxed">
                  Esperança(ação) = P(ganhar) &times; &Delta;Perspectiva<sub>ganho</sub> + P(perder) &times; &Delta;Perspectiva<sub>perda</sub>
                </p>
              </div>

              <h3 className="text-text-bright font-heading mt-10 mb-4">EV do fold como threshold</h3>
              <p>
                Em ICM, o EV do fold <em>pode ser positivo</em>: foldar quando há short stacks
                prestes a ser eliminados gera payjumps passivos. Uma ação só é correta se superar este baseline.
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ==================== 3. EXPECTATIVA ==================== */ }
      <div id="expectativa" className="scroll-mt-24">
        <SectionHeader
          step="03"
          label="Preditiva"
          title="Expectativa Matemática"
          description="SE isso acontecer, o que muda no meu FGS e na minha Esperança futura?"
        />
        <div className="sota-container pb-12">
          <GlassPanel className="p-8 sm:p-12 lg:p-16">
            <div className="prose prose-invert prose-lg max-w-none text-text-muted">
              <p>
                A Expectativa Matemática é a camada preditiva. Ela captura a <strong>cadeia
                  de consequências encadeadas</strong> — o quequele outcome específico abre ou fecha
                para o restante da trajetória.
              </p>

              <h3 className="text-text-bright font-heading mt-10 mb-4">Table Draw e Antevisão</h3>
              <p>
                A <strong>Antevisão</strong> integra variáveis que solvers ignoram: o salto iminente de
                blinds (t&minus;3) e o custo posicional da órbita seguinte. Essas dimensões alteram a urgência da ação presente.
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ==================== 4. PERSPECTIVA ==================== */ }
      <div id="perspectiva" className="scroll-mt-24">
        <SectionHeader
          step="04"
          label="Síntese"
          title="Perspectiva Matemática"
          description="Síntese definitiva e fechada. Substitui o ICM EV como refinamento superior."
        />
        <div className="sota-container pb-12">
          <GlassPanel className="p-8 sm:p-12 lg:p-16">
            <div className="prose prose-invert prose-lg max-w-none text-text-muted">
              <p>
                A Perspectiva Matemática encapsula todas as camadas anteriores em uma
                única medida fechada, sem abstração residual.
              </p>

              <div className="bg-bg-elevated/50 border border-accent-indigo/20 p-8 my-10 rounded-2xl">
                <h4 className="mt-0 text-accent-indigo font-bold text-lg mb-4 font-heading">Equação Formal</h4>
                <p className="font-mono text-xs text-accent-indigo-light mb-0 leading-relaxed">
                  PM = [(Equity &times; R) &times; Valuation_stack] &minus; [EV_fold + RIO<sub>mw</sub>]
                </p>
              </div>

              <h3 className="text-text-bright font-heading mt-10 mb-4">Risco de Ressurreição</h3>
              <p>
                Dobrar o stack de um short <strong>devolve a complexidade ao oponente</strong>. Um call de EV marginalmente positivo pode ser um erro sistêmico se ressuscitar um adversário taticamente neutralizado.
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ==================== REFERÊNCIAS ==================== */ }
      <ContentFooter 
        shareTitle={`Conceitos ICM | ${SITE_CONFIG.author}`}
        shareUrl={ `${ SITE_CONFIG.baseUrl }${ ROUTES.AULAS.CONCEITOS }` }
        backLinkHref={ROUTES.BIBLIOTECA} 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
