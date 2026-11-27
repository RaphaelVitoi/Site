"""Short-circuit Evaluation Cascade (S0 -> S0.5 Z3 -> S1 Unit/D_crit -> S2 Blind Mutator).

Integrates directly with conductor.dream_gate.DreamGate for Target Lock and governance anchor protection.
"""

from __future__ import annotations

import ast
from collections.abc import Callable
from dataclasses import dataclass, field
import hashlib
import json
import re
from typing import Any

from conductor.dream_gate import DreamGate
from control_plane.config import ActionRole, CascadeStage, Modality, Z3Status
from control_plane.z3_gate import Z3ConstraintGate

TestOracleFn = Callable[[str], tuple[bool, list[int], str | None]]
MutatorOracleFn = Callable[[str, str], tuple[bool, str | None]]


@dataclass(frozen=True, slots=True)
class CascadeAssessment:
    v_det_passed: bool
    cascade_stage: CascadeStage
    z3_status: Z3Status
    stage_dense_reward: float
    error_hash: str | None = None
    error_delta: str | None = None
    test_vector: tuple[int, ...] = ()
    details: dict[str, Any] = field(default_factory=dict)


def _hash_error(stage: CascadeStage, detail: str) -> str:
    return hashlib.sha256(f"{stage.value}:{detail}".encode()).hexdigest()[:16]


_FENCED_BLOCK_RE = re.compile(r"```(?:[a-zA-Z0-9_-]+)?\s*\n(.*?)```", re.DOTALL)


def _strip_markdown_fences(payload: str) -> str:
    """Extract inner code/JSON from fenced markdown blocks without mutating raw input."""
    stripped = payload.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        if len(lines) >= 2 and lines[0].startswith("```") and lines[-1].strip() == "```":
            return "\n".join(lines[1:-1]).strip()
    match = _FENCED_BLOCK_RE.search(stripped)
    if match:
        return match.group(1).strip()
    return stripped


def _default_blind_mutator(contract_content: str, candidate_payload: str) -> tuple[bool, str | None]:
    """Deterministic blind mutator checking for empty payloads or forbidden placeholder markers."""
    stripped = candidate_payload.strip()
    if not stripped:
        return False, "Adversarial mutator rejected empty candidate artifact."
    lowered = stripped.lower()
    for forbidden in ("todo: implement", "raise notimplementederror", "pass  # stub"):
        if forbidden in lowered and forbidden not in contract_content.lower():
            return False, f"Adversarial mutator found stub marker '{forbidden}'."
    return True, None


