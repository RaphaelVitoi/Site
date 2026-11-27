"""Tests for monotonic 1D CRC calibration, Tier0 sovereignty gate, n-step PER, and GEPA/MAP-Elites."""

from __future__ import annotations

import pytest

from control_plane.config import ActionRole, ArtifactKind, CalibrationMode, ControlPlaneConfig
from control_plane.service import ControlPlaneService
from control_plane.storage import ReplayEpisodeInput


def _make_service() -> ControlPlaneService:
    return ControlPlaneService(config=ControlPlaneConfig(db_path=":memory:", crc_min_samples=25))


@pytest.mark.unit
def test_crc_cold_start_to_empirical_and_tier0_sovereignty_gate() -> None:
    svc = _make_service()
    try:
        bucket = "engineering-and-quality"
        contract = svc.store.register_artifact(bucket, "core://contracts/c1", ArtifactKind.CONTRACT.value, "contract")

        # Seed 24 clean episodes (< 25) -> stays in cold_start
        for i in range(24):
            rid = f"r-cold-{i}"
            svc.store.create_workflow_run(rid, bucket, contract.record_id, "ph")
            svc.store.append_replay_episode(
                ReplayEpisodeInput(
                    run_id=rid,
                    bucket_id=bucket,
                    node_id="n1",
                    action_role=ActionRole.COMMIT_PROD.value,
                    strategy_record_id=None,
                    step_index=1,
                    v_det_passed=True,
                    drift_score=0.10,
                    dense_reward=1.0,
                    trace_summary="ok",
                    human_edit_ratio=0.0,
                )
            )

        out_24 = svc.run_slow_loop_cycle(bucket_id=bucket, tier0_present=False)
        assert out_24["crc_calibration"]["COMMIT_PROD"]["is_cold_start"] is True

        # Add 25th clean episode (>= 25) -> transitions out of cold_start
        # Without tier0_present=True, relaxing COMMIT_PROD below prior floor is blocked!
        svc.store.create_workflow_run("r-cold-24", bucket, contract.record_id, "ph")
        svc.store.append_replay_episode(
            ReplayEpisodeInput(
                run_id="r-cold-24",
                bucket_id=bucket,
                node_id="n1",
                action_role=ActionRole.COMMIT_PROD.value,
                strategy_record_id=None,
                step_index=1,
                v_det_passed=True,
                drift_score=0.10,
                dense_reward=1.0,
                trace_summary="ok",
                human_edit_ratio=0.0,
            )
        )

        # With 25 clean episodes and alpha=0.02: 1/26 = 0.03846 > 0.02, so conformal chooses lambda=1.0 (strictest)
        # Let's also test LOCAL_PATCH (alpha=0.08): 1/26 = 0.03846 <= 0.08 -> relaxes lambda to 0.0!
        for i in range(25):
            rid = f"r-lp-{i}"
            svc.store.create_workflow_run(rid, bucket, contract.record_id, "ph")
            svc.store.append_replay_episode(
                ReplayEpisodeInput(
                    run_id=rid,
                    bucket_id=bucket,
                    node_id="n1",
                    action_role=ActionRole.LOCAL_PATCH.value,
                    strategy_record_id=None,
                    step_index=1,
                    v_det_passed=True,
                    drift_score=0.10,
                    dense_reward=0.7,
                    trace_summary="ok",
                    human_edit_ratio=0.0,
                )
            )

        out_auto = svc.run_slow_loop_cycle(bucket_id=bucket, tier0_present=False)
        assert out_auto["crc_calibration"]["COMMIT_PROD"]["is_cold_start"] is False
        assert out_auto["crc_calibration"]["COMMIT_PROD"]["calibration_mode"] == CalibrationMode.AUTO_CALIBRATION.value
        assert out_auto["crc_calibration"]["LOCAL_PATCH"]["is_cold_start"] is False
        assert out_auto["crc_calibration"]["LOCAL_PATCH"]["lambda_unified"] == 0.0
    finally:
        svc.close()


