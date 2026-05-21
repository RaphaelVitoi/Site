---
name: Sessão 2026-03-17 V6 — Design System + Conteúdo
description: Badge classes, TOC editorial, nav-card fix, botões arredondados, smart-sniper enriquecido com Sharpe+Grade de Ouro
type: project
---

## Sessão 2026-03-17 (V6)

**Why:** Refinamento visual do site + alimentação de conteúdo dos docx produzidos pelo Raphael.
**How to apply:** Consultar PROMPT_CONTINUIDADE_20260317_V6.md para retomar.

### O que foi feito

1. **trueICM.com esclarecido**: projeto separado, apenas mencionado no pokerracional. Deploy pendente é para pokerracional.com.

2. **globals.css — novas classes**:
   - `.badge-link` + `.badge-link-primary/emerald/secondary` (badges de afiliação)
   - `.article-title` (h2 com gradient indigo→rose→sky)
   - `.article-references` (grid 2-col para referências bibliográficas)
   - `.btn-primary/.btn-secondary` border-radius 4px → 10px
   - `.nav-card > div` flex-column (fix: texto colapsado nos nav-cards)
   - `.toc-row` (TOC editorial: 3 colunas — número | conteúdo | label)

3. **Páginas atualizadas**: page.tsx, quem-sou, psicologia-hs, leitura-icm, aula-icm, smart-sniper

4. **Conteúdo**: smart-sniper ganhou Sharpe Ratio (tabela 3 modelos: 0.062/0.166/0.500), ICM Arbitrage callout ($105-108 por $100 stack) e Grade de Ouro (torneios semana $20 ABI + domingo $40 ABI)

5. **Pendente**: deploy pokerracional.com + 3 docx restantes não usados
