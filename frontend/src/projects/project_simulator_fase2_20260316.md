---
name: MasterSimulator Fase 2 Pendente
description: Estado do MasterSimulator após Fase 1 — 4 itens pendentes para Fase 2
type: project
---

MasterSimulator ICM — Fase 1 concluída (commit 9739185). Fase 2 pendente.

**Why:** Sessão chegou ao limite de contexto antes de completar as 4 implementações restantes.

**How to apply:** Na próxima sessão, implementar Fase 2 antes de qualquer outro trabalho no simulator.

## Pendentes Fase 2

1. **HandSimulator.tsx** — Mostrar fórmula `Equidade Req. = 33.3% + (RP × 0.7)`, novos presets (ATo, KJs, A5s, 77, 66)
2. **ComparisonRadar.tsx** — Botão "Limpar comparação" quando compareId não vazio
3. **simulator.module.css** — Variáveis CSS (:root), `prefers-reduced-motion`, pausa hover no ticker
4. **MasterSimulator.tsx** — Header com cenário ativo + RP IP/OOP visíveis

## O que foi feito na Fase 1

- types.ts: union types ScenarioColor, ScenarioCategory
- nashSolver.ts: exporta NASH_COEFFICIENTS documentado; fixes linting
- useScenario.ts: localStorage persistência (SSR-safe)
- AxiomTicker.tsx: 15 axiomas (era 10); keys sem índice
- ScenarioSelector.tsx: Unicode direto (sem dangerouslySetInnerHTML)
- NashPanel.tsx: Análise de Sensibilidade em tempo real (INOVAÇÃO)

## Prompt completo em

`.claude/PROMPT_CONTINUIDADE_20260316_V3.md`
