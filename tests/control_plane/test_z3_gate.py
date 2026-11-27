"""Tests for declarative AST SMT/Z3 consistency gate."""

from __future__ import annotations

import json
import time

import numpy as np
import pytest

from control_plane.config import Z3Status
from control_plane.z3_gate import Z3_AVAILABLE, Z3ConstraintGate


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
    assert Z3_AVAILABLE is True
    assert res.engine == "z3"
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
    assert res.engine == "z3"
    assert res.status == Z3Status.SAT


@pytest.mark.unit
def test_z3_gate_solves_coupled_multivar_linear_and_constant_contracts() -> None:
    z3_gate = Z3ConstraintGate(timeout_ms=50, prefer_z3=True)
    builtin_gate = Z3ConstraintGate(timeout_ms=50, prefer_z3=False)

    coupled_sat = {
        "variables": [
            {"name": "x", "var_type": "int"},
            {"name": "y", "var_type": "real"},
        ],
        "clauses": [
            {
                "clause_id": "sum_cap",
                "expr": {
                    "op": "le",
                    "left": {"op": "add", "args": [{"op": "var", "name": "x"}, {"op": "var", "name": "y"}]},
                    "right": {"op": "const", "value": 10},
                },
            },
            {
                "clause_id": "slope",
                "expr": {
                    "op": "ge",
                    "left": {
                        "op": "sub",
                        "args": [
                            {"op": "mul_const", "coef": 2, "arg": {"op": "var", "name": "x"}},
                            {"op": "var", "name": "y"},
                        ],
                    },
                    "right": {"op": "const", "value": 4},
                },
            },
            {
                "clause_id": "y_lo",
                "expr": {"op": "ge", "left": {"op": "var", "name": "y"}, "right": {"op": "const", "value": 3}},
            },
        ],
    }
    res_sat = z3_gate.verify_json(json.dumps(coupled_sat))
    assert res_sat.engine == "z3"
    assert res_sat.status == Z3Status.SAT

    coupled_unsat = {
        "variables": [
            {"name": "x", "var_type": "int"},
            {"name": "y", "var_type": "int"},
        ],
        "clauses": [
            {
                "clause_id": "sum_cap",
                "expr": {
                    "op": "le",
                    "left": {"op": "add", "args": [{"op": "var", "name": "x"}, {"op": "var", "name": "y"}]},
                    "right": {"op": "const", "value": 5},
                },
            },
            {
                "clause_id": "x_lo",
                "expr": {"op": "ge", "left": {"op": "var", "name": "x"}, "right": {"op": "const", "value": 4}},
            },
            {
                "clause_id": "y_lo",
                "expr": {"op": "ge", "left": {"op": "var", "name": "y"}, "right": {"op": "const", "value": 2}},
            },
        ],
    }
    res_unsat = z3_gate.verify_json(json.dumps(coupled_unsat))
    assert res_unsat.engine == "z3"
    assert res_unsat.status == Z3Status.UNSAT
    assert {"sum_cap", "x_lo", "y_lo"} <= set(res_unsat.unsat_core)

    builtin_res = builtin_gate.verify_json(json.dumps(coupled_unsat))
    assert builtin_res.engine == "builtin-qf-lia"
    assert builtin_res.status == Z3Status.UNKNOWN

    const_false = {
        "variables": [{"name": "flag", "var_type": "bool"}],
        "clauses": [
            {"clause_id": "const_bool", "expr": {"op": "const", "value": False}},
            {
                "clause_id": "const_cmp",
                "expr": {"op": "lt", "left": {"op": "const", "value": 1}, "right": {"op": "const", "value": 2}},
            },
        ],
    }
    res_const = z3_gate.verify_json(json.dumps(const_false))
    assert res_const.engine == "z3"
    assert res_const.status == Z3Status.UNSAT
    assert "const_bool" in res_const.unsat_core

    const_cmp_false = {
        "variables": [],
        "clauses": [
            {
                "clause_id": "bad_cmp",
                "expr": {"op": "lt", "left": {"op": "const", "value": 5}, "right": {"op": "const", "value": 2}},
            },
        ],
    }
    res_cmp_false = z3_gate.verify_json(json.dumps(const_cmp_false))
    assert res_cmp_false.engine == "z3"
    assert res_cmp_false.status == Z3Status.UNSAT
    assert "bad_cmp" in res_cmp_false.unsat_core


@pytest.mark.unit
def test_z3_gate_coupled_solve_latency_p95_under_50ms() -> None:
    gate = Z3ConstraintGate(timeout_ms=50, prefer_z3=True)
    spec_json = json.dumps(
        {
            "variables": [
                {"name": "x", "var_type": "int"},
                {"name": "y", "var_type": "int"},
            ],
            "clauses": [
                {
                    "clause_id": "sum_cap",
                    "expr": {
                        "op": "le",
                        "left": {"op": "add", "args": [{"op": "var", "name": "x"}, {"op": "var", "name": "y"}]},
                        "right": {"op": "const", "value": 20},
                    },
                },
                {
                    "clause_id": "diff_floor",
                    "expr": {
                        "op": "ge",
                        "left": {"op": "sub", "args": [{"op": "var", "name": "x"}, {"op": "var", "name": "y"}]},
                        "right": {"op": "const", "value": 2},
                    },
                },
            ],
        }
    )
    latencies_ms: list[float] = []
    for _ in range(50):
        t0 = time.perf_counter()
        res = gate.verify_json(spec_json)
        latencies_ms.append((time.perf_counter() - t0) * 1000.0)
        assert res.engine == "z3"
        assert res.status == Z3Status.SAT
    assert float(np.percentile(latencies_ms, 95)) < 50.0


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
