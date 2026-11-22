# Domain 07: Governance, Impact Evaluation & Session Handoff (`governance-and-handoff`)

## When to Load
Load this domain ONLY when closing or transferring a non-trivial session, computing quantitative/qualitative session impact metrics, running pre-commit record/anchor gates, or writing `HANDOFF-*.md` / `REGISTRO-*.md` and memory updates.

## Canonical Skills (2)
- `session-impact-evaluator` (`../../.agents/skills/session-impact-evaluator/SKILL.md`): Objective quantitative, qualitative, and narrative session impact assessment (`avaliar_impacto_sessao.py`), model-tier agnostic.
- `site-session-handoff` (`../../.agents/skills/site-session-handoff/SKILL.md`): Evidence-based session closure (`HANDOFF-*.md`, `REGISTRO-*.md`), memory/feedback deposition, and `record_gate.py` pre-commit checks.

## Paired Cookbook
- `cookbooks/session-closure-handoff.yaml`

## Out-of-Scope (Do NOT Load Here)
- Devin Cloud Session Insights API v3 -> `06-cloud-and-devin-ops`.
- 5-phase code quality gate -> `02-engineering-and-quality`.
