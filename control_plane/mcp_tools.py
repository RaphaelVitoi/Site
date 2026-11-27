"""FastMCP tool registration for the 7 closed NEXUS-OMNIKERNEL endpoints."""

from __future__ import annotations

from collections.abc import Callable
import json
import logging
from typing import Any

from control_plane.config import ControlPlaneConfig
from control_plane.service import CheckpointEvalOptions, CheckpointTelemetry, ControlPlaneService
from control_plane.storage import ControlPlaneError

logger = logging.getLogger(__name__)

_DEFAULT_SERVICE: ControlPlaneService | None = None


def get_control_plane_service(config: ControlPlaneConfig | None = None) -> ControlPlaneService:
    """Return singleton ControlPlaneService unless an explicit config is passed."""
    global _DEFAULT_SERVICE  # noqa: PLW0603
    if config is not None:
        return ControlPlaneService(config=config)
    if _DEFAULT_SERVICE is None:
        _DEFAULT_SERVICE = ControlPlaneService()
    return _DEFAULT_SERVICE


def _serialize_error(exc: Exception) -> str:
    if isinstance(exc, ControlPlaneError):
        return json.dumps(
            {"status": "ERROR", "error_code": exc.code, "message": exc.message, "details": exc.details},
            indent=2,
            ensure_ascii=True,
        )
    logger.error("Control plane tool error: %s", exc)
    return json.dumps({"status": "ERROR", "message": str(exc)}, indent=2, ensure_ascii=True)


def _safe_tool_json(fn: Callable[[], dict[str, Any]]) -> str:
    try:
        return json.dumps(fn(), indent=2, ensure_ascii=True)
    except Exception as exc:  # noqa: BLE001
        return _serialize_error(exc)


def _handle_bootstrap(
    svc: ControlPlaneService,
    bucket_id: str,
    contract_uri: str,
    run_id: str,
    task_description: str,
    missing_delta_crit_json: str,
) -> dict[str, Any]:
    missing = json.loads(missing_delta_crit_json) if missing_delta_crit_json.strip() else []
    return svc.bootstrap_run_context(
        bucket_id=bucket_id,
        contract_uri=contract_uri,
        run_id=run_id,
        task_description=task_description,
        missing_delta_crit=missing if isinstance(missing, list) else [],
    )


def _handle_evaluate_checkpoint(
    svc: ControlPlaneService,
    *,
    run_id: str,
    node_id: str,
    action_role: str,
    attempt: int,
    compute_lane: str,
    idempotency_key: str,
    candidates_json: str,
    target_files_json: str,
    cost_usd: float,
) -> dict[str, Any]:
    cands = json.loads(candidates_json)
    tfiles = json.loads(target_files_json) if target_files_json.strip() else []
    return svc.evaluate_node_checkpoint(
        run_id=run_id,
        node_id=node_id,
        action_role=action_role,
        attempt=attempt,
        compute_lane=compute_lane,
        idempotency_key=idempotency_key,
        candidates=[str(c) for c in cands] if isinstance(cands, list) else [str(cands)],
        options=CheckpointEvalOptions(target_files=[str(f) for f in tfiles] if isinstance(tfiles, list) else []),
        telemetry=CheckpointTelemetry(cost_usd=cost_usd),
    )


