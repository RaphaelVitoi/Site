# 🔍 Calibração Empírica: 93 Nodes (Aula 1.2)

> **Contexto:** Esta é a "Âncora de Ouro" do sistema SOTA. Representa o ponto de verdade onde o motor algorítmico foi calibrado contra outputs reais de solvers (HRC vs GTO Wizard).

---

## O Cenário Âncora

- **Mesa:** Final Table (9 jogadores restantes).
- **Hero:** BTN (38bb - $RP_{ida} = 21.4\%$).
- **Vilão:** BB (53bb - $RP_{volta} = 12.9\%$).
- **Vantagem de Risco ($\Delta RP$):** 8.5%.
- **Estrutura de Prêmios:** FLAT ($1^{st} = 18.8\%$).

---

## Nodes de Referência (Amostra)

| Street | Ação | Conclusão SOTA |
| :--- | :--- | :--- |
| **Pré-flop** | BTN Shove vs BB | BB fold estrutural de ~78% devido ao Teto do RP. |
| **Flop (KJT)** | C-bet (small) | IP (BTN) mantém agressividade devido à Vantagem de Risco. |
| **Turn (2d)** | Barrel (pol) | Diluição do RP começa a operar; OOP defende no Teto. |
| **River (3h)** | Shove | O abismo do $EV_{fold}$ dita a decisão Soberana. |

---

## Invariâncias Matemáticas

1. **O Teto de Equidade:** No river, a equidade necessária para call em ICM nunca ultrapassa ~45% (mesmo contra ranges polarizados), devido ao custo de eliminação.
2. **Efeito de Irradiação:** A mera presença de micro-stacks (ex: UTG com 9bb) comprime os ranges de call do BB, forçando o "Fold Estrutural" mesmo contra blefes estatísticos.
3. **Pot Entrapment:** A partir do Turn, o custo de foldar um pote onde já se investiu >30% do stack torna-se violentamente negativo, forçando calls que o ChipEV consideraria "loose".

---
*Fonte: Extração SOTA v4.6, 2026. Dados validados via `nashSolver.test.ts`.*
