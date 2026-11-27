"""Short-circuit Evaluation Cascade (S0 -> S0.5 Z3 -> S1 Unit/D_crit -> S2 Blind Mutator).

Integrates directly with conductor.dream_gate.DreamGate for Target Lock and governance anchor protection.
"""

from __future__ import annotations

import ast
from collections.abc import Callable
from dataclasses import dataclass, field
import hashlib
import json
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


def _strip_markdown_fences(payload: str) -> str:
    """Extract inner code/JSON from fenced markdown blocks in O(n) time."""
    stripped = payload.strip()
    start = stripped.find("```")
    if start == -1:
        return stripped
    newline = stripped.find("\n", start + 3)
    if newline == -1:
        return stripped
    end = stripped.find("```", newline + 1)
    if end == -1:
        return stripped
    return stripped[newline + 1 : end].strip()


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

    @staticmethod
    def _failure(
        stage: CascadeStage,
        msg: str,
        *,
        z3_status: Z3Status = Z3Status.SKIPPED,
        reward: float = 0.0,
        test_vector: tuple[int, ...] = (),
        details: dict[str, Any] | None = None,
    ) -> CascadeAssessment:
        return CascadeAssessment(
            v_det_passed=False,
            cascade_stage=stage,
            z3_status=z3_status,
            stage_dense_reward=reward,
            error_hash=_hash_error(stage, msg),
            error_delta=msg,
            test_vector=test_vector,
            details=details or {},
        )

    def _check_stage0_scope(
        self,
        *,
        payload: str,
        target_files: list[str],
        allowed_files: list[str] | None,
        has_formal_anchor_revision: bool,
    ) -> CascadeAssessment | None:
        gate_res = self.dream_gate.assess_proposal(target_files, has_formal_anchor_revision=has_formal_anchor_revision)
        if not gate_res.should_proceed:
            return self._failure(
                CascadeStage.S0_SYNTAX,
                gate_res.prune_reason or "DreamGate blocked proposal.",
                details={"dream_gate_action": gate_res.suggested_action},
            )
        if allowed_files is not None and target_files:
            allowed_norm = {f.replace("\\", "/") for f in allowed_files}
            disallowed = [f for f in target_files if f.replace("\\", "/") not in allowed_norm]
            if disallowed:
                return self._failure(
                    CascadeStage.S0_SYNTAX,
                    f"Target Lock violation: files outside contract scope: {disallowed}",
                )
        if not payload.strip():
            return self._failure(CascadeStage.S0_SYNTAX, "Empty candidate payload.")
        return None

    def _check_stage0_syntax(self, normalized: str, modality: Modality) -> CascadeAssessment | None:
        if modality == Modality.CODE:
            try:
                ast.parse(normalized)
            except SyntaxError as exc:
                return self._failure(CascadeStage.S0_SYNTAX, f"Python AST SyntaxError at line {exc.lineno}: {exc.msg}")
        elif modality == Modality.STRUCTURED:
            try:
                json.loads(normalized)
            except json.JSONDecodeError as exc:
                return self._failure(CascadeStage.S0_SYNTAX, f"Invalid JSON payload: {exc.msg} (pos {exc.pos})")
        return None

    def _check_stage1_oracles(
        self,
        normalized: str,
        z3_status: Z3Status,
        unit_oracle: TestOracleFn | None,
        crystallized_tests: list[TestOracleFn] | None,
    ) -> tuple[list[int], CascadeAssessment | None]:
        test_vec: list[int] = []
        if unit_oracle is not None:
            passed, vec, err_msg = unit_oracle(normalized)
            test_vec.extend(vec)
            if not passed:
                return test_vec, self._failure(
                    CascadeStage.S1_UNIT,
                    err_msg or "Unit test suite failed in Stage 1.",
                    z3_status=z3_status,
                    reward=0.30,
                    test_vector=tuple(test_vec),
                )
        for idx, dcrit_fn in enumerate(crystallized_tests or ()):
            passed, vec, err_msg = dcrit_fn(normalized)
            test_vec.extend(vec)
            if not passed:
                return test_vec, self._failure(
                    CascadeStage.S1_UNIT,
                    err_msg or f"Crystallized D_crit regression test #{idx} failed.",
                    z3_status=z3_status,
                    reward=0.35,
                    test_vector=tuple(test_vec),
                )
        return test_vec, None

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
        scope_fail = self._check_stage0_scope(
            payload=payload,
            target_files=target_files or [],
            allowed_files=allowed_files,
            has_formal_anchor_revision=has_formal_anchor_revision,
        )
        if scope_fail is not None:
            return scope_fail

        normalized = _strip_markdown_fences(payload)
        syntax_fail = self._check_stage0_syntax(normalized, modality)
        if syntax_fail is not None:
            return syntax_fail

        z3_res = self.z3_gate.verify_json(z3_constraints_json)
        strict_role = action_role in {ActionRole.COMMIT_PROD, ActionRole.EXTERNAL_TOOL}
        if z3_res.status == Z3Status.UNSAT or (z3_res.status == Z3Status.UNKNOWN and strict_role):
            msg = f"Z3 Gate {z3_res.status.value}: core={list(z3_res.unsat_core)} detail={z3_res.error_detail}"
            return self._failure(
                CascadeStage.S05_Z3,
                msg,
                z3_status=z3_res.status,
                reward=0.15,
                details={"z3_engine": z3_res.engine, "unsat_core": list(z3_res.unsat_core)},
            )

        test_vec, s1_fail = self._check_stage1_oracles(normalized, z3_res.status, unit_oracle, crystallized_tests)
        if s1_fail is not None:
            return s1_fail

        if not (require_adversarial or strict_role):
            return CascadeAssessment(
                v_det_passed=True,
                cascade_stage=CascadeStage.S1_UNIT,
                z3_status=z3_res.status,
                stage_dense_reward=0.70,
                test_vector=tuple(test_vec),
            )

        mut_ok, counterexample = self.blind_mutator(contract_content, normalized)
        if not mut_ok:
            return self._failure(
                CascadeStage.S2_ADVERSARIAL,
                counterexample or "Blind adversarial mutator produced counterexample.",
                z3_status=z3_res.status,
                reward=0.70,
                test_vector=tuple(test_vec),
            )
        return CascadeAssessment(
            v_det_passed=True,
            cascade_stage=CascadeStage.S2_ADVERSARIAL,
            z3_status=z3_res.status,
            stage_dense_reward=1.0,
            test_vector=tuple(test_vec),
        )
