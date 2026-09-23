---
name: site-session-handoff
description: Use when closing or handing off a non-trivial session in the Site ecosystem; produce evidence-bounded official reports, preserve learning and user feedback, verify identity and memory records, and pass authorized pre-commit/pre-push gates without sweeping unrelated changes.
---

# Site Session Handoff & Calibration

Use this skill at the actual end of a Site work session or when the user requests a formal handoff. Do not treat a pause, context compaction, or unrelated interlude as session closure. The goal is a low-friction, auditable closeout: reuse evidence already collected, inspect only the relevant current state, and never manufacture completion, metrics, feedback, identity, or memory.

## 1. Reconstruct the system before writing

Start with the ecosystem and governing contracts, then the local diff:

1. Read the root `AGENTS.md` pointer, the canonical Site `CLAUDE.md`, and the multiproject `../CLAUDE.md`; read the current Modus Operandi and product context relevant to the work. Follow pointers rather than treating duplicated snapshots as equal authorities.
2. Read the most recent relevant handoff/audit and inspect `git status -sb`, branch/HEAD, staged and unstaged diffs, and the exact files/tests touched. Identify which changes belong to this session versus pre-existing or unrelated work. Do not overwrite or stage the latter.
3. Rebuild the dependency picture: purpose → canonical entry point/consumer → runtime/data dependencies → UI/operator surface → evidence and gates. Configuration, a registered route, a test, or a healthy port alone does not prove live end-to-end operation.
4. Record the session’s exact conductor model, vehicle, supervision mode, session ID and start time from available evidence. Do not infer identity from a model family, host, or author setting.

Keep context retrieval selective: read the current canonical source and relevant prior record, not every historical report. Reuse test outputs and measurements from the unchanged tree; rerun them whenever relevant content changes.

## 2. Produce distinct, non-duplicative closeout records

Use `reports/` and the current official naming/frontmatter contract in `CLAUDE.md` §9 and `scripts/ops/record_index.py`. New official records must pass `scripts/ops/record_gate.py`; include complete evidence paths, configuration, verified claims, explicit non-verifications, and `revisoes_de_ancora` where active records anchor changed files.

- **Official handoff — required for a formal close:** `reports/HANDOFF-YYYY-MM-DD-<scope>.md`. Capture start state and purpose; what was inspected and changed; dependencies and consumers; decisions, milestones and challenges; test/gate results; current branch/commit/push state; open work and a useful next step. Link related reports instead of copying their content.
- **Audit report — when the session performed an audit or found material systemic issues:** `reports/AUDITORIA-YYYY-MM-DD-<topic>.md`. Separate observation, inference, impact, confidence and unresolved checks. Describe causal links and affected consumers. A static inspection is not a runtime test; do not label a finding a defect without evidence.
- **Learning/calibration report — when user feedback or a reusable learning exists:** use the repository’s official report taxonomy and link it from the handoff. Preserve user wording exactly when quoted. Distinguish a one-session signal from a corroborated pattern; never invent a lesson to fill a template. If no qualitative learning is supported, state that no qualitative learning was supplied/established rather than fabricating one.

Avoid three reports that repeat the same prose. Each record must have a separate purpose, stable links, a named author/conductor grounded in the canonical identity catalog, and measured versus unmeasured claims clearly separated. When an impact percentage is requested but no ecosystem baseline exists, label it an estimate/proxy, disclose the criteria and weights (sum 100%), and do not call it causal improvement or whole-ecosystem completion.

## 3. Persist memory and identity without fabricating provenance

