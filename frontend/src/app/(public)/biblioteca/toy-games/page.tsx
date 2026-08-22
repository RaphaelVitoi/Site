/**
 * IDENTITY: Toy Games GOLD (Predator Mode)
 * PATH: src/app/biblioteca/toy-games/page.tsx
 * ROLE: Artigo técnico demonstrando abstrações matemáticas GTO (Polaridade, Nuts Advantage).
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import PostFlopPanel from '@/components/simulator/panels/PostFlopPanel';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# Laboratório Toy Games (Paradigma VITOI)

No **Paradigma VITOI**, reduzimos a complexidade sistêmica a **Toy Games** — abstrações cirúrgicas que expõem as invariâncias matemáticas do equilíbrio. Aqui, o foco não é apenas GTO, mas a exploração das assimetrias de risco e o colapso das defesas sob pressão de ICM.

---

## 1. Conceitos Centrais de Raphael Vitoi

### A. Fronteira de defesa sob RP (hipótese)
O termo “teto do RP” descreve uma hipótese de fronteira de defesa. Não há limiar universal em 6%, 40% ou outra taxa: a defesa depende de payout, stacks, ranges, sizing e árvore. O Toy Game testa mecanismo, não transfere frequências diretamente à mesa real.

### B. Vantagem de Risco (Risk Advantage)
Calculada como $\\Delta RP = RP_{agressor} - RP_{defensor}$. É um descritor proposto de assimetria, não uma proporção direta de agressividade permitida.

### C. Negal de Perspectiva
O CL não briga por fichas; briga por **Perspectiva Matemática**. Ele aposta para negar perspectiva alheia, mantendo rivais "algemados" pela pressão de sobrevivência.

### D. Especulação Assimétrica
O Mid-stack entra no pote não por *pot odds*, mas por **implied odds de ICM**. Investe pouco, absorve agressividade obrigatória do CL, e realiza equity passivamente. Se acerta, sua Perspectiva explode, enquanto o CL sofre pouco dano relativo.

### E. Fold Estrutural (A Falácia do "Overfold")
Uma frequência alta de fold pode ser ótima em um cenário de ICM severo, mas só é “GTO” depois de resolver a árvore e publicar suas premissas. “Fold estrutural” é uma etiqueta didática, não um veredito automático.

---

## 2. Estrutura dos Toy Games (Âncora Aula 1)

**Cenário Base:**
- **Board:** 22223 (Polarização Absoluta)
- **Range IP:** AA, QQ, JJ (18 combos)
- **Range OOP:** KK (6 combos - bluffcatcher puro)
- **Pote:** 100 | **Aposta:** 100 (Pot-size all-in)

### Parte I - IP RP=3% fixo, OOP RP progressivo (0% → 24%)
1. **TG1 (ChipEV):** IP 6v+3b, OOP call 50% (MDF perfeito).
2. **TG2 (OOP RP=6%):** IP bluffs aumentam para 4.2 combos. OOP folda levemente mais.
3. **TG3 (OOP RP=9%):** IP bluffs aumentam para 5 combos. OOP atinge o **TETO** e para de foldar. IP explora bluffando mais.
4. **TG4 (OOP RP=18%):** IP 6v vs 8b (desequilíbrio total). OOP mantém o mesmo Teto de defesa.

### Parte II - OOP RP=3% fixo, IP RP progressivo (9% → 21%)
1. **TG1 (IP RP=9%):** IP bluffs levemente acima do ChipEV. OOP com RP baixo paga **MENOS**.
2. **TG2 (IP RP=18%):** IP mantém range bluff-heavy. OOP folda cada vez mais.
3. **TG3 (IP RP=21%):** OOP chega a ~80% de fold contra o mesmo range do IP.

**Mecanismo:** Dobrar o IP (agressor) aumenta a stack dele e reduz a pressão ICM da mesa inteira, beneficiando todos os outros jogadores. O custo de "dar fichas" ao nêmesis supera o EV de capturar o blefe.
`;

export default function ToyGamesPage() {
  return (
    <div className="bg-bg-base text-text-bright min-h-screen pb-24">
      <ContentPageHeader
        title="Toy Games (Predator Mode)"
        subtitle="A abstração laboratorial das dinâmicas GTO: Polarização, Vantagem de Nuts e Isolamento de Ranges."
        category="Laboratórios & Exegese"
        icon="fa-microscope"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-16">
          <GlassPanel className="border-l-accent-indigo group hover:border-l-accent-rose border-l-4 p-8 shadow-2xl transition-colors lg:p-12">
            <SotaMarkdown content={content} />
          </GlassPanel>

          <div className="relative z-10 w-full">
            <PostFlopPanel scenarioId="toy_game_iso" activePlayers={2} heroIsIp={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
