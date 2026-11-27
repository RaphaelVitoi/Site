"""Offline Slow Loop: n-step PER credit assignment, D_crit crystallization, GEPA, and MAP-Elites 3D."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from control_plane.config import ActionRole, ArtifactKind, CalibrationMode, ControlPlaneConfig
from control_plane.crc import ConformalRiskController, CrcCalibrationOutcome
from control_plane.spectral import Embedder, SpaceProjector, build_default_embedder
from control_plane.storage import ControlPlaneStore
from memory.replay_buffer import PrioritizedReplayMemory

ChallengerEvalFn = Callable[[str, list[str]], dict[str, Any]]


@dataclass(frozen=True, slots=True)
class ParetoCandidateMetrics:
    strategy_uri: str
    strategy_content: str
    niche_id: str
    mean_quality: float
    mean_cost_usd: float
    mean_latency_ms: float
    dcrit_passed_count: int
    dcrit_total_count: int


def is_pareto_dominated(
    candidate: ParetoCandidateMetrics,
    incumbent: dict[str, Any] | None,
) -> bool:
    """Return True if incumbent strictly dominates or equals candidate on all 3 objectives."""
    if incumbent is None:
        return False
    inc_q = float(incumbent["mean_quality"])
    inc_c = float(incumbent["mean_cost_usd"])
    inc_l = float(incumbent["mean_latency_ms"])
    # Maximize quality, minimize cost, minimize latency
    no_worse = (
        inc_q >= candidate.mean_quality and inc_c <= candidate.mean_cost_usd and inc_l <= candidate.mean_latency_ms
    )
    strictly_better = (
        inc_q > candidate.mean_quality or inc_c < candidate.mean_cost_usd or inc_l < candidate.mean_latency_ms
    )
    return no_worse and strictly_better


class SlowLoopEngine:
    """Offline evolutionary cycle decoupled from interactive fast-loop latency."""

    def __init__(
        self,
        store: ControlPlaneStore,
        config: ControlPlaneConfig,
        *,
        embedder: Embedder | None = None,
    ) -> None:
        self.store = store
        self.config = config
        self.embedder = embedder or build_default_embedder(config)
        self.crc = ConformalRiskController(store, config)

    @staticmethod
    def compute_implicit_reward(human_edit_ratio: float, reverted: bool) -> float:
        raw = 1.0 - 1.2 * max(0.0, min(1.0, human_edit_ratio)) - (1.0 if reverted else 0.0)
        return round(max(-1.0, min(1.0, raw)), 6)

    def record_human_feedback(
        self,
        *,
        run_id: str,
        human_edit_ratio: float,
        reverted: bool,
        trace_delta: str | None = None,
    ) -> dict[str, Any]:
        """Compute r_impl, backpropagate n-step returns G_t^(n), and update PER priorities."""
        run = self.store.get_workflow_run(run_id)
        episodes = self.store.get_run_episodes(run_id)
        r_impl = self.compute_implicit_reward(human_edit_ratio, reverted)
        gamma = self.config.gamma_step

        if not episodes:
            return {
                "run_id": run_id,
                "bucket_id": run["bucket_id"],
                "r_impl": r_impl,
                "episodes_updated": 0,
                "trace_delta": trace_delta,
            }

        running_return = r_impl
        updates: list[tuple[int, float, float, float, int]] = []
        for idx in range(len(episodes) - 1, -1, -1):
            ep = episodes[idx]
            local_r = float(ep["dense_reward"])
            g_t = local_r + r_impl if idx == len(episodes) - 1 else local_r + gamma * running_return
            running_return = g_t
            v_hat = float(ep.get("predicted_value", 0.5))
            prio = round(abs(g_t - v_hat) + 1e-4, 6)
            updates.append((int(ep["episode_id"]), round(g_t, 6), prio, float(human_edit_ratio), int(reverted)))

        updates.reverse()
        self.store.update_episode_returns(updates)

        return {
            "run_id": run_id,
            "bucket_id": run["bucket_id"],
            "r_impl": r_impl,
            "episodes_updated": len(updates),
            "terminal_return": updates[-1][1],
            "trace_delta": trace_delta,
        }

    @staticmethod
    def _hydrate_per_memory(top_episodes: list[dict[str, Any]]) -> PrioritizedReplayMemory:
        per_memory = PrioritizedReplayMemory(capacity=max(64, len(top_episodes) * 2), seed=42)
        for ep in top_episodes:
            per_memory.push(
                ep["node_id"],
                ep["action_role"],
                float(ep["n_step_return"]),
                ep["run_id"],
                True,
                {"episode_id": ep["episode_id"]},
            )
        return per_memory

    def _crystallize_episodes(
        self,
        bucket_id: str,
        top_episodes: list[dict[str, Any]],
        *,
        dry_run: bool,
    ) -> tuple[list[str], list[str]]:
        crystallized_uris: list[str] = []
        crystallized_ids: list[int] = []
        trace_lines: list[str] = []
        for ep in top_episodes:
            ep_id = int(ep["episode_id"])
            summary = str(ep["trace_summary"])
            trace_lines.append(f"[ep={ep_id} node={ep['node_id']} ret={ep['n_step_return']}] {summary}")
            edit_ratio_raw = ep.get("human_edit_ratio")
            edit_ratio = float(edit_ratio_raw) if isinstance(edit_ratio_raw, int | float) else 0.0
            silent_hack = int(ep["v_det_passed"]) == 1 and (int(ep["reverted"]) == 1 or edit_ratio > 0.35)
            severe_fail = int(ep["v_det_passed"]) == 0 or float(ep["n_step_return"]) < 0.4
            if dry_run or not (silent_hack or severe_fail):
                continue

            rec = self.store.register_artifact(
                bucket_id, f"dcrit://{bucket_id}/ep-{ep_id}", ArtifactKind.TEST_CASE.value, summary
            )
            crystallized_uris.append(rec.serial_uri)
            crystallized_ids.append(ep_id)
            if silent_hack:
                neg_rec = self.store.register_artifact(
                    bucket_id,
                    f"anchor://neg/{bucket_id}/ep-{ep_id}",
                    ArtifactKind.ANCHOR_NEG.value,
                    summary,
                )
                self.store.insert_semantic_chunk(
                    bucket_id=bucket_id,
                    record_id=neg_rec.record_id,
                    anchor_polarity="negative",
                    content_summary=summary[:300],
                    embedding=self.embedder.embed(summary),
                    model_id=self.embedder.model_id,
                )

        if crystallized_ids and not dry_run:
            self.store.mark_episodes_crystallized(crystallized_ids)
        return crystallized_uris, trace_lines

    def _evaluate_gepa_challenger(
        self,
        *,
        bucket_id: str,
        default_niche: str,
        top_episodes: list[dict[str, Any]],
        dcrit_contents: list[str],
        trace_lines: list[str],
        challenger_evaluator: ChallengerEvalFn,
        tier0_present: bool,
        dry_run: bool,
    ) -> tuple[str | None, str | None, int | None]:
        raw_eval = challenger_evaluator(bucket_id, dcrit_contents)
        cand = ParetoCandidateMetrics(
            strategy_uri=str(raw_eval["strategy_uri"]),
            strategy_content=str(raw_eval["strategy_content"]),
            niche_id=str(raw_eval.get("niche_id", default_niche)),
            mean_quality=float(raw_eval["mean_quality"]),
            mean_cost_usd=float(raw_eval["mean_cost_usd"]),
            mean_latency_ms=float(raw_eval["mean_latency_ms"]),
            dcrit_passed_count=int(raw_eval["dcrit_passed_count"]),
            dcrit_total_count=int(raw_eval.get("dcrit_total_count", len(dcrit_contents))),
        )
        zero_reg = cand.dcrit_passed_count == cand.dcrit_total_count
        dominated = is_pareto_dominated(cand, self.store.get_active_elite(bucket_id, cand.niche_id))
        if dry_run:
            dry_reason = "ZERO_REGRESSION_FAILED" if not zero_reg else ("PARETO_DOMINATED" if dominated else None)
            return None, dry_reason, None

        strat_rec = self.store.register_artifact(
            bucket_id,
            cand.strategy_uri,
            ArtifactKind.ESS_STRATEGY.value,
            cand.strategy_content,
        )
        rule_text = f"GEPA root cause distilled from {len(top_episodes)} PER traces: " + " | ".join(trace_lines[:3])
        reflection_id = self.store.record_gepa_reflection(
            bucket_id=bucket_id,
            source_episode_ids=[int(ep["episode_id"]) for ep in top_episodes],
            root_cause_rule=rule_text,
            challenger_record_id=strat_rec.record_id,
            pareto_dominated=dominated or (not zero_reg),
        )
        if not zero_reg:
            reason = f"ZERO_REGRESSION_FAILED ({cand.dcrit_passed_count}/{cand.dcrit_total_count} on D_crit)"
            return None, reason, reflection_id
        if dominated:
            return None, "PARETO_DOMINATED", reflection_id

        approval_mode = CalibrationMode.TIER0_FORMAL.value if tier0_present else CalibrationMode.AUTO_CALIBRATION.value
        self.store.upsert_map_elite(
            bucket_id=bucket_id,
            niche_id=cand.niche_id,
            strategy_record_id=strat_rec.record_id,
            mean_quality=cand.mean_quality,
            mean_cost_usd=cand.mean_cost_usd,
            mean_latency_ms=cand.mean_latency_ms,
            zero_reg_verified=True,
            approval_mode=approval_mode,
        )
        return cand.strategy_uri, None, reflection_id

    def run_cycle(
        self,
        *,
        bucket_id: str,
        top_k_per: int = 5,
        dry_run: bool = False,
        tier0_present: bool = False,
        challenger_evaluator: ChallengerEvalFn | None = None,
    ) -> dict[str, Any]:
        bucket = self.store.get_bucket(bucket_id)
        crc_outcomes: dict[str, CrcCalibrationOutcome] = {
            role.value: self.crc.calibrate_role(bucket_id, role, tier0_present=tier0_present, dry_run=dry_run)
            for role in ActionRole
        }

        top_episodes = self.store.list_top_per_episodes(bucket_id, limit=max(1, top_k_per), only_uncrystallized=True)
        per_memory = self._hydrate_per_memory(top_episodes)
        crystallized_uris, trace_lines = self._crystallize_episodes(bucket_id, top_episodes, dry_run=dry_run)

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

        dcrit_contents = [r.content for r in self.store.list_active_artifacts(bucket_id, ArtifactKind.TEST_CASE.value)]
        promoted_elite: str | None = None
        rejected_reason: str | None = None
        reflection_id: int | None = None
        if top_episodes and challenger_evaluator is not None:
            promoted_elite, rejected_reason, reflection_id = self._evaluate_gepa_challenger(
                bucket_id=bucket_id,
                default_niche=bucket.pareto_profile,
                top_episodes=top_episodes,
                dcrit_contents=dcrit_contents,
                trace_lines=trace_lines,
                challenger_evaluator=challenger_evaluator,
                tier0_present=tier0_present,
                dry_run=dry_run,
            )

        return {
            "bucket_id": bucket_id,
            "dry_run": dry_run,
            "per_hydrated_count": len(per_memory),
            "crc_calibration": {
                role: {
                    "sample_size_n": out.sample_size_n,
                    "is_cold_start": out.is_cold_start,
                    "calibration_mode": out.calibration_mode,
                    "lambda_unified": out.lambda_unified,
                    "relaxed_blocked_by_tier0_gate": out.relaxed_blocked_by_tier0_gate,
                }
                for role, out in crc_outcomes.items()
            },
            "space_basis": {
                "pos_anchors": projector.pos_anchor_count,
                "neg_anchors": projector.neg_anchor_count,
                "u_pos_rank": int(projector.u_pos.shape[1]),
                "u_neg_rank": int(projector.u_neg.shape[1]),
            },
            "crystallized_dcrit_uris": crystallized_uris,
            "dcrit_total_active": len(dcrit_contents) + len(crystallized_uris),
            "reflection_id": reflection_id,
            "promoted_elite": promoted_elite,
            "challenger_rejected_reason": rejected_reason,
        }