class EvaluationCascade:
    """Short-circuit deterministic verification cascade."""

    def __init__(
        self,
        *,
        dream_gate: DreamGate | None = None,
        z3_gate: Z3ConstraintGate | None = None,
        blind_mutator: MutatorOracleFn | None = None,
    ) -> None:
        self.dream_gate = dream_gate or DreamGate()
        self.z3_gate = z3_gate or Z3ConstraintGate()
        self.blind_mutator = blind_mutator or _default_blind_mutator

    def evaluate(
        self,
        *,
        payload: str,
        modality: Modality,
        action_role: ActionRole,
        contract_content: str,
        target_files: list[str] | None = None,
        allowed_files: list[str] | None = None,
        has_formal_anchor_revision: bool = False,
        z3_constraints_json: str | None = None,
        unit_oracle: TestOracleFn | None = None,
        crystallized_tests: list[TestOracleFn] | None = None,
        require_adversarial: bool = False,
    ) -> CascadeAssessment:
        # Stage 0: Target Lock, DreamGate anchor protection, and syntax check
        files = target_files or []
        gate_res = self.dream_gate.assess_proposal(files, has_formal_anchor_revision=has_formal_anchor_revision)
        if not gate_res.should_proceed:
            msg = gate_res.prune_reason or "DreamGate blocked proposal."
            return CascadeAssessment(
                v_det_passed=False,
                cascade_stage=CascadeStage.S0_SYNTAX,
                z3_status=Z3Status.SKIPPED,
                stage_dense_reward=0.0,
                error_hash=_hash_error(CascadeStage.S0_SYNTAX, msg),
                error_delta=msg,
                details={"dream_gate_action": gate_res.suggested_action},
            )

        if allowed_files is not None and files:
            allowed_norm = {f.replace("\\", "/") for f in allowed_files}
            disallowed = [f for f in files if f.replace("\\", "/") not in allowed_norm]
            if disallowed:
                msg = f"Target Lock violation: files outside contract scope: {disallowed}"
                return CascadeAssessment(
                    v_det_passed=False,
                    cascade_stage=CascadeStage.S0_SYNTAX,
                    z3_status=Z3Status.SKIPPED,
                    stage_dense_reward=0.0,
                    error_hash=_hash_error(CascadeStage.S0_SYNTAX, msg),
                    error_delta=msg,
                )

        if not payload.strip():
            msg = "Empty candidate payload."
            return CascadeAssessment(
                v_det_passed=False,
                cascade_stage=CascadeStage.S0_SYNTAX,
                z3_status=Z3Status.SKIPPED,
                stage_dense_reward=0.0,
                error_hash=_hash_error(CascadeStage.S0_SYNTAX, msg),
                error_delta=msg,
            )

        normalized_payload = _strip_markdown_fences(payload)
        if modality == Modality.CODE:
            try:
                ast.parse(normalized_payload)
            except SyntaxError as exc:
                msg = f"Python AST SyntaxError at line {exc.lineno}: {exc.msg}"
                return CascadeAssessment(
                    v_det_passed=False,
                    cascade_stage=CascadeStage.S0_SYNTAX,
                    z3_status=Z3Status.SKIPPED,
                    stage_dense_reward=0.0,
                    error_hash=_hash_error(CascadeStage.S0_SYNTAX, msg),
                    error_delta=msg,
                )
        elif modality == Modality.STRUCTURED:
            try:
                json.loads(normalized_payload)
            except json.JSONDecodeError as exc:
                msg = f"Invalid JSON payload: {exc.msg} (pos {exc.pos})"
                return CascadeAssessment(
                    v_det_passed=False,
                    cascade_stage=CascadeStage.S0_SYNTAX,
                    z3_status=Z3Status.SKIPPED,
                    stage_dense_reward=0.0,
                    error_hash=_hash_error(CascadeStage.S0_SYNTAX, msg),
                    error_delta=msg,
                )

        # Stage 0.5: Declarative SMT/Z3 consistency gate
        z3_res = self.z3_gate.verify_json(z3_constraints_json)
        if z3_res.status == Z3Status.UNSAT or (
            z3_res.status == Z3Status.UNKNOWN and action_role in {ActionRole.COMMIT_PROD, ActionRole.EXTERNAL_TOOL}
        ):
            msg = f"Z3 Gate {z3_res.status.value}: core={list(z3_res.unsat_core)} detail={z3_res.error_detail}"
            return CascadeAssessment(
                v_det_passed=False,
                cascade_stage=CascadeStage.S05_Z3,
                z3_status=z3_res.status,
                stage_dense_reward=0.15,
                error_hash=_hash_error(CascadeStage.S05_Z3, msg),
                error_delta=msg,
                details={"z3_engine": z3_res.engine, "unsat_core": list(z3_res.unsat_core)},
            )

        # Stage 1: Unit tests + crystallized D_crit regressions
        test_vec: list[int] = []
        if unit_oracle is not None:
            passed, vec, err_msg = unit_oracle(normalized_payload)
            test_vec.extend(vec)
            if not passed:
                msg = err_msg or "Unit test suite failed in Stage 1."
                return CascadeAssessment(
                    v_det_passed=False,
                    cascade_stage=CascadeStage.S1_UNIT,
                    z3_status=z3_res.status,
                    stage_dense_reward=0.30,
                    error_hash=_hash_error(CascadeStage.S1_UNIT, msg),
                    error_delta=msg,
                    test_vector=tuple(test_vec),
                )

        for idx, dcrit_fn in enumerate(crystallized_tests or ()):
            passed, vec, err_msg = dcrit_fn(normalized_payload)
            test_vec.extend(vec)
            if not passed:
                msg = err_msg or f"Crystallized D_crit regression test #{idx} failed."
                return CascadeAssessment(
                    v_det_passed=False,
                    cascade_stage=CascadeStage.S1_UNIT,
                    z3_status=z3_res.status,
                    stage_dense_reward=0.35,
                    error_hash=_hash_error(CascadeStage.S1_UNIT, msg),
                    error_delta=msg,
                    test_vector=tuple(test_vec),
                )

        # Stage 2: Blind adversarial mutator for high-risk roles or asymmetry escalation
        run_s2 = require_adversarial or action_role in {ActionRole.COMMIT_PROD, ActionRole.EXTERNAL_TOOL}
        if run_s2:
            mut_ok, counterexample = self.blind_mutator(contract_content, normalized_payload)
            if not mut_ok:
                msg = counterexample or "Blind adversarial mutator produced counterexample."
                return CascadeAssessment(
                    v_det_passed=False,
                    cascade_stage=CascadeStage.S2_ADVERSARIAL,
                    z3_status=z3_res.status,
                    stage_dense_reward=0.70,
                    error_hash=_hash_error(CascadeStage.S2_ADVERSARIAL, msg),
                    error_delta=msg,
                    test_vector=tuple(test_vec),
                )
            return CascadeAssessment(
                v_det_passed=True,
                cascade_stage=CascadeStage.S2_ADVERSARIAL,
                z3_status=z3_res.status,
                stage_dense_reward=1.0,
                test_vector=tuple(test_vec),
            )

        return CascadeAssessment(
            v_det_passed=True,
            cascade_stage=CascadeStage.S1_UNIT,
            z3_status=z3_res.status,
            stage_dense_reward=0.70,
            test_vector=tuple(test_vec),
        )
