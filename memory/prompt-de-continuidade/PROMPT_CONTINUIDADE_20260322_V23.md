---
name: Prompt de Continuidade V23
description: Estado sessão 20260322 (continuação V22). TheoryPanel 6 tabs coerentes. Scenarios quiz corrigido + 3 vetores exploit. BF+RP matrix com valores exatos HRC. Commit 5a92d65.
type: project
---

# V23 — 2026-03-22

## Concluído nesta sessão (pós V22)

### ReferencialAula12.tsx — BF+RP Matrix unificada
- `RP_MATRIX` hardcoded 9x9 com valores exatos do HRC (vitoi.hrcz)
- Célula: BF value (0.6rem, topo) + `+X.X%` RP abaixo (0.5rem, cor por escala)
- Valores âncora validados: BU vs BB = 21.4%, BB vs BU = 12.9%, EP vs BU = 21.2%, BU vs EP = 13.7%
- Código morto (`display:none`) removido de page.tsx

### TheoryPanel.tsx — 6 tabs ao estado da arte

**Fundamento tab** — conceitos ICM pós-flop (já existia, mantido)

**Ranges tab** — grid 13x13 IP/OOP (já existia, mantido)

**Bubble Factor tab** — redesenhado:
- IIFE computando: `ipBf = 1/(1-ip/100)`, `oopBf`, `deltaRp = ipRp - oopRp`
- `ipEquity = ipBf/(ipBf+2)` — equity mínima necessária para call pot-sized sob ICM
- Cards IP/OOP: RP%, BF value, equity ICM, delta pp acima de 33.3% ChipEV
- ΔRP badge dinâmico: verde (IP advantage), vermelho (IP constrained), cinza (simétrico)
- Barras: equity necessária por jogador com marcador branco em 33.3%
- Footer: "BF = 1/(1−RP). A linha branca marca 33.3% (MDF ChipEV para pot-sized bet)."

**Dissipação RP tab** — (já existia, mantido)

**Exploit tab** — redesenhado:
- Header com badge contando vetores
- Cada item: número monospace `01`/`02`/`03` com fundo verde, borda esquerda, texto 0.875rem

**Quiz tab** — schema corrigido para `{id: 'A'/'B'/'C', text, isCorrect: bool}`

### scenarios.ts — todos os 9 cenários
- Quiz options: schema corrigido de `{text, correct}` → `{id, text, isCorrect}`
- Exploit arrays: expandidos de 1-2 para 3 vetores cada, fundamentados na teoria ICM
- Cenários: paradoxo, pacto, batata, agonia, lama, chipev, sniper, bully, ameaca

## Estado técnico
- TypeScript: 0 erros
- Commit: `5a92d65` "TheoryPanel: BF tab equity-premium framework + Exploit numerado; scenarios: quiz corrigido + 3 vetores por cenário"
- Dev server ativo em localhost:3000

## PENDENTES
- Validação visual: TheoryPanel BF tab, Exploit tab no simulador
- Possível melhoria: RangeMatrix com toggle IP/OOP (identificado como valioso, não implementado)
- Página formal E/P/E + RP vs BF (pendente de V19)
