# Secret Rotation Checklist

Status date: 2026-04-03

## Immediate Actions
- [ ] Rotate all `GEMINI_API_KEY_*` keys previously committed.
- [ ] Rotate all `OPENROUTER_API_KEY_*` keys previously committed.
- [ ] Rotate `API_SECRET_TOKEN` if ever shared in local/env artifacts.
- [ ] Revoke old keys in providers after confirming new keys are active.
- [ ] Update local `_env.ps1` with fresh values (never commit real values).

## Repository Hygiene
- [ ] Confirm `_env.ps1` is ignored (`.gitignore`) and contains placeholders only.
- [ ] Confirm no secret-like patterns in staged changes before each commit.
- [ ] Run `git log --all -- _env.ps1` and verify exposure history is known.
- [ ] If required, purge secret-bearing history with a dedicated rewrite plan.

## Developer Policy
- [ ] Keep example values only in `_env.example.ps1`.
- [ ] Use pre-commit secret scan (`scripts/security/check-staged-secrets.ps1`).
- [ ] Run full local quality gate before push: `npm run quality-gate`.
- [ ] Never paste live keys in docs, tickets, chats, or test fixtures.

## Validation Commands
```powershell
rg -n "AIza[0-9A-Za-z_-]{20,}|sk-or-v1-[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}" -g "!node_modules/**" -g "!.venv/**"
npm run quality-gate
```
