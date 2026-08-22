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
import Link from 'next/link';

const content = `
# Laboratório Toy Games (Paradigma VITOI)

No **Paradigma VITOI**, reduzimos a complexidade sistêmica a **Toy Games** — abstrações que isolam mecanismos sob inputs explícitos. Aqui, o foco não é certificar frequências GTO, mas formular e confrontar hipóteses sobre assimetrias de risco sob ICM.

---

## 1. Conceitos Centrais de Raphael Vitoi

### A. Fronteira de defesa sob RP (hipótese)
O termo “teto do RP” descreve uma hipótese de fronteira de defesa. Não há limiar universal em 6%, 40% ou outra taxa: a defesa depende de payout, stacks, ranges, sizing e árvore. O Toy Game testa mecanismo, não transfere frequências diretamente à mesa real.

### B. Vantagem de Risco (Risk Advantage)
Calculada como $\\Delta RP = RP_{agressor} - RP_{defensor}$. É um descritor proposto de assimetria, não uma proporção direta de agressividade permitida.

### C. Negação de Perspectiva (hipótese)
"Negação de Perspectiva" é uma hipótese sobre como a pressão de sobrevivência pode alterar incentivos relativos. Ela precisa de definição operacional, ranges e árvore para sair do nível de narrativa e ser confrontada por cálculo.

### D. Especulação Assimétrica (hipótese)
O Mid-stack pode ter incentivos que não aparecem em pot odds isoladas. A hipótese é que um investimento controlado altera valor futuro relativo; a conclusão depende de ranges, posições, tree e transições explicitamente modeladas.

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
1. **TG1 (ChipEV):** fixture de referência com IP 6v+3b e OOP call de 50%.
2. **TG2 (OOP RP=6%):** fixture que testa IP com 4,2 combos de blefe e ajuste de defesa.
3. **TG3 (OOP RP=9%):** fixture que testa IP com 5 combos de blefe; a resposta precisa ser resolvida, não presumida.
4. **TG4 (OOP RP=18%):** fixture 6v vs 8b para comparar respostas sob maior pressão declarada.

### Parte II - OOP RP=3% fixo, IP RP progressivo (9% → 21%)
1. **TG1 (IP RP=9%):** fixture de mudança de RP do agressor contra a mesma estrutura base.
2. **TG2 (IP RP=18%):** fixture que mantém um range proposto para observar a sensibilidade do defensor.
3. **TG3 (IP RP=21%):** fixture para medir o efeito; nenhuma frequência de fold é assumida como resultado antes da resolução.

**Mecanismo a testar:** alterar stacks pode modificar valores relativos e opções futuras. A direção e a magnitude do efeito exigem payouts, árvore e modelo de transição; não há regra geral de que um call ou fold seja preferível.
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

          <aside className="rounded-2xl border border-accent-indigo/25 bg-accent-indigo/5 p-6" aria-label="Método do laboratório">
            <p className="m-0 text-[0.7rem] font-black uppercase tracking-[0.16em] text-accent-indigo-light">
              Método antes de conclusão
            </p>
            <p className="mb-4 mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">
              Os Toy Games são o estudo verificado de mecanismos sob cenários controlados. Compare
              primeiro com uma baseline rastreável e só transporte um resultado depois de declarar
              ranges, árvore, versão do motor e limites do novo spot.
            </p>
            <Link
              href="/simulador?scenario=icmev-puro"
              className="inline-flex min-h-12 items-center rounded-xl border border-accent-indigo/40 bg-accent-indigo/10 px-4 text-sm font-bold text-white transition-colors hover:bg-accent-indigo/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-indigo"
            >
              Abrir baseline ICM no Master Simulator
            </Link>
          </aside>

          <div className="relative z-10 w-full">
            <PostFlopPanel scenarioId="toy_game_iso" activePlayers={2} heroIsIp={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
