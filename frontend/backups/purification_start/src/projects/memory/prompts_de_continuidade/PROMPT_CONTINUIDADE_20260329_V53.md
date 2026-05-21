---
name: Prompt de Continuidade V53 - 2026-03-29
description: Renomeação motor concluída. conceitos-icm hierarquia corrigida. 5º arquétipo adicionado. Label "Perspectiva Realizada" pendente. PKO standby.
type: project
---

# Prompt de Continuidade V53 — 2026-03-29

## Commits desta sessão
| Hash | Descrição |
|------|-----------|
| `8566e97` | fix: buildInsight threshold usa esperancaRealizadaPct quando R<1 + docs framework PM v2 |
| `b48ba02` | refactor: renomear motor calculatePerspectiva→MapaICM + corrigir hierarquia conceitos-icm + 5º arquétipo |

## O que foi feito nesta sessão (V53)

### 1. Renomeação do motor — CONCLUÍDA

Arquivos modificados: `perspectiva.ts`, `rpDeriver.ts`, `perspectiva.test.ts`, `PerspectivePanel.tsx`

| Antigo | Novo |
|--------|------|
| `calculatePerspectiva` | `calculateMapaICM` |
| `PerspectiveResult` | `MapaICMResult` |
| `currentPerspectiva` | `currentMapaICM` |
| `winPerspectiva` | `winMapaICM` |
| `losePerspectiva` | `loseMapaICM` |
| `// === PERSPECTIVA (M-H)` | `// === MAPA ICM (M-H)` |

"Perspectiva Matemática" agora está livre para a síntese definitiva.

### 2. conceitos-icm/page.tsx — CORRIGIDA

**Hierarquia corrigida:** Esperança(2) → Expectativa(3) → Perspectiva(4)

**O que mudou:**
- Esperança (seção 2): equação usa ΔEquity em vez de ΔPerspectiva (que agora é a síntese); adicionado threshold correto do fold; pipeline completo como callout
- Expectativa (seção 3): reescrita como preditiva com cadeia futura (SE X, o que muda no FGS e Esperança futura?); exemplo CL encadeado
- Perspectiva (seção 4): reescrita como síntese definitiva; PM equation formal; propriedade competitiva
- Seção 5: "Perspectiva é Malmuth-Harville" corrigido para "Mapa ICM usa Malmuth-Harville"
- Callout relação hierárquica: ordem corrigida

### 3. 5º arquétipo — ADICIONADO

`icm-masterclass/page.tsx` agora publica os 5 arquétipos de `geometria_texto.md`.

Arquétipo V: "Transferência do Risco" — Open-Shove transfere peso volitivo, BB perde capacidade de re-agressão, colapso para overfold matemático.

## Pendências

### Menor — Label no PerspectivePanel
- "Perspectiva Realizada" no painel é tecnicamente "Esperança Realizada (com R)" — aguarda decisão de Raphael sobre nomenclatura definitiva

### Standby (não implementar sem autorização)
- PKO: revisão com base na Perspectiva como novo paradigma — explicitamente último
- EV_fold dinâmico f(t, d_pj, pos): matemática não fechada — sem UI, sem implementação
- MDF em ICM com variáveis monetárias
- Fator Ψ como variável de input
- FGS Vitoi expandido

## Estado do motor

- Zero erros TypeScript
- `calculateMapaICM` = M-H distribution (liberado o nome Perspectiva)
- `calculateEsperanca` = Esperança estratégico-lógica com Fator R
- `rpDeriver` = RP diluído por street
- PerspectivePanel: buildInsight usa esperancaRealizadaPct quando R<1
