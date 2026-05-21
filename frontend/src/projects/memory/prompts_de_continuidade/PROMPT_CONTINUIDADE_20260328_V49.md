---
name: Prompt de Continuidade V49 - 2026-03-28
description: E·P·E nomeados no painel + tooltips didáticos + migração BBs + hierarquia completa do framework registrada em memória.
type: project
---

# Prompt de Continuidade V49 — 2026-03-28

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| `2743089` | feat: E·P·E — Expectativa/Perspectiva/Esperança nomeados + tooltips didáticos |
| `0a29a42` | fix: EV do fold como threshold correto da decisão (não zero) |

## O que foi feito

### Renomeação e estruturação do painel Perspectiva

- **Tab** renomeada: "Perspectiva" → "Esperança" (o output principal do painel)
- **Header** do painel: "Expectativa · Perspectiva · Esperança" (as três camadas)
- Três seções nomeadas explicitamente dentro do painel:
  - **Perspectiva** — os 3 blocos de distribuição posicional (atual/win/lose)
  - **Expectativa** — equity atual + tier (ponto de partida)
  - **Esperança Matemática** — deltas, Esperança da ação, fold baseline, ICM EV puro, Externalidade

### InfoTooltip component (CSS puro, sem state JS)

Tooltip hover em cada conceito e métrica:
- Expectativa, Perspectiva, Esperança Matemática (seções)
- Equity atual, Delta se ganhar, Delta se perder
- Esperança desta ação, EV do fold (baseline), ICM EV puro, Externalidade
- P(Win), Stacks (bb)

CSS: `.infoWrapper`, `.infoIcon`, `.infoTooltip` em `simulator.module.css`

### Migração para BBs

- Labels: "Stacks (bb)", "Pot (bb)", "Custo do Hero (bb)"
- Indicador `bb` ao lado de cada input de stack
- Sufixo "EV" (não "chips") nos valores absolutos de Esperança e ICM EV puro
- `Scenario.stacks`, `SprStage.potSize`, `FTPlayer.bb` documentados como bb
- Nota no header de `scenarios.ts` confirmando convenção bb

### Fix: EV fold como threshold correto

- `buildInsight` agora compara Esperança vs `foldResult.esperancaPct` (não vs 0)
- Fallback para 0 quando foldResult indisponível (compatibilidade com simplificação de solvers)
- Tooltip "EV do fold" atualizado: explica que fold EV é sempre negativo em chipEV (custo das antes) e que é o threshold real da decisão
- Novo terceiro caso no insight: "Esperança negativa mas superior ao fold → ação preferível"

### Pendentes V48 fechados

- `useNashSolver.ts`: comentário stale de NashResult removido
- `ComparisonRadar`: `height={300}` direto no `ResponsiveContainer` (resolve warning Recharts em lazy panels)

### Memória: hierarquia completa do framework registrada

`project_teoria_icm_perspectiva_esperanca.md` — reescrito com:
- Hierarquia correta: ICM EV → Esperança → Expectativa → Perspectiva
- Definições precisas de cada camada (semântica distinta de cada uma)
- MDF monetário/Perspectiva
- FGS Vitoi vs solvers (limitações)
- Table Draw (ordem de análise)
- Fator psicológico (taxa de "maluquice")

`project_teoria_ev_fold_antes.md` — atualizado com:
- **Correção crítica**: EV fold em ICM pode ser POSITIVO (shorts na mesa = payjumps passivos)
- Extensão pós-flop (RP côncavo, aprisionamento ao pot)
- Pot Odds: posição precisa (efeito mínimo teoria, provavelmente prejudicial para elite)
- RIO = Passivo Estrutural (antimatéria das pot odds)

## Estado atual do simulador

- Zero TypeScript hints críticos
- Três camadas do framework nomeadas e com tooltips pedagógicos
- EV fold como threshold correto (não zero)
- BBs como unidade padrão em toda a UI de inputs

## Pendências conhecidas

### Simulador
- PKO: teoria em revisão. Modelo atual = RP × (1 − pkoValue). Não captura assimetria de bounty nem prêmio positivo por eliminação.
- `MatchupSelector.tsx`: importa `PAYOUTS_10K` — confirmado usado na linha 525 (renderiza lista de payouts). Não é dead import.
- `FTPlayer.bb`: documentado como "stack em big blinds" no tipo.

### Teoria (não implementar sem autorização)
- Formalização matemática do EV_fold(ICM) positivo com payjumps iminentes
- Quantificação do fator psicológico (taxa de "maluquice" como variável bayesiana)
- FGS expandido com variáveis de Table Draw e iminência de blinds

### Conteúdo
- Mudanças pré-existentes não commitadas:
  - `frontend/src/app/aulas/icm-masterclass/page.tsx` (+425)
  - `frontend/src/app/aulas/icm-masterclass/page.module.css` (+530)
  - `frontend/src/app/biblioteca/page.tsx` (+163)
  - `frontend/src/app/aulas/[slug]/page.tsx` (+63)
  - Verificar origem (Gemini) e commitar se aprovado
