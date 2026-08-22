/**
 * IDENTITY: Geometria do Risco SOTA GOLD
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa e colapso da MDF.
 * PRINCIPLE: Excelência Teórica & Fluidez Sofisticada.
 * VERSION: v7.0 GOLD
 */

import ContentFooter from '@/components/ui/layout/ContentFooter';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';

export const metadata = {
  title: 'Geometria do Risco GOLD | Raphael Vitoi',
  description:
    'O framework matemático do ICM pós-flop v7.0 GOLD: Risk Premium, ΔRP, Perspectiva Matemática e o colapso da MDF.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Geometria do Risco GOLD: O Framework Matemático do ICM Pós-Flop',
  description:
    'Uma desconstrução profunda da física do poker sob pressão de ICM, introduzindo conceitos de Risk Premium e Perspectiva Matemática.',
  author: { '@type': 'Person', name: 'Raphael Vitoi' },
};

const metrics = [
  {
    label: 'Assimetria Fundamental',
    value: 'Fichas perdidas > ganhas',
    detail:
      'A base da stack vale mais que o topo — concavidade irredutível. É a origem de toda distorção no equilíbrio.',
  },
  {
    label: 'Risk Premium (RP)',
    value: 'Dependente do estado',
    detail:
      'Equity adicional necessária para justificar um call. Não há teto universal: stacks, payouts, pot odds e regras importam.',
  },
  {
    label: 'Bubble Factor (BF)',
    value: 'Multiplicador da Dor',
    detail: 'O coeficiente que escala o custo da eliminação. Em all-in simétrico: Equity* = BF / (BF + 1).',
  },
  {
    label: 'ΔRP — Diferencial',
    value: 'RP_IP − RP_OOP',
    detail: 'Um descritor comparativo proposto; não determina sozinho iniciativa, range ou sizing.',
  },
  {
    label: 'Downward Drift',
    value: 'RP↑ → Sizing↓',
    detail: 'Hipótese comportamental a testar por configuração, árvore e população; não uma lei determinística.',
  },
  {
    label: 'Regra de Ouro',
    value: 'RPs são específicos ao par',
    detail: 'Assimetrias são frequentes, mas valores iguais podem ocorrer. Sempre calcule o estado concreto.',
  },
];

