---
name: Prompt de Continuidade V29
description: Sessao 20260322 - Perspectiva/Esperanca implementado (engine + UI + 5o tab). rpDeriver conecta motores. Solver renomeado para IcmDistortion. fontSize 0.58rem enforced globalmente. Auditoria teoria+visual completa.
type: project
---

# Continuidade — Sessao 20260322 V29

## Implementado nesta sessao

### Fase A - EquityCalculator Refinamento
- Resumo visual: 4 cards (Jogadores, Fichas, Pool, BF Range)
- Delta ICM: badge colorido chip% vs ICM% por jogador
- Barras sobrepostas (ICM sobre fichas)
- Insight ICM automatico (quem ganha/perde mais)
- Arquivo: `frontend/src/components/simulator/panels/EquityCalculator.tsx`

### Fase B - Paineis Interativos
- ComparisonRadar: bluff/defense conectados ao IcmDistortionResult (nashFlop prop)
- MatchupSelector + ComparisonRadar integrados como tabs lazy-loaded
- 5 tabs no MasterSimulator: Cenario | Calculadora ICM | Matchups FT | Comparar | Perspectiva

### Perspectiva/Esperanca Matematica (FEATURE PRINCIPAL)
- Engine: `frontend/src/lib/perspectiva.ts`
  - calculatePerspectiva(): matriz posicional M-H completa
  - calculateEsperanca(): delta equity torneio por acao
  - calculateEsperancaFold(): comparacao com fold
  - classifyTier(): micro/short/mid/big/chipleader
- UI: `frontend/src/components/simulator/panels/PerspectivePanel.tsx`
  - Presets: Bolha FT, HU Push, CL vs Short, 3-Way Bolha
  - 3 colunas: Atual / Se Ganhar / Se Perder com barras posicionais
  - Esperanca vs ICM EV vs Externalidade
  - Tier shift indicator
  - Insight textual automatico

### Conexao dos Motores
- `frontend/src/lib/rpDeriver.ts`: deriveRps() calcula RP de M-H
  - RP(i) = chip_percent(i) - icm_equity_percent(i), clamp [0,60]
  - NAO integrado nos cenarios existentes (funcao exportada para uso futuro)

### Renomeacao do Solver
- solveNash -> solveIcmDistortion (alias deprecated mantido)
- NashResult -> IcmDistortionResult (alias deprecated mantido)
- Headers IDENTITY atualizados em nashSolver.ts, types.ts, hooks, panels
- Variaveis locais nashFlop/Turn/River preservadas

### Auditoria Completa
- fontSize: 0.58rem enforced em TODO o simulador (0 violacoes)
  - Corrigidos: PayoutsPanel, RangeMatrix, TheoryPanel, RiskGauge, simulator.module.css
- Teoria: normalizacao soma=100 corrigida no nashSolver (aggressionFactor)
- icmEngine: parametro totalPool adicionado (denominador correto)
- handParser: regex robustecido (virgulas, decimais, cifrao)

## Commits pendentes
Nenhum commit foi feito nesta sessao. Todos os arquivos estao modificados mas nao commitados.

## Arquivos criados nesta sessao
1. `frontend/src/lib/perspectiva.ts` (engine)
2. `frontend/src/lib/rpDeriver.ts` (conector de motores)
3. `frontend/src/components/simulator/panels/PerspectivePanel.tsx` (UI)

## Arquivos modificados nesta sessao
1. `frontend/src/components/simulator/panels/EquityCalculator.tsx` (Fase A)
2. `frontend/src/components/simulator/panels/ComparisonRadar.tsx` (Fase B + rename)
3. `frontend/src/components/simulator/MasterSimulator.tsx` (5 tabs + rename)
4. `frontend/src/lib/handParser.ts` (regex fix)
5. `frontend/src/components/simulator/engine/nashSolver.ts` (rename + normalizacao)
6. `frontend/src/components/simulator/engine/types.ts` (IcmDistortionResult)
7. `frontend/src/lib/icmEngine.ts` (totalPool param)
8. `frontend/src/components/simulator/panels/PayoutsPanel.tsx` (fontSize fix)
9. `frontend/src/components/simulator/panels/RangeMatrix.tsx` (fontSize fix)
10. `frontend/src/components/simulator/panels/TheoryPanel.tsx` (fontSize fix)
11. `frontend/src/components/simulator/ui/RiskGauge.tsx` (fontSize fix)
12. `frontend/src/components/simulator/simulator.module.css` (fontSize fix)
13. `frontend/src/components/simulator/hooks/useNashSolver.ts` (rename)
14. `frontend/src/components/simulator/panels/NashPanel.tsx` (rename header)

## Pendente
- Validacao visual no browser (localhost:3000/tools/simulador)
- Integrar rpDeriver nos cenarios (substituir RP manual por derivado)
- Mais pontos de calibracao empirica para o motor de distorcao
- Cenario dedicado para Especulacao Assimetrica (Conceito 4)
- Teto do RP com floor de defesa minima (divida tecnica)
- Conteudo textual real (artigos, aulas) para o site
- PKO Value feature (aprovada, nao iniciada)
