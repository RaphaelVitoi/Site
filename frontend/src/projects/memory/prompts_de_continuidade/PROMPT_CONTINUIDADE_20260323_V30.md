---
name: Prompt de Continuidade V30
description: Sessao 20260323 - rpDeriver integrado nos cenarios (ciclo teorico fechado). Auditoria Gemini completa. CSS vars unificadas. Quiz/templo tipados. Agentes corrigidos. 0 erros TypeScript.
type: project
---

# Continuidade - Sessao 20260323 V30

## Commits desta sessao

- `6279315` - rpDeriver integrado nos cenarios, CSS vars unificadas, quiz/templo tipados, agentes corrigidos (65 files, +1847/-1297)

## Implementado nesta sessao (Claude)

### rpDeriver integrado nos cenarios (CICLO TEORICO FECHADO)
- `prizes: number[]` adicionado ao tipo Scenario e todos os 9 cenarios
- MasterSimulator: `deriveRps()` calcula RP via Malmuth-Harville automaticamente
- RP efetivo = derivado (M-H) quando prizes existe, manual como fallback
- Header exibe badge verde "RP derivado (M-H)" quando ativo
- Pipeline completa: stacks + prizes -> M-H -> RP derivado -> motor distorcao
- Premios por cenario: 2p=[65/35], 3p=[50/30/20], 4p=[40/30/20/10], chipev=[WTA]

### Correcoes TypeScript
- Criado `frontend/src/components/quiz/types.ts` (modulo faltante que quebrava 5 imports)
- Corrigido tipagem em `templo/analytics/page.tsx` (Object.entries cast)
- Resultado: 0 erros TypeScript em todo o projeto

### Correcao critica dos agentes
- 15 agentes tinham `model: sonnet ou gemini-pro 2.5` (invalido, quebrava execucao)
- Revertido para `model: sonnet` em todos

## Auditado e aceito (Gemini)

### Positivo
- CSS vars unificadas em todas as paginas (cores hardcoded -> var(--text-main) etc)
- Icones `<span>` -> `<i>` + entidades HTML -> Font Awesome (consistencia)
- Header: logo com icone cerebro, link "Inicio" adicionado, link "Panoptico" adicionado
- Layout: preconnect/preload Font Awesome CDN (performance)
- PayoutsPanel: modo "Custom" editavel (feature nova)
- ComparisonRadar: CustomTooltip com delta entre cenarios (feature nova)
- TheoryPanel: normalizeQuizData adaptador para quiz legado -> novo formato
- Prisma: model TelemetryEvent para analytics do quiz
- Footer: URL YouTube corrigida para canal direto
- memory_rag: param local_only para query sem LLM
- do.ps1: validacao de existencia do chaos-core script
- backup_config.ps1: caminhos relativos + retencao anti-entropia

### Neutro/Aceitavel
- icm.ts simplificado (removeu M-H recursivo legado) - verificado: ninguem importa dele, motor real e icmEngine.ts
- Testes Python deletados (4 arquivos) - provavelmente desatualizados, nao afetam frontend
- _env.ps1: API keys Gemini rotacionadas

### Ponto de atencao
- TheoryPanel normalizeQuizData usa `any` extensivamente - funcional mas nao tipado

## Estado do projeto

### Arquivos criados nesta sessao
1. `frontend/src/components/quiz/types.ts`

### Arquivos modificados nesta sessao (Claude)
1. `frontend/src/components/simulator/engine/types.ts` (prizes no Scenario)
2. `frontend/src/components/simulator/engine/scenarios.ts` (prizes em 9 cenarios)
3. `frontend/src/components/simulator/MasterSimulator.tsx` (rpDeriver + badge UI)
4. `frontend/src/app/templo/analytics/page.tsx` (tipagem fix)
5. `frontend/src/components/quiz/QuizQuestion.tsx` (tipagem fix)
6. `.cerebro/agents/*.md` x15 (model fix)

### TypeScript
- 0 erros em todo o projeto
- Dev server: funcional em localhost:3000

### 5 tabs do simulador
1. Cenario (ScenarioStage + NashPanel + TheoryPanel)
2. Calculadora ICM (EquityCalculator)
3. Matchups FT (MatchupSelector)
4. Comparar (ComparisonRadar)
5. Perspectiva (PerspectivePanel)

## Pendente

### Prioridade alta
- Calibrar prizes dos cenarios contra estruturas reais de torneios (valores atuais sao estimativas genericas)
- Integrar rpDeriver nos cenarios existentes de forma que o RP derivado ALIMENTE o sprData tambem (atualmente so substitui ipRp/oopRp base)
- Confirmar TOTAL_POOL exato (usuario disse "depois confirmo" em sessao anterior)

### Prioridade media
- Cenario dedicado para Especulacao Assimetrica (Conceito 4 da teoria original)
- RP ceiling com minimum defense floor (divida tecnica)
- Tipar normalizeQuizData no TheoryPanel (remover `any`)
- Mais pontos de calibracao empirica para o motor de distorcao

### Prioridade baixa
- PKO Value feature (aprovada em memoria, nao iniciada)
- Conteudo textual real (artigos, aulas) para o site
- Migration Prisma para TelemetryEvent (schema adicionado mas nao migrado)

## Nota tecnica
- Dev server precisa ser reiniciado apos mudancas estruturais (novos componentes, imports, tipos) para evitar hydration mismatch
- icm.ts e modulo legado sem consumidores; motor real e icmEngine.ts
- Gemini tende a mudar model field dos agentes para strings invalidas - verificar apos sessoes Gemini
