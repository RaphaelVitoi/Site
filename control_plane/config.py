"""Configuration, enums, and cold-start priors for NEXUS-OMNIKERNEL v1.1-EVOLVED.

Preserves Site/CLAUDE.md Sec 0 (8 Governance Tiers) by using ComputeLane
(L0_DET..L3_MUTATOR) for computational routing inside the control plane.
"""

from __future__ import annotations

from enum import StrEnum
import os
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

SITE_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = SITE_ROOT / "temp" / "nexus_zone" / "runtime" / "omnikernel_control_plane.db"


class ComputeLane(StrEnum):
    """Orthogonal execution lane (does not redefine Governance Tiers 0..7)."""

    L0_DET = "L0_DET"
    L1_EDGE_ECON = "L1_EDGE_ECON"
    L2_FRONTIER = "L2_FRONTIER"
    L3_MUTATOR = "L3_MUTATOR"


class ActionRole(StrEnum):
    """Risk criticality stratification for Conformal Risk Control."""

    READ_ONLY = "READ_ONLY"
    LOCAL_PATCH = "LOCAL_PATCH"
    COMMIT_PROD = "COMMIT_PROD"
    EXTERNAL_TOOL = "EXTERNAL_TOOL"


class CascadeStage(StrEnum):
    """Short-circuit evaluation stages ordered by latency and compute cost."""

    S0_SYNTAX = "S0_SYNTAX"
    S05_Z3 = "S05_Z3"
    S1_UNIT = "S1_UNIT"
    S2_ADVERSARIAL = "S2_ADVERSARIAL"


class ThermostatDecision(StrEnum):
    """Deterministic control actions emitted by Pi_epsilon."""

    IDEMPOTENT_REPLAY = "IDEMPOTENT_REPLAY"
    COMMIT = "COMMIT"
    REGENERATE_CLEAN = "REGENERATE_CLEAN"
    INJECT_ASYMMETRY = "INJECT_ASYMMETRY"
    REJECT_DRIFT = "REJECT_DRIFT"
    CIRCUIT_BREAK = "CIRCUIT_BREAK"


class Modality(StrEnum):
    CODE = "code"
    STRUCTURED = "structured"
    PROSE = "prose"
    HYBRID = "hybrid"


class ParetoProfile(StrEnum):
    MAX_PRECISION = "max_precision"
    BALANCED_ROI = "balanced_roi"
    LOW_LATENCY = "low_latency"


class CalibrationMode(StrEnum):
    COLD_START = "cold_start"
    AUTO_CALIBRATION = "auto_calibration"
    TIER0_FORMAL = "tier0_formal"


class EquivMetricKind(StrEnum):
    SINGLE = "SINGLE"
    AST_TEST = "AST_TEST"
    LAYA_S1_NLI = "LAYA_S1_NLI"
    ONNX_NLI = "ONNX_NLI"


class ArtifactKind(StrEnum):
    CONTRACT = "contract"
    ANCHOR_POS = "anchor_pos"
    ANCHOR_NEG = "anchor_neg"
    ESS_STRATEGY = "ess_strategy"
    TEST_CASE = "test_case"
    ARTIFACT = "artifact"


class Z3Status(StrEnum):
    SAT = "SAT"
    UNSAT = "UNSAT"
    UNKNOWN = "UNKNOWN"
    SKIPPED = "SKIPPED"


