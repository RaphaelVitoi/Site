# Governance Kernel And Antigravity Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate governance, autonomy policy, and host integration rules into a single kernel with safe runtime fallbacks and thin host adapters.

**Architecture:** The migration creates a canonical governance layer under `governance/`, refactors `agents/autonomy.py` into a policy-driven enforcement engine, and reduces prompt-bearing files into host adapters that reference the kernel rather than redefining it. Runtime safety is preserved through compatibility defaults and strict-safe fallback behavior if structured policy loading fails.

**Tech Stack:** Python 3.10+, PyYAML, asyncio, VS Code workspace files, Markdown governance docs, Node workspace scripts.

---

## File Structure

### New Files

- Create: `governance/KERNEL.md`
  - Canonical human-readable governance constitution.
- Create: `governance/autonomy.yaml`
  - Canonical machine-readable autonomy and enforcement policy.
- Create: `governance/environment.md`
  - Canonical host/runtime/toolchain environment reference.
- Create: `tests/test_autonomy_policy.py`
  - Runtime policy-loading and fallback tests for `agents/autonomy.py`.

### Modify Files

- Modify: `agents/autonomy.py`
  - Replace embedded governance truth with policy loading and compatibility fallback.
- Modify: `GEMINI.md`
  - Reduce to a Gemini-specific adapter.
- Modify: `.cursorules`
  - Reduce to a Cursor-specific adapter.
- Modify: `.clauderules`
  - Reduce to a Claude-specific adapter.
- Modify: `.vscode/gemini-codeassist-custom-instructions.md`
  - Reduce to a minimal VS Code Code Assist adapter.
- Modify: `package.json`
  - Add explicit migration-safe governance and quality-gate scripts.
- Modify: `pyproject.toml`
  - Ensure `PyYAML` is canonical and add any missing test/tooling hooks only if needed.
- Modify: `requirements.txt`
  - Regenerate from `pyproject.toml` after any manifest change.

### Review Files During Implementation

- Review: `docs/superpowers/specs/2026-05-22-governance-kernel-antigravity-design.md`
- Review: `.vscode/settings.json`
- Review: `.vscode/tasks.json`
- Review: `requirements.txt`

---

### Task 1: Create The Governance Kernel Documents

**Files:**
- Create: `governance/KERNEL.md`
- Create: `governance/autonomy.yaml`
- Create: `governance/environment.md`
- Review: `docs/superpowers/specs/2026-05-22-governance-kernel-antigravity-design.md`

- [ ] **Step 1: Create `governance/KERNEL.md` with the canonical governance skeleton**

```md
# Governance Kernel

## Purpose

This document is the canonical governance source for the repository and its agent ecosystem.

## Authority Model

- Tier 0: Human owner with final veto.
- Tier 1: Primary orchestrator with highest approved autonomy.
- Tier 2: Elevated analytical or operational agents with restricted kernel write access.
- Tier 3: Partial agents with bounded execution rights.

## Core Rules

- Single source of governance truth lives here.
- Host adapters must reference this file instead of redefining rules.
- Runtime enforcement must consume `governance/autonomy.yaml`.
- Policy failures must degrade into strict-safe behavior.

## Evidence And Decision Rules

- Prefer evidence over inference.
- Explicitly declare uncertainty when evidence is insufficient.
- Structural or destructive changes require approval gates.

## Mutation Policy

- Governance docs define doctrine.
- Runtime code enforces policy.
- Host files adapt behavior to host surface only.

## Documentation Hierarchy

- `governance/KERNEL.md`: canonical doctrine
- `governance/autonomy.yaml`: executable policy
- `governance/environment.md`: host and runtime environment

## Handoff

- Agents summarize state in their designated memory path.
- Adapters must not become memory systems of record.
```

- [ ] **Step 2: Create `governance/autonomy.yaml` with structured policy and compatibility defaults**

```yaml
version: 1

modes:
  stop:
    allow_native_commands: false
    allow_file_forging: false
  default:
    allow_native_commands: false
    allow_file_forging: true
  partial:
    allow_native_commands: true
    allow_file_forging: true
    deny_state_changing_commands: true
  sandbox:
    allow_native_commands: true
    allow_file_forging: true
    deny_state_changing_commands: true
  full:
    allow_native_commands: true
    allow_file_forging: true
    deny_state_changing_commands: false

legacy_mode_map:
  off: stop

tiers:
  privileged_agents:
    - "@chico"
    - "@gemma4"

protected_paths:
  - ".git"
  - ".venv"
  - "task_executor.py"
  - "do.ps1"
  - "_env.ps1"
  - ".env"
  - "autonomy.py"
  - "scripts"

command_policies:
  forbidden_tokens:
    - "rm -rf /"
    - "del /s c:\\"
    - "diskpart"
    - "format "
    - "mkfs"
    - "vssadmin"
  shell_chaining_tokens:
    - ";"
    - "|"
    - "&&"
    - "&"
    - "$"
    - "`"
    - ">"
    - "<"
  state_changing_commands:
    - "npm install"
    - "npm i"
    - "pip install"
    - "git reset"
    - "git push"
    - "git clone"
    - "yarn add"
    - "pnpm add"

