# V34 Downward Drift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the V34 continuity prompt by creating the "Downward Drift" article, integrating the GTO/CFR lab, updating routes, and ensuring performance optimizations.

**Architecture:** A new Next.js page in the `biblioteca` section that explains the Downward Drift concept using SOTA principles. The page will embed the existing `GtoCfrContent` component, pre-configured via URL parameters (if possible) or by wrapping it, to illustrate high regrets for large bets. The `ROUTES.md` file will be updated to reflect the new route.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS.

---

### Task 1: Register Route in ROUTES.md

**Files:**
- Modify: `frontend/ROUTES.md`

- [ ] **Step 1: Add the new route to the canonical map**

Read `frontend/ROUTES.md` and add `downward-drift-sota/` under the `/biblioteca/` section.

```markdown
  downward-drift-sota/         Artigo: Downward Drift e Contracao de Range sob ICM (com Laboratorio)
```
*(Note: It appears this might already be partially present in ROUTES.md from previous runs, verify and ensure it is correctly placed).*

### Task 2: Create Downward Drift Article Page

**Files:**
- Create: `frontend/src/app/biblioteca/downward-drift-sota/page.tsx`

- [ ] **Step 1: Write the page component**

Create the article explaining the "Downward Drift" concept based on the insights from `docs/epics/aula-icm-rp/archived/pesquisa.md`. Incorporate the `GtoCfrContent` component directly into the page.

```tsx
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GtoCfrContent } from '@/app/simulador/gto-cfr/GtoCfrContent';

export default function DownwardDriftSotaPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                    Downward Drift SOTA
                </h1>
                <p className="text-accent-emerald text-lg font-mono">
                    Contração de Range e Sizing sob Pressão ICM
                </p>
            </header>

            <section className="prose prose-invert max-w-none">
                <p>
                    Sob forte pressão de ICM, a heurística clássica determina um efeito conhecido como <strong>Downward Drift</strong>.
                    Este fenômeno descreve como as escolhas de dimensionamento de aposta (bet sizing) são "empurradas para baixo" na árvore de decisão.
                </p>
                <ul>
                    <li>Apostas grandes (Overbets/Pot) tornam-se apostas pequenas.</li>
                    <li>Apostas pequenas tornam-se Checks.</li>
                    <li>Checks marginais tornam-se Folds.</li>
                </ul>
                <p>
                    A causa matemática reside no <strong>Risk Premium (RP)</strong>. A assimetria de risco significa que a sobrevivência
                    é frequentemente mais valiosa do que a extração marginal de fichas. Solvers priorizam a construção de potes via
                    tamanhos de aposta menores e mais seguros, reduzindo a variância (Low-Variance Line Selection).
                </p>
            </section>

            <section className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Laboratório: Dinâmica de Regret</h2>
                <p className="text-text-muted mb-8">
                    Abaixo, o simulador CFR (Counterfactual Regret Minimization) demonstra como um alto arrependimento (regret) para 
                    linhas agressivas (Raise) força a estratégia mista a favorecer rotas passivas (Call/Fold). 
                    Ajuste os Regrets para visualizar a convergência.
                </p>
                
                {/* O GtoCfrContent já gerencia seu próprio estado, atuando como o laboratório integrado */}
                <GtoCfrContent />
            </section>
        </div>
    );
}
```

### Task 3: Verify Performance Optimization (useMemo)

**Files:**
- Read: `frontend/src/app/simulador/gto-cfr/GtoCfrContent.tsx`

- [ ] **Step 1: Check useMemo usage**

Inspect `GtoCfrContent.tsx` to verify if `useMemo` is already applied to `growthFactor`, `onePlusTwoF`, `f`, and `strategy`. Based on current codebase state, it likely is. If missing, apply it. If present, mark this task as complete.