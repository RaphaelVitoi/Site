"""Tests for declarative AST SMT/Z3 consistency gate."""

from __future__ import annotations

import json

import pytest

from control_plane.config import Z3Status
from control_plane.z3_gate import Z3ConstraintGate


@pytest.mark.unit
def test_z3_gate_detects_unsat_and_extracts_core() -> None:
    gate = Z3ConstraintGate(timeout_ms=50)
    spec = {
        "variables": [{"name": "max_retries", "var_type": "int"}],
        "clauses": [
            {
                "clause_id": "lower_bound",
                "expr": {
                    "op": "ge",
                    "left": {"op": "var", "name": "max_retries"},
                    "right": {"op": "const", "value": 5},
                },
            },
            {
                "clause_id": "upper_bound",
                "expr": {
                    "op": "lt",
                    "left": {"op": "var", "name": "max_retries"},
                    "right": {"op": "const", "value": 3},
                },
            },
        ],
    }
    res = gate.verify_json(json.dumps(spec))
    assert res.status == Z3Status.UNSAT
    assert "lower_bound" in res.unsat_core
    assert "upper_bound" in res.unsat_core


@pytest.mark.unit
def test_z3_gate_accepts_sat_boolean_and_numeric_contract() -> None:
    gate = Z3ConstraintGate(timeout_ms=50)
    spec = {
        "variables": [
            {"name": "tokens", "var_type": "int"},
            {"name": "strict_mode", "var_type": "bool"},
        ],
        "clauses": [
            {
                "clause_id": "budget_cap",
                "expr": {"op": "le", "left": {"op": "var", "name": "tokens"}, "right": {"op": "const", "value": 4000}},
            },
            {
                "clause_id": "strict_requires_budget",
                "expr": {
                    "op": "implies",
                    "antecedent": {"op": "var", "name": "strict_mode"},
                    "consequent": {
                        "op": "ge",
                        "left": {"op": "var", "name": "tokens"},
                        "right": {"op": "const", "value": 500},
                    },
                },
            },
        ],
    }
    res = gate.verify_json(json.dumps(spec))
    assert res.status == Z3Status.SAT


@pytest.mark.unit
def test_z3_gate_rejects_disallowed_ast_ops() -> None:
    gate = Z3ConstraintGate(timeout_ms=50)
    bad_spec = {
        "variables": [{"name": "x", "var_type": "int"}],
        "clauses": [
            {
                "clause_id": "evil",
                "expr": {"op": "exec_python", "code": "__import__('os').system('echo pwned')"},
            }
        ],
    }
    res = gate.verify_json(json.dumps(bad_spec))
    assert res.status == Z3Status.UNSAT
    assert "ast_validation_failed" in res.unsat_core
