/**
 * IDENTITY: Fator Ψ (Maluquice Humana) (Artigo Interativo)
 * PATH: src/app/biblioteca/fator-psi-maluquice-humana/page.tsx
 * ROLE: Artigo técnico demonstrando a quantificação do fator psicológico no poker.
 */

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import PredictiveProfilePanel from "@/components/simulator/panels/PredictiveProfilePanel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";

const content = `
# O Fator Ψ (Maluquice Humana)

O poker não é jogado no vácuo contra supercomputadores perfeitos. Ele é jogado contra humanos suscetíveis ao cansaço, ao medo e ao ego. Na **Perspectiva Matemática**, essa irracionalidade não é um ruído a ser ignorado; é uma variável quantificável que chamamos de **Fator Ψ (Psi)**.

---

## 1. A Falácia do Equilíbrio de Nash no Vácuo

A Teoria dos Jogos (GTO) assume que ambos os jogadores são agentes perfeitamente racionais buscando maximizar a própria utilidade. A realidade empírica, no entanto, demonstra que os jogadores frequentemente escolhem opções subótimas devido a vieses cognitivos (ex: *Sunk Cost Fallacy* ou aversão extrema ao risco na bolha).

Quando um oponente desvia do Equilíbrio de Nash, a sua resposta não deve ser manter a estratégia GTO estática. A estratégia ideal (Maximal Exploitative Strategy - MES) exige que você ajuste suas frequências para punir ativamente esse desvio.

---

## 2. Quantificando a Entropia

O Fator Ψ atua como um modulador sobre as probabilidades matemáticas cruas. Se as pot odds exigem 30% de equidade para um call, mas o Perfil Preditivo do oponente indica um "Excesso de Agressão" (frequência alta de blefes ilógicos), a utilidade do seu call aumenta vertiginosamente.

A "maluquice" deixa de ser uma reclamação ("ele não podia ter pago com isso!") e passa a ser uma oportunidade de arbitragem. O lucro do jogador de elite nasce exatamente da diferença entre a ação GTO teórica e a ação irracional executada pelo oponente.

---

## 3. A Assinatura Bayesiana

Observe o **Perfil Preditivo** abaixo. Ele não é uma suposição; é o resultado da inferência de *Random Forest* analisando a sua telemetria (ou a tendência populacional). Ele mapeia as principais falhas da psique sob pressão. Se você (ou seu oponente) apresenta altos níveis de Aversão ao Risco ou Miopia de Payjump, a Teoria SOTA ajustará a agressão contra você.
`;

export default function FatorPsiPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="O Fator Ψ"
        subtitle="A quantificação matemática da irracionalidade humana e a exploração sistemática de vieses cognitivos sob pressão."
        category="Psicologia Preditiva"
        icon="fa-brain"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-rose shadow-2xl group transition-colors hover:border-l-accent-indigo">
            <SotaMarkdown content={content} />
          </GlassPanel>

          <div className="w-full relative z-10">
            <PredictiveProfilePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
