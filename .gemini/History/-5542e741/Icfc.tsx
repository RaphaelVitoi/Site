/**
 * IDENTITY: O Motor de Diluição (Artigo Profundo)
 * PATH: src/app/biblioteca/motor-diluicao/page.tsx
 * ROLE: Explicar a taxa oculta de ICM do Early Game e o valor do Late Reg.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'O Motor de Diluição | Raphael Vitoi',
  description: 'Como o Early Game aplica uma taxa invisível de ICM no seu ROI e o Ágio Matemático do Late Reg.',
};

export default function MotorDiluicaoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="O Motor de Diluição"
        subtitle="A física de como cada novo jogador que se registra corrói silenciosamente a equidade do seu stack."
        category="Ensaio Epistêmico"
        icon="fa-water"
      />

      <SectionHeader
        step="I"
        label="Sintaxe"
        title="A Taxa Invisível do Nível 1"
        description="Jogar do início não é heroísmo; é submeter o seu capital a um desgaste matemático passivo."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>A sabedoria popular afirma que o melhor momento para se registrar num torneio é o primeiro nível, devido ao fato das "fichas estarem baratas" e os adversários serem mais fracos. A Perspectiva Matemática prova que isso é uma armadilha cognitiva.</p>

            <h3 className="text-text-bright font-heading mt-10">A Diluição Contínua</h3>
            <p>Num torneio de $10 com $100.000 garantidos, a cada vez que um novo jogador se registra durante as 3 horas de <em>Late Reg</em>, o dinheiro dele entra no prize pool, mas a quantidade de fichas totais em jogo também aumenta. Como o ICM dita que fichas adicionais possuem retorno marginal decrescente, o ato de novas fichas entrarem no ecossistema <strong className="text-accent-rose">dilui o valor das fichas já existentes</strong>.</p>

            <div className="bg-accent-emerald/5 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-emerald-light font-bold text-lg mb-4 font-heading italic">O Ágio Matemático (Late Reg)</h4>
              <p className="text-text-main leading-relaxed m-0 text-sm">
                Quando você se registra aos 40bb perto do fecho das inscrições, a sua stack inicial herda passivamente o "Dinheiro Morto" (Dead Money) dos jogadores que já foram eliminados e fizeram reentradas ao longo daquelas horas. A matemática calcula que uma stack inicial registrada no último segundo vale cerca de <strong className="text-accent-emerald-light">5% a 12% a mais em $EV</strong> do que o seu próprio custo nominal de Buy-in.
              </p>
            </div>

            <h3 className="text-text-bright font-heading mt-10">O Veredito SOTA</h3>
            <p>Registar-se no Nível 1 é aceitar ser o "fornecedor de liquidez" do torneio. Você submete-se a dezenas de bad beats com stacks imensos, apenas para chegar ao fim do registo tardio e descobrir que a sua stack não cresceu proporcionalmente ao risco assumido.</p>
            <p>O <strong>Protocolo Smart Sniper</strong> evita o Nível 1. A entrada ótima foca-se no momento em que o torneio abandona a fase de acumulação pura e entra na fase de sobrevivência iminente (30bb-50bb). Adquirimos a equidade subsidiada pelos eliminados e minimizamos a nossa própria exposição à fadiga e à variância precoce.</p>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <div className="bg-bg-elevated/40 p-8 rounded-lg border border-white/5">
            <i className="fa-solid fa-clock text-3xl text-accent-rose opacity-50 mb-4" />
            <strong className="text-text-main block mb-2 font-heading uppercase text-xs tracking-widest">A Armadilha do Tempo</strong>
            <p className="text-sm text-text-muted m-0">Jogar 4 horas apenas para dobrar a stack, enquanto o valor relativo da stack diluiu.</p>
          </div>
          <div className="bg-bg-elevated/40 p-8 rounded-lg border border-accent-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <i className="fa-solid fa-parachute-box text-3xl text-accent-emerald opacity-50 mb-4" />
            <strong className="text-text-main block mb-2 font-heading uppercase text-xs tracking-widest">Entrada Sniper</strong>
            <p className="text-sm text-text-bright m-0">Capturar o Ágio Matemático (+8% $EV) com zero fadiga neural e máximo C-Game exploitável nos oponentes.</p>
          </div>
        </div>
      </div>

      <div className="sota-container">
        <ContentFooter shareTitle="O Motor de Diluição | Raphael Vitoi" shareUrl="https://www.pokerracional.com/biblioteca/motor-diluicao" backLinkHref="/biblioteca" backLinkText="Voltar para Biblioteca" />
      </div>
    </div>
  );
}
