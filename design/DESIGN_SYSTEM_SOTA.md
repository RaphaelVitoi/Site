# DESIGN SYSTEM SOTA: TEMPLO POKER RACIONAL

> **Design Language & Generative UI Specification for Stitch MCP & Next.js Tailwind**  
> **Brand:** Poker Racional · Raphael Vitoi  
> **Version:** 8.0 GOLD · Dark Gold Glassmorphic Archetype

---

## 1. Design Tokens & Color Palette

### Primary & Accent Colors
* **Background Deep (Canvas):** `#090D16` (`slate-950` / Deep Onyx)
* **Card Surface (Glass):** `rgba(15, 23, 42, 0.75)` with `backdrop-blur-md`
* **Card Border:** `rgba(212, 175, 55, 0.20)` (Subtle Gold Border)
* **Gold Primary (Brand Accent):** `#D4AF37` (Metallic Gold / High Saturation)
* **Gold Light (Highlight):** `#F3E5AB` (Champagne Gold)
* **Gold Dark (Hover/Active):** `#AA8C2C` (Deep Antique Gold)
* **Emerald Positive (EV Win):** `#10B981` (`emerald-500`)
* **Ruby Negative (EV Loss):** `#EF4444` (`red-500`)
* **Cyan Information (Metrics):** `#06B6D4` (`cyan-500`)
* **Purple Dynamic (Thinking):** `#8B5CF6` (`violet-500`)

### Text Hierarchy
* **Heading Primary:** `#F8FAFC` (`slate-50`)
* **Body Secondary:** `#94A3B8` (`slate-400`)
* **Muted Caption:** `#64748B` (`slate-500`)
* **Gold Emphasis:** `#D4AF37` (`text-gold-400`)

---

## 2. Typography

* **Display & Brand Headings:** `Montserrat, sans-serif` (Weights: 600, 700, 800)
* **Body & UI Components:** `Inter, -apple-system, sans-serif` (Weights: 400, 500, 600)
* **Mathematical Notation & KaTeX:** `KaTeX_Main, KaTeX_Math, 'Times New Roman', serif`
* **Code & Data Tables:** `JetBrains Mono, Fira Code, monospace` (Weights: 400, 500)

---

## 3. UI Component Archetypes

### A. The Glassmorphic Metric Card
```html
<div class="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Metrica SOTA</span>
    <span class="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">PMev Real</span>
  </div>
  <div class="mt-4 flex items-baseline gap-2">
    <span class="text-3xl font-bold tracking-tight text-white">+14.82%</span>
    <span class="text-sm font-semibold text-emerald-400">+2.4 bb/100</span>
  </div>
</div>
```

### B. The Mathematical Insight Container (KaTeX Ready)
```html
<div class="rounded-xl border border-slate-800 bg-slate-950/80 p-5 font-mono text-sm text-slate-200">
  <div class="mb-2 text-xs uppercase tracking-widest text-amber-400">Formalismo Matematico PMev</div>
  <div class="overflow-x-auto py-2 text-center text-lg text-amber-200">
    $$PMev(\sigma) = \int \mathcal{V}(x) \cdot \Phi(x|\mathcal{H}) \, dx$$
  </div>
</div>
```

### C. Action Button (Gold Gradient)
```html
<button class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95">
  Calcular Equidade no Solver
</button>
```

---

## 4. Accessibility & Responsive Constraints

* **Contrast Ratios:** Minimum 7:1 for body text against dark backgrounds (WCAG AAA).
* **Focus States:** High-visibility outline `ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950`.
* **Mobile Breakpoints:** Fluid responsive grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
* **Motion & Animations:** Subtle micro-interactions (`duration-200 ease-out`), with `prefers-reduced-motion` compliance.

---

## 5. Stitch Integration Directives

When generating screens for Poker Racional via Stitch:
1. Maintain dark slate backgrounds (`#090D16`) and gold accents (`#D4AF37`).
2. Encapsulate data tables and matrix heatmaps with rounded glass cards and subtle amber borders.
3. Reserve dedicated containers for KaTeX mathematical proofs and eCDF charts.