fallback:
  mode: stop
  deny_on_policy_load_failure: true
```

- [ ] **Step 3: Create `governance/environment.md` with host and runtime contracts**

```md
# Environment

## Supported Hosts

- Antigravity Core
- Antigravity IDE
- Antigravity CLI
- Antigravity SDK
- VS Code

## Runtime Stack

- Python for governance runtime, orchestration, backend, and SDK-facing logic
- Node for frontend and workspace orchestration
- Rust/WASM for specialized performance-critical engine logic

## Execution Profiles

- `dev-fast`
- `audit-strict`
- `full-stack`
- `host-antigravity`
- `host-vscode`

## Quality Gates

- Python lint: Ruff
- Python types: mypy
- Python tests: pytest
- Frontend lint and typecheck
- Security: Semgrep

## Host Rule

No canonical governance rule may exist only inside host-local files such as `.vscode/`.
```

- [ ] **Step 4: Run a quick syntax and existence check**

Run:

```powershell
Get-ChildItem governance
Get-Content governance\autonomy.yaml -Raw
```

Expected:

```text
KERNEL.md
autonomy.yaml
environment.md
```

- [ ] **Step 5: Commit**

```bash
git add governance/KERNEL.md governance/autonomy.yaml governance/environment.md
git commit -m "docs: add governance kernel and environment sources"
```

---

### Task 2: Refactor `agents/autonomy.py` To Load Structured Policy

**Files:**
- Modify: `agents/autonomy.py`
- Test: `tests/test_autonomy_policy.py`

- [ ] **Step 1: Write the failing policy-loading tests**

```python
from pathlib import Path

import pytest

from agents import autonomy


def test_load_policy_reads_yaml(tmp_path: Path) -> None:
    policy_path = tmp_path / "autonomy.yaml"
    policy_path.write_text(
        "version: 1\nlegacy_mode_map:\n  off: stop\nfallback:\n  mode: stop\n",
        encoding="utf-8",
    )

    policy = autonomy._load_autonomy_policy(policy_path)

    assert policy["legacy_mode_map"]["off"] == "stop"


def test_load_policy_fallback_returns_safe_defaults(tmp_path: Path) -> None:
    policy = autonomy._load_autonomy_policy(tmp_path / "missing.yaml")

    assert policy["fallback"]["mode"] == "stop"


def test_normalize_mode_uses_legacy_mapping() -> None:
    policy = {"legacy_mode_map": {"off": "stop"}}

    assert autonomy._normalize_mode("off", policy) == "stop"
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
.\.venv\Scripts\python -m pytest tests\test_autonomy_policy.py -q
```

Expected:

```text
FAIL
AttributeError or ImportError for missing policy helpers
```

- [ ] **Step 3: Add policy helpers and compatibility fallback to `agents/autonomy.py`**

```python
DEFAULT_AUTONOMY_POLICY = {
    "legacy_mode_map": {"off": "stop"},
    "fallback": {"mode": "stop", "deny_on_policy_load_failure": True},
    "tiers": {"privileged_agents": ["@chico", "@gemma4"]},
    "protected_paths": [
        ".git",
        ".venv",
        "task_executor.py",
        "do.ps1",
        "_env.ps1",
        ".env",
        "autonomy.py",
        "scripts",
    ],
    "command_policies": {
        "forbidden_tokens": [
            "rm -rf /",
            "del /s c:\\",
            "diskpart",
            "format ",
            "mkfs",
            "vssadmin",
        ],
        "shell_chaining_tokens": [";", "|", "&&", "&", "$", "`", ">", "<"],
        "state_changing_commands": [
            "npm install",
            "npm i",
            "pip install",
            "git reset",
            "git push",
            "git clone",
            "yarn add",
            "pnpm add",
        ],
    },
}


def _load_autonomy_policy(policy_path: Path | None = None) -> dict:
    resolved_path = policy_path or Path(__file__).resolve().parent.parent / "governance" / "autonomy.yaml"
    try:
        with open(resolved_path, encoding="utf-8") as handle:
            loaded = yaml.safe_load(handle) or {}
    except Exception:
        logger.exception("[AUTONOMY] Failed to load policy, using strict-safe fallback.")
        return DEFAULT_AUTONOMY_POLICY
    return {**DEFAULT_AUTONOMY_POLICY, **loaded}


