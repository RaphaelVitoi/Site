---
name: key-pool-audit
description: Use when auditing API keys, OpenRouter tiers, Gemini/Decision/multimodal pools, HKCU/HKLM registry sync, or checking credential hygiene without exposing secrets
---

# Key Pool Audit (HKCU / HKLM / Process)

Read-only, offline audit of all API keys, tiers, and ecosystem credentials registered in Windows `HKCU:\Environment`, `HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`, and the active process environment.

## Security Invariants

- Never print, log, or echo secret values in plaintext (masks with `prefix...suffix` + `sha8` SHA-256 fingerprint).
- Never modify registry entries, write secrets to disk, read the clipboard, or send live HTTP requests (`CLAUDE.md` §3).
- Treat any `DIFF_VALUES` on a secret (`FAIL`), intra-pool duplicate (`FAIL`), empty zombie entry (`WARN`), or `HKCU_ONLY`/`HKLM_ONLY` gap (`WARN`) as an actionable hygiene finding.

## Quick Invocation

### From any plain `cmd.exe` or PowerShell terminal (`%PATH%` shim)
```cmd
audit-keys
audit-keys -Live
audit-keys -AnomaliesOnly
audit-keys -Pool Tier1
audit-keys -AnomaliesOnly -Json
audit-keys -Plain
audit-keys -Strict
```

### Direct script execution (from `Site/` root)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1
```

## Parameters

| Flag | Effect |
| :--- | :--- |
| `-Live` | Run parallel read-only HTTP auth probes (`0` LLM tokens) for real status + latency (`ms`) + local services |
| `-Pool <filter>` | Filter by pool or variable name (`Tier1`, `Tier2`, `Decision`, `Multimodal`, `Gemini`, `Ollama`, `Ecossistema`) |
| `-AnomaliesOnly` | Omit full masked inventory table; print KPI cards, pool summary, and anomalies only |
| `-Plain` | Fallback to plain PowerShell tables without Python/Rich |
| `-Json` | Emit machine-readable masked JSON (never plaintext secrets) |
| `-Strict` | Exit with code `1` if any `FAIL` or `WARN` anomaly exists |

## Scope Limits

- Default mode is offline + local telemetry (`tasks.db::key_usage_metrics`): verifies presence, format regex, length, `sha8`, `HKCU == HKLM` sync, `Process` staleness, duplicate detection, and historical DB success/latency.
- `-Live` uses read-only auth endpoints (`/api/v1/auth/key`, `/v1beta/models`, `/api/tags`, `/api/whoami-v2`, `/user`) with zero token consumption.
