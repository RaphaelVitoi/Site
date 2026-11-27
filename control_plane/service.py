"""Unified ControlPlaneService orchestrating all 7 deterministic control plane operations."""

from __future__ import annotations

from dataclasses import dataclass
import json
import time
from typing import Any

import numpy as np

from control_plane.cascade import CascadeAssessment, EvaluationCascade, MutatorOracleFn, TestOracleFn
from control_plane.config import (
    ActionRole,
    ArtifactKind,
    ComputeLane,
    ControlPlaneConfig,
    Modality,
    Z3Status,
)
from control_plane.equivalence import CandidateInput, EquivalenceEngine, LayaS1EntailmentScorer
from control_plane.slow_loop import ChallengerEvalFn, SlowLoopEngine
from control_plane.spectral import Embedder, SpaceProjector, build_default_embedder
from control_plane.storage import (
    ControlPlaneError,
    ControlPlaneStore,
    ReplayEpisodeInput,
    compute_sha256,
)
from control_plane.thermostat import Thermostat, ThermostatInput
from control_plane.z3_gate import Z3ConstraintGate
from core.skill_router import route_and_compile_skill_context

_ARTIFACT_POLARITY: dict[ArtifactKind, str] = {
    ArtifactKind.ANCHOR_POS: "positive",
    ArtifactKind.ANCHOR_NEG: "negative",
}


@dataclass(frozen=True, slots=True)
class CheckpointEvalOptions:
    """Optional scope, oracle, and underdetermination knobs for checkpoint evaluation."""

    target_files: list[str] | None = None
    allowed_files: list[str] | None = None
    has_formal_anchor_revision: bool = False
    unit_oracle: TestOracleFn | None = None
    blind_mutator: MutatorOracleFn | None = None
    missing_delta_crit: bool = False


@dataclass(frozen=True, slots=True)
class CheckpointTelemetry:
    """FinOps and prefix-cache token counters for a checkpoint invocation."""

    cost_usd: float = 0.0
    tokens_in: int = 0
    cached_tokens_in: int = 0
    tokens_out: int = 0