def _normalize_mode(mode: str, policy: dict) -> str:
    legacy_map = policy.get("legacy_mode_map", {})
    normalized = legacy_map.get(mode, mode)
    return normalized
```

- [ ] **Step 4: Wire `get_autonomy_mode()`, `_forge_files()`, and `_validate_command()` to use the loaded policy**

```python
policy = _load_autonomy_policy()
mode = _normalize_mode(mode, policy)
protected_paths = policy.get("protected_paths", [])
privileged_agents = policy.get("tiers", {}).get("privileged_agents", [])
command_policy = policy.get("command_policies", {})
```

- [ ] **Step 5: Run tests to verify policy loading and fallback pass**

Run:

```powershell
.\.venv\Scripts\python -m pytest tests\test_autonomy_policy.py -q
```

Expected:

```text
3 passed
```

- [ ] **Step 6: Commit**

```bash
git add agents/autonomy.py tests/test_autonomy_policy.py
git commit -m "refactor: drive autonomy runtime from structured policy"
```

---

### Task 3: Reduce Prompt Files Into Thin Adapters

**Files:**
- Modify: `GEMINI.md`
- Modify: `.cursorules`
- Modify: `.clauderules`
- Modify: `.vscode/gemini-codeassist-custom-instructions.md`

- [ ] **Step 1: Replace `GEMINI.md` with a host adapter**

```md
# Gemini Adapter

Derived from `governance/KERNEL.md`.

## Host Role

- Gemini is a host adapter for repository governance.
- Canonical governance lives in `governance/KERNEL.md`.
- Structured runtime policy lives in `governance/autonomy.yaml`.

## Host Behavior

- Prefer repository-local governance files over duplicated prompt doctrine.
- Treat VS Code files as host-local convenience, not canonical authority.
- Escalate subjective or high-impact structural changes for approval.
```

- [ ] **Step 2: Replace `.cursorules` with a Cursor adapter**

```md
# Cursor Adapter

Derived from `governance/KERNEL.md`.

## Host Role

- Cursor consumes the repository governance kernel.
- Cursor-specific guidance must remain local to this adapter.

## Host Rules

- Do not redefine governance doctrine here.
- Read `governance/KERNEL.md` and `governance/environment.md`.
- Treat runtime policy as defined by `governance/autonomy.yaml`.
```

- [ ] **Step 3: Replace `.clauderules` with a Claude adapter**

```md
# Claude Adapter

Derived from `governance/KERNEL.md`.

## Host Role

- Claude is a host client, not the source of governance.

## Host Rules

- Load the governance kernel before making structural decisions.
- Do not treat this file as a constitutional source.
- Follow repository-local runtime policy and approval gates.
```

- [ ] **Step 4: Replace `.vscode/gemini-codeassist-custom-instructions.md` with a minimal IDE adapter**

```md
# VS Code Gemini Code Assist Adapter

Derived from `governance/KERNEL.md`.

- This file exists only to adapt the governance kernel to VS Code inline assistance.
- Canonical doctrine lives in `governance/KERNEL.md`.
- Runtime autonomy policy lives in `governance/autonomy.yaml`.
- Keep responses concise, structural, and evidence-oriented.
```

- [ ] **Step 5: Run a drift review**

Run:

```powershell
Select-String -Path GEMINI.md,.cursorules,.clauderules,.vscode\gemini-codeassist-custom-instructions.md -Pattern 'Tier 0|God Mode|VITOI|Authority-Full|bypass'
```

Expected:

```text
No matches or only adapter-safe references
```

- [ ] **Step 6: Commit**

```bash
git add GEMINI.md .cursorules .clauderules .vscode/gemini-codeassist-custom-instructions.md
git commit -m "docs: reduce host prompts to governance adapters"
```

---

### Task 4: Align Tooling Authority And Quality Gates

**Files:**
- Modify: `package.json`
- Modify: `pyproject.toml`
- Modify: `requirements.txt`

- [ ] **Step 1: Add explicit governance and gate scripts to `package.json`**

```json
{
  "scripts": {
    "governance:check": "python scripts/check_governance_layout.py",
    "gate:python": ".venv\\Scripts\\python -m pytest -q",
    "gate:frontend": "npm --workspace frontend run lint && npm --workspace frontend run test",
    "gate:security": ".venv\\Scripts\\python -m semgrep --config .semgrep.yml .",
    "gate:strict": "npm run governance:check && npm run gate:python && npm run gate:frontend && npm run gate:security"
  }
}
```

- [ ] **Step 2: Ensure `pyproject.toml` remains the Python authority and includes no prompt-governance leakage**

```toml
[project]
name = "nexus-orchestrator"
requires-python = ">=3.10"

