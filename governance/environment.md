# Environment

## Host Model

- The governance kernel is editor-agnostic and sits above every host surface.
- Antigravity is the primary ecosystem and is modeled as Core, IDE, CLI, and SDK layers.
- VS Code is a secondary compatible host and must not become a system of record.
- Host adapters consume the kernel and expose host-local behavior only.

## Runtime Stack

- Python for governance runtime, orchestration, backend logic, and future SDK-facing integration.
- Node for frontend and workspace orchestration.
- Rust or WASM for specialized performance-sensitive components only.

## Execution Profiles

- `dev-fast`: local development with minimal validation overhead.
- `audit-strict`: lint, types, tests, and security checks.
- `full-stack`: integrated local or containerized application boot path.
- `host-antigravity`: Antigravity-first profile using the shared kernel.
- `host-vscode`: VS Code host profile for local editor ergonomics only.

## Local Boot Modes

- `dev-fast` for local backend and frontend development with low friction.
- `audit-strict` for local validation before handoff or promotion.
- `full-stack` for integrated local or containerized startup.
- `host-antigravity` for kernel-driven operation through Antigravity surfaces.
- `host-vscode` for local editor operation without canonical governance ownership.

## Quality Gates

- Python lint with Ruff.
- Python type checking with mypy.
- Python tests with pytest.
- Frontend lint and typecheck.
- Security scanning with Semgrep.
- Optional Rust or WASM validation when those surfaces change.

## Recovery Rules

- Missing or invalid structured policy must fall back to strict-safe behavior.
- Host-local files may add ergonomics but may not override canonical governance.
- Governance rules found only in a host-local file must be moved into `governance/` or labeled as local convenience.

## Recovery Workflows

- If `governance/autonomy.yaml` is missing, invalid, or unreadable, runtime behavior must fall back to strict-safe mode with denial by default.
- If a host adapter diverges from the kernel during migration, the kernel remains authoritative and the adapter must be reduced back to host-local guidance.
- If host migration leaves governance stranded in a local editor surface, that rule must be moved into `governance/` or explicitly marked non-canonical before further migration.
- If Antigravity or VS Code host behavior changes during migration, preserve the abstract host contract in `governance/environment.md` and avoid introducing new canonical rules into host-local files.
