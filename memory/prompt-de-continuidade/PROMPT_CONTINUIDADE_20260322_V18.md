---
name: Prompt de continuidade V18
description: Sessao 2026-03-22 (tarde). Motor ICM implementado parcialmente. Falta NashPanel novo e testes. Equacao cocava com ΔRP^b definida e commitada nos arquivos de engine.
type: project
---

## Estado Atual (2026-03-22 - sessao tarde)

### O que aconteceu nesta sessao
- Alinhamento teorico completo: conservacao de fichas, teto emergente (nao hardcodado), curva concava, aggressionFactor como risco de colisao (nao colisao), HU final = ChipEV (N_remanescentes = 2)
- Curadoria de features aprovada por Raphael
- Implementacao parcial do novo motor:

### Arquivos modificados nesta sessao
- `frontend/src/components/simulator/engine/types.ts` - CONCLUIDO
  - Novas interfaces: ChipEvFreqs, FreqResult, NashResult (Opcao B)
  - defaultChipEvFreqs adicionado ao Scenario
- `frontend/src/components/simulator/engine/nashSolver.ts` - CONCLUIDO
  - Motor novo: freq_ICM(A) = freq_ChipEV(A) + k_A x |deltaRP|^b x sign(deltaRP)
  - b = 1 / (1 + avgRp/40) - concavo, dinamico
  - k_A calibrados pelos 93 nodes (Aula 1.2)
  - aggressionFactor modula bets IP e raise OOP, check/fold sao residuo
  - Sem Death Zone hardcodada
  - oop_raise usa |deltaRP| sem sign (comprimido independente do lado)
- `frontend/src/components/simulator/hooks/useNashSolver.ts` - CONCLUIDO
  - Nova assinatura: (ipRp, oopRp, chipEvFreqs, aggressionFactor)
- `frontend/src/components/simulator/engine/scenarios.ts` - CONCLUIDO
  - defaultChipEvFreqs adicionado a todos os 9 cenarios
  - INC-02 corrigido: cenario "ameaca" RIVER 2.1 -> 1.2 (era impossivel subir)
  - INC-03 endereçado: disclaimer em todos os sprData
  - INC-01 eliminado: motor novo nao tem mais o cabecalho desatualizado
- `frontend/src/components/simulator/MasterSimulator.tsx` - CONCLUIDO
  - Removidos: AICoachPanel, HandSimulator, AxiomTicker, useAudioFeedback
  - Standby: ComparisonRadar, MatchupSelector, PayoutsPanel, RangeMatrix
  - Adicionado estado chipEvFreqs (inicializado do scenario.defaultChipEvFreqs)
  - handleScenarioSelect reseta chipEvFreqs ao mudar cenario
  - Botao sidebar com title e type="button" (acessibilidade)

### PENDENTE - proximo passo critico
1. **NashPanel.tsx** - INCOMPLETO. Ainda tem interface antiga (bluffFreq, defenseFreq, aggressionFactor). Precisa ser reescrito para Opcao B:
   - Input: chipEvFreqs (editavel pelo usuario) + aggressionFactor
   - Output: 6 acoes (ip_check, ip_bet_small, ip_bet_large, oop_call, oop_fold, oop_raise)
   - Cada acao: center% com spread (±) e delta vs ChipEV
   - Design minimalista: densidade maxima, palavras minimas
   - deltaRp e bExponent exibidos no header (transparencia do modelo)

2. **nashSolver.test.ts** - testes obsoletos. Precisam ser atualizados para nova interface

3. **Build check** - verificar se compila sem erros

### Equacao implementada
```
freq_ICM(A) = freq_ChipEV(A) + k_A x |deltaRP|^b x sign(deltaRP)

b = 1 / (1 + avgRp / 40)
deltaRP = RP_ip - RP_oop (Risk Advantage)

k_A calibrados (fonte: 93 nodes Aula 1.2, ancora deltaRP=8.5):
  ip_check:     +12.7  (calibrado: +40pp @ ancora)
  ip_bet_small:  -3.5  (estimado)
  ip_bet_large: -12    (estimado)
  oop_call:      +7.3  (calibrado: +23pp @ ancora)
  oop_fold:      -4.7  (calibrado: -15pp @ ancora)
  oop_raise:     -9    (estimado, sem sign - sempre comprimido)

spread = 3 + 0.6 x |deltaRP - 8.5|  (incerteza cresce alem da ancora)
```

### Curadoria de features (aprovada)
- MANTER: ScenarioSelector, ScenarioStage, TheoryPanel, NashPanel (novo), SprPipeline, QuizEngine, EquityCalculator (core Malmuth-Harville)
- STANDBY: ComparisonRadar, MatchupSelector, PayoutsPanel, RangeMatrix, hand parser
- ELIMINADOS: AICoachPanel, HandSimulator, AxiomTicker, useAudioFeedback, CodeBlock

### Alinhamentos teoricos desta sessao
- aggressionFactor: modula RISCO de colisao, nao colisao em si. RP precifica exposicao, nao o evento.
- HU final = ChipEV: gatilho e N_remanescentes = 2 (nao HU em MTT com outros players na mesa)
- Sofisticacao: densidade maxima + palavras minimas (minimalismo elegante)
- Conservacao de fichas: imutavel dentro do cenario. Remanejamento e responsabilidade do usuario.
- Teto do RP: emergente da equacao (Malmuth-Harville), nao hardcodado. Ancora empirica: 24%.
- Curva concava: b diminui conforme pressao ICM aumenta. Render decrescente por pp de deltaRP.
- ICM pressure diminui conforme players sao eliminados - nao linear, proporcional a cada player.

### Git
- Branch: main
- Nenhum commit feito nesta sessao ainda
- Arquivos modificados: types.ts, nashSolver.ts, useNashSolver.ts, scenarios.ts, MasterSimulator.tsx

### Lembretes criticos
- NUNCA reescrever componentes do zero (editar apenas)
- Conteudo textual e de Raphael - intocavel sem aprovacao
- Teto de RP: 24% ancora empirica (Raphael nunca viu maior). Nao hardcodar.
- RP nao e linear: cada 1% acumulado tem peso diferente
- Mesa como organismo: variaveis de todos os jogadores
- Sofisticacao = densidade maxima, palavras minimas, estetica minimalista elegante
