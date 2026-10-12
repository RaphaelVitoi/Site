## 2026-10-12 - Accessibility Contrast Learnings

**Learning:** When using colors for dark themes, WCAG AA requires a 4.5:1 ratio. `text-text-darker` (hsl(215, 18%, 70%)) failed against elevated surfaces (`black/20` over `bg-base`), and `text-accent-emerald` (hsl(158, 82%, 39%)) failed against `bg-base` inside numeric readouts. `text-text-dim` and `text-accent-emerald-light` meet the minimum contrast ratios.
**Action:** Use `text-text-dim` instead of `text-text-darker` inside interactive components and `text-accent-emerald-light` instead of `text-accent-emerald` inside dark backgrounds.
