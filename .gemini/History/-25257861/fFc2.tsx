
/**
 * IDENTITY: Geometria do Risco SOTA Quantum
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa e colapso da MDF.
 * PRINCIPLE: Excelência Teórica & Fluidez Sofisticada.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Geometria do Risco | Raphael Vitoi',
  description: 'O framework matemático do ICM pós-flop: Risk Premium, ΔRP, Perspectiva Matemática e o colapso da MDF.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Geometria do Risco: O Framework Matemático do ICM Pós-Flop',
  description: 'Uma desconstrução profunda da física do poker sob pressão de ICM, introduzindo conceitos de Risk Premium e Perspectiva Matemática.',
  author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

const metrics = [
  {
    label: 'Assimetria Fundamental',
    value: 'Fichas perdidas > ganhas',
    detail: 'A base da stack vale mais que o topo — concavidade irredutível. É a origem de toda distorção no equilíbrio.',
  },
  {
    label: 'Risk Premium (RP)',
    value: '0% a ~24%',
    detail: 'Equity adicional necessária para justificar um call. Acima deste teto, a defesa racional colapsa.',
  },
  {
    label: 'Bubble Factor (BF)',
    value: 'Multiplicador da Dor',
    detail: 'O coeficiente que escala o custo da eliminação. BF = 100 / (100 - RP).',
  },
  {
    label: 'ΔRP — Diferencial',
    value: 'RP_IP − RP_OOP',
    detail: 'O diferencial que dita quem detém a iniciativa e quem é forçado à passividade estrutural.',
  },
  {
    label: 'Downward Drift',
    value: 'RP↑ → Sizing↓',
    detail: "A migração gravitacional dos sizings para faixas menores conforme a pressão monetária aumenta.",
  },
  {
    label: 'Regra de Ouro',
    value: 'RPs nunca são iguais',
    detail: 'Em qualquer colisão, um jogador detém vantagem estrutural de risco. A neutralidade é uma ilusão.',
  },
];

export default function AulaICMPage() {
  const articleTitle = "Geometria do Risco | Raphael Vitoi";
  const articleUrl = "https://www.pokerracional.com/aulas/icm-masterclass";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <JsonLd data={ articleSchema } />

      <ContentPageHeader
        title="Geometria do Risco"
        subtitle="A desconstrução do pós-flop sob a ótica do ICM. O mapeamento estrutural da colisão e a física da Perspectiva Matemática."
        category="Masterclass"
        icon="fa-shapes"
      />

      <div className="sota-container -mt-8 pb-12">
        <blockquote className="border-l-4 border-accent-indigo pl-8 py-4 italic text-text-muted text-xl bg-white/2 rounded-r-2xl">
          &quot;O poker é uma ciência de informação incompleta jogada por humanos falhos. Num cenário de extrema pressão financeira, as fichas deixam de ser plástico e passam a representar a perspectiva de sobrevivência.&quot;
          { ' ' }
          <cite className="block mt-4 text-[0.6rem] font-black text-text-darker uppercase tracking-widest not-italic font-mono">— Raphael Vitoi, A Geometria do Risco</cite>
        </blockquote>
      </div>

      <SectionHeader
        step="01"
        label="Fundamentos"
        title="Grandezas do Sistema"
        description="RP, BF, ΔRP e Downward Drift não são metáforas — são grandezas calculáveis que governam o equilíbrio de Nash."
      />

      <div className="sota-container pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          { metrics.map( ( metric ) => (
            <div key={ metric.label } className="p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-accent-indigo/30 transition-all group">
              <p className="text-accent-indigo-light text-[0.55rem] font-black uppercase tracking-widest mb-3 font-mono">{ metric.label }</p>
              <strong className="text-text-bright text-xl block mb-3 font-heading tracking-tighter">{ metric.value }</strong>
              <p className="text-text-muted text-xs leading-relaxed m-0 opacity-70 group-hover:opacity-100 transition-opacity">{ metric.detail }</p>
            </div>
          ) ) }
        </div>
      </div>

      <SectionHeader
        step="02"
        label="Doutrina"
        title="A Ilusão do Vácuo"
        description="Por que solvers tradicionais não resolvem mesas finais e como a matemática oculta subverte a teoria clássica."
      />

      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>
              Solvers maximizam ChipEV — assumem que cada ficha vale o mesmo. Em cash game, isso é correto.
              Em torneio, é sistematicamente falso: a última ficha (base da stack) vale mais do que a primeira (topo).
              O <strong className="text-text-bright">Risk Premium</strong> quantifica essa assimetria por jogador, por spot. Ignorar o RP não é &ldquo;jogar GTO&rdquo; — é jogar um jogo diferente do que está acontecendo.
            </p>

            <div className="bg-accent-amber/10 border-l-4 border-accent-amber p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-amber font-bold text-lg mb-4 font-heading italic text-shadow-glow">Heads-Up: O Pote vs. O Final</h4>
              <p className="text-text-main m-0 leading-relaxed text-sm">
                Um pote heads-up com 9 jogadores ativos <strong className="text-text-bright">continua sujeito a pressões letais de ICM</strong>. Apenas no confronto final (Top 2), o modelo reverte para ChipEV puro. Fora isso, a sombra dos outros adversários impõe uma lei marcial matemática.
              </p>
            </div>

            <p>
              O <strong className="text-text-bright">Downward Drift</strong> (O&apos;Kearney &amp; Carter) é o mecanismo de transmissão: sob RP crescente, a distribuição de apostas migra para sizes menores. Overbets desaparecem. 2/3 pot vira 1/3. 1/3 vira check. A <strong className="text-text-bright">Perspectiva Matemática</strong> governa o quanto de risco cada jogador pode absorver por street.
            </p>
          </div>
        </GlassPanel>
      </div>

      <div className="sota-container pb-24 pt-12 border-t border-white/5">
        <ContentFooter
          shareTitle={ articleTitle }
          shareUrl={ articleUrl }
          backLinkHref="/biblioteca"
          backLinkText="Voltar para Biblioteca"
        />
      </div>
    </div>
  );
}
