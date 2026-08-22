/**
 * IDENTITY: Aula 1.2 - ICM Pós-Flop (Framework D6)
 * PATH: src/app/aulas/icm-pos-flop/page.tsx
 * ROLE: Formalização do motor pós-flop VITOI.
 * PRINCIPLE: Rigor Matemático & Alta Densidade Epistêmica.
 */

import ContentFooter from '@/components/ui/layout/ContentFooter';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { DownwardDriftSimulator } from '@/components/simulator/DownwardDriftSimulator';
import SprPipeline from '@/components/simulator/ui/SprPipeline';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export const metadata = {
  title: 'ICM Pós-Flop — Framework D6 | Raphael Vitoi',
  description:
    'Perspectiva Matemática por street: R dinâmico, RIO multiway, Valuation ICM, Coeficiente de Insolvência e Pot Entrapment.',
};

const D6_CONCEPTS = [
  {
    num: '01',
    title: 'R — Realização por Street',
    symbol: 'R(s, p, SPR)',
    equation: 'R = posBonus × streetDiscount × sprFactor',
    desc: 'Fração da equidade teórica materializada. River = 1 (Showdown). Flop/Turn < 1: A árvore não colapsou.',
    intuition: 'O IP dita o ritmo. SPR baixo comprime a árvore, forçando R a convergir para 1.',
    color: 'accent-emerald',
  },
  {
    num: '02',
    title: 'RIO Multiway (D2)',
    symbol: 'RIO(N, pot)',
    equation: 'RIO = f(ranges, posição, SPR, árvore, payouts)',
    desc: 'Hipótese de custo futuro de realização. A forma funcional deve ser calibrada por cenário, e não presumida como quadrática.',
    intuition: 'Multiway muda ranges e árvores; não deve ser tratado automaticamente como heads-up linear.',
    color: 'accent-rose',
  },
  {
    num: '03',
    title: 'Valuation Dinâmica',
    symbol: 'Val(street)',
    equation: 'Val = gain_icm ÷ loss_icm',
    desc: 'Assimetria fundamental. Perder custa mais que ganhar vale. O câmbio entre chips e $EV.',
    intuition: 'Quanto maior o Risk Premium, menor o Valuation. No river, Val é o filtro final.',
    color: 'accent-indigo',
  },
  {
    num: '04',
    title: 'PM — Perspectiva Matemática',
    symbol: 'PM(street)',
    equation: 'PM = (Eq × R × Val × gain) − ((1−Eq) × loss) − RIO',
    desc: 'Uma função objetivo proposta para integrar variáveis declaradas de decisão.',
    intuition:
      'PM deve ser comparada a linhas alternativas sob a mesma convenção de EV; não é critério de verdade universal.',
    color: 'accent-indigo-light',
  },
  {
    num: '05',
    title: 'Ci — Coeficiente de Insolvência',
    symbol: 'Ci(street)',
    equation: 'Ci = PM ÷ pot_odds_pct',
    desc: 'Diagnóstico experimental que só é interpretável depois da definição e calibração das suas entradas.',
    intuition:
      'Pot odds, realização e ICM precisam ser comparados na mesma árvore; nenhum limiar isolado decide o spot.',
    color: 'accent-amber',
  },
];