class ColdStartPrior(BaseModel):
    """Conservative prior parameters for CRC when sample_size_n < 25."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    action_role: ActionRole
    alpha_target: float = Field(gt=0.0, lt=1.0)
    lambda_unified: float = Field(ge=0.0, le=1.0)
    lambda_id_min: float = Field(ge=0.0, le=1.0)
    lambda_viol_max: float = Field(ge=0.0, le=1.0)
    conv_high_threshold: float = Field(default=0.85, ge=0.0, le=1.0)
    conv_low_threshold: float = Field(default=0.55, ge=0.0, le=1.0)
    default_mutator: bool = False


COLD_START_PRIORS: dict[ActionRole, ColdStartPrior] = {
    ActionRole.READ_ONLY: ColdStartPrior(
        action_role=ActionRole.READ_ONLY,
        alpha_target=0.20,
        lambda_unified=0.40,
        lambda_id_min=0.35,
        lambda_viol_max=0.55,
        default_mutator=False,
    ),
    ActionRole.LOCAL_PATCH: ColdStartPrior(
        action_role=ActionRole.LOCAL_PATCH,
        alpha_target=0.08,
        lambda_unified=0.55,
        lambda_id_min=0.50,
        lambda_viol_max=0.40,
        default_mutator=False,
    ),
    ActionRole.COMMIT_PROD: ColdStartPrior(
        action_role=ActionRole.COMMIT_PROD,
        alpha_target=0.02,
        lambda_unified=0.68,
        lambda_id_min=0.62,
        lambda_viol_max=0.28,
        default_mutator=True,
    ),
    ActionRole.EXTERNAL_TOOL: ColdStartPrior(
        action_role=ActionRole.EXTERNAL_TOOL,
        alpha_target=0.01,
        lambda_unified=0.72,
        lambda_id_min=0.65,
        lambda_viol_max=0.25,
        default_mutator=True,
    ),
}


DEFAULT_ICM_BUCKETS: dict[str, dict[str, object]] = {
    "pmev-and-quant": {
        "modality": Modality.CODE.value,
        "pareto_profile": ParetoProfile.MAX_PRECISION.value,
        "max_retries": 3,
        "max_cost_usd": 0.50,
        "anti_goals": [
            "fabricated poker hand equity or unverified ICM payout approximation",
            "silent fallback that skips deterministic mathematical verification",
        ],
    },
    "engineering-and-quality": {
        "modality": Modality.CODE.value,
        "pareto_profile": ParetoProfile.BALANCED_ROI.value,
        "max_retries": 3,
        "max_cost_usd": 0.50,
        "anti_goals": [
            "bypass pre-commit gate with no-verify or silence warnings",
            "edit unrelated governance files outside Target Lock scope",
        ],
    },
    "runtime-and-credentials": {
        "modality": Modality.STRUCTURED.value,
        "pareto_profile": ParetoProfile.MAX_PRECISION.value,
        "max_retries": 3,
        "max_cost_usd": 0.35,
        "anti_goals": [
            "hardcoded plaintext API key or secret token committed to disk",
            "widen CORS allow-origins or disable ACL and hook validation",
        ],
    },
    "browser-and-ui-design": {
        "modality": Modality.HYBRID.value,
        "pareto_profile": ParetoProfile.BALANCED_ROI.value,
        "max_retries": 3,
        "max_cost_usd": 0.45,
        "anti_goals": [
            "blind React.memo sweep without measured render telemetry",
            "skip Core Web Vitals or accessibility verification",
        ],
    },
    "data-and-knowledge": {
        "modality": Modality.STRUCTURED.value,
        "pareto_profile": ParetoProfile.BALANCED_ROI.value,
        "max_retries": 3,
        "max_cost_usd": 0.40,
        "anti_goals": [
            "unparameterized raw SQL interpolation vulnerable to injection",
            "return fabricated database metrics without querying source",
        ],
    },
    "cloud-and-devin-ops": {
        "modality": Modality.HYBRID.value,
        "pareto_profile": ParetoProfile.BALANCED_ROI.value,
        "max_retries": 3,
        "max_cost_usd": 0.60,
        "anti_goals": [
            "autonomous git push or destructive cloud deployment without approval",
            "concurrent execution on shared repo branch or SQLite lock",
        ],
    },
    "governance-and-handoff": {
        "modality": Modality.PROSE.value,
        "pareto_profile": ParetoProfile.MAX_PRECISION.value,
        "max_retries": 2,
        "max_cost_usd": 0.35,
        "anti_goals": [
            "claim tests passed or files edited without tool verification",
            "create duplicate governance rule outside nucleo rules_ssot",
        ],
    },
}


class ControlPlaneConfig(BaseModel):
    """Runtime settings for the NEXUS-OMNIKERNEL control plane."""

    model_config = ConfigDict(extra="forbid")

    db_path: str = Field(
        default_factory=lambda: os.environ.get("OMNIKERNEL_DB_PATH", str(DEFAULT_DB_PATH)),
    )
    allow_external_path: bool = False
    onnx_threads: int = Field(default=6, ge=1, le=32)
    execution_provider: str = "CPUExecutionProvider"
    embedding_dim: int = Field(default=384, ge=64, le=1536)
    onnx_embedding_model_path: str | None = None
    z3_timeout_ms: int = Field(default=50, ge=5, le=5000)
    crc_min_samples: int = Field(default=25, ge=5, le=10000)
    space_min_pos_anchors: int = Field(default=4, ge=1, le=64)
    space_max_rank: int = Field(default=8, ge=1, le=32)
    gamma_step: float = Field(default=0.90, gt=0.0, le=1.0)
    enable_laya_s1: bool = False
