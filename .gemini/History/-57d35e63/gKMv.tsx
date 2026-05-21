
/**
 * IDENTITY: Aula 1.2 - ICM Pós-Flop (Framework D6)
 * PATH: src/app/aulas/icm-pos-flop/page.tsx
 * ROLE: Formalização do motor pós-flop VITOI.
 * PRINCIPLE: Rigor Matemático & Alta Densidade Epistêmica.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { DownwardDriftSimulator } from '@/components/simulator/DownwardDriftSimulator';
import SprPipeline from '@/components/simulator/ui/SprPipeline';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'ICM Pós-Flop — Framework D6 | Raphael Vitoi',
  description: 'Perspectiva Matemática por street: R dinâmico, RIO multiway, Valuation ICM, Coeficiente de Insolvência e Pot Entrapment.',
};

const D6_CONCEPTS = [
  {
    num: '01',
    title: 'R — Realização por Street',
    symbol: 'R(s, p, SPR)',
    equation: 'R = posBonus × streetDiscount × sprFactor',
    desc: 'Fração da equidade teórica materializada. River = 1 (Showdown). Flop/Turn < 1: A árvore não colapsou.',
    intuition: 'O IP dita o ritmo. SPR baixo comprime a árvore, forçando R a convergir para 1.',
    color: 'accent-emerald'
  },
  {
    num: '02',
    title: 'RIO Multiway (D2)',
    symbol: 'RIO(N, pot)',
    equation: 'RIO = (N−1)² × p_d × pot_total',
    desc: 'Risco de Inação. Cresce quadraticamente. Com 3 oponentes, o risco é 9x maior.',
    intuition: 'O erro fatal é tratar Multiway como HU linear. A penalidade é uma curva exponencial.',
    color: 'accent-rose'
  },
  {
    num: '03',
    title: 'Valuation Dinâmica',
    symbol: 'Val(street)',
    equation: 'Val = gain_icm ÷ loss_icm',
    desc: 'Assimetria fundamental. Perder custa mais que ganhar vale. O câmbio entre chips e $EV.',
    intuition: 'Quanto maior o Risk Premium, menor o Valuation. No river, Val é o filtro final.',
    color: 'accent-indigo'
  },
  {
    num: '04',
    title: 'PM — Perspectiva Matemática',
    symbol: 'PM(street)',
    equation: 'PM = (Eq × R × Val × gain) − ((1−Eq) × loss) − RIO',
    desc: 'O núcleo do motor. Integra todas as distorções em um único vetor de decisão.',
    intuition: 'PM > EV_fold é o único critério de verdade. Se PM < investido, o erro é continuar.',
    color: 'accent-indigo-light'
  },
  {
    num: '05',
    title: 'Ci — Coeficiente de Insolvência',
    symbol: 'Ci(street)',
    equation: 'Ci = PM ÷ pot_odds_pct',
    desc: 'Verificador de sanidade. Ci < 1 indica que você está pagando mais do que recebe.',
    intuition: 'As odds podem parecer boas, mas se Ci < 1, o spot é matematicamente tóxico.',
    color: 'accent-amber'
  }
];

export default function IcmPosFlopPage() {
  const pageUrl = "https://www.pokerracional.com/aulas/icm-pos-flop";
  const pageTitle = "ICM Pós-Flop — Framework D6";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <JsonLd data={ { '@context': 'https://schema.org', '@type': 'TechArticle', headline: pageTitle } } />

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
          stages={ [
            { name: 'PRE', potSize: 2.5, rpValue: 24 } as any,
            { name: 'FLOP', potSize: 7.5, rpValue: 18.5 } as any,
            { name: 'TURN', potSize: 22.5, rpValue: 12 } as any,
            { name: 'RIVER', potSize: 67.5, rpValue: 4.5 } as any,
          ] }
          activeStage={ 1 }
        />
      </div>

      <div className="sota-container grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24">
        { D6_CONCEPTS.map( ( c ) => (
          <GlassPanel key={ c.num } className="p-8 border-white/5 hover:border-accent-indigo/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <span className={ `text-[0.6rem] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-lg bg-white/5 text-${c.color}` }>
                D6.{ c.num } — { c.symbol }
              </span>
              <i className={ `fa-solid fa-square-root-variable text-${c.color} opacity-20 group-hover:opacity-100 transition-opacity` } />
            </div>
            <h3 className="text-xl font-black text-text-bright uppercase tracking-tighter mb-4">{ c.title }</h3>
            <div className="bg-black/40 p-4 rounded-xl font-mono text-sm text-accent-indigo-light border border-white/5 mb-6">
              { c.equation }
            </div>
            <div className="space-y-4">
              <p className="text-sm text-text-muted leading-relaxed">
                <strong className="text-text-bright uppercase text-[0.6rem] tracking-widest block mb-1">Definição:</strong> { c.desc }
              </p>
              <p className="text-sm text-text-muted leading-relaxed italic">
                <strong className="text-accent-emerald uppercase text-[0.6rem] tracking-widest block mb-1">Intuição:</strong> { c.intuition }
              </p>
            </div>
          </GlassPanel>
        ) ) }

        {/* POT ENTRAPMENT RATIO */ }
        <GlassPanel className="p-8 border-accent-rose/20 bg-accent-rose/5 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent-rose/10 flex items-center justify-center text-accent-rose">
              <i className="fa-solid fa-skull-crossbones text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-black text-text-bright uppercase tracking-tighter m-0">PER — Pot Entrapment Ratio</h3>
              <p className="text-[0.6rem] font-black text-accent-rose-light uppercase tracking-widest m-0">Protocolo de Emergência</p>
            </div>
          </div>
          <p className="text-text-muted leading-relaxed mb-6">
            Mede a fração do seu stack já comprometida. <strong className="text-text-bright">PER &gt; 50%</strong> indica aprisionamento severo. Quando PER é alto e Ci &lt; 1, você está diante de um colapso matemático: o fold é a única manobra de salvamento, independentemente das cartas.
          </p>
          <div className="flex justify-center">
            <Link href="/simulador" className="btn-primary pulse-glow px-12 py-4 text-sm font-black tracking-widest rounded-2xl">
              TESTAR MOTOR D6 <i className="fa-solid fa-flask ml-3" />
            </Link>
          </div>
        </GlassPanel>
      </div>

      <SectionHeader
        step="EXP"
        label="Evidência"
        title="O Downward Drift em Dados"
        description="Contraste empírico entre ChipEV e ICMev baseado em 93 nodes de simulação em Mesa Final."
      />

      <div className="sota-container mb-24">
        <DownwardDriftSimulator />

        <GlassPanel className="p-8 sm:p-12 lg:p-16 mt-12">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <h3 className="text-text-bright font-heading">A Compressão da Ação</h3>
            <p>No ICMev, observamos o fenômeno do <strong className="text-accent-indigo-light">Downward Drift</strong>: sizings grandes migram para pequenos (B20/B33) e sizings médios tornam-se checks. A presença de 7% de Lead do BB sugere que o ICM altera a topologia da agressão em favor de quem tem o Risk Premium menor.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
              { [
                { label: 'C-bet Strategy', chip: 'Mix (S/M/L)', icm: 'Small (B20/B33)', trend: 'Compressão' },
                { label: 'BB Reaction', chip: 'MDF Padrão', icm: 'Overfold Seletivo', trend: 'Preservação' },
                { label: 'River Shoves', chip: 'Frequentes', icm: 'Ultra-Polarizados', trend: 'Cautela' }
              ].map( ( row ) => (
                <div key={ row.label } className="p-6 rounded-2xl bg-white/3 border border-white/5">
                  <span className="text-[0.5rem] font-black text-text-darker uppercase tracking-[0.2em] mb-4 block">{ row.label }</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs"><span className="text-text-dim">ChipEV:</span> <span className="font-mono">{ row.chip }</span></div>
                    <div className="flex justify-between text-xs"><span className="text-accent-indigo">ICMev:</span> <span className="font-mono text-text-bright">{ row.icm }</span></div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-center font-black text-[0.6rem] text-accent-emerald uppercase tracking-widest">{ row.trend }</div>
                  </div>
                </div>
              ) ) }
            </div>

            <blockquote className="text-2xl font-light italic text-text-bright border-l-2 border-accent-indigo/30 pl-10 py-4 my-16">
              &quot;O poker não é sobre sorte. É sobre a gestão elegante da incerteza e a precisão tática de evitar colisões onde sua edge é amortizada.&quot;
            </blockquote>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container">
        <ContentFooter
          shareTitle={ pageTitle }
          shareUrl={ pageUrl }
          backLinkHref="/aulas/icm-masterclass"
          backLinkText="Voltar para Aula ICM"
        />
      </div>
    </div>
  );
}
