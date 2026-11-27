"""Hermetic tests for LayaS1EntailmentScorer, markdown fence extraction, and 30-task A/B benchmark."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from control_plane.benchmark_ab import run_ab_benchmark
from control_plane.cascade import EvaluationCascade
from control_plane.config import ActionRole, EquivMetricKind, Modality
from control_plane.equivalence import LayaS1EntailmentScorer


@pytest.mark.unit
def test_cascade_extracts_markdown_fenced_code_and_json() -> None:
    cascade = EvaluationCascade()
    code_res = cascade.evaluate(
        payload="```python\ndef fn(x: int) -> int:\n    return x * 2\n```",
        modality=Modality.CODE,
        action_role=ActionRole.LOCAL_PATCH,
        contract_content="def fn(x: int) -> int:",
    )
    assert code_res.v_det_passed is True

    json_res = cascade.evaluate(
        payload='```json\n{"ok": true, "count": 3}\n```',
        modality=Modality.STRUCTURED,
        action_role=ActionRole.LOCAL_PATCH,
        contract_content="{}",
    )
    assert json_res.v_det_passed is True


@pytest.mark.unit
def test_laya_s1_entailment_scorer_with_mocked_decide_s1(monkeypatch: pytest.MonkeyPatch) -> None:
    import control_plane.equivalence as eq_mod

    monkeypatch.setattr(
        eq_mod,
        "decide_s1",
        lambda *_args, **_kwargs: SimpleNamespace(
            answers={"mutually_entails": {"noul": 0.92, "confidence": 0.88}},
        ),
    )
    scorer = LayaS1EntailmentScorer()
    assert scorer.metric_kind == EquivMetricKind.LAYA_S1_NLI
    assert scorer.mutually_entails("Keep deterministic rollback", "Keep deterministic rollback") is True
    assert scorer.mutually_entails("Allow when x >= 10", "Allow when x < 10") is False


@pytest.mark.unit
def test_30_task_ab_benchmark_hermetic_mock_passes_all_kpis() -> None:
    res = run_ab_benchmark(live=False, task_limit=30, write_report=False)
    assert res["tasks_total"] == 30
    assert res["arm_b_omnikernel"]["passed"] == 30
    assert res["arm_b_omnikernel"]["delivery_rate"] == 1.0
    assert res["arm_b_omnikernel"]["l0_det_deflected"] == 2
    assert res["arm_b_omnikernel"]["control_plane_p95_ms"] <= 120.0
    assert res["arm_b_omnikernel"]["zero_regression_verified"] is True
    assert res["comparison"]["cost_ratio_b_over_a"] <= 0.45
