"""Tests for deterministic Thermostat states, double idempotency, Cascade, and prefix cache stability."""

from __future__ import annotations

import pytest

from control_plane.config import ActionRole, ArtifactKind, ComputeLane, ControlPlaneConfig, ThermostatDecision
from control_plane.service import CheckpointTelemetry, ControlPlaneService
from control_plane.storage import AttemptConflictError


def _make_service() -> ControlPlaneService:
    return ControlPlaneService(config=ControlPlaneConfig(db_path=":memory:"))


@pytest.mark.unit
def test_thermostat_state_transitions_and_idempotency() -> None:
    svc = _make_service()
    try:
        svc.register_canonical_artifact(
            bucket_id="engineering-and-quality",
            serial_uri="core://contracts/parser-v1",
            kind=ArtifactKind.CONTRACT.value,
            content="def parse(x: str) -> int: ...",
        )
        boot1 = svc.bootstrap_run_context(
            bucket_id="engineering-and-quality",
            contract_uri="core://contracts/parser-v1",
            run_id="run-1",
            task_description="Implement parser function",
        )
        assert boot1["status"] == "OK"

        # Attempt 1: SyntaxError -> REGENERATE_CLEAN with clean O(1) envelope & identical prefix_hash
        r1 = svc.evaluate_node_checkpoint(
            run_id="run-1",
            node_id="node-a",
            action_role=ActionRole.LOCAL_PATCH.value,
            attempt=1,
            compute_lane=ComputeLane.L1_EDGE_ECON.value,
            idempotency_key="run-1:node-a:1:bad1",
            candidates=["def parse(x:\n"],
            telemetry=CheckpointTelemetry(cost_usd=0.01),
        )
        assert r1["decision"] == ThermostatDecision.REGENERATE_CLEAN.value
        assert r1["clean_regen_envelope"]["prefix_hash"] == boot1["prefix_hash"]

        # Exact idempotent replay returns sealed decision without re-executing
        replay = svc.evaluate_node_checkpoint(
            run_id="run-1",
            node_id="node-a",
            action_role=ActionRole.LOCAL_PATCH.value,
            attempt=1,
            compute_lane=ComputeLane.L1_EDGE_ECON.value,
            idempotency_key="run-1:node-a:1:bad1",
            candidates=["def parse(x:\n"],
        )
        assert replay["status"] == "IDEMPOTENT_REPLAY"
        assert replay["decision"] == ThermostatDecision.REGENERATE_CLEAN.value

        # Double-idempotency protection: same (run_id, node_id, attempt) with different key raises AttemptConflictError
        with pytest.raises(AttemptConflictError):
            svc.evaluate_node_checkpoint(
                run_id="run-1",
                node_id="node-a",
                action_role=ActionRole.LOCAL_PATCH.value,
                attempt=1,
                compute_lane=ComputeLane.L1_EDGE_ECON.value,
                idempotency_key="run-1:node-a:1:bypass",
                candidates=["def parse(x: str) -> int: return 1"],
            )

        # Attempt 2: identical error_hash triggers INJECT_ASYMMETRY + Verbalized Sampling + lane escalation
        r2 = svc.evaluate_node_checkpoint(
            run_id="run-1",
            node_id="node-a",
            action_role=ActionRole.LOCAL_PATCH.value,
            attempt=2,
            compute_lane=ComputeLane.L1_EDGE_ECON.value,
            idempotency_key="run-1:node-a:2:bad1",
            candidates=["def parse(x:\n"],
            telemetry=CheckpointTelemetry(cost_usd=0.01),
        )
        assert r2["decision"] == ThermostatDecision.INJECT_ASYMMETRY.value
        assert r2["next_lane"] == ComputeLane.L2_FRONTIER.value
        assert r2["enable_mutator"] is True
        assert r2["verbalized_sampling_schema"] is not None
        assert r2["clean_regen_envelope"]["prefix_hash"] == boot1["prefix_hash"]

        # Attempt 3 (max_retries=3): valid candidate -> COMMIT
        r3 = svc.evaluate_node_checkpoint(
            run_id="run-1",
            node_id="node-a",
            action_role=ActionRole.LOCAL_PATCH.value,
            attempt=3,
            compute_lane=ComputeLane.L2_FRONTIER.value,
            idempotency_key="run-1:node-a:3:good",
            candidates=["def parse(x: str) -> int:\n    return int(x)\n"],
            telemetry=CheckpointTelemetry(cost_usd=0.02, tokens_in=1000, cached_tokens_in=850),
        )
        assert r3["decision"] == ThermostatDecision.COMMIT.value
        assert r3["v_det_passed"] is True
    finally:
        svc.close()


@pytest.mark.unit
def test_thermostat_circuit_break_on_missing_delta_and_budget_and_blind_mutator() -> None:
    svc = _make_service()
    try:
        svc.register_canonical_artifact(
            bucket_id="engineering-and-quality",
            serial_uri="core://contracts/prod-v1",
            kind=ArtifactKind.CONTRACT.value,
            content="implement production handler",
        )
        missing = svc.bootstrap_run_context(
            bucket_id="engineering-and-quality",
            contract_uri="core://contracts/prod-v1",
            run_id="run-missing",
            missing_delta_crit=["DB_TARGET_TABLE"],
        )
        assert missing["status"] == "BLOCKED"
        assert missing["error_code"] == "DELTA_CRIT_MISSING"

        svc.bootstrap_run_context(
            bucket_id="engineering-and-quality",
            contract_uri="core://contracts/prod-v1",
            run_id="run-prod",
        )
        # Stub fails blind mutator in Stage 2 and hits FinOps budget ceiling -> CIRCUIT_BREAK
        res = svc.evaluate_node_checkpoint(
            run_id="run-prod",
            node_id="n1",
            action_role=ActionRole.COMMIT_PROD.value,
            attempt=1,
            compute_lane=ComputeLane.L2_FRONTIER.value,
            idempotency_key="run-prod:n1:1",
            candidates=["def handle():\n    raise NotImplementedError\n"],
            telemetry=CheckpointTelemetry(cost_usd=0.55),
        )
        assert res["decision"] == ThermostatDecision.CIRCUIT_BREAK.value
        assert res["v_det_passed"] is False
    finally:
        svc.close()
