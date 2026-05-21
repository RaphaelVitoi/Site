/**
 * IDENTITY: Toy Games (Predator Mode) (Artigo Interativo)
 * PATH: src/app/biblioteca/toy-games/page.tsx
 * ROLE: Artigo técnico demonstrando abstrações matemáticas GTO (Polaridade, Nuts Advantage).
 */

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import PostFlopPanel from "@/components/simulator/panels/PostFlopPanel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";

const content = `
# Toy Games: A Destilação do Confronto

O poker real possui uma árvore de ramificações na casa de 10^160, tornando a análise a olho nu impossível. Para entendermos a física fundamental que rege as decisões do Solver, nós reduzimos o ecossistema a **Toy Games** (Jogos de Brinquedo) — abstrações cirúrgicas e controladas que expõem o esqueleto do Equilíbrio de Nash.

---

## 1. A Vantagem de Nuts (Predator Mode)

Quando a textura da mesa e a ação pré-flop ditam que o **seu range** contém as mãos imbatíveis (Nuts) e o range do oponente é **capado** (limitado a pares medianos), o sistema permite que você ative o *Predator Mode*.

A matemática dita que a sua estratégia deve ser **altamente polarizada**. Você usa *Overbets* (150% a 200% do pote) para colocar o range capado do oponente em "Indiferença de Bluff-Catch". Como ele não possui os Nuts para reagir por cima, ele é forçado a realizar *folds estruturais* dolorosos, permitindo que você realize a sua equidade de forma tirânica.

---

## 2. A Vantagem de Range (Pressão Condensada)

Em oposição à Vantagem de Nuts, a **Vantagem de Range** ocorre quando quase todo o seu agrupamento de mãos retém mais de 55% de equidade contra o oponente.

Aqui, o *Predator Mode* muda de forma: a frequência sobe, mas o tamanho (sizing) desce. Você aposta 30% do pote em quase 100% das vezes. Essa *C-Bet condensada* extrai valor, nega equidade e empurra a árvore de decisão para a próxima street de forma barata.

---

## 3. O Microscópio Pós-Flop

No painel abaixo, isole as pressões do jogo. Analise o "Stack to Pot Ratio (SPR)" e observe as sugestões da Mente Coletiva sobre a aplicação de pressão na árvore pós-flop, visualizando como a geometria do pote reage quando a polaridade muda.
`;

export default function ToyGamesPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="Toy Games (Predator Mode)"
        subtitle="A abstração laboratorial das dinâmicas GTO: Polarização, Vantagem de Nuts e Isolamento de Ranges."
        category="Laboratórios & Exegese"
        icon="fa-microscope"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo shadow-2xl group transition-colors hover:border-l-accent-rose">
            <SotaMarkdown content={content} />
          </GlassPanel>

          <div className="w-full relative z-10">
            <PostFlopPanel
              scenarioId="toy_game_iso"
              activePlayers={2}
              heroIsIp={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
