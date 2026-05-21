
/**
 * IDENTITY: Whitepaper - Teoria da Perspectiva & Monte Carlo ICM
 * PATH: src/app/biblioteca/teoria-da-perspectiva/page.tsx
 * ROLE: Artigo fundamental sobre economia comportamental e algoritmos estocásticos.
 * PRINCIPLE: Honestidade Intelectual & Densidade Máxima.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import Link from 'next/link';

export const metadata = {
  title: 'Teoria da Perspectiva no Poker | Raphael Vitoi',
  description: 'Aplicações de Kahneman & Tversky e Algoritmos de Monte Carlo no Paradigma SOTA de ICM.',
};

export default function ProspectTheoryPage() {
  const pageUrl = "https://www.pokerracional.com/biblioteca/teoria-da-perspectiva";
  const pageTitle = "A Matemática do Viés: Teoria da Perspectiva";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <JsonLd data={ { '@context': 'https://schema.org', '@type': 'TechArticle', headline: pageTitle } } />

      <ContentPageHeader
        title="Teoria da Perspectiva"
        subtitle="O colapso da linearidade do EV e a ascensão da utilidade subjetiva sob pressão."
        category="Fundamentos"
        icon="fa-brain"
      />

      <div className="sota-container mb-24">
        <GlassPanel className="p-8 md:p-16 border-white/5">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading mb-8 border-l-4 border-accent-indigo pl-6">
              1. O Paradoxo da Utilidade
            </h2>
            <p className="text-xl leading-relaxed font-medium">
              A fundação do poker moderno assume que jogadores são maximizadores racionais. Contudo, Daniel Kahneman (Nobel 2002) provou que o cérebro humano processa o risco de forma assimétrica: <strong className="text-text-bright">a dor da perda é 2.25x superior à alegria do ganho.</strong>
            </p>

            <div className="bg-accent-indigo/5 border border-accent-indigo/20 rounded-3xl p-8 my-12 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h4 className="text-accent-indigo-light font-black uppercase text-sm mb-4 tracking-widest">A Função de Valor (v)</h4>
                <div className="bg-black/40 p-6 rounded-2xl font-mono text-lg text-center border border-white/5 text-accent-indigo-light">
                  v(x) = x<sup>α</sup> (se x ≥ 0)<br />
                  v(x) = -λ(-x)<sup>β</sup> (se x &lt; 0)
                </div>
              </div>
              <div className="flex-1 text-sm italic">
                O multiplicador <strong className="text-text-bright">λ (Lambda)</strong> é o &quot;Fator de Pânico&quot;. No Nexus, simulamos o comportamento humano ajustando λ dinamicamente conforme a profundidade do stack.
              </div>
            </div>

            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading mb-8 mt-24 border-l-4 border-accent-emerald pl-6">
              2. Estados Psicológicos no Nexus
            </h2>
            <p>Mapeamos quatro perfis comportamentais fundamentais baseados na literatura de <em>behavioral finance</em> adaptada ao poker:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-12">
              { [
                { title: 'Baseline', icon: 'fa-gauge', desc: 'Aversão à perda padrão (λ ≈ 2.25). Foco em matemática pura.', color: 'text-text-muted' },
                { title: 'Chasing Losses', icon: 'fa-bolt-lightning', desc: 'Busca desenfreada pelo risco para recuperar o &quot;stuck&quot;.', color: 'text-accent-rose' },
                { title: 'Protecting Win', icon: 'fa-shield-halved', desc: 'Hiper-conservadorismo após dobrar o stack (λ ≈ 3.0).', color: 'text-accent-emerald' },
                { title: 'Bubble Survival', icon: 'fa-biohazard', desc: 'Paralisia estratégica. O valor da ficha perdida é infinito.', color: 'text-accent-amber' }
              ].map( p => (
                <div key={ p.title } className="p-6 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-all">
                  <i className={ `fa-solid ${p.icon} ${p.color} text-xl mb-4` } />
                  <h4 className="text-text-bright font-black uppercase text-sm mb-2">{ p.title }</h4>
                  <p className="text-xs leading-relaxed">{ p.desc }</p>
                </div>
              ) ) }
            </div>

            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading mb-8 mt-24 border-l-4 border-accent-indigo pl-6">
              3. A Engenharia: Monte Carlo ICM
            </h2>
            <p>O modelo Malmuth-Harville tradicional é computacionalmente proibitivo em MTTs ($O(2^N)$). Para garantir a fluidez do Nexus, integramos uma aproximação estocástica inspirada em bibliotecas de alta performance.</p>

            <div className="bg-bg-deep border border-white/5 rounded-3xl p-8 my-12">
              <h4 className="text-text-bright font-black uppercase text-xs mb-6 tracking-[0.2em] flex items-center gap-3">
                <i className="fa-solid fa-code text-accent-emerald" /> Algoritmo VITOI-MC
              </h4>
              <p className="text-sm mb-6">Em vez de calcular todas as permutações, realizamos 20.000 <em>Random Walks</em> em tempo sub-milisegundo. Sorteamos o vencedor pelo peso das fichas, removemos da urna e recalculamos recursivamente.</p>
              <div className="bg-black/60 p-6 rounded-xl font-mono text-xs text-accent-emerald border border-white/5">
                { `// Fallback Estocástico para N > 10
const calculateIcmMC = (stacks, prizes) => {
  return runMonteCarlo(stacks, prizes, {
    iterations: 20000,
    seed: 'nexus_vitoi'
  });
};`}
              </div>
            </div>

            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading mb-8 mt-24 border-l-4 border-accent-rose pl-6">
              4. Síntese Dialética
            </h2>
            <p className="text-lg">Ao fundir a <strong className="text-text-bright">Prospect Theory</strong> com a <strong className="text-text-bright">Engenharia Estocástica</strong>, o Nexus transcende o solver tradicional. Ele não apenas diz o que um robô faria, mas mapeia a topologia da fraqueza humana e as rotas de exploração algorítmica.</p>

            <div className="mt-16 pt-12 border-t border-white/5 text-center">
              <Link href="/simulador" className="btn-primary pulse-glow px-12 py-5 text-lg font-black tracking-widest rounded-2xl">
                INICIAR SIMULAÇÃO <i className="fa-solid fa-flask ml-3" />
              </Link>
            </div>
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
