# Skills Library — Master Routing Index (ICM Layer 1)

Select **at most ONE primary domain** matching the task intent, read its Layer 2 `CONTEXT.md`, and inject only the matched skill(s) + paired cookbook within the `2400`-token budget. If no domain matches, load `0` skills.

## MECE Domain Routing Table (7 Domains, 25 Local Skills, 7 Cookbooks)

| # | Domain ID | Layer 2 Context | Skills (Count) | Paired Cookbook | Primary Trigger Intents |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | `pmev-and-quant` | [CONTEXT.md](domains/01-pmev-and-quant/CONTEXT.md) | 3 | `pmev-model-verification.yaml` | PMev math, ICM, GTO/Nash, MTT equity, poker knowledge FTS5, TimesFM forecasting |
| 02 | `engineering-and-quality` | [CONTEXT.md](domains/02-engineering-and-quality/CONTEXT.md) | 4 | `sota-release-quality-gate.yaml` | 5-phase SOTA quality gate, code scan, E2E video proof, Chrysalis live editing |
| 03 | `runtime-and-credentials` | [CONTEXT.md](domains/03-runtime-and-credentials/CONTEXT.md) | 3 | `credential-pool-harmonization.yaml` | HKCU/HKLM key audit, OpenRouter/Gemini pools, server warmup, local app preview |
| 04 | `browser-and-ui-design` | [CONTEXT.md](domains/04-browser-and-ui-design/CONTEXT.md) | 3 | `ui-design-to-cwv-verification.yaml` | Chrome CDP :9222, CWV/a11y DOM audit, desktop computer-use, Stitch UI design |
| 05 | `data-and-knowledge` | [CONTEXT.md](domains/05-data-and-knowledge/CONTEXT.md) | 4 | `data-timeseries-forecast.yaml` | SQL analytics, MCP Toolbox DB, Exa neural web search, Google Workspace |
| 06 | `cloud-and-devin-ops` | [CONTEXT.md](domains/06-cloud-and-devin-ops/CONTEXT.md) | 6 (+3 harness) | `cloud-agent-delegation.yaml` | Google Jules cloud VMs, Devin Desktop ACP/customizations/supervision/insights |
| 07 | `governance-and-handoff` | [CONTEXT.md](domains/07-governance-and-handoff/CONTEXT.md) | 2 | `session-closure-handoff.yaml` | Session impact evaluation, formal handoff, REGISTRO, anchor gate, memory closure |

## Progressive Loading Protocol

1. Match task text + optional `@agent` affinity against `skills_library/index.json`.
2. Refuse cross-domain bleeding: never load skills from unselected domains.
3. Trim `SKILL.md` bodies cleanly at section boundaries if remaining token budget is tight.
