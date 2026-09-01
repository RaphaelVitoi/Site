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
  - .github/dependabot.yml
  - scripts/ops/cwv_gate.ps1
verificado:
  - npm audit local sem vulnerabilidades e pip-audit local com quatro advisories sem release corrigida de chromadb
  - uso ativo limitado a PersistentClient, sem HttpClient, chroma run ou listener de servidor
nao_verificado:
  - metadados individuais dos sete alertas Dependabot exigem autenticacao GitHub do proprietario e nao foram inferidos do contador remoto
---

# Dependency Boundary Reconciliation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` to execute this plan task-by-task and `superpowers:verification-before-completion` before reporting completion.

**Goal:** Reconcile dependency and GitHub alert evidence without importing the historical branch's raw submodule/vendor rewrite or converting a known-unpatched embedded-only dependency exception into a permanently blocking opaque gate.

**Architecture:** Keep four layers separate: package-manager audit evidence, static usage boundary, runtime exposure, and GitHub Dependabot alert metadata. A package advisory remains an advisory even when its vulnerable server interface is not exposed locally. The accepted exception is narrow, explicit, testable, and invalidated by any usage expansion.

**Tech Stack:** `pip-audit`, npm audit, pytest/static source checks, Dependabot API or GitHub UI after user-owned authentication, GitHub Actions workflow linting.

## Evidence already established

- `npm audit --audit-level=low --json`: 0 vulnerabilities locally.
- `pip-audit -r requirements.txt`: four advisories in `chromadb==1.5.9` (`PYSEC-2026-311`, `CVE-2026-45830`, `CVE-2026-45831`, `CVE-2026-45833`). PyPI exposes no fixed release above 1.5.9 at the measured time.
- Active source uses `chromadb.PersistentClient` only. It contains no `HttpClient`, `chroma run`, or Chroma listener.
- GitHub reports seven default-branch alerts, but the exact alerts cannot be enumerated anonymously. `gh` is installed but unauthenticated; uncredentialed Dependabot API returns HTTP 401.
- The current `sota:audit` gate executes npm audit but does not include a reviewed pip or Actions dependency policy.

## Task 1 — Obtain exact remote alert metadata

1. Authenticate GitHub interactively under the repository owner's account, or inspect the Dependabot dashboard manually.
2. Record advisory ID, affected manifest, dependency path, severity, fix availability, and current branch applicability.
3. Compare every remote alert against a fresh local lockfile/manifest audit. Classify it as resolved, still reproducible, false association, or external workflow dependency.
4. Do not store tokens in repo, terminal history, reports, or chat.

## Task 2 — Define the explicit Python advisory policy

1. Add an allowlist format that binds all four exact advisory IDs to `chromadb==1.5.9`, an expiry/review date, evidence of unavailable fix, and `PersistentClient`-only scope.
2. Add a test/static gate that fails if `HttpClient`, `chroma run`, a Chroma server listener, or a version drift appears without a policy update.
3. Make missing `pip-audit`, malformed allowlist, unrecognized advisory, or advisory outside the exception fail closed.
4. Preserve raw `pip-audit` output as an artifact; the policy classifies it and never hides it.

## Task 3 — Add workflow dependency coverage without vendoring

1. Enumerate the exact Dependabot GitHub-Actions alerts from Task 1.
2. Pin/fix the affected actions only after verifying compatible revisions and action provenance.
3. Keep `actionlint` as syntax/semantic workflow lint; do not mislabel it as an advisory scanner.
4. Do not vendor `Eigen`, remove unrelated submodules, rewrite `.gitmodules`, or alter LFS rules as part of alert remediation.

## Task 4 — Integrate the gates proportionately

1. Extend `scripts/ops/cwv_gate.ps1` only after Tasks 1–3 specify an executable, deterministic contract.
2. Preserve separate output rows for npm, Python, actions, runtime exposure, and accepted exception status.
3. A green exit must mean zero unclassified critical/high advisories; an accepted, unpatched advisory remains visible as `REVIEW`/`FRAGIL`, never silently green.
4. Add fixture-backed tests for fail-closed behavior and policy expiry.

## Final verification

```powershell
npm audit --audit-level=low --json
.\.venv\Scripts\python.exe -m pip_audit -r requirements.txt
npm run lint:workflows
git diff --check
```

Run the full local gate only after its new dependency checks have their fixtures and policy contract. Publish this work on a separate branch; do not co-mingle it with the PMev contract port.
