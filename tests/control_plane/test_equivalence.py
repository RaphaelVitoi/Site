"""Tests for modality-gated hybrid equivalence and inverted polarity detection."""

from __future__ import annotations

import pytest

from control_plane.config import EquivMetricKind, Modality
from control_plane.equivalence import CandidateInput, EquivalenceEngine


@pytest.mark.unit
def test_single_candidate_short_circuits_without_division_by_zero() -> None:
    engine = EquivalenceEngine()
    res = engine.evaluate([CandidateInput(payload="def f(): return 1")], Modality.CODE)
    assert res.metric_kind == EquivMetricKind.SINGLE
    assert res.convergence_score == 1.0


@pytest.mark.unit
def test_code_and_structured_ast_test_vector_equivalence() -> None:
    engine = EquivalenceEngine()
    # Semantically identical Python functions differing only in whitespace/formatting
    c1 = CandidateInput(payload="def add(a,b):\n    return a+b", test_vector=(1, 1, 1))
    c2 = CandidateInput(payload="def add(a, b):\n    return a + b\n", test_vector=(1, 1, 1))
    same = engine.evaluate([c1, c2], Modality.CODE)
    assert same.metric_kind == EquivMetricKind.AST_TEST
    assert same.convergence_score == 1.0

    # Differing test outcomes break equivalence even if syntax is valid
    c3 = CandidateInput(payload="def add(a, b):\n    return a - b", test_vector=(1, 0, 0))
    diff = engine.evaluate([c1, c3], Modality.CODE)
    assert diff.convergence_score == 0.0

    # JSON key-order invariance
    j1 = CandidateInput(payload='{"b": 2, "a": 1}', test_vector=(1,))
    j2 = CandidateInput(payload='{"a":1,"b":2}', test_vector=(1,))
    j_res = engine.evaluate([j1, j2], Modality.STRUCTURED)
    assert j_res.metric_kind == EquivMetricKind.AST_TEST
    assert j_res.convergence_score == 1.0


@pytest.mark.unit
def test_prose_nli_detects_inverted_comparators_and_negations() -> None:
    engine = EquivalenceEngine()

    res_cmp = engine.evaluate(
        [
            CandidateInput(payload="Permitir acesso apenas quando score >= 80"),
            CandidateInput(payload="Permitir acesso apenas quando score < 80"),
        ],
        Modality.PROSE,
    )
    assert res_cmp.cluster_count == 2
    assert res_cmp.convergence_score == 0.0

    res_pol = engine.evaluate(
        [
            CandidateInput(payload="Permitir execucao automatica no ambiente local"),
            CandidateInput(payload="Bloquear execucao automatica no ambiente local"),
        ],
        Modality.PROSE,
    )
    assert res_pol.cluster_count == 2
    assert res_pol.convergence_score == 0.0

    res_agree = engine.evaluate(
        [
            CandidateInput(payload="Manter execucao deterministica com rollback no no k"),
            CandidateInput(payload="Manter execucao deterministica com rollback no no k"),
        ],
        Modality.PROSE,
    )
    assert res_agree.cluster_count == 1
    assert res_agree.convergence_score == 1.0
