"""Modality-gated behavioral and semantic equivalence engine.

- k < 2: short-circuits with SINGLE (convergence=1.0), avoiding 0/0 in ln(k).
- code/structured: canonical AST/JSON + test-vector signature (exact, <5ms).
- prose/hybrid: bidirectional entailment with complete-linkage clustering.
"""

from __future__ import annotations

import ast
from dataclasses import dataclass
import hashlib
import json
import logging
import math
import re
from typing import Protocol

from control_plane.config import EquivMetricKind, Modality
from llm.gemini_decisions import decide_s1

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class CandidateInput:
    payload: str
    test_vector: tuple[int, ...] = ()
    declared_strategy_id: str | None = None


@dataclass(frozen=True, slots=True)
class EquivalenceResult:
    metric_kind: EquivMetricKind
    convergence_score: float
    cluster_count: int
    cluster_assignments: tuple[int, ...]


class EntailmentScorer(Protocol):
    """Bidirectional entailment oracle (A |= B and B |= A)."""

    @property
    def metric_kind(self) -> EquivMetricKind: ...

    def mutually_entails(self, text_a: str, text_b: str) -> bool: ...


_NEGATION_WORDS = frozenset({"no", "not", "never", "nao", "nunca", "jamais", "sem", "without", "none"})
_OPPOSITE_PAIRS: tuple[tuple[str, str], ...] = (
    ("permitir", "bloquear"),
    ("allow", "deny"),
    ("allow", "forbid"),
    ("enable", "disable"),
    ("habilitar", "desabilitar"),
    ("aceitar", "rejeitar"),
    ("accept", "reject"),
    ("true", "false"),
    ("verdadeiro", "falso"),
    ("pass", "fail"),
    ("approve", "reject"),
    ("aprovar", "reprovar"),
)
_COMP_OPPOSITES: tuple[tuple[str, str], ...] = (
    (">=", "<"),
    ("<=", ">"),
    ("==", "!="),
    (">", "<="),
    ("<", ">="),
)


def _extract_comparators(text: str) -> set[str]:
    return set(re.findall(r">=|<=|!=|==|>|<", text))


def _normalize_tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9_]+", text.lower())


def _has_comparator_conflict(a_norm: str, b_norm: str) -> bool:
    comps_a = _extract_comparators(a_norm)
    comps_b = _extract_comparators(b_norm)
    if not (comps_a and comps_b):
        return False
    for op1, op2 in _COMP_OPPOSITES:
        if (op1 in comps_a and op2 in comps_b) or (op2 in comps_a and op1 in comps_b):
            return True
    return comps_a != comps_b


def _has_antonym_conflict(toks_a: set[str], toks_b: set[str]) -> bool:
    return any((w1 in toks_a and w2 in toks_b) or (w2 in toks_a and w1 in toks_b) for w1, w2 in _OPPOSITE_PAIRS)


class DeterministicPolarityEntailmentScorer:
    """Fast polarity-aware entailment checker detecting inverted operators and negations."""

    @property
    def metric_kind(self) -> EquivMetricKind:
        return EquivMetricKind.ONNX_NLI

    def mutually_entails(self, text_a: str, text_b: str) -> bool:
        a_norm = text_a.strip().lower()
        b_norm = text_b.strip().lower()
        if a_norm == b_norm:
            return True
        if _has_comparator_conflict(a_norm, b_norm):
            return False

        toks_a = set(_normalize_tokens(a_norm))
        toks_b = set(_normalize_tokens(b_norm))
        if not toks_a or not toks_b:
            return False
        if (len(toks_a & _NEGATION_WORDS) % 2) != (len(toks_b & _NEGATION_WORDS) % 2):
            return False
        if _has_antonym_conflict(toks_a, toks_b):
            return False

        core_a = toks_a - _NEGATION_WORDS
        core_b = toks_b - _NEGATION_WORDS
        union = core_a | core_b
        if not union:
            return True
        return (len(core_a & core_b) / len(union)) >= 0.60


