"""Integration tests for FastMCP tools, PromptStructureOptimizer, and CPU latency KPI."""

from __future__ import annotations

import json

import pytest

from control_plane.config import ControlPlaneConfig
from control_plane.mcp_tools import register_control_plane_tools
from control_plane.service import ControlPlaneService
from core.sota_context_engine import PromptStructureOptimizer
from engine.skills_mcp_server import control_plane_tools, server


@pytest.mark.unit
def test_skills_mcp_server_exposes_all_7_control_plane_tools() -> None:
    expected = {
        "ok_register_canonical_artifact",
        "ok_bootstrap_run_context",
        "ok_resolve_serial",
        "ok_search_bucket_semantic",
        "ok_evaluate_node_checkpoint",
        "ok_record_human_feedback",
        "ok_run_slow_loop_cycle",
    }
    assert set(control_plane_tools.keys()) == expected
    assert server is not None


@pytest.mark.unit
def test_mcp_tools_roundtrip_and_bifasic_envelope() -> None:
    svc = ControlPlaneService(config=ControlPlaneConfig(db_path=":memory:"))

    class _DummyServer:
        def tool(self, **_kwargs: object):
            def _dec(fn):
                return fn

            return _dec

    try:
        tools = register_control_plane_tools(_DummyServer(), service=svc)
        reg = json.loads(
            tools["ok_register_canonical_artifact"](
                bucket_id="engineering-and-quality",
                serial_uri="core://contracts/mcp-demo",
                kind="contract",
                content="def ok() -> int: return 42",
            )
        )
        assert reg["status"] == "OK"

        boot = json.loads(
            tools["ok_bootstrap_run_context"](
                bucket_id="engineering-and-quality",
                contract_uri="core://contracts/mcp-demo",
                run_id="mcp-run-1",
                task_description="Run sota quality gate",
            )
        )
        assert boot["status"] == "OK"
        assert boot["prefix_hash"]

        resolved = json.loads(
            tools["ok_resolve_serial"](
                bucket_id="engineering-and-quality",
                serial_uri="core://contracts/mcp-demo",
            )
        )
        assert resolved["version"] == 1

        ev = json.loads(
            tools["ok_evaluate_node_checkpoint"](
                run_id="mcp-run-1",
                node_id="n1",
                action_role="LOCAL_PATCH",
                attempt=1,
                compute_lane="L1_EDGE_ECON",
                idempotency_key="mcp-idem-1",
                candidates_json=json.dumps(["def ok() -> int:\n    return 42\n"]),
            )
        )
        assert ev["decision"] == "COMMIT"

        fb = json.loads(
            tools["ok_record_human_feedback"](
                run_id="mcp-run-1",
                human_edit_ratio=0.05,
                reverted=False,
            )
        )
        assert fb["r_impl"] == pytest.approx(0.94, abs=1e-5)

        slow = json.loads(tools["ok_run_slow_loop_cycle"](bucket_id="engineering-and-quality", dry_run=True))
        assert slow["bucket_id"] == "engineering-and-quality"

        env1 = PromptStructureOptimizer.build_bifasic_envelope(["Kernel", "Policy"], ["Slice A"])
        env2 = PromptStructureOptimizer.build_bifasic_envelope(["Kernel", "Policy"], ["Slice B", "Error Delta"])
        assert env1["prefix_hash"] == env2["prefix_hash"]
        assert "Error Delta" not in env1["prefix"]
    finally:
        svc.close()


@pytest.mark.unit
def test_local_control_plane_latency_meets_p95_kpi() -> None:
    svc = ControlPlaneService(config=ControlPlaneConfig(db_path=":memory:"))
    try:
        bench = svc.benchmark_local_latency(iterations=30)
        assert bench["meets_kpi_p95_le_120ms"] is True
        assert bench["p95_ms"] <= 120.0
    finally:
        svc.close()
