---
name: Prompt de Continuidade V67
description: V67 — Motor D6 pós-flop implementado em rpDeriver (RIO MW street, R dinâmico, Valuation ICM, PM/Ci por street, pot entrapment). CSS vars 100%. Build limpo. Próximo: conectar D6 ao PostFlopPanel + expandir conteúdo educacional pós-flop.
type: project
---

## Estado Atual (V67 — 2026-04-04)

### Commits da sessão
1. `413c40f` — CSS vars migração principal (17 arquivos, ~540 hex → var())
2. `16d29d1` — CSS vars residuais NashPanel + PmLensPanel
3. `327a25c` — Build limpo (artigos/[slug] export + PsychologyHub TS fix)
4. `1079ce9` — Último residual PostFlopPanel
5. `82ca943` — feat(motor): PM pós-flop por street (D6)

### O que foi feito

1. **CSS vars — migração completa** (commits 1–4):
   - 10 novas CSS vars em globals.css
   - ~540 hex → var() em 17 arquivos do simulador
   - Apenas 2 hex restam (Recharts props — regra: não tocar)

2. **Build limpo** (commit 3):
   - artigos/[slug]/page.tsx: default export adicionado
   - PsychologyHub.tsx: path undefined eliminado no useState

3. **Motor D6 pós-flop** (commit 5) em `frontend/src/lib/rpDeriver.ts`:
   - `computeRStreet()`: R dinâmico — f(street, posição IP/OOP, SPR). River = 1 (binário).
   - `computeRioMwStreet()`: RIO × N² × pot_acumulado (D2 transposta).
   - `PostFlopResult` expandido: +5 campos (rioMwStreet, valuationStreet, pmStreet, ciStreet, potEntrapmentRatio)
   - `StreetState` expandido: +numPlayers
   - Valuation ICM dinâmica: gain/loss via M-H com stacks remanescentes
   - PM por street completo: [(Eq × R × Val × gain) − (loss + RIO)]
   - Ci por street: PM / pot_odds

### Arquivos modificados
- `frontend/src/app/globals.css` — 10 novas CSS vars
- 17 arquivos simulador — hex → var()
- `frontend/src/app/artigos/[slug]/page.tsx` — default export
- `frontend/src/components/content/PsychologyHub.tsx` — TS fix
- `frontend/src/lib/rpDeriver.ts` — motor D6 completo

### Pipeline de próximos passos
1. **Conectar D6 ao PostFlopPanel** — Exibir os novos campos (rioMwStreet, valuationStreet, pmStreet, ciStreet, potEntrapmentRatio) no painel visual. Adicionar slider numPlayers para cenários MW pós-flop.
2. **Expandir conteúdo educacional pós-flop** — Criar/expandir página de conceitos pós-flop usando D6 como base teórica.
3. **NashPanel** — já implementado (Opção B com 6 ações). Feito.

### Build
Zero erros TS. Lint passa.
