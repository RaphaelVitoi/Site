---
trigger: model_decision
description: Use as default fallback and additive decision framework when evaluating redundancy, obsolescence, clones, contextual incongruence, broken/malicious elements, or comparing competing tools/plugins/skills (+ROI) via Laya S1 and gemini-decision-1.
---

# Canonical Fallback & Additive ROI Decision Framework

Consult [`nucleo/rules_ssot/modules/decision-roi-framework.md`](../../../nucleo/rules_ssot/modules/decision-roi-framework.md) whenever no domain-specific framework applies or when making architectural/tooling trade-offs:

1. **Eliminate / Merge Negative & Low ROI:** Flag `redundancy`, `clone`, `obsolete`, `incongruent`, `broken`, and `malicious` artifacts (`KEEP | IMPROVE | MERGE | ARCHIVE | ELIMINATE`).
2. **Competition (`+ROI`):** Pick `argmax(capability_score / resource_cost)` (tokens, latency, RAM/VRAM).
3. **Runtime Engine:** Run `core/decision_roi_engine.py` (`evaluate_roi_decision` / `arbitrate_competition`), `POST /api/v1/decisions/roi`, or MCP tool `icm_evaluate_roi_decision` (`Laya S1` -> `gemini-decision-1`).