def register_control_plane_tools(server: Any, service: ControlPlaneService | None = None) -> dict[str, Any]:
    """Register the 7 closed ok_* tools on the given MCPServer/FastMCP instance."""

    def _svc() -> ControlPlaneService:
        return service or get_control_plane_service()

    @server.tool(
        name="ok_register_canonical_artifact",
        description="Registers a bi-temporal canonical artifact with SHA-256 and optional SMT/Z3 consistency gate.",
    )
    def ok_register_canonical_artifact(
        bucket_id: str,
        serial_uri: str,
        kind: str,
        content: str,
        z3_constraints_json: str = "",
    ) -> str:
        return _safe_tool_json(
            lambda: _svc().register_canonical_artifact(
                bucket_id=bucket_id,
                serial_uri=serial_uri,
                kind=kind,
                content=content,
                z3_constraints_json=z3_constraints_json or None,
            )
        )

    @server.tool(
        name="ok_bootstrap_run_context",
        description="Bootstraps a workflow run with O(1) contract lookup, ICM skill routing, and locked prefix_hash.",
    )
    def ok_bootstrap_run_context(
        bucket_id: str,
        contract_uri: str,
        run_id: str,
        task_description: str = "",
        missing_delta_crit_json: str = "[]",
    ) -> str:
        return _safe_tool_json(
            lambda: _handle_bootstrap(
                _svc(), bucket_id, contract_uri, run_id, task_description, missing_delta_crit_json
            )
        )

    @server.tool(
        name="ok_resolve_serial",
        description="Exact O(1) bi-temporal artifact lookup by serial_uri with mandatory SHA-256 verification.",
    )
    def ok_resolve_serial(bucket_id: str, serial_uri: str, as_of_timestamp: str = "") -> str:
        return _safe_tool_json(
            lambda: _svc().resolve_serial(
                bucket_id=bucket_id,
                serial_uri=serial_uri,
                as_of_timestamp=as_of_timestamp or None,
            )
        )

    @server.tool(
        name="ok_search_bucket_semantic",
        description="Pre-filtered semantic discovery strictly partitioned inside bucket_id and active TTL.",
    )
    def ok_search_bucket_semantic(bucket_id: str, query: str, top_k: int = 5) -> str:
        return _safe_tool_json(lambda: _svc().search_bucket_semantic(bucket_id=bucket_id, query=query, top_k=top_k))

    @server.tool(
        name="ok_evaluate_node_checkpoint",
        description="Evaluates candidates via Cascade, SPACE SVD, Hybrid Equivalence, CRC, and Thermostat Pi_epsilon.",
    )
    def ok_evaluate_node_checkpoint(
        run_id: str,
        node_id: str,
        action_role: str,
        attempt: int,
        compute_lane: str,
        idempotency_key: str,
        candidates_json: str,
        target_files_json: str = "[]",
        cost_usd: float = 0.0,
    ) -> str:
        return _safe_tool_json(
            lambda: _handle_evaluate_checkpoint(
                _svc(),
                run_id=run_id,
                node_id=node_id,
                action_role=action_role,
                attempt=attempt,
                compute_lane=compute_lane,
                idempotency_key=idempotency_key,
                candidates_json=candidates_json,
                target_files_json=target_files_json,
                cost_usd=cost_usd,
            )
        )

    @server.tool(
        name="ok_record_human_feedback",
        description="Records human_edit_ratio and revert status, backpropagating n-step returns into PER.",
    )
    def ok_record_human_feedback(
        run_id: str,
        human_edit_ratio: float,
        reverted: bool = False,
        trace_delta: str = "",
    ) -> str:
        return _safe_tool_json(
            lambda: _svc().record_human_feedback(
                run_id=run_id,
                human_edit_ratio=human_edit_ratio,
                reverted=reverted,
                trace_delta=trace_delta or None,
            )
        )

    @server.tool(
        name="ok_run_slow_loop_cycle",
        description="Runs offline CRC recalibration, SPACE update, D_crit crystallization, and GEPA/MAP-Elites.",
    )
    def ok_run_slow_loop_cycle(
        bucket_id: str,
        top_k_per: int = 5,
        dry_run: bool = False,
        tier0_present: bool = False,
    ) -> str:
        return _safe_tool_json(
            lambda: _svc().run_slow_loop_cycle(
                bucket_id=bucket_id,
                top_k_per=top_k_per,
                dry_run=dry_run,
                tier0_present=tier0_present,
            )
        )

    return {
        "ok_register_canonical_artifact": ok_register_canonical_artifact,
        "ok_bootstrap_run_context": ok_bootstrap_run_context,
        "ok_resolve_serial": ok_resolve_serial,
        "ok_search_bucket_semantic": ok_search_bucket_semantic,
        "ok_evaluate_node_checkpoint": ok_evaluate_node_checkpoint,
        "ok_record_human_feedback": ok_record_human_feedback,
        "ok_run_slow_loop_cycle": ok_run_slow_loop_cycle,
    }
