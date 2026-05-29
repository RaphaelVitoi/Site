---
name: Prompt de Continuidade V28
description: Estado da sessao 20260322/23 - Mobile responsive (Fase C) implementado. CSS classes responsivas, grids que empilham em <=800px, fontSize corrigidos. Pendente A (EquityCalculator refinamento) e B (paineis interativos).
type: project
---

# Continuidade — Sessão 20260322 V28

## Ultimo commit pendente (mudancas nao commitadas)
Mudancas da sessao atual (Fase C - Mobile Responsive):

### Arquivos modificados:
1. `frontend/src/components/simulator/simulator.module.css`
   - Novas classes: `.refGrid2Col`, `.calcGrid2Col`, `.matchupGrid2Col`
   - Media query @800px: grids empilham para 1fr, tabs compactam
   - Media query @600px: gap reduzido, glassPanel border-radius 16px, SPR pipeline wrap
2. `frontend/src/components/simulator/ReferencialAula12.tsx`
   - Import styles adicionado
   - Grid 2-col inline substituido por `className={styles.refGrid2Col}`
3. `frontend/src/components/simulator/panels/EquityCalculator.tsx`
   - Grid stacks/payouts: className={styles.calcGrid2Col}
   - 7x fontSize 0.55rem → 0.58rem (threshold minimo)
4. `frontend/src/components/simulator/panels/MatchupSelector.tsx`
   - 4x fontSize 0.52rem → 0.58rem
   - 2x fontSize 0.55rem → 0.58rem

### TypeScript: compila sem erros

## Commits sessao anterior (V27)
1. `e06f007` - ReferencialAula12: grid 2-col, fichas BTN equalizadas
2. `ecc2c3f` - Legenda simetrica grid 3-col
3. `eac1b93` - pct1 dinamico, threshold TOP-HEAVY
4. `5a1c0de` - Legenda com framework Raphael (5 tipos)
5. `2596649` - Denominador TOTAL_POOL, classificacao FLAT
6. `96f3531` - NashPanel tooltips portal + fontSize fix

## O que ja funciona no mobile (Fase C):
- Grids 2-col empilham em telas <=800px
- Tables ja tinham overflowX auto
- SVG mesa escala via viewBox
- Legenda premios usa auto-fit (ja responsiva)
- Ranges usam flexWrap (ja responsivos)
- SPR pipeline wraps em <=600px
- Nenhum fontSize abaixo de 0.58rem em todo o simulador

## Pendente: Fase A - Refinamento EquityCalculator
O componente funciona mas precisa de:
- Resumo visual: total de fichas, pool total, range de BF
- Insight ICM vs ChipEV: quem ganha/perde equity na transicao
- Melhor hierarquia visual nos resultados (barras duplas ja existem mas sem rotulo claro)
- Arquivo: `frontend/src/components/simulator/panels/EquityCalculator.tsx`
- Engine: `frontend/src/lib/icmEngine.ts` (Malmuth-Harville)

## Pendente: Fase B - Paineis Interativos
1. **ComparisonRadar** (`panels/ComparisonRadar.tsx`)
   - Usa Recharts RadarChart
   - Campos bluff/defense zerados (pendente: conectar ao NashResult)
   - NashResult tem ip.bet_small/bet_large/check e oop.call/fold/raise
   - Precisa: receber nashFlop como prop, extrair bluff=ip.bet_small.center+ip.bet_large.center, defense=oop.call.center
   - Adicionar como overlay no ScenarioStage ou como tab separado

2. **MatchupSelector** (`panels/MatchupSelector.tsx`)
   - Componente completo e funcional
   - Depende de `engine/ftEnvironments.ts`
   - Precisa: integrar como terceiro tool tab no MasterSimulator
   - fontSize ja corrigidos nesta sessao

3. **MasterSimulator** (`MasterSimulator.tsx`)
   - TOOL_BUTTONS atualmente: scenario, calculator
   - Adicionar: matchup (MatchupSelector), comparar (ComparisonRadar)
   - Lazy load para ambos

## Estado geral
- Servidor rodando, HTTP 200
- 20/20 testes passam
- Teoria ICM consolidada em memoria
- Classificacao estruturas validada (FLAT 18.8%)
- TOTAL_POOL pendente confirmacao valor exato
