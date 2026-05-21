# Prompt de Continuidade — V4 (2026-03-16)

## Contexto Imediato

Retomando refinamento do site **PokerRacional / trueICM.com**.
Último commit: `aa83fee` — branch `main`.
Stack: Next.js 16, React 19, TypeScript, CSS Modules + globals.css, FontAwesome.

---

## Estado Atual

### Sessões anteriores completas

- MasterSimulator ICM (`/tools/simulador`) — Fases 0–4 completas
- Harmonização visual do site inteiro (globals.css, leitura-icm, artigos, aula-icm, aula-1-2)
- biblioteca/page.tsx refatorada
- Tipografia do simulador harmonizada (gauges, NashPanel, ScenarioSelector, tool buttons)
- Hydration error corrigido (useScenario localStorage → useEffect)

---

## PRIORIDADE 1 — Bug SprPipeline (iniciar aqui)

**Arquivo:** `frontend/src/components/simulator/ui/SprPipeline.tsx`
**Dados:** `frontend/src/components/simulator/engine/scenarios.ts`

### Problema A — Título conceitualmente errado

O componente exibe `"VAZAMENTO DE RISK PREMIUM (DEFENSOR)"` mas plota **SPR** (Stack-to-Pot Ratio). São conceitos distintos.

**Fix:** Renomear para `"Diluição do SPR por Street"` + adicionar legenda que explique a relação causal: `SPR baixo → mais fichas em risco → RP mais alto → ICM pressiona mais`.

### Problema B — sprValue = 0.0 no RIVER contradiz narrativa

Cenário `pacto` (O Pacto Silencioso, 65bb vs 70bb):

```
RIVER: potSize: 65.0, sprValue: 0.0
```

SPR 0.0 = all-in. Mas o Pacto Silencioso é sobre **evitar** confronto all-in. Contradição direta.

**Fix:** Ajustar para SPR realista (~0.4–0.6) para o cenário conservador.

### Auditoria completa

Verificar todos os 9 cenários em `scenarios.ts` — checar se `sprValue: 0.0` no RIVER é erro ou intencional (e se intencional, se a narrativa suporta).

---

## PRIORIDADE 2 — Páginas restantes

- `app/page.tsx` — badges afiliação (DeepSolver, GTOWizard, trueICM) sem classe, muitos inline styles no hero/sales
- `quem-sou/page.tsx` — badges inline, video-wrapper não auditado
- `psicologia-hs/page.tsx` — h2 com gradient inline, referências sem classe

---

## PRIORIDADE 3 — Deploy

Pipeline de deploy para `trueICM.com` não configurado. Definir: Vercel, Netlify ou VPS.

---

## Design System (referência rápida)

```css
/* Tokens principais */
--accent-primary:
  #6366f1 /* indigo */ --accent-secondary: #e11d48 /* rose */
    --accent-emerald: #10b981 --accent-amber: #f59e0b
    --bg-card: rgba(15, 23, 42, 0.75) --glass-border: 1px solid
    rgba(255, 255, 255, 0.06) --radius-lg: 16px --font-mono: "JetBrains Mono",
  monospace --font-heading: inherit /* Classes reutilizáveis (globals.css) */
    .hub-card,
  .hub-grid, .hub-icon, .card-cta .page-label, .page-subtitle,
  .page-header .article-tag, .article-nav,
  .article-header .section-divider .callout, .callout-secondary,
  .callout-emerald, .callout-amber, .callout-sky .verdict-box,
  .verdict-box-emerald .nav-card, .nav-card-icon .btn-primary, .btn-secondary;
```

## Simulador — Escala tipográfica atual

```
Título cenário (h2):   clamp(1rem, 2vw, 1.3rem)  w700
Gauge valor:           1.2rem  mono
Gauge label:           0.55rem uppercase
Nash header:           0.65rem uppercase
Freq. valores:         0.95rem mono w800
Sensitivity labels:    0.55rem uppercase
Sensitivity valores:   0.7rem  mono
ScenarioBtn sub:       0.58rem #64748b  margin-bottom: 5px
ScenarioBtn name:      0.82rem #e2e8f0  (ativo: #fff)
Tool buttons:          0.7rem  w600 uppercase
```

![1773713261916](image/PROMPT_CONTINUIDADE_20260316_V4/1773713261916.png)
![1773713272138](image/PROMPT_CONTINUIDADE_20260316_V4/1773713272138.png)
