/**
 * IDENTITY: Exegese da Decisão SOTA v4.3
 * PATH: src/app/biblioteca/exegese-da-decisao/page.tsx
 * ROLE: Documento técnico-doutrinário sobre a decomposição vetorial da Equação Unificada.
 */

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";
import ContentFooter from "@/components/content/ContentFooter";
import { GlassPanel } from "@/components/ui/GlassPanel";

const content = `
# Exegese da Decisão: A Decomposição Vetorial SOTA

No paradigma Poker Racional Nexus, uma decisão não é um ponto, mas um **vetor resultante** de múltiplas forças físicas e psicológicas. Compreender esta exegese é o que separa o apertador de botões do operador soberano.

---

## 1. O Snapshot: ICMev (Física Newtoniana)

A primeira camada é a equidade estática. Transformamos fichas em probabilidade de prêmio usando Malmuth-Harville ou Monte Carlo.
*   **Limitação:** Assume que o mundo é estático e que o jogo acaba agora.
*   **Equação:** $Eq_{icm} = \\sum P(Pos_i) \\cdot Prize_i$

---

## 2. A Injeção de Lógica: Valuation & RIO (Dinâmica de Sistemas)

Aqui, corrigimos a assimetria das fichas. Ganhar 10bb não vale o mesmo que perder 10bb.
*   **Valuation Factor:** A "inflação" das fichas ganhas baseada no seu impacto no payjump.
*   **Dívida RIO Multiway:** O passivo estrutural exponencial $N^{2+f}$. Quanto mais jogadores no pote, mais sua equidade é "diluída" pela colaboração implícita dos oponentes.

---

## 3. O Filtro Bayesiano: Axioma Lipe Piv

A equidade bruta é filtrada pela **Credibilidade Informacional (κ)**.
*   **Intuição vs. Matemática:** Se você não tem informações sólidas sobre o range do oponente ($\\kappa \\to 0$), o sistema força sua decisão em direção ao baseline de sobrevivência.
*   **Equação:** $Eq_{real} = Baseline + \\kappa \\cdot (Eq_{hand} - Baseline)$

---

## 4. A Projeção Temporal: Expectativa (FGS)

Injetamos a Teoria do Prospecto de Kahneman & Tversky.
*   **Aversão à Perda Dinâmica:** A dor da derrota é escalonada pelo logaritmo do stack efetivo. Para um short-stack, perder é matematicamente insuportável.
*   **Future Game Simulation (FGS):** Antecipamos a erosão do stack e payjumps iminentes.

---

## 5. A Síntese Soberana: Perspectiva Matemática (PM)

O output final. A PM é a diferença entre a **Expectativa de Ação** e o **Piso Real do Fold**.
*   **O Verdadeiro Zero:** No Nexus, o fold não vale 0. Ele tem um valor de utilidade ($EV_{fold}$) que pode ser positivo (laddering) ou violentamente negativo (pot entrapment).
*   **Veredito:** Se $PM > 0$, a ação é soberana. Se $PM < 0$, você está em insolvência estratégica.

> "A Perspectiva não ignora a matemática; ela a submete à realidade da sobrevivência."
`;

export default function ExegeseDecisaoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Exegese da Decisão"
        subtitle="A anatomia matemática da Equação Unificada SOTA e o colapso da linearidade."
        category="Doutrina Técnica"
        icon="fa-microscope"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-10 lg:p-16 border-t-8 border-t-accent-emerald">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter
        shareTitle="Exegese da Decisão SOTA | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/exegese-da-decisao"
        backLinkHref="/biblioteca"
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
