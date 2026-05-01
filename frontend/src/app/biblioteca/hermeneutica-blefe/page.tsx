'use client';

/**
 * IDENTITY: Hermenêutica do Blefe SOTA Quantum
 * PATH: src/app/biblioteca/hermeneutica-blefe/page.tsx
 * ROLE: Artigo técnico-filosófico sobre leitura de intenções via Lacan.
 * PRINCIPLE: Sofisticação Estética & Rigor Teórico.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';

export default function HermeneuticaBlefePage() {
  const articleUrl = "https://www.raphaelvitoi.com/biblioteca/hermeneutica-blefe";
  const articleTitle = "Hermenêutica do Blefe | Raphael Vitoi";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">

      <ContentPageHeader 
        title="Hermenêutica do Blefe"
        subtitle="A estrutura simbólica da mentira estratégica — lendo intenções através da lente de Lacan e Ricoeur."
        category="Psicologia"
        icon="fa-mask"
      />

      {/* Seção 01: Fundação */}
      <SectionHeader
        step="01"
        label="Fundação"
        title="Hermenêutica como Ferramenta"
        description="O poker é um texto. Cada ação é um signo que remete a outro signo."
      />
      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>Hermenêutica é a teoria da interpretação. Paul Ricoeur a definiu como &quot;a teoria das operações do entendimento em relação à interpretação de textos&quot;.</p>
            <p>O poker é um texto. Cada ação — aposta, check, timing, sizing — é um signo que remete a outro signo. O problema do jogador é: <strong>como extrair sentido de uma cadeia de significantes cujo referente está ocultado?</strong></p>
            
            <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl shadow-lg shadow-emerald-900/10">
              <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading italic">O Axioma Central</h4>
              <p className="m-0 leading-relaxed text-sm italic">
                &quot;O inconsciente está estruturado como uma linguagem.&quot; — Jacques Lacan. 
                <br/><br/>
                O jogador não pode blefar de forma limpa. O inconsciente vaza. A questão é saber onde e como decodificá-lo.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Seção 02: Semiologia */}
      <SectionHeader
        step="02"
        label="Semiologia"
        title="O Significante e o Blefe"
        description="O blefe é um ato de falsificação simbólica. Mas a cadeia resiste e produz deslizamentos."
      />
      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>No poker, o bet de 75% do pot é um significante. Seu significado não é absoluto — ele depende do contexto (board, posição, stack depth), exatamente como uma palavra depende da frase.</p>
            
            <h3 className="text-text-bright font-heading mt-12 mb-6 text-2xl">Matriz de Deslizamento (Glissement)</h3>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20 my-10">
                <table className="w-full text-left text-sm font-body">
                    <thead className="bg-white/5 text-text-bright uppercase text-[0.6rem] tracking-widest border-b border-white/5">
                        <tr>
                            <th className="py-4 px-6">Signo (Ação)</th>
                            <th className="py-4 px-6">Significado Pretendido</th>
                            <th className="py-4 px-6 text-accent-rose">Deslizamento (Real)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6 font-bold text-text-main">Bet rápido no river</td>
                            <td className="py-4 px-6">Valor / Confiança</td>
                            <td className="py-4 px-6 text-accent-rose-light">Automático (Blefe preparado)</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6 font-bold text-text-main">Pausa longa antes de bet</td>
                            <td className="py-4 px-6">Cálculo de valor</td>
                            <td className="py-4 px-6 text-accent-rose-light">Encenação; o blefe não exige cálculo</td>
                        </tr>
                        <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6 font-bold text-text-main">Conversa durante pot</td>
                            <td className="py-4 px-6">Descontração</td>
                            <td className="py-4 px-6 text-accent-rose-light">Dissociação defensiva</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Seção 03: Psicanálise */}
      <SectionHeader
        step="03"
        label="Psicanálise"
        title="O Gozo do Blefador"
        description="O blefador compulsivo não blefa por +EV. Ele blefa pela satisfação de enganar."
      />
      <div className="sota-container pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted">
            <p>O conceito lacaniano de <em>jouissance</em> (gozo) designa uma satisfação além do prazer. No poker, o blefador compulsivo blefa pelo <strong>gozo do ato</strong>: a confirmação de existência através do reconhecimento do Outro (o oponente que foldou).</p>
            
            <div className="bg-accent-indigo/10 border-l-4 border-accent-indigo p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-indigo font-bold text-lg mb-4 font-heading italic">O Imperativo do Gozo</h4>
              <p className="text-text-main m-0 leading-relaxed text-sm">
                O tell não está na mão específica — está no padrão comportamental. O gozo tem frequência. Ele volta. Identificar essa necessidade estrutural é a chave para a exploração máxima.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Footer & Navigation */}
      <div className="sota-container pb-24">
        <div className="pt-12 border-t border-white/5">
            <ContentFooter
                shareTitle={articleTitle}
                shareUrl={articleUrl}
                backLinkHref="/biblioteca"
                backLinkText="Voltar para a Biblioteca"
            />
        </div>
      </div>
    </div>
  );
}
