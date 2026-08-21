"""
Testes unitarios para a malha de subagentes SOTA v7.0 GOLD (core/subagents_mesh.py).
"""

import pytest

from core.schemas import Task
from core.subagents_mesh import (
    SubagentMeshController,
    SubagentMissionRequest,
    SubagentMissionResult,
    SubagentTier,
    subagents_mesh,
)


@pytest.mark.asyncio
async def test_subagents_mesh_routing_heuristics():
    controller = SubagentMeshController()

    task_sec = Task(
        id="T_SEC",
        description="Audit for CWE-22 and token leak",
        agent="@securitychief",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_sec) == SubagentTier.APPSEC

    task_math = Task(
        id="T_MATH",
        description="Calculate PMev and Nash equilibrium",
        agent="@validador",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_math) == SubagentTier.MATH

    task_wasm = Task(
        id="T_WASM",
        description="Optimize WASM zero-copy memory buffer",
        agent="@implementor",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_wasm) == SubagentTier.WASM

    task_ui = Task(
        id="T_UI",
        description="Refine HSL CSS layout and component design",
        agent="@curator",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_ui) == SubagentTier.UI

    task_rsrch = Task(
        id="T_RSRCH",
        description="Investigate deep research docs and state of the art",
        agent="@pesquisador",
        timestamp="2026-08-18T13:50:00Z",
    )
    assert controller.route_task_to_subagent(task_rsrch) == SubagentTier.RESEARCH

    task_gen = Task(
        id="T_GEN", description="General system maintenance routine", agent="@chico", timestamp="2026-08-18T13:50:00Z"
    )
    assert controller.route_task_to_subagent(task_gen) == SubagentTier.SELF


@pytest.mark.asyncio
async def test_subagents_mesh_execution_pipeline():
    controller = SubagentMeshController()
    req = SubagentMissionRequest(
        mission_id="M_APPSEC_01",
        tier=SubagentTier.APPSEC,
        prompt="Audit core/config.py for path traversal",
        target_files=["core/config.py"],
    )

    res = await controller.execute_subagent_pipeline(req)

    assert isinstance(res, SubagentMissionResult)
    assert res.status == "SUCCESS"
    assert res.tier == SubagentTier.APPSEC
    assert res.mission_id == "M_APPSEC_01"
    assert "core/config.py" in res.files_modified
    assert res.execution_time_ms > 0
    assert "M_APPSEC_01" in controller.completed_missions
    assert "M_APPSEC_01" not in controller.active_missions


@pytest.mark.asyncio
async def test_subagents_mesh_singleton_import():
    assert subagents_mesh is not None
    assert isinstance(subagents_mesh, SubagentMeshController)
