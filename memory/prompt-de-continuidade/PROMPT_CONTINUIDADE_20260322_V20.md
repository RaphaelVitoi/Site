---
name: Prompt de Continuidade V20
description: Estado completo sessão 20260322 (continuação V19). Simulador refinado UX. Página conceitos-icm criada. Pendentes: commit, validação visual no dev server.
type: project
---

# V20 — 2026-03-22

## Concluído nesta sessão (pós V19)

### Página /conceitos-icm — CRIADA
- 5 seções: RP vs BF, Expectativa, Perspectiva, Esperança, Extensão ICM EV
- Rodapé de atribuições correto
- Links adicionados em aula-icm (arsenal) e leitura-icm (nav)

### Correção epistemológica em memória
- "supera ICM EV puro" → "estende o escopo decisório do ICM EV puro"
- Atualizado em project_teoria_icm_perspectiva_esperanca.md e MEMORY.md

### Simulador — Refinamentos UX

**NashPanel.tsx:**
- Subtítulo explicativo: "Como o ICM desloca cada ação em relação ao equilíbrio GTO base"
- Cabeçalhos colunas: "GTO Base" / "Com ICM ±margem" / "Δ p.p."
- Badges ΔRP e Curvatura com title attributes explicativos
- Formato delta: "+16pp" → "+16" com "p.p." no cabeçalho
- IP/OOP labels: cores claras (#818cf8, #fb7185) + texto "IP — Agressor" / "OOP — Defensor"

**RiskGauge.tsx:**
- stackTooltip prop: tooltip CSS custom ao hover sobre morph (sublinhado pontilhado)
- 14 tooltips explicativos em MORPH_TOOLTIPS (ScenarioStage)
- BF restaurado ao lado do RP: "RP X.X% · BF Y.YY×"
- 'use client' adicionado

**ScenarioStage.tsx:**
- Morphs restaurados como labels (não mais bb size)
- calcBF restaurado
- MORPH_TOOLTIPS lookup adicionado (14 entradas)

**ScenarioSelector.tsx:**
- Categorias: "Matrizes Clínicas" → "Cenários Clínicos"; "Toy Games (Predator Mode)" → "Toy Games"
- title attribute em cada botão com nome completo + subtitle

**scenarios.ts:**
- Morphs refinados: "Inelástico (Valor Estrito)"→"Valor Estrito", "Linear Especulativo"→"Especulativo", "Polar Extremado"→"Polar Extremo", "Condensado Sangrante"→"Condensado Extremo", "Predator Mode"→"Modo Predador", "Death Zone Paralisado"→"Zona de Paralisia", "Defensivo Condensado"→"Condensado", "Bluffcatcher Rígido"→"Bluffcatcher", "Inelástico Defensivo"→"Inelástico"
- ipPos "God Mode (CL)" → "CL"; narrativeTitle/Sub da "ameaca" ajustados
- narrativeSubtitle "Micro vs Micro (Escada)" → "Micro vs Micro (Laddering)"
- Subtitles encurtadas: "Mid vs Big Stack", "Condensado vs Polar", "ChipEV Puro", "Bolha do ITM"
- ipPos "CL (Pot Bet)" → "CL"; "UTG (Shove)" → "UTG"

**simulator.module.css:**
- scenarioBtnSub/Name: word-break → revertido para nowrap+ellipsis (simetria) + font-size 0.55rem

**NashPanel input:**
- Input ChipEV: 40px → 56px; coluna grid 56px → 72px

## Estado técnico
- TypeScript: 0 erros
- Jest: 20/20 testes passando (motor)

## PENDENTE
- Commit desta sessão
- Validação visual no dev server (npm run dev)
- Possível: encurtar subtitle "Blind War: SB (Hero) vs BB" se ainda truncar
