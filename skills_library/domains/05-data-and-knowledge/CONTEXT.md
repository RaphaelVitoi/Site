# Domain 05: Data Analytics, Databases & Knowledge Search (`data-and-knowledge`)

## When to Load
Load this domain ONLY for SQL analytics (SQLite/Postgres/BigQuery), MCP Toolbox for Databases (`tools.yaml`), Exa neural semantic web search/fetch, or Google Workspace (Drive, Docs, Sheets, Slides, Calendar, Gmail) operations.

## Canonical Skills (4)
- `data-analyst-sota` (`../../.agents/skills/data-analyst-sota/SKILL.md`): Local SOTA data analyst for SQL queries, metrics, analytics, and visualizations across database MCPs, BigQuery, and notebooks.
- `mcp-toolbox-database` (`../../.agents/skills/mcp-toolbox-database/SKILL.md`): Runbook for Google Cloud MCP Toolbox for Databases (`@toolbox-sdk/server`), `tools.yaml` setup, and SQLite/Postgres/BigQuery queries.
- `exa-search-engine` (`../../.agents/skills/exa-search-engine/SKILL.md`): Runbook and execution bridge for Exa MCP (`mcp.exa.ai`), semantic web search, page extraction, and Exa Agent research.
- `google-workspace-sota` (`../../.agents/skills/google-workspace-sota/SKILL.md`): Golden runbook for Google Workspace (Drive, Docs, Sheets, Slides, Calendar, Gmail) via MCP servers and ADC.

## Paired Cookbook
- `cookbooks/data-timeseries-forecast.yaml`

## Out-of-Scope (Do NOT Load Here)
- Poker/PMev FTS5 study corpus -> `01-pmev-and-quant`.
- Cloud coding agent VMs (Jules / Devin) -> `06-cloud-and-devin-ops`.
