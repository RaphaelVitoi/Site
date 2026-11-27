"""Declarative AST SMT/Z3 consistency gate (QF_LIA / QF_LRA + Boolean, 50ms timeout).

Never evaluates arbitrary Python strings. Accepts only typed JSON AST nodes
and validates contract/output invariants before LLM inference.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
import math
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from control_plane.config import Z3Status

try:
    import z3  # type: ignore[import-not-found]

    Z3_AVAILABLE = True
except ImportError:
    z3 = None
    Z3_AVAILABLE = False


class Z3Variable(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, pattern=r"^[a-zA-Z_][a-zA-Z0-9_]*$")
    var_type: Literal["int", "real", "bool"] = "int"


class Z3ConstraintClause(BaseModel):
    model_config = ConfigDict(extra="forbid")

    clause_id: str = Field(min_length=1)
    expr: dict[str, Any]


class Z3ConstraintSpec(BaseModel):
    model_config = ConfigDict(extra="forbid")

    variables: list[Z3Variable] = Field(default_factory=list)
    clauses: list[Z3ConstraintClause] = Field(default_factory=list)


@dataclass(frozen=True, slots=True)
class Z3GateResult:
    status: Z3Status
    engine: str
    unsat_core: tuple[str, ...] = ()
    error_detail: str | None = None


_NUMERIC_OPS = {"var", "const", "add", "sub", "mul_const"}
_CMP_OPS = {"eq", "ne", "lt", "le", "gt", "ge"}
_BOOL_OPS = {"var", "const", "and", "or", "not", "implies"}
_ALLOWED_OPS = _NUMERIC_OPS | _CMP_OPS | _BOOL_OPS


def _validate_ast_node(node: dict[str, Any], var_types: dict[str, str], depth: int = 0) -> None:
    if depth > 32:
        raise ValueError("AST depth limit exceeded.")
    op = node.get("op")
    if not isinstance(op, str) or op not in _ALLOWED_OPS:
        raise ValueError(f"Unsupported AST operator: {op!r}")

    if op == "var":
        name = node.get("name")
        if not isinstance(name, str) or name not in var_types:
            raise ValueError(f"Undeclared variable in AST: {name!r}")
        return
    if op == "const":
        val = node.get("value")
        if not isinstance(val, int | float | bool):
            raise ValueError(f"Invalid constant value: {val!r}")
        return
    if op in {"add", "sub", "and", "or"}:
        args = node.get("args")
        if not isinstance(args, list) or len(args) < 1:
            raise ValueError(f"Operator '{op}' requires non-empty 'args' list.")
        for child in args:
            if not isinstance(child, dict):
                raise ValueError("AST child must be a mapping.")
            _validate_ast_node(child, var_types, depth + 1)
        return
    if op == "mul_const":
        coef = node.get("coef")
        arg = node.get("arg")
        if isinstance(coef, bool) or not isinstance(coef, int | float) or not isinstance(arg, dict):
            raise ValueError("Operator 'mul_const' requires numeric 'coef' and dict 'arg'.")
        _validate_ast_node(arg, var_types, depth + 1)
        return
    if op == "not":
        arg = node.get("arg")
        if not isinstance(arg, dict):
            raise ValueError("Operator 'not' requires dict 'arg'.")
        _validate_ast_node(arg, var_types, depth + 1)
        return
    if op == "implies":
        ant = node.get("antecedent")
        con = node.get("consequent")
        if not isinstance(ant, dict) or not isinstance(con, dict):
            raise ValueError("Operator 'implies' requires dict 'antecedent' and 'consequent'.")
        _validate_ast_node(ant, var_types, depth + 1)
        _validate_ast_node(con, var_types, depth + 1)
        return
    if op in _CMP_OPS:
        left = node.get("left")
        right = node.get("right")
        if not isinstance(left, dict) or not isinstance(right, dict):
            raise ValueError(f"Comparison '{op}' requires dict 'left' and 'right'.")
        _validate_ast_node(left, var_types, depth + 1)
        _validate_ast_node(right, var_types, depth + 1)


@dataclass
class _AffineForm:
    coeffs: dict[str, float] = field(default_factory=dict)
    const: float = 0.0

    def scale(self, factor: float) -> _AffineForm:
        if factor == 0.0:
            return _AffineForm()
        return _AffineForm({k: v * factor for k, v in self.coeffs.items() if v * factor != 0.0}, self.const * factor)

    def add(self, other: _AffineForm) -> _AffineForm:
        merged = dict(self.coeffs)
        for k, v in other.coeffs.items():
            nv = merged.get(k, 0.0) + v
            if abs(nv) <= 1e-12:
                merged.pop(k, None)
            else:
                merged[k] = nv
        return _AffineForm(merged, self.const + other.const)

    def sub(self, other: _AffineForm) -> _AffineForm:
        return self.add(other.scale(-1.0))

    def normalized_direction_key(self) -> tuple[tuple[str, float], ...]:
        if not self.coeffs:
            return ()
        norm = math.sqrt(sum(v * v for v in self.coeffs.values()))
        return tuple(sorted((k, round(v / norm, 9)) for k, v in self.coeffs.items()))

    def direction_scale(self) -> float:
        return math.sqrt(sum(v * v for v in self.coeffs.values()))


@dataclass
class _NumBound:
    lo: float = -math.inf
    lo_inc: bool = False
    hi: float = math.inf
    hi_inc: bool = False
    neq: set[float] = field(default_factory=set)

    def is_feasible(self, is_int: bool) -> bool:
        lo = self.lo
        lo_inc = self.lo_inc
        hi = self.hi
        hi_inc = self.hi_inc
        if is_int:
            if math.isfinite(lo):
                lo = math.ceil(lo) if lo_inc else float(math.floor(lo) + 1)
                lo_inc = True
            if math.isfinite(hi):
                hi = math.floor(hi) if hi_inc else float(math.ceil(hi) - 1)
                hi_inc = True
        if lo > hi:
            return False
        return not (lo == hi and (not lo_inc or not hi_inc or lo in self.neq))


def _eval_affine(node: dict[str, Any]) -> _AffineForm:
    op = node["op"]
    if op == "const":
        val = node["value"]
        if isinstance(val, bool):
            raise ValueError("Boolean constant cannot be used in numeric affine expression.")
        return _AffineForm(const=float(val))
    if op == "var":
        return _AffineForm(coeffs={str(node["name"]): 1.0})
    if op == "mul_const":
        return _eval_affine(node["arg"]).scale(float(node["coef"]))
    if op == "add":
        acc = _AffineForm()
        for child in node["args"]:
            acc = acc.add(_eval_affine(child))
        return acc
    if op == "sub":
        args = node["args"]
        acc = _eval_affine(args[0])
        for child in args[1:]:
            acc = acc.sub(_eval_affine(child))
        return acc
    raise ValueError(f"Non-numeric operator in affine context: {op}")


def _to_cnf_atoms(node: dict[str, Any], negated: bool = False) -> list[list[tuple[dict[str, Any], bool]]]:
    """Convert a boolean AST into a list of disjunctive clauses (DNF-split into conjunction of disjunctions)."""
    op = node["op"]
    if op == "not":
        return _to_cnf_atoms(node["arg"], negated=not negated)
    if op == "implies":
        # A -> B  ===  (~A) OR B
        or_node = {"op": "or", "args": [{"op": "not", "arg": node["antecedent"]}, node["consequent"]]}
        return _to_cnf_atoms(or_node, negated=negated)
    if (op == "and" and not negated) or (op == "or" and negated):
        clauses: list[list[tuple[dict[str, Any], bool]]] = []
        for child in node["args"]:
            clauses.extend(_to_cnf_atoms(child, negated=negated))
        return clauses
    if (op == "or" and not negated) or (op == "and" and negated):
        # Cross-product of child clauses; keep compact for small boolean formulas
        disjunctions: list[list[tuple[dict[str, Any], bool]]] = [[]]
        for child in node["args"]:
            child_cnf = _to_cnf_atoms(child, negated=negated)
            if len(child_cnf) == 1:
                next_disj: list[list[tuple[dict[str, Any], bool]]] = []
                for existing in disjunctions:
                    next_disj.append(existing + child_cnf[0])
                disjunctions = next_disj
            else:
                expanded: list[list[tuple[dict[str, Any], bool]]] = []
                for c_clause in child_cnf:
                    for existing in disjunctions:
                        expanded.append(existing + c_clause)
                disjunctions = expanded[:64]
        return disjunctions
    return [[(node, negated)]]


def _flip_cmp(op: str) -> str:
    return {"eq": "ne", "ne": "eq", "lt": "ge", "ge": "lt", "le": "gt", "gt": "le"}[op]


class _BuiltinLinearGate:
    """Pure-Python deterministic fallback for QF_LIA / QF_LRA / Boolean contracts."""

    @classmethod
    def check(cls, spec: Z3ConstraintSpec) -> Z3GateResult:
        var_types = {v.name: v.var_type for v in spec.variables}
        tagged_disjunctions: list[tuple[str, list[tuple[dict[str, Any], bool]]]] = []
        for clause in spec.clauses:
            for disj in _to_cnf_atoms(clause.expr):
                tagged_disjunctions.append((clause.clause_id, disj))

        status, core = cls._solve_disjunctions(tagged_disjunctions, var_types)
        return Z3GateResult(status=status, engine="builtin-qf-lia", unsat_core=tuple(dict.fromkeys(core)))

    @classmethod
    def _solve_disjunctions(
        cls,
        disjunctions: list[tuple[str, list[tuple[dict[str, Any], bool]]]],
        var_types: dict[str, str],
    ) -> tuple[Z3Status, list[str]]:
        unit_atoms: list[tuple[str, dict[str, Any], bool]] = []
        branching: list[tuple[str, list[tuple[dict[str, Any], bool]]]] = []
        for cid, disj in disjunctions:
            if len(disj) == 1:
                unit_atoms.append((cid, disj[0][0], disj[0][1]))
            else:
                branching.append((cid, disj))

        ok, core = cls._check_conjunction(unit_atoms, var_types)
        if ok != Z3Status.SAT:
            return ok, core
        if not branching:
            return Z3Status.SAT, []

        # Backtrack over disjunctive branches (bounded search)
        if len(branching) > 12:
            return Z3Status.UNKNOWN, []

        def _search(idx: int, chosen: list[tuple[str, dict[str, Any], bool]]) -> tuple[Z3Status, list[str]]:
            if idx == len(branching):
                return cls._check_conjunction(unit_atoms + chosen, var_types)
            cid, disj = branching[idx]
            saw_unknown = False
            collected_core: list[str] = [cid]
            for atom, neg in disj:
                res, sub_core = _search(idx + 1, [*chosen, (cid, atom, neg)])
                if res == Z3Status.SAT:
                    return Z3Status.SAT, []
                if res == Z3Status.UNKNOWN:
                    saw_unknown = True
                else:
                    collected_core.extend(sub_core)
            if saw_unknown:
                return Z3Status.UNKNOWN, []
            return Z3Status.UNSAT, collected_core

        return _search(0, [])

    @classmethod
    def _check_conjunction(
        cls,
        atoms: list[tuple[str, dict[str, Any], bool]],
        var_types: dict[str, str],
    ) -> tuple[Z3Status, list[str]]:
        bool_assign: dict[str, tuple[bool, str]] = {}
        bounds: dict[str, _NumBound] = {k: _NumBound() for k, vt in var_types.items() if vt in {"int", "real"}}
        bound_sources: dict[str, list[str]] = {k: [] for k in bounds}
        # Track normalized multi-var linear half-spaces: dir_key -> list[(cid, scale, op_norm, rhs)]
        hyperplanes: dict[tuple[tuple[str, float], ...], list[tuple[str, float, str, float]]] = {}
        has_coupled = False

        for cid, atom, neg in atoms:
            op = atom["op"]
            if op == "const":
                val = bool(atom["value"]) ^ neg
                if not val:
                    return Z3Status.UNSAT, [cid]
                continue
            if op == "var":
                vname = str(atom["name"])
                desired = not neg
                if vname in bool_assign and bool_assign[vname][0] != desired:
                    return Z3Status.UNSAT, [bool_assign[vname][1], cid]
                bool_assign[vname] = (desired, cid)
                continue
            if op in _CMP_OPS:
                eff_op = _flip_cmp(op) if neg else op
                left_op = atom["left"]["op"]
                right_op = atom["right"]["op"]
                if (left_op == "var" and var_types.get(str(atom["left"]["name"])) == "bool") or (
                    right_op == "var" and var_types.get(str(atom["right"]["name"])) == "bool"
                ):
                    if eff_op not in {"eq", "ne"}:
                        return Z3Status.UNKNOWN, []
                    # Handle bool == const / bool != const
                    if left_op == "var" and right_op == "const":
                        bname = str(atom["left"]["name"])
                        bval = bool(atom["right"]["value"])
                        desired = bval if eff_op == "eq" else not bval
                        if bname in bool_assign and bool_assign[bname][0] != desired:
                            return Z3Status.UNSAT, [bool_assign[bname][1], cid]
                        bool_assign[bname] = (desired, cid)
                    continue

                diff = _eval_affine(atom["left"]).sub(_eval_affine(atom["right"]))
                # diff <op> 0
                if not diff.coeffs:
                    c = diff.const
                    sat = {
                        "eq": abs(c) <= 1e-12,
                        "ne": abs(c) > 1e-12,
                        "lt": c < -1e-12,
                        "le": c <= 1e-12,
                        "gt": c > 1e-12,
                        "ge": c >= -1e-12,
                    }[eff_op]
                    if not sat:
                        return Z3Status.UNSAT, [cid]
                    continue

                if len(diff.coeffs) == 1:
                    vname, coef = next(iter(diff.coeffs.items()))
                    rhs = -diff.const / coef
                    flipped = eff_op
                    if coef < 0:
                        flipped = {"eq": "eq", "ne": "ne", "lt": "gt", "le": "ge", "gt": "lt", "ge": "le"}[eff_op]
                    b = bounds[vname]
                    bound_sources[vname].append(cid)
                    if flipped == "eq":
                        if rhs > b.lo or (rhs == b.lo and b.lo_inc):
                            b.lo, b.lo_inc = rhs, True
                        if rhs < b.hi or (rhs == b.hi and b.hi_inc):
                            b.hi, b.hi_inc = rhs, True
                    elif flipped == "ne":
                        b.neq.add(rhs)
                    elif flipped in {"gt", "ge"}:
                        inc = flipped == "ge"
                        if rhs > b.lo or (rhs == b.lo and b.lo_inc and not inc):
                            b.lo, b.lo_inc = rhs, inc
                    elif flipped in {"lt", "le"}:
                        inc = flipped == "le"
                        if rhs < b.hi or (rhs == b.hi and b.hi_inc and not inc):
                            b.hi, b.hi_inc = rhs, inc

                    if not b.is_feasible(var_types[vname] == "int"):
                        return Z3Status.UNSAT, bound_sources[vname]
                else:
                    has_coupled = True
                    key = diff.normalized_direction_key()
                    scale = diff.direction_scale()
                    # Choose canonical sign by first variable coefficient
                    first_var = min(diff.coeffs)
                    sign = 1.0 if diff.coeffs[first_var] > 0 else -1.0
                    canon_key = tuple((k, round(v * sign, 9)) for k, v in key)
                    # diff = sign * scale * (canon_dir . x) + diff.const <eff_op> 0
                    # => (canon_dir . x) <op_s> -diff.const / (sign * scale)
                    op_s = eff_op
                    if sign < 0:
                        op_s = {"eq": "eq", "ne": "ne", "lt": "gt", "le": "ge", "gt": "lt", "ge": "le"}[eff_op]
                    rhs_val = -diff.const / (sign * scale)
                    hyperplanes.setdefault(canon_key, []).append((cid, scale, op_s, rhs_val))

        # Check parallel coupled hyperplanes for direct contradiction
        for entries in hyperplanes.values():
            hb = _NumBound()
            srcs: list[str] = []
            for cid, _scale, op_s, rhs_val in entries:
                srcs.append(cid)
                if op_s == "eq":
                    hb.lo, hb.lo_inc = max(hb.lo, rhs_val), True
                    hb.hi, hb.hi_inc = min(hb.hi, rhs_val), True
                elif op_s == "ne":
                    hb.neq.add(rhs_val)
                elif op_s in {"gt", "ge"}:
                    inc = op_s == "ge"
                    if rhs_val > hb.lo or (rhs_val == hb.lo and hb.lo_inc and not inc):
                        hb.lo, hb.lo_inc = rhs_val, inc
                elif op_s in {"lt", "le"}:
                    inc = op_s == "le"
                    if rhs_val < hb.hi or (rhs_val == hb.hi and hb.hi_inc and not inc):
                        hb.hi, hb.hi_inc = rhs_val, inc
            if not hb.is_feasible(is_int=False):
                return Z3Status.UNSAT, srcs

        if has_coupled:
            return Z3Status.UNKNOWN, []
        return Z3Status.SAT, []


def _compile_z3_expr(node: dict[str, Any], z3_vars: dict[str, Any]) -> Any:
    assert z3 is not None
    op = node["op"]
    if op == "var":
        return z3_vars[str(node["name"])]
    if op == "const":
        return node["value"]
    if op == "add":
        args = [_compile_z3_expr(c, z3_vars) for c in node["args"]]
        acc = args[0]
        for a in args[1:]:
            acc = acc + a
        return acc
    if op == "sub":
        args = [_compile_z3_expr(c, z3_vars) for c in node["args"]]
        acc = args[0]
        for a in args[1:]:
            acc = acc - a
        return acc
    if op == "mul_const":
        return node["coef"] * _compile_z3_expr(node["arg"], z3_vars)
    if op == "eq":
        return _compile_z3_expr(node["left"], z3_vars) == _compile_z3_expr(node["right"], z3_vars)
    if op == "ne":
        return _compile_z3_expr(node["left"], z3_vars) != _compile_z3_expr(node["right"], z3_vars)
    if op == "lt":
        return _compile_z3_expr(node["left"], z3_vars) < _compile_z3_expr(node["right"], z3_vars)
    if op == "le":
        return _compile_z3_expr(node["left"], z3_vars) <= _compile_z3_expr(node["right"], z3_vars)
    if op == "gt":
        return _compile_z3_expr(node["left"], z3_vars) > _compile_z3_expr(node["right"], z3_vars)
    if op == "ge":
        return _compile_z3_expr(node["left"], z3_vars) >= _compile_z3_expr(node["right"], z3_vars)
    if op == "and":
        return z3.And(*[_compile_z3_expr(c, z3_vars) for c in node["args"]])
    if op == "or":
        return z3.Or(*[_compile_z3_expr(c, z3_vars) for c in node["args"]])
    if op == "not":
        return z3.Not(_compile_z3_expr(node["arg"], z3_vars))
    if op == "implies":
        return z3.Implies(
            _compile_z3_expr(node["antecedent"], z3_vars),
            _compile_z3_expr(node["consequent"], z3_vars),
        )
    raise ValueError(f"Unsupported Z3 operator: {op}")


class Z3ConstraintGate:
    """Safe SMT consistency gate with bounded 50ms timeout and unsat-core extraction."""

    def __init__(self, timeout_ms: int = 50) -> None:
        self.timeout_ms = timeout_ms

    def verify_json(self, constraints_json: str | None) -> Z3GateResult:
        if not constraints_json or not constraints_json.strip():
            return Z3GateResult(status=Z3Status.SKIPPED, engine="none")
        try:
            raw = json.loads(constraints_json)
            spec = Z3ConstraintSpec.model_validate(raw)
        except Exception as exc:
            return Z3GateResult(
                status=Z3Status.UNSAT,
                engine="schema-validator",
                unsat_core=("schema_invalid",),
                error_detail=str(exc),
            )
        return self.verify_spec(spec)

    def verify_spec(self, spec: Z3ConstraintSpec) -> Z3GateResult:
        if not spec.clauses:
            return Z3GateResult(status=Z3Status.SKIPPED, engine="none")

        var_types = {v.name: v.var_type for v in spec.variables}
        try:
            for clause in spec.clauses:
                _validate_ast_node(clause.expr, var_types)
        except ValueError as exc:
            return Z3GateResult(
                status=Z3Status.UNSAT,
                engine="ast-whitelist",
                unsat_core=("ast_validation_failed",),
                error_detail=str(exc),
            )

        if not Z3_AVAILABLE or z3 is None:
            return _BuiltinLinearGate.check(spec)

        solver = z3.Solver()
        solver.set("timeout", self.timeout_ms)
        z3_vars: dict[str, Any] = {}
        for var in spec.variables:
            if var.var_type == "int":
                z3_vars[var.name] = z3.Int(var.name)
            elif var.var_type == "real":
                z3_vars[var.name] = z3.Real(var.name)
            else:
                z3_vars[var.name] = z3.Bool(var.name)

        trackers: dict[str, Any] = {}
        for clause in spec.clauses:
            expr = _compile_z3_expr(clause.expr, z3_vars)
            tracker = z3.Bool(f"__track_{clause.clause_id}")
            trackers[str(tracker)] = clause.clause_id
            solver.assert_and_track(expr, tracker)

        outcome = solver.check()
        if outcome == z3.sat:
            return Z3GateResult(status=Z3Status.SAT, engine="z3")
        if outcome == z3.unsat:
            core = tuple(trackers.get(str(t), str(t)) for t in solver.unsat_core())
            return Z3GateResult(status=Z3Status.UNSAT, engine="z3", unsat_core=core)
        return Z3GateResult(status=Z3Status.UNKNOWN, engine="z3", error_detail="Z3 solver returned unknown/timeout.")
