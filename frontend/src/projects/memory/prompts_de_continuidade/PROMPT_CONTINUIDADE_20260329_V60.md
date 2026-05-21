---
name: Prompt de Continuidade V60
description: Estado após fix MarkdownRenderer TS + cache deriveRps — zero erros TS, zero latência UI
type: project
---

## Estado Atual (V60)

### Commits desta sessão (V59→V60)
- `2d4f52a` perf: cachear deriveRps — eliminar 3× M-H síncrono no render
- `777d659` fix: MarkdownRenderer — cast React.ElementType corrige JSX namespace e keyof

### Root cause da latência aumentada (resolvido)
Ao remover `useDeferredValue`, `derivedRp` (que chama `deriveRps` = 3× `calculateMapaICM`)
passou a executar sincronamente no render a cada clique. Solução: `_rpCache` módulo-nível
com pre-warm via rAF, igual ao `_deltasCache`. Agora TODO o render é O(1):
- `icmDeltas` → `_deltasCache.get()`
- `derivedRp` → `_rpCache.get()`
- `streetMetrics` → aritmética pura

### Fix MarkdownRenderer (pré-existente)
`keyof JSX.IntrinsicElements` → `React.ElementType`. Zero erros TypeScript no projeto.

### Arquitetura de Performance PmLensPanel (final)
- **_icmCache** (perspectiva.ts): cache cross-call M-H completo
- **isomorphism memo** (perspectiva.ts): O(2^N) por chamada M-H
- **_deltasCache** (PmLensPanel.tsx): 72 matchups × 4 streets pré-computados
- **_rpCache** (PmLensPanel.tsx): 72 matchups deriveRps pré-computados
- Pre-warm: 1 par por rAF frame, ~72 frames (~1.2s), cobre _deltasCache + _rpCache
- Render qualquer botão: O(1) Map.get() — sem M-H no thread principal

### Próximas tarefas (em ordem)
**P1 — PerspectivePanel → cenário ativo**
PerspectivePanel tem presets próprios desconectados dos cenários do MasterSimulator.
Deve receber o cenário ativo como prop e usar seus dados.

**P2 — NashPanel: evFoldStreet**
Surfacar `evFoldStreet` — mostrar "foldar aqui custa −Xbb" por street.

**P3 — MDF pós-flop HU formalização**

**P4 — PKO revision**
Modelar RP_bounty + equity_drop_ICM como forças independentes usando PM como base.

**STANDBY — MW features**

### Dados do Referencial (âncora)
- PLAYERS: ['UTG','EP','MP1','MP2','HJ','CO','BU','SB','BB']
- STACKS: [9.4, 52.4, 22.2, 7.0, 44.3, 24.3, 40.0, 13.4, 55.0]
- PRIZES: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47]
- RP[8][6]=12.9 (BB vs BU), RP[6][8]=21.4 (BU vs BB)