export default function AulaICMPage() {
  const articleTitle = 'Geometria do Risco | Raphael Vitoi';
  const articleUrl = 'https://www.pokerracional.com/aulas/icm-masterclass';

  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen overflow-x-hidden pb-24">
      <JsonLd data={articleSchema} />

      <ContentPageHeader
        title="Geometria do Risco"
        subtitle="A desconstrução do pós-flop sob a ótica do ICM. O mapeamento estrutural da colisão e a física da Perspectiva Matemática."
        category="Masterclass"
        icon="fa-shapes"
      />

      <div className="sota-container pt-6 pb-12">
        <blockquote className="border-accent-indigo text-text-muted rounded-r-2xl border-l-4 bg-white/2 py-4 pl-8 text-xl italic">
          &quot;O poker é uma ciência de informação incompleta jogada por humanos falhos. Num cenário de extrema pressão
          financeira, as fichas deixam de ser plástico e passam a representar a perspectiva de sobrevivência.&quot;{' '}
          <cite className="text-text-darker mt-4 block font-mono text-[0.6rem] font-black tracking-widest uppercase not-italic">
            — Raphael Vitoi, A Geometria do Risco
          </cite>
        </blockquote>
      </div>

      <SectionHeader
        step="01"
        label="Fundamentos"
        title="Grandezas do Sistema"
        description="RP e BF são grandezas calculáveis em estados definidos; ΔRP e Downward Drift são hipóteses operacionais que exigem teste."
      />

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="hover:border-accent-indigo/30 group rounded-3xl border border-white/5 bg-white/2 p-6 transition-all"
            >
              <p className="text-accent-indigo-light mb-3 font-mono text-[0.55rem] font-black tracking-widest uppercase">
                {metric.label}
              </p>
              <strong className="text-text-bright font-heading mb-3 block text-xl tracking-tighter">
                {metric.value}
              </strong>
              <p className="text-text-muted m-0 text-xs leading-relaxed opacity-70 transition-opacity group-hover:opacity-100">
                {metric.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <SectionHeader
        step="02"
        label="Doutrina"
        title="A Ilusão do Vácuo"
        description="Limites de modelos ChipEV ou simplificados e o que uma análise ICM completa precisa declarar."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg text-text-muted max-w-none">
            <p>
              Solvers ChipEV maximizam fichas sob utilidade linear; solvers ICM e árvores especializadas podem
              incorporar payouts e risco de eliminação. Em torneio, uma análise adequada deve declarar qual utilidade,
              payouts e transições usa. O <strong className="text-text-bright">Risk Premium</strong> quantifica essa
              assimetria por jogador, por spot. Ignorar o RP não é &ldquo;jogar GTO&rdquo; — é jogar um jogo diferente
              do que está acontecendo.
            </p>

            <div className="bg-accent-amber/10 border-accent-amber my-10 rounded-r-2xl border-l-4 p-8">
              <h4 className="text-accent-amber font-heading text-shadow-glow mt-0 mb-4 text-lg font-bold italic">
                Heads-Up: O Pote vs. O Final
              </h4>
              <p className="text-text-main m-0 text-sm leading-relaxed">
                Um pote heads-up com 9 jogadores ativos{' '}
                <strong className="text-text-bright">continua sujeito a pressões letais de ICM</strong>. Apenas no
                confronto final (Top 2), o modelo reverte para ChipEV puro sob as hipóteses usuais de winner-take-all,
                sem bounties e sem efeitos externos. Fora disso, os demais jogadores e a estrutura de premiação
                importam.
              </p>
            </div>

            <p>
              O <strong className="text-text-bright">Downward Drift</strong> (O&apos;Kearney &amp; Carter) é o mecanismo
              de transmissão: sob RP crescente, é plausível que ranges e sizings se adaptem. A direção e a magnitude
              dependem da árvore, da cobertura e da população; devem ser medidas, não presumidas. A{' '}
              <strong className="text-text-bright">Perspectiva Matemática</strong> ainda é uma hipótese de modelagem
              para esse risco dinâmico.
            </p>
          </div>
        </GlassPanel>
      </div>

      {/* ARQUÉTIPOS CLÍNICOS DO ICM */}
      <SectionHeader
        step="03"
        label="Morfologia"
        title="Os 5 Arquétipos Clínicos"
        description="Padrões comportamentais GTO contra-intuitivos ditados pela gravidade da utilidade não-linear."
      />

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Arquétipo I */}
          <div className="border-t-accent-emerald hover:border-accent-emerald/30 group flex flex-col rounded-3xl border border-t-4 border-white/5 bg-white/2 p-8 transition-all hover:bg-white/4">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-accent-emerald/10 text-accent-emerald flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition-transform duration-500 group-hover:scale-110">
                <i className="fa-solid fa-handshake" />
              </div>
              <div>
                <h3 className="text-text-bright m-0 text-xl font-black tracking-tighter uppercase">
                  O Pacto Silencioso
                </h3>
                <p className="text-accent-emerald-light m-0 text-[0.65rem] font-black tracking-widest uppercase">
                  Evitação de Ruína
                </p>
              </div>
            </div>
            <div className="text-text-muted flex-1 space-y-4 text-sm leading-relaxed">
              <p>
                <strong className="text-text-main font-bold">Cenário:</strong> Chip Leader (70bb) vs Vice Chip Leader
                (65bb) numa mesa repleta de micro-stacks (10bb a 15bb).
              </p>
              <p>
                <strong className="text-text-main font-bold">O Paradoxo:</strong> Em ChipEV, duas stacks colossais
                atacariam-se impiedosamente. No ICM, o RP de ambos ultrapassa a barreira letal dos 20%.
              </p>
              <div className="bg-accent-emerald/5 border-accent-emerald/10 mt-4 rounded-xl border p-4">
                <p className="text-accent-emerald-light m-0 italic">
                  <strong className="mb-1 block text-[0.6rem] tracking-widest uppercase not-italic opacity-70">
                    Resolução Nash:
                  </strong>{' '}
                  A agressividade pré-flop desaparece. Ranges de flat call inflam massivamente, incluindo o topo
                  (AK/QQ). Slowplays tornam-se vitais para não engordar o SPR para níveis irreversíveis.
                </p>
              </div>
            </div>
          </div>

          {/* Arquétipo II */}
          <div className="border-t-accent-rose hover:border-accent-rose/30 group flex flex-col rounded-3xl border border-t-4 border-white/5 bg-white/2 p-8 transition-all hover:bg-white/4">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-accent-rose/10 text-accent-rose flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition-transform duration-500 group-hover:scale-110">
                <i className="fa-solid fa-scale-unbalanced" />
              </div>
              <div>
                <h3 className="text-text-bright m-0 text-xl font-black tracking-tighter uppercase">
                  Paradoxo do Valuation
                </h3>
                <p className="text-accent-rose-light m-0 text-[0.65rem] font-black tracking-widest uppercase">
                  Mid vs Big
                </p>
              </div>
            </div>
            <div className="text-text-muted flex-1 space-y-4 text-sm leading-relaxed">
              <p>
                <strong className="text-text-main font-bold">Cenário:</strong> BTN (40bb) abre, BB (54bb - Chip Leader)
                defende.
              </p>
              <p>
                <strong className="text-text-main font-bold">O Paradoxo:</strong> O BTN acredita que pode punir o BB.
                Mas o Risk Premium de ida (21.4%) é quase o dobro do de volta (12.9%). O BTN aposta a vida; o BB aposta
                fichas.
              </p>
              <div className="bg-accent-rose/5 border-accent-rose/10 mt-4 rounded-xl border p-4">
                <p className="text-accent-rose-light m-0 italic">
                  <strong className="mb-1 block text-[0.6rem] tracking-widest uppercase not-italic opacity-70">
                    Resolução Nash:
                  </strong>{' '}
                  A agressão do BTN é estrangulada. A matemática corta sua frequência de blefe, forçando-o a abandonar
                  potes marginais para evitar suicídio financeiro. O BB impõe o ritmo pela imunidade à morte.
                </p>
              </div>
            </div>
          </div>

          {/* Arquétipo III */}
          <div className="border-t-accent-amber hover:border-accent-amber/30 group flex flex-col rounded-3xl border border-t-4 border-white/5 bg-white/2 p-8 transition-all hover:bg-white/4">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-accent-amber/10 text-accent-amber flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition-transform duration-500 group-hover:scale-110">
                <i className="fa-solid fa-person-falling-burst" />
              </div>
              <div>
                <h3 className="text-text-bright m-0 text-xl font-black tracking-tighter uppercase">Guerra na Lama</h3>
                <p className="text-accent-amber-light m-0 text-[0.65rem] font-black tracking-widest uppercase">
                  Sobrevivência dos Shorts
                </p>
              </div>
            </div>
            <div className="text-text-muted flex-1 space-y-4 text-sm leading-relaxed">
              <p>
                <strong className="text-text-main font-bold">Cenário:</strong> Dois jogadores com ~10bb numa mesa de
                colossos (80bb+).
              </p>
              <p>
                <strong className="text-text-main font-bold">O Paradoxo:</strong> O senso comum dita que, à beira da
                morte, deveriam jogar soltos (RP 0%).
              </p>
              <div className="bg-accent-amber/5 border-accent-amber/10 mt-4 rounded-xl border p-4">
                <p className="text-accent-amber-light m-0 italic">
                  <strong className="mb-1 block text-[0.6rem] tracking-widest uppercase not-italic opacity-70">
                    Resolução Nash:
                  </strong>{' '}
                  Falso. O laddering passivo impera. Foldar rende dinheiro limpo a cada vez que um vizinho sucumbe. O RP
                  ancora em ~10%. O push com lixo técnico é punido duramente pela matemática.
                </p>
              </div>
            </div>
          </div>

          {/* Arquétipo IV */}
          <div className="border-t-accent-indigo hover:border-accent-indigo/30 group flex flex-col rounded-3xl border border-t-4 border-white/5 bg-white/2 p-8 transition-all hover:bg-white/4">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-accent-indigo/10 text-accent-indigo flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl transition-transform duration-500 group-hover:scale-110">
                <i className="fa-solid fa-chess-king" />
              </div>
              <div>
                <h3 className="text-text-bright m-0 text-xl font-black tracking-tighter uppercase">Ameaça Orgânica</h3>
                <p className="text-accent-indigo-light m-0 text-[0.65rem] font-black tracking-widest uppercase">
                  Efeito Kingmaker (FGS)
                </p>
              </div>
            </div>
            <div className="text-text-muted flex-1 space-y-4 text-sm leading-relaxed">
              <p>
                <strong className="text-text-main font-bold">Cenário:</strong> Chip Leader absoluto (90bb) ataca o
                Vice-Líder (25bb).
              </p>
              <p>
                <strong className="text-text-main font-bold">O Paradoxo:</strong> O CL é imortal na mão, logo seu RP
                deveria ser 0% para esmagar sem restrição.
              </p>
              <div className="bg-accent-indigo/5 border-accent-indigo/10 mt-4 rounded-xl border p-4">
                <p className="text-accent-indigo-light m-0 italic">
                  <strong className="mb-1 block text-[0.6rem] tracking-widest uppercase not-italic opacity-70">
                    Resolução Nash:
                  </strong>{' '}
                  O ecossistema FGS impõe um RP substancial (~12%) ao CL. Se o Vice dobrar, salta para 50bb, armando o
                  único rival capaz de usurpar a coroa. O solver protege o God Mode barrando a criação de monstros
                  desnecessários.
                </p>
              </div>
            </div>
          </div>

          {/* Arquétipo V (Span Completo) */}
          <div className="border-t-accent-violet hover:border-accent-violet/30 group flex flex-col items-center gap-8 rounded-3xl border border-t-4 border-white/5 bg-linear-to-br from-white/5 to-transparent p-8 transition-all hover:from-white/10 sm:flex-row sm:items-start md:col-span-2">
            <div className="bg-accent-violet/10 text-accent-violet flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl transition-transform duration-500 group-hover:scale-110">
              <i className="fa-solid fa-fire-flame-curved" />
            </div>
            <div className="text-text-muted flex-1 space-y-4 text-center text-sm leading-relaxed sm:text-left">
              <div>
                <h3 className="text-text-bright m-0 text-xl font-black tracking-tighter uppercase">
                  Transferência de Risco
                </h3>
                <p className="text-accent-violet-light m-0 text-[0.65rem] font-black tracking-widest uppercase">
                  Efeito Batata Quente
                </p>
              </div>
              <p>
                <strong className="text-text-main font-bold">Cenário:</strong> Um jogador aplica um Open-Shove de 20bb
                sobre as blinds.
              </p>
              <p>
                <strong className="text-accent-violet-light font-bold">A Dinâmica SOTA:</strong> Ao empurrar todas as
                fichas, o agressor não investe apenas o seu próprio Risk Premium; ele acopla-lhe a monumental Fold
                Equity de uma decisão final. O agressor transfere instantaneamente o peso volitivo do torneio para o
                defensor. Privado de re-agressão, o limite de dor do defensor colapsa, obrigando ranges perfeitamente
                defensáveis a um <strong className="text-text-bright">overfold matemático</strong> ditado pelo pavor da
                eliminação num único call.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* O FIM DA MDF E A INÉRCIA HUMANA */}
      <SectionHeader
        step="04"
        label="Inércia Humana"
        title="O Fim da MDF"
        description="A diluição das frequências GTO sob a gravidade esmagadora da pressão utilitária."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg text-text-muted max-w-none">
            <h3 className="text-text-bright font-heading">O Colapso do Bluffcatcher</h3>
            <p>
              Quando enfrentamos uma aposta de pote inteiro no river, as regras básicas do ChipEV ditam que devemos
              defender, pelo menos, 50% das vezes (Minimum Defense Frequency). Mas o ecossistema ICM impõe o{' '}
              <strong className="text-accent-rose">Teto de Dor</strong>.
            </p>
            <p>
              Um range condensado (composto por bluffcatchers que não vencem apostas de valor) é incapaz de suportar um
              RP elevado. A necessidade de retenção de equidade é suplantada pela dor financeira da eliminação. A defesa
              quebra vertiginosamente dos 50% para a casa dos 30% a 38%. O OOP é forçado àquilo que os leigos chamam de
              overfold, mas que na realidade é uma{' '}
              <strong className="text-text-bright">Abstenção Estrutural GTO</strong>.
            </p>

            <h3 className="text-text-bright font-heading mt-10">A Especulação Assimétrica</h3>
            <p>
              A complexidade final reside no &quot;Fator Humano&quot;. O solver GTO baseia-se na premissa robótica de
              que o Agressor terá a frieza letal para disparar agressões avassaladoras em 3 streets. Os humanos,
              contudo, apresentam um crônico défice de agressão no Turn e no River.
            </p>

            <div className="bg-bg-elevated/50 my-10 rounded-2xl border border-white/5 p-8">
              <h4 className="text-accent-indigo-light font-heading mt-0 mb-4 text-lg font-bold italic">
                Node-Locking Empírico
              </h4>
              <p className="text-text-main m-0 text-sm leading-relaxed">
                Se sabemos que o vilão irá travar a sua agressão antes do all-in final, a nossa resposta estratégica
                altera-se. Adotamos uma <strong className="text-accent-emerald">Expansão Passiva</strong>: aumentamos a
                grelha de calls baseados em Implied Odds de ICM. Especulamos apenas quando o cenário modelado preserva
                preço, realização e ICM favoráveis. Não existe teto absoluto de RP; a textura, os ranges e os payouts
                devem ser recalculados a cada spot.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* CONCLUSÃO E ADAPTAÇÃO */}
      <SectionHeader
        step="05"
        label="Conclusão"
        title="A Arte da Adaptação"
        description="A vantagem competitiva moderna não reside em decorar tabelas, mas em compreender a Elasticidade do Risco."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg text-text-muted max-w-none">
            <p>
              Os Solvers assumem uma simetria de perfeição e falham em calcular a fadiga mental, o tilt, o medo de errar
              e o verdadeiro edge pós-flop do humano falível. A verdadeira vantagem reside na{' '}
              <strong className="text-text-bright">Tríade da Adaptação</strong>:
            </p>

            <ul className="mt-10 list-none space-y-6 pl-0">
              <li className="flex items-start gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg">
                  <i className="fa-solid fa-shield-halved text-accent-emerald text-lg"></i>
                </span>
                <div>
                  <strong className="text-text-bright font-heading mb-1 block">O Colapso do Teto de Agressão</strong>
                  <p className="m-0 text-sm leading-relaxed">
                    Saber quando um oponente que atua como &quot;calling station&quot; destrói por completo a capacidade
                    matemática do seu blefe.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg">
                  <i className="fa-solid fa-handshake text-accent-indigo text-lg"></i>
                </span>
                <div>
                  <strong className="text-text-bright font-heading mb-1 block">A Exploração do Pacto</strong>
                  <p className="m-0 text-sm leading-relaxed">
                    Compreender o momento exato em que o &quot;Pacto Silencioso&quot; lhe permite roubar potes a
                    gigantes aterrorizados pela sombra da eliminação mútua.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg">
                  <i className="fa-solid fa-person-falling-burst text-accent-amber text-lg"></i>
                </span>
                <div>
                  <strong className="text-text-bright font-heading mb-1 block">Navegando na Lama</strong>
                  <p className="m-0 text-sm leading-relaxed">
                    Saber quando a &quot;Guerra na Lama&quot; lhe exige expandir a variância para alcançar os lugares
                    cimeiros sem temer o salto de premiação marginal.
                  </p>
                </div>
              </li>
            </ul>

            <p className="text-text-main mt-12 border-t border-white/5 pt-12 text-center text-lg italic">
              No poker de elite, a matemática propõe a base teórica; contudo, será sempre a sua sensibilidade na
              interpretação do ecossistema que ditará o campeão.
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container border-t border-white/5 pt-12 pb-24">
        <ContentFooter
          shareTitle={articleTitle}
          shareUrl={articleUrl}
          backLinkHref="/biblioteca"
          backLinkText="Voltar para Biblioteca"
        />
      </div>
    </div>
  );
}
