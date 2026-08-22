# Governance Kernel And Antigravity Host Architecture

## Objective

Establish a single governance kernel for the repository and its agent ecosystem, decoupled from any specific editor host, with Antigravity as the primary ecosystem and VS Code as a secondary compatible client.

The design must:

- eliminate duplicated governance across prompt files and IDE settings
- separate doctrine from enforcement
- make autonomy policy machine-readable
- support Antigravity IDE, Antigravity CLI, Antigravity SDK, and VS Code as host layers
- preserve operational safety with explicit fallbacks during migration

## Current Problems

The current state mixes four responsibilities across overlapping files:

- executable policy in `agents/autonomy.py`
- Python dependency authority in `pyproject.toml` with generated lock state in `requirements.txt`
- Node and workspace authority in `package.json`
- duplicated governance and prompt doctrine in `GEMINI.md`, `.cursorules`, `.cerebrorules`, and `.vscode/gemini-codeassist-custom-instructions.md`

This creates the following risks:

- governance drift between prompt surfaces
- VS Code becoming an accidental system-of-record
- runtime policy depending on prose embedded in Python
- hard-to-audit autonomy behavior
- migration fragility if Antigravity continues evolving into multiple layers

## Target Topology

The final topology is editor-agnostic and layered:

1. Governance Kernel
   - canonical doctrine and machine-readable autonomy policy
2. Runtime Enforcement
   - Python runtime that consumes the policy and enforces it
3. Host Integration
   - Antigravity SDK, Antigravity CLI, Antigravity IDE, and VS Code adapters
4. Toolchain And Build
   - Python, Node, Rust/WASM, tests, lint, and security gates

## Canonical Authority Model

### Governance

`governance/KERNEL.md`

- canonical human-readable constitution
- defines identity, tiers, evidence rules, approval gates, mutation policy, documentation hierarchy, handoff semantics, and safety doctrine
- must not contain IDE-specific toggles or dependency metadata

`governance/autonomy.yaml`

- canonical machine-readable autonomy policy
- defines modes, tiers, protected paths, command restrictions, approval gates, write rules, and privileged agent classes
- consumed by runtime code

`governance/environment.md`

- canonical environment definition
- defines host ecosystem, runtime assumptions, local boot modes, validation gates, and recovery workflows

### Runtime

`agents/autonomy.py`

- enforcement engine only
- loads and validates `governance/autonomy.yaml`
- applies command policy, path protections, and execution constraints
- must not remain the source of philosophical or constitutional truth

### Dependency Authority

`pyproject.toml`

- single source of truth for Python project metadata, dependencies, linting, typing, testing, and packaging configuration

`requirements.txt`

- generated lock/export artifact from Python dependency authority
- never manually edited

`package.json`

- single source of truth for Node workspace scripts, frontend orchestration, hooks, and monorepo-level commands

### Adapters

`GEMINI.md`

- Gemini-specific adapter
- references the governance kernel
- contains only host-specific guidance

`.cursorules`

- Cursor-specific adapter
- references the governance kernel
- contains only host-specific guidance

`.cerebrorules`

- Claude-specific adapter
- references the governance kernel
- contains only host-specific guidance

`.vscode/gemini-codeassist-custom-instructions.md`

- VS Code Gemini Code Assist adapter
- minimal and host-scoped
- must not redefine the kernel

## Antigravity-Centric Host Model

Antigravity is not treated as a monolith. The design assumes four layers:

- Antigravity Core or current primary surface
- Antigravity IDE
- Antigravity CLI
- Antigravity SDK

The kernel sits above all four layers.

### Antigravity SDK

- primary integration boundary for governance-aware tooling
- should eventually expose kernel loading, autonomy policy parsing, host identity, execution metadata, and memory/handoff interfaces

### Antigravity CLI

- primary operational entrypoint
- should own audit, sync, gate, boot, and migration workflows

### Antigravity IDE

- primary visual host
- should consume kernel doctrine through the SDK, not by hardcoded prompt duplication

### VS Code

- secondary host
- should retain only local editor ergonomics and workspace conveniences
- must not hold canonical system rules

## Environment Design

### Runtime Stack

- Python: system core, governance runtime, orchestration, backend, future SDK integration
- Node: frontend and workspace orchestration
- Rust/WASM: specialized performance layer only

### Execution Profiles

`dev-fast`

- local backend and frontend development
- minimal validation overhead

`audit-strict`

