---
name: Prompt de Continuidade V56 - 2026-03-29
description: Derivação 5 (EV_fold dinâmico) formalizada em 3 dimensões ortogonais. 5 derivações completas. Próximo: transpor para pós-flop → motor.
type: project
---

# Prompt de Continuidade V56 — 2026-03-29

## Commits desta sessão (ordem cronológica)
| Hash | Descrição |
|------|-----------|
| `8566e97` | fix: buildInsight threshold usa esperancaRealizadaPct quando R<1 + docs framework PM v2 |
| `b48ba02` | refactor: renomear motor calculatePerspectiva→MapaICM + corrigir hierarquia conceitos-icm + 5º arquétipo |
| `f42712a` | fix: "Perspectiva Realizada" → "Esperança Efetiva" no PerspectivePanel |
| `b30d62b` | docs: validação matemática formal hipóteses paradigmáticas v1 (T1+T2+T3) |
| `b814987` | docs: derivação Er(S) via teoria da informação + tabela síntese atualizada (T4) |
| `41157e5` | docs: derivação formal EV_fold dinâmico f(t, d_pj, pos) — 3 dimensões ortogonais + tabela síntese final (D5) |

## Estado do código

- Zero erros TypeScript em todos os arquivos modificados
- `calculateMapaICM` = M-H distribution (motor — nome Perspectiva liberado)
- `calculateEsperanca` com Fator R, `loseTierShift`, `esperancaRealizada`
- `rpDeriver` = RP diluído por street (ponte para motor pós-flop futuro)
- PerspectivePanel: `buildInsight` usa `esperancaRealizadaPct` quando R<1 (label: "Esperança Efetiva")
- conceitos-icm: hierarquia corrigida (Esperança→Expectativa→Perspectiva, definições formais)
- icm-masterclass: 5 arquétipos publicados (incl. "Transferência do Risco")

## Estado das derivações matemáticas

Arquivo: `docs/research/validacao_matematica_hipoteses_v1.md`

| Hipótese | Status |
|----------|--------|
| EV_fold(ICM) > 0 | **Teorema** — condição suficiente formal via M-H |
| EV_fold(chipEV) < 0 sempre | **Teorema** — corolário direto |
| RIO(N) ~ O(N²) | **Teorema** — produto frequência O(N) × custo O(N) |
| Ci < 1 para N ≥ N* | **Teorema** — consequência direta de RIO, limiar calculável |
| Er(S) = (ΔH/σ) × log(S) | **Hipótese estruturada** — justificativa via teoria da informação |
| EV_fold(t, d_pj, pos) | **Hipótese estruturada** — 3 dimensões ortogonais com formas funcionais |
| Frequência MW ~33% | **Hipótese empírica** — aguarda MDA |

### D5: EV_fold dinâmico — resumo das formas funcionais

```
EV_fold(t, d_pj, pos) = EV_fold_base(s)
                        + ΔEV_temporal(t)        # ≤ 0: torna fold mais caro quando t→0
                        + ΔEV_payjump(d_pj)      # > 0 quando d_pj→0 e múltiplos shorts
                        − C_pos                  # ≥ 0: custo marginal de posição
```

- Dimensão `t`: `ΔEV_temporal(t) = −(1 − t/T_level) × ΔM × EV_per_orbit`
- Dimensão `d_pj`: forma explícita via M-H, limiar `d_pj*` calculável com stacks + prizes reais
- Dimensão `pos`: `C_pos(UTG) ≈ antes + 1.5bb × P_surv` (6-handed)
- Caso crítico: `d_pj=1 E t→0` — sem dominância estrutural, depende de magnitudes

## Próximas tarefas (em ordem — não perguntar)

### 1. Transpor derivações para pós-flop (preparação do motor)
- EV_fold por street: `EV_fold_street = −pot_acumulado_até_street`
- RIO por street: pot entrapment como variável dinâmica (amplifica RIO em O(N²) por street)
- Ci por street: recalcular a cada street com equity residual do hero
- Er(SPR): SPR como proxy de profundidade — `Er(SPR) ∝ log(SPR)` acima do threshold de saturação
- Escrever como "Derivação 6" no mesmo arquivo de validações
- Base natural: `rpDeriver.ts` já faz RP diluído por street

### 2. Motor pós-flop
- Expandir `rpDeriver.ts` com EV_fold dinâmico por street
- Novo modo no MasterSimulator: "cenário pós-flop"
- Diferenciacl competitivo máximo do produto

### 3. PKO — revisão com Perspectiva como base
- Explicitamente último
- Modelo atual: `effectiveRp × (1 − pkoValue)` — não captura assimetria de bounty

## Feedbacks críticos

- **Refinamento proativo:** quando fundamentado na teoria, refinar sem consultar. Só pedir permissão para nova matemática não fechada, ambiguidade de paradigma ou ação irreversível.
- **Nunca perguntar ordem:** elaborar autônomamente a sequência que elimina retrabalho e alcança excelência.

## Standby (não implementar sem autorização)

- Motor pós-flop completo na UI
- EV_fold dinâmico como input no simulador
- MDF em ICM com variáveis monetárias
- Fator Ψ como variável de input
- PKO revisão com Perspectiva como base
