---
name: sota-extension-audit
description: "Continuous audit skill for the SOTA extension ecosystem. Validates manifests, protocol sync, security, and integration health."
version: "1.0.0"
---

# SOTA Extension Ecosystem — Continuous Audit Skill

## Trigger
Activate when the user asks to audit, validate, or check the health of the extension ecosystem.

## Automated Audit
Run the full audit:
```bash
cd /c/Users/rapha/.gemini/Site && python scripts/ops/extension_audit.py --full
```

## Manual Checks

### 1. Duo Bus Sync
```bash
python scripts/ops/sync-bus.py --check
```
If drift detected, sync:
```bash
python scripts/ops/sync-bus.py
```

### 2. Manifest Build (OAuth Injection)
```bash
python scripts/ops/build-manifest.py extensions/superpower-for-gemini-1.7.9.1
```

### 3. Chrome Extension Validation
For each extension in `extensions/`:
- Verify `manifest.json` is valid JSON
- Check MV3 compliance
- Verify CSP strictness
- Check host_permissions scope
- Verify key fields for Duo Mesh peers

### 4. Integration Health
```bash
python scripts/ops/extension_audit.py --full
```
Checks: Orchestrator :9333, Site API :17042, MCP Gateway :8933, Ollama :11434, CDP Proxy :9224

### 5. Security Scan
- No hardcoded secrets in manifests
- OAuth externalized to config/oauth.json
- .gitignore covers sensitive files
- No eval() or new Function() in non-vendor code

## Output Format
Report results as:
- PASS/FAIL/WARN counts
- Detailed findings per category
- Actionable recommendations for failures

## Scheduled Audit
Recommended: Run weekly or on every commit to extensions/.
Add to CI: `.github/workflows/chrome-extensions-ci.yml`
