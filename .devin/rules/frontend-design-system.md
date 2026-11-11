---
description: "Regras de design tokens e component library do frontend Next.js — carrega só ao tocar frontend/**"
trigger: glob
globs: "frontend/**/*.{ts,tsx,css}"
---

# Frontend — design system Site (Next.js 16 + Tailwind 4)

Fontes únicas de verdade: `DESIGN.md` (raiz) e `frontend/src/app/globals.css`
(bloco `@theme`).

- **Tokens only:** proibido hex cru (`#fff`), `hsl()/rgb()` literais e px mágica
  de cor/espaço fora do `@theme`. Use utilitários (`bg-bg-panel`,
  `text-text-muted`, `border-light-border`) ou `var(--color-*)`.
- **Component library:** UI interativa nova compõe `frontend/src/components/ui/`
  (SotaButton, GlassPanel, Header, Footer, SectionHeader, ContentPageHeader…).
  Não recriar `<button>`/`<input>` ad hoc nem CSS module com cor hardcoded.
- **Tipografia:** body Inter; headings Montserrat 900 (letterSpacing -0.05em);
  dados JetBrains Mono; editorial Playfair Display/EB Garamond. Sem outras fontes.
- **Radii:** button 1rem, control 0.75rem, panel 1.5rem, glass 2rem, pill 3rem.
- **A11y:** `alt` em `<img>`, nome acessível em botões só-ícone, ordem de
  headings sem salto, foco visível, contraste.
- Novo `page.tsx` de rota exige estrutura semântica (`<main>`, heading).
- Diff >8 arquivos de UI ou nova rota → sinalizar para revisão de design.
