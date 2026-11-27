"""Declarative AST SMT/Z3 consistency gate (QF_LIA / QF_LRA + Boolean, 50ms timeout).

Never evaluates arbitrary Python strings. Accepts only typed JSON AST nodes
and validates contract/output invariants before LLM inference.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
import math
import operator
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


def _validate_args_op(op: str, args: Any, var_types: dict[str, str], depth: int) -> None:
    if not isinstance(args, list) or not args:
        raise ValueError(f"Operator '{op}' requires non-empty 'args' list.")
    for child in args:
        if not isinstance(child, dict):
            raise ValueError("AST child must be a mapping.")
        _validate_ast_node(child, var_types, depth + 1)


def _validate_pair_op(
    node: dict[str, Any], k1: str, k2: str, label: str, var_types: dict[str, str], depth: int
) -> None:
    first = node.get(k1)
    second = node.get(k2)
    if not isinstance(first, dict) or not isinstance(second, dict):
        raise ValueError(f"{label} requires dict '{k1}' and '{k2}'.")
    _validate_ast_node(first, var_types, depth + 1)
    _validate_ast_node(second, var_types, depth + 1)


def _validate_var_node(node: dict[str, Any], var_types: dict[str, str], _depth: int) -> None:
    name = node.get("name")
    if not isinstance(name, str) or name not in var_types:
        raise ValueError(f"Undeclared variable in AST: {name!r}")


def _validate_const_node(node: dict[str, Any], _var_types: dict[str, str], _depth: int) -> None:
    if not isinstance(node.get("value"), int | float | bool):
        raise ValueError(f"Invalid constant value: {node.get('value')!r}")


def _validate_mul_const_node(node: dict[str, Any], var_types: dict[str, str], depth: int) -> None:
    coef, arg = node.get("coef"), node.get("arg")
    if isinstance(coef, bool) or not isinstance(coef, int | float) or not isinstance(arg, dict):
        raise ValueError("Operator 'mul_const' requires numeric 'coef' and dict 'arg'.")
    _validate_ast_node(arg, var_types, depth + 1)


def _validate_not_node(node: dict[str, Any], var_types: dict[str, str], depth: int) -> None:
    arg = node.get("arg")
    if not isinstance(arg, dict):
        raise ValueError("Operator 'not' requires dict 'arg'.")
    _validate_ast_node(arg, var_types, depth + 1)


_AST_NODE_VALIDATORS: dict[str, Any] = {
    "var": _validate_var_node,
    "const": _validate_const_node,
    "mul_const": _validate_mul_const_node,
    "not": _validate_not_node,
    "add": lambda n, vt, d: _validate_args_op("add", n.get("args"), vt, d),
    "sub": lambda n, vt, d: _validate_args_op("sub", n.get("args"), vt, d),
    "and": lambda n, vt, d: _validate_args_op("and", n.get("args"), vt, d),
    "or": lambda n, vt, d: _validate_args_op("or", n.get("args"), vt, d),
    "implies": lambda n, vt, d: _validate_pair_op(n, "antecedent", "consequent", "Operator 'implies'", vt, d),
}


def _validate_ast_node(node: dict[str, Any], var_types: dict[str, str], depth: int = 0) -> None:
    if depth > 32:
        raise ValueError("AST depth limit exceeded.")
    op = node.get("op")
    if not isinstance(op, str) or op not in _ALLOWED_OPS:
        raise ValueError(f"Unsupported AST operator: {op!r}")

    validator = _AST_NODE_VALIDATORS.get(op)
    if validator is not None:
        validator(node, var_types, depth)
    elif op in _CMP_OPS:
        _validate_pair_op(node, "left", "right", f"Comparison '{op}'", var_types, depth)


@dataclass
class _AffineForm:
    coeffs: dict[str, float] = field(default_factory=dict)
    const: float = 0.0

    def scale(self, factor: float) -> _AffineForm:
        if math.isclose(factor, 0.0, abs_tol=1e-15):
            return _AffineForm()
        scaled = {k: v * factor for k, v in self.coeffs.items() if not math.isclose(v * factor, 0.0, abs_tol=1e-15)}
        return _AffineForm(scaled, self.const * factor)

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


_CnfClause = list[tuple[dict[str, Any], bool]]


def _expand_disjunction_args(args: list[dict[str, Any]], negated: bool) -> list[_CnfClause]:
    disjunctions: list[_CnfClause] = [[]]
    for child in args:
        child_cnf = _to_cnf_atoms(child, negated=negated)
        expanded: list[_CnfClause] = []
        for c_clause in child_cnf:
            for existing in disjunctions:
                expanded.append(existing + c_clause)
        disjunctions = expanded[:64]
    return disjunctions


def _to_cnf_atoms(node: dict[str, Any], negated: bool = False) -> list[_CnfClause]:
    """Convert a boolean AST into a list of disjunctive clauses (DNF-split into conjunction of disjunctions)."""
    op = node["op"]
    if op == "not":
        return _to_cnf_atoms(node["arg"], negated=not negated)
    if op == "implies":
        or_node = {"op": "or", "args": [{"op": "not", "arg": node["antecedent"]}, node["consequent"]]}
        return _to_cnf_atoms(or_node, negated=negated)
    if (op == "and" and not negated) or (op == "or" and negated):
        clauses: list[_CnfClause] = []
        for child in node["args"]:
            clauses.extend(_to_cnf_atoms(child, negated=negated))
        return clauses
    if (op == "or" and not negated) or (op == "and" and negated):
        return _expand_disjunction_args(node["args"], negated)
    return [[(node, negated)]]


def _flip_cmp(op: str) -> str:
    return {"eq": "ne", "ne": "eq", "lt": "ge", "ge": "lt", "le": "gt", "gt": "le"}[op]


_NEG_COEF_CMP = {"eq": "eq", "ne": "ne", "lt": "gt", "le": "ge", "gt": "lt", "ge": "le"}


def _tighten_lower(b: _NumBound, rhs: float, inc: bool, *, allow_same_inc: bool = False) -> None:
    tie = math.isclose(rhs, b.lo, abs_tol=1e-12) and b.lo_inc and (allow_same_inc or not inc)
    if rhs > b.lo or tie:
        b.lo, b.lo_inc = rhs, inc


def _tighten_upper(b: _NumBound, rhs: float, inc: bool, *, allow_same_inc: bool = False) -> None:
    tie = math.isclose(rhs, b.hi, abs_tol=1e-12) and b.hi_inc and (allow_same_inc or not inc)
    if rhs < b.hi or tie:
        b.hi, b.hi_inc = rhs, inc


def _apply_bound_op(b: _NumBound, op: str, rhs: float) -> None:
    if op == "eq":
        _tighten_lower(b, rhs, True, allow_same_inc=True)
        _tighten_upper(b, rhs, True, allow_same_inc=True)
    elif op == "ne":
        b.neq.add(rhs)
    elif op in {"gt", "ge"}:
        _tighten_lower(b, rhs, op == "ge")
    elif op in {"lt", "le"}:
        _tighten_upper(b, rhs, op == "le")


class _BuiltinLinearGate:
    """Pure-Python deterministic fallback for QF_LIA / QF_LRA / Boolean contracts."""

    @classmethod
    def check(cls, spec: Z3ConstraintSpec) -> Z3GateResult:
        var_types = {v.name: v.var_type for v in spec.variables}
        tagged_disjunctions: list[tuple[str, _CnfClause]] = []
        for clause in spec.clauses:
            for disj in _to_cnf_atoms(clause.expr):
                tagged_disjunctions.append((clause.clause_id, disj))

        status, core = cls._solve_disjunctions(tagged_disjunctions, var_types)
        return Z3GateResult(status=status, engine="builtin-qf-lia", unsat_core=tuple(dict.fromkeys(core)))

    @classmethod
    def _search_branching(
        cls,
        unit_atoms: list[tuple[str, dict[str, Any], bool]],
        branching: list[tuple[str, _CnfClause]],
        var_types: dict[str, str],
        idx: int = 0,
        chosen: list[tuple[str, dict[str, Any], bool]] | None = None,
    ) -> tuple[Z3Status, list[str]]:
        current = chosen or []
        if idx == len(branching):
            return cls._check_conjunction(unit_atoms + current, var_types)
        cid, disj = branching[idx]
        saw_unknown = False
        collected_core: list[str] = [cid]
        for atom, neg in disj:
            res, sub_core = cls._search_branching(
                unit_atoms, branching, var_types, idx + 1, [*current, (cid, atom, neg)]
            )
            if res == Z3Status.SAT:
                return Z3Status.SAT, []
            if res == Z3Status.UNKNOWN:
                saw_unknown = True
            else:
                collected_core.extend(sub_core)
        return (Z3Status.UNKNOWN, []) if saw_unknown else (Z3Status.UNSAT, collected_core)

    @classmethod
    def _solve_disjunctions(
        cls,
        disjunctions: list[tuple[str, _CnfClause]],
        var_types: dict[str, str],
    ) -> tuple[Z3Status, list[str]]:
        unit_atoms = [(cid, disj[0][0], disj[0][1]) for cid, disj in disjunctions if len(disj) == 1]
        branching = [(cid, disj) for cid, disj in disjunctions if len(disj) > 1]

        ok, core = cls._check_conjunction(unit_atoms, var_types)
        if ok != Z3Status.SAT:
            return ok, core
        if not branching:
            return Z3Status.SAT, []
        if len(branching) > 12:
            return Z3Status.UNKNOWN, []
        return cls._search_branching(unit_atoms, branching, var_types)

    @staticmethod
    def _assign_bool(bool_assign: dict[str, tuple[bool, str]], vname: str, desired: bool, cid: str) -> list[str] | None:
        if vname in bool_assign and bool_assign[vname][0] != desired:
            return [bool_assign[vname][1], cid]
        bool_assign[vname] = (desired, cid)
        return None

    @classmethod
    def _handle_bool_cmp(
        cls,
        atom: dict[str, Any],
        eff_op: str,
        cid: str,
        var_types: dict[str, str],
        bool_assign: dict[str, tuple[bool, str]],
    ) -> tuple[bool, Z3Status | None, list[str]]:
        left, right = atom["left"], atom["right"]
        is_bool_cmp = (left["op"] == "var" and var_types.get(str(left["name"])) == "bool") or (
            right["op"] == "var" and var_types.get(str(right["name"])) == "bool"
        )
        if not is_bool_cmp:
            return False, None, []
        if eff_op not in {"eq", "ne"}:
            return True, Z3Status.UNKNOWN, []
        if left["op"] == "var" and right["op"] == "const":
            desired = bool(right["value"]) if eff_op == "eq" else not bool(right["value"])
            conflict = cls._assign_bool(bool_assign, str(left["name"]), desired, cid)
            if conflict is not None:
                return True, Z3Status.UNSAT, conflict
        return True, None, []

    @staticmethod
    def _const_cmp_sat(c: float, eff_op: str) -> bool:
        return {
            "eq": abs(c) <= 1e-12,
            "ne": abs(c) > 1e-12,
            "lt": c < -1e-12,
            "le": c <= 1e-12,
            "gt": c > 1e-12,
            "ge": c >= -1e-12,
        }[eff_op]

    @staticmethod
    def _record_hyperplane(
        diff: _AffineForm,
        eff_op: str,
        cid: str,
        hyperplanes: dict[tuple[tuple[str, float], ...], list[tuple[str, float, str, float]]],
    ) -> None:
        key = diff.normalized_direction_key()
        scale = diff.direction_scale()
        first_var = min(diff.coeffs)
        sign = 1.0 if diff.coeffs[first_var] > 0 else -1.0
        canon_key = tuple((k, round(v * sign, 9)) for k, v in key)
        op_s = _NEG_COEF_CMP[eff_op] if sign < 0 else eff_op
        rhs_val = -diff.const / (sign * scale)
        hyperplanes.setdefault(canon_key, []).append((cid, scale, op_s, rhs_val))

    @staticmethod
    def _check_hyperplanes(
        hyperplanes: dict[tuple[tuple[str, float], ...], list[tuple[str, float, str, float]]],
    ) -> list[str] | None:
        for entries in hyperplanes.values():
            hb = _NumBound()
            srcs: list[str] = []
            for cid, _scale, op_s, rhs_val in entries:
                srcs.append(cid)
                _apply_bound_op(hb, op_s, rhs_val)
            if not hb.is_feasible(is_int=False):
                return srcs
        return None

    @classmethod
    def _eval_numeric_cmp_atom(
        cls,
        cid: str,
        atom: dict[str, Any],
        eff_op: str,
        var_types: dict[str, str],
        bounds: dict[str, _NumBound],
        bound_sources: dict[str, list[str]],
        hyperplanes: dict[tuple[tuple[str, float], ...], list[tuple[str, float, str, float]]],
    ) -> tuple[Z3Status, list[str]] | None:
        diff = _eval_affine(atom["left"]).sub(_eval_affine(atom["right"]))
        if not diff.coeffs:
            if not cls._const_cmp_sat(diff.const, eff_op):
                return Z3Status.UNSAT, [cid]
            return None
        if len(diff.coeffs) > 1:
            cls._record_hyperplane(diff, eff_op, cid, hyperplanes)
            return None
        vname, coef = next(iter(diff.coeffs.items()))
        flipped = _NEG_COEF_CMP[eff_op] if coef < 0 else eff_op
        bound_sources[vname].append(cid)
        _apply_bound_op(bounds[vname], flipped, -diff.const / coef)
        if not bounds[vname].is_feasible(var_types[vname] == "int"):
            return Z3Status.UNSAT, bound_sources[vname]
        return None

    @classmethod
    def _eval_conjunction_atom(
        cls,
        cid: str,
        atom: dict[str, Any],
        neg: bool,
        var_types: dict[str, str],
        bool_assign: dict[str, tuple[bool, str]],
        bounds: dict[str, _NumBound],
        bound_sources: dict[str, list[str]],
        hyperplanes: dict[tuple[tuple[str, float], ...], list[tuple[str, float, str, float]]],
    ) -> tuple[Z3Status, list[str]] | None:
        op = atom["op"]
        if op == "const":
            if not (bool(atom["value"]) ^ neg):
                return Z3Status.UNSAT, [cid]
            return None
        if op == "var":
            conflict = cls._assign_bool(bool_assign, str(atom["name"]), not neg, cid)
            if conflict is not None:
                return Z3Status.UNSAT, conflict
            return None
        if op not in _CMP_OPS:
            return None

        eff_op = _flip_cmp(op) if neg else op
        handled, b_status, b_core = cls._handle_bool_cmp(atom, eff_op, cid, var_types, bool_assign)
        if handled:
            if b_status is not None:
                return b_status, b_core
            return None
        return cls._eval_numeric_cmp_atom(cid, atom, eff_op, var_types, bounds, bound_sources, hyperplanes)

    @classmethod
    def _check_conjunction(
        cls,
        atoms: list[tuple[str, dict[str, Any], bool]],
        var_types: dict[str, str],
    ) -> tuple[Z3Status, list[str]]:
        bool_assign: dict[str, tuple[bool, str]] = {}
        bounds: dict[str, _NumBound] = {k: _NumBound() for k, vt in var_types.items() if vt in {"int", "real"}}
        bound_sources: dict[str, list[str]] = {k: [] for k in bounds}
        hyperplanes: dict[tuple[tuple[str, float], ...], list[tuple[str, float, str, float]]] = {}

        for cid, atom, neg in atoms:
            early = cls._eval_conjunction_atom(
                cid, atom, neg, var_types, bool_assign, bounds, bound_sources, hyperplanes
            )
            if early is not None:
                return early

        hp_conflict = cls._check_hyperplanes(hyperplanes)
        if hp_conflict is not None:
            return Z3Status.UNSAT, hp_conflict
        return (Z3Status.UNKNOWN, []) if hyperplanes else (Z3Status.SAT, [])


_Z3_CMP_FNS: dict[str, Any] = {
    "eq": operator.eq,
    "ne": operator.ne,
    "lt": operator.lt,
    "le": operator.le,
    "gt": operator.gt,
    "ge": operator.ge,
}


def _compile_z3_nary(op: str, raw_args: list[dict[str, Any]], z3_vars: dict[str, Any]) -> Any:
    assert z3 is not None
    args = [_compile_z3_expr(c, z3_vars) for c in raw_args]
    if op == "and":
        return z3.And(*args)
    if op == "or":
        return z3.Or(*args)
    fn = operator.add if op == "add" else operator.sub
    acc = args[0]
    for child in args[1:]:
        acc = fn(acc, child)
    return acc


def _compile_z3_expr(node: dict[str, Any], z3_vars: dict[str, Any]) -> Any:
    assert z3 is not None
    op = node["op"]
    if op == "var":
        return z3_vars[str(node["name"])]
    if op == "const":
        val = node["value"]
        return z3.BoolVal(val) if isinstance(val, bool) else val
    if op == "mul_const":
        return node["coef"] * _compile_z3_expr(node["arg"], z3_vars)
    if op == "not":
        return z3.Not(_compile_z3_expr(node["arg"], z3_vars))
    if op == "implies":
        return z3.Implies(
            _compile_z3_expr(node["antecedent"], z3_vars),
            _compile_z3_expr(node["consequent"], z3_vars),
        )
    if op in _Z3_CMP_FNS:
        return _Z3_CMP_FNS[op](_compile_z3_expr(node["left"], z3_vars), _compile_z3_expr(node["right"], z3_vars))
    if op in {"add", "sub", "and", "or"}:
        return _compile_z3_nary(op, node["args"], z3_vars)
    raise ValueError(f"Unsupported Z3 operator: {op}")


class Z3ConstraintGate:
    """Safe SMT consistency gate with bounded 50ms timeout and unsat-core extraction."""

    def __init__(self, timeout_ms: int = 50, *, prefer_z3: bool = True) -> None:
        self.timeout_ms = timeout_ms
        self.prefer_z3 = prefer_z3

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

        if not self.prefer_z3 or not Z3_AVAILABLE or z3 is None:
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
            if isinstance(expr, bool):
                expr = z3.BoolVal(expr)
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
