"""Monotonic 1D Role-Stratified Conformal Risk Control (CRC) with Sec 8.3 sovereignty gate."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from control_plane.config import COLD_START_PRIORS, ActionRole, CalibrationMode, ControlPlaneConfig
from control_plane.storage import ControlPlaneStore, CrcCalibrationRecord, utc_now_iso


@dataclass(frozen=True, slots=True)
class CrcCalibrationOutcome:
    action_role: str
    sample_size_n: int
    is_cold_start: bool
    calibration_mode: str
    lambda_unified: float
    empirical_risk_at_lambda: float
    relaxed_blocked_by_tier0_gate: bool


class ConformalRiskController:
    """Computes distribution-free monotonic thresholds lambda in [0, 1] per action_role."""

    def __init__(self, store: ControlPlaneStore, config: ControlPlaneConfig) -> None:
        self.store = store
        self.config = config

    @staticmethod
    def _is_post_approval_failure(row: dict[str, object]) -> bool:
        reverted_raw = row.get("reverted")
        reverted = int(reverted_raw) == 1 if isinstance(reverted_raw, bool | int) else False
        edit_ratio_raw = row.get("human_edit_ratio")
        edit_ratio = float(edit_ratio_raw) if isinstance(edit_ratio_raw, int | float) else 0.0
        v_det_raw = row.get("v_det_passed")
        v_det = int(v_det_raw) == 1 if isinstance(v_det_raw, bool | int) else False
        return reverted or edit_ratio > 0.35 or not v_det

    def calibrate_role(
        self,
        bucket_id: str,
        action_role: ActionRole,
        *,
        tier0_present: bool = False,
        dry_run: bool = False,
    ) -> CrcCalibrationOutcome:
        current = self.store.get_crc_calibration(bucket_id, action_role.value)
        rows = self.store.list_replay_for_crc(bucket_id, action_role.value)
        n = len(rows)

        if n < self.config.crc_min_samples:
            return CrcCalibrationOutcome(
                action_role=action_role.value,
                sample_size_n=n,
                is_cold_start=True,
                calibration_mode=CalibrationMode.COLD_START.value,
                lambda_unified=current.lambda_unified,
                empirical_risk_at_lambda=0.0,
                relaxed_blocked_by_tier0_gate=False,
            )

        alpha = current.alpha_target
        drifts = np.array([float(r.get("drift_score") or 0.0) for r in rows], dtype=np.float64)
        failures = np.array([1.0 if self._is_post_approval_failure(r) else 0.0 for r in rows], dtype=np.float64)

        # Monotonic 1D grid: accept iff drift_score <= 1.0 - lam => higher lam = stricter gate = non-increasing loss
        grid = np.linspace(0.0, 1.0, 201)
        chosen_lam = 1.0
        chosen_risk = 0.0
        for lam in grid:
            accepted = drifts <= (1.0 - lam + 1e-12)
            losses = failures * accepted.astype(np.float64)
            r_hat = float(np.mean(losses))
            conformal_bound = (n / (n + 1.0)) * r_hat + (1.0 / (n + 1.0))
            if conformal_bound <= alpha + 1e-12:
                chosen_lam = round(float(lam), 4)
                chosen_risk = round(r_hat, 4)
                break

        # Sec 8.3 Sovereignty Gate: relaxing COMMIT_PROD or EXTERNAL_TOOL requires -Tier0Present
        blocked_relax = False
        mode = CalibrationMode.TIER0_FORMAL.value if tier0_present else CalibrationMode.AUTO_CALIBRATION.value
        prior_floor = COLD_START_PRIORS[action_role].lambda_unified
        effective_lam = chosen_lam
        if action_role in {ActionRole.COMMIT_PROD, ActionRole.EXTERNAL_TOOL} and not tier0_present:
            min_allowed = max(current.lambda_unified, prior_floor)
            if chosen_lam < min_allowed:
                effective_lam = min_allowed
                blocked_relax = True

        # Derive coupled spectral bounds monotonically from lambda_unified
        lambda_id_min = round(max(0.0, min(0.95, effective_lam * 0.90)), 4)
        lambda_viol_max = round(max(0.05, min(1.0, 1.0 - effective_lam)), 4)

        if not dry_run:
            updated = CrcCalibrationRecord(
                bucket_id=bucket_id,
                action_role=action_role.value,
                alpha_target=alpha,
                lambda_unified=effective_lam,
                lambda_id_min=lambda_id_min,
                lambda_viol_max=lambda_viol_max,
                conv_high_threshold=current.conv_high_threshold,
                conv_low_threshold=current.conv_low_threshold,
                sample_size_n=n,
                is_cold_start=False,
                calibration_mode=mode,
                calibrated_at=utc_now_iso(),
            )
            self.store.upsert_crc_calibration(updated)

        return CrcCalibrationOutcome(
            action_role=action_role.value,
            sample_size_n=n,
            is_cold_start=False,
            calibration_mode=mode,
            lambda_unified=effective_lam,
            empirical_risk_at_lambda=chosen_risk,
            relaxed_blocked_by_tier0_gate=blocked_relax,
        )
