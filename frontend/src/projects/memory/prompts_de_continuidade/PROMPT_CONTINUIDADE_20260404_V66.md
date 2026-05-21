---
name: Prompt de Continuidade V66
description: V66 — CSS vars migradas (~540 hex → var() em 17 arquivos simulador). globals.css expandido com 10 novas vars. Próximo: NashPanel Opção B (6 ações).
type: project
---

## Estado Atual (V66 — 2026-04-04)

### Commit
`413c40f` — refactor(simulator): migrar cores hardcoded para CSS variables

### O que foi feito nesta sessão

1. **CSS vars — migração completa:**
   - 10 novas CSS vars adicionadas ao globals.css:
     - Texto: `--text-dim` (#64748b), `--text-darker` (#475569), `--text-light` (#cbd5e1), `--text-bright` (#e2e8f0)
     - Accents: `--accent-indigo-light` (#818cf8), `--accent-danger` (#f43f5e), `--accent-gold` (#fbbf24), `--accent-pink` (#ec4899), `--accent-violet` (#a78bfa), `--accent-blue` (#60a5fa)
     - Background: `--bg-subtle` (#334155)
   - ~540 ocorrências de hex hardcoded migradas para var() em 17 arquivos .tsx
   - Regras respeitadas: rgba() intocado, Recharts intocado, hex+alpha concat intocado, .module.css intocado
   - Cores raras (≤7 ocorrências cada) mantidas hardcoded

2. **Arquivos modificados:**
   - `frontend/src/app/globals.css` — 10 novas vars
   - 16 arquivos em `frontend/src/components/simulator/` (panels + ui + root)

### Issues pendentes
| # | Sev | Item | Status |
|---|-----|------|--------|
| 1 | Info | dangerouslySetInnerHTML em TheoryPanel | MONITORAR |
| 2 | Info | artigos/[slug]/page.tsx sem default export (erro build pré-existente) | MONITORAR |

### Pipeline de próximos passos
1. **NashPanel.tsx** — Reescrever para Opção B (6 ações). Inputs: chipEvFreqs editável + aggressionFactor. Outputs: center%, spread(±), delta vs ChipEV.
2. **Produto pós-flop** — Extensão do framework para streets posteriores (validação math primeiro).

### Build
Compilação OK (10.7s). TypeScript OK no simulador. Erro pré-existente em artigos/[slug]/page (unrelated).