- Update persistent cross-session memory only when the user explicitly requests remembering/saving, or when the governing memory workflow says the artifact is mandatory. Use the approved memory channel and one small append-only/update note; do not edit a memory index or ledger manually. Include the learning, source/session context, and corrections to superseded notes.
- Resolve the author/conductor against `data/agent_identities.json`. Use the exact registered name, email, model, vehicle and tier for report/commit provenance. Do not impersonate the configured Git user or claim a model that did not conduct the work. If the identity is missing or ambiguous, stop before signing/publication and request the minimum needed confirmation.
- Append calibration feedback only through `scripts/ops/Register-AgentCalibrationFeedback.ps1`. The human score is decimal `0`–`10`, literal and unrounded. Qualitative comment is optional: omit `-Feedback` when none was supplied; the ledger record then contains the score and provenance without a fabricated comment. Do not infer a score from praise, completion, or tone. If the user declines or has not responded, create no feedback event and mark it absent/pending, never zero.
- Verify the append-only hash chain with `scripts/ops/Test-AgentCalibrationLedger.ps1` after writing. The ledger is tamper-evident, not physically immutable. Never hand-edit, reorder or overwrite it. Keep score and comment tied to the same session ID; a session may span compaction and midnight.

Example score-only append (replace placeholders only with observed values):

```powershell
pwsh -NoProfile -NonInteractive -File scripts/ops/Register-AgentCalibrationFeedback.ps1 `
  -Score 8.5 -SessionId '<session-id>' -SessionStartedAt '<ISO-8601-start>' `
  -ConductorModel '<canonical-model>' -ConductorVehicle '<canonical-vehicle>' `
  -SupervisionMode assistida
```

Add `-Feedback '<verbatim qualitative feedback>'` only when the user supplied a comment. Then verify the canonical ledger path with `Test-AgentCalibrationLedger.ps1` and record its sequence/result in the handoff without exposing unnecessary private content.

## 4. Publication gates and stop conditions

Commit and push are separate externally visible actions. A prior authorization for another task or another session does not authorize publication of this closeout. Proceed only when the user authorized the relevant action and the exact staged scope is clear.

1. Stage explicit paths only; never use `git add -A` to sweep a dirty tree. Review `git diff --cached --name-status`, `git diff --cached --check`, and confirm no unrelated files are staged.
2. Before commit, run the canonical tree suite (`python scripts/ops/suite_verde.py` or the repository’s configured equivalent) and inspect skips/failures; run `scripts/ops/cwv_gate.ps1`, `scripts/ops/record_anchor_gate.ps1`, and `scripts/ops/record_gate.py`. The actual `.husky/pre-commit` is authoritative and must run. Reconcile all anchor findings with evidence; do not suppress them.
3. Never bypass hooks with `--no-verify`, `SKIP_CWV_GATE`, or equivalent. A failed, skipped, unavailable, stale, or cached check is not a newly passed measurement. Fix only in-scope causes, then rerun affected gates against the final staged tree.
4. Commit with the confirmed canonical Git author and the required `Assinatura:` body. After commit, pre-push is its own gate and runs `suite_verde.py` against the exact pushed content. Push only to the intended remote/branch after authorization, and verify local HEAD equals the remote branch afterward. Report remote CI separately; a local push gate is not CI.
5. If scope is ambiguous, identity cannot be verified, a critical gate remains red, or required user authorization is absent, leave changes uncommitted/unpushed, preserve the working tree, and state the blocker and exact next action.

## 5. Final response

Lead with completion status. Link the official handoff and any distinct audit/learning record. Summarize only decision-relevant tests, skips, measurements, commit/push state and residual runtime/CI checks. State exactly what remains unverified. Do not claim “fully green” when there are skips or unmeasured surfaces.

## Canonical references

- Governance and feedback: [`CLAUDE.md`](../../../CLAUDE.md), §§1, 8.3, 9.
- Identity catalog: [`data/agent_identities.json`](../../../data/agent_identities.json).
- Feedback writer and verifier: `scripts/ops/Register-AgentCalibrationFeedback.ps1`, `scripts/ops/Test-AgentCalibrationLedger.ps1`.
- Quality and release gates: `scripts/ops/suite_verde.py`, `scripts/ops/cwv_gate.ps1`, `scripts/ops/record_anchor_gate.ps1`, `scripts/ops/record_gate.py`, `.husky/pre-commit`, `.husky/pre-push`.
- Current product context and Modus Operandi are named by the canonical `CLAUDE.md`; resolve their current paths there rather than copying them into the skill.
