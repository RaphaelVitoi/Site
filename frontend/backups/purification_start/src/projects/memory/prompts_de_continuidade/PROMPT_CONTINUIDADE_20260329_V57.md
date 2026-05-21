---
name: Prompt de Continuidade V57 - 2026-03-29
description: D6 completo (PM pós-flop por street). PKO e MW contexto lido — standby. D1–D6 fechadas. Próximo motor pós-flop.
type: project
---

# Prompt de Continuidade V57 — 2026-03-29

## Commits desta sessão
| Hash | Descrição |
|------|-----------|
| `8566e97` | fix: buildInsight threshold usa esperancaRealizadaPct quando R<1 + docs framework PM v2 |
| `b48ba02` | refactor: renomear motor calculatePerspectiva→MapaICM + corrigir hierarquia conceitos-icm + 5º arquétipo |
| `f42712a` | fix: "Perspectiva Realizada" → "Esperança Efetiva" no PerspectivePanel |
| `b30d62b` | docs: validação matemática formal hipóteses paradigmáticas v1 (T1+T2+T3) |
| `b814987` | docs: derivação Er(S) via teoria da informação + tabela síntese atualizada (T4) |
| `41157e5` | docs: derivação formal EV_fold dinâmico f(t, d_pj, pos) — 3 dimensões ortogonais (D5) |
| `0101633` | docs: corrigir hierarquia D5 — EV_fold = −investido é a primeira ordem |
| `760e2f8` | docs: adicionar objetivo final PM no topo — equação formal como norte das derivações |
| `dd4e7d3` | docs: D6 — PM pós-flop completo: EV_fold/RIO/R/Valuation por street + tabela síntese |

## Estado das derivações — TODAS FECHADAS

Arquivo: `docs/research/validacao_matematica_hipoteses_v1.md`

| Derivação | Status |
|-----------|--------|
| D1: EV_fold(ICM) > 0 | Teorema — condição suficiente via M-H |
| D2: RIO(N) ~ O(N²) | Teorema — produto freq O(N) × custo O(N) |
| D3: Ci < 1 para N ≥ N* | Teorema — consequência direta de D2 |
| D4: Er(S) = (ΔH/σ) × log(S) | Hipótese estruturada — teoria da informação |
| D5: EV_fold(t, d_pj, pos) | Hipótese estruturada — 3 dimensões ortogonais; baseline = −investido (1ª ordem) |
| D6: PM_street por street | Mapeado — todos os componentes transpostos; base = rpDeriver.ts |

## Contexto PKO e MW (lido — standby)

**PKO** (source: `project_pko_feature_idea.md` + `SPEC_SIMULADOR_ICM_GLOBAL.md` seção 6.3):
- Motor atual: `effectiveRp × (1 − pkoValue)` — não captura assimetria bidirecional
- SPEC da aula: RP positivo do bounty (cobrir = capturar) + equity drop negativo do ICM, forças opostas simultâneas
- Revisão futura: modelar as duas forças separadamente antes de combinar, com Perspectiva como base
- Status: standby — implementar só após motor pós-flop

**MW (multiway)** — não é feature separada, é o `RIO_mw` na equação PM:
- D2+D3 derivam o passivo estrutural; D6 mapeia por street com `N_ativos` como parâmetro dinâmico
- No motor pós-flop: `RIO_mw_street = P(dominado | board_i, N_ativos) × pot_acumulado_i`
- Alinha com o propósito do produto: PM como métrica superior ao chipEV e ao ICM EV isolado

## Próximas tarefas (em ordem — não perguntar)

### 1. Motor pós-flop — extensão do rpDeriver.ts
- Adicionar `potAcumulado` como estado por street
- `EV_fold_street = −potAcumulado_hero`
- `RIO_mw_street` com `pot_acumulado` como base
- `R_street` com equity residual + textura do board
- `Valuation_stack_street` com stack remanescente após cada investimento

### 2. Novo modo no MasterSimulator: "cenário pós-flop"
- Cereja do produto — diferencial competitivo máximo

### 3. PKO revisão com Perspectiva como base
- Explicitamente último
- Modelar RP_bounty e equity_drop_ICM como forças independentes antes de combinar

## Estado do código

- Zero erros TypeScript em todos os arquivos modificados
- `calculateMapaICM` = M-H distribution
- `calculateEsperanca` com Fator R, `loseTierShift`, `esperancaRealizada`
- `rpDeriver` = RP diluído por street — ponte natural para D6
- PerspectivePanel: `buildInsight` usa `esperancaRealizadaPct` quando R<1

## Feedbacks críticos

- **Primeira ordem antes de segunda ordem:** em derivações, expor o componente dominante (1ª ordem) primeiro; correções contextuais são 2ª ordem e jamais devem ser o foco principal.
- **Refinamento proativo:** quando fundamentado na teoria, refinar sem consultar.
- **Nunca perguntar ordem:** elaborar autonomamente a sequência que elimina retrabalho.

## Standby (não implementar sem autorização)

- Motor pós-flop completo na UI
- EV_fold dinâmico como input no simulador
- MDF em ICM com variáveis monetárias
- Fator Ψ como variável de input
- PKO revisão com Perspectiva como base
- MW feature (RIO_mw no simulador)