[tool.pytest.ini_options]
addopts = "-ra -q --strict-markers"
```

- [ ] **Step 3: Regenerate `requirements.txt` from `pyproject.toml`**

Run:

```powershell
.\.venv\Scripts\pip-compile --output-file=requirements.txt pyproject.toml
```

Expected:

```text
requirements.txt updated without manual edits
```

- [ ] **Step 4: Run a manifest sanity check**

Run:

```powershell
Get-Content package.json -Raw | ConvertFrom-Json | Out-Null
Get-Content pyproject.toml -Raw | Out-Null
```

Expected:

```text
No JSON parse error
```

- [ ] **Step 5: Commit**

```bash
git add package.json pyproject.toml requirements.txt
git commit -m "build: align governance and quality gate manifests"
```

---

### Task 5: Review VS Code Residue And Label It Non-Canonical

**Files:**
- Modify: `.vscode/settings.json`
- Modify: `.vscode/tasks.json`
- Review: `.vscode/extensions.json`

- [ ] **Step 1: Add a non-canonical header comment surrogate in `.vscode/tasks.json` labels and descriptions**

```json
{
  "label": "SOTA: VSCode Optimal Launch",
  "detail": "VS Code local host convenience only; canonical governance lives under governance/"
}
```

- [ ] **Step 2: Remove any governance doctrine from `.vscode/settings.json` that duplicates canonical policy**

```json
{
  "geminicodeassist.rules": "Use governance/KERNEL.md as canonical doctrine. Treat this setting as host-local guidance only."
}
```

- [ ] **Step 3: Verify `.vscode/extensions.json` remains host-local and not constitutional**

Run:

```powershell
Select-String -Path .vscode\settings.json,.vscode\tasks.json,.vscode\extensions.json -Pattern 'Tier 0|VITOI|God Mode|canonical governance'
```

Expected:

```text
Only host-local references or none
```

- [ ] **Step 4: Run JSON validation**

Run:

```powershell
Get-Content .vscode\settings.json -Raw | ConvertFrom-Json | Out-Null
Get-Content .vscode\tasks.json -Raw | ConvertFrom-Json | Out-Null
Get-Content .vscode\extensions.json -Raw | ConvertFrom-Json | Out-Null
```

Expected:

```text
All three parse successfully
```

- [ ] **Step 5: Commit**

```bash
git add .vscode/settings.json .vscode/tasks.json .vscode/extensions.json
git commit -m "chore: mark vscode layer as host-local only"
```

---

### Task 6: Final Validation And Migration Report

**Files:**
- Review: `governance/KERNEL.md`
- Review: `governance/autonomy.yaml`
- Review: `governance/environment.md`
- Review: `agents/autonomy.py`
- Review: `GEMINI.md`
- Review: `.cursorules`
- Review: `.clauderules`
- Review: `.vscode/gemini-codeassist-custom-instructions.md`

- [ ] **Step 1: Run targeted autonomy tests**

Run:

```powershell
.\.venv\Scripts\python -m pytest tests\test_autonomy_policy.py -q
```

Expected:

```text
PASS
```

- [ ] **Step 2: Run the strict Python gate**

Run:

```powershell
.\.venv\Scripts\python -m pytest -q
.\.venv\Scripts\python -m mypy agents
.\.venv\Scripts\python -m ruff check .
```

Expected:

```text
All checks pass or only pre-existing known failures remain
```

- [ ] **Step 3: Run the frontend and security gates**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
.\.venv\Scripts\python -m semgrep --config .semgrep.yml .
```

Expected:

```text
No new failures introduced by governance migration
```

- [ ] **Step 4: Write a migration report note**

```md
# Governance Migration Report

- Kernel files created
- Runtime now consumes structured autonomy policy
- Host adapters reduced
- VS Code marked non-canonical
- Remaining follow-up items: Antigravity SDK and CLI integration
```

- [ ] **Step 5: Commit**

```bash
git add governance agents/autonomy.py tests package.json pyproject.toml requirements.txt .vscode
git commit -m "feat: migrate governance to canonical kernel architecture"
```

---

## Spec Coverage Check

- Canonical kernel files: covered by Task 1.
- Runtime decoupling from embedded doctrine: covered by Task 2.
- Adapter reduction for Gemini, Cursor, Claude, and VS Code: covered by Task 3.
- Dependency authority and gate alignment: covered by Task 4.
- VS Code non-canonical cleanup: covered by Task 5.
- Risk treatment and fallback validation: covered by Tasks 2 and 6.

## Placeholder Check

No `TODO`, `TBD`, or unresolved references were intentionally left in this plan. Every task contains exact file paths, commands, or concrete content to write.

## Type And Name Consistency Check

- Canonical governance file names are consistently `governance/KERNEL.md`, `governance/autonomy.yaml`, and `governance/environment.md`.
- Runtime policy helper names are consistently `_load_autonomy_policy()` and `_normalize_mode()`.
- Adapter files consistently reference `governance/KERNEL.md`.
