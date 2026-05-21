---
name: Prompt de Continuidade V48 - 2026-03-28
description: Auditoria completa hints/tipos simulador -- NashResult removido, EsperancaInput, PerspectivePanel conectado ao cenário, fold baseline, PKO default.
type: project
---

# Prompt de Continuidade V48 -- 2026-03-28

## Commit desta sessão
| Hash | Descrição |
|------|-----------|
| `71c1a71` | refactor: auditoria completa simulador -- hints, tipos, integrações |

## O que foi feito

### Integrações MasterSimulator (auditoria profunda)
- PKO, PerspectivePanel e NashPanel auditados a fundo
- Problemas identificados: PerspectivePanel isolado do cenário, PKO sem assimetria de bounty, dead code em perspectiva.ts, teste legado com API incompatível

### Correções de integração
- `PerspectivePanel` agora recebe `initialStacks`, `initialPrizes`, `initialNames` do cenário ativo (MasterSimulator passa `scenario.stacks`, `scenario.prizes`, `[ipPos, oopPos]`)
- `calculateEsperancaFold` exposto na UI: linha "EV do fold (baseline)" adicionada na tabela de métricas do PerspectivePanel
- `ComparisonRadar`: `ResponsiveContainer width="100%" height="100%"` + `minWidth: 0` -- corrige erro Recharts width(-1)/height(-1)
- `nashSolver.test.ts` legado deletado (importava `simulateHand` inexistente, signature incompatível)
- PKO NashPanel: nota "Modelo simplificado -- teoria em revisão" abaixo do slider

### Correções de hints/tipos
- `NashResult` deprecated **completamente removido** de `types.ts` -- todos consumidores migrados para `IcmDistortionResult` (NashPanel, ComparisonRadar)
- `QuizOption.correct?: boolean` removido -- apenas `isCorrect: boolean` (non-optional agora) -- QuizEngine sem `any`
- `calculateEsperanca`: 8 parâmetros → `EsperancaInput` (objeto) -- SonarLint S107 resolvido
- `TIER_ORDINAL` extraído como constante exportada de módulo (`perspectiva.ts`) -- inline removido
- Ternário aninhado `tierDirection` → `if/else` explícito
- `BF_THRESHOLD` exportado como constante nomeada (`rpDeriver.ts`) -- inline removido
- `AnimatedNumber`: `suffix` default `''` (todos callers passam `suffix="%"` explicitamente)
- `React` import removido de `NashPanel.tsx` (JSX transform não precisa)
- Dead code `perspectiva.ts` removido: `stacksWin`, `stacksWinClean`, `winStacks`, `loseStacks` + 80 linhas de comentário-exploração

### Callers atualizados
- `PerspectivePanel.tsx`: `calculateEsperanca({ stacks, prizes, names, ... })`
- `perspectiva.test.ts`: todos os 6 calls migrados para `EsperancaInput`

## Estado do simulador pós-auditoria
- Zero erros TypeScript em todos os arquivos do simulador
- Zero `any` explícito
- Zero tipos deprecated em uso
- `NashResult` alias removido completamente
- `calculateEsperancaFold` agora exposto na UI (fold baseline)
- PerspectivePanel inicializa do cenário ativo (não mais preset hardcoded)

## Pendências conhecidas
- PKO: teoria em revisão. Modelo atual reduz RP linearmente (1 - pkoValue). Não captura assimetria de bounty nem o prêmio positivo por eliminação. Teoria a ser desenvolvida antes de refinar implementação.
- `useNashSolver.ts`: comentário diz "NashResult mantido para retrocompatibilidade" -- atualizar header (alias foi removido)
- `MatchupSelector.tsx` importa `PAYOUTS_10K` mas não renderiza no componente visível -- auditar se é usado
- `FTPlayer.bb` field ambíguo (big blinds vs big blind amount) -- documentar