@pytest.mark.unit
def test_slow_loop_nstep_per_crystallization_and_zero_regression_gate() -> None:
    svc = _make_service()
    try:
        bucket = "pmev-and-quant"
        contract = svc.store.register_artifact(bucket, "core://pmev/c1", ArtifactKind.CONTRACT.value, "icm model")
        svc.store.create_workflow_run("run-multi", bucket, contract.record_id, "ph")
        svc.store.append_replay_episode(
            ReplayEpisodeInput(
                run_id="run-multi",
                bucket_id=bucket,
                node_id="n1",
                action_role=ActionRole.LOCAL_PATCH.value,
                strategy_record_id=None,
                step_index=1,
                v_det_passed=True,
                drift_score=0.1,
                dense_reward=0.7,
                trace_summary="step 1 passed",
            )
        )
        svc.store.append_replay_episode(
            ReplayEpisodeInput(
                run_id="run-multi",
                bucket_id=bucket,
                node_id="n2",
                action_role=ActionRole.LOCAL_PATCH.value,
                strategy_record_id=None,
                step_index=2,
                v_det_passed=True,
                drift_score=0.1,
                dense_reward=0.7,
                trace_summary="step 2 silent reward hack",
            )
        )

        fb = svc.record_human_feedback(run_id="run-multi", human_edit_ratio=0.80, reverted=True)
        assert fb["r_impl"] == pytest.approx(-0.96, abs=1e-5)
        assert fb["episodes_updated"] == 2
        eps = svc.store.get_run_episodes("run-multi")
        assert eps[1]["n_step_return"] == pytest.approx(0.7 - 0.96, abs=1e-5)
        assert eps[0]["n_step_return"] == pytest.approx(0.7 + 0.9 * (0.7 - 0.96), abs=1e-5)

        # Challenger failing 1 test in D_crit MUST be rejected
        def failing_challenger(_bid: str, dcrit: list[str]) -> dict[str, object]:
            return {
                "strategy_uri": "ess://pmev/bad-challenger",
                "strategy_content": "bad challenger",
                "niche_id": "max_precision",
                "mean_quality": 0.99,
                "mean_cost_usd": 0.01,
                "mean_latency_ms": 10.0,
                "dcrit_passed_count": max(0, len(dcrit) - 1),
                "dcrit_total_count": len(dcrit),
            }

        res_fail = svc.run_slow_loop_cycle(bucket_id=bucket, challenger_evaluator=failing_challenger)
        assert len(res_fail["crystallized_dcrit_uris"]) == 2
        assert res_fail["promoted_elite"] is None
        assert "ZERO_REGRESSION_FAILED" in (res_fail["challenger_rejected_reason"] or "")

        # Now add a new episode and pass 100% of D_crit -> promoted
        svc.store.create_workflow_run("run-good", bucket, contract.record_id, "ph")
        svc.store.append_replay_episode(
            ReplayEpisodeInput(
                run_id="run-good",
                bucket_id=bucket,
                node_id="n1",
                action_role=ActionRole.LOCAL_PATCH.value,
                strategy_record_id=None,
                step_index=1,
                v_det_passed=True,
                drift_score=0.05,
                dense_reward=0.8,
                trace_summary="good run",
            )
        )

        def passing_challenger(_bid: str, dcrit: list[str]) -> dict[str, object]:
            return {
                "strategy_uri": "ess://pmev/elite-v1",
                "strategy_content": "strict icm verified strategy",
                "niche_id": "max_precision",
                "mean_quality": 0.96,
                "mean_cost_usd": 0.02,
                "mean_latency_ms": 25.0,
                "dcrit_passed_count": len(dcrit),
                "dcrit_total_count": len(dcrit),
            }

        res_ok = svc.run_slow_loop_cycle(
            bucket_id=bucket,
            tier0_present=True,
            challenger_evaluator=passing_challenger,
        )
        assert res_ok["promoted_elite"] == "ess://pmev/elite-v1"
        elite = svc.store.get_active_elite(bucket, "max_precision")
        assert elite is not None
        assert elite["zero_reg_verified"] == 1
        assert elite["approval_mode"] == CalibrationMode.TIER0_FORMAL.value
    finally:
        svc.close()
