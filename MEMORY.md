# SOTA OPERATIONAL PROTOCOL - CHICO GOLD v7.0 (DIAMOND REFINEMENT)

## I. MENTAL MODEL & SOVEREIGNTY

- **System Nature:** A high-performance multi-agent LLM orchestrator with a DAG-based priority worker and integrated RAG.
- **Core Intelligence:** Pure ASCII backend, Zero-Any strict typing, and environmental agnosticism via Tiered Resolution.
- **Authority:** Full system access (Windows/WSL), bypass permission-denied via God Mode (Tier 1 privileged agents).

## II. OPERATIONAL COMMANDMENTS (ZERO-ERROR)

1. **Shannon Efficiency:** Surgery first. Read only what is needed (partial reads). Atomic edits (120-150 lines).
2. **Type Sovereignty:** NEVER use `Any`. Replace with `object` + `cast` or specific models.
3. **Environmental Agnosticism:** NO hardcoded absolute paths. Use `get_infra_path` and `BASE_DIR`.
4. **Resilience & Sanitization:** All logs and outputs MUST be Pure ASCII. Use `SecretMaskingFilter` for secrets.
5. **Deterministic Integrity:** Before editing, verify the mental model against `GEMINI.md` and `system_config.json`.

## III. WORKFLOW REFINEMENT (DIAMOND QUALITY)

- **DAG Awareness:** When adding tasks, ensure no circular dependencies. Priority: `critical` > `high` > `medium` > `low`.
- **Semantic Symmetry:** Backend schemas (Pydantic) MUST be isomorphic with Frontend schemas (Zod).
- **Graceful Failure:** Replace broad `except Exception` with specific, logged, and recoverable exception handling.
- **Performance:** Avoid I/O in hot paths; use the bounded `_TELEMETRY_BUFFER` for persistence.

## IV. PROJECT-SPECIFIC GUIDELINES

- **Nexus CLI:** Infrastructure tasks must use `uv run nexus`.
- **Soberania Nativa:** Prioridade absoluta para ferramentas do Host: Python 3.14 (JIT), .NET 10, Node 25, Go 1.26, PostgreSQL 16 e MySQL Shell 9.7.
- **Mandato Npgsql:** Proibido o uso de Npgsql < 8.0 em projetos .NET para evitar entropia legada.
- **Gemma Local:** Inbound requests for edge cognition use `@gemma4` on port 17043.
- **Math Engine:** RIO risk and ICM distortion follow the VITOI Quantum Equations in `engine/math_sota.py`.
- **Specialized Skills:** Activate specialized capabilities via `activate_skill` (see [SOTA_SKILLS.md](./skills/SOTA_SKILLS.md)). Use `@security` for audits and `@jules` for batch refactoring.

---
*Protocol active. Chico operation re-synchronized for pattern-perfect execution.*

---

## V. ECOSYSTEM STATE — 2026-06-03 (LAST HYGIENE AUDIT)

### Infrastructure
- **Monorepo root:** `C:\Users\Raphael\.gemini\Site\`
- **Config hub:** `C:\Users\Raphael\.gemini\`
- **Brain (.cerebro):** `C:\Users\Raphael\.gemini\antigravity\brain\` (TTL 7 days, auto-purge via Task Scheduler)
- **Ollama models (central):** `C:\Users\Raphael\.gemini\Site\.ollama\models\` — env `OLLAMA_MODELS` configured via `setx`
- **Junction: Cerebro** → `...antigravity\brain\` (NTFS junction, trusted, .geminiignored)
- **Junction: GeminiHub** → `C:\Users\Raphael\.gemini\` (NTFS junction, trusted, .geminiignored)

### Automation
- **Task Scheduler:** `\Chico SOTA\SOTAHygiene_Chico_v7` — daily 03:00 + weekly Monday 03:15
- **Script:** `antigravity\scratch\sota_hygiene.py` — 5 phases: Env, Brain TTL, tmp, history, backups
- **Consolidator:** `antigravity\scratch\consolidate_policies.py` — run when `auto-saved.toml` > 1500 lines

### Critical Invariants (never regress)
- `settings.json` → `debugKeystrokeLogging: false`
- `settings.json` → `customIgnoreFilePaths: []`
- `policies/auto-saved.toml` → must stay < 1500 lines (current: **181**)
- `.venv-wsl` must NOT exist in Windows filesystem (WSL-side only)
- Backups must NOT be stored inside the monorepo (Site/)
- `.geminiignore` at user-root MUST exclude `Cerebro/` and `GeminiHub/`

### Last Cleanup (2026-06-03)
- **~31 GB** freed total
- 3 backup archives removed (18.9 GB)
- `.venv-wsl` removed (5.4 GB)
- 8 JSONL session logs removed (3.9 GB)
- 3× Ollama blob duplicates removed (2.9 GB)
- 4 expired brain sessions removed
- `policies/auto-saved.toml` reconsolidated: 1628 → 181 lines (-89%)

### Audit Report
Full report: [`docs/audits/2026-06-03_ecossistema_gemini_higienizacao_sota_gold.md`](./docs/audits/2026-06-03_ecossistema_gemini_higienizacao_sota_gold.md)
