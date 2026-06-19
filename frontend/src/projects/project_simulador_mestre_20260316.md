---
name: Simulador Mestre ICM - Sessao 2026-03-16
description: Unificacao de 4 simuladores ICM redundantes num Motor ICM unico. Fase 0-4 completas, build OK, verificacao 13/13.
type: project
---

## Simulador Mestre ICM - Estado em 2026-03-16

### O que foi feito
Unificacao completa de 4 simuladores ICM redundantes (SimuladorICM, RiskGeometryMasterclass, ICMCalculator, ToyGames) + componentes cap table (nao-poker, deletados) num unico Motor ICM estado da arte.

**Fases completadas:**
- Fase 0: Engine (types.ts, scenarios.ts com 9 cenarios, nashSolver.ts)
- Fase 1: UI atomicos (RiskGauge, AnimatedNumber, ScenarioSelector, SprPipeline, QuizEngine, AxiomTicker)
- Fase 2: Paineis compostos (ScenarioStage, NashPanel, TheoryPanel, EquityCalculator, HandSimulator, ComparisonRadar, PayoutsPanel)
- Fase 3: Orquestrador (MasterSimulator.tsx) + rota /tools/simulador
- Fase 4: Cleanup (deletados 10 componentes antigos, 7 vanilla JS, redirects configurados, Header/homepage/aula-icm atualizados)
- Verificacao: 13/13 pontos OK, build limpo

### Estrutura criada
```
frontend/src/components/simulator/
  MasterSimulator.tsx          # Orquestrador
  simulator.module.css         # CSS Module unificado
  engine/
    types.ts                   # Interfaces (Scenario, NashResult, SprStage, Quiz)
    scenarios.ts               # 9 cenarios unificados
    nashSolver.ts              # Port TS do NashSolver.js
  hooks/
    useNashSolver.ts
    useScenario.ts
    useAudioFeedback.ts
  ui/
    RiskGauge.tsx, AnimatedNumber.tsx, ScenarioSelector.tsx
    SprPipeline.tsx, QuizEngine.tsx, AxiomTicker.tsx
  panels/
    ScenarioStage.tsx, NashPanel.tsx, TheoryPanel.tsx
    EquityCalculator.tsx, HandSimulator.tsx
    ComparisonRadar.tsx, PayoutsPanel.tsx
```

### Rotas
- `/tools/simulador` - Motor ICM (novo)
- `/tools/icm` -> redirect para /tools/simulador
- `/tools/masterclass` -> redirect para /tools/simulador
- `/tools/toy-games` -> redirect para /tools/simulador

### O que foi deletado
- `components/icm/` inteiro (10 arquivos incluindo cap table)
- `public/simulador/` inteiro (7 vanilla JS)
- `lib/icm.ts` (legacy)
- `src/SettingsModal.tsx` + `src/ai-preferences.ts` (orfaos)

### Arquivado (referencia futura)
- `archive/legacy_icm_components/RiskGeometryMasterclass.tsx`
- `archive/legacy_simulador_vanilla/main.js`

### Preservado
- `lib/icmEngine.ts` (Malmuth-Harville - usado por EquityCalculator)
- `lib/handParser.ts` (parser hand history - usado por EquityCalculator)

### Pendente
- **Teste visual** no browser (dev server)
- Features para Fase 2 futura (requerem backend): AI Coach (Gemini chat), Gerador de Cenarios IA, TTS
- Plano aprovado em: `.cerebro/plans/shimmering-stargazing-rainbow.md`

**Why:** O usuario pediu unificacao de todos os simuladores redundantes num estado da arte. Site e exclusivamente sobre poker.

**How to apply:** O Motor ICM e o unico simulador do site. Qualquer feature nova de simulacao deve ser adicionada a `components/simulator/`, nunca criando novos simuladores separados.
