"""Closed-loop deterministic Thermostat (Pi_epsilon), Verbalized Sampling, and Clean Envelope."""

from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from control_plane.config import ComputeLane, ThermostatDecision, Z3Status
from control_plane.storage import CrcCalibrationRecord
from core.sota_context_engine import PromptStructureOptimizer


class VerbalizedSamplingHypothesis(BaseModel):
    """Tail-distribution orthogonal hypothesis emitted in 1x cached prefix call."""

    model_config = ConfigDict(extra="forbid")

    strategy_id: str = Field(min_length=1)
    estimated_p: float = Field(ge=0.01, le=0.25)
    structural_divergence: str = Field(min_length=3)
    payload: str = Field(min_length=1)

    @field_validator("payload", mode="before")
    @classmethod
    def _coerce_payload_to_str(cls, value: Any) -> str:
        if isinstance(value, dict | list):
            return json.dumps(value, ensure_ascii=True)
        return str(value)


class VerbalizedSamplingResponse(BaseModel):
    """Constrained decoding schema for INJECT_ASYMMETRY."""

    model_config = ConfigDict(extra="forbid")

    hypotheses: list[VerbalizedSamplingHypothesis] = Field(min_length=2, max_length=3)


def get_verbalized_sampling_schema() -> dict[str, Any]:
    """Export JSON Schema for Verbalized Sampling constrained decoding."""
    return VerbalizedSamplingResponse.model_json_schema()


@dataclass(frozen=True, slots=True)
class ThermostatInput:
    attempt: int
    max_retries: int
    cumulative_cost_usd: float
    max_cost_usd: float
    current_lane: ComputeLane
    v_det_passed: bool
    z3_status: Z3Status
    error_hash: str | None
    prev_error_hash: str | None
    candidate_count: int
    convergence_score: float
    s_id: float
    s_viol: float
    drift_score: float
    cold_start_pos_guard: bool
    calibration: CrcCalibrationRecord
    missing_delta_crit: bool = False


@dataclass(frozen=True, slots=True)
class ThermostatOutput:
    decision: ThermostatDecision
    next_lane: ComputeLane
    enable_mutator: bool
    reason: str
    verbalized_sampling_schema: dict[str, Any] | None = None


def escalate_compute_lane(lane: ComputeLane) -> ComputeLane:
    """Escalate by one lane up to L2_FRONTIER."""
    if lane == ComputeLane.L0_DET:
        return ComputeLane.L1_EDGE_ECON
    if lane == ComputeLane.L1_EDGE_ECON:
        return ComputeLane.L2_FRONTIER
    return ComputeLane.L2_FRONTIER


