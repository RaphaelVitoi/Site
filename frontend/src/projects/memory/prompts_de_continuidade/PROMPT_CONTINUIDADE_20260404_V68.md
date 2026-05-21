---
name: Prompt de Continuidade V68
description: V68 — D6 conectado ao PostFlopPanel (5 métricas + MW slider). Conteúdo educacional D6 na página icm-pos-flop (5 conceitos formais). Build limpo. Pipeline V67 completo.
type: project
---

## Estado Atual (V68 — 2026-04-04)

### Commits da sessão (continuação de V67)
1. `d9e06a8` — feat(simulator): conectar motor D6 ao PostFlopPanel — 5 métricas + MW slider
2. `7709f35` — feat(content): expandir icm-pos-flop com Framework D6 — 5 conceitos formais

### O que foi feito

1. **PostFlopPanel conectado ao D6** (commit 1):
   - StreetCard agora exibe: pmStreet, ciStreet, valuationStreet, rioMwStreet (condicional MW), potEntrapmentRatio
   - Slider numPlayers (2 HU / 3-5 MW) passa para derivePostFlopRps
   - RIO MW aparece apenas quando numPlayers > 2
   - Cores semânticas: PM verde/vermelho, Ci < 1 âmbar, PER > 50% vermelho
   - 3 hex residuais migrados para CSS vars (#94a3b8, #6366f1, #818cf8)
   - Nota metodológica atualizada com equações D6

2. **Conteúdo educacional D6** (commit 2):
   - Página `aulas/icm-pos-flop` reestruturada
   - 5 conceitos formais D6: R street, RIO MW, Valuation ICM, PM street, Ci street
   - Cada conceito: definição, equação, intuição, implicação prática
   - Pot Entrapment Ratio como conceito auxiliar (seção destacada)
   - Conteúdo legado Aula 1.2 mantido como apêndice
   - Link direto para simulador

### Arquivos modificados
- `frontend/src/components/simulator/panels/PostFlopPanel.tsx` — D6 métricas + MW slider
- `frontend/src/app/aulas/icm-pos-flop/page.tsx` — Framework D6 educacional completo

### Pipeline de próximos passos
1. **Validação matemática** — Testar D6 com cenários conhecidos (HRC FT, toy games) para verificar outputs
2. **PKO Value** — Feature aprovada, ainda em standby
3. **MasterSimulator** — Integrar PostFlopPanel como tab/seção do simulador principal
4. **MDF compartilhado MW** — Teoria formalizada em memória, implementação após teoria HU funcional

### Build
Zero erros TS. Lint passa.