export default function IcmPosFlopPage() {
  const pageUrl = `${SITE_CONFIG.baseUrl}${ROUTES.AULAS.POS_FLOP}`;
  const pageTitle = `ICM Pós-Flop — Framework D6 | ${SITE_CONFIG.author}`;

  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen overflow-x-hidden pb-24">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: pageTitle,
        }}
      />

      <ContentPageHeader
        title="ICM Pós-Flop"
        subtitle="A Transposição da Perspectiva Matemática para o caos das streets dinâmicas."
        category="Framework D6"
        icon="fa-microchip"
      />

      <SectionHeader
        step="D6"
        label="Ontologia"
        title="Derivação Sistêmica"
        description="No pós-flop, a Perspectiva Matemática (PM) torna-se recursiva. Cada street exige um novo diagnóstico de insolvência."
      />

      <div className="sota-container mb-12">
        <SprPipeline
          stages={[
            { name: 'PRE', potSize: 2.5, rpValue: 24 },
            { name: 'FLOP', potSize: 7.5, rpValue: 18.5 },
            { name: 'TURN', potSize: 22.5, rpValue: 12 },
            { name: 'RIVER', potSize: 67.5, rpValue: 4.5 },
          ]}
          activeStage={1}
        />
      </div>

      <div className="sota-container mb-24 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {D6_CONCEPTS.map((c) => (
          <GlassPanel key={c.num} className="hover:border-accent-indigo/20 group border-white/5 p-8 transition-all">
            <div className="mb-6 flex items-start justify-between">
              <span
                className={`rounded-lg bg-white/5 px-3 py-1 text-[0.6rem] font-black tracking-[0.3em] uppercase text-${c.color}`}
              >
                D6.{c.num} — {c.symbol}
              </span>
              <i
                className={`fa-solid fa-square-root-variable text-${c.color} opacity-20 transition-opacity group-hover:opacity-100`}
              />
            </div>
            <h3 className="text-text-bright mb-4 text-xl font-black tracking-tighter uppercase">{c.title}</h3>
            <div className="text-accent-indigo-light mb-6 rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-sm">
              {c.equation}
            </div>
            <div className="space-y-4">
              <p className="text-text-muted text-sm leading-relaxed">
                <strong className="text-text-bright mb-1 block text-[0.6rem] tracking-widest uppercase">
                  Definição:
                </strong>{' '}
                {c.desc}
              </p>
              <p className="text-text-muted text-sm leading-relaxed italic">
                <strong className="text-accent-emerald mb-1 block text-[0.6rem] tracking-widest uppercase">
                  Intuição:
                </strong>{' '}
                {c.intuition}
              </p>
            </div>
          </GlassPanel>
        ))}

        {/* POT ENTRAPMENT RATIO */}
        <GlassPanel className="border-accent-rose/20 bg-accent-rose/5 p-8 lg:col-span-2">
          <div className="mb-6 flex items-center gap-4">
            <div className="bg-accent-rose/10 text-accent-rose flex h-12 w-12 items-center justify-center rounded-2xl">
              <i className="fa-solid fa-skull-crossbones text-xl" />
            </div>
            <div>
              <h3 className="text-text-bright m-0 text-xl font-black tracking-tighter uppercase">
                PER — Pot Entrapment Ratio
              </h3>
              <p className="text-accent-rose-light m-0 text-[0.6rem] font-black tracking-widest uppercase">
                Protocolo de Emergência
              </p>
            </div>
          </div>
          <p className="text-text-muted mb-6 leading-relaxed">
            Mede a fração do seu stack já comprometida. <strong className="text-text-bright">PER &gt; 50%</strong> é um
            marcador visual de comprometimento no simulador, não um limiar normativo. Quando PER é alto, reavalie range,
            preço marginal, pot odds, ICM e linhas alternativas; a decisão não é determinada independentemente das
            cartas.
          </p>
          <div className="flex justify-center">
            <Link
              href={ROUTES.SIMULADOR}
              className="btn-primary pulse-glow rounded-2xl px-12 py-4 text-sm font-black tracking-widest"
            >
              TESTAR MOTOR D6 <i className="fa-solid fa-flask ml-3" />
            </Link>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="EXP"
        label="Evidência"
        title="O Downward Drift em Dados"
        description="Visualização exploratória de cenários ChipEV e ICMev. Só deve ser tratada como evidência após publicação de inputs, versão do motor, seeds e replicação."
      />

      <div className="sota-container mb-24">
        <DownwardDriftSimulator />

        <GlassPanel className="mt-12 p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg text-text-muted max-w-none">
            <h3 className="text-text-bright font-heading">A Compressão da Ação</h3>
            <p>
              A hipótese de trabalho é que, em algumas árvores de ICMev, ocorra o fenômeno do{' '}
              <strong className="text-accent-indigo-light">Downward Drift</strong>: sizings grandes migrem para pequenos
              (B20/B33) e sizings médios se tornem checks. Qualquer frequência exibida é cenário ilustrativo, não
              estimativa generalizável sem árvore e inputs publicados.
            </p>

            <div className="my-16 grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  label: 'C-bet Strategy',
                  chip: 'Mix (S/M/L)',
                  icm: 'Small (B20/B33)',
                  trend: 'Compressão',
                },
                {
                  label: 'BB Reaction',
                  chip: 'MDF Padrão',
                  icm: 'Overfold Seletivo',
                  trend: 'Preservação',
                },
                {
                  label: 'River Shoves',
                  chip: 'Frequentes',
                  icm: 'Ultra-Polarizados',
                  trend: 'Cautela',
                },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl border border-white/5 bg-white/3 p-6">
                  <span className="text-text-darker mb-4 block text-[0.5rem] font-black tracking-[0.2em] uppercase">
                    {row.label}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-dim">ChipEV:</span> <span className="font-mono">{row.chip}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-accent-indigo">ICMev:</span>{' '}
                      <span className="text-text-bright font-mono">{row.icm}</span>
                    </div>
                    <div className="text-accent-emerald mt-4 border-t border-white/5 pt-4 text-center text-[0.6rem] font-black tracking-widest uppercase">
                      {row.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="text-text-bright border-accent-indigo/30 my-16 border-l-2 py-4 pl-10 text-2xl font-light italic">
              &quot;O poker não é sobre sorte. É sobre a gestão elegante da incerteza e a precisão tática de evitar
              colisões onde sua edge é amortizada.&quot;
            </blockquote>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container">
        <ContentFooter
          shareTitle={pageTitle}
          shareUrl={pageUrl}
          backLinkHref={ROUTES.AULAS.MASTERCLASS}
          backLinkText="Voltar para Aula ICM"
        />
      </div>
    </div>
  );
}
