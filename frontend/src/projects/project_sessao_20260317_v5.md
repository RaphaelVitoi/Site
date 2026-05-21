---
name: Sessão 20260317 v5 — RP Dissipação, Downward Drift, Coerência Conceitual
description: SprPipeline redesenhado para mostrar RP% por street; Downward Drift explicado no site; coerência conceitual aplicada ao simulador e páginas educacionais
type: project
---

Sessão de refinamento conceitual profundo. Branch `main`.

**Why:** O conceito central do site (RP pós-flop) estava fragmentado — o simulador plotava SPR mas o título dizia RP, o conteúdo educacional definia RP como estático, e "Downward Drift" era mencionado no hero sem explicação.

**How to apply:** Próxima sessão pode focar nas páginas restantes (home, quem-sou, psicologia-hs) e no deploy.

## O que foi feito

### SprPipeline — Redesign conceitual
- Campo `sprValue` → `rpValue` em `types.ts`, `scenarios.ts`, `SprPipeline.tsx`
- Valores são agora RP residual (%) por street: `oopRp × (remaining_stack / eff_stack)`
- Tab TheoryPanel: `"Diluição SPR"` → `"Dissipação RP"`
- Título componente: `"Vazamento de Risk Premium"` → `"Dissipação do RP por Street"`
- Caption: explica RP exibido = custo de colisão se a decisão ocorrer naquela street

### Conteúdo educacional atualizado
- `aula-icm`: 2 callouts na Conclusão — Downward Drift (O'Kearney, compressão de ação) + Dissipação de RP (mecanismo que controla intensidade do Drift por street)
- `leitura-icm`: Seção 3.2 expandida; definição de RP com nota temporal; nota Toy Games; link /tools/icm → /tools/simulador

### Simulador — labels de precisão
- `RiskGauge`: "R. Premium" → "RP Colisão"
- `NashPanel`: labels sensibilidade → "RP Colisão OOP/IP +10%" + footnote de contexto

## Pendente

- `app/page.tsx` + `quem-sou/page.tsx` + `psicologia-hs/page.tsx` — inline styles/badges
- Deploy para trueICM.com
