# Daily Design System Review — Playbook

> Executed by a scheduled Devin session. Read-only audit: never modify files.
> Repo: `RaphaelVitoi/Site` · default branch: `master` · frontend: `frontend/`
> (Next.js 16 + Tailwind 4).

## 1. Collect the last 24h of changes

```bash
git fetch origin
git log origin/master --since="24 hours ago" --name-only --format="%h %an %s"
```

Build the diff scope: all changed files under `frontend/src/` matching
`*.{tsx,ts,jsx,js,css}` plus `frontend/src/app/globals.css`. If nothing
UI-related changed, still send a short "no UI changes" email and stop.

## 2. Design system sources of truth

- `DESIGN.md` (repo root) — canonical tokens: colors, typography, radii,
  spacing.
- `frontend/src/app/globals.css` — `@theme` block; Tailwind utilities must
  resolve to these `--color-*` / `--font-*` tokens.
- `frontend/src/components/ui/` — local component library (SotaButton,
  GlassPanel, Header, Footer, SectionHeader, ContentPageHeader, BrandMark,
  ShareButtons, SotaMarkdown, TableOfContents, ReadingProgressBar, ScrollToTop,
  etc.).
- `frontend/src/components/ui/layout/` — layout primitives.

## 3. Rules to enforce

### R1 — Tokens only, no raw values

- No raw hex (`#fff`, `#1a2b3c`) in TSX/CSS outside `globals.css` `@theme`.
- No hardcoded `hsl(...)`/`rgb(...)` literals duplicating token values — use the
  token utility (`bg-bg-panel`, `text-text-muted`, `border-light-border`, …) or
  `var(--color-*)`.
- No arbitrary px/rem literals for colors/spacing where a token or the 4px
  spacing scale exists (Tailwind default scale is fine; flag one-off magic
  values).

### R2 — Use the component library

- New interactive UI must compose `components/ui/` primitives. Flag raw
  `<button>`, `<input>`, ad-hoc styled `<div>`s that re-implement SotaButton /
  GlassPanel / SectionHeader / ContentPageHeader patterns.
- Flag new CSS modules that hardcode colors/fonts instead of consuming tokens.
- Flag duplicated component implementations (two files doing the same job).

### R3 — Typography & radii per DESIGN.md

- Body: Inter; headings: Montserrat 900, letterSpacing -0.05em; data: JetBrains
  Mono; editorial: Playfair Display / EB Garamond. Flag other font families on
  UI surfaces.
- Radii scale: button 1rem, control 0.75rem, panel 1.5rem, glass 2rem, pill
  3rem. Flag off-scale `rounded-*` values on standard components.

### R4 — Accessibility

- `<img>` without `alt`; icon-only buttons/links without accessible names
  (`aria-label`).
- Heading order skips (h1 → h3); interactive elements without visible focus
  styles; low-contrast text pairs (muted text on accent surfaces).
- Flag new pages/routes (`frontend/src/app/**/page.tsx`) that render content
  without a semantic `<main>`/heading structure.

### R5 — Broad UI diffs

- Flag any single commit/PR touching >8 UI files or adding a new route — these
  get a mandatory design review note even if rules pass.

## 4. Severity

- **blocker** — ships a visible inconsistency or a11y failure.
- **warning** — token/component drift that should be fixed soon.
- **info** — style nit or suggestion.

## 5. Output

Append the daily summary to `reports/design-review.log` in the repo (create the
file on first run). Format — one fenced markdown block per day, newest at the
bottom:

```
## Design Review — <YYYY-MM-DD>

**Scope:** <N> commits, <M> UI files scanned, rules R1–R5 run.
**Signature:** Devin (swe-2-flash) [Tier 1] — daily design-system audit

### 🔴 Blockers (<n>)
- `path/to/file.tsx:123` — R2 — <what> → <suggested fix>

### 🟡 Warnings (<n>)
- ...

### 🔵 Info (<n>)
- ...
```

If zero findings, append a single line:
`## Design Review — <date> — clean (<stats>)`.

## 6. Commit & push

After appending, commit ONLY `reports/design-review.log` and push to
`origin/master`:

```
git add reports/design-review.log
git commit -m "chore(reports): daily design-system review <YYYY-MM-DD>"
git push origin master
```

Never stage or modify any other file. If the push fails (e.g. non-fast-forward),
`git pull --rebase origin master` and retry once; if it still fails, leave the
change uncommitted and note it in the session's final chat message.
