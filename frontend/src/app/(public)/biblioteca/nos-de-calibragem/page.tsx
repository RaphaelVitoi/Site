/**
 * IDENTITY: Nós de Calibração GOLD (Artigo Interativo)
 * PATH: src/app/biblioteca/nos-de-calibragem/page.tsx
 * ROLE: Artigo técnico demonstrando a calibração empírica dos nodes ICM.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# 🔍 Calibração Empírica: 93 Nodes (SOTA v6)

> **Contexto:** Esta é a "Âncora de Ouro" do ecossistema SOTA. Representa o ponto de verdade absoluta onde o motor algorítmico foi calibrado contra outputs reais e pesados de solvers institucionais (HRC vs GTO Wizard).

---

## 1. O Cenário Âncora

- **Mesa:** Final Table (9 jogadores restantes).
- **Hero:** BTN (38bb - $RP_{ida} = 21.4\\%$).
- **Vilão:** BB (53bb - $RP_{volta} = 12.9\\%$).
- **Vantagem de Risco ($\\Delta RP$):** 8.5%.
- **Estrutura de Prêmios:** FLAT ($1^{st} = 18.8\\%$).

---

## 2. Nodes de Referência (Amostra Sintética)

| Street | Ação | Conclusão SOTA |
| :--- | :--- | :--- |
| **Pré-flop** | BTN Shove vs BB | Exemplo de hipótese: a frequência de fold deve ser calculada para ranges, stacks e payouts publicados. |
| **Flop (K-J-T)** | C-bet (small) | Cenário para testar como IP, OOP e sizing mudam realização e equidade. |
| **Turn (2d)** | Barrel (pol) | Hipótese de alteração de incentivos; comparar com baseline de árvore idêntica. |
| **River (3h)** | Shove | A decisão depende de pot odds, ranges, ICM e da convenção de EV declarada. |

---

## 3. Invariâncias Matemáticas Mapeadas

### A. Equidade de call no river
No river, a equidade necessária para pagar um shove muda com pot odds, ranges, stacks, payouts e bounties. Nenhuma faixa fixa, como 45%, pode ser transferida sem resolver o cenário correspondente.

### B. Efeito de Irradiação de Stacks
A presença de micro-stacks pode alterar incentivos de call de stacks médios e grandes. O efeito deve ser calculado para o estado concreto; “fold estrutural” é uma etiqueta didática, não uma frequência automática.

### C. Pot Entrapment (Inércia de Investimento)
A partir do Turn, o material propõe investigar como comprometimento de pote, realização e ICM alteram a comparação entre linhas. Um investimento acima de 30% do stack não determina a ação: custo afundado, ranges e preço marginal continuam relevantes.

---
*Fonte: cenário SOTA v6, 2026. A WASM Equity Engine executa cálculo para seus inputs; o cenário não é dado validado sem artefatos, versão e reprodução independente.*
`;

export default function NosDeCalibragemPage() {
  return (
    <div className="bg-bg-base text-text-bright min-h-screen pb-24">
      <ContentPageHeader
        title="Nós de Calibração"
        subtitle="A validação empírica e ancoragem matemática do Motor ICM."
        category="Biblioteca Analítica"
        icon="fa-anchor"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col gap-12">
          <GlassPanel className="border-l-accent-indigo group hover:border-l-accent-cyan border-l-4 p-8 shadow-2xl transition-colors lg:p-12">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