class LayaS1EntailmentScorer:
    """System-1 Laya (:8192) bidirectional entailment scorer with deterministic fallback."""

    _S1_QUESTIONS: dict[str, dict[str, object]] = {
        "mutually_entails": {
            "type": "noul",
            "instructions": (
                "Do Statement A and Statement B have the exact same logical meaning and permissions/thresholds, "
                "with no inverted comparators (>= vs <) and no opposite polarity (allow vs deny)?"
            ),
            "criteria": {
                "true": "Logically equivalent in permissions, thresholds, and polarity.",
                "false": "Contradictory, negated, inverted threshold, or distinct meaning.",
            },
        }
    }

    def __init__(self, fallback: EntailmentScorer | None = None, *, min_confidence: float = 0.55) -> None:
        self.fallback = fallback or DeterministicPolarityEntailmentScorer()
        self.min_confidence = min_confidence

    @property
    def metric_kind(self) -> EquivMetricKind:
        return EquivMetricKind.LAYA_S1_NLI

    def mutually_entails(self, text_a: str, text_b: str) -> bool:
        if not self.fallback.mutually_entails(text_a, text_b):
            return False
        try:
            state = f"Statement A: {text_a.strip()}\nStatement B: {text_b.strip()}"
            res = decide_s1(state, self._S1_QUESTIONS, allow_laya_failover=True)
            answers = getattr(res, "answers", None)
            if isinstance(answers, dict) and "mutually_entails" in answers:
                entry = answers["mutually_entails"]
                if isinstance(entry, dict):
                    conf = float(entry.get("confidence", entry.get("answer_confidence", 0.0)) or 0.0)
                    noul = entry.get("noul")
                    if isinstance(noul, int | float) and not isinstance(noul, bool) and conf >= self.min_confidence:
                        return float(noul) >= 0.55
        except Exception as exc:  # noqa: BLE001
            logger.debug("Laya S1 unavailable; using deterministic fallback: %s", exc)
        return True


def _canonical_code_or_json_hash(payload: str, modality: Modality) -> str:
    stripped = payload.strip()
    if modality == Modality.STRUCTURED:
        try:
            parsed = json.loads(stripped)
            canonical = json.dumps(parsed, sort_keys=True, separators=(",", ":"))
            return hashlib.sha256(canonical.encode()).hexdigest()
        except (TypeError, ValueError) as exc:
            logger.debug("Structured JSON parse fallback to raw hash: %s", exc)
    if modality == Modality.CODE:
        try:
            tree = ast.parse(stripped)
            dumped = ast.dump(tree, annotate_fields=True, include_attributes=False)
            return hashlib.sha256(dumped.encode("utf-8")).hexdigest()
        except SyntaxError:
            pass
    return hashlib.sha256(stripped.encode("utf-8")).hexdigest()


def _normalized_entropy_convergence(assignments: list[int]) -> float:
    k = len(assignments)
    if k < 2:
        return 1.0
    counts: dict[int, int] = {}
    for cid in assignments:
        counts[cid] = counts.get(cid, 0) + 1
    entropy = 0.0
    for count in counts.values():
        p = count / k
        if p > 0.0:
            entropy -= p * math.log(p)
    score = 1.0 - (entropy / math.log(k))
    return round(max(0.0, min(1.0, score)), 6)


class EquivalenceEngine:
    """Computes hybrid convergence across k candidates with modality gating."""

    def __init__(self, entailment_scorer: EntailmentScorer | None = None) -> None:
        self.entailment_scorer = entailment_scorer or DeterministicPolarityEntailmentScorer()

    @staticmethod
    def _evaluate_structured(candidates: list[CandidateInput], modality: Modality) -> EquivalenceResult:
        sig_to_cluster: dict[tuple[str, tuple[int, ...]], int] = {}
        assignments: list[int] = []
        for cand in candidates:
            sig = (_canonical_code_or_json_hash(cand.payload, modality), cand.test_vector)
            if sig not in sig_to_cluster:
                sig_to_cluster[sig] = len(sig_to_cluster)
            assignments.append(sig_to_cluster[sig])
        return EquivalenceResult(
            metric_kind=EquivMetricKind.AST_TEST,
            convergence_score=_normalized_entropy_convergence(assignments),
            cluster_count=len(sig_to_cluster),
            cluster_assignments=tuple(assignments),
        )

    def _fits_cluster(self, cand: CandidateInput, members: list[int], candidates: list[CandidateInput]) -> bool:
        return all(self.entailment_scorer.mutually_entails(cand.payload, candidates[m].payload) for m in members)

    def _evaluate_prose_clusters(self, candidates: list[CandidateInput]) -> EquivalenceResult:
        clusters: list[list[int]] = []
        assignments: list[int] = []
        for idx, cand in enumerate(candidates):
            matched = next(
                (c_id for c_id, members in enumerate(clusters) if self._fits_cluster(cand, members, candidates)),
                None,
            )
            if matched is None:
                matched = len(clusters)
                clusters.append([idx])
            else:
                clusters[matched].append(idx)
            assignments.append(matched)
        return EquivalenceResult(
            metric_kind=self.entailment_scorer.metric_kind,
            convergence_score=_normalized_entropy_convergence(assignments),
            cluster_count=len(clusters),
            cluster_assignments=tuple(assignments),
        )

    def evaluate(self, candidates: list[CandidateInput], modality: Modality) -> EquivalenceResult:
        k = len(candidates)
        if k < 2:
            return EquivalenceResult(
                metric_kind=EquivMetricKind.SINGLE,
                convergence_score=1.0,
                cluster_count=1 if k == 1 else 0,
                cluster_assignments=(0,) if k == 1 else (),
            )
        if modality in {Modality.CODE, Modality.STRUCTURED}:
            return self._evaluate_structured(candidates, modality)
        return self._evaluate_prose_clusters(candidates)
