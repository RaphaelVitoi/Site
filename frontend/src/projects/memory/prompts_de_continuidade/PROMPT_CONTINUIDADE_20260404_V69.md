---
name: Prompt de Continuidade V69
description: V69 — D6 conectado + validado + fix Valuation assimetria. Links PsychologyHub corrigidos. Sitemap atualizado. 5 commits sessão. Build limpo.
type: project
---

## Estado Atual (V69 — 2026-04-04)

### Commits da sessão
1. `d9e06a8` — feat(simulator): conectar motor D6 ao PostFlopPanel — 5 métricas + MW slider
2. `7709f35` — feat(content): expandir icm-pos-flop com Framework D6 — 5 conceitos formais
3. `228aa34` — fix(motor): corrigir assimetria win/lose na Valuation ICM D6 (stacksLose usava effStack, agora usa disputeAmount = min(potTotal, effStack))
4. `01f9916` — fix(seo): adicionar rotas faltantes ao sitemap (/simulador, /laboratorio-icm, /biblioteca/voce-aprende-poker-errado) + icm-pos-flop priority 0.7→0.9
5. `ad3837c` — fix(content): corrigir links PsychologyHub (rotas inexistentes), migrar hex, SectionHeader +id prop, +--accent-fuchsia CSS var

### O que foi feito

1. **PostFlopPanel conectado ao D6**: StreetCard exibe pmStreet, ciStreet, valuationStreet, rioMwStreet (condicional MW), potEntrapmentRatio. Slider numPlayers 2-5. 3 hex migrados.

2. **Conteúdo educacional D6**: Página icm-pos-flop reestruturada com 5 conceitos formais (R street, RIO MW, Valuation ICM, PM street, Ci street) + Pot Entrapment. Conteúdo legado mantido como apêndice.

3. **Fix crítico Valuation**: stacksLose usava effStack (all-in total) em vez de disputeAmount (pot em disputa). Val flop FT corrigido de 0.08 para 0.90. Validação com 3 cenários (Paradoxo FT HU, ChipEV puro, 3way MW) — todos consistentes.

4. **Links PsychologyHub**: Botões levavam a rotas inexistentes. "Paradoxo Valuation" → /biblioteca/paradoxo-valuation. "Ameaça Orgânica" → #ontologia-rp. SpecPost +href. SectionHeader +id.

5. **Sitemap**: +3 rotas faltantes. icm-pos-flop promovida 0.7→0.9.

### Arquivos modificados
- `frontend/src/components/simulator/panels/PostFlopPanel.tsx` — D6 métricas + MW
- `frontend/src/app/aulas/icm-pos-flop/page.tsx` — Framework D6 educacional
- `frontend/src/lib/rpDeriver.ts` — fix assimetria disputeAmount
- `frontend/src/app/sitemap.ts` — rotas + prioridades
- `frontend/src/components/content/PsychologyHub.tsx` — +href, link fix
- `frontend/src/app/artigos/psicologia-hs/page.tsx` — links + hex vars
- `frontend/src/components/ui/SectionHeader.tsx` — +id prop, hex vars
- `frontend/src/app/globals.css` — +--accent-fuchsia

### Hex residuais conhecidos (não migrados)
- ReferencialAula12.tsx — muitos hex semânticos (#34d399, #c4b5fd, #fca5a5, etc.)
- MatchupSelector.tsx — cores específicas (#ff0055 Death Zone, #4338ca, #9f1239)
- RiskGauge.tsx — #ef4444 critical, #ff0055 death zone
- PerspectivePanel.tsx — #475569 Recharts (regra: não tocar), #f472b6
- PmLensPanel.tsx — #34d399, #f472b6
- ComparisonRadar.tsx — #0a0f1c
- PayoutsPanel.tsx — #b45309

### Pipeline de próximos passos
1. **Migrar hex residuais restantes** — ReferencialAula12, MatchupSelector, RiskGauge, PmLensPanel (não-Recharts)
2. **PKO Value** — Feature aprovada, standby
3. **Validação matemática formal** — Publicar resultados dos 3 cenários de teste D6
4. **MDF compartilhado MW** — Teoria em memória, implementação após HU funcional

### Build
Zero erros TS. Lint passa.
