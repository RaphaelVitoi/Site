---
id: plan-dependency-boundary-reconciliation-2026-09-01
tipo: plano
escopo: Site
autor: "Codex [Tier 1.B]"
criado_em: 2026-09-01T01:45-03:00
classes: [interno]
caminhos:
  - requirements.txt
  - pyproject.toml
  - uv.lock
  - .github/dependabot.yml
  - scripts/ops/cwv_gate.ps1
verificado:
  - npm audit local sem vulnerabilidades e pip-audit local de requirements.txt com quatro advisories sem release corrigida de chromadb; requirements.txt e uma declaracao de compatibilidade, nao a cobertura canonica completa do lock
  - uso ativo limitado a PersistentClient, sem HttpClient, chroma run ou listener de servidor
nao_verificado:
  - metadados individuais dos sete alertas Dependabot exigem autenticacao GitHub do proprietario e nao foram inferidos do contador remoto
revisoes_de_ancora:
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos: [scripts/ops/cwv_gate.ps1]
    parecer: A ancora do plano foi reavaliada no baseline atual; o plano permanece valido e nao recebe certificacao retroativa.
---

# Dependency Boundary Reconciliation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` to execute this plan task-by-task and `superpowers:verification-before-completion` before reporting completion.

**Goal:** Reconcile dependency and GitHub alert evidence without importing the historical branch's raw submodule/vendor rewrite or converting a known-unpatched embedded-only dependency exception into a permanently blocking opaque gate.

**Architecture:** Keep four layers separate: package-manager audit evidence, static usage boundary, runtime exposure, and GitHub Dependabot alert metadata. A package advisory remains an advisory even when its vulnerable server interface is not exposed locally. The accepted exception is narrow, explicit, testable, and invalidated by any usage expansion.

**Tech Stack:** `pip-audit`, npm audit, pytest/static source checks, Dependabot API or GitHub UI after user-owned authentication, GitHub Actions workflow linting.

## Evidence already established

- `npm audit --audit-level=low --json`: 0 vulnerabilities locally.
- `pip-audit -r requirements.txt`: four advisories in `chromadb==1.5.9` (`PYSEC-2026-311`, `CVE-2026-45830`, `CVE-2026-45831`, `CVE-2026-45833`). PyPI exposes no fixed release above 1.5.9 at the measured time. This is historical declaration evidence only: `pyproject.toml` plus `uv.lock` are the canonical dependency contract and have not yet been audited through a locked export.
- Active source uses `chromadb.PersistentClient` only. It contains no `HttpClient`, `chroma run`, or Chroma listener.
- GitHub reports seven default-branch alerts, but the exact alerts cannot be enumerated anonymously. `gh` is installed but unauthenticated; uncredentialed Dependabot API returns HTTP 401.
- The current `sota:audit` gate executes npm audit but does not include a reviewed pip or Actions dependency policy.

## Task 1 — Obtain exact remote alert metadata

1. Authenticate GitHub interactively under the repository owner's account, or inspect the Dependabot dashboard manually.
2. Record advisory ID, affected manifest, dependency path, severity, fix availability, and current branch applicability.
3. Export the canonical lock without mutating it, then audit that exact export:

   ```powershell
   $auditInput = Join-Path $env:TEMP "site-uv-lock-audit-$((git rev-parse --short HEAD)).requirements.txt"
   uv export --locked --no-dev --format requirements.txt --output-file $auditInput
   .\.venv\Scripts\python.exe -m pip_audit -r $auditInput
   ```

4. Compare every remote alert against the exported `uv.lock` graph, the direct declarations in `pyproject.toml`, and the legacy `requirements.txt`. Record any divergence explicitly; `requirements.txt` cannot stand in for the full lock.
5. Classify every alert as resolved, still reproducible, false association, or external workflow dependency.
6. Do not store tokens in repo, terminal history, reports, or chat.

## Task 2 — Define the explicit Python advisory policy

1. Add an allowlist format that binds all four exact advisory IDs to `chromadb==1.5.9`, an expiry/review date, evidence of unavailable fix, and `PersistentClient`-only scope.
2. Add fixture-backed static and policy gates that fail if `HttpClient`, `chroma run`, a Chroma server listener, a `chromadb` version drift, a malformed allowlist, or an expired allowlist entry appears without a policy update.
3. Make missing `pip-audit`, malformed or expired allowlist, unrecognized advisory, or advisory outside the exception fail closed.
4. Preserve raw `pip-audit` output as an artifact; the policy classifies it and never hides it.

## Task 3 — Add workflow dependency coverage without vendoring

1. Enumerate the exact Dependabot GitHub-Actions alerts from Task 1.
2. Pin/fix the affected actions only after verifying compatible revisions and action provenance.
3. Keep `actionlint` as syntax/semantic workflow lint; do not mislabel it as an advisory scanner.
4. Do not vendor `Eigen`, remove unrelated submodules, rewrite `.gitmodules`, or alter LFS rules as part of alert remediation.

## Task 4 — Integrate the gates proportionately

1. Extend `scripts/ops/cwv_gate.ps1` only after Tasks 1–3 specify an executable, deterministic contract.
2. Preserve separate output rows for npm, Python, actions, runtime exposure, and accepted exception status.
3. A green exit must mean zero unresolved or unapproved critical/high advisories. Merely classifying an advisory never makes it green; only a valid, explicit, scope-matched and unexpired exception may produce `REVIEW`/`FRAGIL`, never a silent green.
4. Unknown tool state, missing evidence, malformed policy, scope expansion, and expiry are `BLOCK` conditions.
5. Add fixture-backed tests for every fail-closed trigger named in Task 2 and Task 4.

## Final verification

```powershell
npm audit --audit-level=low --json
$auditInput = Join-Path $env:TEMP "site-uv-lock-audit-$((git rev-parse --short HEAD)).requirements.txt"
uv export --locked --no-dev --format requirements.txt --output-file $auditInput
.\.venv\Scripts\python.exe -m pip_audit -r $auditInput
# requirements.txt e auditado separadamente como declaracao legada, nao como lock canonico.
.\.venv\Scripts\python.exe -m pip_audit -r requirements.txt
npm run lint:workflows
git diff --check
```

Run the full local gate only after its new dependency checks have their fixtures and policy contract. Publish this work on a separate branch; do not co-mingle it with the PMev contract port.
