/**
 * IDENTITY: Hermenêutica do Blefe (Artigo Interativo)
 * PATH: src/app/biblioteca/hermeneutica-blefe/page.tsx
 * ROLE: Artigo técnico sobre a desconstrução semântica e bayesiana do blefe.
 */

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import BayesianBeliefPanel from "@/components/simulator/panels/BayesianBeliefPanel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";

const content = `
# A Hermenêutica do Blefe

O blefe no poker de alta performance não é um ato de intuição isolada ou coragem descabida; é a **injeção proposital de entropia** no modelo mental do oponente. A Hermenêutica do Blefe trata da arte de interpretar e forjar narrativas que distorçam a Atualização Bayesiana da mesa.

---

## 1. A Semântica da Agressão Ilegítima

Todo bet conta uma história. A agressão ilegítima (blefe) é bem-sucedida quando a sua "história" é matematicamente indistinguível da agressão por valor. O GTO prescreve frequências exatas para tornar o oponente indiferente, mas a **Perspectiva Matemática** exige que você encontre falhas de interpretação (hermenêutica) no oponente.

Se o seu oponente superestima a sua taxa de blefe (Alta *P(Bluff)* no Prior dele), a utilidade intrínseca do seu blefe cai a zero, mas o valor extraído pelas suas mãos de valor (Nuts) explode exponencialmente.

---

## 2. Contração Bayesiana e o "Fator Ψ"

O ser humano não processa o teorema de Bayes com precisão natural. Quando submetido à pressão do ICM, a mente do oponente sofre um "drift" interpretativo: o medo da eliminação (Fator Ψ) altera o limiar de aceitação do blefe.

Interaja com o laboratório bayesiano abaixo. Ajuste a probabilidade percebida de blefe (*Likelihood*) e observe como a densidade de probabilidade (a Crença) do oponente se altera brutalmente após uma agressão no River. O blefe de elite ataca diretamente essa margem de erro perceptiva.
`;

export default function HermeneuticaBlefePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="A Hermenêutica do Blefe"
        subtitle="A desconstrução bayesiana da agressão ilegítima e a exploração sistemática da entropia cognitiva do oponente."
        category="Psicologia Preditiva"
        icon="fa-masks-theater"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-rose shadow-2xl group transition-colors hover:border-l-accent-indigo">
            <SotaMarkdown content={content} />
          </GlassPanel>

          <div className="w-full relative z-10">
            <BayesianBeliefPanel
              initialRange="20.5%"
              label="Agressor (River Jam)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
