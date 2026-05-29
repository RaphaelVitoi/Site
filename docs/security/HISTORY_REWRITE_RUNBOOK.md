# History Rewrite Runbook (Secrets)

Status date: 2026-04-03

## Scope
Purge secret-bearing files/values from Git history and force-push clean history.

## Preconditions
- All keys already rotated/revoked.
- Team aligned on maintenance window.
- Everyone pauses pushes to `origin/main`.
- Fresh backup clone created before rewrite.

## 1) Backup
```powershell
cd ..
git clone --mirror https://github.com/RaphaelVitoi/projetos.git projetos-mirror-backup.git
```

## 2) Install `git-filter-repo`
```powershell
py -m pip install git-filter-repo
```

## 3) Rewrite (remove sensitive files from all history)
Run inside the working repository:
```powershell
git filter-repo --path _env.ps1 --path .env --path .env.local --path frontend/.env --path frontend/.env.local --invert-paths --force
```

## 4) Verify locally
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/security/scan-history-secrets.ps1
git log --all -- _env.ps1
```
Expected:
- No secret matches in rewritten history.
- Secret-bearing file history gone.

## 5) Force push rewritten history
```powershell
git push origin --force --all
git push origin --force --tags
```

## 6) Team recovery instructions
- Re-clone repository (preferred), or hard-reset local branches to new `origin/main`.
- Clear stale refs and caches.

## 7) Post-rewrite checks
```powershell
npm run quality-gate
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/security/check-staged-secrets.ps1
```

## Notes
- Rewrite is destructive for commit SHAs and requires coordinated rollout.
- Do not execute rewrite while the repo has uncommitted local work you need to preserve.