- `ruff`
- `pyright`
- `pytest`
- frontend lint and typecheck
- `semgrep`

`full-stack`

- integrated boot path for local environment or containerized orchestration

`host-vscode`

- VS Code curated profile and workspace settings only

`host-antigravity`

- Antigravity-first host profile using shared kernel and future SDK hooks

### Gates

The design expects a single composable quality gate entrypoint, even if implemented incrementally:

- Python lint and type safety
- Python tests
- frontend lint and typecheck
- security scan with Semgrep
- optional Rust/WASM validation when touched

## Migration Plan

### Phase 1: Kernel Extraction

Create:

- `governance/KERNEL.md`
- `governance/autonomy.yaml`
- `governance/environment.md`

This phase extracts doctrine from prompt files without changing runtime behavior yet.

### Phase 2: Runtime Decoupling

Refactor `agents/autonomy.py` to:

- load `governance/autonomy.yaml`
- normalize legacy states through policy mapping
- preserve current behavior where policy equivalence is required
- emit explicit errors when policy files are missing or invalid

### Phase 3: Adapter Reduction

Reduce:

- `GEMINI.md`
- `.cursorules`
- `.cerebrorules`
- `.vscode/gemini-codeassist-custom-instructions.md`

Each becomes a thin adapter that references the kernel and contains only host-local guidance.

### Phase 4: Host Cleanup

Remove canonical governance from `.vscode` and keep only:

- settings
- extension recommendations
- tasks
- local editor associations

### Phase 5: Toolchain Consolidation

Align `pyproject.toml`, `requirements.txt`, and `package.json` to ensure:

- no duplicated conceptual authority
- explicit generation path for `requirements.txt`
- stable quality gate commands
- clear host bootstrap commands

## Risks And Fallbacks

### Risk 1: Governance Drift During Migration

Problem:
While extracting the kernel, adapters may temporarily diverge from the new canonical files.

Fallback:

- perform migration in two-step mode:
  - first create kernel files without deleting adapter content
  - then reduce adapters only after kernel wording is finalized
- add explicit header markers in adapters:
  - "Derived from governance/KERNEL.md"

### Risk 2: Runtime Breakage In `autonomy.py`

Problem:
Switching runtime policy from hardcoded constants to YAML loading may break autonomy mode resolution or protected path checks.

Fallback:

- keep legacy constants as temporary defaults behind a compatibility shim
- if YAML load fails, runtime falls back to a strict-safe mode:
  - autonomy mode resolves to `stop`
  - command execution remains denied by default
- log fallback activation clearly

### Risk 3: Antigravity Layer Evolution

Problem:
Antigravity IDE, CLI, and SDK may continue changing while the repository migrates.

Fallback:

- define the host contract in `governance/environment.md` in abstract terms
- keep host adapters minimal
- avoid direct assumptions about any one Antigravity surface unless implemented through stable SDK-facing interfaces

### Risk 4: VS Code Residual Coupling

Problem:
Critical behavior may still be hidden in `.vscode/settings.json`, tasks, or custom instructions.

Fallback:

- treat `.vscode/` as non-canonical by policy
- any rule found only in `.vscode/` must either:
  - move into `governance/`, or
  - be explicitly labeled as local editor convenience

### Risk 5: Dependency Authority Confusion

Problem:
Python and Node manifests may continue leaking operational policy into dependency files.

Fallback:

- enforce this boundary:
  - policy belongs in `governance/`
  - environment commands belong in manifests/scripts
  - lockfiles are generated artifacts

### Risk 6: Partial Migration Leaves Dead Prompts

Problem:
Old prompt doctrine may survive in adapter files and mislead agents.

Fallback:

- adapters must be rewritten, not incrementally patched forever
- any deprecated prompt block should be removed entirely after kernel validation
- if needed, archive old prompt bodies under `docs/architecture/` for traceability rather than keeping them active

## Implementation Order

The safest order is:

1. create governance kernel files
2. write autonomy policy in YAML
3. define environment and host model
4. refactor `agents/autonomy.py` to consume policy with safe fallback
5. reduce prompt files into adapters
6. clean host-local VS Code residue
7. align manifests and gate commands

## Success Criteria

The migration is successful when:

- one canonical governance source exists
- `agents/autonomy.py` enforces policy from structured data
- prompt files no longer compete doctrinally
- VS Code is no longer a system-of-record
- Antigravity layers can consume the same kernel through thin adapters
- environment bootstrap and quality gates remain reproducible