class ControlPlaneService:
    """High-level facade for the 7 NEXUS-OMNIKERNEL control plane endpoints."""

    def __init__(
        self,
        config: ControlPlaneConfig | None = None,
        *,
        embedder: Embedder | None = None,
        cascade: EvaluationCascade | None = None,
        equivalence: EquivalenceEngine | None = None,
    ) -> None:
        self.config = config or ControlPlaneConfig()
        self.store = ControlPlaneStore(self.config)
        self.store.initialize(seed_defaults=True)
        self.embedder = embedder or build_default_embedder(self.config)
        self.z3_gate = Z3ConstraintGate(timeout_ms=self.config.z3_timeout_ms)
        self.cascade = cascade or EvaluationCascade(z3_gate=self.z3_gate)
        default_equiv = (
            EquivalenceEngine(entailment_scorer=LayaS1EntailmentScorer())
            if self.config.enable_laya_s1
            else EquivalenceEngine()
        )
        self.equivalence = equivalence or default_equiv
        self.thermostat = Thermostat()
        self.slow_loop = SlowLoopEngine(self.store, self.config, embedder=self.embedder)

    def close(self) -> None:
        self.store.close()

    def register_canonical_artifact(
        self,
        *,
        bucket_id: str,
        serial_uri: str,
        kind: str,
        content: str,
        z3_constraints_json: str | None = None,
    ) -> dict[str, Any]:
        """Endpoint 1: Validate Z3 (SAT/SKIPPED), append bi-temporal version, and index anchors."""
        artifact_kind = ArtifactKind(kind)
        z3_res = self.z3_gate.verify_json(z3_constraints_json)
        if z3_res.status == Z3Status.UNSAT:
            return {
                "status": "BLOCKED",
                "error_code": "CONTRACT_UNSAT",
                "unsat_core": list(z3_res.unsat_core),
                "detail": z3_res.error_detail,
            }

        rec = self.store.register_artifact(
            bucket_id=bucket_id,
            serial_uri=serial_uri,
            artifact_kind=artifact_kind.value,
            content=content,
            z3_constraints_json=z3_constraints_json,
            z3_status=z3_res.status.value,
        )

        chunk_id: int | None = None
        if artifact_kind in {ArtifactKind.ANCHOR_POS, ArtifactKind.ANCHOR_NEG, ArtifactKind.ESS_STRATEGY}:
            polarity = _ARTIFACT_POLARITY.get(artifact_kind, "none")
            vec = self.embedder.embed(content)
            chunk_id = self.store.insert_semantic_chunk(
                bucket_id=bucket_id,
                record_id=rec.record_id,
                anchor_polarity=polarity,
                content_summary=content[:400],
                embedding=vec,
                model_id=self.embedder.model_id,
            )

        return {
            "status": "OK",
            "record_id": rec.record_id,
            "serial_uri": rec.serial_uri,
            "version": rec.version,
            "sha256": rec.sha256,
            "z3_status": rec.z3_status,
            "chunk_id": chunk_id,
        }

    def _seed_bucket_anti_goals_if_needed(self, bucket_id: str, anti_goals: list[str]) -> int:
        if not anti_goals or self.store.count_semantic_anchors(bucket_id, "negative") > 0:
            return 0
        seeded = 0
        for idx, text in enumerate(anti_goals):
            uri = f"anchor://neg/seed/{bucket_id}/{idx + 1}"
            rec = self.store.register_artifact(bucket_id, uri, ArtifactKind.ANCHOR_NEG.value, text)
            vec = self.embedder.embed(text)
            self.store.insert_semantic_chunk(
                bucket_id=bucket_id,
                record_id=rec.record_id,
                anchor_polarity="negative",
                content_summary=text[:400],
                embedding=vec,
                model_id=self.embedder.model_id,
            )
            seeded += 1
        return seeded

    def bootstrap_run_context(
        self,
        *,
        bucket_id: str,
        contract_uri: str,
        run_id: str,
        missing_delta_crit: list[str] | None = None,
        task_description: str = "",
        kernel_rules: str = "Serial-First O(1); Target Lock; Clean Regen.",
        session_id: str | None = None,
        conductor_vehicle: str | None = None,
        conductor_model: str | None = None,
    ) -> dict[str, Any]:
        """Endpoint 2: Resolve O(1) contract, seed anti-goals, route ICM skills, and lock prefix_hash."""
        if missing_delta_crit:
            return {
                "status": "BLOCKED",
                "error_code": "DELTA_CRIT_MISSING",
                "missing_variables": list(missing_delta_crit),
            }

        bucket = self.store.get_bucket(bucket_id)
        contract = self.store.resolve_serial(bucket_id, contract_uri)
        if contract.z3_status == Z3Status.UNSAT.value:
            return {
                "status": "BLOCKED",
                "error_code": "CONTRACT_UNSAT",
                "contract_record_id": contract.record_id,
            }

        anti_goals = [str(x) for x in bucket.policy.get("anti_goals", [])]
        seeded_neg = self._seed_bucket_anti_goals_if_needed(bucket_id, anti_goals)

        serial_map = self.store.list_active_serial_map(bucket_id)
        # Keep immutable prefix O(1) by scoping prefix serial map to the active contract and elite strategies
        prefix_serial_map = {
            uri: meta
            for uri, meta in serial_map.items()
            if uri == contract_uri or meta.get("artifact_kind") == ArtifactKind.ESS_STRATEGY.value
        }
        elite = self.store.get_active_elite(bucket_id, bucket.pareto_profile)
        elite_content = str(elite["content"]) if elite else "default-balanced-strategy"

        envelope = self.thermostat.build_clean_regen_envelope(
            kernel_rules=kernel_rules,
            policy_json=json.dumps(bucket.policy, sort_keys=True),
            serial_map_json=json.dumps(prefix_serial_map, sort_keys=True),
            active_elite_content=f"{contract.content}\n\n{elite_content}",
            node_slice=task_description or f"Bootstrap run {run_id}",
        )
        prefix_hash = envelope["prefix_hash"]

        self.store.create_workflow_run(
            run_id=run_id,
            bucket_id=bucket_id,
            contract_record_id=contract.record_id,
            prefix_hash=prefix_hash,
            session_id=session_id,
            conductor_vehicle=conductor_vehicle,
            conductor_model=conductor_model,
        )

        icm_packet = route_and_compile_skill_context(task_description, token_budget=1800) if task_description else None
        return {
            "status": "OK",
            "run_id": run_id,
            "bucket_id": bucket_id,
            "modality": bucket.modality,
            "pareto_profile": bucket.pareto_profile,
            "contract_record_id": contract.record_id,
            "contract_version": contract.version,
            "prefix_hash": prefix_hash,
            "immutable_prefix": envelope["prefix"],
            "serial_map": serial_map,
            "seeded_anti_goals": seeded_neg,
            "active_elite_uri": elite["serial_uri"] if elite else None,
            "icm_skills": list(icm_packet.selected_skills) if icm_packet else [],
        }

    def resolve_serial(
        self,
        *,
        bucket_id: str,
        serial_uri: str,
        as_of_timestamp: str | None = None,
    ) -> dict[str, Any]:
        """Endpoint 3: Exact O(1) lookup (current or historical) with SHA-256 verification."""
        rec = self.store.resolve_serial(bucket_id, serial_uri, as_of_timestamp=as_of_timestamp)
        return {
            "status": "OK",
            "record_id": rec.record_id,
            "serial_uri": rec.serial_uri,
            "bucket_id": rec.bucket_id,
            "artifact_kind": rec.artifact_kind,
            "version": rec.version,
            "sha256": rec.sha256,
            "content": rec.content,
            "z3_status": rec.z3_status,
            "valid_from": rec.valid_from,
            "valid_to": rec.valid_to,
        }

    def search_bucket_semantic(
        self,
        *,
        bucket_id: str,
        query: str,
        top_k: int = 5,
    ) -> dict[str, Any]:
        """Endpoint 4: Pre-filtered cosine similarity search strictly inside bucket_id."""
        self.store.get_bucket(bucket_id)
        q_vec = self.embedder.embed(query)
        matches = self.store.search_semantic_chunks(
            bucket_id,
            q_vec,
            top_k=top_k,
            model_id=self.embedder.model_id,
        )
        return {
            "status": "OK" if matches else "BUCKET_EMPTY",
            "bucket_id": bucket_id,
            "matches": [
                {
                    "chunk_id": m.chunk_id,
                    "record_id": m.record_id,
                    "anchor_polarity": m.anchor_polarity,
                    "content_summary": m.content_summary,
                    "similarity": round(m.similarity, 6),
                }
                for m in matches
            ],
        }

    @staticmethod
    def _replay_response(existing: dict[str, Any]) -> dict[str, Any]:
        return {
            "status": "IDEMPOTENT_REPLAY",
            "decision": existing["decision"],
            "checkpoint_id": existing["checkpoint_id"],
            "cascade_stage": existing["cascade_stage"],
            "v_det_passed": bool(existing["v_det_passed"]),
            "s_id": existing["s_id"],
            "s_viol": existing["s_viol"],
            "drift_score": existing["drift_score"],
            "error_delta": existing["error_delta"],
            "artifact_blob": existing["artifact_blob"],
        }

    def _evaluate_candidates(
        self,
        *,
        cascade_impl: EvaluationCascade,
        candidates: list[str],
        modality_enum: Modality,
        role_enum: ActionRole,
        contract_content: str,
        z3_constraints_json: str | None,
        opts: CheckpointEvalOptions,
    ) -> tuple[str, CascadeAssessment, list[CandidateInput]]:
        assessments: list[tuple[str, CascadeAssessment]] = []
        cand_inputs: list[CandidateInput] = []
        for cand_text in candidates or [""]:
            res = cascade_impl.evaluate(
                payload=cand_text,
                modality=modality_enum,
                action_role=role_enum,
                contract_content=contract_content,
                target_files=opts.target_files,
                allowed_files=opts.allowed_files,
                has_formal_anchor_revision=opts.has_formal_anchor_revision,
                z3_constraints_json=z3_constraints_json,
                unit_oracle=opts.unit_oracle,
            )
            assessments.append((cand_text, res))
            cand_inputs.append(CandidateInput(payload=cand_text, test_vector=res.test_vector))

        winning_idx = 0
        for idx, (_txt, assess) in enumerate(assessments):
            if assess.v_det_passed:
                winning_idx = idx
                break
            if assess.stage_dense_reward > assessments[winning_idx][1].stage_dense_reward:
                winning_idx = idx
        chosen_payload, chosen_assess = assessments[winning_idx]
        return chosen_payload, chosen_assess, cand_inputs

    @staticmethod
    def _next_run_status(decision: str) -> str:
        if decision == "COMMIT":
            return "COMMITTED"
        if decision == "CIRCUIT_BREAK":
            return "CIRCUIT_BROKEN"
        return "RUNNING"

    def _build_retry_envelope(
        self,
        *,
        bucket_id: str,
        pareto_profile: str,
        policy: dict[str, Any],
        contract_uri: str,
        contract_content: str,
        node_id: str,
        attempt: int,
        error_delta: str,
        inject_vs_schema: bool,
    ) -> dict[str, str]:
        elite = self.store.get_active_elite(bucket_id, pareto_profile)
        elite_content = str(elite["content"]) if elite else "default-balanced-strategy"
        full_map = self.store.list_active_serial_map(bucket_id)
        prefix_map = {
            uri: meta
            for uri, meta in full_map.items()
            if uri == contract_uri or meta.get("artifact_kind") == ArtifactKind.ESS_STRATEGY.value
        }
        return self.thermostat.build_clean_regen_envelope(
            kernel_rules="Serial-First O(1); Target Lock; Clean Regen.",
            policy_json=json.dumps(policy, sort_keys=True),
            serial_map_json=json.dumps(prefix_map, sort_keys=True),
            active_elite_content=f"{contract_content}\n\n{elite_content}",
            node_slice=f"Retry node {node_id} (attempt {attempt + 1})",
            error_delta=error_delta,
            inject_vs_schema=inject_vs_schema,
        )

    def evaluate_node_checkpoint(
        self,
        *,
        run_id: str,
        node_id: str,
        action_role: str,
        attempt: int,
        compute_lane: str,
        idempotency_key: str,
        candidates: list[str],
        options: CheckpointEvalOptions | None = None,
        telemetry: CheckpointTelemetry | None = None,
    ) -> dict[str, Any]:
        """Endpoint 5: Double-idempotent Cascade + SPACE + Equivalence + CRC + Thermostat."""
        t_start = time.perf_counter()
        opts = options or CheckpointEvalOptions()
        tele = telemetry or CheckpointTelemetry()

        existing = self.store.get_checkpoint_by_idempotency_key(idempotency_key)
        if existing is not None:
            return self._replay_response(existing)

        run = self.store.get_workflow_run(run_id)
        bucket_id = str(run["bucket_id"])
        bucket = self.store.get_bucket(bucket_id)
        contract = self.store.get_record_by_id(int(run["contract_record_id"]))
        if contract is None:
            raise ControlPlaneError("CONTRACT_NOT_FOUND", "Referenced contract record missing.")

        role_enum = ActionRole(action_role)
        lane_enum = ComputeLane(compute_lane)
        modality_enum = Modality(bucket.modality)
        calibration = self.store.get_crc_calibration(bucket_id, role_enum.value)

        prev_ckpt = self.store.get_latest_node_checkpoint(run_id, node_id)
        prev_error_hash = str(prev_ckpt["error_hash"]) if prev_ckpt and prev_ckpt.get("error_hash") else None

        cascade_impl = (
            EvaluationCascade(z3_gate=self.z3_gate, blind_mutator=opts.blind_mutator)
            if opts.blind_mutator is not None
            else self.cascade
        )
        chosen_payload, chosen_assess, cand_inputs = self._evaluate_candidates(
            cascade_impl=cascade_impl,
            candidates=candidates,
            modality_enum=modality_enum,
            role_enum=role_enum,
            contract_content=contract.content,
            z3_constraints_json=contract.z3_constraints_json,
            opts=opts,
        )

        equiv = self.equivalence.evaluate(cand_inputs, modality_enum)
        pos_mat, neg_mat = self.store.get_anchor_embeddings(
            bucket_id,
            dim=self.embedder.dim,
            model_id=self.embedder.model_id,
        )
        projector = SpaceProjector(
            pos_mat,
            neg_mat,
            max_rank=self.config.space_max_rank,
            min_pos_anchors=self.config.space_min_pos_anchors,
        )
        space = projector.score(self.embedder.embed(chosen_payload))

        thermo = self.thermostat.decide(
            ThermostatInput(
                attempt=attempt,
                max_retries=bucket.max_retries,
                cumulative_cost_usd=float(run["total_cost_usd"]) + float(tele.cost_usd),
                max_cost_usd=bucket.max_cost_usd,
                current_lane=lane_enum,
                v_det_passed=chosen_assess.v_det_passed,
                z3_status=chosen_assess.z3_status,
                error_hash=chosen_assess.error_hash,
                prev_error_hash=prev_error_hash,
                candidate_count=len(candidates),
                convergence_score=equiv.convergence_score,
                s_id=space.s_id,
                s_viol=space.s_viol,
                drift_score=space.drift_score,
                cold_start_pos_guard=space.cold_start_pos_guard,
                calibration=calibration,
                missing_delta_crit=opts.missing_delta_crit,
            )
        )

        elapsed_ms = max(1, int(round((time.perf_counter() - t_start) * 1000.0)))
        ckpt_id = self.store.insert_checkpoint(
            {
                "idempotency_key": idempotency_key,
                "run_id": run_id,
                "node_id": node_id,
                "action_role": role_enum.value,
                "attempt": attempt,
                "compute_lane": lane_enum.value,
                "strategy_record_id": None,
                "cascade_stage": chosen_assess.cascade_stage.value,
                "v_det_passed": chosen_assess.v_det_passed,
                "z3_status": chosen_assess.z3_status.value,
                "error_hash": chosen_assess.error_hash,
                "error_delta": chosen_assess.error_delta,
                "equiv_metric_kind": equiv.metric_kind.value,
                "convergence_score": equiv.convergence_score,
                "s_id": space.s_id,
                "s_viol": space.s_viol,
                "drift_score": space.drift_score,
                "stage_dense_reward": chosen_assess.stage_dense_reward,
                "cost_usd": tele.cost_usd,
                "latency_ms": elapsed_ms,
                "artifact_blob": chosen_payload,
                "decision": thermo.decision.value,
            }
        )

        self.store.update_workflow_run_stats(
            run_id,
            status=self._next_run_status(thermo.decision.value),
            add_tokens_in=tele.tokens_in,
            add_cached_tokens_in=tele.cached_tokens_in,
            add_tokens_out=tele.tokens_out,
            add_cost_usd=tele.cost_usd,
        )

        local_reward = round(chosen_assess.stage_dense_reward - 0.15 * float(tele.cost_usd), 6)
        trace_summary = (
            f"node={node_id} attempt={attempt} stage={chosen_assess.cascade_stage.value} "
            f"v_det={chosen_assess.v_det_passed} decision={thermo.decision.value} "
            f"err={chosen_assess.error_delta or 'none'}"
        )
        self.store.append_replay_episode(
            ReplayEpisodeInput(
                run_id=run_id,
                bucket_id=bucket_id,
                node_id=node_id,
                action_role=role_enum.value,
                strategy_record_id=None,
                step_index=attempt,
                v_det_passed=chosen_assess.v_det_passed,
                drift_score=space.drift_score,
                dense_reward=local_reward,
                trace_summary=trace_summary,
            )
        )

        envelope = None
        if thermo.decision.value in {"REGENERATE_CLEAN", "INJECT_ASYMMETRY", "REJECT_DRIFT"}:
            envelope = self._build_retry_envelope(
                bucket_id=bucket_id,
                pareto_profile=bucket.pareto_profile,
                policy=bucket.policy,
                contract_uri=contract.serial_uri,
                contract_content=contract.content,
                node_id=node_id,
                attempt=attempt,
                error_delta=chosen_assess.error_delta or thermo.reason,
                inject_vs_schema=thermo.verbalized_sampling_schema is not None,
            )

        return {
            "status": "OK",
            "checkpoint_id": ckpt_id,
            "run_id": run_id,
            "node_id": node_id,
            "decision": thermo.decision.value,
            "next_lane": thermo.next_lane.value,
            "enable_mutator": thermo.enable_mutator,
            "reason": thermo.reason,
            "cascade_stage": chosen_assess.cascade_stage.value,
            "v_det_passed": chosen_assess.v_det_passed,
            "z3_status": chosen_assess.z3_status.value,
            "equiv_metric_kind": equiv.metric_kind.value,
            "convergence_score": equiv.convergence_score,
            "s_id": space.s_id,
            "s_viol": space.s_viol,
            "drift_score": space.drift_score,
            "cold_start_pos_guard": space.cold_start_pos_guard,
            "error_delta": chosen_assess.error_delta,
            "latency_ms": elapsed_ms,
            "verbalized_sampling_schema": thermo.verbalized_sampling_schema,
            "clean_regen_envelope": envelope,
        }

    def record_human_feedback(
        self,
        *,
        run_id: str,
        human_edit_ratio: float,
        reverted: bool = False,
        trace_delta: str | None = None,
    ) -> dict[str, Any]:
        """Endpoint 6: Record implicit feedback and backpropagate n-step credit."""
        return self.slow_loop.record_human_feedback(
            run_id=run_id,
            human_edit_ratio=human_edit_ratio,
            reverted=reverted,
            trace_delta=trace_delta,
        )

    def run_slow_loop_cycle(
        self,
        *,
        bucket_id: str,
        top_k_per: int = 5,
        dry_run: bool = False,
        tier0_present: bool = False,
        challenger_evaluator: ChallengerEvalFn | None = None,
    ) -> dict[str, Any]:
        """Endpoint 7: Offline CRC recalibration, SPACE update, D_crit, and GEPA/MAP-Elites."""
        return self.slow_loop.run_cycle(
            bucket_id=bucket_id,
            top_k_per=top_k_per,
            dry_run=dry_run,
            tier0_present=tier0_present,
            challenger_evaluator=challenger_evaluator,
        )

    def benchmark_local_latency(self, *, iterations: int = 40) -> dict[str, Any]:
        """Measure pure CPU local control-plane latency (p50, p95, mean ms)."""
        bucket_id = "engineering-and-quality"
        contract_uri = "core://benchmark/contract-v1"
        self.register_canonical_artifact(
            bucket_id=bucket_id,
            serial_uri=contract_uri,
            kind=ArtifactKind.CONTRACT.value,
            content="def solve(x: int) -> int: return x + 1",
        )
        latencies_ms: list[float] = []
        for i in range(max(5, iterations)):
            rid = f"bench-run-{i}-{compute_sha256(str(time.perf_counter()))[:8]}"
            self.bootstrap_run_context(bucket_id=bucket_id, contract_uri=contract_uri, run_id=rid)
            t0 = time.perf_counter()
            self.evaluate_node_checkpoint(
                run_id=rid,
                node_id="n1",
                action_role=ActionRole.LOCAL_PATCH.value,
                attempt=1,
                compute_lane=ComputeLane.L1_EDGE_ECON.value,
                idempotency_key=f"bench-idem-{rid}",
                candidates=["def solve(x: int) -> int:\n    return x + 1\n"],
            )
            latencies_ms.append((time.perf_counter() - t0) * 1000.0)

        arr = np.asarray(latencies_ms, dtype=np.float64)
        return {
            "iterations": len(latencies_ms),
            "p50_ms": round(float(np.percentile(arr, 50)), 3),
            "p95_ms": round(float(np.percentile(arr, 95)), 3),
            "mean_ms": round(float(np.mean(arr)), 3),
            "max_ms": round(float(np.max(arr)), 3),
            "meets_kpi_p95_le_120ms": bool(float(np.percentile(arr, 95)) <= 120.0),
        }
