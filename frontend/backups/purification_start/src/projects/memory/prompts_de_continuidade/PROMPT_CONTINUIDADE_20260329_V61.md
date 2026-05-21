---
name: Prompt de Continuidade V61
description: Estado após eliminação definitiva da warm latency — onClick pré-aquece cache antes do setState
type: project
---

## Estado Atual (V61)

### Commits desta sessão (V60→V61)
- `1056884` ux: hint transiente IP↔OOP (versão inicial com cacheWarm — corrigida)
- `54ed96f` ux: hint IP↔OOP sempre visível no toggle — remover condição cacheWarm
- `62d24f7` docs: PRODUCT_OWNERSHIP + routing Gemini — fronteiras produto/estética
- `e035be0` perf: pré-aquecer par no onClick antes do setState — eliminar warm latency

### Root cause da warm latency (resolvido definitivamente)
useEffect/rAF rodam APÓS o render. Se o par não estava no cache quando o render
executava, icmDeltas + derivedRp bloqueavam o thread principal.

Fix: onClick de Hero/Villain chama `_getOrComputeDeltas` + `_getOrComputeRp`
para o novo par E o inverso ANTES do `setState`. Cache quente na hora que
o render executa → useMemo/derivedRp = O(1) garantido.

Pre-warm mount: par inicial (heroIdx=8, villainIdx=6) computado sincronamente
antes do rAF loop (que cobre os 70 pares restantes).

### Arquitetura de Performance PmLensPanel (final definitivo)
- **_icmCache** (perspectiva.ts): cache cross-call M-H, LRU 128 entradas
- **isomorphism memo** (perspectiva.ts): O(2^N) por chamada M-H
- **_deltasCache** (PmLensPanel): 72 matchups × 4 streets pré-computados
- **_rpCache** (PmLensPanel): 72 matchups deriveRps pré-computados
- **onClick pré-aquece**: par novo + inverso aquecidos ANTES do setState
- **Pre-warm mount**: par inicial síncrono + rAF para os 70 restantes
- **Hint UX**: dot âmbar + "preparando..." no toggle IP↔OOP, fade-out 2.5s

### Hint UX (comportamento correto)
- Aparece em TODO toggle IP↔OOP (não condicional a cacheWarm)
- Auto-dismiss via setTimeout 2500ms
- Keyframes: pmPulse (dot) + pmFadeOut (texto) via `<style>` inline
- Cor: #f59e0b (amber — consistente com warnings do componente)

### Próximas tarefas (em ordem)
**P1 — PerspectivePanel → cenário ativo**
PerspectivePanel tem presets próprios desconectados dos cenários do MasterSimulator.
Deve receber o cenário ativo como prop e usar seus dados.

**P2 — NashPanel: evFoldStreet**
Surfacar `evFoldStreet` — mostrar "foldar aqui custa −Xbb" por street.

**P3 — MDF pós-flop HU formalização**

**P4 — PKO revision**

**STANDBY — MW features**

### Dados do Referencial (âncora)
- PLAYERS: ['UTG','EP','MP1','MP2','HJ','CO','BU','SB','BB']
- STACKS: [9.4, 52.4, 22.2, 7.0, 44.3, 24.3, 40.0, 13.4, 55.0]
- PRIZES: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47]
- RP[8][6]=12.9 (BB vs BU), RP[6][8]=21.4 (BU vs BB)
