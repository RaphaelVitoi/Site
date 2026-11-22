# Domain 03: Runtime Lifecycle, Credentials & Previews (`runtime-and-credentials`)

## When to Load
Load this domain ONLY for API key pools (OpenRouter Tiers 1-4, Gemini, Decision, Multimodal, Ollama), Windows HKCU/HKLM registry sync, server startup/warmup (:17042, :3000, :8933, :8931), or running-app preview/tunnel routing.

## Canonical Skills (3)
- `key-pool-audit` (`../../.agents/skills/key-pool-audit/SKILL.md`): Masked audit of API keys, OpenRouter tiers, Gemini/Decision/Multimodal pools, and HKCU/HKLM/Process synchronization.
- `sota-server-lifecycle-warmup` (`../../.agents/skills/sota-server-lifecycle-warmup/SKILL.md`): Orchestrate atomic process cleanup, `.env` reload, Turbopack build, and pre-warming of ports 17042, 3000, 8933, 8931.
- `preview-sota` (`../../.agents/skills/preview-sota/SKILL.md`): Select and configure live app previews (local harness preview, Devin Cloud preview URL, SSH/localhost tunnel, Devin Apps).

## Paired Cookbook
- `cookbooks/credential-pool-harmonization.yaml`

## Out-of-Scope (Do NOT Load Here)
- Writing secrets in plaintext -> strictly forbidden; always use masked `sha8` + Windows Registry via `Set-EcosystemCredential.ps1`.
- Browser DOM/CWV profiling -> `04-browser-and-ui-design`.
