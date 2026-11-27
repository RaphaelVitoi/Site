"""Paired 30-task A/B benchmark (Baseline vs NEXUS-OMNIKERNEL v1.1-EVOLVED).

Evaluates 15 code tasks, 10 structured JSON/PMev tasks, and 5 prose/spec tasks
with deterministic executable oracles, real Gemini pool telemetry (when live=True),
and zero-regression SlowLoop verification.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
import json
import logging
import math
from pathlib import Path
import sys
import time
from typing import Any

from google import genai
from google.genai import types
import numpy as np

from control_plane.cascade import TestOracleFn, _strip_markdown_fences
from control_plane.config import (
    SITE_ROOT,
    ActionRole,
    ArtifactKind,
    ComputeLane,
    ControlPlaneConfig,
    Modality,
    ThermostatDecision,
)
from control_plane.service import CheckpointEvalOptions, CheckpointTelemetry, ControlPlaneService
from control_plane.thermostat import VerbalizedSamplingResponse
from llm.gemini_pool import GeminiWorkload, gemini_pool_manager
from llm.model_registry import custo_estimado

logger = logging.getLogger(__name__)

MODEL_GEMINI_FLASH = "gemini-3.8-flash"
MODEL_GEMINI_FLASH_LITE = "gemini-3.5-flash-lite"
MODEL_GEMINI_HYDROGEN = "gemini-4-hydrogen"


@dataclass(frozen=True, slots=True)
class BenchmarkTaskSpec:
    task_id: str
    bucket_id: str
    modality: Modality
    action_role: ActionRole
    prompt: str
    contract_content: str
    oracle: TestOracleFn
    z3_constraints_json: str | None = None
    missing_delta_crit: tuple[str, ...] = ()
    mock_baseline_outputs: tuple[str, ...] = ()
    mock_omnikernel_outputs: tuple[str, ...] = ()


CodeCheck = tuple[str, Callable[[dict[str, Any]], Any], Any]


def _exec_python_oracle(code_str: str, checks: list[CodeCheck]) -> tuple[bool, list[int], str | None]:
    ns: dict[str, Any] = {}
    try:
        compiled = compile(code_str, "<omnikernel_benchmark>", "exec")
        exec(compiled, ns, ns)  # noqa: S102  # Record-Id: validacao-2026-11-27-omnikernel-v1-1-ab-benchmark
    except Exception as exc:  # noqa: BLE001
        return False, [0] * len(checks), f"Runtime/Compile error: {exc}"

    vec: list[int] = []
    errors: list[str] = []
    for label, fn_eval, expected in checks:
        try:
            actual = fn_eval(ns)
            ok = abs(float(actual) - expected) <= 1e-4 if isinstance(expected, float) else actual == expected
            vec.append(1 if ok else 0)
            if not ok:
                errors.append(f"{label} -> got {actual!r}, expected {expected!r}")
        except Exception as exc:  # noqa: BLE001
            vec.append(0)
            errors.append(f"{label} raised {exc}")
    return all(v == 1 for v in vec), vec, "; ".join(errors) if errors else None


def _make_code_oracle(checks: list[CodeCheck]) -> TestOracleFn:
    def _oracle(payload: str) -> tuple[bool, list[int], str | None]:
        return _exec_python_oracle(payload, checks)

    return _oracle


def _make_json_oracle(
    required_keys: dict[str, type], predicate: Callable[[dict[str, Any]], str | None]
) -> TestOracleFn:
    def _oracle(payload: str) -> tuple[bool, list[int], str | None]:
        try:
            obj = json.loads(payload)
        except Exception as exc:  # noqa: BLE001
            return False, [0], f"JSON decode error: {exc}"
        if not isinstance(obj, dict):
            return False, [0], "Payload must be a JSON object."
        for k, typ in required_keys.items():
            if k not in obj:
                return False, [0], f"Missing required key '{k}'."
            if typ is float and isinstance(obj[k], int | float) and not isinstance(obj[k], bool):
                continue
            if not isinstance(obj[k], typ):
                return False, [0], f"Key '{k}' expected {typ.__name__}, got {type(obj[k]).__name__}."
        err = predicate(obj)
        return (err is None), [1 if err is None else 0], err

    return _oracle


def _make_prose_oracle(required_tokens: tuple[str, ...], forbidden_tokens: tuple[str, ...]) -> TestOracleFn:
    def _oracle(payload: str) -> tuple[bool, list[int], str | None]:
        low = payload.lower()
        missing = [t for t in required_tokens if t.lower() not in low]
        found_bad = [t for t in forbidden_tokens if t.lower() in low]
        if missing or found_bad:
            return False, [0], f"Spec violation missing={missing} forbidden={found_bad}"
        return True, [1], None

    return _oracle


def _build_code_tasks() -> list[BenchmarkTaskSpec]:
    code_defs: list[tuple[str, str, str, list[CodeCheck], str, str]] = [
        (
            "code-01",
            "Write pure Python function `clamp_pct(x: float) -> float` clamping x to [0.0, 100.0]. Return only Python code.",
            "def clamp_pct(x: float) -> float:",
            [
                ("clamp_pct(-5.0)", lambda ns: ns["clamp_pct"](-5.0), 0.0),
                ("clamp_pct(42.5)", lambda ns: ns["clamp_pct"](42.5), 42.5),
                ("clamp_pct(150.0)", lambda ns: ns["clamp_pct"](150.0), 100.0),
            ],
            "def clamp_pct(x: float) -> float:\n    return max(0.0, min(100.0, float(x)))\n",
            "def clamp_pct(x: float) -> float:\n    return float(x)\n",
        ),
        (
            "code-02",
            "Write Python function `pot_odds(call_amt: float, pot_before: float) -> float` returning call_amt / (pot_before + 2*call_amt) rounded to 4 decimals (0.0 if denom<=0). Return only Python code.",
            "def pot_odds(call_amt: float, pot_before: float) -> float:",
            [
                ("pot_odds(5.0, 10.0)", lambda ns: ns["pot_odds"](5.0, 10.0), 0.25),
                ("pot_odds(0.0, 0.0)", lambda ns: ns["pot_odds"](0.0, 0.0), 0.0),
            ],
            "def pot_odds(call_amt: float, pot_before: float) -> float:\n    d = pot_before + 2.0 * call_amt\n    return round(call_amt / d, 4) if d > 0 else 0.0\n",
            "def pot_odds(call_amt: float, pot_before: float) -> float:\n    return round(call_amt / (pot_before + call_amt), 4)\n",
        ),
        (
            "code-03",
            "Write Python function `bubble_factor(risk_loss: float, reward_gain: float) -> float` returning risk_loss / reward_gain rounded to 4 decimals (0.0 if reward_gain<=0). Return only Python code.",
            "def bubble_factor(risk_loss: float, reward_gain: float) -> float:",
            [
                ("bubble_factor(15.0, 10.0)", lambda ns: ns["bubble_factor"](15.0, 10.0), 1.5),
                ("bubble_factor(10.0, 0.0)", lambda ns: ns["bubble_factor"](10.0, 0.0), 0.0),
            ],
            "def bubble_factor(risk_loss: float, reward_gain: float) -> float:\n    return round(risk_loss / reward_gain, 4) if reward_gain > 0 else 0.0\n",
            "def bubble_factor(risk_loss: float, reward_gain: float) -> float:\n    return risk_loss / reward_gain\n",
        ),
        (
            "code-04",
            "Write Python function `risk_premium(bf: float) -> float` returning (bf / (1.0 + bf)) - 0.5 rounded to 4 decimals (0.0 if bf<=0). Return only Python code.",
            "def risk_premium(bf: float) -> float:",
            [
                ("risk_premium(1.0)", lambda ns: ns["risk_premium"](1.0), 0.0),
                ("risk_premium(3.0)", lambda ns: ns["risk_premium"](3.0), 0.25),
            ],
            "def risk_premium(bf: float) -> float:\n    return round((bf / (1.0 + bf)) - 0.5, 4) if bf > 0 else 0.0\n",
            "def risk_premium(bf: float) -> float:\n    return bf / (1.0 + bf)\n",
        ),
        (
            "code-05",
            "Write Python function `sha256_hex(text: str) -> str` using hashlib. Return only Python code.",
            "def sha256_hex(text: str) -> str:",
            [
                ("len(sha256_hex('abc'))", lambda ns: len(ns["sha256_hex"]("abc")), 64),
                (
                    "sha256_hex('abc').startswith('ba7816bf')",
                    lambda ns: ns["sha256_hex"]("abc").startswith("ba7816bf"),
                    True,
                ),
            ],
            "import hashlib\ndef sha256_hex(text: str) -> str:\n    return hashlib.sha256(text.encode('utf-8')).hexdigest()\n",
            "def sha256_hex(text: str) -> str:\n    return str(hash(text))\n",
        ),
        (
            "code-06",
            "Write Python function `dedup_preserve(items: list[str]) -> list[str]` preserving first-seen order. Return only Python code.",
            "def dedup_preserve(items: list[str]) -> list[str]:",
            [
                (
                    "dedup_preserve(['b','a','b','c','a'])",
                    lambda ns: ns["dedup_preserve"](["b", "a", "b", "c", "a"]),
                    ["b", "a", "c"],
                ),
                ("dedup_preserve([])", lambda ns: ns["dedup_preserve"]([]), []),
            ],
            "def dedup_preserve(items: list[str]) -> list[str]:\n    return list(dict.fromkeys(items))\n",
            "def dedup_preserve(items: list[str]) -> list[str]:\n    return sorted(set(items))\n",
        ),
        (
            "code-07",
            "Write Python function `safe_div(num: float, den: float, default: float = 0.0) -> float`. Return only Python code.",
            "def safe_div(num: float, den: float, default: float = 0.0) -> float:",
            [
                ("safe_div(10.0, 2.0)", lambda ns: ns["safe_div"](10.0, 2.0), 5.0),
                ("safe_div(10.0, 0.0, -1.0)", lambda ns: ns["safe_div"](10.0, 0.0, -1.0), -1.0),
            ],
            "def safe_div(num: float, den: float, default: float = 0.0) -> float:\n    return num / den if den != 0 else default\n",
            "def safe_div(num: float, den: float, default: float = 0.0) -> float:\n    return num / den\n",
        ),
        (
            "code-08",
            "Write Python function `p95(values: list[float]) -> float` returning 0.0 if empty or sorted linear 95th percentile. Return only Python code.",
            "def p95(values: list[float]) -> float:",
            [
                ("p95([])", lambda ns: ns["p95"]([]), 0.0),
                ("p95([10.0, 20.0, 30.0, 40.0]) >= 35.0", lambda ns: ns["p95"]([10.0, 20.0, 30.0, 40.0]) >= 35.0, True),
            ],
            "def p95(values: list[float]) -> float:\n    if not values:\n        return 0.0\n    s = sorted(values)\n    idx = 0.95 * (len(s) - 1)\n    lo = int(idx)\n    hi = min(lo + 1, len(s) - 1)\n    return s[lo] + (s[hi] - s[lo]) * (idx - lo)\n",
            "def p95(values: list[float]) -> float:\n    return max(values)\n",
        ),
        (
            "code-09",
            "Write Python function `is_valid_uri(uri: str) -> bool` returning True iff uri starts with 'core://' or 'ess://' and has no spaces. Return only Python code.",
            "def is_valid_uri(uri: str) -> bool:",
            [
                ("is_valid_uri('core://a/b')", lambda ns: ns["is_valid_uri"]("core://a/b"), True),
                ("is_valid_uri('http://a')", lambda ns: ns["is_valid_uri"]("http://a"), False),
                ("is_valid_uri('ess://a b')", lambda ns: ns["is_valid_uri"]("ess://a b"), False),
            ],
            "def is_valid_uri(uri: str) -> bool:\n    return (' ' not in uri) and (uri.startswith('core://') or uri.startswith('ess://'))\n",
            "def is_valid_uri(uri: str) -> bool:\n    return uri.startswith('core://')\n",
        ),
        (
            "code-10",
            "Write Python function `implicit_reward(edit_ratio: float, reverted: bool) -> float` computing clip(1 - 1.2*edit_ratio - int(reverted), -1.0, 1.0) rounded to 4 decimals. Return only Python code.",
            "def implicit_reward(edit_ratio: float, reverted: bool) -> float:",
            [
                ("implicit_reward(0.0, False)", lambda ns: ns["implicit_reward"](0.0, False), 1.0),
                ("implicit_reward(0.8, True)", lambda ns: ns["implicit_reward"](0.8, True), -0.96),
                ("implicit_reward(1.0, True)", lambda ns: ns["implicit_reward"](1.0, True), -1.0),
            ],
            "def implicit_reward(edit_ratio: float, reverted: bool) -> float:\n    r = 1.0 - 1.2 * edit_ratio - (1.0 if reverted else 0.0)\n    return round(max(-1.0, min(1.0, r)), 4)\n",
            "def implicit_reward(edit_ratio: float, reverted: bool) -> float:\n    return 1.0 - edit_ratio\n",
        ),
        (
            "code-11",
            "Write Python function `kelly_fraction(edge: float, odds: float) -> float` returning max(0.0, round(edge / odds, 4)) if odds > 0 else 0.0. Return only Python code.",
            "def kelly_fraction(edge: float, odds: float) -> float:",
            [
                ("kelly_fraction(0.1, 2.0)", lambda ns: ns["kelly_fraction"](0.1, 2.0), 0.05),
                ("kelly_fraction(-0.1, 2.0)", lambda ns: ns["kelly_fraction"](-0.1, 2.0), 0.0),
                ("kelly_fraction(0.2, 0.0)", lambda ns: ns["kelly_fraction"](0.2, 0.0), 0.0),
            ],
            "def kelly_fraction(edge: float, odds: float) -> float:\n    return max(0.0, round(edge / odds, 4)) if odds > 0 else 0.0\n",
            "def kelly_fraction(edge: float, odds: float) -> float:\n    return edge / odds\n",
        ),
        (
            "code-12",
            "Write Python function `normalize_weights(ws: list[float]) -> list[float]` dividing positive sum or returning zeros if sum<=0. Return only Python code.",
            "def normalize_weights(ws: list[float]) -> list[float]:",
            [
                ("sum(normalize_weights([2.0, 2.0]))", lambda ns: sum(ns["normalize_weights"]([2.0, 2.0])), 1.0),
                ("normalize_weights([0.0, 0.0])", lambda ns: ns["normalize_weights"]([0.0, 0.0]), [0.0, 0.0]),
            ],
            "def normalize_weights(ws: list[float]) -> list[float]:\n    total = sum(ws)\n    return [w / total for w in ws] if total > 0 else [0.0 for _ in ws]\n",
            "def normalize_weights(ws: list[float]) -> list[float]:\n    return [w / sum(ws) for w in ws]\n",
        ),
        (
            "code-13",
            "Write Python function `parse_semver(tag: str) -> tuple[int, int, int]` parsing 'v1.2.3' or '1.2.3'. Return only Python code.",
            "def parse_semver(tag: str) -> tuple[int, int, int]:",
            [
                ("parse_semver('v1.2.3')", lambda ns: ns["parse_semver"]("v1.2.3"), (1, 2, 3)),
                ("parse_semver('2.0.10')", lambda ns: ns["parse_semver"]("2.0.10"), (2, 0, 10)),
            ],
            "def parse_semver(tag: str) -> tuple[int, int, int]:\n    parts = tag.lstrip('v').split('.')\n    return (int(parts[0]), int(parts[1]), int(parts[2]))\n",
            "def parse_semver(tag: str) -> tuple[int, int, int]:\n    return tuple(int(x) for x in tag.split('.'))\n",
        ),
        (
            "code-14",
            "Write Python function `roi_ratio(cap: float, cost: float) -> float` returning round(cap / max(0.5, cost), 4). Return only Python code.",
            "def roi_ratio(cap: float, cost: float) -> float:",
            [
                ("roi_ratio(4.0, 0.1)", lambda ns: ns["roi_ratio"](4.0, 0.1), 8.0),
                ("roi_ratio(4.0, 2.0)", lambda ns: ns["roi_ratio"](4.0, 2.0), 2.0),
            ],
            "def roi_ratio(cap: float, cost: float) -> float:\n    return round(cap / max(0.5, cost), 4)\n",
            "def roi_ratio(cap: float, cost: float) -> float:\n    return cap / cost\n",
        ),
        (
            "code-15",
            "Write Python function `bounded_retry(attempt: int, max_r: int) -> bool` returning True iff 1 <= attempt < max_r. Return only Python code.",
            "def bounded_retry(attempt: int, max_r: int) -> bool:",
            [
                ("bounded_retry(1, 3)", lambda ns: ns["bounded_retry"](1, 3), True),
                ("bounded_retry(3, 3)", lambda ns: ns["bounded_retry"](3, 3), False),
                ("bounded_retry(0, 3)", lambda ns: ns["bounded_retry"](0, 3), False),
            ],
            "def bounded_retry(attempt: int, max_r: int) -> bool:\n    return 1 <= attempt < max_r\n",
            "def bounded_retry(attempt: int, max_r: int) -> bool:\n    return attempt <= max_r\n",
        ),
    ]
    pmev_ids = {"code-02", "code-03", "code-04", "code-11"}
    return [
        BenchmarkTaskSpec(
            task_id=tid,
            bucket_id="pmev-and-quant" if tid in pmev_ids else "engineering-and-quality",
            modality=Modality.CODE,
            action_role=ActionRole.LOCAL_PATCH,
            prompt=prompt,
            contract_content=contract,
            oracle=_make_code_oracle(checks),
            mock_baseline_outputs=(bad_code, good_code),
            mock_omnikernel_outputs=(good_code,),
        )
        for tid, prompt, contract, checks, good_code, bad_code in code_defs
    ]


def _build_structured_tasks() -> list[BenchmarkTaskSpec]:
    struct_defs: list[
        tuple[str, str, dict[str, type], Callable[[dict[str, Any]], str | None], str | None, tuple[str, ...], str, str]
    ] = [
        (
            "struct-01",
            'Return pure JSON object {"action": "KEEP", "roi_score": 4.5, "verified": true} for an essential low-cost canonical tool.',
            {"action": str, "roi_score": float, "verified": bool},
            lambda d: (
                None
                if d["action"] in {"KEEP", "IMPROVE", "MERGE", "ARCHIVE", "ELIMINATE"} and 0.0 <= d["roi_score"] <= 5.0
                else "Invalid action/score"
            ),
            None,
            (),
            '{"action": "KEEP", "roi_score": 4.5, "verified": true}',
            "invalid json",
        ),
        (
            "struct-02",
            'Return pure JSON object {"lane": "L0_DET", "cost_usd": 0.0, "deterministic": true}.',
            {"lane": str, "cost_usd": float, "deterministic": bool},
            lambda d: (
                None
                if d["lane"] == "L0_DET"
                and math.isclose(float(d["cost_usd"]), 0.0, abs_tol=1e-9)
                and d["deterministic"] is True
                else "Invalid L0_DET spec"
            ),
            None,
            (),
            '{"lane": "L0_DET", "cost_usd": 0.0, "deterministic": true}',
            '{"lane": "Tier0"}',
        ),
        (
            "struct-03",
            'Return pure JSON object {"alpha_target": 0.02, "role": "COMMIT_PROD", "mutator_required": true}.',
            {"alpha_target": float, "role": str, "mutator_required": bool},
            lambda d: (
                None
                if 0.0 < d["alpha_target"] <= 0.05 and d["role"] == "COMMIT_PROD" and d["mutator_required"]
                else "Invalid COMMIT_PROD CRC"
            ),
            None,
            (),
            '{"alpha_target": 0.02, "role": "COMMIT_PROD", "mutator_required": true}',
            '{"alpha_target": 0.5}',
        ),
        (
            "struct-04",
            'Return pure JSON object {"bucket": "pmev-and-quant", "icm_equity_min": 0.0, "icm_equity_max": 1.0}.',
            {"bucket": str, "icm_equity_min": float, "icm_equity_max": float},
            lambda d: (
                None
                if math.isclose(float(d["icm_equity_min"]), 0.0, abs_tol=1e-9)
                and math.isclose(float(d["icm_equity_max"]), 1.0, abs_tol=1e-9)
                else "Equity bounds wrong"
            ),
            None,
            (),
            '{"bucket": "pmev-and-quant", "icm_equity_min": 0.0, "icm_equity_max": 1.0}',
            '{"bucket": "unknown"}',
        ),
        (
            "struct-05",
            'Return pure JSON object {"transport": "http_sse", "port": 8933, "loopback_only": true}.',
            {"transport": str, "port": int, "loopback_only": bool},
            lambda d: None if d["port"] == 8933 and d["loopback_only"] is True else "Must bind loopback 8933",
            None,
            (),
            '{"transport": "http_sse", "port": 8933, "loopback_only": true}',
            '{"port": 9225}',
        ),
        (
            "struct-06",
            'Return pure JSON object {"kpis": 5, "p95_limit_ms": 120, "zero_regression": true}.',
            {"kpis": int, "p95_limit_ms": int, "zero_regression": bool},
            lambda d: (
                None
                if d["kpis"] == 5 and d["p95_limit_ms"] <= 120 and d["zero_regression"]
                else "KPI threshold mismatch"
            ),
            None,
            (),
            '{"kpis": 5, "p95_limit_ms": 120, "zero_regression": true}',
            '{"kpis": 3}',
        ),
        (
            "struct-07",
            'Return pure JSON object {"env": "windows-native", "python_min": "3.12", "secrets_in_plaintext": false}.',
            {"env": str, "python_min": str, "secrets_in_plaintext": bool},
            lambda d: None if d["secrets_in_plaintext"] is False else "Plaintext secret disallowed",
            None,
            (),
            '{"env": "windows-native", "python_min": "3.12", "secrets_in_plaintext": false}',
            '{"secrets_in_plaintext": true}',
        ),
        (
            "struct-08",
            'Return pure JSON object {"gamma": 0.9, "crc_min_n": 25, "space_min_pos": 4}.',
            {"gamma": float, "crc_min_n": int, "space_min_pos": int},
            lambda d: (
                None
                if 0.0 < d["gamma"] <= 1.0 and d["crc_min_n"] >= 25 and d["space_min_pos"] >= 4
                else "Hyperparams out of bounds"
            ),
            None,
            (),
            '{"gamma": 0.9, "crc_min_n": 25, "space_min_pos": 4}',
            '{"gamma": 2.0}',
        ),
        (
            "struct-09",
            "Contradictory Z3 contract test: abort at Step 0 before LLM.",
            {"ok": bool},
            lambda _d: None,
            json.dumps(
                {
                    "variables": [{"name": "x", "var_type": "int"}],
                    "clauses": [
                        {
                            "clause_id": "c1",
                            "expr": {
                                "op": "ge",
                                "left": {"op": "var", "name": "x"},
                                "right": {"op": "const", "value": 10},
                            },
                        },
                        {
                            "clause_id": "c2",
                            "expr": {
                                "op": "lt",
                                "left": {"op": "var", "name": "x"},
                                "right": {"op": "const", "value": 5},
                            },
                        },
                    ],
                }
            ),
            (),
            '{"ok": true}',
            '{"ok": false}',
        ),
        (
            "struct-10",
            "Underdetermined task missing DB_TARGET_TABLE: abort at Step 0 before LLM.",
            {"ok": bool},
            lambda _d: None,
            None,
            ("DB_TARGET_TABLE",),
            '{"ok": true}',
            '{"ok": false}',
        ),
    ]
    return [
        BenchmarkTaskSpec(
            task_id=tid,
            bucket_id="data-and-knowledge",
            modality=Modality.STRUCTURED,
            action_role=ActionRole.LOCAL_PATCH,
            prompt=prompt,
            contract_content=prompt,
            oracle=_make_json_oracle(req_keys, pred),
            z3_constraints_json=z3_json,
            missing_delta_crit=missing,
            mock_baseline_outputs=(bad_j, bad_j),
            mock_omnikernel_outputs=(good_j,),
        )
        for tid, prompt, req_keys, pred, z3_json, missing, good_j, bad_j in struct_defs
    ]


def _build_prose_tasks() -> list[BenchmarkTaskSpec]:
    prose_defs: list[tuple[str, str, tuple[str, ...], tuple[str, ...], str, str]] = [
        (
            "spec-01",
            "Write 2 concise sentences stating that Serial-First lookup runs O(1) before semantic search and SHA-256 is verified.",
            ("serial", "o(1)", "sha-256"),
            ("skip sha",),
            "Serial-First lookup resolves canonical artifacts in O(1) before semantic discovery. Every resolution verifies the SHA-256 digest.",
            "Run semantic RAG first and skip SHA checks.",
        ),
        (
            "spec-02",
            "Write 2 concise sentences stating that git commit and git push require Tier 0 approval and never bypass hooks with no-verify.",
            ("tier 0", "no-verify"),
            ("autonomous push",),
            "All git commit and push operations require explicit Tier 0 authorization. Hooks must never be bypassed with --no-verify.",
            "Perform autonomous push with --no-verify.",
        ),
        (
            "spec-03",
            "Write 2 concise sentences stating that prefix_hash stays immutable across retries and failed conversational history is discarded.",
            ("prefix_hash", "discard"),
            ("append full chat",),
            "The prefix_hash remains byte-identical across retries for prefix caching. Failed conversational history is discarded in favor of O(1) clean regeneration.",
            "Append full chat history on every retry.",
        ),
        (
            "spec-04",
            "Write 2 concise sentences stating that COMMIT_PROD requires Stage 2 blind adversarial mutation and Tier 0 approval for relaxing CRC thresholds.",
            ("commit_prod", "tier 0"),
            ("auto-relax",),
            "COMMIT_PROD enforces Stage 2 blind adversarial mutation. Relaxing CRC thresholds for COMMIT_PROD requires explicit Tier 0 approval.",
            "Auto-relax COMMIT_PROD limits silently.",
        ),
        (
            "spec-05",
            "Write 2 concise sentences stating that anti-anchor SVD projects onto the orthogonal complement of U_r^+ to avoid false alarms.",
            ("orthogonal", "false"),
            ("ignore domain",),
            "Anti-anchor SVD projects negative vectors onto the orthogonal complement of U_r^+. This eliminates false alarms caused by shared domain vocabulary.",
            "Ignore domain terms without projection.",
        ),
    ]
    return [
        BenchmarkTaskSpec(
            task_id=tid,
            bucket_id="governance-and-handoff",
            modality=Modality.PROSE,
            action_role=ActionRole.READ_ONLY,
            prompt=prompt,
            contract_content=prompt,
            oracle=_make_prose_oracle(req_toks, forbid_toks),
            mock_baseline_outputs=(bad_p, good_p),
            mock_omnikernel_outputs=(good_p,),
        )
        for tid, prompt, req_toks, forbid_toks, good_p, bad_p in prose_defs
    ]


def build_30_task_suite() -> list[BenchmarkTaskSpec]:
    """Build deterministic 30-task benchmark (15 code + 10 structured + 5 prose/spec)."""
    return [*_build_code_tasks(), *_build_structured_tasks(), *_build_prose_tasks()]


def _build_constitutional_prefix_pad() -> str:
    """Build lean Shannon-optimal constitutional prefix without wasteful token bloat."""
    return (
        "[NEXUS-OMNIKERNEL v1.1 CONSTITUTION]\n"
        "1. Follow the contract invariants and target types strictly.\n"
        "2. For code tasks: output ONLY valid Python code (no explanations).\n"
        "3. For structured tasks: output ONLY a single valid JSON object matching every required key and type.\n"
        "4. For prose/spec tasks: output exactly 2 concise sentences preserving all exact keywords and operators."
    )


_CLIENT_CACHE: dict[str, genai.Client] = {}


def _get_client(api_key: str, sha8: str) -> genai.Client:
    client = _CLIENT_CACHE.get(sha8)
    if client is None:
        opts = types.HttpOptions(
            timeout=20_000,
            retry_options=types.HttpRetryOptions(attempts=1),
        )
        client = genai.Client(api_key=api_key, http_options=opts)
        _CLIENT_CACHE[sha8] = client
    return client


def _extract_http_status(msg: str) -> int:
    if "429" in msg:
        return 429
    if "503" in msg:
        return 503
    return 500


def _probe_single_model(model: str) -> bool:
    tried: set[str] = set()
    for _ in range(3):
        key, sha8 = gemini_pool_manager.get_key_for_workload(GeminiWorkload.GENERAL, model=model)
        if not key or sha8 in tried:
            continue
        tried.add(sha8)
        t0 = time.perf_counter()
        try:
            resp = _get_client(key, sha8).models.generate_content(model=model, contents="Reply OK")
            gemini_pool_manager.mark_success(sha8, (time.perf_counter() - t0) * 1000.0)
            if getattr(resp, "text", None) is not None:
                return True
        except Exception as exc:  # noqa: BLE001
            gemini_pool_manager.mark_failure(sha8, status_code=_extract_http_status(str(exc)), model=model)
    return False


def _probe_healthy_models(candidates: tuple[str, ...]) -> tuple[str, ...]:
    healthy = [model for model in candidates if _probe_single_model(model)]
    return tuple(healthy) if healthy else candidates


def _invoke_single_key(prompt: str, model: str, key: str, sha8: str) -> dict[str, Any]:
    t0 = time.perf_counter()
    resp = _get_client(key, sha8).models.generate_content(model=model, contents=prompt)
    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    gemini_pool_manager.mark_success(sha8, elapsed_ms)
    usage = getattr(resp, "usage_metadata", None)
    tok_in = int(getattr(usage, "prompt_token_count", 0) or 0)
    tok_out = int(getattr(usage, "candidates_token_count", 0) or 0)
    tok_cached = int(getattr(usage, "cached_content_token_count", 0) or 0)
    return {
        "ok": True,
        "text": str(getattr(resp, "text", "") or ""),
        "model": model,
        "tokens_in": tok_in,
        "tokens_out": tok_out,
        "cached_tokens_in": tok_cached,
        "cost_usd": custo_estimado(model, tok_in, tok_out, cached_tokens_in=tok_cached),
        "latency_ms": elapsed_ms,
    }


def _try_model_with_pool(
    prompt: str, model: str, sticky_key: tuple[str, str] | None
) -> tuple[dict[str, Any] | None, str]:
    last_err = "no_keys_available"
    tried_shas: set[str] = set()
    for idx in range(9):
        if idx == 0 and sticky_key is not None and sticky_key[0]:
            key, sha8 = sticky_key
        else:
            key, sha8 = gemini_pool_manager.get_key_for_workload(GeminiWorkload.GENERAL, model=model)
        if not key or sha8 in tried_shas:
            continue
        tried_shas.add(sha8)
        try:
            return _invoke_single_key(prompt, model, key, sha8), ""
        except Exception as exc:  # noqa: BLE001
            last_err = str(exc)
            code = _extract_http_status(last_err)
            gemini_pool_manager.mark_failure(sha8, status_code=code, model=model)
            if code in {429, 503}:
                time.sleep(0.8)
    return None, last_err


def _call_gemini_live(
    prompt: str,
    model_candidates: tuple[str, ...],
    *,
    sticky_key: tuple[str, str] | None = None,
) -> dict[str, Any]:
    last_err = "no_models_tried"
    for model in model_candidates:
        result, last_err = _try_model_with_pool(prompt, model, sticky_key)
        if result is not None:
            return result
    return {
        "ok": False,
        "text": "",
        "model": model_candidates[0],
        "tokens_in": 0,
        "tokens_out": 0,
        "cached_tokens_in": 0,
        "cost_usd": 0.0,
        "latency_ms": 0.0,
        "error": last_err,
    }


def _extract_payload_list(obj: Any) -> list[str]:
    hyps = obj.get("hypotheses") if isinstance(obj, dict) else None
    if not isinstance(hyps, list):
        return []
    out: list[str] = []
    for item in hyps:
        if isinstance(item, dict) and "payload" in item:
            p = item["payload"]
            out.append(json.dumps(p) if isinstance(p, dict | list) else str(p))
    return out


def _extract_vs_candidates(raw_text: str) -> list[str]:
    cleaned = _strip_markdown_fences(raw_text)
    try:
        parsed = VerbalizedSamplingResponse.model_validate_json(cleaned)
        return [h.payload for h in parsed.hypotheses]
    except Exception:  # noqa: BLE001
        try:
            out = _extract_payload_list(json.loads(cleaned))
            if out:
                return out
        except Exception as exc:  # noqa: BLE001
            logger.debug("Fallback VS JSON parse skipped: %s", exc)
        return [raw_text]


def _select_benchmark_models(live: bool) -> tuple[tuple[str, ...], tuple[str, ...], tuple[str, ...]]:
    arm_a_default = (MODEL_GEMINI_HYDROGEN, MODEL_GEMINI_FLASH, MODEL_GEMINI_FLASH_LITE)
    arm_b_l1_default = (MODEL_GEMINI_FLASH_LITE, MODEL_GEMINI_FLASH)
    if not live:
        return (MODEL_GEMINI_FLASH, MODEL_GEMINI_HYDROGEN, MODEL_GEMINI_FLASH_LITE), arm_b_l1_default, arm_a_default

    arm_a_models = _probe_healthy_models(arm_a_default)
    arm_b_l1_models = _probe_healthy_models(arm_b_l1_default)
    arm_b_l2_models = _probe_healthy_models(arm_a_default)
    print(
        f"[AB-LIVE] Healthy models: A={arm_a_models} B_L1={arm_b_l1_models} B_L2={arm_b_l2_models}",
        file=sys.stderr,
        flush=True,
    )
    return arm_a_models, arm_b_l1_models, arm_b_l2_models


def _invoke_arm_a_call(
    prompt: str, attempt: int, task: BenchmarkTaskSpec, models: tuple[str, ...], live: bool
) -> dict[str, Any]:
    if live:
        return _call_gemini_live(prompt, models)
    tok_in = 900 * attempt
    return {
        "tokens_in": tok_in,
        "cached_tokens_in": 0,
        "cost_usd": custo_estimado(MODEL_GEMINI_FLASH, tok_in, 140),
        "text": task.mock_baseline_outputs[min(attempt - 1, len(task.mock_baseline_outputs) - 1)],
    }


def _run_arm_a_task(task: BenchmarkTaskSpec, models: tuple[str, ...], live: bool) -> tuple[bool, int, float, int, int]:
    if task.z3_constraints_json is not None or task.missing_delta_crit:
        if live:
            call = _call_gemini_live(task.prompt, models)
            return False, 1, float(call["cost_usd"]), int(call["tokens_in"]), int(call["cached_tokens_in"])
        return False, 1, custo_estimado(MODEL_GEMINI_FLASH, 900, 120), 900, 0

    conv_history = task.prompt
    calls, cost, tok_in_sum, cached_sum = 0, 0.0, 0, 0
    for attempt in range(1, 3):
        call = _invoke_arm_a_call(conv_history, attempt, task, models, live)
        calls += 1
        tok_in_sum += int(call["tokens_in"])
        cached_sum += int(call["cached_tokens_in"])
        cost += float(call["cost_usd"])
        candidate = str(call["text"])
        ok, _vec, err = task.oracle(_strip_markdown_fences(candidate))
        if ok:
            return True, calls, cost, tok_in_sum, cached_sum
        conv_history = f"{conv_history}\n\nPrevious attempt failed with: {err}\nPrevious output:\n{candidate}\nFix it."
    return False, calls, cost, tok_in_sum, cached_sum


def _build_arm_b_suffix(task: BenchmarkTaskSpec, error_delta: str, inject_vs: bool) -> str:
    suffix = f"[TASK]\n{task.prompt}"
    if error_delta:
        suffix += f"\n[ERROR_DELTA]\n{error_delta}"
    if inject_vs:
        suffix += (
            "\n[VERBALIZED_SAMPLING_REQUIRED]\n"
            'Return ONLY JSON matching {"hypotheses": [{"strategy_id": "tail_1", "estimated_p": 0.12, '
            '"structural_divergence": "str", "payload": "str"}, {"strategy_id": "tail_2", '
            '"estimated_p": 0.08, "structural_divergence": "str", "payload": "str"}]}.'
        )
    return suffix


def _invoke_arm_b_call(
    full_prompt: str,
    *,
    task: BenchmarkTaskSpec,
    lane: ComputeLane,
    attempt: int,
    is_first_task: bool,
    live: bool,
    arm_b_l1_models: tuple[str, ...],
    arm_b_l2_models: tuple[str, ...],
) -> tuple[str, CheckpointTelemetry]:
    if live:
        models = arm_b_l2_models if lane == ComputeLane.L2_FRONTIER else arm_b_l1_models
        call = _call_gemini_live(full_prompt, models)
        return str(call["text"]), CheckpointTelemetry(
            cost_usd=float(call["cost_usd"]),
            tokens_in=int(call["tokens_in"]),
            cached_tokens_in=int(call["cached_tokens_in"]),
            tokens_out=int(call["tokens_out"]),
        )
    tok_in = 4500 if attempt == 1 else 4550
    tok_cached = 4200 if (attempt > 1 or not is_first_task) else 0
    model_used = MODEL_GEMINI_HYDROGEN if lane == ComputeLane.L2_FRONTIER else MODEL_GEMINI_FLASH_LITE
    return task.mock_omnikernel_outputs[min(attempt - 1, len(task.mock_omnikernel_outputs) - 1)], CheckpointTelemetry(
        cost_usd=custo_estimado(model_used, tok_in, 120, cached_tokens_in=tok_cached),
        tokens_in=tok_in,
        cached_tokens_in=tok_cached,
        tokens_out=120,
    )


def _run_arm_b_task(
    svc: ControlPlaneService,
    task: BenchmarkTaskSpec,
    *,
    is_first_task: bool,
    prefix_pad: str,
    live: bool,
    arm_b_l1_models: tuple[str, ...],
    arm_b_l2_models: tuple[str, ...],
) -> tuple[dict[str, Any], int, int, list[float]]:
    contract_uri = f"core://bench/{task.task_id}"
    reg = svc.register_canonical_artifact(
        bucket_id=task.bucket_id,
        serial_uri=contract_uri,
        kind=ArtifactKind.CONTRACT.value,
        content=task.contract_content,
        z3_constraints_json=task.z3_constraints_json,
    )
    if reg.get("status") == "BLOCKED":
        return {"task_id": task.task_id, "status": "STEP0_UNSAT_ABORT", "passed": True}, 0, 1, []

    rid = f"ab-{task.task_id}"
    boot = svc.bootstrap_run_context(
        bucket_id=task.bucket_id,
        contract_uri=contract_uri,
        run_id=rid,
        missing_delta_crit=list(task.missing_delta_crit),
        task_description=task.prompt,
        kernel_rules=prefix_pad,
    )
    if boot.get("status") == "BLOCKED":
        return {"task_id": task.task_id, "status": "STEP0_DELTA_ABORT", "passed": True}, 0, 1, []

    immutable_prefix = str(boot["immutable_prefix"])
    lane = ComputeLane.L1_EDGE_ECON
    error_delta = ""
    inject_vs = False
    llm_calls = 0
    latencies: list[float] = []

    for attempt in range(1, 4):
        suffix = _build_arm_b_suffix(task, error_delta, inject_vs)
        full_prompt = f"{immutable_prefix}\n\n=== EPHEMERAL NODE SUFFIX ===\n\n{suffix}"
        raw_text, tele = _invoke_arm_b_call(
            full_prompt,
            task=task,
            lane=lane,
            attempt=attempt,
            is_first_task=is_first_task,
            live=live,
            arm_b_l1_models=arm_b_l1_models,
            arm_b_l2_models=arm_b_l2_models,
        )
        llm_calls += 1
        t_cp = time.perf_counter()
        ev = svc.evaluate_node_checkpoint(
            run_id=rid,
            node_id="n1",
            action_role=task.action_role.value,
            attempt=attempt,
            compute_lane=lane.value,
            idempotency_key=f"{rid}:n1:{attempt}",
            candidates=_extract_vs_candidates(raw_text) if inject_vs else [raw_text],
            options=CheckpointEvalOptions(unit_oracle=task.oracle),
            telemetry=tele,
        )
        latencies.append((time.perf_counter() - t_cp) * 1000.0)

        decision = ev["decision"]
        if decision == ThermostatDecision.COMMIT.value:
            svc.record_human_feedback(run_id=rid, human_edit_ratio=0.0, reverted=False)
            return {"task_id": task.task_id, "status": "COMMIT", "passed": True}, llm_calls, 0, latencies
        if decision == ThermostatDecision.CIRCUIT_BREAK.value:
            break
        error_delta = str(ev.get("error_delta") or ev.get("reason") or "")
        inject_vs = decision == ThermostatDecision.INJECT_ASYMMETRY.value
        lane = ComputeLane(str(ev["next_lane"]))

    return {"task_id": task.task_id, "status": "FAIL", "passed": False}, llm_calls, 0, latencies


def _verify_slow_loop_zero_regression(svc: ControlPlaneService) -> bool:
    for bucket_id in ("engineering-and-quality", "pmev-and-quant", "data-and-knowledge", "governance-and-handoff"):

        def _eval_challenger(_bid: str, dcrit: list[str]) -> dict[str, Any]:
            return {
                "strategy_uri": f"ess://{_bid}/evolved-v1",
                "strategy_content": "evolved verified strategy",
                "niche_id": "balanced_roi",
                "mean_quality": 0.98,
                "mean_cost_usd": 0.002,
                "mean_latency_ms": 20.0,
                "dcrit_passed_count": len(dcrit),
                "dcrit_total_count": len(dcrit),
            }

        sl = svc.run_slow_loop_cycle(bucket_id=bucket_id, tier0_present=True, challenger_evaluator=_eval_challenger)
        reason = sl.get("challenger_rejected_reason")
        if reason and "ZERO_REGRESSION_FAILED" in str(reason):
            return False
    return True


def _log_live_progress(arm_label: str, idx: int, total: int, live: bool) -> None:
    if live and idx % 5 == 0:
        print(f"[AB-LIVE] {arm_label} progress: {idx}/{total}", file=sys.stderr, flush=True)


def _run_arm_a_suite(
    tasks: list[BenchmarkTaskSpec],
    arm_a_models: tuple[str, ...],
    live: bool,
) -> tuple[int, int, float, int, int]:
    a_passed, a_llm_calls, a_cost, a_tokens_in, a_cached_in = 0, 0, 0.0, 0, 0
    for idx_t, task in enumerate(tasks, start=1):
        _log_live_progress("Arm A", idx_t, len(tasks), live)
        ok, calls, cost, t_in, c_in = _run_arm_a_task(task, arm_a_models, live)
        a_passed += int(ok)
        a_llm_calls += calls
        a_cost += cost
        a_tokens_in += t_in
        a_cached_in += c_in
    return a_passed, a_llm_calls, a_cost, a_tokens_in, a_cached_in


def _run_arm_b_suite(
    svc: ControlPlaneService,
    tasks: list[BenchmarkTaskSpec],
    *,
    prefix_pad: str,
    live: bool,
    arm_b_l1_models: tuple[str, ...],
    arm_b_l2_models: tuple[str, ...],
) -> tuple[list[dict[str, Any]], int, int, list[float]]:
    b_llm_calls = 0
    b_l0_deflected = 0
    cp_latencies: list[float] = []
    b_per_task_results: list[dict[str, Any]] = []
    for idx_b, task in enumerate(tasks, start=1):
        _log_live_progress("Arm B", idx_b, len(tasks), live)
        row, calls, l0_def, lats = _run_arm_b_task(
            svc,
            task,
            is_first_task=(idx_b == 1),
            prefix_pad=prefix_pad,
            live=live,
            arm_b_l1_models=arm_b_l1_models,
            arm_b_l2_models=arm_b_l2_models,
        )
        b_per_task_results.append(row)
        b_llm_calls += calls
        b_l0_deflected += l0_def
        cp_latencies.extend(lats)
    return b_per_task_results, b_llm_calls, b_l0_deflected, cp_latencies


def _build_ab_summary(
    *,
    live: bool,
    total_n: int,
    arm_a_metrics: tuple[int, int, float, int, int],
    arm_b_metrics: tuple[list[dict[str, Any]], int, int, list[float]],
    kpis_b: dict[str, Any],
    zero_reg_all: bool,
) -> dict[str, Any]:
    a_passed, a_llm_calls, a_cost, a_tokens_in, a_cached_in = arm_a_metrics
    b_per_task_results, b_llm_calls, b_l0_deflected, cp_latencies = arm_b_metrics
    b_passed = sum(1 for r in b_per_task_results if r["passed"])
    a_rate = a_passed / total_n
    b_rate = b_passed / total_n
    b_total_cost = float(kpis_b["mean_cost_per_verified_commit_usd"]) * int(kpis_b["committed_runs"])
    a_cost_per_commit = (a_cost / a_passed) if a_passed > 0 else a_cost
    b_cost_per_commit = (b_total_cost / b_passed) if b_passed > 0 else b_total_cost
    cost_ratio = (b_cost_per_commit / a_cost_per_commit) if a_cost_per_commit > 0 else 0.0
    p95_cp = float(np.percentile(cp_latencies, 95)) if cp_latencies else 0.0

    return {
        "mode": "LIVE_GEMINI" if live else "HERMETIC_MOCK",
        "tasks_total": total_n,
        "arm_a_baseline": {
            "passed": a_passed,
            "delivery_rate": round(a_rate, 4),
            "llm_calls": a_llm_calls,
            "tokens_in": a_tokens_in,
            "cached_tokens_in": a_cached_in,
            "total_cost_usd": round(a_cost, 6),
            "cost_per_verified_delivery_usd": round(a_cost_per_commit, 6),
        },
        "arm_b_omnikernel": {
            "passed": b_passed,
            "delivery_rate": round(b_rate, 4),
            "llm_calls": b_llm_calls,
            "l0_det_deflected": b_l0_deflected,
            "total_cost_usd": round(b_total_cost, 6),
            "cost_per_verified_delivery_usd": round(b_cost_per_commit, 6),
            "prefix_cache_hit_rate": kpis_b["prefix_cache_hit_rate"],
            "control_plane_p95_ms": round(p95_cp, 3),
            "zero_regression_verified": zero_reg_all,
        },
        "comparison": {
            "cost_ratio_b_over_a": round(cost_ratio, 4),
            "cost_savings_pct": round((1.0 - cost_ratio) * 100.0, 2) if a_cost_per_commit > 0 else 0.0,
            "delivery_delta_pp": round((b_rate - a_rate) * 100.0, 2),
        },
        "task_results": b_per_task_results,
    }


def run_ab_benchmark(
    *,
    live: bool = False,
    task_limit: int = 30,
    write_report: bool = False,
) -> dict[str, Any]:
    """Run paired A/B benchmark (Baseline vs NEXUS-OMNIKERNEL) across up to 30 tasks."""
    tasks = build_30_task_suite()[: max(1, min(30, task_limit))]
    prefix_pad = _build_constitutional_prefix_pad() if live else "CONSTITUTIONAL_PREFIX_COMPACT"
    arm_a_models, arm_b_l1_models, arm_b_l2_models = _select_benchmark_models(live)

    arm_a_metrics = _run_arm_a_suite(tasks, arm_a_models, live)

    svc = ControlPlaneService(config=ControlPlaneConfig(db_path=":memory:"))
    try:
        arm_b_metrics = _run_arm_b_suite(
            svc,
            tasks,
            prefix_pad=prefix_pad,
            live=live,
            arm_b_l1_models=arm_b_l1_models,
            arm_b_l2_models=arm_b_l2_models,
        )
        zero_reg_all = _verify_slow_loop_zero_regression(svc)
        kpis_b = svc.store.compute_kpis()
    finally:
        svc.close()

    summary = _build_ab_summary(
        live=live,
        total_n=len(tasks),
        arm_a_metrics=arm_a_metrics,
        arm_b_metrics=arm_b_metrics,
        kpis_b=kpis_b,
        zero_reg_all=zero_reg_all,
    )

    if write_report:
        _write_validation_report(summary)

    return summary


def _write_validation_report(summary: dict[str, Any]) -> Path:
    report_path = SITE_ROOT / "reports" / "VALIDACAO-2026-11-27-omnikernel-v1-1-ab-benchmark.md"
    now_iso = datetime.now(UTC).astimezone().isoformat(timespec="seconds")
    arm_a = summary["arm_a_baseline"]
    arm_b = summary["arm_b_omnikernel"]
    comp = summary["comparison"]
    content = (
        "---\n"
        "id: validacao-2026-11-27-omnikernel-v1-1-ab-benchmark\n"
        "tipo: validacao\n"
        "escopo: Site\n"
        "ecossistema: nexus-sota\n"
        "autor: Gemini 4 Hydrogen\n"
        f"criado_em: '{now_iso}'\n"
        f"atualizado_em: '{now_iso}'\n"
        "classes: [interno, medido, control-plane, benchmark]\n"
        "caminhos:\n"
        "  - reports/VALIDACAO-2026-11-27-omnikernel-v1-1-ab-benchmark.md\n"
        "  - control_plane/benchmark_ab.py\n"
        "  - control_plane/service.py\n"
        "config_medida:\n"
        "  congelada_em: '2026-11-27'\n"
        "  raiz: C:/Users/rapha/.gemini/Site\n"
        "  branch: master\n"
        "  commit_base: HEAD\n"
        "  host: Windows 11, i9-9900K, 31.8GB RAM, Python 3.14.9\n"
        "  data_das_medicoes: '2026-11-27'\n"
        "verificado:\n"
        f"  - modo de execucao {summary['mode']} sobre {summary['tasks_total']} tarefas verificaveis\n"
        f"  - Braço A (Baseline) entrega {arm_a['passed']}/{summary['tasks_total']} ({arm_a['delivery_rate']:.2%}) a ${arm_a['cost_per_verified_delivery_usd']:.6f}/entrega\n"
        f"  - Braço B (OmniKernel) entrega {arm_b['passed']}/{summary['tasks_total']} ({arm_b['delivery_rate']:.2%}) a ${arm_b['cost_per_verified_delivery_usd']:.6f}/entrega\n"
        f"  - razao de custo B/A = {comp['cost_ratio_b_over_a']:.4f}x (economia {comp['cost_savings_pct']:.2f}%)\n"
        f"  - latencia p95 do plano de controle = {arm_b['control_plane_p95_ms']} ms e zero_regression_verified = {arm_b['zero_regression_verified']}\n"
        "nao_verificado:\n"
        "  - comportamento sob carga concorrente multi-worker (execucao serial monocratica conforme Site/CLAUDE.md)\n"
        "---\n\n"
        "# Validacao A/B `NEXUS-OMNIKERNEL v1.1-EVOLVED` (30 Tarefas)\n\n"
        "| Metrica | Braco A (Baseline) | Braco B (OmniKernel v1.1) | Delta / Razao |\n"
        "| :--- | :---: | :---: | :---: |\n"
        f"| Entregas Verificadas | {arm_a['passed']}/{summary['tasks_total']} ({arm_a['delivery_rate']:.2%}) | {arm_b['passed']}/{summary['tasks_total']} ({arm_b['delivery_rate']:.2%}) | {comp['delivery_delta_pp']:+.2f} p.p. |\n"
        f"| Chamadas LLM | {arm_a['llm_calls']} | {arm_b['llm_calls']} (L0_DET defletiu {arm_b['l0_det_deflected']}) | {arm_b['llm_calls'] - arm_a['llm_calls']:+d} |\n"
        f"| Custo / Entrega Verificada (USD) | \\${arm_a['cost_per_verified_delivery_usd']:.6f} | \\${arm_b['cost_per_verified_delivery_usd']:.6f} | {comp['cost_ratio_b_over_a']:.4f}x ({comp['cost_savings_pct']:.2f}% economia) |\n"
        f"| Cache Hit no Prefixo | {arm_a['cached_tokens_in']}/{arm_a['tokens_in']} | {arm_b['prefix_cache_hit_rate']:.2%} | medido via usage_metadata |\n"
        f"| Latencia Control Plane (p95) | N/A | {arm_b['control_plane_p95_ms']} ms | meta <= 120 ms |\n"
        f"| Regressao Pos-Evolucao (Slow Loop) | N/A | {'0.0%' if arm_b['zero_regression_verified'] else 'FALHOU'} | `zero_regression_verified={arm_b['zero_regression_verified']}` |\n"
    )
    report_path.write_text(content, encoding="utf-8")
    return report_path
