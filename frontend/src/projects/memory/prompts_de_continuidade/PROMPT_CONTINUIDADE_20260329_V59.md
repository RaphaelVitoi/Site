---
name: Prompt de Continuidade V59
description: Estado da sessão após eliminar latência botões alinhados no PmLensPanel — _deltasCache O(1) completo
type: project
---

## Estado Atual (V59)

### Commit mais recente
`c771199` — perf: eliminar latência botões alinhados — _deltasCache O(1) no render

### O que foi concluído nesta sessão (V58→V59)

**PmLensPanel.tsx** — Performance final:
- `useDeferredValue` removido completamente
- `deferredHeroIdx` / `deferredVillainIdx` eliminados
- `icmDeltas` useMemo agora = `_getOrComputeDeltas(heroIdx, villainIdx)` → O(1) Map.get()
- Pre-warm useEffect atualizado para chamar `_getOrComputeDeltas(h, v)` (preenche `_deltasCache`)
- `ipIndex`/`oopIndex` usam `heroIdx`/`villainIdx` direto (sem deferred)
- `opacity` conditional da tabela removida
- Resultado: ZERO latência em qualquer combinação de botões hero/villain

### Arquitetura de Performance (final)
- **_icmCache** (perspectiva.ts): cache cross-call do M-H completo, O(1) na 2ª chamada
- **isomorphism memo** (perspectiva.ts): O(2^N) dentro de cada chamada M-H (vs O(N!))
- **_deltasCache** (PmLensPanel.tsx): pré-computa todos 72 matchups × 4 streets no mount via rAF
- **streetMetrics** useMemo: aritmética pura, nunca dispara M-H
- Resultado: slider = aritmética, botões matchup = O(1) Map.get()

### Commits desta sessão (V58→V59)
- `c608265` feat: PM Lens no Referencial — framework PM por street com cache M-H otimizado
- `c771199` perf: eliminar latência botões alinhados — _deltasCache O(1) no render

### Commits da sessão anterior (V57→V58)
- `6fc54dc` feat: conectar derivePostFlopRps ao effectiveSprData
- `c4cf655` feat: PostFlopPanel HU no MasterSimulator
- `36ac722` refactor: rpDeriver pós-flop HU
- `5ae1dd1` feat: rpDeriver extensão pós-flop
- `dd4e7d3` docs: D6 PM pós-flop completo

### Próximas tarefas (em ordem)

**P1 — PerspectivePanel → cenário ativo**
PerspectivePanel tem presets próprios desconectados dos cenários do MasterSimulator.
Deve receber o cenário ativo como prop e usar seus dados.

**P2 — NashPanel: evFoldStreet**
Surfacar `evFoldStreet` — mostrar "foldar aqui custa −Xbb" por street.

**P3 — MDF pós-flop HU formalização**
Após validação HU completa. MDF compartilhado MW = standby.

**P4 — PKO revision**
Modelar RP_bounty + equity_drop_ICM como forças independentes usando PM como base.

**STANDBY — MW features**
nAtivos, RIO_mw, MDF compartilhado MW — aguardando teoria HU funcional validada.

### Dados do Referencial (âncora)
- PLAYERS: ['UTG','EP','MP1','MP2','HJ','CO','BU','SB','BB']
- STACKS: [9.4, 52.4, 22.2, 7.0, 44.3, 24.3, 40.0, 13.4, 55.0]
- PRIZES: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47]
- RP[8][6]=12.9 (BB vs BU), RP[6][8]=21.4 (BU vs BB)
- Cenário paradoxo: BU 40bb vs BB 55bb

### Hierarquia PM (framework)
EV_fold = −heroCost (1ª ordem, dominante)
E = Esperança (ICM puro, winProb × deltaWin + (1-winProb) × deltaLose)
P = Expectativa (E com fator R — realização posicional)
PM = P − EV_fold → positivo = ação preferível ao fold
Threshold equity: PM(eq_t) = 0 → eq_t = (EV_fold − deltaLose) / (deltaWin × R − deltaLose)
