# Domain 06: Cloud Coding Agents & Devin Ops (`cloud-and-devin-ops`)

## When to Load
Load this domain ONLY for asynchronous Google Jules Cloud VM tasks or Devin Desktop/Cloud operations (ACP architecture, `.devin/` customizations, parallel managed Devins, session supervision/Local Hands, and Session Insights v3).

## Canonical Local Skills (6)
- `google-jules-cloud` (`../../.agents/skills/google-jules-cloud/SKILL.md`): Runbook and execution bridge for Google Jules Cloud (`jules.google.com`) async sessions, plan approval, diffs, and PR automation.
- `devin-desktop-architecture` (`../../.agents/skills/devin-desktop-architecture/SKILL.md`): Devin Desktop ACP (Agent Client Protocol), Agent Command Center, Fast Context (SWE-grep), and local-to-cloud delegation.
- `devin-desktop-customizations` (`../../.agents/skills/devin-desktop-customizations/SKILL.md`): Devin `.devin/rules`, `.devin/skills`, plugins, scoped MCPs, hooks, and blueprint governance.
- `devin-managed-ops` (`../../.agents/skills/devin-managed-ops/SKILL.md`): Parallel managed Devin Cloud orchestration, session analysis, skill lifecycle, knowledge, and schedules via Devin MCP.
- `devin-session-insights` (`../../.agents/skills/devin-session-insights/SKILL.md`): Integrate Devin Cloud Session Insights (API v3) into the session impact evaluation pipeline.
- `devin-session-supervision` (`../../.agents/skills/devin-session-supervision/SKILL.md`): Monitor and steer running Devin Cloud/Desktop sessions (side chats, IDE takeover, browser, Local Hands).

## Separate Harness Scope (`harness:devin`, `.devin/skills/` — NOT local fleet)
- `auto-review` (`../../.devin/skills/auto-review/SKILL.md`)
- `design-system-review` (`../../.devin/skills/design-system-review/SKILL.md`)
- `focused-verify` (`../../.devin/skills/focused-verify/SKILL.md`)

## Paired Cookbook
- `cookbooks/cloud-agent-delegation.yaml`

## Out-of-Scope (Do NOT Load Here)
- Local session impact / Site handoff closure -> `07-governance-and-handoff`.
