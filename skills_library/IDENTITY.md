# Skills Library — IDENTITY (ICM Layer 0)

Global map and governance contract for the curated `Site` Skills Library.
Architecture combines **Interpretable Context Methodology (ICM)** 5-layer progressive disclosure with **OpenMonoAgent** deterministic YAML cookbooks.

## 1. Progressive Context Hierarchy (Shannon Economy)

| Layer | File / Source | Role | Target Budget |
| :--- | :--- | :--- | :--- |
| **Layer 0** | `skills_library/IDENTITY.md` | Global map, scope boundaries, invariants | ~600 tokens |
| **Layer 1** | `skills_library/CONTEXT.md` | Master domain routing index (7 MECE domains) | ~350 tokens |
| **Layer 2** | `skills_library/domains/<id>/CONTEXT.md` | Domain-scoped skills, boundaries, cookbook link | 200-450 tokens |
| **Layer 3a** | `../.agents/skills/<skill-id>/SKILL.md` | Canonical skill instructions (never duplicated) | 400-1800 tokens |
| **Layer 3b** | `skills_library/cookbooks/<playbook>.yaml` | Typed OpenMonoAgent workflow with gates & checkpoints | 250-500 tokens |
| **Layer 4** | Runtime packet (`core/skill_router.py`) | Compiled domain-scoped prompt block (`<= 2400` tokens) | `<= 2400` tokens |

## 2. Scope Boundaries (Zero Redundancy, Zero Drift)

1. **`local` (25 versioned canonical skills):** Live exclusively in `.agents/skills/<id>/SKILL.md`. `skills_library/` NEVER copies full `SKILL.md` prose; it indexes and compiles them on demand.
2. **`harness:devin` (3 conductor skills):** `auto-review`, `design-system-review`, `focused-verify` live in `.devin/skills/` for Devin Desktop/Cloud lifecycle and are NOT merged into the local fleet count.
3. **`external` (operator/plugin scope):** Declared in `data/skills_registry.json` (`verificada` / `nao-verificada`) and vendorized/gitignored plugin directories.
4. **Non-skill exclusion:** `skills/` contains 8 git submodules of Gemini CLI extensions and MCP servers, never agent skills.

## 3. Non-Negotiable Invariants

- **Domain Isolation:** A task loads ONLY the matched domain's top skills (default cap: `2` skills, `1` cookbook) unless an explicit skill ID is requested.
- **Zero-Relevance Short-Circuit:** Trivial or unmatched tasks load `0` skills (`0` tokens injected, `100%` savings).
- **Single Source of Truth:** `skills_library/index.json` is validated against `git ls-files .agents/skills/*/SKILL.md` and `cookbooks/cookbook.schema.json` by `scripts/ops/sync_skills_library.py --check`.