class Thermostat:
    """Deterministic closed-loop controller Pi_epsilon."""

    @staticmethod
    def build_clean_regen_envelope(
        *,
        kernel_rules: str,
        policy_json: str,
        serial_map_json: str,
        active_elite_content: str,
        node_slice: str,
        resolved_serials: str = "",
        error_delta: str = "",
        inject_vs_schema: bool = False,
    ) -> dict[str, str]:
        """Build O(1) Clean Regeneration envelope delegating to PromptStructureOptimizer."""
        prefix_parts = [
            f"[KERNEL_RULES]\n{kernel_rules.strip()}",
            f"[BUCKET_POLICY]\n{policy_json.strip()}",
            f"[SERIAL_MAP_O1]\n{serial_map_json.strip()}",
            f"[ACTIVE_ELITE_STRATEGY]\n{active_elite_content.strip()}",
        ]
        suffix_parts = [f"[NODE_SLICE]\n{node_slice.strip()}"]
        if resolved_serials.strip():
            suffix_parts.append(f"[RESOLVED_SERIALS]\n{resolved_serials.strip()}")
        if error_delta.strip():
            suffix_parts.append(f"[ERROR_DELTA]\n{error_delta.strip()}")
        if inject_vs_schema:
            suffix_parts.append(f"[VERBALIZED_SAMPLING_SCHEMA]\n{get_verbalized_sampling_schema()}")

        return PromptStructureOptimizer.build_bifasic_envelope(prefix_parts, suffix_parts)

    def decide(self, state: ThermostatInput) -> ThermostatOutput:
        # 1. Explicit underdetermination or Step-0 UNSAT
        if state.missing_delta_crit or (
            state.z3_status == Z3Status.UNSAT and state.attempt == 1 and not state.v_det_passed
        ):
            return ThermostatOutput(
                decision=ThermostatDecision.CIRCUIT_BREAK,
                next_lane=state.current_lane,
                enable_mutator=False,
                reason="Explicit underdetermination (missing_delta_crit) or UNSAT contract invariant.",
            )

        cal = state.calibration
        drift_ok = state.drift_score <= (1.0 - cal.lambda_unified + 1e-12)
        viol_ok = state.s_viol <= (cal.lambda_viol_max + 1e-12)
        id_ok = True if state.cold_start_pos_guard else (state.s_id >= cal.lambda_id_min - 1e-12)

        # 2. Passed deterministic cascade
        if state.v_det_passed:
            if drift_ok and viol_ok and id_ok:
                return ThermostatOutput(
                    decision=ThermostatDecision.COMMIT,
                    next_lane=state.current_lane,
                    enable_mutator=False,
                    reason="Deterministic cascade and CRC/SPACE conformal bounds satisfied.",
                )
            if state.attempt >= state.max_retries:
                return ThermostatOutput(
                    decision=ThermostatDecision.CIRCUIT_BREAK,
                    next_lane=state.current_lane,
                    enable_mutator=False,
                    reason="SPACE/CRC drift persisted at max_retries; circuit broken.",
                )
            return ThermostatOutput(
                decision=ThermostatDecision.REJECT_DRIFT,
                next_lane=state.current_lane,
                enable_mutator=False,
                reason=(
                    f"Drift rejected (s_id={state.s_id:.3f}, s_viol={state.s_viol:.3f}, "
                    f"drift={state.drift_score:.3f}, lambda={cal.lambda_unified:.3f})."
                ),
            )

        # 3. Failed deterministic cascade: check budget / retry / semantic divergence breakers
        if state.attempt >= state.max_retries:
            return ThermostatOutput(
                decision=ThermostatDecision.CIRCUIT_BREAK,
                next_lane=state.current_lane,
                enable_mutator=False,
                reason=f"Max retries ({state.max_retries}) reached at failed deterministic check.",
            )
        if state.cumulative_cost_usd >= state.max_cost_usd:
            return ThermostatOutput(
                decision=ThermostatDecision.CIRCUIT_BREAK,
                next_lane=state.current_lane,
                enable_mutator=False,
                reason=f"FinOps budget ceiling reached ({state.cumulative_cost_usd:.4f} >= {state.max_cost_usd:.4f}).",
            )
        if state.candidate_count >= 2 and state.convergence_score < cal.conv_low_threshold:
            return ThermostatOutput(
                decision=ThermostatDecision.CIRCUIT_BREAK,
                next_lane=state.current_lane,
                enable_mutator=False,
                reason=f"High candidate entropy (convergence={state.convergence_score:.3f} < {cal.conv_low_threshold:.3f}).",
            )

        # 4. Stagnation / mode collapse detection -> Inject Asymmetry via Verbalized Sampling
        repeated_error = (
            state.error_hash is not None
            and state.prev_error_hash is not None
            and state.error_hash == state.prev_error_hash
        )
        converged_wrong = state.candidate_count >= 2 and state.convergence_score >= cal.conv_high_threshold
        if repeated_error or converged_wrong:
            next_lane = escalate_compute_lane(state.current_lane)
            return ThermostatOutput(
                decision=ThermostatDecision.INJECT_ASYMMETRY,
                next_lane=next_lane,
                enable_mutator=True,
                reason="Mode collapse or repeated identical error detected; escalating lane and injecting Verbalized Sampling.",
                verbalized_sampling_schema=get_verbalized_sampling_schema(),
            )

        # 5. Novel actionable deterministic error -> Clean Regeneration O(1)
        return ThermostatOutput(
            decision=ThermostatDecision.REGENERATE_CLEAN,
            next_lane=state.current_lane,
            enable_mutator=False,
            reason="Novel deterministic failure delta; regenerating with clean O(1) envelope.",
        )
