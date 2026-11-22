# Domain 01: PMev & Quantitative Modeling (`pmev-and-quant`)

## When to Load
Load this domain ONLY for Texas Hold'em MTT game theory, PMev mathematical modeling, ICM/Nash/Bayesian range equations, poker knowledge base retrieval, or TimesFM zero-shot bankroll/variance forecasting.

## Canonical Skills (3)
- `pmev-game-theory-engine` (`../../.agents/skills/pmev-game-theory-engine/SKILL.md`): Formulate, implement, or review PMev mathematical models across Python, Rust/WASM, and TypeScript contracts.
- `poker-pmev-knowledge-engine` (`../../.agents/skills/poker-pmev-knowledge-engine/SKILL.md`): Search, download, and index poker/PMev study materials (Google Drive ADC + SQLite FTS5 content-addressed store).
- `timesfm-forecasting` (`../../.agents/skills/timesfm-forecasting/SKILL.md`): Run Google Research TimesFM 2.5 (200M PyTorch) zero-shot time-series forecasts for bankroll, EV variance decay, and RIO risk.

## Paired Cookbooks
- `cookbooks/pmev-model-verification.yaml` (primary PMev / game-theory math verification flow)
- `cookbooks/data-timeseries-forecast.yaml` (shared when forecasting bankroll/EV series with TimesFM)

## Out-of-Scope (Do NOT Load Here)
- General SQL/BigQuery business queries without TimesFM/PMev -> `05-data-and-knowledge`.
- Repo quality gates, linting, or UI/CWV checks -> `02-engineering-and-quality` / `04-browser-and-ui-design`.
