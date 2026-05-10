/**
 * IDENTITY: Manifesto SOTA: Axiomas da Perspectiva
 * PATH: src/app/biblioteca/manifesto-sota-axiomas/page.tsx
 * ROLE: Artigo de síntese polifórmica unindo Teoria dos Jogos e Psicologia de Sistemas.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';

const content = `
# Manifesto SOTA: Axiomas da Perspectiva Matemática

O paradigma proposto — a **Perspectiva Matemática** — desloca o eixo do poker de uma análise de "estado" (snapshot) para uma análise de "fluxo" (dinâmica sistêmica).

---

## 1. O Axioma do EV do Fold (EV_fold ≠ 0)

A falha fundamental dos solvers comerciais ao exibir o EV do fold como 0 é uma simplificação pedagógica que oculta o custo de oportunidade. Matematicamente, o fold é uma transação de capital onde você aceita uma perda garantida para evitar uma perda incerta e potencialmente maior.

### O Paradoxo do ICM pós-flop
No ICM, o EV_fold torna-se uma variável dinâmica e, por vezes, **positiva**.
*   **Atratividade do Fold:** Quando a sobrevivência garante um payjump iminente, o valor de "passar a vez" supera o valor esperado de colidir.
*   **Pot Entrapment:** Conforme as fichas entram no pote, o EV_fold torna-se violentamente negativo. A perda de valuation do stack investido gera uma "gravidade" que aproxima as decisões de call do ChipEV.

---

## 2. A Hierarquia da Perspectiva Matemática

A tomada de decisão não é plana; ela evolui em camadas de complexidade:

1.  **ICMev (Snapshot):** "O que eu tenho agora?" (Aproximação grosseira).
2.  **Esperança Matemática (Lógica):** "O que eu posso buscar?" — Antevisão de controle de mesa e edge.
3.  **Expectativa Matemática (Preditiva):** "Qual o impacto no FGS e na saúde futura?" — Inclui aversão à perda.
4.  **Perspectiva Matemática (Síntese):** O output final que encapsula as camadas anteriores em uma decisão soberana.

---

## 3. A Falácia das Pot Odds e o Veneno das RIO

As Pot Odds são uma métrica linear e isolada. No Poker de elite, elas tornam-se um distrator sistêmico.

### O Cavalo de Troia
As Pot Odds facilitam a entrada em um pote (especulação barata) apenas para expor o jogador às **Reverse Implied Odds (RIO)**. No cenário Multiway (~33% de frequência), o passivo estrutural cresce a uma taxa exponencial $x^{2+f}$. 

O prejuízo nasce do descompasso entre o preço de entrada (Odds) e o custo de saída (RIO + Perda de Valuation).

---

## 4. O Fator Ψ (A Taxa de Maluquice Humana)

Ignorar o desvio emocional populacional é um erro fatal. A decisão no River deve integrar a **Frequência de Bobagem Humana** ($f_b$):

> **P(Call Ganho) = P(Nuts Representado) + P(Tilt/Bluff Irracional)**

Se a probabilidade do oponente ter o nuts é de 4%, mas a taxa estatística de "besteira humana" naquele spot é de 10%, o call é obrigatório por Perspectiva, mesmo que o GTO sugira o contrário.

---

## 5. Antevisão e Table Draw

O Future Game Simulation (FGS) tradicional é cego para o relógio. O motor SOTA integra variáveis de sistemas abertos:
*   **Erosão Antecipada (t-3):** O salto de blinds iminente altera o EV_fold presente.
*   **Urgecia Posicional:** Ser UTG agora e BB na próxima mão cria uma assimetria de urgência que força a agressão antecipada para evitar a "morte por inanição".
`;

export default function ManifestoAxiomasPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Manifesto SOTA"
        subtitle="Axiomas da Perspectiva: A união entre Teoria dos Jogos e Psicologia de Sistemas."
        category="Doutrina"
        icon="fa-scroll"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-10 lg:p-16 border-t-8 border-t-accent-indigo">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="Manifesto SOTA | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/manifesto-sota-axiomas"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
