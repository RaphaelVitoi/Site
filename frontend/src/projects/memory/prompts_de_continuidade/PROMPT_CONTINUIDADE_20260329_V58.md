---
name: Prompt de Continuidade V58 - 2026-03-29
description: Motor pós-flop HU conectado ao simulador. RP por street derivado do motor (não mais escala proporcional). PostFlopPanel para validação visual disponível.
type: project
---

# Prompt de Continuidade V58 — 2026-03-29

## Commits desta sessão
| Hash | Descrição |
|------|-----------|
| `8566e97` | fix: buildInsight threshold usa esperancaRealizadaPct quando R<1 + docs framework PM v2 |
| `b48ba02` | refactor: renomear motor calculatePerspectiva→MapaICM + corrigir hierarquia conceitos-icm + 5º arquétipo |
| `f42712a` | fix: "Perspectiva Realizada" → "Esperança Efetiva" no PerspectivePanel |
| `b30d62b` | docs: validação matemática formal hipóteses paradigmáticas v1 (T1+T2+T3) |
| `b814987` | docs: derivação Er(S) via teoria da informação (T4) |
| `41157e5` | docs: D5 — EV_fold dinâmico f(t,d_pj,pos) 3 dimensões |
| `0101633` | docs: corrigir hierarquia D5 — −investido é a 1ª ordem |
| `760e2f8` | docs: objetivo final PM no topo do documento |
| `dd4e7d3` | docs: D6 — PM pós-flop por street completo |
| `5ae1dd1` | feat: rpDeriver — derivePostFlopRps HU (EV_fold/SPR/R por street) |
| `36ac722` | refactor: rpDeriver pós-flop HU — MW removido (standby) |
| `c4cf655` | feat: PostFlopPanel HU — validação visual no MasterSimulator |
| `6fc54dc` | feat: conectar derivePostFlopRps ao effectiveSprData — RP derivado do motor |

## Estado do código

- Zero erros TypeScript em todos os arquivos modificados
- `derivePostFlopRps` em `rpDeriver.ts` — HU only, MW standby
- `PostFlopPanel` — tab "Pós-Flop HU" no MasterSimulator com sliders por street
- `effectiveSprData` no MasterSimulator agora usa `derivePostFlopRps` (RP real, não escala proporcional)
- `calculateMapaICM`, `calculateEsperanca`, `rpDeriver` — motor completo HU pré+pós-flop

## Estado das derivações

Arquivo: `docs/research/validacao_matematica_hipoteses_v1.md`

| D | Status |
|---|--------|
| D1: EV_fold(ICM) > 0 | Teorema |
| D2: RIO(N) ~ O(N²) | Teorema |
| D3: Ci < 1 para N ≥ N* | Teorema |
| D4: Er(S) = (ΔH/σ) × log(S) | Hipótese estruturada |
| D5: EV_fold(t, d_pj, pos) | Hipótese estruturada — 3 dimensões ortogonais |
| D6: PM_street completo | Mapeado — implementado no motor |

## Próximas tarefas (em ordem — não perguntar)

### 1. Validação: comparar RP derivado vs valores HRC calibrados
- Cenário "paradoxo": HRC calibrou oopRp=12.9 (PRE). Motor deriva a partir de stacks [40,55].
- Verificar se os valores derivados por street fazem sentido vs os ilustrativos calibrados
- Se houver divergência significativa, investigar se é limitação do modelo (potTotal simétrico)

### 2. NashPanel: exibir EV_fold_street junto ao RP por street
- `postFlopRps.flop.evFoldStreet` já existe — surfaçar na UI
- Mostrar ao usuário: "foldar aqui custa −Xbb" por street

### 3. MDF pós-flop HU (quando teoria HU estiver validada)
- Formalizar após validação numérica do motor
- MW: standby até HU estar funcional

### 4. PKO revisão (explicitamente último)

## Standby

- MW (nAtivos, RIO_mw no simulador)
- PKO revisão com Perspectiva como base
- MDF pós-flop MW
- Motor completo de board texture (R real por textura)
