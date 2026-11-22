# Domain 02: Engineering, Code Scan & Quality Gates (`engineering-and-quality`)

## When to Load
Load this domain ONLY for pre-commit/release 5-phase SOTA quality gates, multi-category static code scans (dead code, coverage, performance, security, a11y), E2E video proof recording, or Chrysalis Live Engine app editing.

## Canonical Skills (4)
- `sota-quality-gate` (`../../.agents/skills/sota-quality-gate/SKILL.md`): Execute and interpret the 5-phase SOTA quality gate before commit, release, or audit, separating measured metrics from static baselines.
- `code-scan-sota` (`../../.agents/skills/code-scan-sota/SKILL.md`): Run local code scans mapped to the 11 scan classes (dead code, coverage, queries, performance, cleanup, telemetry, a11y, compliance, migration).
- `e2e-video-proof` (`../../.agents/skills/e2e-video-proof/SKILL.md`): Record annotated end-to-end screen video evidence proving main user flows work before PR/merge.
- `chrysalis-live-editing` (`../../.agents/skills/chrysalis-live-editing/SKILL.md`): Integrate, operate, or review Chrysalis Live Engine (live inspect/edit with diff review, undo, Plan/Accept/Full modes).

## Paired Cookbook
- `cookbooks/sota-release-quality-gate.yaml`

## Out-of-Scope (Do NOT Load Here)
- Registry key/pool hygiene or server startup -> `03-runtime-and-credentials`.
- Chrome CDP DOM/CSS debugging or Stitch UI design -> `04-browser-and-ui-design`.
- Formal session handoff & impact scorecard -> `07-governance-and-handoff`.
